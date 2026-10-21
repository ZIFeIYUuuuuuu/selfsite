import { selectedWork } from "@/lib/site-content";
import { projectAnchor } from "@/lib/featured-projects";

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
            <article className="project-row" id={projectAnchor(item.title)} key={item.title}>
              <div className="project-meta">
                <p className="work-tag">{item.tag}</p>
                <p className="project-year">{item.year}</p>
              </div>

              <div className="project-body">
                <h2>{item.title}</h2>
                <section className="project-context" aria-label={`${item.title} 项目说明`}>
                  <div>
                    <p className="project-field-label">解决什么</p>
                    <p className="project-summary">{item.summary}</p>
                  </div>
                  <div>
                    <p className="project-field-label">我做了什么</p>
                    <details className="project-detail-disclosure">
                      <summary>展开实现细节</summary>
                      <p>{item.detail}</p>
                    </details>
                  </div>
                </section>

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
                  <section className="project-evidence">
                    <p className="project-field-label">证据与边界</p>
                    <ul className="capsule-list">
                      {item.highlights.slice(0, 1).map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                    {item.highlights.length > 1 ? (
                      <details className="project-detail-disclosure project-evidence-disclosure">
                        <summary>展开其余证据</summary>
                        <ul className="capsule-list">
                          {item.highlights.slice(1).map((highlight) => (
                            <li key={highlight}>{highlight}</li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </section>
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
