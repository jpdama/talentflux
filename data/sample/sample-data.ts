import { addDays, subDays } from "date-fns";

import { companyConfig } from "@/lib/company-config";
import type { CanonicalJob, CompanySeed, DailyMetricPoint } from "@/lib/types";
import { hashContent } from "@/lib/utils/hash";

const today = new Date("2026-04-20T12:00:00Z");

type JobSeed = Pick<
  CanonicalJob,
  | "title"
  | "department"
  | "locationText"
  | "country"
  | "region"
  | "workplaceType"
  | "employmentType"
  | "roleFamily"
  | "seniorityBand"
  | "isAiRole"
  | "isGtmRole"
  | "skills"
  | "descriptionText"
> & { ageDays: number };

const sampleSeedByCompany: Record<string, JobSeed[]> = {
  vercel: [
    {
      title: "Software Engineer, AI Infrastructure",
      department: "Engineering",
      locationText: "Remote - United States",
      country: "United States",
      region: "North America",
      workplaceType: "remote",
      employmentType: "Full-time",
      roleFamily: "AI / Data",
      seniorityBand: "Senior",
      isAiRole: true,
      isGtmRole: false,
      skills: ["Python", "Kubernetes", "LLM", "Inference"],
      descriptionText: "Build platform primitives for AI-native workloads.",
      ageDays: 3
    },
    {
      title: "Developer Success Engineer",
      department: "Sales",
      locationText: "San Francisco, CA",
      country: "United States",
      region: "North America",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Sales / GTM",
      seniorityBand: "Mid",
      isAiRole: false,
      isGtmRole: true,
      skills: ["Customer Success", "Next.js", "Demo Engineering"],
      descriptionText: "Guide strategic customers through go-live milestones.",
      ageDays: 7
    },
    {
      title: "Growth Product Manager",
      department: "Product",
      locationText: "New York, NY",
      country: "United States",
      region: "North America",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Product",
      seniorityBand: "Senior",
      isAiRole: false,
      isGtmRole: false,
      skills: ["Growth", "Experimentation", "SQL"],
      descriptionText: "Expand adoption and cross-sell platform products.",
      ageDays: 10
    },
    {
      title: "Platform Architect",
      department: "Engineering",
      locationText: "Remote - Germany",
      country: "Germany",
      region: "Europe",
      workplaceType: "remote",
      employmentType: "Full-time",
      roleFamily: "Infrastructure",
      seniorityBand: "Staff+",
      isAiRole: false,
      isGtmRole: false,
      skills: ["Architecture", "Cloud", "Edge"],
      descriptionText: "Own architecture patterns for strategic enterprise accounts.",
      ageDays: 14
    },
    {
      title: "Community & Events Manager, v0",
      department: "Marketing",
      locationText: "Remote - United States",
      country: "United States",
      region: "North America",
      workplaceType: "remote",
      employmentType: "Full-time",
      roleFamily: "Marketing",
      seniorityBand: "Manager",
      isAiRole: true,
      isGtmRole: true,
      skills: ["Community", "Events", "AI"],
      descriptionText: "Scale the community around v0 with live and digital programs.",
      ageDays: 5
    },
    {
      title: "Security Engineer",
      department: "Security",
      locationText: "London, UK",
      country: "United Kingdom",
      region: "Europe",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Security",
      seniorityBand: "Senior",
      isAiRole: false,
      isGtmRole: false,
      skills: ["Security", "Cloud", "Threat Modeling"],
      descriptionText: "Protect platform services and developer-facing tooling.",
      ageDays: 16
    }
  ],
  datadog: [
    {
      title: "Senior Developer Advocate - Generative AI",
      department: "Community",
      locationText: "San Francisco, CA",
      country: "United States",
      region: "North America",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Marketing",
      seniorityBand: "Senior",
      isAiRole: true,
      isGtmRole: true,
      skills: ["Generative AI", "Content", "Observability"],
      descriptionText: "Drive AI observability awareness through developer programs.",
      ageDays: 4
    },
    {
      title: "Data Scientist, Cloudforce One Threat Intelligence",
      department: "Security",
      locationText: "Remote - United States",
      country: "United States",
      region: "North America",
      workplaceType: "remote",
      employmentType: "Full-time",
      roleFamily: "AI / Data",
      seniorityBand: "Senior",
      isAiRole: true,
      isGtmRole: false,
      skills: ["Python", "Threat Intelligence", "ML"],
      descriptionText: "Develop signals for threat detection and attribution.",
      ageDays: 8
    },
    {
      title: "Technical Content Writer",
      department: "Community",
      locationText: "New York, NY",
      country: "United States",
      region: "North America",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Marketing",
      seniorityBand: "Mid",
      isAiRole: false,
      isGtmRole: true,
      skills: ["Writing", "Docs", "Product Marketing"],
      descriptionText: "Translate observability complexity into practical stories.",
      ageDays: 11
    },
    {
      title: "Enterprise Account Executive",
      department: "Sales",
      locationText: "Paris, France",
      country: "France",
      region: "Europe",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Sales / GTM",
      seniorityBand: "Senior",
      isAiRole: false,
      isGtmRole: true,
      skills: ["Enterprise Sales", "Pipeline", "SaaS"],
      descriptionText: "Expand enterprise footprint in Europe.",
      ageDays: 6
    },
    {
      title: "Staff Product Manager, AI Monitoring",
      department: "Product",
      locationText: "Boston, MA",
      country: "United States",
      region: "North America",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Product",
      seniorityBand: "Staff+",
      isAiRole: true,
      isGtmRole: false,
      skills: ["Product Strategy", "AI", "Telemetry"],
      descriptionText: "Define product strategy for AI-native observability workflows.",
      ageDays: 3
    },
    {
      title: "Manager, Solutions Engineering",
      department: "Sales",
      locationText: "Singapore",
      country: "Singapore",
      region: "APAC",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Leadership",
      seniorityBand: "Manager",
      isAiRole: false,
      isGtmRole: true,
      skills: ["Pre-sales", "Management", "Solutions Architecture"],
      descriptionText: "Lead APAC solution engineering coverage.",
      ageDays: 13
    }
  ],
  figma: [
    {
      title: "Product Designer, AI",
      department: "Design",
      locationText: "San Francisco, CA",
      country: "United States",
      region: "North America",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Design",
      seniorityBand: "Mid",
      isAiRole: true,
      isGtmRole: false,
      skills: ["Product Design", "AI", "Prototyping"],
      descriptionText: "Design AI-assisted creation experiences in Figma.",
      ageDays: 2
    },
    {
      title: "Software Engineer, AI Product",
      department: "Engineering",
      locationText: "New York, NY",
      country: "United States",
      region: "North America",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "AI / Data",
      seniorityBand: "Senior",
      isAiRole: true,
      isGtmRole: false,
      skills: ["TypeScript", "ML Systems", "React"],
      descriptionText: "Ship AI-native workflows in collaborative design tooling.",
      ageDays: 4
    },
    {
      title: "Data Scientist",
      department: "Engineering",
      locationText: "Remote - United States",
      country: "United States",
      region: "North America",
      workplaceType: "remote",
      employmentType: "Full-time",
      roleFamily: "AI / Data",
      seniorityBand: "Mid",
      isAiRole: true,
      isGtmRole: false,
      skills: ["SQL", "Experimentation", "Python"],
      descriptionText: "Measure product growth and monetization experiments.",
      ageDays: 7
    },
    {
      title: "Account Executive, Mid-Market",
      department: "Sales",
      locationText: "Berlin, Germany",
      country: "Germany",
      region: "Europe",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Sales / GTM",
      seniorityBand: "Mid",
      isAiRole: false,
      isGtmRole: true,
      skills: ["Sales", "Mid-Market", "Product-Led Growth"],
      descriptionText: "Grow commercial adoption across Europe.",
      ageDays: 9
    },
    {
      title: "Director, Product - Developer Tools",
      department: "Product",
      locationText: "New York, NY",
      country: "United States",
      region: "North America",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Leadership",
      seniorityBand: "Director+",
      isAiRole: false,
      isGtmRole: false,
      skills: ["Product Leadership", "Developer Tools"],
      descriptionText: "Own product direction for developer-facing surfaces.",
      ageDays: 15
    },
    {
      title: "Growth Marketing Manager, Lifecycle",
      department: "Marketing",
      locationText: "San Francisco, CA",
      country: "United States",
      region: "North America",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Marketing",
      seniorityBand: "Senior",
      isAiRole: false,
      isGtmRole: true,
      skills: ["Lifecycle", "CRM", "Growth"],
      descriptionText: "Scale lifecycle programs across activation and expansion.",
      ageDays: 12
    }
  ],
  stripe: [
    {
      title: "Product Manager, Usage Based Billing",
      department: "Product",
      locationText: "San Francisco, CA",
      country: "United States",
      region: "North America",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Product",
      seniorityBand: "Senior",
      isAiRole: false,
      isGtmRole: false,
      skills: ["Billing", "Product Management", "Pricing"],
      descriptionText: "Define billing primitives for complex usage models.",
      ageDays: 5
    },
    {
      title: "Credit Risk Strategy & Analytics, Capital",
      department: "Risk",
      locationText: "New York, NY",
      country: "United States",
      region: "North America",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Finance / Ops",
      seniorityBand: "Senior",
      isAiRole: false,
      isGtmRole: false,
      skills: ["Credit Risk", "Analytics", "SQL"],
      descriptionText: "Support underwriting strategy for embedded finance products.",
      ageDays: 7
    },
    {
      title: "Staff Engineer, Usage Based Billing",
      department: "Engineering",
      locationText: "Seattle, WA",
      country: "United States",
      region: "North America",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Engineering",
      seniorityBand: "Staff+",
      isAiRole: false,
      isGtmRole: false,
      skills: ["Distributed Systems", "Billing", "APIs"],
      descriptionText: "Build core billing infrastructure at scale.",
      ageDays: 10
    },
    {
      title: "Product Risk Manager, API Solutions",
      department: "Risk",
      locationText: "Toronto, Canada",
      country: "Canada",
      region: "North America",
      workplaceType: "remote",
      employmentType: "Full-time",
      roleFamily: "Finance / Ops",
      seniorityBand: "Manager",
      isAiRole: false,
      isGtmRole: false,
      skills: ["Risk", "API", "Compliance"],
      descriptionText: "Guide onboarding and compliance decisions for API products.",
      ageDays: 13
    },
    {
      title: "Account Executive, Strategic",
      department: "Sales",
      locationText: "London, UK",
      country: "United Kingdom",
      region: "Europe",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Sales / GTM",
      seniorityBand: "Senior",
      isAiRole: false,
      isGtmRole: true,
      skills: ["Enterprise Sales", "Payments", "Partnerships"],
      descriptionText: "Grow strategic accounts across EMEA.",
      ageDays: 4
    },
    {
      title: "Machine Learning Engineer, Fraud",
      department: "Engineering",
      locationText: "Dublin, Ireland",
      country: "Ireland",
      region: "Europe",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "AI / Data",
      seniorityBand: "Senior",
      isAiRole: true,
      isGtmRole: false,
      skills: ["Machine Learning", "Fraud", "Python"],
      descriptionText: "Improve fraud models with low-latency decisioning.",
      ageDays: 2
    }
  ],
  cloudflare: [
    {
      title: "Product Manager, Cloudflare Workers",
      department: "Product",
      locationText: "Austin, TX",
      country: "United States",
      region: "North America",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Product",
      seniorityBand: "Senior",
      isAiRole: false,
      isGtmRole: false,
      skills: ["Product Management", "Developer Platform", "Edge"],
      descriptionText: "Shape runtime strategy for programmable edge products.",
      ageDays: 4
    },
    {
      title: "Machine Learning Engineer, Threat Intelligence",
      department: "Security",
      locationText: "Lisbon, Portugal",
      country: "Portugal",
      region: "Europe",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "AI / Data",
      seniorityBand: "Senior",
      isAiRole: true,
      isGtmRole: false,
      skills: ["Machine Learning", "Threat Detection", "Python"],
      descriptionText: "Apply ML to abuse and threat response systems.",
      ageDays: 3
    },
    {
      title: "Senior Application Security Engineer",
      department: "Security",
      locationText: "Austin, TX",
      country: "United States",
      region: "North America",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Security",
      seniorityBand: "Senior",
      isAiRole: false,
      isGtmRole: false,
      skills: ["AppSec", "Threat Modeling", "Cloud Security"],
      descriptionText: "Protect internal and customer-facing application surfaces.",
      ageDays: 8
    },
    {
      title: "Threat Response Analyst",
      department: "Security",
      locationText: "Remote - United Kingdom",
      country: "United Kingdom",
      region: "Europe",
      workplaceType: "remote",
      employmentType: "Full-time",
      roleFamily: "Security",
      seniorityBand: "Mid",
      isAiRole: false,
      isGtmRole: false,
      skills: ["SOC", "Threat Hunting", "Incident Response"],
      descriptionText: "Respond to abuse and active threat campaigns.",
      ageDays: 11
    },
    {
      title: "Principal Technical Engagement Manager",
      department: "Special Projects",
      locationText: "Tokyo, Japan",
      country: "Japan",
      region: "APAC",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Leadership",
      seniorityBand: "Director+",
      isAiRole: false,
      isGtmRole: true,
      skills: ["Customer Strategy", "Program Leadership"],
      descriptionText: "Drive large strategic deployment programs.",
      ageDays: 6
    },
    {
      title: "Solutions Engineer, Zero Trust",
      department: "Sales",
      locationText: "Sydney, Australia",
      country: "Australia",
      region: "APAC",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Sales / GTM",
      seniorityBand: "Senior",
      isAiRole: false,
      isGtmRole: true,
      skills: ["Zero Trust", "Pre-sales", "Security"],
      descriptionText: "Expand adoption of security platform offerings in APAC.",
      ageDays: 9
    }
  ],
  hashicorp: [
    {
      title: "Senior Platform Engineer",
      department: "Platform",
      locationText: "Bengaluru, India",
      country: "India",
      region: "APAC",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Infrastructure",
      seniorityBand: "Senior",
      isAiRole: false,
      isGtmRole: false,
      skills: ["Terraform", "Cloud", "Platform Engineering"],
      descriptionText: "Build shared platform capabilities for product teams.",
      ageDays: 8
    },
    {
      title: "Sr. Manager, Cloud Platform Services",
      department: "Platform",
      locationText: "Bengaluru, India",
      country: "India",
      region: "APAC",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Leadership",
      seniorityBand: "Manager",
      isAiRole: false,
      isGtmRole: false,
      skills: ["Management", "Cloud Platform", "Operations"],
      descriptionText: "Lead cloud platform services and reliability programs.",
      ageDays: 14
    },
    {
      title: "Sr. Product Manager - Terraform Migrate",
      department: "Product",
      locationText: "Remote - United States",
      country: "United States",
      region: "North America",
      workplaceType: "remote",
      employmentType: "Full-time",
      roleFamily: "Product",
      seniorityBand: "Senior",
      isAiRole: false,
      isGtmRole: false,
      skills: ["Terraform", "Migration", "Product Management"],
      descriptionText: "Simplify enterprise migration to Terraform workflows.",
      ageDays: 5
    },
    {
      title: "Customer Success Engineer",
      department: "Global Support",
      locationText: "Tokyo, Japan",
      country: "Japan",
      region: "APAC",
      workplaceType: "remote",
      employmentType: "Full-time",
      roleFamily: "Customer Success",
      seniorityBand: "Mid",
      isAiRole: false,
      isGtmRole: true,
      skills: ["Customer Success", "Vault", "Onboarding"],
      descriptionText: "Support enterprise adoption of Vault and HCP.",
      ageDays: 10
    },
    {
      title: "Sr. Solutions Engineer",
      department: "Solutions Engineering",
      locationText: "Sydney, Australia",
      country: "Australia",
      region: "APAC",
      workplaceType: "remote",
      employmentType: "Full-time",
      roleFamily: "Sales / GTM",
      seniorityBand: "Senior",
      isAiRole: false,
      isGtmRole: true,
      skills: ["Solutions Engineering", "Terraform", "Sales"],
      descriptionText: "Support technical expansion with strategic accounts.",
      ageDays: 12
    },
    {
      title: "Security Incident Response Engineer",
      department: "Security",
      locationText: "Bengaluru, India",
      country: "India",
      region: "APAC",
      workplaceType: "hybrid",
      employmentType: "Full-time",
      roleFamily: "Security",
      seniorityBand: "Senior",
      isAiRole: false,
      isGtmRole: false,
      skills: ["Incident Response", "Cloud Security", "Detection"],
      descriptionText: "Run incident response and resilience programs.",
      ageDays: 7
    }
  ]
};

const fallbackJobSeeds: JobSeed[] = [
  {
    title: "Senior AI Platform Engineer",
    department: "Engineering",
    locationText: "Remote - United States",
    country: "United States",
    region: "North America",
    workplaceType: "remote",
    employmentType: "Full-time",
    roleFamily: "AI / Data",
    seniorityBand: "Senior",
    isAiRole: true,
    isGtmRole: false,
    skills: ["Python", "ML Systems", "Platform"],
    descriptionText: "Build production systems for AI-enabled product workflows.",
    ageDays: 4
  },
  {
    title: "Enterprise Account Executive",
    department: "Sales",
    locationText: "New York, NY",
    country: "United States",
    region: "North America",
    workplaceType: "hybrid",
    employmentType: "Full-time",
    roleFamily: "Sales / GTM",
    seniorityBand: "Senior",
    isAiRole: false,
    isGtmRole: true,
    skills: ["Enterprise Sales", "Pipeline", "SaaS"],
    descriptionText: "Expand enterprise pipeline and strategic account coverage.",
    ageDays: 7
  },
  {
    title: "Product Manager, Platform",
    department: "Product",
    locationText: "San Francisco, CA",
    country: "United States",
    region: "North America",
    workplaceType: "hybrid",
    employmentType: "Full-time",
    roleFamily: "Product",
    seniorityBand: "Senior",
    isAiRole: false,
    isGtmRole: false,
    skills: ["Product Strategy", "Roadmapping", "Analytics"],
    descriptionText: "Shape platform priorities across developer and operator workflows.",
    ageDays: 10
  },
  {
    title: "People Partner",
    department: "People",
    locationText: "London, UK",
    country: "United Kingdom",
    region: "Europe",
    workplaceType: "hybrid",
    employmentType: "Full-time",
    roleFamily: "People / Talent",
    seniorityBand: "Manager",
    isAiRole: false,
    isGtmRole: false,
    skills: ["HRBP", "Org Design", "Hiring"],
    descriptionText: "Support organizational growth and international hiring plans.",
    ageDays: 12
  }
];

const trendProfiles: Record<string, { start: number; drift: number; aiBias: number }> = {
  vercel: { start: 18, drift: 0.25, aiBias: 0.2 },
  datadog: { start: 22, drift: 0.18, aiBias: 0.14 },
  figma: { start: 16, drift: 0.2, aiBias: 0.18 },
  stripe: { start: 20, drift: 0.08, aiBias: 0.1 },
  cloudflare: { start: 19, drift: 0.1, aiBias: 0.16 },
  hashicorp: { start: 14, drift: -0.04, aiBias: 0.05 }
};

function buildSampleJob(company: CompanySeed, seed: JobSeed, index: number): CanonicalJob {
  const firstSeen = subDays(today, seed.ageDays);
  const descriptionText = seed.descriptionText;
  return {
    companySlug: company.slug,
    companyName: company.name,
    provider: company.provider,
    providerJobId: `${company.slug}-${index + 1}`,
    sourceUrl: `${company.careersUrl}/jobs/${company.slug}-${index + 1}`,
    title: seed.title,
    department: seed.department,
    locationText: seed.locationText,
    country: seed.country,
    region: seed.region,
    workplaceType: seed.workplaceType,
    employmentType: seed.employmentType,
    roleFamily: seed.roleFamily,
    seniorityBand: seed.seniorityBand,
    isAiRole: seed.isAiRole,
    isGtmRole: seed.isGtmRole,
    skills: seed.skills,
    descriptionHash: hashContent(`${seed.title}-${descriptionText}`),
    descriptionText,
    firstSeenAt: firstSeen.toISOString(),
    lastSeenAt: today.toISOString(),
    isOpen: true
  };
}

export function buildSampleJobs() {
  return companyConfig.flatMap((company) =>
    (sampleSeedByCompany[company.slug] ?? fallbackJobSeeds).map((seed, index) => buildSampleJob(company, seed, index))
  );
}

export function buildSampleHistory(jobs: CanonicalJob[]) {
  return companyConfig.flatMap((company) => {
    const companyJobs = jobs.filter((job) => job.companySlug === company.slug);
    const profile = trendProfiles[company.slug] ?? {
      start: Math.max(10, companyJobs.length + 8),
      drift: 0.08,
      aiBias: 0.1
    };
    const aiJobs = companyJobs.filter((job) => job.isAiRole).length;
    const gtmJobs = companyJobs.filter((job) => job.isGtmRole).length;
    const leadershipJobs = companyJobs.filter((job) => job.roleFamily === "Leadership").length;
    const remoteJobs = companyJobs.filter((job) => job.workplaceType === "remote").length;
    const locationCount = new Set(companyJobs.map((job) => job.locationText).filter(Boolean)).size;
    const currentOpenJobs = companyJobs.length;

    return Array.from({ length: 30 }, (_, index) => {
      const metricDate = addDays(subDays(today, 29), index);
      const momentumWave = Math.sin(index / 4) * 1.4;
      const openJobs = Math.max(
        4,
        Math.round(profile.start + profile.drift * index + currentOpenJobs / 2.5 + momentumWave)
      );
      const aiShare = Math.min(0.5, aiJobs / Math.max(currentOpenJobs, 1) + profile.aiBias * (index / 29));
      const gtmShare = Math.min(0.45, gtmJobs / Math.max(currentOpenJobs, 1) + (index % 7 === 0 ? 0.03 : 0));
      const leadershipShare = leadershipJobs / Math.max(currentOpenJobs, 1);
      const remoteShare = remoteJobs / Math.max(currentOpenJobs, 1);
      const newJobs7d = Math.max(1, Math.round((openJobs - profile.start) / 2.5));
      const closedJobs7d = Math.max(0, Math.round((index % 8 === 0 ? 2 : 1) - profile.drift));
      const netNew7d = newJobs7d - closedJobs7d;

      return {
        companySlug: company.slug,
        metricDate: metricDate.toISOString().slice(0, 10),
        openJobs,
        newJobs7d,
        closedJobs7d,
        netNew7d,
        aiShare,
        gtmShare,
        leadershipShare,
        remoteShare,
        locationCount,
        newLocationCount30d: company.slug === "datadog" || company.slug === "cloudflare" ? 2 : 1,
        momentumScore: 0,
        forecast7d: openJobs + Math.round(profile.drift * 7)
      } satisfies DailyMetricPoint;
    });
  });
}

export function buildSampleDataset() {
  const jobs = buildSampleJobs();
  const history = buildSampleHistory(jobs);
  return {
    jobs,
    history,
    companies: companyConfig
  };
}
