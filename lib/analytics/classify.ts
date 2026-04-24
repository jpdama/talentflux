import { differenceInCalendarDays, parseISO } from "date-fns";

import type { CanonicalJob, RoleFamily, SeniorityBand, WorkplaceType } from "@/lib/types";

const ROLE_RULES: Array<{ roleFamily: RoleFamily; keywords: string[] }> = [
  { roleFamily: "AI / Data", keywords: [" ai", "machine learning", "ml ", "data scientist", "llm", "generative", "model", "research scientist"] },
  { roleFamily: "Security", keywords: ["security", "threat", "appsec", "identity", "zero trust", "incident response"] },
  { roleFamily: "Infrastructure", keywords: ["platform", "infrastructure", "reliability", "cloud", "sre", "devops", "deployment", "compute"] },
  { roleFamily: "Engineering", keywords: ["software engineer", "backend", "frontend", "full stack", "ios", "android", "developer", "engineer"] },
  { roleFamily: "Product", keywords: ["product manager", "product lead", "program manager"] },
  { roleFamily: "Design", keywords: ["designer", "design", "ux", "researcher"] },
  { roleFamily: "Sales / GTM", keywords: ["account executive", "sales", "solutions engineer", "sales engineer", "partnership", "revenue", "growth advisor"] },
  { roleFamily: "Marketing", keywords: ["marketing", "developer advocate", "community", "content", "brand", "events"] },
  { roleFamily: "Customer Success", keywords: ["customer success", "support", "technical account manager", "success engineer"] },
  { roleFamily: "People / Talent", keywords: ["recruit", "people", "talent", "hr", "benefits"] },
  { roleFamily: "Finance / Ops", keywords: ["finance", "accounting", "risk", "operations", "bizops", "strategy analyst", "procurement"] },
  { roleFamily: "Leadership", keywords: ["director", "vp", "head of", "chief", "manager, ", "manager -", "principal technical engagement manager"] }
];

const SENIORITY_RULES: Array<{ band: SeniorityBand; keywords: string[] }> = [
  { band: "Intern", keywords: ["intern", "co-op"] },
  { band: "Director+", keywords: ["director", "vp", "head", "chief", "principal technical engagement manager"] },
  { band: "Manager", keywords: ["manager", "lead "] },
  { band: "Staff+", keywords: ["staff", "principal", "architect"] },
  { band: "Senior", keywords: ["senior", "sr.", "sr ", "ii", "iii"] },
  { band: "Entry", keywords: ["associate", "junior", "new grad"] }
];

const AI_TITLE_KEYWORDS = [
  " ai ",
  "ai engineer",
  "ai researcher",
  "machine learning",
  "ml engineer",
  "data scientist",
  "llm",
  "generative",
  "model",
  "inference",
  "nlp"
];
const AI_DESCRIPTION_KEYWORDS = [
  "large language model",
  "machine learning model",
  "retrieval augmented generation",
  "prompt engineering",
  "model evaluation",
  "inference stack"
];
const GTM_TITLE_KEYWORDS = [
  "account executive",
  "sales",
  "go to market",
  "solutions engineer",
  "solutions consultant",
  "business development",
  "partnership",
  "customer success",
  "customer support",
  "revenue operations",
  "growth marketing",
  "field marketing"
];
const GTM_DEPARTMENT_KEYWORDS = ["sales", "marketing", "customer success", "customer support", "partnership", "revenue"];
const LEADERSHIP_FAMILIES: RoleFamily[] = ["Leadership"];

const SKILL_KEYWORDS = [
  "Python",
  "TypeScript",
  "React",
  "Next.js",
  "Kubernetes",
  "Terraform",
  "SQL",
  "OpenAI",
  "LLM",
  "Machine Learning",
  "Threat Intelligence",
  "Cloud Security",
  "Billing",
  "Growth",
  "Enterprise Sales",
  "Customer Success",
  "Observability"
];

const COUNTRY_TO_REGION: Record<string, string> = {
  "United States": "North America",
  Canada: "North America",
  Germany: "Europe",
  France: "Europe",
  Ireland: "Europe",
  Portugal: "Europe",
  "United Kingdom": "Europe",
  Singapore: "APAC",
  Japan: "APAC",
  Australia: "APAC",
  India: "APAC"
};

export function inferRoleFamily(title: string, department?: string | null) {
  const haystack = `${title} ${department ?? ""}`.toLowerCase();
  const match = ROLE_RULES.find((rule) => rule.keywords.some((keyword) => haystack.includes(keyword)));
  return match?.roleFamily ?? "Other";
}

export function inferSeniorityBand(title: string) {
  const haystack = title.toLowerCase();
  const match = SENIORITY_RULES.find((rule) => rule.keywords.some((keyword) => haystack.includes(keyword)));
  return match?.band ?? "Mid";
}

export function inferWorkplaceType(input?: string | null) {
  const haystack = (input ?? "").toLowerCase();
  if (haystack.includes("remote")) return "remote" satisfies WorkplaceType;
  if (haystack.includes("hybrid")) return "hybrid" satisfies WorkplaceType;
  if (haystack.includes("office") || haystack.includes("in-office") || haystack.includes("on-site")) {
    return "on-site" satisfies WorkplaceType;
  }
  return "unknown" satisfies WorkplaceType;
}

export function inferCountryAndRegion(locationText?: string | null) {
  if (!locationText) {
    return {
      country: null,
      region: null
    };
  }

  const normalized = locationText
    .replace(/^remote\s*-\s*/i, "")
    .split("•")[0]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const countryCandidate = normalized.at(-1) ?? null;
  const country =
    countryCandidate === "CA"
      ? "United States"
      : countryCandidate === "UK"
        ? "United Kingdom"
        : countryCandidate && countryCandidate.length <= 3
          ? "United States"
          : countryCandidate;

  return {
    country,
    region: country ? COUNTRY_TO_REGION[country] ?? "Global" : null
  };
}

export function extractSkills(...contentParts: Array<string | null | undefined>) {
  const haystack = contentParts.filter(Boolean).join(" ").toLowerCase();
  return SKILL_KEYWORDS.filter((skill) => haystack.includes(skill.toLowerCase()));
}

function normalizeHaystack(value?: string | null) {
  return ` ${value?.toLowerCase().replace(/\s+/g, " ").trim() ?? ""} `;
}

export function isAiRole(title: string, department?: string | null, description?: string | null) {
  const titleHaystack = normalizeHaystack(title);
  const departmentHaystack = normalizeHaystack(department);
  const descriptionHaystack = normalizeHaystack(description);

  if (AI_TITLE_KEYWORDS.some((keyword) => titleHaystack.includes(` ${keyword.trim()} `))) {
    return true;
  }

  if (departmentHaystack.includes(" data ") || departmentHaystack.includes(" machine learning ")) {
    return true;
  }

  return AI_DESCRIPTION_KEYWORDS.some((keyword) => descriptionHaystack.includes(` ${keyword.trim()} `));
}

export function isGtmRole(title: string, department?: string | null, description?: string | null) {
  const titleHaystack = normalizeHaystack(title);
  const departmentHaystack = normalizeHaystack(department);
  const descriptionHaystack = normalizeHaystack(description);

  if (GTM_TITLE_KEYWORDS.some((keyword) => titleHaystack.includes(` ${keyword.trim()} `))) {
    return true;
  }

  if (GTM_DEPARTMENT_KEYWORDS.some((keyword) => departmentHaystack.includes(` ${keyword.trim()} `))) {
    return true;
  }

  return (
    descriptionHaystack.includes(" sales pipeline ") ||
    descriptionHaystack.includes(" customer expansion ") ||
    descriptionHaystack.includes(" demand generation ")
  );
}

export function isLeadershipRole(job: Pick<CanonicalJob, "roleFamily" | "title" | "seniorityBand">) {
  return LEADERSHIP_FAMILIES.includes(job.roleFamily) || job.seniorityBand === "Director+" || job.seniorityBand === "Manager";
}

export function daysOpen(job: Pick<CanonicalJob, "firstSeenAt" | "lastSeenAt" | "isOpen">) {
  const end = job.isOpen ? new Date() : parseISO(job.lastSeenAt);
  return differenceInCalendarDays(end, parseISO(job.firstSeenAt));
}
