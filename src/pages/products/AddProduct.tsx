
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductsContext';
import { ProductCategory } from '@/types';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';

const AddProduct = () => {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  
  // Common fields
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [expiryDate, setExpiryDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState<string>('');
  
  // Food specific fields
  const [storageInstructions, setStorageInstructions] = useState<string>('');
  const [opened, setOpened] = useState<boolean>(false);
  const [openedDate, setOpenedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  // Medicine specific fields
  const [dosage, setDosage] = useState<string>('');
  const [prescriptionDetails, setPrescriptionDetails] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');
  
  // Cosmetics specific fields
  const [openAfterUse, setOpenAfterUse] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !category || !expiryDate) {
      return; // Basic validation
    }
    
    const productData = {
      name,
      category,
      expiryDate: new Date(expiryDate).toISOString(),
      notes,
      ...(category === 'food' && {
        storageInstructions,
        opened,
        ...(opened && { openedDate: new Date(openedDate).toISOString() }),
      }),
      ...(category === 'medicine' && {
        dosage,
        prescriptionDetails,
        frequency,
      }),
      ...(category === 'cosmetics' && {
        openAfterUse,
      }),
    };
    
    addProduct(productData);
    navigate('/products');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Enter the details for the product you want to track.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Common Fields */}
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name*</Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category*</Label>
                  <Select 
                    value={category} 
                    onValueChange={(value) => setCategory(value as ProductCategory)}
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="medicine">Medicine</SelectItem>
                      <SelectItem value="cosmetics">Cosmetics</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date*</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              
              {/* Conditional Fields Based on Category */}
              {category === 'food' && (
                <div className="border rounded-md p-4 space-y-4">
                  <h3 className="font-medium">Food Specific Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="storageInstructions">Storage Instructions</Label>
                      <Input
                        id="storageInstructions"
                        placeholder="How to store this food"
                        value={storageInstructions}
                        onChange={(e) => setStorageInstructions(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="opened">Is it opened?</Label>
                        <Switch
                          id="opened"
                          checked={opened}
                          onCheckedChange={setOpened}
                        />
                      </div>
                      {opened && (
                        <div className="pt-2">
                          <Label htmlFor="openedDate">Date Opened</Label>
                          <Input
                            id="openedDate"
                            type="date"
                            value={openedDate}
                            onChange={(e) => setOpenedDate(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {category === 'medicine' && (
                <div className="border rounded-md p-4 space-y-4">
                  <h3 className="font-medium">Medicine Specific Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        placeholder="e.g., 500mg"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input
                        id="frequency"
                        placeholder="e.g., twice daily"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="prescriptionDetails">Prescription Details</Label>
                      <Textarea
                        id="prescriptionDetails"
                        placeholder="Add any prescription information"
                        value={prescriptionDetails}
                        onChange={(e) => setPrescriptionDetails(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {category === 'cosmetics' && (
                <div className="border rounded-md p-4 space-y-4">
                  <h3 className="font-medium">Cosmetics Specific Details</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="openAfterUse">Period After Opening (PAO)</Label>
                      <Input
                        id="openAfterUse"
                        placeholder="e.g., 12M (12 months)"
                        value={openAfterUse}
                        onChange={(e) => setOpenAfterUse(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">The time after opening the product is safe to use</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Product</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppShell>
  );
};

export default AddProduct;
