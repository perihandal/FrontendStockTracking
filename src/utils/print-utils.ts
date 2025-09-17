// Barkod yazdırma yardımcı fonksiyonları

export interface PrintOptions {
  title?: string;
  subtitle?: string;
  showDate?: boolean;
  showCode?: boolean;
  size?: 'small' | 'medium' | 'large';
  copies?: number;
}

export function printBarcode(
  barcodeCode: string,
  barcodeType: string,
  stockCardName?: string,
  options: PrintOptions = {}
) {
  const {
    title = 'Barkod Etiketi',
    subtitle = stockCardName || 'Stok Kartı',
    showDate = true,
    showCode = true,
    size = 'medium',
    copies = 1
  } = options;

  // Yazdırılacak HTML içeriği oluştur
  const printContent = createPrintContent(
    barcodeCode,
    barcodeType,
    title,
    subtitle,
    showDate,
    showCode,
    size
  );

  // Yazdırma penceresi aç
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up blokeri nedeniyle yazdırma penceresi açılamadı.');
    return;
  }

  printWindow.document.write(printContent);
  printWindow.document.close();

  // Sayfa yüklendikten sonra yazdır
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      
      // Yazdırma tamamlandıktan sonra pencereyi kapat
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 500);
  };
}

function createPrintContent(
  barcodeCode: string,
  barcodeType: string,
  title: string,
  subtitle: string,
  showDate: boolean,
  showCode: boolean,
  size: string
): string {
  const sizeConfig = getSizeConfig(size);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="utf-8">
      <style>
        @page {
          size: ${sizeConfig.pageSize};
          margin: 10mm;
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: white;
        }
        
        .barcode-label {
          text-align: center;
          border: 1px solid #ccc;
          padding: ${sizeConfig.padding}px;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          max-width: ${sizeConfig.maxWidth}px;
          width: 100%;
        }
        
        .title {
          font-size: ${sizeConfig.titleSize}px;
          font-weight: bold;
          margin-bottom: ${sizeConfig.margin}px;
          color: #333;
        }
        
        .subtitle {
          font-size: ${sizeConfig.subtitleSize}px;
          margin-bottom: ${sizeConfig.margin}px;
          color: #666;
        }
        
        .barcode-container {
          margin: ${sizeConfig.margin}px 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .barcode-code {
          font-family: 'Courier New', monospace;
          font-size: ${sizeConfig.codeSize}px;
          margin: ${sizeConfig.margin}px 0;
          word-break: break-all;
          color: #333;
        }
        
        .date {
          font-size: ${sizeConfig.dateSize}px;
          color: #888;
          margin-top: ${sizeConfig.margin}px;
        }
        
        .barcode-type {
          font-size: ${sizeConfig.typeSize}px;
          color: #666;
          margin-bottom: ${sizeConfig.margin}px;
          font-style: italic;
        }
        
        /* Barkod görselleştirme için */
        .barcode-visual {
          width: 100%;
          height: ${sizeConfig.barcodeHeight}px;
          background: repeating-linear-gradient(
            90deg,
            #000 0px,
            #000 ${sizeConfig.barWidth}px,
            transparent ${sizeConfig.barWidth}px,
            transparent ${sizeConfig.barSpacing}px
          );
          margin: 10px 0;
        }
        
        /* QR Code için */
        .qr-code {
          width: ${sizeConfig.qrSize}px;
          height: ${sizeConfig.qrSize}px;
          border: 1px solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          text-align: center;
          margin: 0 auto;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .barcode-label {
            border: none;
            box-shadow: none;
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="barcode-label">
        <div class="title">${title}</div>
        ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
        <div class="barcode-type">${barcodeType}</div>
        
        <div class="barcode-container">
          ${createBarcodeVisual(barcodeCode, barcodeType, sizeConfig)}
        </div>
        
        ${showCode ? `<div class="barcode-code">${barcodeCode}</div>` : ''}
        ${showDate ? `<div class="date">${new Date().toLocaleDateString('tr-TR')}</div>` : ''}
      </div>
    </body>
    </html>
  `;
}

function getSizeConfig(size: string) {
  const configs = {
    small: {
      pageSize: 'A6',
      padding: 8,
      maxWidth: 200,
      titleSize: 12,
      subtitleSize: 10,
      codeSize: 8,
      dateSize: 8,
      typeSize: 9,
      margin: 4,
      barcodeHeight: 40,
      barWidth: 2,
      barSpacing: 4,
      qrSize: 60,
    },
    medium: {
      pageSize: 'A5',
      padding: 15,
      maxWidth: 300,
      titleSize: 16,
      subtitleSize: 14,
      codeSize: 12,
      dateSize: 10,
      typeSize: 12,
      margin: 8,
      barcodeHeight: 60,
      barWidth: 3,
      barSpacing: 6,
      qrSize: 80,
    },
    large: {
      pageSize: 'A4',
      padding: 20,
      maxWidth: 400,
      titleSize: 20,
      subtitleSize: 16,
      codeSize: 14,
      dateSize: 12,
      typeSize: 14,
      margin: 12,
      barcodeHeight: 80,
      barWidth: 4,
      barSpacing: 8,
      qrSize: 120,
    },
  };
  
  return configs[size as keyof typeof configs] || configs.medium;
}

function createBarcodeVisual(barcodeCode: string, barcodeType: string, config: any): string {
  if (barcodeType.includes('QR') || barcodeType.includes('DataMatrix')) {
    return `
      <div class="qr-code">
        <div>
          QR Code<br/>
          ${barcodeCode.length > 20 ? barcodeCode.substring(0, 20) + '...' : barcodeCode}
        </div>
      </div>
    `;
  }
  
  // Basit barkod görselleştirmesi
  return `<div class="barcode-visual"></div>`;
}

// Toplu yazdırma fonksiyonu
export function printMultipleBarcodes(
  barcodes: Array<{
    barcodeCode: string;
    barcodeType: string;
    stockCardName?: string;
  }>,
  options: PrintOptions = {}
) {
  if (barcodes.length === 0) {
    alert('Yazdırılacak barkod bulunamadı.');
    return;
  }

  if (barcodes.length === 1) {
    printBarcode(
      barcodes[0].barcodeCode,
      barcodes[0].barcodeType,
      barcodes[0].stockCardName,
      options
    );
    return;
  }

  // Toplu yazdırma için HTML oluştur
  const printContent = createMultiplePrintContent(barcodes, options);
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up blokeri nedeniyle yazdırma penceresi açılamadı.');
    return;
  }

  printWindow.document.write(printContent);
  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 500);
  };
}

function createMultiplePrintContent(barcodes: any[], options: PrintOptions): string {
  const sizeConfig = getSizeConfig(options.size || 'medium');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Toplu Barkod Yazdırma</title>
      <meta charset="utf-8">
      <style>
        @page {
          size: A4;
          margin: 10mm;
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background: white;
        }
        
        .barcode-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(${sizeConfig.maxWidth}px, 1fr));
          gap: 10px;
          padding: 10px;
        }
        
        .barcode-label {
          text-align: center;
          border: 1px solid #ccc;
          padding: ${sizeConfig.padding}px;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          page-break-inside: avoid;
        }
        
        .title {
          font-size: ${sizeConfig.titleSize}px;
          font-weight: bold;
          margin-bottom: ${sizeConfig.margin}px;
          color: #333;
        }
        
        .subtitle {
          font-size: ${sizeConfig.subtitleSize}px;
          margin-bottom: ${sizeConfig.margin}px;
          color: #666;
        }
        
        .barcode-container {
          margin: ${sizeConfig.margin}px 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .barcode-code {
          font-family: 'Courier New', monospace;
          font-size: ${sizeConfig.codeSize}px;
          margin: ${sizeConfig.margin}px 0;
          word-break: break-all;
          color: #333;
        }
        
        .date {
          font-size: ${sizeConfig.dateSize}px;
          color: #888;
          margin-top: ${sizeConfig.margin}px;
        }
        
        .barcode-type {
          font-size: ${sizeConfig.typeSize}px;
          color: #666;
          margin-bottom: ${sizeConfig.margin}px;
          font-style: italic;
        }
        
        .barcode-visual {
          width: 100%;
          height: ${sizeConfig.barcodeHeight}px;
          background: repeating-linear-gradient(
            90deg,
            #000 0px,
            #000 ${sizeConfig.barWidth}px,
            transparent ${sizeConfig.barWidth}px,
            transparent ${sizeConfig.barSpacing}px
          );
          margin: 10px 0;
        }
        
        .qr-code {
          width: ${sizeConfig.qrSize}px;
          height: ${sizeConfig.qrSize}px;
          border: 1px solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          text-align: center;
          margin: 0 auto;
        }
        
        @media print {
          .barcode-label {
            border: none;
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="barcode-grid">
        ${barcodes.map(barcode => `
          <div class="barcode-label">
            <div class="title">${options.title || 'Barkod Etiketi'}</div>
            ${barcode.stockCardName ? `<div class="subtitle">${barcode.stockCardName}</div>` : ''}
            <div class="barcode-type">${barcode.barcodeType}</div>
            
            <div class="barcode-container">
              ${createBarcodeVisual(barcode.barcodeCode, barcode.barcodeType, sizeConfig)}
            </div>
            
            ${options.showCode !== false ? `<div class="barcode-code">${barcode.barcodeCode}</div>` : ''}
            ${options.showDate !== false ? `<div class="date">${new Date().toLocaleDateString('tr-TR')}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
}
