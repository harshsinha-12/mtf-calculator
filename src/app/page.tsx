"use client";

import { useMTFStore } from "@/hooks/use-mtf-store";
import { Dashboard } from "@/components/dashboard";
import { HomeScreen } from "@/components/home-screen";
import { WizardOverlay } from "@/components/wizard/wizard-overlay";

export default function Home() {
  const store = useMTFStore();

  if (!store.hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen px-4 py-8 lg:px-8">
      <BackgroundGrid />
      <div className="relative mx-auto max-w-7xl">
        {store.screen === "home" ? (
          <HomeScreen store={store} />
        ) : (
          <Dashboard store={store} />
        )}
      </div>
      {store.showWizard && <WizardOverlay store={store} />}
    </main>
  );
}

function BackgroundGrid() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 bg-[#09090b]" />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(251,191,36,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="pointer-events-none fixed -left-40 top-20 h-96 w-96 rounded-full bg-amber-400/[0.04] blur-[120px]" />
      <div className="pointer-events-none fixed -right-40 bottom-20 h-96 w-96 rounded-full bg-emerald-400/[0.03] blur-[120px]" />
    </>
  );
}
