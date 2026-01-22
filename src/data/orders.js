// Mock orders for demo
export const orders = [
  {
    id: 'ord_001',
    userId: 'user_1',
    clientId: 'user_1',
    clientName: 'John Client',
    vendorId: '2',
    vendorName: 'SearchPro Digital',
    serviceId: '1',
    serviceName: 'Complete SEO Audit & Strategy',
    items: [],
    amount: 499,
    total: 499,
    status: 'in-progress',
    paymentMethod: 'card',
    expectedDelivery: '2024-02-15',
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: 'ord_002',
    userId: 'user_1',
    clientId: 'user_1',
    clientName: 'John Client',
    vendorId: '3',
    vendorName: 'Social Buzz Agency',
    serviceId: '2',
    serviceName: 'Social Media Management',
    items: [],
    amount: 899,
    total: 899,
    status: 'pending',
    paymentMethod: 'card',
    expectedDelivery: '2024-02-20',
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-18T14:00:00Z',
  },
  {
    id: 'ord_003',
    userId: 'user_1',
    clientId: 'user_1',
    clientName: 'John Client',
    vendorId: '5',
    vendorName: 'ContentCraft Pro',
    serviceId: '4',
    serviceName: 'Content Writing Package',
    items: [],
    amount: 150,
    total: 150,
    status: 'completed',
    paymentMethod: 'card',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z',
  },
  {
    id: 'ord_004',
    userId: 'vendor_1',
    clientId: 'client_2',
    clientName: 'TechStart Inc.',
    vendorId: 'vendor_1',
    vendorName: 'Digital Agency',
    serviceId: '1',
    serviceName: 'SEO Audit Package',
    items: [],
    amount: 499,
    total: 499,
    status: 'in-progress',
    paymentMethod: 'card',
    expectedDelivery: '2024-02-10',
    createdAt: '2024-01-22T08:00:00Z',
    updatedAt: '2024-01-22T08:00:00Z',
  },
  {
    id: 'ord_005',
    userId: 'vendor_1',
    clientId: 'client_3',
    clientName: 'Fashion Brand Co.',
    vendorId: 'vendor_1',
    vendorName: 'Digital Agency',
    serviceId: '2',
    serviceName: 'Social Media Management',
    items: [],
    amount: 899,
    total: 899,
    status: 'completed',
    paymentMethod: 'card',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-20T15:00:00Z',
  },
];

// Mutable orders array for new orders
let allOrders = [...orders];

export const createOrder = (
  userId,
  items,
  total,
  paymentMethod
) => {
  const order = {
    id: `order_${Date.now()}`,
    userId,
    clientId: userId,
    clientName: 'Current User',
    vendorId: items[0]?.service?.vendorId || '',
    vendorName: items[0]?.service?.vendorName || '',
    serviceId: items[0]?.service?.id || '',
    serviceName: items[0]?.service?.title || '',
    items,
    amount: total,
    total,
    status: 'pending',
    paymentMethod,
    expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  allOrders.push(order);
  return order;
};

export const updateOrderStatus = (orderId, status) => {
  const order = allOrders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  }
  return null;
};

export const getOrdersByUser = (userId) => {
  return allOrders.filter(o => o.userId === userId);
};

export const getOrderById = (orderId) => {
  return allOrders.find(o => o.id === orderId) || null;
};

export const getAllOrders = () => allOrders;
