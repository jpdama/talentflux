export type Provider = "greenhouse" | "lever";
export type WorkplaceType = "remote" | "hybrid" | "on-site" | "unknown";
export type RoleFamily =
  | "Engineering"
  | "AI / Data"
  | "Product"
  | "Design"
  | "Security"
  | "Infrastructure"
  | "Sales / GTM"
  | "Marketing"
  | "Customer Success"
  | "People / Talent"
  | "Finance / Ops"
  | "Leadership"
  | "Other";
export type SeniorityBand =
  | "Intern"
  | "Entry"
  | "Mid"
  | "Senior"
  | "Staff+"
  | "Manager"
  | "Director+";

export interface CompanySeed {
  slug: string;
  name: string;
  provider: Provider;
  providerToken: string;
  websiteUrl: string;
  careersUrl: string;
  sector: string;
  isActive: boolean;
}

export interface CanonicalJob {
  companySlug: string;
  companyName: string;
  provider: Provider;
  providerJobId: string;
  sourceUrl: string;
  title: string;
  department: string | null;
  locationText: string | null;
  country: string | null;
  region: string | null;
  workplaceType: WorkplaceType;
  employmentType: string | null;
  roleFamily: RoleFamily;
  seniorityBand: SeniorityBand;
  isAiRole: boolean;
  isGtmRole: boolean;
  skills: string[];
  descriptionHash: string;
  descriptionText: string;
  firstSeenAt: string;
  lastSeenAt: string;
  isOpen: boolean;
}

export interface DailyMetricPoint {
  companySlug: string;
  metricDate: string;
  openJobs: number;
  newJobs7d: number;
  closedJobs7d: number;
  netNew7d: number;
  aiShare: number;
  gtmShare: number;
  leadershipShare: number;
  remoteShare: number;
  locationCount: number;
  newLocationCount30d: number;
  momentumScore: number;
  forecast7d: number;
}

export interface FunctionMixItem {
  roleFamily: RoleFamily;
  count: number;
  share: number;
}

export interface InsightAlert {
  id: string;
  companySlug: string;
  companyName: string;
  type:
    | "AI Buildout"
    | "GTM Expansion"
    | "Geo Expansion"
    | "Leadership Hiring"
    | "Hiring Cooldown"
    | "Concentration Risk";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  reason: string;
}

export interface GroundedSummary {
  headline: string;
  bullets: string[];
  watchItem: string;
  evidence: string[];
  usedFallback: boolean;
}

export interface CompanySnapshot {
  company: CompanySeed;
  metrics: DailyMetricPoint;
  history: DailyMetricPoint[];
  jobs: CanonicalJob[];
  alerts: InsightAlert[];
  summary: GroundedSummary;
  functionMix: FunctionMixItem[];
  topSkills: string[];
}

export interface CohortMetrics {
  totalOpenJobs: number;
  netNew7d: number;
  avgAiShare: number;
  avgRemoteShare: number;
  trackedCompanies: number;
  topMomentumCompany: string;
}

export interface DashboardFilters {
  companies: string[];
  roleFamily?: RoleFamily | "All";
  location?: string;
  provider?: Provider | "all";
  remoteOnly?: boolean;
  aiOnly?: boolean;
  timeRangeDays: number;
}

export interface CohortSnapshot {
  meta: {
    source: "database" | "live" | "sample";
    generatedAt: string;
    freshnessMinutes: number;
    usedFallback: boolean;
    notices: string[];
  };
  filters: DashboardFilters;
  cohortMetrics: CohortMetrics;
  cohortTrend: Array<{
    metricDate: string;
    openJobs: number;
    aiShare: number;
  }>;
  companies: CompanySnapshot[];
  alerts: InsightAlert[];
  jobs: CanonicalJob[];
  availableLocations: string[];
  availableRoleFamilies: RoleFamily[];
  availableProviders: Provider[];
  cohortSummary: GroundedSummary;
}
