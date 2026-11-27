/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // `next lint` only looks at app, components, lib, pages and src by default
    dirs: [
      "app",
      "components",
      "contexts",
      "contract",
      "hooks",
      "lib",
      "prisma",
      "tests",
      "types",
      "utils",
    ],
    // CI runs the linter (.github/workflows/ci.yml), so the build doesn't
    // repeat it. Type errors still fail the build.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
