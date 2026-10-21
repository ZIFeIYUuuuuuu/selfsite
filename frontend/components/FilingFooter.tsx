import Image from "next/image";
import styles from "./FilingFooter.module.css";

export default function FilingFooter() {
  return (
    <footer className={styles.footer} aria-label="网站备案信息">
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
        苏ICP备2026023613号-1
      </a>
      <span className={styles.separator} aria-hidden="true">·</span>
      <a href="https://beian.mps.gov.cn/#/query/webSearch?code=32072402010253" target="_blank" rel="noopener noreferrer">
        <Image src="/filing/public-security.png" alt="" width={18} height={20} unoptimized />
        <span>苏公网安备32072402010253号</span>
      </a>
    </footer>
  );
}
