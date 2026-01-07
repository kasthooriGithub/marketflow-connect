import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Building2, Wallet, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '@/data/orders';
import { toast } from 'sonner';

type PaymentMethod = 'card' | 'bank' | 'wallet';

export default function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create order
    const order = createOrder(
      user.id,
      items,
      getTotal(),
      paymentMethod
    );

    // Clear cart and redirect
    clearCart();
    setIsProcessing(false);
    
    toast.success('Payment successful!');
    navigate(`/order-confirmation/${order.id}`);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                    className="space-y-3"
                  >
                    <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Credit / Debit Card</p>
                          <p className="text-sm text-muted-foreground">Pay with Visa, Mastercard, or Amex</p>
                        </div>
                      </Label>
                    </div>

                    <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'bank' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                      <RadioGroupItem value="bank" id="bank" />
                      <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Building2 className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Bank Transfer</p>
                          <p className="text-sm text-muted-foreground">Direct bank payment</p>
                        </div>
                      </Label>
                    </div>

                    <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Wallet className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Digital Wallet</p>
                          <p className="text-sm text-muted-foreground">PayPal, Apple Pay, Google Pay</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Card Details (shown only for card payment) */}
              {paymentMethod === 'card' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Card Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="4242 4242 4242 4242"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          value={cardDetails.cvc}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This is a demo. No real payment will be processed.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Bank Transfer Info */}
              {paymentMethod === 'bank' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Bank Transfer Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      After placing your order, you'll receive bank transfer instructions via email.
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                      <p><strong>Bank:</strong> Demo Bank</p>
                      <p><strong>Account:</strong> 1234567890</p>
                      <p><strong>Routing:</strong> 012345678</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Digital Wallet */}
              {paymentMethod === 'wallet' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Digital Wallet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <Button type="button" variant="outline" className="h-16">
                        PayPal
                      </Button>
                      <Button type="button" variant="outline" className="h-16">
                        Apple Pay
                      </Button>
                      <Button type="button" variant="outline" className="h-16">
                        Google Pay
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      This is a demo. Click any wallet to simulate payment.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.service.id} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">{item.service.title}</p>
                          <p className="text-muted-foreground text-xs">
                            {item.paymentType === 'subscription'
                              ? `${item.subscriptionPeriod} subscription × ${item.quantity}`
                              : `One-time × ${item.quantity}`}
                          </p>
                        </div>
                        <span className="font-medium">
                          ${(item.paymentType === 'subscription' && item.subscriptionPeriod === 'yearly'
                            ? item.service.price * 12 * 0.8 * item.quantity
                            : item.service.price * item.quantity
                          ).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Processing Fee</span>
                      <span>$0.00</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Pay ${getTotal().toFixed(2)}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By completing this purchase you agree to our Terms of Service
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
