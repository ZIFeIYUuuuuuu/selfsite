import { selectedWork } from "./site-content";

export const projectAnchor = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const projectScreens = [
  { title: "MOYAG Agent Canvas", label: "MOYAG Agent Canvas", cover: "/work/moyag-agent-canvas.jpg" },
  { title: "ClaimCourt", label: "ClaimCourt", cover: "/work/claimcourt-clean.png" },
  { title: "super-agent", label: "Super Agent", cover: "/work/super-agent-ui.jpg" },
  { title: "InterviewPilot-AI", label: "InterviewPilot AI", cover: "/work/interviewpilot-ai.png" },
] as const;

export const featuredProjects = projectScreens.map(screen => {
  const project = selectedWork.find(item => item.title === screen.title);
  if (!project) throw new Error(`Missing featured project: ${screen.title}`);
  return { ...project, ...screen, href: `/work#${projectAnchor(project.title)}` };
});
