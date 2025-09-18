import { CONFIG } from 'src/config-global';

import { OverviewAnalyticsView as DashboardView } from 'src/sections/overview/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Dashboard - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="Stok Takip ve Yönetim Sistemi Dashboard - Stok kartları, işlemler, şirketler ve depoları yönetin"
      />
      <meta name="keywords" content="stok,takip,yönetim,sistem,dashboard,yönetim" />

      <DashboardView />
    </>
  );
}
