"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Inbox,
  Link2,
  Mail,
  MessageCircleMore,
  QrCode,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";

import AboutMeReveal from "@/components/AboutMeReveal";
import { githubRepositories, notes, selectedWork, siteProfile } from "@/lib/site-content";

import styles from "./BentoGrid.module.css";

const mail163ComposeUrl = "https://mail.163.com/";

const contactItems = [
  {
    label: "GitHub",
    href: siteProfile.github,
    icon: Link2,
    external: true
  },
  {
    label: "邮箱",
    href: mail163ComposeUrl,
    icon: Mail,
    external: true
  },
  {
    label: "QQ",
    href: "#",
    icon: MessageCircleMore,
    external: false,
    qrSrc: "/contact/qq-red.png",
    qrAlt: "QQ 二维码",
    qrFallback: "请把红色风格的 QQ 二维码放到 frontend/public/contact/qq-red.png",
    qrTone: "qq"
  },
  {
    label: "微信",
    href: "#",
    icon: QrCode,
    external: false,
    qrSrc: "/contact/wechat-green.png",
    qrAlt: "微信二维码",
    qrFallback: "请把绿色风格的微信二维码放到 frontend/public/contact/wechat-green.png",
    qrTone: "wechat"
  }
] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

export default function BentoGrid() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ kind: "idle" | "success" | "error"; text: string }>({
    kind: "idle",
    text: ""
  });

  const featuredWork = selectedWork[0];
  const latestNotes = notes.slice(0, 3);
  const featuredRepos = githubRepositories.slice(0, 3);

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      setMessage({ kind: "error", text: "请输入有效邮箱。" });
      return;
    }

    setMessage({ kind: "success", text: "已订阅。" });
    setEmail("");

    const { default: confetti } = await import("canvas-confetti");

    void confetti({
      particleCount: 84,
      spread: 58,
      origin: { y: 0.76 },
      scalar: 0.86
    });
  };

  return (
    <section className={styles.shell}>
      <motion.div
        animate="visible"
        className={styles.grid}
        initial="hidden"
        variants={containerVariants}
      >
        <motion.article className={`${styles.card} ${styles.heroCard}`} variants={cardVariants}>
          <div className={styles.heroHeader}>
            <span className={styles.heroTag}>GitHub profile</span>
            <span className={styles.heroIndex}>01</span>
          </div>

          <div className={styles.heroBody}>
            <div className={styles.profileLockup}>
              <Image
                alt={`${siteProfile.handle} GitHub avatar`}
                className={styles.avatar}
                height={88}
                src={siteProfile.githubAvatar}
                unoptimized
                width={88}
              />
              <div>
                <p className={styles.profileKicker}>{siteProfile.role}</p>
                <h1 className={`${styles.title} ${styles.compactTitle}`}>{siteProfile.handle}</h1>
              </div>
            </div>

            <p className={styles.heroStatement}>{siteProfile.intro}</p>

            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href={siteProfile.github} rel="noreferrer" target="_blank">
                <Link2 size={17} />
                访问 GitHub
              </Link>
              <Link className={styles.secondaryAction} href="/work">
                查看作品
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className={styles.repoExhibit}>
              {featuredRepos.map((repo) => (
                <Link
                  className={styles.repoPanel}
                  href={repo.href}
                  key={repo.name}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span>
                    <strong>{repo.name}</strong>
                    <small>{repo.language}</small>
                  </span>
                  <p>{repo.description}</p>
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
          </div>
        </motion.article>

        <motion.article className={`${styles.card} ${styles.projectCard}`} variants={cardVariants}>
          <div className={styles.projectBody}>
            <div>
              <p className={styles.eyebrow}>Featured work</p>
              <span className={styles.tag}>{featuredWork.tag}</span>
              <h2 className={styles.projectTitle}>{featuredWork.title}</h2>
              <p className={styles.cardCopy}>{featuredWork.summary}</p>
              <p className={styles.projectDetail}>{featuredWork.detail}</p>
            </div>

            <div className={styles.projectFooter}>
              <span>{featuredWork.year}</span>
              <Link className={styles.inlineAction} href="/work">
                进入作品页
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </motion.article>

        <motion.article className={`${styles.card} ${styles.techCard}`} variants={cardVariants}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.eyebrow}>About me</p>
              <h3 className={styles.cardTitle}>关于我</h3>
            </div>
            <span className={styles.iconFrame}>
              <Sparkles size={18} />
            </span>
          </div>

          <AboutMeReveal variant="card" />
        </motion.article>

        <motion.article className={`${styles.card} ${styles.statusCard}`} variants={cardVariants}>
          <div>
            <p className={styles.eyebrow}>Status</p>
            <div className={styles.statusLine}>
              <span className={styles.statusDot} />
              GitHub 持续更新
            </div>
          </div>

          <div className={styles.statusMeta}>
            <div>
              <strong>公开仓库</strong>
              <span>{siteProfile.publicRepos} 个</span>
            </div>
            <div>
              <strong>主推项目</strong>
              <span>{featuredWork.title}</span>
            </div>
          </div>
        </motion.article>

        <motion.article className={`${styles.card} ${styles.socialCard}`} variants={cardVariants}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.eyebrow}>Contact</p>
              <h3 className={styles.cardTitle}>联系方式</h3>
            </div>
          </div>

          <div className={styles.socialGrid}>
            {contactItems.map((item) => {
              const Icon = item.icon;
              const isQrItem = "qrSrc" in item;

              return (
                <a
                  className={`${styles.socialLink} ${isQrItem ? styles.socialLinkWithQr : ""} ${
                    isQrItem ? styles[`socialLink${item.qrTone === "wechat" ? "Wechat" : "Qq"}`] : ""
                  }`}
                  href={item.href}
                  key={item.label}
                  onClick={(event) => {
                    if (isQrItem) {
                      event.preventDefault();
                    }

                  }}
                  rel={item.external ? "noreferrer" : undefined}
                  target={item.external ? "_blank" : undefined}
                  title={item.label}
                >
                  <span className={styles.socialIcon}>
                    <Icon size={18} />
                  </span>
                  <span>{item.label}</span>

                  {isQrItem ? (
                    <span className={styles.qrPopover}>
                      <Image
                        alt={item.qrAlt}
                        className={styles.qrImage}
                        height={128}
                        src={item.qrSrc}
                        unoptimized
                        width={128}
                        onError={(event) => {
                          const image = event.currentTarget as HTMLImageElement;
                          image.style.display = "none";
                          const fallback = image.parentElement?.querySelector(
                            `.${styles.qrFallback}`
                          ) as HTMLElement | null;

                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />
                      <span className={styles.qrFallback}>{item.qrFallback}</span>
                    </span>
                  ) : null}
                </a>
              );
            })}
          </div>
        </motion.article>

        <motion.article className={`${styles.card} ${styles.newsletterCard}`} variants={cardVariants}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.eyebrow}>Latest notes</p>
              <h3 className={styles.cardTitle}>最近笔记</h3>
            </div>
            <span className={styles.iconFrame}>
              <Inbox size={18} />
            </span>
          </div>

          <div className={styles.noteExhibit}>
            {latestNotes.map((note) => (
              <Link className={styles.notePanelLink} href={`/notes?note=${note.slug}`} key={note.slug}>
                <article className={styles.notePanel}>
                  <p className={styles.noteFormat}>{note.format}</p>
                  <h3 className={styles.noteTitle}>{note.shortTitle}</h3>
                </article>
              </Link>
            ))}
          </div>

          <form className={`${styles.newsletterForm} ${styles.compactNewsletterForm}`} onSubmit={handleNewsletterSubmit}>
            <input
              className={styles.newsletterInput}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              type="email"
              value={email}
            />
            <button className={styles.newsletterButton} type="submit">
              <span className={styles.buttonText}>订阅</span>
            </button>
          </form>

          <p
            className={`${styles.message} ${
              message.kind === "success" ? styles.success : message.kind === "error" ? styles.error : ""
            }`}
          >
            {message.text}
          </p>
        </motion.article>
      </motion.div>
    </section>
  );
}
