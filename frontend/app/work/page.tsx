import { selectedWork } from "@/lib/site-content";

export default function WorkPage() {
  return (
    <>
      <section className="page-intro">
        <p className="eyebrow">Work</p>
        <h1>作品</h1>
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

                {item.github ? (
                  <div className="contact-actions">
                    <a
                      className="button button-solid"
                      href={item.github}
                      rel="noreferrer"
                      target="_blank"
                    >
                      GitHub 查看源码
                    </a>
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
