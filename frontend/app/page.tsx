import BentoGrid from "@/components/BentoGrid";
import DeferredAudioPlayer from "@/components/DeferredAudioPlayer";

export default function HomePage() {
  return (
    <div className="home-page-shell">
      <section className="home-intro-bar">
        <p className="home-intro-text">
          从代表项目开始，继续阅读工程笔记，了解我如何把 AI Agent 和自动化工具做成可运行的系统。
        </p>
      </section>

      <section className="home-main-stack">
        <BentoGrid />
      </section>

      <DeferredAudioPlayer />
    </div>
  );
}
