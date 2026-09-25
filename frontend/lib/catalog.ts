export interface CatalogEntry {
  slug: string;
  name: string;
  description: string;
  available: boolean;
}

/**
 * Display copy of the document types in the root catalog.json. Only Mutual
 * NDA is wired up to a working creator so far; the rest are "coming soon"
 * until later tickets build them out.
 */
export const catalog: CatalogEntry[] = [
  {
    slug: "mutual-nda",
    name: "Mutual Non-Disclosure Agreement (MNDA)",
    description:
      "Common Paper standard Mutual Non-Disclosure Agreement, allowing two parties to exchange confidential information under mutual confidentiality obligations.",
    available: true,
  },
  {
    slug: "mutual-nda-coverpage",
    name: "Mutual Non-Disclosure Agreement (MNDA) Cover Page",
    description:
      "Cover page used to execute the Common Paper Mutual Non-Disclosure Agreement by incorporating the Standard Terms and capturing the parties' deal-specific details.",
    available: false,
  },
  {
    slug: "csa",
    name: "Cloud Service Agreement (CSA)",
    description:
      "Common Paper standard Cloud Service Agreement for selling and buying cloud software and SaaS products.",
    available: false,
  },
  {
    slug: "design-partner-agreement",
    name: "Design Partner Agreement",
    description:
      "Common Paper standard Design Partner Agreement granting an early customer access to a product in exchange for feedback during a design partner program.",
    available: false,
  },
  {
    slug: "sla",
    name: "Service Level Agreement (SLA)",
    description:
      "Common Paper Service Level Agreement, designed to be used with the Cloud Service Agreement, covering uptime commitments, response times, and service credits.",
    available: false,
  },
  {
    slug: "psa",
    name: "Professional Services Agreement (PSA)",
    description:
      "Common Paper standard Professional Services Agreement for engaging a services provider to perform work under one or more statements of work.",
    available: false,
  },
  {
    slug: "dpa",
    name: "Data Processing Agreement (DPA)",
    description:
      "Common Paper Data Processing Agreement governing the processing of personal data between a data controller and a data processor.",
    available: false,
  },
  {
    slug: "software-license-agreement",
    name: "Software License Agreement",
    description:
      "Common Paper standard Software License Agreement for licensing on-premise or self-hosted software.",
    available: false,
  },
  {
    slug: "partnership-agreement",
    name: "Partnership Agreement",
    description:
      "Common Paper standard Partnership Agreement for structuring a business partnership between two companies.",
    available: false,
  },
  {
    slug: "baa",
    name: "Business Associate Agreement (BAA)",
    description:
      "Common Paper standard Business Associate Agreement for HIPAA-covered entities and their business associates handling protected health information.",
    available: false,
  },
  {
    slug: "pilot-agreement",
    name: "Pilot Agreement",
    description:
      "Common Paper standard Pilot Agreement, a short-term contract allowing a prospective customer to test a product or service before committing to a longer-term deal.",
    available: false,
  },
  {
    slug: "ai-addendum",
    name: "AI Addendum",
    description:
      "Common Paper standard AI Addendum, supplementing a Software License Agreement or Cloud Service Agreement with terms governing the use of artificial intelligence features.",
    available: false,
  },
];
