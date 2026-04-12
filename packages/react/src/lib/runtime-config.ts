export interface RuntimeConfig {
  apiUrl: string;
  cognito: {
    userPoolId: string;
    userPoolClientId: string;
    region: string;
  };
}

function isRuntimeConfig(value: Window["__CONFIG__"]): value is RuntimeConfig {
  return !!(
    value?.apiUrl &&
    value.cognito?.userPoolId &&
    value.cognito?.userPoolClientId &&
    value.cognito?.region
  );
}

export function getRuntimeConfig(): RuntimeConfig {
  const config = window.__CONFIG__;
  if (!isRuntimeConfig(config)) {
    throw new Error("config.js が読み込まれていません");
  }
  return config;
}

