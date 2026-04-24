import { parseGreenhouseJobs } from "@/lib/providers/greenhouse";
import { parseLeverJobs } from "@/lib/providers/lever";
import { companyConfig } from "@/lib/company-config";

describe("provider normalization", () => {
  it("normalizes greenhouse payloads", () => {
    const company = companyConfig.find((item) => item.slug === "vercel")!;
    const jobs = parseGreenhouseJobs(company, {
      jobs: [
        {
          id: 123,
          absolute_url: "https://example.com/job/123",
          title: "Software Engineer, AI Infrastructure",
          content: "Build LLM systems in Python.",
          location: { name: "Remote - United States" },
          departments: [{ name: "Engineering" }]
        }
      ]
    });

    expect(jobs[0].provider).toBe("greenhouse");
    expect(jobs[0].isAiRole).toBe(true);
    expect(jobs[0].roleFamily).toBe("AI / Data");
  });

  it("normalizes lever payloads", () => {
    const company = {
      ...companyConfig[0],
      provider: "lever" as const,
      providerToken: "test-company"
    };
    const jobs = parseLeverJobs(company, [
      {
        id: "abc",
        text: "Account Executive, Enterprise",
        hostedUrl: "https://example.com/job/abc",
        description: "Own pipeline and expansion across strategic accounts.",
        categories: {
          location: "London, UK",
          team: "Sales",
          commitment: "Full-time"
        }
      }
    ]);

    expect(jobs[0].provider).toBe("lever");
    expect(jobs[0].isGtmRole).toBe(true);
    expect(jobs[0].roleFamily).toBe("Sales / GTM");
  });
});
