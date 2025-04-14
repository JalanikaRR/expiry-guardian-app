
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductsContext';
import { Bell, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { formatDistance } from 'date-fns';

const TopBar = () => {
  const { getExpiringProducts } = useProducts();
  const navigate = useNavigate();
  
  // Get products expiring in the next 24 hours
  const expiringProducts = getExpiringProducts(1);
  
  return (
    <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Expiry Guardian</h2>
        
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4 mr-1" />
                <span>Expiring Items</span>
                {expiringProducts.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 min-w-[20px] h-5">
                    {expiringProducts.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-2">
                <h3 className="font-medium text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-warning-500" />
                  Products expiring soon
                </h3>
                
                {expiringProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No products expiring in the next 24 hours.
                  </p>
                ) : (
                  <div className="max-h-60 overflow-auto space-y-2">
                    {expiringProducts.map((product) => (
                      <div 
                        key={product.id}
                        className="bg-secondary/50 rounded-md p-2 cursor-pointer hover:bg-secondary"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{product.name}</span>
                          <Badge variant={new Date(product.expiryDate).getTime() - Date.now() < 12 * 60 * 60 * 1000 ? 'destructive' : 'outline'}>
                            {product.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-expire-600">
                          Expires {formatDistance(new Date(product.expiryDate), new Date(), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                {expiringProducts.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 text-sm"
                    onClick={() => navigate('/products', { state: { showExpiring: true } })}
                  >
                    View all expiring products
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
