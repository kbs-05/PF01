interface Payment {
  id: string;
  studentName: string;
  month: string;
  amount: number;
  paymentMethod: string;
  date: string;
  academicYear: string;
}

export const generateReceipt = (payment: Payment): void => {
  const receiptContent = getReceiptHTML(payment);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.focus();
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
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Reçu de paiement</title>
    <style>
      @media print {
        @page {
          size: A5 landscape;
          margin: 10mm;
        }
      }

      body {
        font-family: Arial, sans-serif;
        font-size: 13px;
        margin: 0 auto;
        padding: 10px;
        width: 100%;
        max-width: 580px;
        line-height: 1.4;
        color: #212529;
      }

      .header {
        text-align: center;
        border-bottom: 1px solid #333;
        padding-bottom: 10px;
        margin-bottom: 10px;
      }

      .school-name {
        font-size: 17px;
        font-weight: bold;
        color: #2563eb;
      }

      .contact {
        font-size: 12px;
      }

      .receipt-title {
        font-size: 15px;
        font-weight: bold;
        text-align: center;
        margin: 15px 0;
        text-decoration: underline;
      }

      .receipt-info {
        background-color: #f9f9f9;
        padding: 12px;
        border-radius: 6px;
      }

      .info-row {
        display: flex;
        justify-content: space-between;
        margin: 6px 0;
        border-bottom: 1px dashed #ccc;
        padding-bottom: 3px;
      }

      .info-label {
        font-weight: bold;
      }

      .amount {
        font-weight: bold;
        font-size: 14px;
        color: #28a745;
      }

      .signature {
        text-align: right;
        margin-top: 20px;
      }

      .signature-line {
        border-top: 1px solid #333;
        width: 130px;
        margin-top: 15px;
        margin-bottom: 5px;
        float: right;
      }

      .footer {
        text-align: center;
        font-size: 10px;
        margin-top: 20px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="school-name">Pierre de la Fontaine</div>
      <div class="contact">AKAE après l'École publique Ozoungue</div>
      <div class="contact">Tél : 077 71 55 10 / 066 31 07 08 / 077 80 27 78 / 066 30 01 40</div>
    </div>

    <div class="receipt-title">REÇU DE PAIEMENT</div>

    <div class="receipt-info">
      <div class="info-row">
        <span class="info-label">N° de reçu :</span>
        <span>${payment.id}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Année scolaire :</span>
        <span>${payment.academicYear}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Élève :</span>
        <span>${payment.studentName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Mois :</span>
        <span>${payment.month}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Mode :</span>
        <span>${getPaymentMethodLabel(payment.paymentMethod)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date :</span>
        <span>${new Date(payment.date).toLocaleDateString('fr-FR')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Montant :</span>
        <span class="amount">${payment.amount.toLocaleString()} CFA</span>
      </div>
    </div>

    <div class="signature">
      <div>Signature du caissier</div>
      <div class="signature-line"></div>
      <div>Date : ${new Date().toLocaleDateString('fr-FR')}</div>
    </div>

    <div class="footer">
      Merci de conserver ce reçu. Pour toute réclamation, contactez l'administration.
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
    default: return method;
  }
};
