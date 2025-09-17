import { CONFIG } from 'src/config-global';

import { GroupsView } from 'src/sections/groups/view/groups-view';

export default function Page() {
  return (
    <>
      <title>{`Gruplar - ${CONFIG.appName}`}</title>
      <GroupsView />
    </>
  );
}
