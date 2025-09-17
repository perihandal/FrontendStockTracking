import { CONFIG } from 'src/config-global';

import { PricesView } from 'src/sections/prices/view/prices-view';

export default function Page() {
  return (
    <>
      <title>{`Fiyat Yönetimi - ${CONFIG.appName}`}</title>
      <PricesView />
    </>
  );
}
