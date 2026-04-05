// NEXT_PUBLIC_* はビルド時（CDK synth 時）にインライン化されるが、
// CDK は全スタックの synth を全デプロイの前に実行するため、
// 初回デプロイ時に API URL 等がまだ存在しない。
// そのため S3 上の config.json をクライアントから fetch で読み込み、
// React Context で各コンポーネントに伝搬する。
"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

interface Config {
  apiUrl: string;
}

const ConfigContext = createContext<Config | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    fetch("/config.json")
      .then((res) => res.json())
      .then(setConfig)
      .catch((e) => console.error("Failed to load config.json:", e));
  }, []);

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useConfig(): Config | null {
  return useContext(ConfigContext);
}
