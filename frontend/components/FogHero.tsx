"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { selectedWork, siteProfile } from "@/lib/site-content";
import styles from "./FogHero.module.css";

// Show top 6 projects in the hero list
const HERO_PROJECTS = selectedWork.slice(0, 6);

// ── Vertex shader (shared) ────────────────────────────────────────────────────
const VERT_SRC = `#version 300 es
precision highp float;
in vec2 a_pos;
out vec2 v_uv;
void main() {
  // v_uv: (0,0) = bottom-left, (1,1) = top-right  (WebGL convention)
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// ── Simulation shader ─────────────────────────────────────────────────────────
// Texture stores: r = reveal (0=fog-covered, 1=clear)
// Y-axis: WebGL UV — 0 at bottom. JS mouse coords are flipped before upload.
//
// Each frame:
//   1. Decay reveal toward 0 (fog refills)
//   2. Diffuse slightly (soften edges)
//   3. If mouse moving: stamp reveal along the segment from prev to curr
//
// No positional circle brush. No fog = mix(fog, 0, ...).
// Reveal only increases via mouse movement; decreases via decay only.
const SIM_FRAG_SRC = `#version 300 es
precision highp float;

uniform sampler2D u_prev;
// Mouse positions in WebGL UV space (Y already flipped in JS)
// (-2,-2) = inactive
uniform vec2  u_mouse_curr;
uniform vec2  u_mouse_prev;
uniform float u_move_strength; // 0 when idle/outside, 1 when moving
uniform float u_decay_rate;    // reveal decay per second
uniform float u_dt;            // real delta-time in seconds (capped 0.008..0.05)
uniform float u_time;
uniform vec2  u_res;

in vec2 v_uv;
out vec4 out_color;

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}
float fbm(vec2 p) {
  float v = 0.0, w = 0.5;
  for (int i = 0; i < 3; i++) {
    v += w * (hash(p) * 2.0 - 1.0);
    p *= 2.17; w *= 0.5;
  }
  return v;
}

// Signed distance from point p to line segment (a, b)
float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  return length(p - a - ab * t);
}

void main() {
  float reveal = texture(u_prev, v_uv).r;

  // 1. Decay — fog refills over time
  reveal -= u_decay_rate * u_dt * reveal;

  // 2. Diffuse (gentle blur to soften trail edges)
  vec2 t = 1.0 / u_res;
  float nb = (
    texture(u_prev, v_uv + vec2(0, t.y)).r +
    texture(u_prev, v_uv - vec2(0, t.y)).r +
    texture(u_prev, v_uv + vec2(t.x, 0)).r +
    texture(u_prev, v_uv - vec2(t.x, 0)).r
  ) * 0.25;
  reveal = mix(reveal, nb, 0.012);

  // 3. Reveal stamp along movement segment
  if (u_move_strength > 0.001 && u_mouse_curr.x >= 0.0) {
    // Convert UV to aspect-corrected space for distance calculation
    vec2 aspect = vec2(u_res.x / u_res.y, 1.0);
    vec2 p  = v_uv * aspect;
    vec2 mc = u_mouse_curr * aspect;
    vec2 mp = u_mouse_prev * aspect;

    float dist = sdSegment(p, mp, mc);

    // Brush radius: base + speed bonus (speed = segment length)
    float seg_len = length(mc - mp);
    float radius  = 0.045 + seg_len * 0.9;

    // Noise on edge for organic shape
    float noise = fbm(v_uv * 8.0 + vec2(u_time * 0.11)) * 0.018;
    dist += noise;

    // Smooth stamp — power curve so centre fills fast, edge tapers
    float w = clamp(1.0 - dist / radius, 0.0, 1.0);
    float stamp = pow(w, 1.5) * u_move_strength;

    reveal = max(reveal, stamp);
  }

  reveal = clamp(reveal, 0.0, 1.0);
  out_color = vec4(reveal, 0.0, 0.0, 1.0);
}`;

// ── Display shader ────────────────────────────────────────────────────────────
// reveal=0 → fog alpha high; reveal=1 → fog alpha 0 (clear)
const DISP_FRAG_SRC = `#version 300 es
precision highp float;

uniform sampler2D u_sim;
uniform float u_alpha_scale; // scroll fade [0,1]

in vec2 v_uv;
out vec4 out_color;

void main() {
  // Display UV has Y=0 at top; FBO UV has Y=0 at bottom — flip to match
  float reveal = texture(u_sim, vec2(v_uv.x, 1.0 - v_uv.y)).r;
  float fog_alpha = smoothstep(0.05, 0.88, 1.0 - reveal) * 0.80 * u_alpha_scale;
  out_color = vec4(0.963, 0.963, 0.963, fog_alpha);
}`;

// ── GL helpers ────────────────────────────────────────────────────────────────

type GL = WebGL2RenderingContext;

function compileShader(gl: GL, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error("Shader compile: " + gl.getShaderInfoLog(s));
  return s;
}

function makeProgram(gl: GL, vert: string, frag: string): WebGLProgram {
  const p = gl.createProgram()!;
  gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    throw new Error("Program link: " + gl.getProgramInfoLog(p));
  return p;
}

function makeFBO(gl: GL, w: number, h: number) {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, w, h, 0, gl.RED, gl.HALF_FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fb = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  // FBO completeness check
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  if (status !== gl.FRAMEBUFFER_COMPLETE)
    throw new Error("FBO incomplete: 0x" + status.toString(16));
  return { tex, fb };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FogHero() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const projectsRef  = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number>(0);
  const stateRef     = useRef({
    // Mouse in WebGL UV space (Y flipped): -1 = outside
    mx: -1, my: -1,
    px: -1, py: -1,
    // Idle tracking
    lastMoveTime: 0,
    // Scroll fade
    fogAlpha: 1.0,
    targetAlpha: 1.0,
    // Frame timing
    lastFrameTime: 0,
    time: 0,
  });

  useEffect(() => {
    const canvas  = canvasRef.current;
    const stage   = projectsRef.current;
    if (!canvas || !stage) return;

    // ── WebGL2 init ──────────────────────────────────────────────────────────
    const glRaw = canvas.getContext("webgl2", { premultipliedAlpha: false, alpha: true });
    if (!glRaw || !glRaw.getExtension("EXT_color_buffer_float")) {
      canvas.dataset.noWebgl = "1";
      return;
    }
    const gl: GL = glRaw;
    const cvs = canvas;  // non-null capture for closures
    const stg = stage;   // non-null capture for closures

    let simProg: WebGLProgram, dispProg: WebGLProgram;
    try {
      simProg  = makeProgram(gl, VERT_SRC, SIM_FRAG_SRC);
      dispProg = makeProgram(gl, VERT_SRC, DISP_FRAG_SRC);
    } catch (e) {
      console.warn("FogHero WebGL:", e);
      canvas.dataset.noWebgl = "1";
      return;
    }

    // Full-screen quad
    const quadBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    function bindQuad(prog: WebGLProgram) {
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      const loc = gl.getAttribLocation(prog, "a_pos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }

    // FBO ping-pong
    let W = 0, H = 0;
    let ping: ReturnType<typeof makeFBO>, pong: ReturnType<typeof makeFBO>;

    function initFBOs(w: number, h: number) {
      try {
        if (ping) { gl.deleteTexture(ping.tex); gl.deleteFramebuffer(ping.fb); }
        if (pong) { gl.deleteTexture(pong.tex); gl.deleteFramebuffer(pong.fb); }
        ping = makeFBO(gl, w, h);
        pong = makeFBO(gl, w, h);
      } catch (e) {
        console.warn("FogHero FBO:", e);
        cvs.dataset.noWebgl = "1";
        return;
      }
      W = w; H = h;
      // Clear to reveal=0 (full fog)
      for (const f of [ping.fb, pong.fb]) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, f);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    function resize() {
      const dpr  = Math.min(window.devicePixelRatio || 1, 2);
      const rect = stg.getBoundingClientRect();
      // Sim at half res for perf
      const sw = Math.max(1, Math.round(rect.width  * dpr * 0.5));
      const sh = Math.max(1, Math.round(rect.height * dpr * 0.5));
      cvs.width  = Math.round(rect.width  * dpr);
      cvs.height = Math.round(rect.height * dpr);
      cvs.style.width  = rect.width  + "px";
      cvs.style.height = rect.height + "px";
      initFBOs(sw, sh);
    }

    // ── Scroll handler ───────────────────────────────────────────────────────
    function onScroll() {
      // Use document-relative offsetTop, not getBoundingClientRect, to avoid jitter
      let el: HTMLElement | null = stg;
      let top = 0;
      while (el) { top += el.offsetTop; el = el.offsetParent as HTMLElement | null; }
      const h = stg.offsetHeight;
      const scrollY = window.scrollY;
      const fadeStart = top + h * 0.55;
      const fadeEnd   = top + h * 1.05;
      const t = Math.max(0, Math.min(1, (scrollY - fadeStart) / (fadeEnd - fadeStart)));
      stateRef.current.targetAlpha = 1 - t;
    }

    // ── Mouse handlers ────────────────────────────────────────────────────────
    // Hero element is the parent section; we listen there for mousemove
    const heroEl = stg.closest("[data-fog-hero]") as HTMLElement | null ?? stg;

    function onMouseMove(e: MouseEvent) {
      const rect = stg.getBoundingClientRect();
      const s = stateRef.current;
      s.px = s.mx;
      s.py = s.my;
      // Flip Y: WebGL UV Y=0 is bottom, browser Y=0 is top
      s.mx = (e.clientX - rect.left) / rect.width;
      s.my = 1.0 - (e.clientY - rect.top) / rect.height;
      s.lastMoveTime = performance.now();
    }

    function onMouseLeave() {
      // Don't clear mx/my immediately — let decay handle the fade-out
      // Just stop registering new positions
      stateRef.current.lastMoveTime = performance.now() - 2100; // force idle instantly
    }

    // ── Render loop ───────────────────────────────────────────────────────────
    function render(now: number) {
      rafRef.current = requestAnimationFrame(render);
      if (W === 0 || cvs.dataset.noWebgl) return;

      const s = stateRef.current;

      // Real deltaTime, capped to avoid huge jumps after tab switch
      const dt = Math.min(Math.max((now - (s.lastFrameTime || now)) / 1000, 0.008), 0.05);
      s.lastFrameTime = now;
      s.time += dt;

      // Smooth scroll alpha
      s.fogAlpha += (s.targetAlpha - s.fogAlpha) * Math.min(1, dt * 5);

      // Determine movement state
      const idleMs      = now - s.lastMoveTime;
      const isMoving    = s.mx >= 0 && idleMs < 80; // actively moving if < 80ms since last event
      const isIdle      = s.mx >= 0 && idleMs >= 80; // in hero but stopped
      const isOutside   = s.mx < 0;

      // move_strength: 1 while moving, 0 otherwise
      const moveStrength = isMoving ? 1.0 : 0.0;

      // decay_rate: slow during active movement (trail persists longer),
      // fast when idle (2-3s) or outside (1.5s)
      let decayRate = 0.0;
      if (isMoving) {
        decayRate = 0.05;    // very slow — trail stays while moving
      } else if (isIdle) {
        const idleSec = (idleMs - 80) / 1000;
        // ramp from slow to fast decay over 1s after stopping
        decayRate = Math.min(0.08 + idleSec * 0.25, 0.35);
      } else if (isOutside) {
        decayRate = 0.30;    // fast refill when mouse left hero
      }

      // ── Simulation pass ──────────────────────────────────────────────────
      gl.viewport(0, 0, W, H);
      gl.bindFramebuffer(gl.FRAMEBUFFER, pong.fb);
      gl.useProgram(simProg);
      bindQuad(simProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, ping.tex);

      const sl = (n: string) => gl.getUniformLocation(simProg, n);
      gl.uniform1i(sl("u_prev"),          0);
      gl.uniform2f(sl("u_mouse_curr"),    s.mx >= 0 ? s.mx : -2, s.my >= 0 ? s.my : -2);
      gl.uniform2f(sl("u_mouse_prev"),    s.px >= 0 ? s.px : s.mx, s.py >= 0 ? s.py : s.my);
      gl.uniform1f(sl("u_move_strength"), moveStrength);
      gl.uniform1f(sl("u_decay_rate"),    decayRate);
      gl.uniform1f(sl("u_dt"),            dt);
      gl.uniform1f(sl("u_time"),          s.time);
      gl.uniform2f(sl("u_res"),           W, H);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // swap
      [ping, pong] = [pong, ping];

      // ── Display pass ─────────────────────────────────────────────────────
      gl.viewport(0, 0, cvs.width, cvs.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(dispProg);
      bindQuad(dispProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, ping.tex);

      const dl = (n: string) => gl.getUniformLocation(dispProg, n);
      gl.uniform1i(dl("u_sim"),          0);
      gl.uniform1f(dl("u_alpha_scale"),  s.fogAlpha);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disable(gl.BLEND);

      // Carry prev position forward
      s.px = s.mx;
      s.py = s.my;
    }

    // ── Visibility pause ─────────────────────────────────────────────────────
    function onVisibilityChange() {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        stateRef.current.lastFrameTime = 0; // reset dt on resume
        rafRef.current = requestAnimationFrame(render);
      }
    }

    // ── Bootstrap ─────────────────────────────────────────────────────────────
    resize();
    onScroll();

    const ro = new ResizeObserver(resize);
    ro.observe(stg);
    heroEl.addEventListener("mousemove", onMouseMove);
    heroEl.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      heroEl.removeEventListener("mousemove", onMouseMove);
      heroEl.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      gl.deleteProgram(simProg);
      gl.deleteProgram(dispProg);
      gl.deleteBuffer(quadBuf);
      if (ping) { gl.deleteTexture(ping.tex); gl.deleteFramebuffer(ping.fb); }
      if (pong) { gl.deleteTexture(pong.tex); gl.deleteFramebuffer(pong.fb); }
    };
  }, []);

  return (
    <section className={styles.fogHero} data-fog-hero>
      {/* Identity block — normal flow, never absolute */}
      <div className={styles.fogIdentity}>
        <p className={styles.fogRole}>{siteProfile.role}</p>
        <h1 className={styles.fogName}>{siteProfile.handle}</h1>
        <p className={styles.fogIntro}>{siteProfile.intro}</p>
      </div>

      <div className={styles.fogDivider} aria-hidden="true" />

      {/* Project area — canvas covers this div only */}
      <div ref={projectsRef} className={styles.fogProjects}>
        <ul className={styles.fogProjectList} aria-label="代表项目">
          {HERO_PROJECTS.map((project, i) => (
            <li key={project.title}>
              <Link className={styles.fogProjectRow} href="/work">
                <span className={styles.fogProjectIndex}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={styles.fogProjectTitle}>{project.title}</span>
                <span className={styles.fogProjectStack}>
                  {project.stack?.slice(0, 2).join(" · ") ?? project.tag}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* WebGL fog canvas — absolute inside .fogProjects */}
        <canvas
          ref={canvasRef}
          className={styles.fogCanvas}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
