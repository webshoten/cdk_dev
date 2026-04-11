"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

interface Config {
  apiUrl: string;
}

const ConfigContext = createContext<Config | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then(setConfig)
      .catch((e) => console.error("Failed to load config:", e));
  }, []);

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useConfig(): Config | null {
  return useContext(ConfigContext);
}
