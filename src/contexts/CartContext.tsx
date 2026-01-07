import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Service } from '@/data/services';

export type PaymentType = 'one-time' | 'subscription';
export type SubscriptionPeriod = 'monthly' | 'yearly';

export interface CartItem {
  service: Service;
  paymentType: PaymentType;
  subscriptionPeriod?: SubscriptionPeriod;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (service: Service, paymentType: PaymentType, subscriptionPeriod?: SubscriptionPeriod) => void;
  removeFromCart: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('marketflow_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('marketflow_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (service: Service, paymentType: PaymentType, subscriptionPeriod?: SubscriptionPeriod) => {
    setItems(prev => {
      const existing = prev.find(item => item.service.id === service.id);
      if (existing) {
        return prev.map(item =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + 1, paymentType, subscriptionPeriod }
            : item
        );
      }
      return [...prev, { service, paymentType, subscriptionPeriod, quantity: 1 }];
    });
  };

  const removeFromCart = (serviceId: string) => {
    setItems(prev => prev.filter(item => item.service.id !== serviceId));
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(serviceId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.service.id === serviceId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const getTotal = () => {
    return items.reduce((total, item) => {
      let price = item.service.price;
      if (item.paymentType === 'subscription' && item.subscriptionPeriod === 'yearly') {
        price = price * 12 * 0.8; // 20% discount for yearly
      }
      return total + price * item.quantity;
    }, 0);
  };

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotal,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
