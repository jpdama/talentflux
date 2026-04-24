import { eq } from "drizzle-orm";

import { closeDb, getDb } from "@/db/client";
import { companies } from "@/db/schema";
import { companyConfig } from "@/lib/company-config";

async function main() {
  const db = getDb();

  for (const company of companyConfig) {
    const existing = await db.select().from(companies).where(eq(companies.slug, company.slug)).limit(1);
    if (existing.length) {
      await db
        .update(companies)
        .set({
          name: company.name,
          provider: company.provider,
          providerToken: company.providerToken,
          websiteUrl: company.websiteUrl,
          careersUrl: company.careersUrl,
          sector: company.sector,
          isActive: company.isActive
        })
        .where(eq(companies.slug, company.slug));
    } else {
      await db.insert(companies).values({
        slug: company.slug,
        name: company.name,
        provider: company.provider,
        providerToken: company.providerToken,
        websiteUrl: company.websiteUrl,
        careersUrl: company.careersUrl,
        sector: company.sector,
        isActive: company.isActive
      });
    }
  }

  await closeDb();
  console.log(`Seeded ${companyConfig.length} companies.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
