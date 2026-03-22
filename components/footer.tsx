"use client"

import Image from "next/image"
import { Instagram, Facebook, Linkedin } from "lucide-react"

const footerLinks = {
  leistungen: [
    { label: "Branding", href: "#leistungen" },
    { label: "Webdesign", href: "#leistungen" },
    { label: "Print Design", href: "#leistungen" },
    { label: "Social Media", href: "#leistungen" },
    { label: "Fotografie", href: "#leistungen" },
  ],
  unternehmen: [
    { label: "Über uns", href: "#ueber-uns" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Prozess", href: "#prozess" },
    { label: "FAQ", href: "#faq" },
    { label: "Kontakt", href: "#kontakt" },
  ],
  rechtliches: [
    { label: "Impressum", href: "/impressum" },
    { label: "Datenschutz", href: "/datenschutz" },
  ],
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/logo.png"
              alt="vitamin b"
              width={150}
              height={40}
              className="h-8 w-auto mb-6"
            />
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Ihre Kreativagentur für Kommunikation & Design in der Region Heilbronn.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/vitaminb.design/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-[#ff6a00] hover:bg-[#ff6a00]/10 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/vitaminb.design/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-[#ff6a00] hover:bg-[#ff6a00]/10 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-[#ff6a00] hover:bg-[#ff6a00]/10 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4">Leistungen</h4>
            <ul className="space-y-3">
              {footerLinks.leistungen.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/40 text-sm hover:text-[#ff6a00] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium text-sm mb-4">Unternehmen</h4>
            <ul className="space-y-3">
              {footerLinks.unternehmen.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/40 text-sm hover:text-[#ff6a00] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium text-sm mb-4">Rechtliches</h4>
            <ul className="space-y-3">
              {footerLinks.rechtliches.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/40 text-sm hover:text-[#ff6a00] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            &copy; {new Date().getFullYear()} vitamin b - kommunikation & design. Alle Rechte vorbehalten.
          </p>
          <p className="text-white/20 text-xs">
            Mit Leidenschaft gestaltet in Neuenstadt am Kocher.
          </p>
        </div>
      </div>
    </footer>
  )
}
