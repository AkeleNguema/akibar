import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface FinancialData {
  period: { start: string; end: string };
  cashSales: number;
  mobileMoneySales: number;
  debtSales: number;
  expenses: number;
  journal: any[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(amount);
};

export const exportToExcel = (data: FinancialData) => {
  const wb = XLSX.utils.book_new();

  // Synthèse
  const summaryData = [
    ['Rapport Financier AKIBAR'],
    ['Période du', new Date(data.period.start).toLocaleDateString(), 'au', new Date(data.period.end).toLocaleDateString()],
    [],
    ['Indicateur', 'Montant'],
    ['Ventes Espèces', data.cashSales],
    ['Ventes Mobile Money', data.mobileMoneySales],
    ['Ardoises (Crédits)', data.debtSales],
    ['Dépenses Totales', data.expenses],
    ['Chiffre d\'Affaires Net (Cash + MM)', data.cashSales + data.mobileMoneySales]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Synthèse');

  // Journal des transactions
  const journalData = data.journal.map(tx => ({
    'Date': new Date(tx.createdAt).toLocaleString(),
    'Type': tx.paymentMode,
    'Client (Ardoise)': tx.nomClient || '-',
    'Montant': tx.totalAmount,
    'Statut': tx.status
  }));
  const wsJournal = XLSX.utils.json_to_sheet(journalData);
  XLSX.utils.book_append_sheet(wb, wsJournal, 'Journal');

  XLSX.writeFile(wb, `Rapport_Financier_${new Date().getTime()}.xlsx`);
};

export const exportToPDF = (data: FinancialData) => {
  const doc = new jsPDF();
  
  // Header section
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AKIBAR', 14, 20);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Rapport Financier', 14, 30);
  
  doc.setFontSize(11);
  doc.setTextColor(200, 200, 200);
  doc.text(`Période : ${new Date(data.period.start).toLocaleDateString()} - ${new Date(data.period.end).toLocaleDateString()}`, 120, 30);

  // Resume section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Synthèse des Performances', 14, 55);

  (doc as any).autoTable({
    startY: 60,
    head: [['Indicateur', 'Montant']],
    body: [
      ['Ventes Espèces', formatCurrency(data.cashSales)],
      ['Ventes Mobile Money', formatCurrency(data.mobileMoneySales)],
      ['Ardoises (Crédits)', formatCurrency(data.debtSales)],
      ['Dépenses Totales', formatCurrency(data.expenses)],
      ['Chiffre d\'Affaires Net', formatCurrency(data.cashSales + data.mobileMoneySales)]
    ],
    theme: 'grid',
    headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 11, cellPadding: 5 }
  });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Journal des Transactions', 14, (doc as any).lastAutoTable.finalY + 15);

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Date', 'Type Paiement', 'Client', 'Montant', 'Statut']],
    body: data.journal.map(tx => [
      new Date(tx.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      tx.paymentMode,
      tx.nomClient || '-',
      formatCurrency(tx.totalAmount),
      tx.status
    ]),
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(9);
  doc.setTextColor(150);
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Généré par Akibar - Page ${i} / ${pageCount}`, 14, 290);
  }

  doc.save(`Rapport_Financier_${new Date().getTime()}.pdf`);
};

export const shareToWhatsApp = (data: FinancialData) => {
  const caNet = data.cashSales + data.mobileMoneySales;
  const soldeNet = data.cashSales - data.expenses;
  
  const text = `📊 *RAPPORT FINANCIER AKIBAR* 📊\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📅 *Période* : ${new Date(data.period.start).toLocaleDateString()} au ${new Date(data.period.end).toLocaleDateString()}\n\n` +
    `📈 *PERFORMANCES :*\n` +
    `🔸 *Chiffre d'Affaires Net* : ${formatCurrency(caNet)}\n` +
    `💵 Espèces : ${formatCurrency(data.cashSales)}\n` +
    `📱 Mobile Money : ${formatCurrency(data.mobileMoneySales)}\n` +
    `📝 Ardoises : ${formatCurrency(data.debtSales)}\n\n` +
    `📉 *CHARGES :*\n` +
    `🔻 Dépenses : ${formatCurrency(data.expenses)}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *SOLDE CAISSE (Espèces - Dépenses)* : ${formatCurrency(soldeNet)}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `_Généré automatiquement par l'application Akibar._`;

  const encodedText = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encodedText}`, '_blank');
};
