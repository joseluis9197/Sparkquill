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
  /*
   * Nobody frames this app; clickjacking a PIN pad is a real attack.
   *
   * Relaxed to SAMEORIGIN in development only, so the viewport lab can put
   * the app's own pages in narrow frames. Production stays DENY: an internal
   * tool is not a reason to weaken a header for real users, and clickjacking
   * requires a different origin to do the framing anyway.
   */
  {
    key: "X-Frame-Options",
    value: process.env.NODE_ENV === "development" ? "SAMEORIGIN" : "DENY",
  },
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
