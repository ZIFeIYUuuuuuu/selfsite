type Point = { x: number; y: number };
type Stroke = { from: Point; to: Point; velocity: Point };
type Color = [number, number, number];
type Field = { texture: WebGLTexture; framebuffer: WebGLFramebuffer; width: number; height: number };

const splatVariance = .00256;

const vertexSource = `#version 300 es
layout(location=0) in vec2 position;
out vec2 uv;
void main(){ uv=position*.5+.5; gl_Position=vec4(position,0.,1.); }`;

const noiseSource = `
float randomValue(vec2 p){
  p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y);
}
float valueNoise(vec2 p){
  vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(randomValue(i),randomValue(i+vec2(1,0)),f.x),
    mix(randomValue(i+vec2(0,1)),randomValue(i+vec2(1)),f.x),f.y);
}
float turbulence(vec2 p){
  return .55*valueNoise(p)+.3*valueNoise(p*2.6)+.15*valueNoise(p*6.3);
}`;

const splatSource = `#version 300 es
precision highp float;
in vec2 uv; out vec4 result;
uniform sampler2D field;
uniform vec2 point,velocity;
uniform float aspect;
void main(){
  vec2 offset=uv-point; offset.x*=aspect;
  float weight=exp(-dot(offset,offset)/${splatVariance});
  vec4 previous=texture(field,uv);
  result=vec4(previous.r+weight*3.5,mix(previous.gb,velocity,clamp(weight*3.5,0.,1.)),1.);
}`;

const evolutionSource = `#version 300 es
precision highp float;
in vec2 uv; out vec4 result;
uniform sampler2D field;
uniform vec2 texel;
uniform float delta,time;
${noiseSource}
void main(){
  vec2 velocity=texture(field,uv).gb;
  vec2 back=uv-velocity*delta;
  vec4 previous=texture(field,back);
  float phase=time*.3;
  vec2 drift=(vec2(turbulence(uv*11.+phase),turbulence(uv*11.+37.2-phase))-.5)*5.2*texel;
  vec4 left=texture(field,back+vec2(-texel.x,0)+drift);
  vec4 right=texture(field,back+vec2(texel.x,0)+drift);
  vec4 above=texture(field,back+vec2(0,texel.y)+drift);
  vec4 below=texture(field,back-vec2(0,texel.y)+drift);
  vec3 neighbours=(left.rgb+right.rgb+above.rgb+below.rgb)*.25;
  float density=mix(previous.r,neighbours.r,.79);
  vec2 flow=mix(previous.gb,neighbours.gb,.395);
  float variation=turbulence(uv*15.+5.1+phase*.6);
  density/=1.+(1.5+1.05*(variation-.5)*2.)*delta;
  flow/=1.+3.*delta;
  result=vec4(max(0.,density),flow,1.);
}`;

const displaySource = `#version 300 es
precision highp float;
in vec2 uv; out vec4 result;
uniform sampler2D field;
uniform vec3 cover;
uniform float time;
${noiseSource}
void main(){
  float density=texture(field,uv).r;
  float edgeFade=.18*(.35+1.3*turbulence(vec2(uv.x*9.,time*.25)));
  density*=smoothstep(0.,edgeFade,uv.y);
  result=vec4(cover,1.-smoothstep(.39,.4,density));
}`;

function program(gl: WebGL2RenderingContext, fragment: string) {
  const shaders = [
    [gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragment],
  ].map(([kind, source]) => {
    const shader = gl.createShader(kind as number)!;
    gl.shaderSource(shader, source as string);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Fluid shader failed");
    return shader;
  });
  const handle = gl.createProgram()!;
  shaders.forEach(shader => gl.attachShader(handle, shader));
  gl.linkProgram(handle);
  shaders.forEach(shader => gl.deleteShader(shader));
  if (!gl.getProgramParameter(handle, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(handle) || "Fluid program failed");
  return { handle, uniform: (name: string) => gl.getUniformLocation(handle, name) };
}

export function createFluidReveal(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, antialias: false });
  if (!gl || !gl.getExtension("EXT_color_buffer_float")) return null;
  const filter = gl.getExtension("OES_texture_float_linear") ? gl.LINEAR : gl.NEAREST;
  const splat = program(gl, splatSource);
  const evolution = program(gl, evolutionSource);
  const display = program(gl, displaySource);
  const vao = gl.createVertexArray()!;
  const buffer = gl.createBuffer()!;
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.disable(gl.BLEND);
  let front: Field | null = null;
  let back: Field | null = null;
  let aspect = 1;
  let lastTime = 0;
  let color: Color = [1, 1, 1];
  const strokes: Stroke[] = [];

  const release = (target: Field | null) => {
    if (!target) return;
    gl.deleteTexture(target.texture);
    gl.deleteFramebuffer(target.framebuffer);
  };
  const allocate = (width: number, height: number): Field => {
    const texture = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const framebuffer = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("Fluid framebuffer unavailable");
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { texture, framebuffer, width, height };
  };
  const bindInput = () => {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, front!.texture);
  };
  const step = () => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, back!.framebuffer);
    gl.viewport(0, 0, back!.width, back!.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    [front, back] = [back, front];
  };
  const paint = (now: number) => {
    if (!front) return;
    gl.useProgram(display.handle);
    bindInput();
    gl.uniform1i(display.uniform("field"), 0);
    gl.uniform3f(display.uniform("cover"), ...color);
    gl.uniform1f(display.uniform("time"), now * .001);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  return {
    color(next: Color) { color = next; paint(performance.now()); },
    resize(width: number, height: number) {
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));
      aspect = width / Math.max(1, height);
      const fieldWidth = Math.round(aspect >= 1 ? Math.min(1440, 512 * aspect) : 512);
      const fieldHeight = Math.round(aspect >= 1 ? 512 : Math.min(1440, 512 / aspect));
      release(front); release(back);
      front = allocate(fieldWidth, fieldHeight);
      back = allocate(fieldWidth, fieldHeight);
      strokes.length = 0;
      lastTime = 0;
      paint(performance.now());
    },
    stroke(stroke: Stroke) { strokes.push(stroke); if (strokes.length > 80) strokes.shift(); },
    draw(now: number) {
      if (!front || !back) return;
      gl.bindVertexArray(vao);
      gl.disable(gl.BLEND);
      const delta = Math.min(.033, Math.max(.001, lastTime ? (now - lastTime) / 1000 : .016));
      lastTime = now;
      for (const stroke of strokes.splice(0)) {
        const length = Math.hypot((stroke.to.x - stroke.from.x) * aspect, stroke.to.y - stroke.from.y);
        const count = Math.min(80, Math.max(1, Math.ceil(length / (.4 * Math.sqrt(splatVariance)))));
        for (let index = 0; index < count; index++) {
          const progress = count === 1 ? 1 : index / (count - 1);
          gl.useProgram(splat.handle);
          bindInput();
          gl.uniform1i(splat.uniform("field"), 0);
          gl.uniform1f(splat.uniform("aspect"), aspect);
          gl.uniform2f(splat.uniform("point"), stroke.from.x + (stroke.to.x-stroke.from.x)*progress, stroke.from.y + (stroke.to.y-stroke.from.y)*progress);
          gl.uniform2f(splat.uniform("velocity"), Math.max(-4, Math.min(4, stroke.velocity.x))*1.6, Math.max(-4, Math.min(4, stroke.velocity.y))*1.6);
          step();
        }
      }
      gl.useProgram(evolution.handle);
      bindInput();
      gl.uniform1i(evolution.uniform("field"), 0);
      gl.uniform2f(evolution.uniform("texel"), 1/front.width, 1/front.height);
      gl.uniform1f(evolution.uniform("delta"), delta);
      gl.uniform1f(evolution.uniform("time"), now*.001);
      step();
      paint(now);
    },
    clear() {
      strokes.length = 0;
      for (const target of [front, back]) if (target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      lastTime = 0;
      paint(performance.now());
    },
    destroy() {
      release(front); release(back);
      [splat, evolution, display].forEach(item => gl.deleteProgram(item.handle));
      gl.deleteVertexArray(vao); gl.deleteBuffer(buffer);
    },
  };
}
