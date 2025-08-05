import { CONFIG } from 'src/config-global';

import { StockCardsView } from 'src/sections/stock-cards/view/stock-cards-view';

export default function Page() {
  return (
    <>
      <title>{`Stok Kartları - ${CONFIG.appName}`}</title>
      <StockCardsView />
    </>
  );
} 