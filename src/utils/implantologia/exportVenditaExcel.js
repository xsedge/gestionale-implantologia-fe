import * as XLSX from 'xlsx'

export function exportVenditaExcel(vendita) {
  if (!vendita || typeof vendita !== 'object') {
    throw new Error('Vendita non valida')
  }

  const workbook = XLSX.utils.book_new()
  const overviewSheet = buildOverviewSheet(vendita)
  const detailsSheet = buildDetailsSheet(vendita)

  XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Vendita')
  XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Dettagli')

  const fileName = generateFileName(vendita)
  XLSX.writeFile(workbook, fileName, { compression: true })

  return fileName
}

function buildOverviewSheet(vendita) {
  const rows = [
    ['Numero', vendita.numero || '-'],
    ['Data intervento', formatDate(vendita.dataIntervento)],
    ['Cliente', formatCliente(vendita)],
    ['Medico', vendita.medico || '-'],
    ['Stato pagamento', vendita.statoPagamento || '-'],
    ['Totale', formatCurrency(calcolaTotale(vendita))]
  ]

  if (vendita.note) {
    rows.push(['Note', vendita.note])
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rows)
  worksheet['!cols'] = [{ wch: 22 }, { wch: 60 }]
  return worksheet
}

function buildDetailsSheet(vendita) {
  const dettagli = getDettagli(vendita)
  const header = ['#', 'Prodotto', 'Quantità', 'Prezzo unitario', 'Totale riga', 'Listino', 'Note']
  const rows = [header]

  if (dettagli.length) {
    dettagli.forEach((det, index) => {
      rows.push([
        index + 1,
        det.prodottoNome || det.prodotto?.nome || '-',
        det.quantita ?? '-',
        formatCurrency(prezzoUnitario(det)),
        formatCurrency(calcolaTotaleRiga(det)),
        formatListino(det),
        det.note || ''
      ])
    })

    rows.push(['', '', '', 'Totale vendita', formatCurrency(calcolaTotale(vendita)), '', ''])
  } else {
    rows.push(['', 'Nessun dettaglio disponibile', '', '', '', '', ''])
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rows)
  worksheet['!cols'] = [
    { wch: 4 },
    { wch: 40 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 24 },
    { wch: 30 }
  ]
  return worksheet
}

function getDettagli(vendita) {
  if (Array.isArray(vendita?.dettagli)) {
    return vendita.dettagli
  }
  if (Array.isArray(vendita?.prodotti)) {
    return vendita.prodotti
  }
  return []
}

function formatListino(det) {
  if (det.listinoNome) {
    return det.listinoNome
  }
  if (det.listino?.nome) {
    return det.listino.nome
  }
  if (det.listinoId) {
    return `Listino #${det.listinoId}`
  }
  return '-'
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('it-IT').format(new Date(value))
}

function formatCurrency(value) {
  if (value == null || value === '') return '-'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(value) || 0)
}

function calcolaTotale(vendita) {
  const dettagli = getDettagli(vendita)
  if (!dettagli.length) {
    return Number(vendita?.totale) || 0
  }
  return dettagli.reduce((sum, det) => sum + calcolaTotaleRiga(det), 0)
}

function calcolaTotaleRiga(det) {
  if (!det) {
    return 0
  }
  if (det.totaleRiga != null) {
    return Number(det.totaleRiga) || 0
  }
  const quantita = Number(det.quantita) || 0
  const prezzo = prezzoUnitario(det)
  return prezzo * quantita
}

function prezzoUnitario(det) {
  if (det.prezzoUnitario != null) {
    return Number(det.prezzoUnitario) || 0
  }
  if (det.prezzoApplicato != null) {
    return Number(det.prezzoApplicato) || 0
  }
  if (det.prezzoBase != null) {
    return Number(det.prezzoBase) || 0
  }
  return 0
}

function formatCliente(vendita) {
  if (!vendita) return '-'
  const nominativo = [vendita.clienteDentaleNome, vendita.clienteDentaleCognome].filter(Boolean).join(' ').trim()
  if (nominativo) {
    return nominativo
  }
  return vendita.cliente || '-'
}

function generateFileName(vendita) {
  const numero = vendita.numero ? sanitizeFileName(vendita.numero) : ''
  const data = formatDateForFilename(vendita.dataIntervento)
  const cliente = sanitizeFileName(formatCliente(vendita))

  const parts = ['Vendita']
  if (numero) {
    parts.push(numero)
  } else if (data) {
    parts.push(data)
  }
  if (cliente) {
    parts.push(cliente)
  }

  return `${parts.filter(Boolean).join('_') || 'Vendita'}.xlsx`
}

function formatDateForFilename(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

function sanitizeFileName(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60)
}
