
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductsContext';
import { Product } from '@/types';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { 
  Search, 
  Plus, 
  AlertTriangle, 
  Trash2,
  Clock, 
  Filter
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ViewProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { products, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterExpiryStatus, setFilterExpiryStatus] = useState('all');
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deletionReason, setDeletionReason] = useState<'consumed' | 'expired' | 'discarded' | 'other'>('consumed');
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');
  
  // Check if we should show expiring products from navigation state
  useEffect(() => {
    if (location.state?.showExpiring) {
      setFilterExpiryStatus('expiring-soon');
    }
  }, [location.state]);
  
  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    // Search term filter
    const searchMatch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.notes && product.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Category filter
    const categoryMatch = filterCategory === 'all' || product.category === filterCategory;
    
    // Expiry status filter
    let expiryMatch = true;
    const now = new Date();
    const expiryDate = new Date(product.expiryDate);
    
    if (filterExpiryStatus === 'expired') {
      expiryMatch = isBefore(expiryDate, now);
    } else if (filterExpiryStatus === 'expiring-soon') {
      expiryMatch = isBefore(expiryDate, addDays(now, 7)) && isAfter(expiryDate, now);
    } else if (filterExpiryStatus === 'valid') {
      expiryMatch = isAfter(expiryDate, addDays(now, 7));
    }
    
    return searchMatch && categoryMatch && expiryMatch;
  });
  
  const handleDeleteConfirm = () => {
    if (deleteProductId) {
      deleteProduct(deleteProductId, deletionReason);
      setDeleteProductId(null);
    }
  };
  
  const getExpiryStatusBadge = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    
    if (isBefore(expiry, now)) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (isBefore(expiry, addDays(now, 1))) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Expires Today
      </Badge>;
    } else if (isBefore(expiry, addDays(now, 3))) {
      return <Badge variant="warning" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Expires in {Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days
      </Badge>;
    } else {
      return <Badge variant="success">
        Valid until {format(expiry, 'MMM d, yyyy')}
      </Badge>;
    }
  };
  
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold tracking-tight">Your Products</h1>
          <Button onClick={() => navigate('/add-product')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Product Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name, category or notes..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2 sm:w-auto">
                  <Select 
                    value={filterCategory} 
                    onValueChange={setFilterCategory}
                  >
                    <SelectTrigger className="w-[130px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <span>Category</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="medicine">Medicine</SelectItem>
                      <SelectItem value="cosmetics">Cosmetics</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={filterExpiryStatus} 
                    onValueChange={setFilterExpiryStatus}
                  >
                    <SelectTrigger className="w-[150px]">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Expiry Status</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                      <SelectItem value="valid">Valid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Tabs defaultValue="grid" onValueChange={(v) => setDisplayMode(v as 'grid' | 'table')}>
                <div className="flex justify-between items-center">
                  <TabsList>
                    <TabsTrigger value="grid">Grid View</TabsTrigger>
                    <TabsTrigger value="table">Table View</TabsTrigger>
                  </TabsList>
                  <div className="text-sm text-muted-foreground">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </div>
                </div>
                
                <TabsContent value="grid" className="pt-4">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No products match your filters</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredProducts.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium">{product.name}</h3>
                              <Badge variant="outline" className="capitalize">
                                {product.category}
                              </Badge>
                            </div>
                            
                            <div className="mt-2 space-y-2">
                              {getExpiryStatusBadge(product.expiryDate)}
                              
                              {product.category === 'food' && product.storageInstructions && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  Storage: {product.storageInstructions}
                                </p>
                              )}
                              
                              {product.category === 'medicine' && product.dosage && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  Dosage: {product.dosage}
                                </p>
                              )}
                              
                              {product.notes && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {product.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-muted/50 p-2 flex justify-end">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-expire-500 hover:text-expire-700 hover:bg-expire-50"
                                  onClick={() => setDeleteProductId(product.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Remove Product</DialogTitle>
                                  <DialogDescription>
                                    Why are you removing this product?
                                  </DialogDescription>
                                </DialogHeader>
                                <Select 
                                  value={deletionReason} 
                                  onValueChange={(v) => setDeletionReason(v as any)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a reason" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="consumed">Consumed</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                    <SelectItem value="discarded">Discarded</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <DialogFooter>
                                  <Button 
                                    variant="destructive" 
                                    onClick={handleDeleteConfirm}
                                  >
                                    Remove Product
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="table" className="pt-4">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No products match your filters</p>
                    </div>
                  ) : (
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-4 py-2 text-left font-medium">Name</th>
                            <th className="px-4 py-2 text-left font-medium">Category</th>
                            <th className="px-4 py-2 text-left font-medium">Expiry Date</th>
                            <th className="px-4 py-2 text-left font-medium">Status</th>
                            <th className="px-4 py-2 text-right font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((product) => (
                            <tr key={product.id} className="border-t">
                              <td className="px-4 py-2">{product.name}</td>
                              <td className="px-4 py-2 capitalize">{product.category}</td>
                              <td className="px-4 py-2">{format(new Date(product.expiryDate), 'MMM d, yyyy')}</td>
                              <td className="px-4 py-2">{getExpiryStatusBadge(product.expiryDate)}</td>
                              <td className="px-4 py-2 text-right">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="text-expire-500 hover:text-expire-700 hover:bg-expire-50"
                                      onClick={() => setDeleteProductId(product.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Remove
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Remove Product</DialogTitle>
                                      <DialogDescription>
                                        Why are you removing this product?
                                      </DialogDescription>
                                    </DialogHeader>
                                    <Select 
                                      value={deletionReason} 
                                      onValueChange={(v) => setDeletionReason(v as any)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a reason" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="consumed">Consumed</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                        <SelectItem value="discarded">Discarded</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <DialogFooter>
                                      <Button 
                                        variant="destructive" 
                                        onClick={handleDeleteConfirm}
                                      >
                                        Remove Product
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default ViewProducts;
