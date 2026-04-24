import companySeeds from "@/data/companies.seed.json";
import type { CompanySeed } from "@/lib/types";

export const companyConfig = companySeeds as CompanySeed[];

export function getCompanyBySlug(slug: string) {
  return companyConfig.find((company) => company.slug === slug);
}
