// CSV-Export (DE-Excel-Konvention: Semikolon-Trenner, Dezimal-Komma, BOM für Umlaute).

export function deNum(n: number): string {
  return n.toFixed(2).replace(".", ",")
}

export function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v)
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
