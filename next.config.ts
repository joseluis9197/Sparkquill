import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * Applied to every response. The product serves children and takes payment, so
 * the cheap defences are worth having switched on from the start rather than
 * added after something goes wrong.
 *
 * The Content-Security-Policy is not here. It needs a fresh nonce on every
 * response, which a static header cannot carry, so it lives in src/proxy.ts.
 * These are the headers that are the same for every request.
 */
const securityHeaders = [
  // No sniffing a response into a different content type than it declares.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Nobody frames this app; clickjacking a PIN pad is a real attack.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The app asks for none of these, so deny them at the platform level.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
