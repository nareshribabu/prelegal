import type { NextConfig } from "next";

// This repo is a GitHub Pages *project* site, so it's served from
// https://<user>.github.io/prelegal/ rather than the domain root. Only apply
// the subpath when actually building for GitHub Pages (set by the deploy
// workflow) so `npm run dev`/`npm run build` still work at "/" locally.
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoBasePath = "/prelegal";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGithubPages ? repoBasePath : undefined,
  assetPrefix: isGithubPages ? `${repoBasePath}/` : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
