export class FetchError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "FetchError";
  }
}

function isRetriable(status?: number): boolean {
  if (status === undefined) return true;
  if (status >= 500) return true;
  if (status === 408 || status === 429) return true;
  return false;
}

export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
  options?: { retries?: number; timeoutMs?: number }
): Promise<T> {
  const retries = options?.retries ?? 2;
  const timeoutMs = options?.timeoutMs ?? 10000;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          Accept: "application/json",
          "User-Agent": "TalentFlux/1.0 (+https://talentflux.app)",
          ...(init?.headers ?? {})
        },
        signal: controller.signal,
        cache: "no-store"
      });

      if (!response.ok) {
        const error = new FetchError(`Request failed (${response.status}) for ${url}`, response.status);
        if (!isRetriable(response.status) || attempt === retries) {
          throw error;
        }
        lastError = error;
      } else {
        return (await response.json()) as T;
      }
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        if (error instanceof FetchError) throw error;
        if (error instanceof Error && error.name === "AbortError") {
          throw new FetchError(`Request timed out after ${timeoutMs}ms for ${url}`, 408, error);
        }
        throw new FetchError(
          `Network error for ${url}: ${error instanceof Error ? error.message : String(error)}`,
          undefined,
          error
        );
      }
    } finally {
      clearTimeout(timer);
    }

    // Exponential backoff with jitter
    const base = 300 * Math.pow(2, attempt);
    const jitter = Math.random() * 200;
    await new Promise((resolve) => setTimeout(resolve, base + jitter));
  }

  throw lastError instanceof Error ? lastError : new FetchError(`Request failed for ${url}`);
}
