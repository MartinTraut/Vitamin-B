# Design: Ledger-Edit, Running-Balance, Sortierung, Rechnungs-KPIs

Datum: 2026-07-04 · Quelle: offene Punkte aus dem Produkt-Audit (2. Council-Runde), siehe Memory `project-orgdashboard-goal`. Autonomer Loop — Design ohne interaktive Freigabe, Backlog war vom User bestätigt.

## 1. `updateTransaction` + Inline-Edit

- **Store** (`lib/store.tsx`): neue Action `updateTransaction(id, patch: Partial<Omit<Transaction, "id">>)` neben `addTransaction`/`removeTransaction`, gleiches Muster wie `updateDebt`.
- **LedgerTable** (`components/ui/ledger-table.tsx`): `LedgerRowData` bekommt optional `onEdit?: () => void` + `editLabel?: string`. Aktions-Zelle rendert Stift- und Papierkorb-Button nebeneinander (action-reveal wie bisher); letzte Grid-Spalte wird `auto` statt fix `1.75rem`.
- **Views**: `AddTransaction` (Finanzen), `AddExpense` (Ausgaben), `AddPrivateTx` (Privat) werden zu Formularen mit optionalem `initial: Transaction` (Titel/Button-Text wechseln zu „Buchung bearbeiten“/„Speichern“). Ein State `editing: Transaction | null` pro View; Stift setzt ihn, Speichern ruft `updateTransaction(id, patch)` — `scope`/`person` bleiben unangetastet.

## 2. Running-Balance-Spalte (nur Firmen-Buchungen)

- Kumulierter Saldo über **alle** geschäftlichen Buchungen chronologisch (nicht nur die gefilterten) — der Saldo einer Zeile ist damit stabil, egal welcher Filter aktiv ist.
- Berechnung in `finance-view.tsx` (Map id → Saldo), Anzeige über neues optionales Feld `balance?: number` + Prop `withBalance` in `LedgerTable`.
- Eigene Spalte „Saldo“ nur ab `lg` sichtbar (Platz), Stil gedämpft (kein grün/rot — Info, kein Signal), `tabular-nums`.
- Nur sinnvoll bei Datum-Sortierung → bei Betrag-Sortierung ausgeblendet.

## 3. Sortierung Buchungen/Belege

- Belege (/rechnungen, /angebote) haben Sortierung bereits — fehlend in **Buchungen (Finanzen)** und **Belegen (/ausgaben)**.
- Je ein `SegmentedControl` „Datum | Betrag“ in der Filterleiste. Betrag = absteigend.
- Bei Betrag-Sortierung: `groupMonths={false}` (Monatsgruppen wären falsch) und keine Saldo-Spalte.

## 4. KPI-Kopf auf /rechnungen

- Nur `kind === "invoice"` in `DocumentsView`, oberhalb des List/Editor-Layouts, `KpiTile`-Raster wie Finanzen/Ausgaben:
  - **Offen** — Summe brutto, Status `gesendet` + `ueberfaellig` (Hint: Anzahl)
  - **Überfällig** — Status `ueberfaellig` oder `gesendet` mit `dueDate < heute` (Hint: Anzahl)
  - **Bezahlt (Jahr)** — Status `bezahlt`, `issueDate` im laufenden Jahr
  - **Entwürfe** — Anzahl
- Stornierte (`voided`) und Stornorechnungen (`creditNoteFor`) fließen nicht ein.
- KPIs sind teamweit (unabhängig vom „Alle/Meine“-Filter) — konsistent mit „eine Buchhaltung“.

## Nicht in diesem Schritt

- Kein KPI-Kopf auf /angebote (später, gleicher Baustein).
- Keine Schema-/Sync-Änderungen (weiterhin User-Entscheidung).

## Verifikation

- `npx tsc --noEmit` + `npm run build`; manuelle Flow-Prüfung über Dev-Server; /code-review auf den Diff.
