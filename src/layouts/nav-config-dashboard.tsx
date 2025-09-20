import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';
import { useAuth } from 'src/contexts/auth-context';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
  roles?: string[]; // Hangi roller bu menüye erişebilir
};

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: icon('ic-analytics'),
    roles: ['Admin', 'Editor', 'User'], // Herkes erişebilir
  },
  {
    title: 'Stok Kartları',
    path: '/dashboard/stock-cards',
    icon: icon('ic-box'),
    roles: ['Admin', 'Editor', 'User'], // Herkes erişebilir (okuma), CRUD için ayrı kontrol
  },
  {
    title: 'Stok İşlemleri',
    path: '/dashboard/stock-transactions',
    icon: icon('ic-cart'),
    info: (
      <Label color="error" variant="inverted">
        +5
      </Label>
    ),
    roles: ['Admin', 'Editor', 'User'], // Herkes erişebilir
  },
  {
    title: 'Şirketler',
    path: '/dashboard/companies',
    icon: icon('ic-user'),
    roles: ['Admin', 'Editor'], // Admin: Tüm şirketler, Editor: Kendi şirketi (yetki tablosuna göre)
  },
  {
    title: 'Şubeler',
    path: '/dashboard/branches',
    icon: icon('ic-blog'),
    roles: ['Admin', 'Editor'], // Admin: Tüm şubeler, Editor: Kendi şirketindeki şubeler
  },
  {
    title: 'Depolar',
    path: '/dashboard/warehouses',
    icon: icon('ic-lock'),
    roles: ['Admin', 'Editor', 'User'], // Herkes okuyabilir (yetki tablosuna göre)
  },
  {
    title: 'Depo Stokları',
    path: '/dashboard/warehouse-stocks',
    icon: icon('ic-cart'),
    roles: ['Admin', 'Editor', 'User'], // Herkes okuyabilir (yetki tablosuna göre)
  },
  {
    title: 'Barkodlar',
    path: '/dashboard/barcodes',
    icon: icon('ic-barcode'),
    roles: ['Admin', 'Editor', 'User'], // Admin, Editor ve User
  },
  {
    title: 'Kategoriler',
    path: '/dashboard/categories',
    icon: icon('ic-disabled'),
    roles: ['Admin', 'Editor', 'User'], // Herkes okuyabilir (yetki tablosuna göre)
  },
  {
    title: 'Gruplar',
    path: '/dashboard/groups',
    icon: icon('ic-blog'),
    roles: ['Admin', 'Editor', 'User'], // Herkes okuyabilir
  },
  {
    title: 'Fiyat Yönetimi',
    path: '/dashboard/prices',
    icon: icon('ic-analytics'),
    roles: ['Admin', 'Editor', 'User'], // Admin, Editor ve User
  },
  {
    title: 'Kullanıcılar',
    path: '/dashboard/users',
    icon: icon('ic-user'),
    roles: ['Admin'], // Sadece Admin
  },
];

// Role-based filtering function
export const useNavData = (): NavItem[] => {
  const { hasRole, user } = useAuth();
  
  console.log('🔍 useNavData - Current user:', user);
  console.log('🔍 useNavData - User roles:', user?.roles);
  
  const filteredItems = navItems.filter(item => {
    if (!item.roles || item.roles.length === 0) {
      return true; // Rol kontrolü yoksa herkese izin ver
    }
    const hasAccess = item.roles.some(role => hasRole(role));
    console.log(`🔍 useNavData - Menu "${item.title}" roles: ${item.roles.join(', ')}, hasAccess: ${hasAccess}`);
    return hasAccess;
  });
  
  console.log('🔍 useNavData - Filtered menu items:', filteredItems.map(item => item.title));
  return filteredItems;
};

// Backward compatibility - deprecated
export const navData = navItems;

// Debug için console.log ekleyelim
console.log('navData yüklendi:', navItems);
