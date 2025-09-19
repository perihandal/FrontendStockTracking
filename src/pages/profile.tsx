import { CONFIG } from 'src/config-global';

import { ProfileView } from 'src/sections/profile/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Profil - ${CONFIG.appName}`}</title>
      <ProfileView />
    </>
  );
}