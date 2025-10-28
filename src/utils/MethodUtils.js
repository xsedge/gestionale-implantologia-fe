function formattaDataItaliano(isoDateStr) {
    if (!isoDateStr) return '';

    const date = new Date(isoDateStr);
    if (isNaN(date)) return '';

    // Giorno e mese con zero davanti se minori di 10
    const giorno = String(date.getDate()).padStart(2, '0');
    const mese = String(date.getMonth() + 1).padStart(2, '0'); // Mese da 0 a 11
    const anno = date.getFullYear();

    return `${giorno}-${mese}-${anno}`;
}

export { formattaDataItaliano };