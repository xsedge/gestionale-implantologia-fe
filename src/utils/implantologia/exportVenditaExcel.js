const BORDER_COLOR = 'FF90A4AE'
const HEADER_FILL_COLOR = 'FFE2E8F0'
const SECTION_FILL_COLOR = 'FFF7F9FC'
const SUMMARY_FILL_COLOR = 'FFF1F5F9'
const NOTE_FILL_COLOR = 'FFFAFAFA'
const SIGNATURE_FILL_COLOR = 'FFFFFFFF'

function normalizeBorderOptions(options, fallbackStyle, fallbackColor) {
  if (options === null) {
    return null
  }
  if (options === undefined) {
    return undefined
  }
  if (typeof options === 'string') {
    return { style: options, color: { argb: fallbackColor } }
  }
  if (options.style || options.color) {
    return {
      style: options.style || fallbackStyle,
      color: { argb: options.color || fallbackColor }
    }
  }
  return options
}

function createBorder(weight = 'medium', color = BORDER_COLOR, overrides = {}) {
  const baseStyle = { style: weight, color: { argb: color } }
  const border = {
    top: { ...baseStyle },
    left: { ...baseStyle },
    bottom: { ...baseStyle },
    right: { ...baseStyle }
  }

  const sides = ['top', 'left', 'bottom', 'right']
  for (const side of sides) {
    if (side in overrides) {
      const normalized = normalizeBorderOptions(overrides[side], baseStyle.style, color)
      if (normalized === null) {
        delete border[side]
      } else if (normalized) {
        border[side] = normalized
      }
    }
  }

  return border
}

const baseLabelFont = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF263238' } }
const baseValueFont = { name: 'Calibri', size: 11, color: { argb: 'FF37474F' } }

const anagraficaLabelStyle = {
  font: baseLabelFont,
  alignment: { vertical: 'middle', horizontal: 'left', wrapText: true },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: SECTION_FILL_COLOR } },
  border: createBorder('medium')
}

const anagraficaValueStyle = {
  font: baseValueFont,
  alignment: { vertical: 'middle', horizontal: 'left', wrapText: true },
  border: createBorder('medium')
}

const tableHeaderStyle = {
  font: { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1F2933' } },
  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL_COLOR } },
  border: createBorder('medium')
}

const tableTextStyle = {
  font: baseValueFont,
  alignment: { vertical: 'middle', horizontal: 'left', wrapText: true },
  border: createBorder('medium')
}

const tableNumberStyle = {
  font: baseValueFont,
  alignment: { vertical: 'middle', horizontal: 'right' },
  numFmt: '#,##0.00',
  border: createBorder('medium')
}

const summaryLabelStyle = {
  font: { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1C2833' } },
  alignment: { vertical: 'middle', horizontal: 'right' },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: SUMMARY_FILL_COLOR } },
  border: createBorder('medium')
}

const summaryValueStyle = {
  font: { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF102A43' } },
  alignment: { vertical: 'middle', horizontal: 'right' },
  numFmt: '#,##0.00',
  border: createBorder('medium')
}

const noteLabelStyle = {
  font: baseLabelFont,
  alignment: { vertical: 'top', horizontal: 'left' },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: NOTE_FILL_COLOR } },
  border: createBorder('medium')
}

const signatureLabelStyle = {
  font: baseLabelFont,
  alignment: { vertical: 'middle', horizontal: 'left' },
  border: createBorder('medium')
}

const signatureBoxStyle = {
  border: createBorder('medium', BORDER_COLOR, {
    top: { style: 'medium', color: BORDER_COLOR },
    left: { style: 'medium', color: BORDER_COLOR },
    right: { style: 'medium', color: BORDER_COLOR },
    bottom: null
  }),
  alignment: { vertical: 'bottom', horizontal: 'center' },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: SIGNATURE_FILL_COLOR } }
}

function applyStyle(cell, style) {
  if (!cell || !style) {
    return
  }
  if (style.font) {
    cell.font = style.font
  }
  if (style.alignment) {
    cell.alignment = style.alignment
  }
  if (style.fill) {
    cell.fill = style.fill
  }
  if (style.border) {
    cell.border = style.border
  }
  if (style.numFmt) {
    cell.numFmt = style.numFmt
  }
}

function formatCurrency(value) {
  if (value == null) {
    return 0
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function formatDate(value) {
  if (!value) {
    return ''
  }
  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return value
    }
    return date.toISOString().slice(0, 10)
  } catch (error) {
    return value
  }
}

async function exportVenditaExcel({
  vendita = {},
  prodotti = [],
  pagamenti = [],
  note = '',
  totals = {}
} = {}, options = {}) {
  let ExcelJS
  try {
    const excelModule = await import('exceljs')
    ExcelJS = excelModule.default ?? excelModule
  } catch (error) {
    throw new Error('exceljs dependency is required to generate Excel files.')
  }

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Vendita Implantologia')

  worksheet.properties.defaultRowHeight = 20
  worksheet.columns = [
    { key: 'col1', width: 22 },
    { key: 'col2', width: 22 },
    { key: 'col3', width: 22 },
    { key: 'col4', width: 22 }
  ]

  let currentRow = 2
  const anagraficaRows = [
    ['Numero vendita', vendita.numero || '-'],
    ['Data intervento', formatDate(vendita.dataIntervento)],
    ['Cliente', vendita.cliente || [vendita.clienteDentaleNome, vendita.clienteDentaleCognome].filter(Boolean).join(' ').trim()],
    ['Studio dentistico', vendita.studioDentale || ''],
    ['Medico', vendita.medico || ''],
    ['Stato pagamento', vendita.statoPagamento || '']
  ]

  for (const [label, value] of anagraficaRows) {
    worksheet.mergeCells(currentRow, 2, currentRow, 4)
    const labelCell = worksheet.getCell(currentRow, 1)
    const valueCell = worksheet.getCell(currentRow, 2)
    labelCell.value = label
    valueCell.value = value || '-'
    applyStyle(labelCell, anagraficaLabelStyle)
    applyStyle(valueCell, anagraficaValueStyle)
    currentRow += 1
  }

  currentRow += 1

  const headerRow = worksheet.getRow(currentRow)
  headerRow.values = [null, 'Prodotto', 'Quantità', 'Totale']
  applyStyle(headerRow.getCell(2), tableHeaderStyle)
  applyStyle(headerRow.getCell(3), tableHeaderStyle)
  applyStyle(headerRow.getCell(4), tableHeaderStyle)
  headerRow.commit()

  currentRow += 1
  for (const prodotto of prodotti) {
    const row = worksheet.getRow(currentRow)
    row.getCell(2).value = prodotto.nome || prodotto.prodottoNome || '-'
    row.getCell(3).value = formatCurrency(prodotto.quantita || 0)
    row.getCell(4).value = formatCurrency(prodotto.totale || prodotto.totaleRiga || 0)

    applyStyle(row.getCell(2), tableTextStyle)
    applyStyle(row.getCell(3), tableNumberStyle)
    applyStyle(row.getCell(4), tableNumberStyle)
    row.commit()
    currentRow += 1
  }

  if (!prodotti.length) {
    const emptyRow = worksheet.getRow(currentRow)
    emptyRow.getCell(2).value = 'Nessun prodotto registrato'
    worksheet.mergeCells(currentRow, 2, currentRow, 4)
    applyStyle(emptyRow.getCell(2), tableTextStyle)
    emptyRow.commit()
    currentRow += 1
  }

  currentRow += 1

  const summaryRows = [
    ['Subtotale', totals.subtotale ?? totals.subtotal ?? 0],
    ['Imposte', totals.imposte ?? totals.tasse ?? totals.tax ?? 0],
    ['Sconto', totals.sconto ?? 0],
    ['Totale', totals.totale ?? totals.total ?? 0]
  ]

  for (const [label, amount] of summaryRows) {
    worksheet.mergeCells(currentRow, 1, currentRow, 3)
    const labelCell = worksheet.getCell(currentRow, 1)
    const valueCell = worksheet.getCell(currentRow, 4)
    labelCell.value = label
    valueCell.value = formatCurrency(amount)
    applyStyle(labelCell, summaryLabelStyle)
    applyStyle(valueCell, summaryValueStyle)
    currentRow += 1
  }

  currentRow += 1

  const pagamentoHeader = worksheet.getRow(currentRow)
  pagamentoHeader.values = [null, 'Pagamenti', '', '']
  worksheet.mergeCells(currentRow, 2, currentRow, 4)
  applyStyle(pagamentoHeader.getCell(2), tableHeaderStyle)
  pagamentoHeader.commit()
  currentRow += 1

  const pagamentiRows = pagamenti.length
    ? pagamenti
    : [{ metodo: vendita.metodoPagamento || '-', importo: totals.totale ?? totals.total ?? 0 }]

  for (const pagamento of pagamentiRows) {
    worksheet.mergeCells(currentRow, 2, currentRow, 3)
    const labelCell = worksheet.getCell(currentRow, 2)
    const valueCell = worksheet.getCell(currentRow, 4)
    labelCell.value = pagamento.metodo || pagamento.label || '-'
    valueCell.value = formatCurrency(pagamento.importo || pagamento.amount || 0)
    applyStyle(labelCell, tableTextStyle)
    applyStyle(valueCell, tableNumberStyle)
    currentRow += 1
  }

  currentRow += 2

  worksheet.mergeCells(currentRow, 1, currentRow + 1, 3)
  const noteCell = worksheet.getCell(currentRow, 1)
  noteCell.value = note || 'Note aggiuntive'
  applyStyle(noteCell, noteLabelStyle)

  const signatureLabelCell = worksheet.getCell(currentRow, 4)
  signatureLabelCell.value = options.signatureLabel || 'Firma'
  applyStyle(signatureLabelCell, signatureLabelStyle)

  const signatureBoxCell = worksheet.getCell(currentRow + 1, 4)
  signatureBoxCell.value = ''
  applyStyle(signatureBoxCell, signatureBoxStyle)

  if (options.filePath) {
    await workbook.xlsx.writeFile(options.filePath)
    return options.filePath
  }
  return workbook.xlsx.writeBuffer()
}

export {
  createBorder,
  anagraficaLabelStyle,
  anagraficaValueStyle,
  tableHeaderStyle,
  tableTextStyle,
  tableNumberStyle,
  summaryLabelStyle,
  summaryValueStyle,
  noteLabelStyle,
  signatureLabelStyle,
  signatureBoxStyle,
  exportVenditaExcel
}
