
import { connectToDatabase, Product } from '@/lib/mongodb';
import { Product as ProductType } from '@/types';

// Connect to the database
const getDb = async () => {
  await connectToDatabase();
  return Product;
};

// Get all products
export async function getAllProducts(userId: string): Promise<ProductType[]> {
  const Product = await getDb();
  const products = await Product.find({ userId }).sort({ expiryDate: 1 });
  
  return products.map((product: any) => ({
    id: product._id.toString(),
    name: product.name,
    category: product.category,
    expiryDate: product.expiryDate.toISOString(),
    createdAt: product.createdAt.toISOString(),
    notes: product.notes,
    storageInstructions: product.storageInstructions,
    opened: product.opened,
    openedDate: product.openedDate ? product.openedDate.toISOString() : undefined,
    dosage: product.dosage,
    prescriptionDetails: product.prescriptionDetails,
    frequency: product.frequency,
    openAfterUse: product.openAfterUse,
  }));
}

// Add a new product
export async function addProduct(productData: Omit<ProductType, 'id' | 'createdAt'> & { userId: string }): Promise<ProductType> {
  const Product = await getDb();
  
  const newProduct = new Product({
    ...productData,
    createdAt: new Date(),
  });
  
  await newProduct.save();
  
  return {
    id: newProduct._id.toString(),
    name: newProduct.name,
    category: newProduct.category,
    expiryDate: newProduct.expiryDate.toISOString(),
    createdAt: newProduct.createdAt.toISOString(),
    notes: newProduct.notes,
    storageInstructions: newProduct.storageInstructions,
    opened: newProduct.opened,
    openedDate: newProduct.openedDate ? newProduct.openedDate.toISOString() : undefined,
    dosage: newProduct.dosage,
    prescriptionDetails: newProduct.prescriptionDetails,
    frequency: newProduct.frequency,
    openAfterUse: newProduct.openAfterUse,
  };
}

// Update a product
export async function updateProduct(id: string, updatedData: Partial<ProductType>): Promise<void> {
  const Product = await getDb();
  await Product.findByIdAndUpdate(id, updatedData);
}

// Delete a product
export async function deleteProduct(id: string, reason: ProductType['deletionReason']): Promise<void> {
  const Product = await getDb();
  await Product.findByIdAndUpdate(id, { deletionReason: reason, deletedAt: new Date() });
}
