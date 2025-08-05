import { CONFIG } from 'src/config-global';

import { CompaniesView } from 'src/sections/companies/view/companies-view';

export default function Page() {
  return (
    <>
      <title>{`Şirketler - ${CONFIG.appName}`}</title>
      <CompaniesView />
    </>
  );
} 