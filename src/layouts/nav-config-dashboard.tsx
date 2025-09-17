import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Stok Kartları',
    path: '/stock-cards',
    icon: icon('ic-box'),
  },
  {
    title: 'Stok İşlemleri',
    path: '/stock-transactions',
    icon: icon('ic-cart'),
    info: (
      <Label color="error" variant="inverted">
        +5
      </Label>
    ),
  },
  {
    title: 'Şirketler',
    path: '/companies',
    icon: icon('ic-user'),
  },
  {
    title: 'Şubeler',
    path: '/branches',
    icon: icon('ic-blog'),
  },
  {
    title: 'Depolar',
    path: '/warehouses',
    icon: icon('ic-lock'),
  },
  {
    title: 'Barkodlar',
    path: '/barcodes',
    icon: icon('ic-barcode'),
  },
  {
    title: 'Kategoriler',
    path: '/categories',
    icon: icon('ic-disabled'),
  },
      {
        title: 'Gruplar',
        path: '/groups',
        icon: icon('ic-blog'),
      },
      {
        title: 'Fiyat Yönetimi',
        path: '/prices',
        icon: icon('ic-analytics'),
      },
  {
    title: 'Kullanıcılar',
    path: '/users',
    icon: icon('ic-user'),
  },
];

// Debug için console.log ekleyelim
console.log('navData yüklendi:', navData);
