const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  baseBuilder: {
    ownerAddress: "",
  },
  miniapp: {
    version: "1",
    name: "Base Incubator MetaDAO",
    subtitle: "The Y Combinator of Base Ecosystem",
    description: "Infrastructure, legal wrapper, and operational team to take founders from Idea to Token Launch. Hub-Squad governance model with expert service pods.",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utility",
    tags: ["dao", "incubator", "base", "governance", "defi"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "From Idea to Token Launch",
    ogTitle: "Base Incubator MetaDAO - The Y Combinator of Base",
    ogDescription: "Complete infrastructure for Web3 founders: legal setup, fundraising, talent, and product management in one DAO.",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
