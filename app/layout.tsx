import { Inter, Sora } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const sora = Sora({ subsets: ["latin"], variable: "--font-heading-family" })

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vitaminb-design.de"),
  title: {
    default: "vitamin b | Kommunikation & Design aus Neuenstadt am Kocher",
    template: "%s | vitamin b - kommunikation & design",
  },
  description:
    "Ihre Kreativagentur für Branding, Webdesign, Print & Social Media in der Region Heilbronn. Wir gestalten Marken, die verkaufen. Jetzt unverbindlich beraten lassen.",
  keywords: [
    "Designagentur Heilbronn",
    "Webdesign Neuenstadt",
    "Branding Agentur",
    "Grafikdesign Heilbronn",
    "Corporate Design",
    "Social Media Marketing",
    "Werbeagentur Heilbronn",
    "Print Design",
    "Logo Design",
    "vitamin b design",
  ],
  authors: [{ name: "vitamin b - kommunikation & design" }],
  creator: "vitamin b - kommunikation & design",
  publisher: "vitamin b - kommunikation & design",
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://www.vitaminb-design.de",
    siteName: "vitamin b - kommunikation & design",
    title: "vitamin b | Kreativagentur für Design & Kommunikation",
    description:
      "Marken, die verkaufen. Designs, die begeistern. Ihre Kreativagentur in der Region Heilbronn.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "vitamin b - kommunikation & design",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "vitamin b | Kreativagentur für Design & Kommunikation",
    description: "Marken, die verkaufen. Designs, die begeistern.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.vitaminb-design.de",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={cn("antialiased", inter.variable, sora.variable)}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "vitamin b - kommunikation & design",
              image: "https://www.vitaminb-design.de/logo.png",
              "@id": "https://www.vitaminb-design.de",
              url: "https://www.vitaminb-design.de",
              telephone: "+4915172896574",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Hermann-Lang-Str. 32",
                addressLocality: "Neuenstadt am Kocher",
                postalCode: "74196",
                addressCountry: "DE",
                addressRegion: "Baden-Württemberg",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 49.2333,
                longitude: 9.3333,
              },
              areaServed: [
                {
                  "@type": "GeoCircle",
                  geoMidpoint: {
                    "@type": "GeoCoordinates",
                    latitude: 49.2333,
                    longitude: 9.3333,
                  },
                  geoRadius: "50000",
                },
                { "@type": "City", name: "Heilbronn" },
                { "@type": "City", name: "Neuenstadt am Kocher" },
                { "@type": "State", name: "Baden-Württemberg" },
              ],
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                ],
                opens: "09:00",
                closes: "18:00",
              },
              priceRange: "$$",
              sameAs: [
                "https://www.instagram.com/vitaminb.design/",
                "https://www.facebook.com/vitaminb.design/",
              ],
            }),
          }}
        />
      </head>
      <body className="bg-[#050505] text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
