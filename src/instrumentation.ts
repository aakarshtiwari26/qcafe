/**
 * Runs once at server startup (Next.js instrumentation hook). Forces
 * Node's DNS resolver to prefer IPv4 — some hosts advertise AAAA records
 * for services like Gmail SMTP that are not actually routable in this
 * environment, causing ECONNREFUSED/EHOSTUNREACH on an IPv6 address even
 * though the IPv4 address works fine. Affects every outbound connection
 * (SMTP, MongoDB Atlas, ImageKit), not just one.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = await import("dns");
    dns.setDefaultResultOrder("ipv4first");
  }
}
