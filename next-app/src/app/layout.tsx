'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/providers/AuthProvider";
import { useAuthContext } from "../components/providers/AuthProvider";
import { WalletProvider } from "../components/wallet/WalletProvider";
import { BlockchainProvider } from "../contexts/BlockchainContext";
import Header from "../components/layout/Header";
import LoadingScreen from "../components/ui/LoadingScreen";

const inter = Inter({ subsets: ["latin"] });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { loading } = useAuthContext();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <BlockchainProvider>
            <AuthProvider>
              <LayoutContent>{children}</LayoutContent>
            </AuthProvider>
          </BlockchainProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
