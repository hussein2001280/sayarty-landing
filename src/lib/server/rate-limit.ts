const requests = new Map<string, number[]>();

export function checkRateLimit(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const timestamps = requests.get(key) ?? [];
  const recent = timestamps.filter((timestamp) => now - timestamp < windowMs);

  if (recent.length >= limit) {
    requests.set(key, recent);
    return false;
  }

  recent.push(now);
  requests.set(key, recent);
  return true;
}
