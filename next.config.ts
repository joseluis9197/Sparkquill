import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * Applied to every response. The product serves children and takes payment, so
 * the cheap defences are worth having switched on from the start rather than
 * added after something goes wrong.
 *
 * There is deliberately no Content-Security-Policy here yet: a CSP written
 * without measuring what the app actually loads either breaks the 3D canvas
 * and the Google Fonts stylesheet, or is so permissive it protects nothing.
 * It belongs in its own change, with the report-only phase that requires.
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
