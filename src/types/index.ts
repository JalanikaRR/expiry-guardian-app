
// Type definitions for the application

export type UserAuth = {
  id: string;
  username: string;
  email: string;
};

export type ProductCategory = 'food' | 'medicine' | 'cosmetics' | 'other';

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  expiryDate: string; // ISO date string
  createdAt: string; // ISO date string
  // Common fields
  notes?: string;
  image?: string;
  // Food specific
  storageInstructions?: string;
  opened?: boolean;
  openedDate?: string;
  // Medicine specific
  dosage?: string;
  prescriptionDetails?: string;
  frequency?: string;
  // Cosmetics specific
  openAfterUse?: string; // how long it can be used after opening
  // For deletion
  deletionReason?: 'consumed' | 'expired' | 'discarded' | 'other';
};

// Auth context types
export type AuthContextType = {
  user: UserAuth | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

// Products context types
export type ProductsContextType = {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string, reason: Product['deletionReason']) => void;
  getExpiringProducts: (days: number) => Product[];
  loading: boolean;
  error: string | null;
};
