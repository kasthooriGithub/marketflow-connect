import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('marketflow_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('marketflow_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (service, paymentType, subscriptionPeriod) => {
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

  const removeFromCart = (serviceId) => {
    setItems(prev => prev.filter(item => item.service.id !== serviceId));
  };

  const updateQuantity = (serviceId, quantity) => {
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
