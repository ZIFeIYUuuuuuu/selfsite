import { capabilities, principles, siteProfile, workflow } from "@/lib/site-content";

export default function AboutPage() {
  return (
    <>
      <section className="page-intro">
        <p className="eyebrow">About</p>
        <h1>{siteProfile.handle}</h1>
        <p className="page-lede">
          一个持续更新的个人博客和项目入口，主要记录 AI Agent、自动化工具、前后端应用和工程实践。
        </p>
      </section>

      <section className="page-block page-grid">
        <div className="text-column">
          <p className="section-label">Profile</p>
          <h2>{siteProfile.intro}</h2>
          <p>{siteProfile.about}</p>
          <p>{siteProfile.philosophy}</p>
        </div>
        <div>
          <ul className="capsule-list">
            {capabilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="page-block">
        <div className="section-heading">
          <p className="section-label">Workflow</p>
          <h2>我更习惯按理解问题、搭好结构、稳定交付的顺序推进事情。</h2>
        </div>
        <div className="stack-list">
          {workflow.map((item) => (
            <article className="stack-row" key={item.step}>
              <p className="timeline-step">{item.step}</p>
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-block">
        <div className="section-heading">
          <p className="section-label">Principles</p>
          <h2>希望留下来的，不只是页面本身，还有一套足够清楚的做事方式。</h2>
        </div>
        <div className="stack-list">
          {principles.map((item, index) => (
            <article className="stack-row" key={item.title}>
              <p className="timeline-step">{`0${index + 1}`}</p>
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-block">
        <div className="section-heading">
          <p className="section-label">Links</p>
          <h2>目前先把最基础的联系方式放在这里，后面再按需要补更多入口。</h2>
        </div>
        <div className="contact-actions">
          <a className="button button-solid" href={siteProfile.github} rel="noreferrer" target="_blank">
            GitHub
          </a>
        </div>
      </section>
    </>
  );
}
