import { CONFIG } from 'src/config-global';

import { StockTransactionsView } from 'src/sections/stock-transactions/view/stock-transactions-view';

export default function Page() {
  return (
    <>
      <title>{`Stok İşlemleri - ${CONFIG.appName}`}</title>
      <StockTransactionsView />
    </>
  );
} 