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
  
  doc.setFontSize(18);
  doc.text('Rapport Financier AKIBAR', 14, 22);
  
  doc.setFontSize(11);
  doc.text(`Période du : ${new Date(data.period.start).toLocaleDateString()} au ${new Date(data.period.end).toLocaleDateString()}`, 14, 30);
  
  // Tableau de Synthèse
  (doc as any).autoTable({
    startY: 40,
    head: [['Indicateur', 'Montant']],
    body: [
      ['Ventes Espèces', formatCurrency(data.cashSales)],
      ['Ventes Mobile Money', formatCurrency(data.mobileMoneySales)],
      ['Ardoises (Crédits)', formatCurrency(data.debtSales)],
      ['Dépenses Totales', formatCurrency(data.expenses)],
      ['Chiffre d\'Affaires Net', formatCurrency(data.cashSales + data.mobileMoneySales)]
    ],
    theme: 'striped',
    headStyles: { fillColor: [245, 158, 11] } // Orange Akibar
  });

  // Tableau du Journal
  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [['Date', 'Type Paiement', 'Client', 'Montant', 'Statut']],
    body: data.journal.map(tx => [
      new Date(tx.createdAt).toLocaleString(),
      tx.paymentMode,
      tx.nomClient || '-',
      formatCurrency(tx.totalAmount),
      tx.status
    ]),
    theme: 'grid'
  });

  doc.save(`Rapport_Financier_${new Date().getTime()}.pdf`);
};

export const shareToWhatsApp = (data: FinancialData) => {
  const text = `*Rapport Financier AKIBAR* 🍺\n\n` +
    `📅 Période: ${new Date(data.period.start).toLocaleDateString()} - ${new Date(data.period.end).toLocaleDateString()}\n\n` +
    `💰 *Chiffre d'Affaires Net* : ${formatCurrency(data.cashSales + data.mobileMoneySales)}\n` +
    `💵 Espèces : ${formatCurrency(data.cashSales)}\n` +
    `📱 Mobile Money : ${formatCurrency(data.mobileMoneySales)}\n` +
    `📝 Ardoises : ${formatCurrency(data.debtSales)}\n` +
    `📉 Dépenses : ${formatCurrency(data.expenses)}\n\n` +
    `*Solde Net (Espèces - Dépenses)* : ${formatCurrency(data.cashSales - data.expenses)}`;

  const encodedText = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encodedText}`, '_blank');
};
