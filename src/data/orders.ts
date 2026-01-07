import { CartItem, PaymentType, SubscriptionPeriod } from '@/contexts/CartContext';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

// Mock orders storage
let orders: Order[] = [];

export const createOrder = (
  userId: string,
  items: CartItem[],
  total: number,
  paymentMethod: string
): Order => {
  const order: Order = {
    id: `order_${Date.now()}`,
    userId,
    items,
    total,
    status: 'pending',
    paymentMethod,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.push(order);
  return order;
};

export const updateOrderStatus = (orderId: string, status: OrderStatus): Order | null => {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  }
  return null;
};

export const getOrdersByUser = (userId: string): Order[] => {
  return orders.filter(o => o.userId === userId);
};

export const getOrderById = (orderId: string): Order | null => {
  return orders.find(o => o.id === orderId) || null;
};

export const getAllOrders = (): Order[] => orders;
