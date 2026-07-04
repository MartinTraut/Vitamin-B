// CSV-Export (DE-Excel-Konvention: Semikolon-Trenner, Dezimal-Komma, BOM für Umlaute).

export function deNum(n: number): string {
  return n.toFixed(2).replace(".", ",")
}

export function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    let s = String(v)
    // Formel-Injection abwehren: "=" und "@" am Anfang immer entschärfen; "+"/"-"
    // nur, wenn danach kein Leerzeichen/keine Ziffer folgt (DDE-Payloads wie
    // "-cmd|..."). Negative deNum-Beträge ("-123,45") und Notizen wie
    // "-10% Rabatt" bleiben so unverändert und in Excel rechenbar/lesbar.
    if (/^[=@]/.test(s) || /^[+\-][^\s\d]/.test(s)) s = "'" + s
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(esc).join(";")).join("\r\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
