import type React from "react"
import type { Metadata, Viewport } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "sonner"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "PrepSafe - Emergency Preparedness Made Simple",
  description: "Your comprehensive emergency preparedness platform for individuals, families, and preppers.",
  generator: "v0.app",
  keywords: [
    "Emergency Preparedness",
    "Bug Out Bag",
    "Inventory Tracker",
    "NOAA Alerts",
    "Family Safety Plan",
    "Prepping App",
  ],
  openGraph: {
    title: "PrepSafe - Emergency Preparedness Made Simple",
    description: "Your comprehensive emergency preparedness platform for individuals, families, and preppers.",
    siteName: "PrepSafe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepSafe - Emergency Preparedness Made Simple",
    description: "Your comprehensive emergency preparedness platform for individuals, families, and preppers.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PrepSafe",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web Browser",
    description:
      'A detailed paragraph describing PrepSafe as a "comprehensive emergency preparedness platform for tracking supplies, creating evacuation routes, and coordinating family safety plans."',
    featureList: [
      "Smart Inventory Management",
      "GPS Kit Tracking",
      "Real-time NOAA Weather Alerts",
      "Family Synchronization",
    ],
    offers: {
      "@type": "AggregateOffer",
      offers: [
        {
          "@type": "Offer",
          name: "Scout",
          price: "0",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Prepper Pro",
          price: "5",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Family Plan",
          price: "10",
          priceCurrency: "USD",
        },
      ],
    },
  }

  return (
    <ClerkProvider>
      <html lang="en" className={`${montserrat.variable} ${openSans.variable}`}>
        <body className="font-sans antialiased">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {children}
          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  )
}
