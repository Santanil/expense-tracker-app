import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Expense, formatDate, sumAmounts } from "./expenses";

// jsPDF's built-in fonts don't include the ₹ glyph, so PDFs use a plain
// "Rs." prefix instead of formatCurrency's ₹ symbol.
function formatAmountForPdf(amount: number) {
  return `Rs. ${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function downloadExpensesPdf(expenses: Expense[], monthLabel: string) {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(`Ledger — Monthly breakdown — ${monthLabel}`, 14, 16);

  autoTable(doc, {
    startY: 22,
    head: [
      ["Date", "Category", "Description", "Spend type", "Method", "Card/Upi/Wallet/Bank Name", "Amount"]
    ],
    body: expenses.map((e) => [
      formatDate(e.date),
      e.category,
      e.description || "—",
      e.spend_type,
      e.method.replace("_", " "),
      e.instrument_name || "—",
      formatAmountForPdf(e.amount)
    ]),
    foot: [["", "", "", "", "", "Total", formatAmountForPdf(sumAmounts(expenses))]],
    styles: { fontSize: 9, textColor: [22, 35, 45] },
    headStyles: { fillColor: [22, 35, 45], textColor: [250, 250, 248] },
    footStyles: { fillColor: [222, 220, 211], textColor: [22, 35, 45], fontStyle: "bold" }
  });

  const fileSuffix = monthLabel.replace(/\s+/g, "-").toLowerCase();
  doc.save(`ledger-history-${fileSuffix}.pdf`);
}
