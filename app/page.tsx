"use client"

import { useState } from 'react'

export default function Page() {
  const [date, setDate] = useState<string>('')
  const [gospelRef, setGospelRef] = useState<string>('')
  const [passageText, setPassageText] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string>('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult('')

    if (!date || !gospelRef) {
      setError('Uzupełnij datę i sigla biblijne (np. "J 2,1-12").')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Dla zgodności wysyłamy zarówno sigla, jak i gospelRef
        body: JSON.stringify({ date, sigla: gospelRef, gospelRef, passageText: passageText || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Błąd generowania')
      setResult(data.text as string)
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd.')
    } finally {
      setLoading(false)
    }
  }

  // Proste i bezpieczne renderowanie pogrubień **tekst** -> <strong>tekst</strong>
  // kursywy *tekst* lub _tekst_ -> <em>tekst</em>
  // oraz nagłówków markdown #, ##, ### -> <h1>, <h2>, <h3>
  function renderBoldHtml(text: string) {
    const escape = (s: string) =>
      s
        .replaceAll(/&/g, '&amp;')
        .replaceAll(/</g, '&lt;')
        .replaceAll(/>/g, '&gt;')
        .replaceAll(/"/g, '&quot;')
        .replaceAll(/'/g, '&#39;')
    let escaped = escape(text)
    // Nagłówki markdown: #, ##, ###, ####, #####
    // Zamień na <h1>-<h5> (na początku linii, do końca linii)
    escaped = escaped.replace(/^######\s*(.+)$/gm, '<h6>$1</h6>')
    escaped = escaped.replace(/^#####\s*(.+)$/gm, '<h5>$1</h5>')
    escaped = escaped.replace(/^####\s*(.+)$/gm, '<h4>$1</h4>')
    escaped = escaped.replace(/^###\s*(.+)$/gm, '<h3>$1</h3>')
    escaped = escaped.replace(/^##\s*(.+)$/gm, '<h2>$1</h2>')
    escaped = escaped.replace(/^#\s*(.+)$/gm, '<h1>$1</h1>')
    // Zamień **...** na <strong>...</strong> (nieskokowe, zachłanne minimalnie)
    let withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Zamień _..._ na <em>...</em>
    let withItalicUnderscore = withBold.replace(/(^|[^_])_([^_]+)_/g, '$1<em>$2</em>')
    // Zamień *...* na <em>...</em> (unikać **...** już zamienionego na <strong>)
    let withItalic = withItalicUnderscore.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
    // Zachowaj nowelines
    return withItalic
  }

  const formattedResult = result ? renderBoldHtml(result) : ''

  function copyToClipboard() {
    if (!result) return
    navigator.clipboard.writeText(result)
  }

  function downloadTxt() {
    if (!result) return
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `apel-${date || 'bez-daty'}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function downloadDocx() {
    if (!formattedResult) return
    const { Document, Packer, Paragraph, TextRun } = await import("docx")
    // Remove HTML tags for plain text export, or parse as needed
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = formattedResult
    // Convert <strong> and <em> to TextRun with bold/italic
    function parseNode(node: Node): import("docx").TextRun[] {
      if (node.nodeType === Node.TEXT_NODE) {
        return [new TextRun({ text: node.textContent || "" })]
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        if (el.tagName === "STRONG") {
          return [new TextRun({ text: el.textContent || "", bold: true })]
        }
        if (el.tagName === "EM") {
          return [new TextRun({ text: el.textContent || "", italics: true })]
        }
        if (el.tagName === "BR") {
          return [new TextRun({ text: "\n" })]
        }
        // For other elements, recursively parse children
        let runs: import("docx").TextRun[] = []
        el.childNodes.forEach((child: ChildNode) => {
          runs = runs.concat(parseNode(child))
        })
        return runs
      }
      return []
    }
    // Split by <div> or <p> for paragraphs
    const paragraphs: import("docx").Paragraph[] = []
    tempDiv.childNodes.forEach((node: ChildNode) => {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        ((node as HTMLElement).tagName === "DIV" || (node as HTMLElement).tagName === "P")
      ) {
        paragraphs.push(new Paragraph({ children: parseNode(node) }))
      } else {
        paragraphs.push(new Paragraph({ children: parseNode(node) }))
      }
    })
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    })
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `apel-${date || 'bez-daty'}.docx`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function downloadPdf() {
    if (!formattedResult) return
    const { default: html2canvas } = await import('html2canvas')
    const { default: jsPDF } = await import('jspdf')

    // Zbuduj tymczasowy kontener z czarnym tekstem na białym tle
    const temp = document.createElement('div')
    temp.style.position = 'fixed'
    temp.style.left = '-10000px'
    temp.style.top = '0'
    temp.style.width = '794px' // ~A4 width @96dpi
    temp.style.background = '#ffffff'
    temp.style.color = '#000000'
    temp.style.padding = '40px'
    temp.style.fontFamily = 'Calibri, Arial, Helvetica, sans-serif'
    temp.style.fontSize = '12pt'
    temp.style.lineHeight = '1.5'
    temp.innerHTML = `<div style="white-space:pre-wrap;">${formattedResult}</div>`
    document.body.appendChild(temp)

    const canvas = await html2canvas(temp, { scale: 2, backgroundColor: '#ffffff' })
    document.body.removeChild(temp)

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'pt', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 40
    const maxWidth = pageWidth - margin * 2
    const maxHeight = pageHeight - margin * 2
    const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height)
    const imgWidth = canvas.width * ratio
    const imgHeight = canvas.height * ratio
    const x = (pageWidth - imgWidth) / 2
    const y = (pageHeight - imgHeight) / 2
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)
    pdf.save(`apel-${date || 'bez-daty'}.pdf`)
  }

  return (
    <div className="space-y-6">
      <header className="text-center space-y-3">
        <h1>AE Gen – Generator Apelu Ewangelicznego</h1>
        <p className="muted max-w-2xl mx-auto">
          Wpisz datę oraz sigla biblijne (np. &quot;J 2,1-12&quot;). Opcjonalnie dodaj krótki fragment
          tekstu. Otrzymasz kompletny apel gotowy do wykorzystania na zbiórce.
        </p>
      </header>

      <section className="card">
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block mb-1">Data</label>
              <input
                id="date"
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="gospelRef" className="block mb-1">Sigla biblijne</label>
              <input
                id="gospelRef"
                type="text"
                className="input"
                placeholder="np. J 2,1-12"
                value={gospelRef}
                onChange={(e) => setGospelRef(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="passage" className="block mb-1">Opcjonalnie: fragment treści</label>
            <textarea
              id="passage"
              className="input min-h-[120px]"
              placeholder="Wklej krótki fragment Ewangelii (jeśli chcesz)"
              value={passageText}
              onChange={(e) => setPassageText(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/15 text-red-200 ring-1 ring-red-500/30 px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Generowanie…' : 'Generuj apel'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => { setResult(''); setError(''); }} disabled={loading}>
              Wyczyść
            </button>
          </div>
        </form>
      </section>

      {result && (
        <section className="card space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="group relative inline-flex items-center gap-2">
              <h2>Wynik</h2>
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 text-amber-300/90 cursor-help"
                  aria-hidden
                >
                  <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.6c.75 1.336-.213 3.001-1.742 3.001H3.48c-1.53 0-2.492-1.665-1.742-3.001l6.519-11.6zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-.25-6.75a.75.75 0 10-1.5 0v.5c0 .414.336.75.75.75h.004a1.496 1.496 0 01.004 2.992h-.004a.75.75 0 100 1.5h.004A2.996 2.996 0 0012.5 10.25c0-1.342-.944-2.466-2.25-2.744v-.256z" />
                </svg>
                <div className="pointer-events-none absolute left-1/2 z-20 hidden w-72 -translate-x-1/2 -translate-y-2 transform whitespace-normal rounded-xl bg-amber-600/95 p-3 text-sm text-slate-50 ring-1 ring-amber-400/60 shadow-2xl backdrop-blur-sm group-hover:block">
                  Tekst został wygenerowany przez AI. Zweryfikuj treść, cytaty i wnioski, zachowując wierność nauczaniu Kościoła. Osoba przekazująca apel harcerzom ponosi odpowiedzialność za ostateczny dobór i brzmienie apelu.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary" onClick={copyToClipboard}>Kopiuj</button>
              <button className="btn-secondary" onClick={downloadTxt}>Pobierz .txt</button>
              <button className="btn-secondary" onClick={downloadDocx}>Pobierz .docx</button>
              <button className="btn-secondary" onClick={downloadPdf}>Pobierz .pdf</button>
            </div>
          </div>
          <div
            className="whitespace-pre-wrap text-slate-100 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedResult }}
          />
        </section>
      )}
    </div>
  )
}
