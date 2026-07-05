// Demo-Seed-Daten (Fallback ohne Datenbank). Datumswerte relativ zu heute.

import type { Database } from "./types"
import { DEFAULT_APPOINTMENT_CATEGORIES } from "./types"
import { toISO } from "./recurrence"

function rel(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toISO(d)
}

export function buildDemoData(): Database {
  const now = new Date().toISOString()
  const yr = new Date().getFullYear()
  return {
    lists: [
      { id: "l-prod", name: "Produktion", color: "#E39832" },
      { id: "l-web", name: "Web & Digital", color: "#a855f7" },
      { id: "l-orga", name: "Organisation", color: "#3b82f6" },
    ],
    appointmentCategories: DEFAULT_APPOINTMENT_CATEGORIES.map((c) => ({ ...c })),
    tasks: [
      { id: "t1", person: "robert", listId: "l-orga", title: "Angebot Autofolierung Müller GmbH rausschicken", status: "doing", priority: "high", due: rel(1), createdAt: now },
      { id: "t2", person: "robert", listId: "l-orga", title: "Rechnung #2026-041 nachfassen", status: "todo", priority: "high", due: rel(0), createdAt: now },
      { id: "t3", person: "bastian", listId: "l-prod", title: "Fahrzeugbeschriftung Pflegedienst zuschneiden", status: "doing", priority: "normal", due: rel(2), createdAt: now, projectId: "p2", customerId: "c2", trackedMinutes: 95 },
      { id: "t4", person: "bastian", listId: "l-prod", title: "Plottfolie Orange nachbestellen", status: "todo", priority: "low", due: rel(4), createdAt: now },
      { id: "t5", person: "martin", listId: "l-web", title: "Landingpage Relaunch Kunde Bäckerei live stellen", status: "todo", priority: "normal", due: rel(3), createdAt: now, projectId: "p3", customerId: "c4" },
      { id: "t6", person: "martin", listId: "l-web", title: "Google Business Profil optimieren", status: "done", priority: "low", createdAt: now },
      { id: "t7", person: "robert", listId: "l-orga", title: "Materialeinkauf Messe vorbereiten", status: "todo", priority: "normal", due: rel(6), createdAt: now },
      { id: "t8", person: "bastian", listId: "l-prod", title: "T-Shirt-Druck Sportverein – Freigabe einholen", status: "todo", priority: "high", due: rel(1), createdAt: now },
    ],
    appointments: [
      { id: "a1", person: "robert", title: "Kundentermin Autohaus Schäfer", category: "termin", date: rel(0), time: "10:00", endTime: "11:30", location: "Neuenstadt", recurrence: { freq: "none", interval: 1 }, completedDates: [], createdAt: now, customerId: "c1", projectId: "p1" },
      { id: "a2", person: "bastian", title: "Lieferung Werbetafeln Baustelle B27", category: "liefertermin", date: rel(2), time: "08:30", endTime: "09:30", recurrence: { freq: "none", interval: 1 }, completedDates: [], createdAt: now },
      { id: "a3", person: "martin", title: "Team-Meeting Wochenplanung", category: "meeting", date: rel(0), time: "16:00", endTime: "17:00", recurrence: { freq: "weekly", interval: 1 }, completedDates: [], createdAt: now },
      { id: "a4", person: "robert", title: "Deadline: Logo-Konzept Steuerkanzlei", category: "deadline", date: rel(3), recurrence: { freq: "none", interval: 1 }, completedDates: [], createdAt: now },
      { id: "a5", person: "bastian", title: "Montage Schaufensterfolie Boutique", category: "termin", date: rel(5), time: "09:00", location: "Heilbronn", recurrence: { freq: "none", interval: 1 }, completedDates: [], createdAt: now },
      { id: "a6", person: "martin", title: "Abrechnung & Buchhaltung Monatsabschluss", category: "deadline", date: rel(7), recurrence: { freq: "monthly", interval: 1 }, completedDates: [], createdAt: now },
      // Fiktiver kompletter Tagesplan (privat + Arbeit gemischt) — Demo für Tages-/Wochenansicht
      { id: "a7", person: "robert", title: "Aufstehen & Kaffee", category: "sonstiges", date: rel(1), time: "06:30", endTime: "07:15", recurrence: { freq: "none", interval: 1 }, completedDates: [], createdAt: now },
      { id: "a8", person: "robert", title: "Joggen am Kocher", category: "sonstiges", date: rel(1), time: "07:15", endTime: "08:00", recurrence: { freq: "none", interval: 1 }, completedDates: [], createdAt: now },
      { id: "a9", person: "robert", title: "Team-Briefing & Tagesplanung", category: "meeting", date: rel(1), time: "08:30", endTime: "09:00", recurrence: { freq: "none", interval: 1 }, completedDates: [], createdAt: now },
      { id: "a10", person: "robert", title: "Designentwurf Fahrzeugbeschriftung", category: "termin", date: rel(1), time: "09:00", endTime: "10:30", recurrence: { freq: "none", interval: 1 }, completedDates: [], createdAt: now },
      { id: "a11", person: "robert", title: "Druckdaten Messebanner erstellen", category: "liefertermin", date: rel(1), time: "10:30", endTime: "12:00", recurrence: { freq: "none", interval: 1 }, completedDates: [], createdAt: now },
      { id: "a12", person: "robert", title: "Mittagspause", category: "sonstiges", date: rel(1), time: "12:00", endTime: "12:45", recurrence: { freq: "none", interval: 1 }, completedDates: [], createdAt: now },
      { id: "a13", person: "robert", title: "30 T-Shirts Sportverein drucken", category: "liefertermin", date: rel(1), time: "13:00", endTime: "15:00", recurrence: { freq: "none", interval: 1 }, completedDates: [], createdAt: now },
      { id: "a14", person: "robert", title: "Sohn von der Schule abholen", category: "sonstiges", date: rel(1), time: "15:15", endTime: "15:45", recurrence: { freq: "none", interval: 1 }, completedDates: [], createdAt: now },
      { id: "a15", person: "robert", title: "Mit Mutter einkaufen", category: "sonstiges", date: rel(1), time: "16:00", endTime: "16:45", recurrence: { freq: "none", interval: 1 }, completedDates: [], createdAt: now },
      { id: "a16", person: "robert", title: "Montage Schaufensterfolie Boutique", category: "termin", date: rel(1), time: "17:00", endTime: "18:30", location: "Bad Wimpfen", recurrence: { freq: "none", interval: 1 }, completedDates: [], createdAt: now },
      { id: "a17", person: "robert", title: "Angebote nachfassen", category: "deadline", date: rel(1), time: "19:00", endTime: "19:30", recurrence: { freq: "none", interval: 1 }, completedDates: [], createdAt: now },
    ],
    finance: [
      { month: "Jan", income: 8200, expense: 4100 },
      { month: "Feb", income: 9600, expense: 4800 },
      { month: "Mär", income: 7400, expense: 5200 },
      { month: "Apr", income: 11200, expense: 5600 },
      { month: "Mai", income: 10400, expense: 4900 },
      { month: "Jun", income: 13800, expense: 6100 },
    ],
    cashflow: [
      { id: "cf1", kind: "income", status: "confirmed", title: "Rechnung #2026-041 Autohaus Schäfer", party: "Autohaus Schäfer", amount: 3450, date: rel(2) },
      { id: "cf2", kind: "expense", status: "confirmed", title: "Plottfolie & Material Nachbestellung", party: "Avery Dennison", amount: 890, date: rel(3) },
      { id: "cf3", kind: "income", status: "potential", title: "Angebot Autofolierung Müller GmbH", party: "Müller GmbH", amount: 5200, date: rel(6) },
      { id: "cf4", kind: "expense", status: "confirmed", title: "Miete Werkstatt & Büro", party: "Vermieter", amount: 1850, date: rel(8) },
      { id: "cf5", kind: "income", status: "confirmed", title: "Rechnung #2026-044 Pflegedienst", party: "Pflegedienst Sonnenschein", amount: 2100, date: rel(11) },
      { id: "cf6", kind: "income", status: "potential", title: "Landingpage-Relaunch Bäckerei", party: "Bäckerei Werner", amount: 2800, date: rel(14) },
      { id: "cf7", kind: "expense", status: "confirmed", title: "Leasing Transporter", party: "Sparkasse Leasing", amount: 420, date: rel(15) },
      { id: "cf8", kind: "expense", status: "potential", title: "Steuervorauszahlung Q3", party: "Finanzamt", amount: 2600, date: rel(20) },
    ],
    customers: [
      { id: "c1", company: "Autohaus Schäfer GmbH", contactName: "Markus Schäfer", email: "m.schaefer@autohaus-schaefer.de", phone: "07139 123456", address: "Neuenstadt am Kocher", source: "Empfehlung", health: "active", notes: "Stammkunde, jährliche Flottenbeschriftung.", createdAt: now },
      { id: "c2", company: "Pflegedienst Sonnenschein", contactName: "Andrea Voß", email: "kontakt@pflege-sonnenschein.de", phone: "07132 998877", address: "Bad Friedrichshall", source: "Google", health: "active", notes: "Fahrzeugbeschriftung + Schilder.", createdAt: now },
      { id: "c3", company: "Müller GmbH", contactName: "Thomas Müller", email: "info@mueller-gmbh.de", phone: "07131 445566", address: "Heilbronn", source: "Messe", health: "lead", notes: "Anfrage Autofolierung Komplettflotte.", createdAt: now },
      { id: "c4", company: "Bäckerei Werner", contactName: "Lena Werner", email: "hallo@baeckerei-werner.de", phone: "07136 223344", address: "Bad Wimpfen", source: "Instagram", health: "lead", notes: "Schaufenster + Landingpage-Relaunch.", createdAt: now },
      { id: "c5", company: "Steuerkanzlei Berg & Partner", contactName: "Dr. Berg", email: "kanzlei@berg-partner.de", phone: "07131 778899", address: "Heilbronn", source: "Empfehlung", health: "churned", notes: "Logo-Konzept abgeschlossen, derzeit ruhend.", createdAt: now },
    ],
    projects: [
      { id: "p1", customerId: "c1", name: "Flottenbeschriftung 2026", status: "laufend", description: "12 Transporter Vollfolierung mit neuem CI.", createdAt: now },
      { id: "p2", customerId: "c2", name: "Fahrzeug- & Schilderpaket", status: "geplant", description: "3 Fahrzeuge + 5 Praxisschilder.", createdAt: now },
      { id: "p3", customerId: "c4", name: "Schaufensterfolie Filiale Mitte", status: "geplant", description: "Milchglasfolie + Logo.", createdAt: now },
      { id: "p4", customerId: "c5", name: "Logo & Corporate Design", status: "fertig", description: "Logo, Visitenkarten, Briefpapier.", createdAt: now },
    ],
    deals: [
      { id: "d1", customerId: "c3", title: "Autofolierung Komplettflotte", stage: "angebot", value: 5200, person: "robert", createdAt: now, probability: 70, expectedCloseDate: rel(10), stageChangedAt: rel(-9) },
      { id: "d2", customerId: "c4", title: "Schaufenster + Landingpage", stage: "kontakt", value: 2800, person: "martin", createdAt: now, stageChangedAt: rel(-2) },
      { id: "d3", customerId: "c1", title: "Flottenbeschriftung 2026", stage: "gewonnen", value: 8600, person: "robert", createdAt: now },
      { id: "d4", customerId: "c2", title: "Fahrzeug- & Schilderpaket", stage: "angebot", value: 3400, person: "bastian", createdAt: now },
      { id: "d5", customerId: "c5", title: "Erweiterung Geschäftsausstattung", stage: "lead", value: 1500, person: "martin", createdAt: now },
      { id: "d6", customerId: "c2", title: "Jahres-Wartung Beschriftung", stage: "lead", value: 900, person: "robert", createdAt: now },
    ],
    quotes: [
      {
        id: "q1", number: `${yr}-014`, customerId: "c3", status: "gesendet", validUntil: rel(14), person: "robert", createdAt: now,
        notes: "Preise gültig 14 Tage. Montage inklusive.",
        items: [
          { id: "qi1", description: "Vollfolierung Transporter (Komplettflotte)", qty: 5, unit: "Stk", price: 850, taxRate: 19 },
          { id: "qi2", description: "Designanpassung & Reinzeichnung", qty: 4, unit: "Std", price: 75, taxRate: 19 },
        ],
      },
      {
        id: "q2", number: `${yr}-015`, customerId: "c4", status: "entwurf", validUntil: rel(21), person: "martin", createdAt: now,
        items: [
          { id: "qi3", description: "Schaufensterfolie Milchglas inkl. Logo", qty: 6, unit: "m²", price: 45, taxRate: 19 },
          { id: "qi4", description: "Landingpage-Relaunch (Pauschale)", qty: 1, unit: "pausch.", price: 1800, taxRate: 19 },
        ],
      },
    ],
    invoices: [
      {
        id: "in1", number: `${yr}-041`, customerId: "c1", status: "gesendet", issueDate: rel(-3), serviceDate: rel(-5), dueDate: rel(11), person: "robert", createdAt: now,
        items: [
          { id: "ii1", description: "Flottenbeschriftung – 1. Charge (6 Fahrzeuge)", qty: 6, unit: "Stk", price: 720, taxRate: 19 },
        ],
      },
      {
        id: "in2", number: `${yr}-040`, customerId: "c2", status: "bezahlt", issueDate: rel(-20), serviceDate: rel(-22), dueDate: rel(-6), person: "bastian", createdAt: now,
        items: [
          { id: "ii2", description: "Fahrzeugbeschriftung Pflegedienst", qty: 3, unit: "Stk", price: 480, taxRate: 19 },
          { id: "ii3", description: "Praxisschild Alu-Dibond", qty: 2, unit: "Stk", price: 95, taxRate: 19 },
        ],
      },
      {
        id: "in3", number: `${yr}-039`, customerId: "c5", status: "ueberfaellig", issueDate: rel(-34), serviceDate: rel(-36), dueDate: rel(-6), person: "martin", createdAt: now,
        items: [
          { id: "ii4", description: "Logo & Corporate Design (Pauschale)", qty: 1, unit: "pausch.", price: 1600, taxRate: 19 },
        ],
      },
    ],
    transactions: [
      // Aktuelle Woche / letzte 14 Tage (für Tages- & Wochenansicht des Verlaufs)
      { id: "tx1", type: "income", category: "Web", amount: 2100, taxRate: 19, date: rel(-2) },
      { id: "tx2", type: "expense", category: "Software", amount: 89, taxRate: 19, date: rel(-3), note: "Design-Tools Abo" },
      { id: "tx3", type: "expense", category: "Material", amount: 1240, taxRate: 19, date: rel(-4), note: "Folien & Laminat" },
      { id: "tx4", type: "expense", category: "Miete", amount: 1850, taxRate: 0, date: rel(-5), note: "Werkstatt & Büro" },
      { id: "tx5", type: "income", category: "Beschriftung", amount: 1713.6, taxRate: 19, date: rel(-6), customerId: "c2", invoiceId: "in2", note: "Rechnung 040 bezahlt" },
      { id: "tx6", type: "expense", category: "Material", amount: 540, taxRate: 19, date: rel(-8), note: "Plottfolie" },
      { id: "tx7", type: "income", category: "Druck", amount: 640, taxRate: 19, date: rel(-9) },
      { id: "tx8", type: "income", category: "Folierung", amount: 4200, taxRate: 19, date: rel(-12), customerId: "c1" },
      { id: "tx9", type: "expense", category: "Fahrzeuge", amount: 420, taxRate: 19, date: rel(-15), note: "Leasing Transporter" },
      { id: "tx10", type: "expense", category: "Marketing", amount: 300, taxRate: 19, date: rel(-18), note: "Social Ads" },
      { id: "tx11", type: "income", category: "Beschriftung", amount: 980, taxRate: 19, date: rel(-20) },
      { id: "tx12", type: "income", category: "Design", amount: 1450, taxRate: 19, date: rel(-27) },
      // Vormonat
      { id: "tx13", type: "expense", category: "Material", amount: 920, taxRate: 19, date: rel(-30), note: "Tinte & Substrate" },
      { id: "tx14", type: "expense", category: "Software", amount: 89, taxRate: 19, date: rel(-33) },
      { id: "tx15", type: "expense", category: "Miete", amount: 1850, taxRate: 0, date: rel(-35) },
      { id: "tx16", type: "income", category: "Folierung", amount: 3200, taxRate: 19, date: rel(-38) },
      { id: "tx17", type: "income", category: "Druck", amount: 520, taxRate: 19, date: rel(-44) },
      { id: "tx18", type: "expense", category: "Fahrzeuge", amount: 420, taxRate: 19, date: rel(-45) },
      { id: "tx19", type: "expense", category: "Material", amount: 1380, taxRate: 19, date: rel(-48) },
      { id: "tx20", type: "income", category: "Web", amount: 1800, taxRate: 19, date: rel(-52) },
      // vor 3 Monaten
      { id: "tx21", type: "expense", category: "Marketing", amount: 450, taxRate: 19, date: rel(-58) },
      { id: "tx22", type: "income", category: "Beschriftung", amount: 2240, taxRate: 19, date: rel(-61) },
      { id: "tx23", type: "expense", category: "Software", amount: 89, taxRate: 19, date: rel(-63) },
      { id: "tx24", type: "expense", category: "Miete", amount: 1850, taxRate: 0, date: rel(-66) },
      { id: "tx25", type: "income", category: "Wartung", amount: 360, taxRate: 19, date: rel(-70) },
      { id: "tx26", type: "expense", category: "Fahrzeuge", amount: 420, taxRate: 19, date: rel(-75) },
      { id: "tx27", type: "expense", category: "Material", amount: 760, taxRate: 19, date: rel(-80) },
      { id: "tx28", type: "income", category: "Folierung", amount: 5100, taxRate: 19, date: rel(-83) },
      // vor 4 Monaten
      { id: "tx29", type: "expense", category: "Software", amount: 89, taxRate: 19, date: rel(-93) },
      { id: "tx30", type: "income", category: "Design", amount: 1290, taxRate: 19, date: rel(-96) },
      { id: "tx31", type: "expense", category: "Miete", amount: 1850, taxRate: 0, date: rel(-96) },
      { id: "tx32", type: "income", category: "Druck", amount: 870, taxRate: 19, date: rel(-104) },
      { id: "tx33", type: "expense", category: "Fahrzeuge", amount: 420, taxRate: 19, date: rel(-105) },
      { id: "tx34", type: "expense", category: "Steuern", amount: 2100, taxRate: 0, date: rel(-110), note: "USt-Vorauszahlung" },
      // vor 5–6 Monaten
      { id: "tx35", type: "income", category: "Beschriftung", amount: 1560, taxRate: 19, date: rel(-118) },
      { id: "tx36", type: "expense", category: "Software", amount: 89, taxRate: 19, date: rel(-123) },
      { id: "tx37", type: "expense", category: "Miete", amount: 1850, taxRate: 0, date: rel(-127) },
      { id: "tx38", type: "income", category: "Web", amount: 2600, taxRate: 19, date: rel(-131) },
      { id: "tx39", type: "expense", category: "Material", amount: 1100, taxRate: 19, date: rel(-140) },
      { id: "tx40", type: "income", category: "Folierung", amount: 3850, taxRate: 19, date: rel(-145) },
      { id: "tx41", type: "expense", category: "Miete", amount: 1850, taxRate: 0, date: rel(-158) },
      { id: "tx42", type: "income", category: "Design", amount: 1120, taxRate: 19, date: rel(-160) },

      // ----- Private Buchungen (pro Person, getrennt von der Firma) -----
      { id: "ptx1", type: "income", category: "Gehalt", amount: 2800, taxRate: 0, date: rel(-4), scope: "private", person: "robert" },
      { id: "ptx2", type: "expense", category: "Wohnen", amount: 950, taxRate: 0, date: rel(-4), scope: "private", person: "robert", note: "Miete Wohnung" },
      { id: "ptx3", type: "expense", category: "Kredit/Rate", amount: 280, taxRate: 0, date: rel(-6), scope: "private", person: "robert", note: "Autokredit Rate" },
      { id: "ptx4", type: "expense", category: "Lebensmittel", amount: 320, taxRate: 0, date: rel(-7), scope: "private", person: "robert" },
      { id: "ptx5", type: "expense", category: "Mobilität", amount: 140, taxRate: 0, date: rel(-12), scope: "private", person: "robert" },
      { id: "ptx6", type: "expense", category: "Abos", amount: 35, taxRate: 0, date: rel(-20), scope: "private", person: "robert" },
      { id: "ptx7", type: "income", category: "Gehalt", amount: 2800, taxRate: 0, date: rel(-34), scope: "private", person: "robert" },
      { id: "ptx8", type: "expense", category: "Wohnen", amount: 950, taxRate: 0, date: rel(-34), scope: "private", person: "robert" },
      { id: "ptx9", type: "income", category: "Gehalt", amount: 2600, taxRate: 0, date: rel(-5), scope: "private", person: "bastian" },
      { id: "ptx10", type: "expense", category: "Wohnen", amount: 780, taxRate: 0, date: rel(-5), scope: "private", person: "bastian" },
      { id: "ptx11", type: "expense", category: "Freizeit", amount: 160, taxRate: 0, date: rel(-9), scope: "private", person: "bastian" },
      { id: "ptx12", type: "income", category: "Gehalt", amount: 2500, taxRate: 0, date: rel(-3), scope: "private", person: "martin" },
      { id: "ptx13", type: "expense", category: "Wohnen", amount: 1100, taxRate: 0, date: rel(-3), scope: "private", person: "martin" },
      { id: "ptx14", type: "expense", category: "Versicherung", amount: 210, taxRate: 0, date: rel(-10), scope: "private", person: "martin" },
    ],
    debts: [
      { id: "d1", person: "robert", title: "Autokredit Sparkasse", total: 18000, paid: 11200, monthlyRate: 280, note: "Transporter (privat)", createdAt: now,
        payments: [{ date: rel(-150), amount: 280 }, { date: rel(-120), amount: 280 }, { date: rel(-90), amount: 280 }, { date: rel(-60), amount: 280 }, { date: rel(-30), amount: 280 }, { date: rel(-2), amount: 280 }] },
      { id: "d2", person: "robert", title: "Privatdarlehen Eltern", total: 5000, paid: 3500, createdAt: now,
        payments: [{ date: rel(-140), amount: 500 }, { date: rel(-80), amount: 500 }, { date: rel(-20), amount: 500 }] },
      { id: "d3", person: "bastian", title: "Ratenkauf Werkzeug", total: 2400, paid: 900, monthlyRate: 150, createdAt: now,
        payments: [{ date: rel(-100), amount: 150 }, { date: rel(-70), amount: 150 }, { date: rel(-40), amount: 150 }, { date: rel(-10), amount: 150 }] },
      { id: "d4", person: "martin", title: "Studienkredit KfW", total: 9000, paid: 2000, monthlyRate: 120, createdAt: now,
        payments: [{ date: rel(-120), amount: 120 }, { date: rel(-90), amount: 120 }, { date: rel(-60), amount: 120 }, { date: rel(-30), amount: 120 }] },
    ],
    templates: [
      { id: "tpl1", kind: "quote", name: "Autofolierung Komplett", items: [{ description: "Vollfolierung PKW inkl. Verlegung", qty: 1, unit: "Stk", price: 1490, taxRate: 19 }] },
      { id: "tpl2", kind: "quote", name: "Logo bekleben (Fahrzeug)", items: [{ description: "Fahrzeuglogo Plot inkl. Montage", qty: 2, unit: "Stk", price: 65, taxRate: 19 }] },
      { id: "tpl3", kind: "invoice", name: "T-Shirt-Druck", items: [{ description: "Textildruck Siebdruck 1-farbig", qty: 25, unit: "Stk", price: 8.5, taxRate: 19 }] },
      { id: "tpl4", kind: "invoice", name: "Stundenlohn Werkstatt", items: [{ description: "Arbeitsstunde Werbetechnik", qty: 1, unit: "Std", price: 65, taxRate: 19 }] },
    ],
    company: {
      name: "Vitamin B – Werbetechnik & Design",
      owner: "Robert Bauer",
      address: "Industriestraße 12, 74196 Neuenstadt am Kocher",
      taxId: "DE 312 456 789",
      iban: "DE12 6005 0101 0001 2345 67",
      bic: "SOLADES1HNB",
      bank: "Sparkasse Heilbronn",
      email: "info@vitaminb-design.de",
      phone: "07139 123 456",
      defaultTaxRate: 19,
      paymentTermDays: 14,
      defaultPerson: "robert",
      accent: "#E39832",
    },
    whiteboards: [
      { id: "wb1", name: "Ideen & Brainstorming", createdAt: now },
      { id: "wb2", name: "Messestand-Konzept", person: "robert", createdAt: now },
    ],
    notes: [
      { id: "n1", customerId: "c1", person: "robert", text: "Anruf: Freigabe für 6 weitere Fahrzeuge erteilt.", createdAt: rel(-9) },
      { id: "n2", customerId: "c1", person: "robert", text: "Termin vor Ort vereinbart, Montage nächste Woche.", createdAt: rel(-2) },
      { id: "n3", dealId: "d1", person: "robert", text: "Angebot verschickt, Rückmeldung bis Ende der Woche zugesagt.", createdAt: rel(-9) },
      { id: "n4", customerId: "c4", person: "martin", text: "Erstgespräch: Wunsch nach hellem, reduziertem Look.", createdAt: rel(-2) },
    ],
    timeEntries: [
      { id: "te1", person: "bastian", taskId: "t3", projectId: "p2", minutes: 60, date: rel(-1), createdAt: now },
      { id: "te2", person: "bastian", taskId: "t3", projectId: "p2", minutes: 35, date: rel(0), createdAt: now },
    ],
  }
}
