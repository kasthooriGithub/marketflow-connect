import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Browse our services and add items to your cart
            </p>
            <Link to="/services">
              <Button variant="gradient">Browse Services</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <Card key={item.service.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.service.image}
                      alt={item.service.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                    <h3 className="font-semibold">{item.service.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {item.service.vendorName}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-primary/10 rounded text-primary">
                          {item.paymentType === 'subscription'
                            ? `${item.subscriptionPeriod} subscription`
                            : 'One-time purchase'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${item.paymentType === 'subscription' && item.subscriptionPeriod === 'yearly'
                          ? (item.service.price * 12 * 0.8).toFixed(2)
                          : item.service.price.toFixed(2)}
                        {item.paymentType === 'subscription' && (
                          <span className="text-sm font-normal text-muted-foreground">
                            /{item.subscriptionPeriod === 'yearly' ? 'year' : 'month'}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.service.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.service.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeFromCart(item.service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="ghost" onClick={clearCart} className="text-destructive">
              Clear Cart
            </Button>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.service.id} className="flex justify-between text-sm">
                      <span>{item.service.title} × {item.quantity}</span>
                      <span>
                        ${(item.paymentType === 'subscription' && item.subscriptionPeriod === 'yearly'
                          ? item.service.price * 12 * 0.8 * item.quantity
                          : item.service.price * item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>
                <Button variant="gradient" className="w-full" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
