
import { useEffect, useState } from 'react';
import { useProducts } from '@/contexts/ProductsContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle, Clock, Check, Package } from 'lucide-react';
import { ProductCategory } from '@/types';

const Dashboard = () => {
  const { products, getExpiringProducts } = useProducts();
  const [categoryCounts, setCategoryCounts] = useState<Record<ProductCategory, number>>({
    food: 0,
    medicine: 0,
    cosmetics: 0,
    other: 0,
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Count products by category
    const counts = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<ProductCategory, number>);

    // Ensure all categories are represented
    setCategoryCounts({
      food: counts.food || 0,
      medicine: counts.medicine || 0,
      cosmetics: counts.cosmetics || 0,
      other: counts.other || 0,
    });
  }, [products]);

  // Products expiring in next 7 days
  const expiringIn7Days = getExpiringProducts(7);
  // Products expiring in next 24 hours
  const expiringIn24Hours = getExpiringProducts(1);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <Button onClick={() => navigate('/add-product')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {products.length === 1 ? 'item' : 'items'} in your inventory
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Clock className="h-4 w-4 text-warning-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiringIn7Days.length}</div>
              <p className="text-xs text-muted-foreground">
                Products expiring in the next 7 days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <AlertTriangle className="h-4 w-4 text-expire-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiringIn24Hours.length}</div>
              <p className="text-xs text-muted-foreground">
                Products expiring in the next 24 hours
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Status</CardTitle>
              <Check className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {expiringIn24Hours.length === 0 ? 'Good' : 'Attention Needed'}
              </div>
              <p className="text-xs text-muted-foreground">
                {expiringIn24Hours.length === 0 
                  ? 'No products expiring today' 
                  : `${expiringIn24Hours.length} product(s) expiring today`}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Products by Category</CardTitle>
              <CardDescription>
                Breakdown of your inventory by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryCounts).map(([category, count]) => (
                  <div key={category} className="flex items-center">
                    <div className="w-16 text-sm font-medium capitalize">{category}</div>
                    <div className="flex-1">
                      <div className="flex h-2 overflow-hidden rounded bg-secondary">
                        <div 
                          className={`${
                            category === 'food' ? 'bg-teal-500' :
                            category === 'medicine' ? 'bg-blue-500' :
                            category === 'cosmetics' ? 'bg-purple-500' : 'bg-gray-500'
                          }`}
                          style={{ width: products.length ? `${(count / products.length) * 100}%` : '0' }}
                        />
                      </div>
                    </div>
                    <div className="w-10 text-right text-sm font-medium">{count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you might want to perform</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" className="justify-start" onClick={() => navigate('/add-product')}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/products', { state: { showExpiring: true } })}>
                <AlertTriangle className="mr-2 h-4 w-4 text-warning-500" />
                View Expiring Products
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/products')}>
                <Package className="mr-2 h-4 w-4" />
                View All Products
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user?.username}!</CardTitle>
            <CardDescription>
              Expiry Guardian helps you track your products before they expire.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">
              <p>
                Use the sidebar menu to navigate the app. Add products, view your inventory,
                and get notified before items expire. The top bar will alert you of products expiring within 24 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default Dashboard;
