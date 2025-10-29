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
  const columnCount = 12
  const worksheet = XLSX.utils.aoa_to_sheet([])
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 12 },
    { wch: 18 },
    { wch: 14 },
    { wch: 12 },
    { wch: 6 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 }
  ]

  const merges = []
  let row = 0

  const BORDER_THIN = {
    top: { style: 'thin', color: { rgb: '777777' } },
    bottom: { style: 'thin', color: { rgb: '777777' } },
    left: { style: 'thin', color: { rgb: '777777' } },
    right: { style: 'thin', color: { rgb: '777777' } }
  }

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

  function applyRangeStyle(startRow, startCol, endRow, endCol, style) {
    for (let r = startRow; r <= endRow; r += 1) {
      for (let c = startCol; c <= endCol; c += 1) {
        const cell = ensureCell(r, c)
        cell.s = { ...(cell.s || {}), ...style }
      }
    }
  }

  function setValue(rowIndex, colIndex, value, style = {}) {
    const cell = ensureCell(rowIndex, colIndex)
    let cellValue = value
    let cellType = 's'

    if (value == null) {
      cellValue = ''
    } else if (typeof value === 'number') {
      cellType = 'n'
      cellValue = value
    } else {
      cellValue = String(value)
    }

    cell.v = cellValue
    cell.t = cellType
    cell.s = { ...(cell.s || {}), ...style }
  }

  function mergeAndSet(startRow, startCol, endRow, endCol, value, style = {}) {
    if (startRow > endRow || startCol > endCol) return
    setValue(startRow, startCol, value, style)
    applyRangeStyle(startRow, startCol, endRow, endCol, style)
    if (startRow !== endRow || startCol !== endCol) {
      merges.push({ s: { r: startRow, c: startCol }, e: { r: endRow, c: endCol } })
    }
  }

  function setRowHeight(rowIndex, height) {
    if (!height) return
    if (!worksheet['!rows']) {
      worksheet['!rows'] = []
    }
    worksheet['!rows'][rowIndex] = { hpt: height }
  }

  function addEmptyRow(height) {
    setRowHeight(row, height)
    row += 1
  }

  const titleStyle = {
    font: { bold: true, sz: 18, color: { rgb: '1F497D' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  }
  mergeAndSet(row, 0, row, columnCount - 1, 'COPIA COMMISSIONE', titleStyle)
  setRowHeight(row, 26)
  row += 1

  addEmptyRow(6)

  const sectionHeaderStyle = {
    font: { bold: true, color: { rgb: '1F497D' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: BORDER_THIN,
    fill: { fgColor: { rgb: 'E6EEF7' } }
  }
  const labelCellStyle = {
    font: { bold: true, color: { rgb: '333333' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: BORDER_THIN,
    fill: { fgColor: { rgb: 'F7F7F7' } }
  }
  const valueCellStyle = {
    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
    border: BORDER_THIN
  }
  const tableHeaderStyle = {
    font: { bold: true, color: { rgb: '1F497D' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: BORDER_THIN,
    fill: { fgColor: { rgb: 'DBE6F5' } }
  }
  const tableValueStyle = {
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
    border: BORDER_THIN
  }
  const tableValueRightStyle = {
    alignment: { horizontal: 'right', vertical: 'center' },
    border: BORDER_THIN
  }
  const summaryLabelStyle = {
    font: { bold: true },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: BORDER_THIN,
    fill: { fgColor: { rgb: 'F2F2F2' } }
  }
  const summaryValueStyle = {
    font: { bold: true },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: BORDER_THIN
  }
  const signatureLabelStyle = {
    font: { italic: true, color: { rgb: '555555' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: BORDER_THIN,
    fill: { fgColor: { rgb: 'F9F9F9' } }
  }
  const signatureBoxStyle = {
    border: BORDER_THIN
  }

  function addSectionHeader(title) {
    mergeAndSet(row, 0, row, columnCount - 1, title, sectionHeaderStyle)
    setRowHeight(row, 18)
    row += 1
  }

  function addFieldRow(left, right = null) {
    if (left) {
      mergeAndSet(row, 0, row, 1, left.label, labelCellStyle)
      mergeAndSet(row, 2, row, 5, left.value, valueCellStyle)
    } else {
      mergeAndSet(row, 0, row, 5, '', valueCellStyle)
    }

    if (right) {
      mergeAndSet(row, 6, row, 7, right.label, labelCellStyle)
      mergeAndSet(row, 8, row, 11, right.value, valueCellStyle)
    } else {
      mergeAndSet(row, 6, row, 11, '', valueCellStyle)
    }

    setRowHeight(row, 18)
    row += 1
  }

  function addFullWidthField(label, value) {
    mergeAndSet(row, 0, row, 1, label, labelCellStyle)
    mergeAndSet(row, 2, row, columnCount - 1, value, valueCellStyle)
    setRowHeight(row, value && String(value).length > 40 ? 30 : 18)
    row += 1
  }

  function addTableHeader(columns) {
    columns.forEach(column => {
      mergeAndSet(row, column.start, row, column.end, column.label, tableHeaderStyle)
    })
    setRowHeight(row, 20)
    row += 1
  }

  const dettagli = getDettagli(vendita)
  const totaleVendita = calcolaTotale(vendita)
  const totaleQuantita = dettagli.reduce((sum, det) => sum + (Number(det?.quantita) || 0), 0)
  const acconto = getFirstNumber([vendita.acconto, vendita.importoAcconto, vendita.accontoRicevuto, vendita.accontoVersato])
  const saldo = totaleVendita - acconto

  addSectionHeader('DATI COMMISSIONE')
  addFieldRow(
    { label: 'Numero commissione', value: formatValue(vendita.numero) },
    { label: 'Data intervento', value: formatDate(vendita.dataIntervento) }
  )
  addFieldRow(
    { label: 'Medico', value: formatValue(vendita.medico) },
    { label: 'Registrata il', value: formatDateTime(vendita.createdAt || vendita.dataCreazione) }
  )
  addFieldRow(
    { label: 'Stato pagamento', value: formatValue(vendita.statoPagamento) },
    { label: 'Ultimo aggiornamento', value: formatDateTime(vendita.updatedAt || vendita.dataAggiornamento) }
  )

  addSectionHeader('CLIENTE / STUDIO')
  addFieldRow(
    { label: 'Studio dentale', value: formatValue(getClienteField(vendita, ['clienteDentaleStudio', 'studioDentale'])) },
    { label: 'Referente', value: formatCliente(vendita) }
  )
  addFieldRow(
    { label: 'Telefono', value: formatValue(getClienteField(vendita, ['clienteDentaleTelefono', 'telefono'])) },
    { label: 'Email', value: formatValue(getClienteField(vendita, ['clienteDentaleEmail', 'email'])) }
  )
  addFullWidthField('Indirizzo', formatValue(getClienteField(vendita, ['clienteDentaleIndirizzo', 'indirizzo'])))

  const noteCliente = getClienteField(vendita, ['clienteDentaleNote', 'noteCliente'])
  if (noteCliente) {
    addFullWidthField('Note cliente', noteCliente)
  }

  addSectionHeader('RIEPILOGO ECONOMICO')
  addFieldRow(
    { label: 'Totale commissione', value: formatCurrency(totaleVendita) },
    { label: 'Acconto', value: acconto ? formatCurrency(acconto) : '-' }
  )
  addFieldRow(
    { label: 'Saldo da saldare', value: formatCurrency(Math.max(saldo, 0)) },
    { label: 'Nr. prodotti', value: formatNumber(dettagli.length) }
  )
  addFieldRow(
    { label: 'Quantità complessive', value: formatNumber(totaleQuantita) },
    { label: 'Metodo pagamento', value: formatValue(vendita.metodoPagamento || vendita.modalitaPagamento || '-') }
  )

  if (vendita.note) {
    addFullWidthField('Note interne', vendita.note)
  }

  addSectionHeader('DETTAGLIO MATERIALI / PRESTAZIONI')

  const tableColumns = [
    { label: 'N°', start: 0, end: 0, align: tableValueRightStyle },
    { label: 'Codice', start: 1, end: 2 },
    { label: 'Descrizione / Note', start: 3, end: 6 },
    { label: 'Listino', start: 7, end: 7 },
    { label: 'Q.tà', start: 8, end: 8, align: tableValueRightStyle },
    { label: 'Prezzo', start: 9, end: 9, align: tableValueRightStyle },
    { label: 'Importo', start: 10, end: 11, align: tableValueRightStyle }
  ]

  addTableHeader(tableColumns)

  if (dettagli.length) {
    dettagli.forEach((det, index) => {
      const descriptionParts = [
        formatValue(det.prodottoNome || det.prodotto?.nome),
        det.note ? `Note: ${det.note}` : ''
      ].filter(Boolean)

      const rowConfig = [
        { start: 0, end: 0, value: formatNumber(index + 1), style: tableValueRightStyle },
        { start: 1, end: 2, value: formatValue(det.prodottoCodice || det.prodotto?.codice), style: tableValueStyle },
        { start: 3, end: 6, value: descriptionParts.join('\n') || '-', style: tableValueStyle },
        { start: 7, end: 7, value: formatValue(formatListino(det)), style: tableValueStyle },
        { start: 8, end: 8, value: formatNumber(det.quantita), style: tableValueRightStyle },
        { start: 9, end: 9, value: formatCurrency(prezzoUnitario(det)), style: tableValueRightStyle },
        { start: 10, end: 11, value: formatCurrency(calcolaTotaleRiga(det)), style: tableValueRightStyle }
      ]

      rowConfig.forEach(cell => {
        mergeAndSet(row, cell.start, row, cell.end, cell.value, cell.style)
      })
      setRowHeight(row, descriptionParts.length > 1 ? 28 : 18)
      row += 1
    })

    mergeAndSet(row, 0, row, 9, 'Totale commissione', summaryLabelStyle)
    mergeAndSet(row, 10, row, 11, formatCurrency(totaleVendita), summaryValueStyle)
    setRowHeight(row, 20)
    row += 1

    mergeAndSet(row, 0, row, 9, 'Quantità complessive', summaryLabelStyle)
    mergeAndSet(row, 10, row, 11, formatNumber(totaleQuantita), summaryValueStyle)
    setRowHeight(row, 20)
    row += 1
  } else {
    mergeAndSet(row, 0, row, columnCount - 1, 'Nessun dettaglio disponibile', tableValueStyle)
    setRowHeight(row, 20)
    row += 1
  }

  addEmptyRow(10)

  mergeAndSet(row, 0, row, 5, 'Firma Studio / Dottore', signatureLabelStyle)
  mergeAndSet(row, 6, row, 11, 'Firma Gestionale', signatureLabelStyle)
  setRowHeight(row, 18)
  row += 1

  mergeAndSet(row, 0, row, 5, '', signatureBoxStyle)
  mergeAndSet(row, 6, row, 11, '', signatureBoxStyle)
  setRowHeight(row, 32)
  row += 1

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
