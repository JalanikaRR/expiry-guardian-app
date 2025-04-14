
import { useEffect, useState } from 'react';
import { useProducts } from '@/contexts/ProductsContext';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ProductCategory } from '@/types';

interface CategoryStats {
  name: string;
  value: number;
}

interface ExpiryStats {
  name: string;
  count: number;
}

const COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#115e59'];
const STATUS_COLORS = {
  expired: '#dc2626',
  'expiring-soon': '#f97316',
  valid: '#14b8a6',
};

const Statistics = () => {
  const { products } = useProducts();
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [expiryStats, setExpiryStats] = useState<ExpiryStats[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [expiryStatusCounts, setExpiryStatusCounts] = useState({
    expired: 0,
    expiringWithin7Days: 0,
    valid: 0,
  });

  useEffect(() => {
    if (products.length === 0) return;

    // Calculate category statistics
    const categoryCount: Record<ProductCategory, number> = {
      food: 0,
      medicine: 0,
      cosmetics: 0,
      other: 0,
    };

    products.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    });

    const categoryStatsData = Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);

    setCategoryStats(categoryStatsData);
    setTotalProducts(products.length);

    // Calculate expiry statistics
    const now = new Date();
    const in7Days = new Date(now);
    in7Days.setDate(now.getDate() + 7);
    const in14Days = new Date(now);
    in14Days.setDate(now.getDate() + 14);
    const in30Days = new Date(now);
    in30Days.setDate(now.getDate() + 30);

    let expired = 0;
    let next7Days = 0;
    let next8to14Days = 0;
    let next15to30Days = 0;
    let moreThan30Days = 0;

    products.forEach(product => {
      const expiryDate = new Date(product.expiryDate);
      if (expiryDate < now) {
        expired++;
      } else if (expiryDate <= in7Days) {
        next7Days++;
      } else if (expiryDate <= in14Days) {
        next8to14Days++;
      } else if (expiryDate <= in30Days) {
        next15to30Days++;
      } else {
        moreThan30Days++;
      }
    });

    setExpiryStats([
      { name: 'Expired', count: expired },
      { name: '< 7 days', count: next7Days },
      { name: '8-14 days', count: next8to14Days },
      { name: '15-30 days', count: next15to30Days },
      { name: '> 30 days', count: moreThan30Days },
    ]);

    setExpiryStatusCounts({
      expired,
      expiringWithin7Days: next7Days,
      valid: next8to14Days + next15to30Days + moreThan30Days,
    });

  }, [products]);

  const getExpiryPercentage = (count: number) => {
    return totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0;
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Product Status</CardTitle>
              <CardDescription>
                Current status of your product inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="destructive">Expired</Badge>
                  <span className="text-sm font-semibold">
                    {expiryStatusCounts.expired} ({getExpiryPercentage(expiryStatusCounts.expired)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="warning">Expiring Soon</Badge>
                  <span className="text-sm font-semibold">
                    {expiryStatusCounts.expiringWithin7Days} ({getExpiryPercentage(expiryStatusCounts.expiringWithin7Days)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="success">Valid</Badge>
                  <span className="text-sm font-semibold">
                    {expiryStatusCounts.valid} ({getExpiryPercentage(expiryStatusCounts.valid)}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Product Categories</CardTitle>
              <CardDescription>
                Distribution of products by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {categoryStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={1}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [
                          `${value} products`,
                          'Count'
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No product data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiry Timeline</CardTitle>
            <CardDescription>
              Distribution of products by expiry timeframe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {expiryStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={expiryStats}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [
                        `${value} products`,
                        'Count'
                      ]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="count" 
                      name="Products" 
                      fill="#14b8a6" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No product data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default Statistics;
