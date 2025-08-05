import { CONFIG } from 'src/config-global';

import { WarehousesView } from 'src/sections/warehouses/view/warehouses-view';

export default function Page() {
  return (
    <>
      <title>{`Depolar - ${CONFIG.appName}`}</title>
      <WarehousesView />
    </>
  );
} 