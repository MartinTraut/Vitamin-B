import type { Metadata } from "next"
import { Inter, Sora } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { AuthProvider } from "@/lib/auth"
import { StoreProvider } from "@/lib/store"
import { ToastProvider } from "@/lib/toast"
import { DialogProvider } from "@/lib/dialog"
import { AuthGate } from "@/components/shell/auth-gate"
import { AppShell } from "@/components/shell/app-shell"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const sora = Sora({ subsets: ["latin"], variable: "--font-heading-family" })

export const metadata: Metadata = {
  title: "vitaminb · Organisations-Dashboard",
  description: "Internes Organisations-OS für vitaminb kommunikation & design.",
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={cn(inter.variable, sora.variable)} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <AuthProvider>
          <AuthGate>
            <StoreProvider>
              <ToastProvider>
                <DialogProvider>
                  <AppShell>{children}</AppShell>
                </DialogProvider>
              </ToastProvider>
            </StoreProvider>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  )
}
