export class FetchError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
  }
}

export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
  options?: { retries?: number; timeoutMs?: number }
): Promise<T> {
  const retries = options?.retries ?? 2;
  const timeoutMs = options?.timeoutMs ?? 12000;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          Accept: "application/json",
          ...(init?.headers ?? {})
        },
        signal: controller.signal,
        cache: "no-store"
      });

      if (!response.ok) {
        throw new FetchError(`Request failed for ${url}`, response.status);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    } finally {
      clearTimeout(timer);
    }
  }

  throw new FetchError(`Request failed for ${url}`);
}
