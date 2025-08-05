import { CONFIG } from 'src/config-global';

import { StockView } from 'src/sections/stock/view/stock-view';

export default function Page() {
  return (
    <>
      <title>{`Stock Kartları - ${CONFIG.appName}`}</title>
      <StockView />
    </>
  );
}