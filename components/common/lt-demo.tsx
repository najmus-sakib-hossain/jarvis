"use client";

import { useLt } from "@/hooks/use-lt";

// Client-side component with proper initialization
export function LtDemo() {
  const lt = useLt();

  return (
    <div className="space-y-6 p-4 border rounded-lg">
      <h3 className="font-semibold">lt() Function Demo</h3>

      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Client-Side Usage</h4>
          <div className="space-y-2 text-sm pl-2">
            <div>
              <code className="bg-muted px-2 py-1 rounded">lt("home")</code>
              <p className="mt-1">→ {lt("home")}</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">lt("automations")</code>
              <p className="mt-1">→ {lt("automations")}</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">lt("varients")</code>
              <p className="mt-1">→ {lt("varients")}</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">lt("library")</code>
              <p className="mt-1">→ {lt("library")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
