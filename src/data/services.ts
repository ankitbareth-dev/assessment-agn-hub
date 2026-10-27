import type { Service, ServiceCategory } from "../types/services";

export const SERVICES: Service[] = [
  {
    id: 1,
    name: "React Performance Audit",
    description:
      "Deep dive into your React app's render cycles, bundle size and Core Web Vitals, with a fix-first report.",
    duration: 60,
    price: 2499,
    category: "Development",
  },
  {
    id: 2,
    name: "WordPress Maintenance Setup",
    description:
      "Updates, backups, uptime monitoring and security hardening configured for your WordPress site.",
    duration: 45,
    price: 1499,
    category: "Development",
  },
  {
    id: 3,
    name: "API Integration Session",
    description:
      "Hands-on session to wire third-party APIs and webhooks into your existing product.",
    duration: 90,
    price: 3499,
    category: "Development",
  },

  {
    id: 4,
    name: "Solution Architecture Review",
    description:
      "Review of your system design, scalability bottlenecks and infra costs, ending with an action plan.",
    duration: 60,
    price: 4500,
    category: "Consulting",
  },
  {
    id: 5,
    name: "Product Discovery Call",
    description:
      "Scope your idea into a lean roadmap with feature priorities and effort estimates.",
    duration: 30,
    price: 999,
    category: "Consulting",
  },
  {
    id: 6,
    name: "Tech Stack Consultation",
    description:
      "Pick the right database, hosting and frameworks for your product stage and budget.",
    duration: 45,
    price: 1999,
    category: "Consulting",
  },

  {
    id: 7,
    name: "UI/UX Design Review",
    description:
      "Heuristic evaluation of your product's key flows with wireframe-level suggestions.",
    duration: 60,
    price: 2999,
    category: "Design",
  },
  {
    id: 8,
    name: "Landing Page Design Sprint",
    description:
      "From brief to a high-converting landing page layout, ready for development handoff.",
    duration: 90,
    price: 4999,
    category: "Design",
  },
  {
    id: 9,
    name: "Brand Identity Basics",
    description:
      "Logo directions, color system and type pairing for early-stage products.",
    duration: 60,
    price: 3999,
    category: "Design",
  },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Development",
  "Consulting",
  "Design",
];
