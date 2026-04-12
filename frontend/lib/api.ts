export type ApiHealthResponse = {
  status: string;
  service: string;
  version?: string;
};

export async function fetchApiV1Health(signal?: AbortSignal): Promise<ApiHealthResponse> {
  const response = await fetch("/api/v1/health", {
    method: "GET",
    headers: {
      Accept: "application/json"
    },
    cache: "no-store",
    signal
  });

  if (!response.ok) {
    throw new Error(`Health request failed with status ${response.status}`);
  }

  return (await response.json()) as ApiHealthResponse;
}
