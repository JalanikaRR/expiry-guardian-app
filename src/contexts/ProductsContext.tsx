import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product, ProductsContextType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import * as ProductApi from '@/api/products';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Milk',
    category: 'food',
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    createdAt: new Date().toISOString(),
    storageInstructions: 'Keep refrigerated',
    opened: false
  },
  {
    id: '2',
    name: 'Ibuprofen',
    category: 'medicine',
    expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    createdAt: new Date().toISOString(),
    dosage: '200mg',
    prescriptionDetails: 'Take with food',
    frequency: 'Every 6 hours as needed'
  },
  {
    id: '3',
    name: 'Bread',
    category: 'food',
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    createdAt: new Date().toISOString(),
    storageInstructions: 'Store in a cool, dry place',
    opened: true,
    openedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // Opened 2 days ago
  }
];

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadProducts = async () => {
      if (!user) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const loadedProducts = await ProductApi.getAllProducts(user.id);
        setProducts(loadedProducts);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load products from Supabase:', err);
        setError('Failed to load products. Using fallback data.');
        
        setProducts(mockProducts);
        setLoading(false);
      }
    };

    loadProducts();
  }, [user]);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      setLoading(true);
      const newProduct = await ProductApi.addProduct({
        ...product,
        userId: user.id
      });
      
      setProducts(prev => [...prev, newProduct]);
      setLoading(false);
      
      toast({
        title: 'Product added',
        description: `${product.name} has been added successfully.`,
      });
    } catch (err) {
      setError('Failed to add product');
      setLoading(false);
      console.error(err);
    }
  };

  const updateProduct = async (id: string, updatedData: Partial<Product>) => {
    try {
      setLoading(true);
      await ProductApi.updateProduct(id, updatedData);
      
      const updatedProducts = products.map(product => 
        product.id === id ? { ...product, ...updatedData } : product
      );
      
      setProducts(updatedProducts);
      setLoading(false);
      
      toast({
        title: 'Product updated',
        description: `Product has been updated.`,
      });
    } catch (err) {
      setError('Failed to update product');
      setLoading(false);
      console.error(err);
    }
  };

  const deleteProduct = async (id: string, reason: Product['deletionReason']) => {
    try {
      setLoading(true);
      await ProductApi.deleteProduct(id, reason);
      
      const product = products.find(p => p.id === id);
      const updatedProducts = products.filter(p => p.id !== id);
      
      setProducts(updatedProducts);
      setLoading(false);
      
      toast({
        title: 'Product removed',
        description: `${product?.name || 'Product'} has been removed (${reason}).`,
      });
    } catch (err) {
      setError('Failed to delete product');
      setLoading(false);
      console.error(err);
    }
  };

  const getExpiringProducts = (days: number) => {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + days);
    
    return products.filter(product => {
      const expiryDate = new Date(product.expiryDate);
      return expiryDate <= futureDate && expiryDate >= now;
    });
  };

  const value = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getExpiringProducts,
    loading,
    error
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
