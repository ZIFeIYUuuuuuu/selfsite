import BentoGrid from "@/components/BentoGrid";
import SimpleAudioPlayer from "@/components/SimpleAudioPlayer";
import { getAudioAutoplay, getAudioTitle, getExplicitAudioSource } from "@/lib/env";

export default function HomePage() {
  const explicitAudioSource = getExplicitAudioSource();

  return (
    <div className="home-page-shell">
      <section className="home-intro-bar">
        <p className="home-intro-text">欢迎访问我的个人博客</p>
      </section>

      <section className="home-main-stack">
        <BentoGrid />
      </section>

      <section className="home-bottom-section" aria-label="音乐播放器">
        <SimpleAudioPlayer
          autoplay={getAudioAutoplay()}
          initialSrc={explicitAudioSource}
          initialTitle={getAudioTitle()}
        />
      </section>
    </div>
  );
}
