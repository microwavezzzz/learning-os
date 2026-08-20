"use client";

import * as React from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen w-full cosmic-mesh-light dark:cosmic-mesh-bg relative overflow-hidden flex p-2 sm:p-4 md:p-6 gap-3 sm:gap-4 md:gap-5">
      {/* ── Ambient Soft Glowing Blobs matching the reference mockup ────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Large Neon Violet/Fuchsia Blob top-center */}
        <div className="absolute -top-24 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-fuchsia-500/25 via-purple-600/30 to-indigo-600/25 blur-[120px] animate-blob-1" />

        {/* Electric Cyan/Teal Blob top-right */}
        <div className="absolute top-10 -right-20 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-cyan-400/30 via-teal-500/25 to-blue-600/20 blur-[110px] animate-blob-2" />

        {/* Vibrant Coral/Peach Blob bottom-left */}
        <div className="absolute -bottom-20 -left-20 w-[580px] h-[580px] rounded-full bg-gradient-to-tr from-pink-500/30 via-rose-500/25 to-amber-500/20 blur-[130px] animate-blob-3" />

        {/* Soft Blue/Indigo Blob bottom-right */}
        <div className="absolute -bottom-32 right-1/3 w-[620px] h-[620px] rounded-full bg-gradient-to-tl from-indigo-500/30 via-blue-600/25 to-purple-700/20 blur-[120px] animate-blob-1" />
      </div>

      {/* Floating Glass Sidebar */}
      <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Floating Main Glass Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] glass-panel-main rounded-3xl overflow-hidden relative z-10 shadow-2xl">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
