import { CONFIG } from 'src/config-global';

import { CategoriesView } from 'src/sections/categories/view/categories-view';

export default function Page() {
  return (
    <>
      <title>{`Kategoriler - ${CONFIG.appName}`}</title>
      <CategoriesView />
    </>
  );
} 