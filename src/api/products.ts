
import { supabase } from '@/lib/supabase';
import { Product as ProductType } from '@/types';

// Function to convert Supabase product to application product
const mapSupabaseProductToProduct = (product: any): ProductType => {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    expiryDate: product.expiry_date,
    createdAt: product.created_at,
    notes: product.notes,
    storageInstructions: product.storage_instructions,
    opened: product.opened,
    openedDate: product.opened_date,
    dosage: product.dosage,
    prescriptionDetails: product.prescription_details,
    frequency: product.frequency,
    openAfterUse: product.open_after_use,
  };
};

// Get all products for a user
export async function getAllProducts(userId: string): Promise<ProductType[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('expiry_date', { ascending: true });
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  
  return data ? data.map(mapSupabaseProductToProduct) : [];
}

// Add a new product
export async function addProduct(productData: Omit<ProductType, 'id' | 'createdAt'> & { userId: string }): Promise<ProductType> {
  const { userId, ...rest } = productData;
  
  // Convert to snake_case for Supabase
  const supabaseProduct = {
    name: rest.name,
    category: rest.category,
    expiry_date: rest.expiryDate,
    notes: rest.notes,
    storage_instructions: rest.storageInstructions,
    opened: rest.opened,
    opened_date: rest.openedDate,
    dosage: rest.dosage,
    prescription_details: rest.prescriptionDetails,
    frequency: rest.frequency,
    open_after_use: rest.openAfterUse,
    user_id: userId,
    created_at: new Date().toISOString(),
  };
  
  const { data, error } = await supabase
    .from('products')
    .insert(supabaseProduct)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding product:', error);
    throw error;
  }
  
  return mapSupabaseProductToProduct(data);
}

// Update a product
export async function updateProduct(id: string, updatedData: Partial<ProductType>): Promise<void> {
  // Convert to snake_case for Supabase
  const supabaseUpdate = {
    name: updatedData.name,
    category: updatedData.category,
    expiry_date: updatedData.expiryDate,
    notes: updatedData.notes,
    storage_instructions: updatedData.storageInstructions,
    opened: updatedData.opened,
    opened_date: updatedData.openedDate,
    dosage: updatedData.dosage,
    prescription_details: updatedData.prescriptionDetails,
    frequency: updatedData.frequency,
    open_after_use: updatedData.openAfterUse,
  };
  
  // Remove undefined values
  Object.keys(supabaseUpdate).forEach(key => {
    if (supabaseUpdate[key as keyof typeof supabaseUpdate] === undefined) {
      delete supabaseUpdate[key as keyof typeof supabaseUpdate];
    }
  });
  
  const { error } = await supabase
    .from('products')
    .update(supabaseUpdate)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Delete a product (or mark as deleted with reason)
export async function deleteProduct(id: string, reason: ProductType['deletionReason']): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ 
      deletion_reason: reason,
      deleted_at: new Date().toISOString() 
    })
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}
