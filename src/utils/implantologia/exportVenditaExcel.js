import * as XLSX from 'xlsx'

export function exportVenditaExcel(vendita) {
  if (!vendita || typeof vendita !== 'object') {
    throw new Error('Vendita non valida')
  }

  const workbook = XLSX.utils.book_new()
  const commissionSheet = buildCommissionSheet(vendita)
  const rawDetailsSheet = buildDetailsSheet(vendita)

  XLSX.utils.book_append_sheet(workbook, commissionSheet, 'Copia Commissione')
  XLSX.utils.book_append_sheet(workbook, rawDetailsSheet, 'Dettagli')

  const fileName = generateFileName(vendita)
  XLSX.writeFile(workbook, fileName, { compression: true })

  return fileName
}

function buildCommissionSheet(vendita) {
  const columnCount = 8
  const worksheet = XLSX.utils.aoa_to_sheet([])
  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 28 },
    { wch: 4 },
    { wch: 18 },
    { wch: 28 },
    { wch: 4 },
    { wch: 18 },
    { wch: 28 }
  ]

  const merges = []
  let row = 0

  function encode(rowIndex, colIndex) {
    return XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })
  }

  function ensureCell(rowIndex, colIndex) {
    const address = encode(rowIndex, colIndex)
    if (!worksheet[address]) {
      worksheet[address] = { t: 's', v: '' }
    }
    return worksheet[address]
  }

  function applyStyle(rowIndex, colIndex, style) {
    const cell = ensureCell(rowIndex, colIndex)
    cell.s = { ...(cell.s || {}), ...style }
  }

  function mergeRange(startRow, startCol, endRow, endCol) {
    merges.push({ s: { r: startRow, c: startCol }, e: { r: endRow, c: endCol } })
  }

  function addRow(values, startCol = 0) {
    XLSX.utils.sheet_add_aoa(worksheet, [values], { origin: encode(row, startCol) })
    row += 1
  }

  function addEmptyRow() {
    row += 1
  }

  function addTitle(title) {
    addRow([title])
    mergeRange(row - 1, 0, row - 1, columnCount - 1)
    applyStyle(row - 1, 0, {
      font: { bold: true, sz: 16 },
      alignment: { horizontal: 'center' }
    })
  }

  function addSectionTitle(title) {
    addRow([title])
    mergeRange(row - 1, 0, row - 1, columnCount - 1)
    applyStyle(row - 1, 0, {
      font: { bold: true, sz: 12 },
      alignment: { horizontal: 'left' }
    })
  }

  function addKeyValueRow(labelLeft, valueLeft, labelCenter = '', valueCenter = '', labelRight = '', valueRight = '') {
    const values = [
      labelLeft || '',
      valueLeft || '',
      '',
      labelCenter || '',
      valueCenter || '',
      '',
      labelRight || '',
      valueRight || ''
    ]
    addRow(values)
    if (labelLeft) {
      applyStyle(row - 1, 0, { font: { bold: true } })
    }
    if (labelCenter) {
      applyStyle(row - 1, 3, { font: { bold: true } })
    }
    if (labelRight) {
      applyStyle(row - 1, 6, { font: { bold: true } })
    }
  }

  function addBlock(label, value) {
    addRow([label || '', value || ''])
    mergeRange(row - 1, 1, row - 1, columnCount - 1)
    applyStyle(row - 1, 0, { font: { bold: true } })
    applyStyle(row - 1, 1, { alignment: { wrapText: true } })
  }

  function addDetailHeader(values) {
    addRow(values)
    values.forEach((_, index) => {
      applyStyle(row - 1, index, {
        font: { bold: true },
        alignment: { horizontal: 'center' }
      })
    })
  }

  addTitle('COPIA COMMISSIONE')
  addEmptyRow()

  addSectionTitle('Dati vendita')
  addKeyValueRow('Numero commissione', formatValue(vendita.numero), 'Data intervento', formatDate(vendita.dataIntervento), 'Stato pagamento', formatValue(vendita.statoPagamento))
  addKeyValueRow('Medico', formatValue(vendita.medico), 'Registrata il', formatDateTime(vendita.createdAt || vendita.dataCreazione), 'Ultimo aggiornamento', formatDateTime(vendita.updatedAt || vendita.dataAggiornamento))

  addEmptyRow()

  addSectionTitle('Cliente / Studio')
  addKeyValueRow('Studio dentale', formatValue(getClienteField(vendita, ['clienteDentaleStudio', 'studioDentale'])), 'Referente', formatCliente(vendita), 'Cliente ID', formatValue(getClienteField(vendita, ['clienteDentaleId', 'clienteId'])))
  addKeyValueRow('Telefono', formatValue(getClienteField(vendita, ['clienteDentaleTelefono', 'telefono'])), 'Email', formatValue(getClienteField(vendita, ['clienteDentaleEmail', 'email'])))
  addBlock('Indirizzo', formatValue(getClienteField(vendita, ['clienteDentaleIndirizzo', 'indirizzo'])))

  const noteCliente = getClienteField(vendita, ['clienteDentaleNote', 'noteCliente'])
  if (noteCliente) {
    addBlock('Note cliente', noteCliente)
  }

  addEmptyRow()

  const dettagli = getDettagli(vendita)
  const totaleVendita = calcolaTotale(vendita)
  const totaleQuantita = dettagli.reduce((sum, det) => sum + (Number(det?.quantita) || 0), 0)
  const acconto = getFirstNumber([vendita.acconto, vendita.importoAcconto, vendita.accontoRicevuto, vendita.accontoVersato])
  const saldo = totaleVendita - acconto

  addSectionTitle('Riepilogo economico')
  addKeyValueRow('Nr. prodotti', formatNumber(dettagli.length), 'Quantità complessive', formatNumber(totaleQuantita))
  addKeyValueRow('Totale commissione', formatCurrency(totaleVendita), 'Acconto', acconto ? formatCurrency(acconto) : '-', 'Saldo da saldare', formatCurrency(Math.max(saldo, 0)))

  if (vendita.note) {
    addEmptyRow()
    addSectionTitle('Note interne')
    addBlock('Note', vendita.note)
  }

  if (dettagli.length) {
    addEmptyRow()
    addSectionTitle('Dettaglio commissione')
    addDetailHeader(['Pos', 'Codice', 'Descrizione', 'Listino', 'Quantità', 'Prezzo unitario', 'Totale riga', 'Note'])

    dettagli.forEach((det, index) => {
      addRow([
        formatNumber(index + 1),
        formatValue(det.prodottoCodice || det.prodotto?.codice),
        formatValue(det.prodottoNome || det.prodotto?.nome),
        formatValue(formatListino(det)),
        formatNumber(det.quantita),
        formatCurrency(prezzoUnitario(det)),
        formatCurrency(calcolaTotaleRiga(det)),
        formatValue(det.note)
      ])
      applyStyle(row - 1, 4, { alignment: { horizontal: 'right' } })
      applyStyle(row - 1, 5, { alignment: { horizontal: 'right' } })
      applyStyle(row - 1, 6, { alignment: { horizontal: 'right' } })
    })

    addRow(['', '', '', '', '', 'Totale commissione', formatCurrency(totaleVendita), ''])
    mergeRange(row - 1, 0, row - 1, 4)
    applyStyle(row - 1, 5, { font: { bold: true }, alignment: { horizontal: 'right' } })
    applyStyle(row - 1, 6, { font: { bold: true }, alignment: { horizontal: 'right' } })
  } else {
    addEmptyRow()
    addSectionTitle('Dettaglio commissione')
    addRow(['', 'Nessun dettaglio disponibile'])
    mergeRange(row - 1, 1, row - 1, columnCount - 1)
  }

  worksheet['!merges'] = merges
  return worksheet
}

function buildDetailsSheet(vendita) {
  const worksheet = XLSX.utils.aoa_to_sheet([])
  worksheet['!cols'] = [
    { wch: 24 },
    { wch: 40 },
    { wch: 24 },
    { wch: 40 },
    { wch: 24 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 36 }
  ]

  const merges = []
  let row = 0

  function encode(rowIndex, colIndex) {
    return XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })
  }

  function addRow(values, startCol = 0) {
    XLSX.utils.sheet_add_aoa(worksheet, [values], { origin: encode(row, startCol) })
    row += 1
  }

  function addMerge(startRow, startCol, endRow, endCol) {
    merges.push({ s: { r: startRow, c: startCol }, e: { r: endRow, c: endCol } })
  }

  function applyStyle(rowIndex, colIndex, style) {
    const address = encode(rowIndex, colIndex)
    const cell = worksheet[address]
    if (cell) {
      cell.s = { ...(cell.s || {}), ...style }
    }
  }

  addRow(['Campo', 'Valore'])
  applyStyle(row - 1, 0, { font: { bold: true } })
  applyStyle(row - 1, 1, { font: { bold: true } })

  const infoRows = [
    ['ID vendita', formatValue(vendita.id)],
    ['Numero', formatValue(vendita.numero)],
    ['Data intervento', formatDate(vendita.dataIntervento)],
    ['Medico', formatValue(vendita.medico)],
    ['Stato pagamento', formatValue(vendita.statoPagamento)],
    ['Totale registrato', formatCurrency(vendita.totale)],
    ['Totale calcolato', formatCurrency(calcolaTotale(vendita))],
    ['Cliente ID', formatValue(getClienteField(vendita, ['clienteDentaleId', 'clienteId']))],
    ['Cliente', formatCliente(vendita)],
    ['Studio dentale', formatValue(getClienteField(vendita, ['clienteDentaleStudio', 'studioDentale']))],
    ['Telefono', formatValue(getClienteField(vendita, ['clienteDentaleTelefono', 'telefono']))],
    ['Email', formatValue(getClienteField(vendita, ['clienteDentaleEmail', 'email']))],
    ['Indirizzo', formatValue(getClienteField(vendita, ['clienteDentaleIndirizzo', 'indirizzo']))],
    ['Note', formatValue(vendita.note)],
    ['Creato il', formatDateTime(vendita.createdAt || vendita.dataCreazione)],
    ['Aggiornato il', formatDateTime(vendita.updatedAt || vendita.dataAggiornamento)]
  ]

  infoRows.forEach(rowValues => addRow(rowValues))

  row += 1

  const dettagli = getDettagli(vendita)
  const totaleQuantita = dettagli.reduce((sum, det) => sum + (Number(det?.quantita) || 0), 0)
  const totaleVendita = calcolaTotale(vendita)

  addRow(['Dettagli righe'])
  addMerge(row - 1, 0, row - 1, 8)
  applyStyle(row - 1, 0, { font: { bold: true } })

  addRow(['Riga', 'Prodotto ID', 'Codice', 'Descrizione', 'Listino', 'Quantità', 'Prezzo unitario', 'Totale riga', 'Note'])
  for (let col = 0; col < 9; col += 1) {
    applyStyle(row - 1, col, { font: { bold: true } })
  }

  if (dettagli.length) {
    dettagli.forEach((det, index) => {
      addRow([
        formatNumber(det.id ?? index + 1),
        formatValue(det.prodottoId || det.prodotto?.id),
        formatValue(det.prodottoCodice || det.prodotto?.codice),
        formatValue(det.prodottoNome || det.prodotto?.nome),
        formatValue(formatListino(det)),
        formatNumber(det.quantita),
        formatCurrency(prezzoUnitario(det)),
        formatCurrency(calcolaTotaleRiga(det)),
        formatValue(det.note)
      ])
      applyStyle(row - 1, 5, { alignment: { horizontal: 'right' } })
      applyStyle(row - 1, 6, { alignment: { horizontal: 'right' } })
      applyStyle(row - 1, 7, { alignment: { horizontal: 'right' } })
    })

    addRow(['', '', '', '', 'Totale', 'Quantità complessive', formatNumber(totaleQuantita), 'Totale commissione', formatCurrency(totaleVendita)])
    addMerge(row - 1, 0, row - 1, 4)
    applyStyle(row - 1, 5, { font: { bold: true } })
    applyStyle(row - 1, 6, { font: { bold: true }, alignment: { horizontal: 'right' } })
    applyStyle(row - 1, 7, { font: { bold: true } })
    applyStyle(row - 1, 8, { font: { bold: true }, alignment: { horizontal: 'right' } })
  } else {
    addRow(['', '', '', 'Nessun dettaglio disponibile'])
    addMerge(row - 1, 3, row - 1, 8)
  }

  worksheet['!merges'] = merges
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
  if (!det) {
    return '-'
  }
  if (det.listinoNome) {
    return det.listinoNome
  }
  if (det.listino?.nome) {
    return det.listino.nome
  }
  if (det.listinoLabel) {
    return det.listinoLabel
  }
  if (det.listinoId) {
    return `Listino #${det.listinoId}`
  }
  return '-'
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  return new Intl.DateTimeFormat('it-IT').format(date)
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

function formatCurrency(value) {
  if (value == null || value === '') return '-'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(value) || 0)
}

function formatNumber(value) {
  if (value == null || value === '') return '-'
  const number = Number(value)
  if (Number.isNaN(number)) {
    return String(value)
  }
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: Number.isInteger(number) ? 0 : 2,
    maximumFractionDigits: 2
  }).format(number)
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
  if (!det) {
    return 0
  }
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
  const nominativo = [
    vendita.clienteDentaleNome,
    vendita.clienteDentaleCognome
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
  if (nominativo) {
    return nominativo
  }
  if (vendita.cliente) {
    return vendita.cliente
  }
  if (vendita.clienteDentale?.nome || vendita.clienteDentale?.cognome) {
    return [vendita.clienteDentale?.nome, vendita.clienteDentale?.cognome].filter(Boolean).join(' ').trim() || '-'
  }
  return '-'
}

function getClienteField(vendita, keys = []) {
  const sources = [vendita, vendita?.clienteDentale, vendita?.cliente]
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue
    for (const key of keys) {
      if (source[key] != null && source[key] !== '') {
        return source[key]
      }
    }
  }
  return ''
}

function formatValue(value) {
  if (value == null || value === '') {
    return '-'
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number') {
    return new Intl.NumberFormat('it-IT').format(value)
  }
  return String(value)
}

function getFirstNumber(values = []) {
  for (const value of values) {
    if (value != null && value !== '') {
      const number = Number(value)
      if (!Number.isNaN(number)) {
        return number
      }
    }
  }
  return 0
}

function generateFileName(vendita) {
  const numero = vendita.numero ? sanitizeFileName(vendita.numero) : ''
  const data = formatDateForFilename(vendita.dataIntervento)
  const cliente = sanitizeFileName(formatCliente(vendita))

  const parts = ['CopiaCommissione']
  if (numero) {
    parts.push(numero)
  } else if (data) {
    parts.push(data)
  }
  if (cliente) {
    parts.push(cliente)
  }

  return `${parts.filter(Boolean).join('_') || 'CopiaCommissione'}.xlsx`
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
