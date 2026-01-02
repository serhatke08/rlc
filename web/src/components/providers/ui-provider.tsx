'use client';

import { createContext, useContext, useState, type ReactNode } from "react";

type UIContextValue = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  toggleSidebarCollapse: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
};

const UIContext = createContext<UIContextValue | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const value: UIContextValue = {
    sidebarCollapsed,
    mobileSidebarOpen,
    toggleSidebarCollapse: () => setSidebarCollapsed((prev) => !prev),
    openMobileSidebar: () => setMobileSidebarOpen(true),
    closeMobileSidebar: () => setMobileSidebarOpen(false),
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }
  return context;
}

