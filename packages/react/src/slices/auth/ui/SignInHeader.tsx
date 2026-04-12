import { View, useTheme } from "@aws-amplify/ui-react";

export function SignInHeader() {
  const { tokens } = useTheme();
  return (
    <View
      textAlign="center"
      padding={`${tokens.space.xl} ${tokens.space.xl} ${tokens.space.medium}`}
      style={{ letterSpacing: "0.02em" }}
    >
      <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>CRS Console</h1>
      <p style={{ margin: "0.5rem 0 0", color: "#4b5563", fontSize: "0.95rem" }}>
        チームアカウントでサインインしてください
      </p>
    </View>
  );
}

