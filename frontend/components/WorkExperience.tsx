"use client";

import { featuredProjects } from "@/lib/featured-projects";
import ScrollPreview from "./ScrollPreview";

export default function WorkExperience() {
  return <ScrollPreview items={featuredProjects} />;
}
