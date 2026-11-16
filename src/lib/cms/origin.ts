// Compare against the actual request Host: Next's internal URL can use localhost behind a proxy.
export function sameOrigin(request: Request): boolean {
  const value = request.headers.get("origin");
  if (!value) return false;
  try {
    const origin = new URL(value);
    const expected = process.env.APP_ORIGIN;
    if (expected) return origin.origin === new URL(expected).origin;
    return (
      ["http:", "https:"].includes(origin.protocol) &&
      origin.host === request.headers.get("host") &&
      (process.env.NODE_ENV !== "production" || origin.protocol === "https:")
    );
  } catch {
    return false;
  }
}
