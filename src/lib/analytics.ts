export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window !== "undefined" && (window as any).va) {
    (window as any).va("track", event, props);
  }
}
