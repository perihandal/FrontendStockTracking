import { BarcodesView } from 'src/sections/barcodes/view/barcodes-view';

export default function BarcodesPage() {
  return (
    <>
      <title>Barkod Yönetimi | Minimal UI</title>
      <meta
        name="description"
        content="Barkod yönetim sistemi - QR Code, EAN13, UPC-A ve diğer barkod türlerini yönetin"
      />
      <meta name="keywords" content="barkod,qr code,ean13,upc,stok yönetimi" />

      <BarcodesView />
    </>
  );
}
