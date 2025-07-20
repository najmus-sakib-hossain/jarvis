import { LoadTheme } from "@/providers/load-theme";
import { Providers } from "@/providers";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Friday",
    template: "%s | Friday",
  },
  description: "Your AI Friend.",
  keywords: [
    "friday",
    "manfromexistence",
    "multiverse",
    "aladdin",
    "better",
    "dx",
    "manfromexistence-auth",
    "manfromexistence-ui",
    "manfromexistence-ux",
  ],
  authors: [
    {
      name: "manfromexistence",
      url: "https://manfromexistence.vercel.app",
    },
  ],
  creator: "manfromexistence",
  metadataBase: new URL("https://themux.vercel.app"),
  openGraph: {
    title: "Friday | More than just your AI assistant",
    description: "Your AI Friend.",
  },
  generator: "Next.js",
};

export default function Root(props: {
  children: React.ReactNode;
}) {

  const { children } = props;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <LoadTheme />
      </head>
      <body className={cn(`antialiased w-full min-h-screen relative`)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

