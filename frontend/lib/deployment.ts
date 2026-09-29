/**
 * True when this build was produced for the GitHub Pages static export,
 * which has no backend to call. Set by the deploy workflow at build time.
 */
export function isGithubPagesBuild(): boolean {
  return process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";
}
