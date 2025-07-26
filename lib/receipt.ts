
interface Payment {
  id: string;
  studentName: string;
  month: string;
  amount: number;
  paymentMethod: string;
  date: string;
}

export const generateReceipt = (payment: Payment): void => {
  const receiptContent = getReceiptHTML(payment);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
  }
};

export const downloadReceipt = (payment: Payment): void => {
  const receiptContent = getReceiptHTML(payment);
  const blob = new Blob([receiptContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recu_${payment.studentName}_${payment.month}_${payment.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const getReceiptHTML = (payment: Payment): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reçu de paiement</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .school-name {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .receipt-title {
          font-size: 20px;
          font-weight: bold;
          color: #333;
          margin-bottom: 30px;
        }
        .receipt-info {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #dee2e6;
        }
        .info-label {
          font-weight: bold;
          color: #495057;
        }
        .info-value {
          color: #212529;
        }
        .amount {
          font-size: 18px;
          font-weight: bold;
          color: #28a745;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          color: #6c757d;
          font-size: 14px;
        }
        .signature {
          margin-top: 30px;
          text-align: right;
        }
        .signature-line {
          border-top: 1px solid #333;
          width: 200px;
          margin: 20px 0 5px auto;
        }
        @media print {
          body { margin: 0; padding: 10px; }
          .header { margin-bottom: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="school-name">Pierre de la Fontaine</div>
        <div>AKAE après l'Ecole publique Ozoungue</div>
        <div>Tél: 077 71 55 10 / 066 31 07 08 / 077 80 27 78 / 066 30 01 40</div>
      </div>

      <div class="receipt-title">REÇU DE PAIEMENT</div>

      <div class="receipt-info">
        <div class="info-row">
          <span class="info-label">N° de reçu:</span>
          <span class="info-value">${payment.id}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Nom de l'élève:</span>
          <span class="info-value">${payment.studentName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Mois payé:</span>
          <span class="info-value">${payment.month}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Mode de paiement:</span>
          <span class="info-value">${getPaymentMethodLabel(payment.paymentMethod)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date de paiement:</span>
          <span class="info-value">${new Date(payment.date).toLocaleDateString('fr-FR')}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Montant payé:</span>
          <span class="info-value amount">${payment.amount.toLocaleString()} CFA</span>
        </div>
      </div>

      <div class="signature">
        <div>Signature du caissier</div>
        <div class="signature-line"></div>
        <div>Date: ${new Date().toLocaleDateString('fr-FR')}</div>
      </div>

      <div class="footer">
        <p>Merci pour votre paiement. Conservez ce reçu pour vos dossiers.</p>
        <p>En cas de problème, contactez l'administration de l'école.</p>
      </div>
    </body>
    </html>
  `;
};

const getPaymentMethodLabel = (method: string): string => {
  switch (method) {
    case 'cash': return 'Espèces';
    case 'transfer': return 'Virement bancaire';
    case 'check': return 'Chèque';
    case 'mobile': return 'Mobile Money';
    default: return 'Espèces';
  }
};
