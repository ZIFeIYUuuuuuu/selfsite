import { selectedWork } from "@/lib/site-content";

export default function WorkPage() {
  return (
    <>
      <section className="page-intro">
        <p className="eyebrow">Work</p>
        <h1>作品</h1>
        <p className="page-lede">同步自 GitHub 公开仓库列表，按最近更新时间整理。</p>
      </section>

      <section className="page-block">
        <div className="project-list">
          {selectedWork.map((item) => (
            <article className="project-row" key={item.title}>
              <div className="project-meta">
                <p className="work-tag">{item.tag}</p>
                <p className="project-year">{item.year}</p>
              </div>

              <div className="project-body">
                <h2>{item.title}</h2>
                <p className="project-summary">{item.summary}</p>
                <p>{item.detail}</p>

                {item.updatedAt ? (
                  <p>
                    <strong>最近更新：</strong>
                    {item.updatedAt}
                  </p>
                ) : null}

                {item.stack?.length ? (
                  <p>
                    <strong>技术栈：</strong>
                    {item.stack.join(" / ")}
                  </p>
                ) : null}

                {item.highlights?.length ? (
                  <ul className="capsule-list">
                    {item.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                ) : null}

                {item.github || item.homepage ? (
                  <div className="contact-actions">
                    {item.github ? (
                      <a
                        className="button button-solid"
                        href={item.github}
                        rel="noreferrer"
                        target="_blank"
                      >
                        GitHub 查看源码
                      </a>
                    ) : null}
                    {item.homepage ? (
                      <a
                        className="button button-ghost"
                        href={item.homepage}
                        rel="noreferrer"
                        target="_blank"
                      >
                        打开项目页面
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
