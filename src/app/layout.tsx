"use client";

import "./globals.css";
import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "../components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a single QueryClient instance
const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="p-4">
        <QueryClientProvider client={queryClient}>
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl sm:text-4xl font-bold text-green-600">
              Todo App
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <Link href="/test-error">
                <Button variant="danger">Trigger Error</Button>
              </Link>

              <Button variant="ghost">
                <Link href="/">Home</Link>
              </Button>
            </div>
          </header>

          <main>{children}</main>
        </QueryClientProvider>
      </body>
    </html>
  );
}
