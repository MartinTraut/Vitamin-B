# Team-Dashboard online stellen — Schritt für Schritt

Damit Robert, Bastian und Martin dieselben Daten teilen, brauchen wir **Supabase** (Datenbank + Login + Echtzeit) und **Vercel** (Hosting). Beides ist kostenlos. Du musst nur Accounts anlegen und ein paar Werte kopieren — den Code habe ich fertig.

## 1. Supabase-Projekt anlegen (~5 Min)

1. Auf <https://supabase.com> mit GitHub oder E-Mail anmelden.
2. **New Project** → Name z. B. `vitaminb-os`, Region **Frankfurt (eu-central)**, ein Datenbank-Passwort vergeben (irgendeins, brauchst du selten).
3. Warten, bis das Projekt bereit ist (~2 Min).

## 2. Datenbank-Schema einspielen (~1 Min)

1. Im Projekt links auf **SQL Editor** → **New query**.
2. Den kompletten Inhalt von `supabase/schema.sql` (in diesem Repo) hineinkopieren.
3. **Run** klicken. Es sollte „Success" erscheinen.

## 3. Team-Login anlegen (~1 Min)

1. Links auf **Authentication** → **Users** → **Add user** → **Create new user**.
2. E-Mail: `team@vitaminb-os.de` (genau diese, oder eine eigene — dann unten in der Env eintragen).
3. Passwort: **euer gemeinsames Team-Passwort**. „Auto confirm user" anhaken.
4. **Create user**.

## 4. Schlüssel kopieren

Links auf **Project Settings** → **API**. Du brauchst zwei Werte:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. Lokal testen (optional)

1. `.env.local.example` nach `.env.local` kopieren.
2. Die zwei Werte oben eintragen.
3. `npm run dev` → <http://localhost:3030> → es erscheint der Login. Mit dem Team-Passwort anmelden.

## 6. Auf Vercel deployen (~5 Min)

1. Auf <https://vercel.com> mit GitHub anmelden.
2. **Add New… → Project** → das GitHub-Repo dieses Dashboards importieren.
3. Unter **Environment Variables** die drei Werte eintragen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_TEAM_EMAIL` (= `team@vitaminb-os.de`)
4. **Deploy**. Nach ~1 Min bekommst du einen Link (z. B. `vitaminb-os.vercel.app`).

Diesen Link teilst du mit Bastian und Martin. Alle melden sich mit dem Team-Passwort an,
landen auf Robert, und können oben links zwischen den Personen wechseln. Änderungen
erscheinen dank Echtzeit-Sync sofort bei allen.

---

**Ohne Env-Werte** (z. B. lokal ohne `.env.local`) läuft alles wie bisher im
Demo-Modus: kein Login, Daten nur im eigenen Browser.
