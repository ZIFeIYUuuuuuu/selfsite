"use client";

import { useEffect, useState } from "react";

import { fetchApiV1Health, type ApiHealthResponse } from "@/lib/api";

type HealthState =
  | { phase: "idle" | "loading" }
  | { phase: "success"; data: ApiHealthResponse }
  | { phase: "error"; message: string };

export default function HealthCheckCard() {
  const [healthState, setHealthState] = useState<HealthState>({ phase: "idle" });

  useEffect(() => {
    const controller = new AbortController();

    async function runHealthCheck() {
      setHealthState({ phase: "loading" });

      try {
        const data = await fetchApiV1Health(controller.signal);
        setHealthState({ phase: "success", data });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        const message = error instanceof Error ? error.message : "Unknown error";
        setHealthState({ phase: "error", message });
      }
    }

    void runHealthCheck();
    return () => controller.abort();
  }, []);

  return (
    <section className="health-panel">
      <div className="health-header">
        <div>
          <p className="health-label">Live backend status</p>
          <h3>FastAPI health check</h3>
        </div>
        <span
          className={`health-pill ${healthState.phase === "success" ? "is-up" : ""} ${
            healthState.phase === "error" ? "is-down" : ""
          }`}
        >
          {healthState.phase === "success"
            ? "Healthy"
            : healthState.phase === "error"
              ? "Needs attention"
              : "Checking"}
        </span>
      </div>
      <p className="health-hint">
        Endpoint: <code>/api/v1/health</code>
      </p>
      {healthState.phase === "loading" || healthState.phase === "idle" ? <p>Checking connection...</p> : null}
      {healthState.phase === "success" ? <pre>{JSON.stringify(healthState.data, null, 2)}</pre> : null}
      {healthState.phase === "error" ? <p className="error">{healthState.message}</p> : null}
    </section>
  );
}
