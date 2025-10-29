import * as XLSX from 'xlsx'

export function exportVenditaExcel(vendita) {
  if (!vendita || typeof vendita !== 'object') {
    throw new Error('Vendita non valida')
  }

  const workbook = XLSX.utils.book_new()
  const commissionSheet = buildCommissionSheet(vendita)

  XLSX.utils.book_append_sheet(workbook, commissionSheet, 'Copia Commissione')

  const fileName = generateFileName(vendita)
  XLSX.writeFile(workbook, fileName, { compression: true })

  return fileName
}

function buildCommissionSheet(vendita) {
  const columnCount = 12
  const worksheet = XLSX.utils.aoa_to_sheet([])
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 6 },
    { wch: 4 },
    { wch: 20 },
    { wch: 8 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 10 },
    { wch: 14 }
  ]

  const merges = []
  let row = 0

  const SECTION_FRAME_COLOR = '305496'

  function createBorder(style, color) {
    return {
      top: { style, color: { rgb: color } },
      bottom: { style, color: { rgb: color } },
      left: { style, color: { rgb: color } },
      right: { style, color: { rgb: color } }
    }
  }

  const BORDER_THIN = createBorder('thin', '777777')
  const BORDER_MEDIUM = createBorder('medium', SECTION_FRAME_COLOR)

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
  mergeAndSet(row, 0, row, columnCount - 1, 'COPIA COMMISSIONE - IMPLANTOLOGIA DENTALE', titleStyle)
  setRowHeight(row, 28)
  row += 1

  addEmptyRow(6)

  const sectionHeaderStyle = {
    font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: BORDER_MEDIUM,
    fill: { fgColor: { rgb: '203864' } }
  }
  const fieldLabelStyle = {
    font: { bold: true, color: { rgb: '000000' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: BORDER_THIN,
    fill: { fgColor: { rgb: 'F0F3F8' } }
  }
  const fieldValueStyle = {
    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
    border: BORDER_THIN,
    fill: { fgColor: { rgb: 'FFFFFF' } }
  }
  const tableHeaderStyle = {
    font: { bold: true, color: { rgb: '1F497D' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: BORDER_THIN,
    fill: { fgColor: { rgb: 'D9E2F3' } }
  }
  const tableTextStyle = {
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
    border: BORDER_THIN,
    fill: { fgColor: { rgb: 'FDFDFD' } }
  }
  const tableNumberStyle = {
    alignment: { horizontal: 'right', vertical: 'center' },
    border: BORDER_THIN,
    fill: { fgColor: { rgb: 'FDFDFD' } }
  }
  const summaryLabelStyle = {
    font: { bold: true },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: BORDER_THIN,
    fill: { fgColor: { rgb: 'EDEDED' } }
  }
  const summaryValueStyle = {
    font: { bold: true },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: BORDER_THIN,
    fill: { fgColor: { rgb: 'FFFFFF' } }
  }
  const noteLabelStyle = {
    font: { bold: true },
    alignment: { horizontal: 'left', vertical: 'top' },
    border: BORDER_THIN,
    fill: { fgColor: { rgb: 'F9F9F9' } }
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

  function addSectionHeader(text) {
    mergeAndSet(row, 0, row, columnCount - 1, text, sectionHeaderStyle)
    setRowHeight(row, 22)
    row += 1
  }

  function applySectionFrame(startRow, endRow, startCol = 0, endCol = columnCount - 1) {
    if (startRow > endRow) {
      return
    }
    for (let r = startRow; r <= endRow; r += 1) {
      for (let c = startCol; c <= endCol; c += 1) {
        const cell = ensureCell(r, c)
        const existingStyle = cell.s || {}
        const existingBorder = { ...(existingStyle.border || {}) }

        if (r === startRow) {
          existingBorder.top = { style: 'medium', color: { rgb: SECTION_FRAME_COLOR } }
        }
        if (r === endRow) {
          existingBorder.bottom = { style: 'medium', color: { rgb: SECTION_FRAME_COLOR } }
        }
        if (c === startCol) {
          existingBorder.left = { style: 'medium', color: { rgb: SECTION_FRAME_COLOR } }
        }
        if (c === endCol) {
          existingBorder.right = { style: 'medium', color: { rgb: SECTION_FRAME_COLOR } }
        }

        cell.s = { ...existingStyle, border: existingBorder }
      }
    }
  }

  function addFieldRow(left, right = null) {
    if (left) {
      mergeAndSet(row, 0, row, 2, left.label, fieldLabelStyle)
      mergeAndSet(row, 3, row, 5, left.value, fieldValueStyle)
    } else {
      mergeAndSet(row, 0, row, 5, '', fieldValueStyle)
    }

    if (right) {
      mergeAndSet(row, 6, row, 8, right.label, fieldLabelStyle)
      mergeAndSet(row, 9, row, 11, right.value, fieldValueStyle)
    } else {
      mergeAndSet(row, 6, row, 11, '', fieldValueStyle)
    }

    setRowHeight(row, 20)
    row += 1
  }

  const dataCommissione = formatDate(vendita.dataCommissione || vendita.dataIntervento || vendita.createdAt)
  const clienteNome = formatValue(
    getClienteField(vendita, ['clienteDentaleStudio', 'studioDentale', 'ragioneSociale']) || formatCliente(vendita)
  )
  const indirizzoCliente = formatValue(
    getClienteField(vendita, ['clienteDentaleIndirizzo', 'indirizzo', 'indirizzoCompleto'])
  )
  const telefonoCliente = formatValue(getClienteField(vendita, ['clienteDentaleTelefono', 'telefono']))
  const emailCliente = formatValue(getClienteField(vendita, ['clienteDentaleEmail', 'email']))
  const pivaCliente = formatValue(
    getClienteField(vendita, [
      'clienteDentalePiva',
      'clienteDentalePIva',
      'partitaIva',
      'piva',
      'pIva',
      'clienteDentaleCf',
      'codiceFiscale'
    ])
  )

  const anagraficaSectionStart = row
  addSectionHeader('DATI COMMISSIONE E CLIENTE')

  const fieldRows = [
    {
      left: { label: 'Data commissione', value: dataCommissione },
      right: { label: 'Numero documento', value: formatValue(vendita.numero || vendita.progressivo || vendita.id) }
    },
    {
      left: { label: 'Cliente / Studio', value: clienteNome },
      right: { label: 'Codice Fiscale / P. IVA', value: pivaCliente }
    },
    {
      left: { label: 'Indirizzo', value: indirizzoCliente },
      right: { label: 'Riferimento ordine', value: formatValue(vendita.riferimentoOrdine || vendita.numeroOrdine || '-') }
    },
    {
      left: { label: 'Telefono', value: telefonoCliente },
      right: { label: 'Medico / Referente', value: formatValue(vendita.medico || formatCliente(vendita)) }
    },
    {
      left: { label: 'Email', value: emailCliente },
      right: { label: 'Registrata il', value: formatDateTime(vendita.createdAt || vendita.dataCreazione) }
    }
  ]

  fieldRows.forEach(({ left, right }) => addFieldRow(left, right))

  applySectionFrame(anagraficaSectionStart, row - 1)

  addEmptyRow(4)

  const dettagli = getDettagli(vendita)
  const totaleImponibile = calcolaTotale(vendita)
  const totaleQuantita = dettagli.reduce((sum, det) => sum + (Number(det?.quantita) || 0), 0)
  const ivaPercentuale = getAliquotaIva(vendita)
  const ivaCalcolata = calcolaIva(vendita, totaleImponibile, ivaPercentuale)
  const totaleFinale =
    getFirstNumber([
      vendita.totaleConIva,
      vendita.totaleIvato,
      vendita.totaleLordo,
      vendita.totaleFattura,
      vendita.totale
    ]) || totaleImponibile + ivaCalcolata

  const tableColumns = [
    { label: 'Codice', start: 0, end: 1 },
    { label: 'Descrizione prodotto / Note', start: 2, end: 5 },
    { label: 'Categoria', start: 6, end: 6 },
    { label: 'Impianto / Moncone', start: 7, end: 7 },
    { label: 'Quantità', start: 8, end: 8 },
    { label: 'Prezzo Unitario', start: 9, end: 9 },
    { label: 'Sconto %', start: 10, end: 10 },
    { label: 'Totale riga', start: 11, end: 11 }
  ]

  const prodottiSectionStart = row
  addSectionHeader('DETTAGLIO PRODOTTI E LAVORAZIONI')

  tableColumns.forEach(column => {
    mergeAndSet(row, column.start, row, column.end, column.label, tableHeaderStyle)
  })
  setRowHeight(row, 22)
  row += 1

  if (dettagli.length) {
    dettagli.forEach(det => {
      const descriptionParts = [
        formatValue(det.prodottoNome || det.prodotto?.nome),
        det.note ? `Note: ${det.note}` : ''
      ].filter(Boolean)

      const tableCells = [
        { start: 0, end: 1, value: formatValue(det.prodottoCodice || det.prodotto?.codice), style: tableTextStyle },
        { start: 2, end: 5, value: descriptionParts.join('\n') || '-', style: tableTextStyle },
        { start: 6, end: 6, value: formatCategoria(det), style: tableTextStyle },
        { start: 7, end: 7, value: formatImpiantoMoncone(det), style: tableTextStyle },
        { start: 8, end: 8, value: formatNumber(det.quantita), style: tableNumberStyle },
        { start: 9, end: 9, value: formatCurrency(prezzoUnitario(det)), style: tableNumberStyle },
        { start: 10, end: 10, value: formatPercentuale(det), style: tableNumberStyle },
        { start: 11, end: 11, value: formatCurrency(calcolaTotaleRiga(det)), style: tableNumberStyle }
      ]

      tableCells.forEach(cell => {
        mergeAndSet(row, cell.start, row, cell.end, cell.value, cell.style)
      })

      const multiline = descriptionParts.length > 1 || (det.note && det.note.length > 40)
      setRowHeight(row, multiline ? 32 : 20)
      row += 1
    })
  } else {
    mergeAndSet(row, 0, row, columnCount - 1, 'Nessun dettaglio disponibile', tableTextStyle)
    setRowHeight(row, 20)
    row += 1
  }

  if (dettagli.length < 8) {
    const missingRows = 8 - dettagli.length
    for (let i = 0; i < missingRows; i += 1) {
      tableColumns.forEach(column => {
        mergeAndSet(row, column.start, row, column.end, '', tableTextStyle)
      })
      setRowHeight(row, 18)
      row += 1
    }
  }

  applySectionFrame(prodottiSectionStart, row - 1)

  addEmptyRow(4)

  const pagamentoSectionStart = row
  addSectionHeader('PAGAMENTO, NOTE E FIRME')

  mergeAndSet(row, 0, row, 8, 'Quantità complessive', summaryLabelStyle)
  mergeAndSet(row, 9, row, 11, formatNumber(totaleQuantita), summaryValueStyle)
  setRowHeight(row, 20)
  row += 1

  mergeAndSet(row, 0, row, 8, 'Totale imponibile', summaryLabelStyle)
  mergeAndSet(row, 9, row, 11, formatCurrency(totaleImponibile), summaryValueStyle)
  setRowHeight(row, 20)
  row += 1

  const ivaLabel = ivaPercentuale ? `IVA (${formatNumber(ivaPercentuale)}%)` : 'IVA'
  mergeAndSet(row, 0, row, 8, ivaLabel, summaryLabelStyle)
  mergeAndSet(row, 9, row, 11, formatCurrency(ivaCalcolata), summaryValueStyle)
  setRowHeight(row, 20)
  row += 1

  mergeAndSet(row, 0, row, 8, 'Totale finale', summaryLabelStyle)
  mergeAndSet(row, 9, row, 11, formatCurrency(totaleFinale), summaryValueStyle)
  setRowHeight(row, 20)
  row += 1

  const noteValue = vendita.note || getClienteField(vendita, ['clienteDentaleNote', 'noteCliente'])
  mergeAndSet(row, 0, row, 1, 'Note / Annotazioni', noteLabelStyle)
  mergeAndSet(row, 2, row + 1, columnCount - 1, formatValue(noteValue || ''), {
    ...tableTextStyle,
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true }
  })
  setRowHeight(row, 18)
  setRowHeight(row + 1, 36)
  row += 2

  addEmptyRow(8)

  mergeAndSet(row, 0, row, 5, 'Firma Cliente / Medico', signatureLabelStyle)
  mergeAndSet(row, 6, row, 11, 'Firma Operatore', signatureLabelStyle)
  setRowHeight(row, 18)
  row += 1

  mergeAndSet(row, 0, row, 5, '', signatureBoxStyle)
  mergeAndSet(row, 6, row, 11, '', signatureBoxStyle)
  setRowHeight(row, 36)
  row += 1

  applySectionFrame(pagamentoSectionStart, row - 1)

  const lastRow = Math.max(row - 1, 0)
  worksheet['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: lastRow, c: columnCount - 1 }
  })
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

function formatCategoria(det) {
  if (!det) {
    return ''
  }
  const value =
    det.categoria ||
    det.prodottoCategoria ||
    det.tipologia ||
    det.categoriaNome ||
    det.tipologiaProdotto ||
    det.prodotto?.categoria ||
    det.prodotto?.categoriaNome
  return formatValue(value)
}

function formatImpiantoMoncone(det) {
  if (!det) {
    return ''
  }
  const value =
    det.impianto ||
    det.tipoImpianto ||
    det.moncone ||
    det.tipoMoncone ||
    det.componenti ||
    det.componentiDescrizione ||
    det.prodotto?.impianto ||
    det.prodotto?.moncone
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(', ')
  }
  return formatValue(value)
}

function coercePercentage(value) {
  if (value == null || value === '') {
    return null
  }
  const number = Number(value)
  if (Number.isNaN(number)) {
    return null
  }
  if (Math.abs(number) > 1.5) {
    return number
  }
  if (number === 0) {
    return 0
  }
  return number * 100
}

function formatPercentuale(det) {
  if (!det || typeof det !== 'object') {
    return ''
  }
  const candidates = [
    det.scontoPercentuale,
    det.percentualeSconto,
    det.percentuale,
    det.scontoPerc,
    det.scontoPercent
  ]

  for (const candidate of candidates) {
    const percent = coercePercentage(candidate)
    if (percent != null) {
      return `${formatNumber(percent)}%`
    }
  }

  return ''
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return new Intl.DateTimeFormat('it-IT').format(date)
}

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

function formatCurrency(value) {
  if (value == null || value === '') return ''
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(value) || 0)
}

function formatNumber(value) {
  if (value == null || value === '') return ''
  const number = Number(value)
  if (Number.isNaN(number)) {
    return String(value)
  }
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: Number.isInteger(number) ? 0 : 2,
    maximumFractionDigits: 2
  }).format(number)
}

function getAliquotaIva(vendita) {
  if (!vendita || typeof vendita !== 'object') {
    return 0
  }
  const candidates = [
    vendita.aliquotaIva,
    vendita.percentualeIva,
    vendita.ivaPercentuale,
    vendita.ivaAliquota,
    vendita.aliquota
  ]

  for (const candidate of candidates) {
    const percent = coercePercentage(candidate)
    if (percent != null) {
      return percent
    }
  }

  return 0
}

function calcolaIva(vendita, imponibile, ivaPercentuale) {
  const ivaCandidates = [
    vendita?.totaleIva,
    vendita?.importoIva,
    vendita?.ivaImporto,
    vendita?.ivaTotale
  ]

  for (const candidate of ivaCandidates) {
    if (candidate == null || candidate === '') continue
    const number = Number(candidate)
    if (!Number.isNaN(number)) {
      return number
    }
  }

  if (ivaPercentuale) {
    return (imponibile * ivaPercentuale) / 100
  }

  return 0
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
  if (!vendita) return ''
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
    return [vendita.clienteDentale?.nome, vendita.clienteDentale?.cognome].filter(Boolean).join(' ').trim()
  }
  return ''
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
  if (value == null) {
    return ''
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) {
      return ''
    }
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
