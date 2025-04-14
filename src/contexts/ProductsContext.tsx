
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product, ProductsContextType } from '@/types';
import { useToast } from '@/hooks/use-toast';

// This would come from a real API/database in production
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

  useEffect(() => {
    // Load products from localStorage or use mock data
    const loadProducts = () => {
      try {
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        } else {
          // Use mock data for initial state
          setProducts(mockProducts);
          localStorage.setItem('products', JSON.stringify(mockProducts));
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load products');
        setLoading(false);
        console.error(err);
      }
    };

    loadProducts();
  }, []);

  const persistProducts = (updatedProducts: Product[]) => {
    try {
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    } catch (err) {
      console.error('Failed to persist products:', err);
      setError('Failed to save changes');
    }
  };

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      persistProducts(updatedProducts);
      
      toast({
        title: 'Product added',
        description: `${product.name} has been added successfully.`,
      });
    } catch (err) {
      setError('Failed to add product');
      console.error(err);
    }
  };

  const updateProduct = (id: string, updatedData: Partial<Product>) => {
    try {
      const productIndex = products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        setError('Product not found');
        return;
      }
      
      const updatedProducts = [...products];
      updatedProducts[productIndex] = {
        ...updatedProducts[productIndex],
        ...updatedData
      };
      
      setProducts(updatedProducts);
      persistProducts(updatedProducts);
      
      toast({
        title: 'Product updated',
        description: `${updatedProducts[productIndex].name} has been updated.`,
      });
    } catch (err) {
      setError('Failed to update product');
      console.error(err);
    }
  };

  const deleteProduct = (id: string, reason: Product['deletionReason']) => {
    try {
      const product = products.find(p => p.id === id);
      
      if (!product) {
        setError('Product not found');
        return;
      }
      
      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);
      persistProducts(updatedProducts);
      
      toast({
        title: 'Product removed',
        description: `${product.name} has been removed (${reason}).`,
      });
    } catch (err) {
      setError('Failed to delete product');
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
