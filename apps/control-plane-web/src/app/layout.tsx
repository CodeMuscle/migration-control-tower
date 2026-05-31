import { ClerkProvider, OrganizationSwitcher, Show, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";

import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Migration Control Tower",
  description: "Internal control plane for customer data migrations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html lang="en">
        <body className="antialiased">
          <Providers>
            <header className="flex items-center justify-between border-b border-border px-6 py-3">
              <span className="text-sm font-semibold tracking-tight">Migration Control Tower</span>
              <div className="flex items-center gap-3">
                <Show when="signed-in">
                  <OrganizationSwitcher hidePersonal afterCreateOrganizationUrl="/" />
                  <UserButton />
                </Show>
                <Show when="signed-out">
                  <a
                    href="/sign-in"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Sign in
                  </a>
                </Show>
              </div>
            </header>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
