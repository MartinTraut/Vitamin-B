import { Inter, Sora } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const sora = Sora({ subsets: ["latin"], variable: "--font-heading-family" })

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vitaminb-design.de"),
  title: {
    default: "vitaminb | Brand & Creative Studio in der Region Heilbronn",
    template: "%s | vitaminb kommunikation & design",
  },
  description:
    "Creative Studio für strategische Markenentwicklung, visuelle Identität und Markenwahrnehmung in der Region Heilbronn. Branding, Webdesign, Print und Social Media. From Vision to Brand.",
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
    "vitaminb design",
  ],
  authors: [{ name: "vitaminb kommunikation & design" }],
  creator: "vitaminb kommunikation & design",
  publisher: "vitaminb kommunikation & design",
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://www.vitaminb-design.de",
    siteName: "vitaminb kommunikation & design",
    title: "vitaminb | Brand & Creative Studio · Region Heilbronn",
    description:
      "From Vision to Brand. Strategische Markenentwicklung und visuelle Identität aus der Region Heilbronn.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "vitaminb kommunikation & design",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "vitaminb | Brand & Creative Studio · Region Heilbronn",
    description: "From Vision to Brand. Strategische Markenentwicklung aus der Region Heilbronn.",
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
              name: "vitaminb kommunikation & design",
              alternateName: "vitaminb",
              description:
                "Creative Studio für strategische Markenentwicklung, visuelle Identität und Markenwahrnehmung in der Region Heilbronn. From Vision to Brand.",
              slogan: "From Vision to Brand.",
              image: "https://www.vitaminb-design.de/logo.png",
              logo: "https://www.vitaminb-design.de/logo-vitaminb-orange.png",
              "@id": "https://www.vitaminb-design.de",
              url: "https://www.vitaminb-design.de",
              founder: {
                "@type": "Person",
                name: "Robert Bauer",
                jobTitle: "Inhaber & Creative Director",
              },
              knowsAbout: [
                "Branding",
                "Corporate Design",
                "Webdesign",
                "Printdesign",
                "Werbetechnik",
                "Fahrzeugbeschriftung",
                "Social Media",
                "Markenstrategie",
              ],
              telephone: "+4915158779133",
              email: "mail@vitaminb-design.de",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Hermann-Lang-Straße 32",
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
