import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { _posts, _tasks, _traffic, _timeline } from 'src/_mock';

import { Iconify } from 'src/components/iconify';
import { useAuth } from 'src/contexts/auth-context';
import { useRouter } from 'src/routes/hooks';
import { AdminOnly, CanCreate } from 'src/components/permission';

import { CompanyService, StockService, StockTransactionService, WarehouseService } from 'src/services/api';

import { AnalyticsConversionRates } from '../analytics-conversion-rates';
import { AnalyticsCurrentSubject } from '../analytics-current-subject';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsNews } from '../analytics-news';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsTasks } from '../analytics-tasks';
import { AnalyticsTrafficBySite } from '../analytics-traffic-by-site';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const { user, isAdminUser } = useAuth();
  const router = useRouter();

  // Gerçek verileri çek
  const { data: stockCards, isLoading: stockCardsLoading } = useQuery({
    queryKey: ['stockCards'],
    queryFn: async () => {
      try {
        const response = await StockService.getStockCards();
        console.log('🔍 Dashboard - Stock cards response:', response);
        console.log('🔍 Dashboard - Stock cards response.data:', response.data);
        console.log('🔍 Dashboard - Stock cards response.data type:', typeof response.data);
        console.log('🔍 Dashboard - Stock cards response.data isArray:', Array.isArray(response.data));
        
        return response.data || [];
      } catch (error) {
        console.error('❌ Dashboard - Stock cards error:', error);
        return [];
      }
    },
  });

  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        const response = await CompanyService.getCompanies();
        console.log('🔍 Dashboard - Companies response:', response);
        console.log('🔍 Dashboard - Companies response.data:', response.data);
        console.log('🔍 Dashboard - Companies response.data type:', typeof response.data);
        console.log('🔍 Dashboard - Companies response.data isArray:', Array.isArray(response.data));
        
        return response.data || [];
      } catch (error) {
        console.error('❌ Dashboard - Companies error:', error);
        return [];
      }
    },
  });

  const { data: warehouses, isLoading: warehousesLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      try {
        const response = await WarehouseService.getWarehouses();
        console.log('🔍 Dashboard - Warehouses response:', response);
        console.log('🔍 Dashboard - Warehouses response.data:', response.data);
        console.log('🔍 Dashboard - Warehouses response.data type:', typeof response.data);
        console.log('🔍 Dashboard - Warehouses response.data isArray:', Array.isArray(response.data));
        
        // response.data zaten WarehouseDto[] array'i olmalı
        return response.data || [];
      } catch (error) {
        console.error('❌ Dashboard - Warehouses error:', error);
        return [];
      }
    },
  });

  const { data: stockTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['stockTransactions'],
    queryFn: async () => {
      try {
        const stockTransactionService = new StockTransactionService();
        const response = await stockTransactionService.getStockTransactions();
        console.log('🔍 Dashboard - Stock transactions response:', response);
        console.log('🔍 Dashboard - Stock transactions response.data:', response.data);
        console.log('🔍 Dashboard - Stock transactions response.data type:', typeof response.data);
        console.log('🔍 Dashboard - Stock transactions response.data isArray:', Array.isArray(response.data));
        
        return response.data || [];
      } catch (error) {
        console.error('❌ Dashboard - Stock transactions error:', error);
        return [];
      }
    },
  });

  // İstatistikleri hesapla
  const totalStockCards = Array.isArray(stockCards) ? stockCards.length : 0;
  const totalCompanies = Array.isArray(companies) ? companies.length : 0;
  const totalWarehouses = Array.isArray(warehouses) ? warehouses.length : 0;
  const activeWarehouses = Array.isArray(warehouses) ? warehouses.filter(w => w.isActive)?.length || 0 : 0;
  const totalTransactions = Array.isArray(stockTransactions) ? stockTransactions.length : 0;
  
  // Bu ayki işlemleri hesapla
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthTransactions = Array.isArray(stockTransactions) ? stockTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.transactionDate);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  })?.length || 0 : 0;

  const isLoading = stockCardsLoading || companiesLoading || warehousesLoading || transactionsLoading;

  const quickActions = [
    {
      title: 'Stok Kartları',
      description: 'Ürün kartlarını yönetin',
      icon: 'solar:cart-3-bold' as const,
      color: 'primary',
      path: '/dashboard/stock-cards'
    },
    {
      title: 'Stok İşlemleri',
      description: 'Giriş/çıkış işlemleri',
      icon: 'solar:restart-bold' as const,
      color: 'success',
      path: '/dashboard/stock-transactions'
    },
    {
      title: 'Şirketler',
      description: 'Şirket bilgilerini yönetin',
      icon: 'solar:check-circle-bold' as const,
      color: 'info',
      path: '/dashboard/companies'
    },
    {
      title: 'Depolar',
      description: 'Depo yönetimi',
      icon: 'solar:home-angle-bold-duotone' as const,
      color: 'warning',
      path: '/dashboard/warehouses'
    }
  ];

  return (
    <DashboardContent maxWidth="xl">
            <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
              Hoş Geldiniz, {user?.fullName || user?.username || 'Kullanıcı'}! 👋
            </Typography>

            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
              Stok Takip ve Yönetim Sistemi Dashboard&apos;una hoş geldiniz. 
              {isAdminUser ? ' Tüm sistemi yönetebilirsiniz.' : ' Yetkili olduğunuz alanları kullanabilirsiniz.'}
            </Typography>

      <Grid container spacing={3}>
        {/* Hızlı Erişim Kartları */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Hızlı Erişim
          </Typography>
        </Grid>

        {quickActions.map((action) => (
          <Grid key={action.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => router.push(action.path)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: `${action.color}.light`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <Iconify 
                    icon={action.icon as any} 
                    sx={{ 
                      fontSize: 32, 
                      color: `${action.color}.main` 
                    }} 
                  />
                </Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Sistem İstatistikleri - Sadece Admin için full istatistik */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
            Sistem İstatistikleri
          </Typography>
        </Grid>

        {isLoading ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AnalyticsWidgetSummary
                title="Toplam Stok Kartı"
                percent={totalStockCards > 0 ? 12.5 : 0}
                total={totalStockCards}
                icon={<Iconify icon="solar:cart-3-bold" sx={{ fontSize: 32 }} />}
                chart={{
                  categories: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
                  series: [22, 8, 35, 50, 82, 84],
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AnalyticsWidgetSummary
                title={isAdminUser ? "Aktif Depo" : "Erişilebilir Depo"}
                percent={activeWarehouses > 0 ? 8.2 : 0}
                total={activeWarehouses}
                color="secondary"
                icon={<Iconify icon="solar:home-angle-bold-duotone" sx={{ fontSize: 32 }} />}
                chart={{
                  categories: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
                  series: [56, 47, 40, 62, 73, 30],
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AnalyticsWidgetSummary
                title="Bu Ay İşlem"
                percent={thisMonthTransactions > 0 ? 15.3 : 0}
                total={thisMonthTransactions}
                color="warning"
                icon={<Iconify icon="solar:cart-3-bold" sx={{ fontSize: 32 }} />}
                chart={{
                  categories: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
                  series: [40, 70, 50, 28, 70, 75],
                }}
              />
            </Grid>

            <AdminOnly>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <AnalyticsWidgetSummary
                  title="Toplam Şirket"
                  percent={totalCompanies > 0 ? 5.4 : 0}
                  total={totalCompanies}
                  color="error"
                  icon={<Iconify icon="solar:bell-bing-bold-duotone" sx={{ fontSize: 32 }} />}
                  chart={{
                    categories: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
                    series: [56, 30, 23, 54, 47, 40],
                  }}
                />
              </Grid>
            </AdminOnly>
          </>
        )}

        {/* Stok Durumu Grafiği */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Stok Durumu"
            chart={{
              series: [
                { label: 'Mevcut Stok', value: 3500 },
                { label: 'Kritik Seviye', value: 250 },
                { label: 'Tükendi', value: 15 },
                { label: 'Rezerv', value: 500 },
              ],
            }}
          />
        </Grid>

        {/* Aylık İşlem Grafiği */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsWebsiteVisits
            title="Aylık Stok İşlemleri"
            subheader="(+23%) geçen aya göre"
            chart={{
              categories: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl'],
              series: [
                { name: 'Giriş', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                { name: 'Çıkış', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
              ],
            }}
          />
        </Grid>

        {/* Son İşlemler */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Son Stok İşlemleri
              </Typography>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : Array.isArray(stockTransactions) && stockTransactions.length > 0 ? (
                <Stack spacing={2}>
                  {stockTransactions.slice(0, 4).map((transaction, index) => (
                    <Box key={transaction.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: transaction.type === 1 ? 'success.main' : 'error.main' 
                        }} 
                      />
                      <Typography variant="body2">
                        {transaction.stockCardName} - {transaction.warehouseName} 
                        {transaction.type === 1 ? 'ya' : 'den'} {transaction.quantity} adet 
                        {transaction.type === 1 ? ' eklendi' : ' çıkarıldı'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        {new Date(transaction.transactionDate).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Henüz stok işlemi bulunmuyor
                </Typography>
              )}
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => router.push('/dashboard/stock-transactions')}
              >
                Tüm İşlemleri Görüntüle
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Sistem Bilgileri */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Sistem Bilgileri
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Sistem Versiyonu</Typography>
                  <Typography variant="body2" color="text.secondary">v1.0.0</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Son Güncelleme</Typography>
                  <Typography variant="body2" color="text.secondary">Bugün</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Aktif Kullanıcı</Typography>
                  <Typography variant="body2" color="text.secondary">{user?.fullName || 'Bilinmiyor'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Rol</Typography>
                  <Typography variant="body2" color="text.secondary">{user?.roles?.[0] || 'User'}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
