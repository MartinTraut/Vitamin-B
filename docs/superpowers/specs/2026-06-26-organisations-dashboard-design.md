# Organisations-Dashboard Vitamin B — Master-Spec

**Datum:** 2026-06-26
**Status:** Design genehmigt, Phasen-Detailspecs folgen je Phase
**Quelle der Wahrheit für Anmutung:** `Vitamin-B/app/globals.css` (Dark, Orange `#E39832`)
**Referenz-Architektur:** `Hospital-Eq/Kalender- Dashboard/` (App-im-Unterordner + Supabase-SSR-Auth + Custom-Kalender) und `Buchaltung-Dynaamiq.AI/` (Business-Module: CRM, Pipeline, Angebote, Rechnungen, Finanzen, Charts)

---

## 1. Ziel & Kontext

Ein All-in-One-Organisations-Dashboard für Vitamin B (Werbetechnik / Beschriftung / Folierung / Druck). Es ersetzt Zettel und Kopf-Gedächtnis durch eine strukturierte, geteilte Oberfläche für das Team (Robert, Bastian, Martin). Inhalte: Aufgaben/To-Dos, Kalender, CRM mit Projekten & Datei-Uploads, Angebote & Rechnungen, Finanzen/Buchhaltung, ein Whiteboard/Mindmap-Modul und eine modul-übergreifende Übersicht.

Es ist **kein** öffentlicher Teil der Marketing-Website, sondern ein geschütztes internes Tool, das deren Designsprache erbt.

## 2. Architektur-Entscheidungen (final)

- **Eigenständige Next.js-App** im Ordner `Vitamin-B/Organisation-Dashboard/` mit eigenem `package.json`, `node_modules`, Build — exakt das Hospital-Eq-Muster. Die Marketing-Site bleibt unberührt und kann weiterhin separat (z.B. STRATO/statisch) deployed werden.
- **Backend: Supabase** (Postgres + Auth + Storage + Realtime), Zugriff via `@supabase/ssr` (Browser- + Server-Client).
- **Deployment:** Vercel, eigene Subdomain (z.B. `app.vitaminb.de` oder `dashboard.vitaminb.de`). Login = Aufruf der Subdomain.
- **Auth-Modell: ein geteiltes Team-Login.** Eine Supabase-Auth-Identität fürs Team. Innerhalb der App schaltet ein **Personen-Switcher** (oben links) zwischen `Robert`, `Bastian`, `Martin` um. Start nach Login immer bei **Robert**.
- **Personen-Zuordnung:** Datensätze tragen ein `person`-Feld (Enum `robert | bastian | martin`), gesetzt aus der aktiven Switcher-Auswahl — nicht aus `auth.users`. So ist sichtbar, wessen Aufgabe/Termin/Eintrag es ist, ohne drei echte Accounts zu verwalten.
- **Geteilte Daten über RLS:** Alle authentifizierten Sessions sehen/bearbeiten alle Zeilen (kein Pro-User-Filter). Filterung nach Person passiert clientseitig über den Switcher.
- **Demo-Fallback:** Fehlen die Supabase-Env-Variablen, läuft die App vollständig aus `localStorage` mit Seed-Daten (zum Bauen & Vorführen, bevor die DB live ist).

## 3. Tech-Stack (Zielbild)

Aus den Referenzprojekten übernommen, damit Patterns konsistent bleiben:

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind v4 (Tokens in `globals.css`, kein Config-File) + shadcn + `class-variance-authority` + `tailwind-merge` + `tw-animate-css`
- **Icons:** `lucide-react`
- **Animation:** `motion` (Framer-Motion-Nachfolger)
- **Charts:** `recharts` (Phase 3/5)
- **Drag & Drop:** `@dnd-kit/*` (Pipeline-Kanban, Task-Boards)
- **Daten/Auth:** `@supabase/ssr`, `@supabase/supabase-js`
- **Utilities:** `date-fns` (DE-Locale), `nanoid`, `zod`, `sonner` (Toasts), `next-themes`
- **Whiteboard (Phase 4):** `tldraw` (Open-Source, Miro/Figma-Lite)

## 4. Designsystem (geerbt von der Marketing-Site)

Die App spiegelt die Tokens aus `Vitamin-B/app/globals.css`:

- Hintergrund `#050505`, Cards `#0d0d0d`, Text `#f5f5f5`
- **Markenorange `#E39832`** (Primary, Accent, Ring, Chart-Serien)
- Border `rgba(255,255,255,0.08)`, Radius-Basis `0.75rem`
- Signature-Effekte: `glow-border`, `hover-glow`, `hover-aura`, `animate-fade-up`, `glow-orange` — werden in die Dashboard-Komponenten übernommen (dezent, performant; auf Mobile/reduced-motion ohne Dauer-Animation)
- Fonts: die `--font-heading` / `--font-sans` der Marketing-Site übernehmen (Heading + Sans, max. 2 Familien)

Anmutung: ruhiges, teures Dark-Cockpit. Orange als gezielter Akzent, nicht flächig. Großzügiger Weißraum, klare Hierarchie, keine Kartenfriedhöfe.

## 5. App-Shell (Phase 0)

- **Sidebar (links):** nach Gruppen sortierte Navigation:
  - *Übersicht* → Dashboard-Home
  - *Organisation* → Aufgaben, Kalender, Whiteboard
  - *Kunden* → CRM, Pipeline
  - *Finanzen* → Angebote, Rechnungen, Ausgaben/Buchhaltung
  - *System* → Einstellungen
  - Aktiver Zustand mit Orange-Akzent + `motion`-Indikator. Auf Desktop einklappbar.
- **Topbar:** Seitentitel + Subtitle (aus TITLES-Map), Schnell-Aktionen (z.B. „Neue Aufgabe", „Neuer Kunde"), Command-Palette-Trigger.
- **Personen-Switcher (oben links):** Avatar/Initialen-Umschalter Robert/Bastian/Martin. Aktive Person liegt in einem React-Context + `localStorage` (`vitaminb-active-person`), Default `robert`. Steuert clientseitige Filter und das `person`-Feld neuer Datensätze.
- **Mobile-Nav:** Bottom-Nav (Icon + Label, sticky, safe-area).
- **Command-Palette (`⌘K`):** Seiten-Navigation + Schnell-Anlegen (aus Dynamiq portiert).

## 6. Datenschicht-Pattern

Nach Dynamiq/Hospital-Vorbild:

- Ein zentraler **Store** (React Context, `"use client"`) hält die Domänendaten und bietet typisierte CRUD-Mutationen (`upsertX`, `removeX`, …).
- **Optimistic Updates:** lokaler State ändert sofort, danach async Supabase-Sync (`upsert`/`delete`).
- **Demo-Fallback:** Bei fehlenden Env-Variablen Persistenz in `localStorage` + Seed-Daten.
- `lib/types.ts` (Domänenmodell + Enum-Labels), `lib/format.ts` (eur(), dateDE(), …), `lib/metrics.ts` (Aggregationen für KPIs/Charts), `lib/supabase/{client,server,env}.ts`.

## 7. Supabase-Schema (Zielbild, alle Module)

RLS auf allen Tabellen: authentifiziert = voller Zugriff (geteilte Team-Daten). `person`-Spalte als Enum `robert|bastian|martin`. Storage-Bucket `files` für CRM-Uploads (Bilder/PDFs). Schema wird je Phase inkrementell angelegt; hier das Gesamtbild:

- `tasks` — id, person, title, notes, status(`todo|doing|done`), priority(`low|normal|high`), list_id(FK), due, created_at
- `task_lists` — id, name, color, position
- `appointments` — id, person, title, category, date, time, recurrence_freq, recurrence_interval, customer_id(FK, optional), location, notes, completed_dates[], created_at (Hospital-Engine, erweitert um `customer_id`)
- `customers` — id, company, contact_name, email, phone, address, source(Herkunft), vat_id, health(`lead|active|churned`), notes
- `deals` — id, customer_id(FK), title, stage, value, probability, person
- `projects` — id, customer_id(FK), name, status, description, created_at
- `project_files` — id, project_id(FK), kind(`image|pdf|file`), storage_path, name, size
- `quotes` — id, number, customer_id(FK), status, items(JSONB), valid_until, person
- `invoices` — id, number, customer_id(FK), status, items(JSONB), issue_date, due_date, person
- `transactions` — id, type(`income|expense`), category, amount, tax_rate, date, customer_id(optional), invoice_id(optional)
- `templates` — id, kind(`quote|invoice`), name, items(JSONB) — inkl. fiktiver Leistungs-Presets (Autofolierung, Logo bekleben, T-Shirt-Druck, Stundenlohn …)
- `whiteboards` — id, person(optional, sonst Team), name, document(JSONB, tldraw-Snapshot), updated_at
- `company_settings` — id(=1), data(JSONB) (Firmendaten, Steuer-ID, Bank, Nummernkreise)
- `activities` — id, person, type, title, meta, at (Activity-Feed)

## 8. Phasen

### Phase 0 — Fundament (detailliert, Teil dieses Specs)
Scaffold der App in `Organisation-Dashboard/`; Designsystem-Port; Supabase-Projekt + `client/server/env`; Login-Seite + `proxy.ts`-Gate; App-Shell (Sidebar/Topbar/Mobile-Nav); Personen-Switcher (Default Robert); Command-Palette-Grundgerüst; Store-Grundgerüst + Demo-Fallback; leere Dashboard-Home.

### Phase 1 — Aufgaben + Kalender (detailliert, Teil dieses Specs)
- **Aufgaben:** Listen (`task_lists`) mit Aufgaben (`tasks`); Anlegen/Bearbeiten/Erledigen; Zuweisung an Person; Priorität; Fälligkeit; Filter nach aktiver Person; optional Drag-&-Drop-Reihenfolge (`@dnd-kit`).
- **Kalender:** Recurrence-Engine aus Hospital portieren (`recurrence.ts`); Monats-Grid + Agenda-Ansicht; Termin-Sheet zum Anlegen/Bearbeiten; Kategorien farbcodiert in Orange-Palette; Termine optional an Kunden gekoppelt (`customer_id`).

### Phase 2 — CRM + Pipeline
Kunden-CRUD (inkl. Herkunft/`source`); Kundendetail mit verknüpften Projekten, Terminen, Angeboten/Rechnungen, Bezahlt-Summe; Projekte mit **Datei-Uploads** (Supabase Storage: Bilder/PDFs/Dateien); Pipeline-Kanban (`@dnd-kit`) über Deal-Stages.

### Phase 3 — Angebote + Rechnungen + Finanzen
Angebots-/Rechnungs-Editor mit Positions-Editor (Menge/Einheit/Preis/Steuersatz); Status-Flows; Angebot→Rechnung konvertieren; printable PDF-Layout (DE, mit Firmenkopf & USt-Aufschlüsselung); Templates mit fiktiven Leistungs-Presets; Ausgaben/Einnahmen-Ledger; Finanz-Charts (`recharts`: Einnahmen/Ausgaben, Kategorien); USt-Übersicht.

### Phase 4 — Whiteboard / Mindmap
`tldraw` einbinden (Freihand, Formen, Text, Verbinder/Pfeile, Sticky-Notes, unendliches Canvas), in Orange gebrandet; je Board ein `whiteboards`-Datensatz mit tldraw-Snapshot (JSONB) in Supabase; Boards anlegen/umbenennen/löschen; persönlich oder Team-geteilt.

### Phase 5 — Übersicht-Politur
Dashboard-Home mit modul-übergreifenden KPIs (offene Aufgaben, anstehende Termine, offene Rechnungen, Pipeline-Wert, Einnahmen/Ausgaben des Monats); Charts; Activity-Feed; alles nach aktiver Person filterbar.

## 9. Nicht-Ziele (YAGNI)

- Kein E-Mail-Versand aus dem Tool (Angebote/Rechnungen werden als PDF erzeugt, nicht versendet) — kann später kommen.
- Keine echte Buchhaltungs-Schnittstelle/DATEV-Export in v1.
- Keine drei separaten Auth-Accounts (bewusst geteiltes Login + Switcher).
- Kein selbstgebautes Canvas/Whiteboard-Engine (tldraw statt Eigenbau).
- Keine Echtzeit-Kollaboration im Whiteboard in v1 (nur Speichern/Laden).

## 10. Tests & Qualität

- Reine Logik (Recurrence-Engine, Rechnungs-/Steuer-Berechnung `computeTotals`, Metrics-Aggregationen) wird unit-getestet — das sind die fehleranfälligen Teile.
- UI primär manuell + visuell geprüft (Premium-Anmutung, Mobile, reduced-motion).
- Qualitätsfilter aus dem Marken-Standard vor jedem Phasen-Abschluss.

## 11. Offene Punkte / TODO

- Supabase-Projekt anlegen (URL + anon key), Env in `Organisation-Dashboard/.env.local`.
- Subdomain/Domain bei Vercel final festlegen (`app.` vs. `dashboard.vitaminb.de`).
- Konkrete fiktive Leistungs-Presets & Preise mit Martin abstimmen (Autofolierung, Logo bekleben, T-Shirt-Druck, Stundenlohn …) — bis dahin Platzhalter.
- Login-Zugangsdaten fürs Team festlegen.
- Markenorange-Abgleich: Code nutzt `#E39832`, frühere Notiz nannte `#f29d20` — `#E39832` aus `globals.css` ist maßgeblich.

---

**Nächster Schritt:** Implementierungsplan für **Phase 0 (Fundament) + Phase 1 (Aufgaben + Kalender)** via writing-plans. Phasen 2–5 bekommen jeweils zu Beginn ihren eigenen Detail-Spec.
