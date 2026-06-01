import BentoGrid from "@/components/BentoGrid";

export default function HomePage() {
  return (
    <div className="home-page-shell">
      <section className="home-intro-bar">
        <p className="home-intro-text">欢迎访问我的个人博客</p>
      </section>

      <section className="home-main-stack">
        <BentoGrid />
      </section>
    </div>
  );
}
