import { Authenticator, type Theme, ThemeProvider } from "@aws-amplify/ui-react";
import type { ReactElement } from "react";
import { SignInHeader } from "./SignInHeader";

const customTheme: Theme = {
  name: "custom-auth-theme",
  tokens: {
    colors: {
      brand: {
        primary: {
          10: "#f4f9f6",
          80: "#1f6b4d",
          90: "#19573f",
          100: "#12402f",
        },
      },
    },
    components: {
      button: {
        primary: {
          backgroundColor: { value: "{colors.brand.primary.80}" },
          _hover: { backgroundColor: { value: "{colors.brand.primary.90}" } },
          _active: { backgroundColor: { value: "{colors.brand.primary.100}" } },
        },
      },
    },
  },
};

export function AuthShell({
  children,
}: {
  children: (context: { signOut?: () => void }) => ReactElement;
}) {
  return (
    <ThemeProvider theme={customTheme}>
      <Authenticator
        components={{
          SignIn: {
            Header: SignInHeader,
          },
        }}
        formFields={{
          signIn: {
            username: {
              label: "ユーザー名",
              placeholder: "your-username",
            },
            password: {
              label: "パスワード",
              placeholder: "••••••••",
            },
          },
        }}
        hideSignUp
      >
        {({ signOut }) => children({ signOut })}
      </Authenticator>
    </ThemeProvider>
  );
}

