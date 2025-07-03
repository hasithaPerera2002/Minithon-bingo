import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  return {
    title: "Bingooo",
    description: "Fill the tiles and win the NFT",
    keywords: ["Bingo",  "farcaster", "base", "web3", "degens"],
    authors: [{ name: "By Hasitha" }],
    openGraph: {
      title: "Bingooo",
      description: "Fill the tiles and win the NFT",
      type: "website",
      siteName: "Bingooo",
      images: [
        {
          url: `${URL}/og.png`,
          width: 1200,
          height: 630,
          alt: "Bingooo - Fill the tiles and win the NFT",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Bingooo",
      description: "Fill the tiles and win the NFT",
      images: [`${URL}/og.png`],
    },
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: `${URL}/og.png`,
        button: {
          title: "Open Bingooo 🎉",
          action: {
            type: "launch_frame",
            name: "Bingooo",
            url: URL,
            splashImageUrl: `${URL}/splash.png`,
            splashBackgroundColor: "#ff6b9d",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
