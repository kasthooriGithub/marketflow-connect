import { Toaster } from "components/ui/toaster";
import { Toaster as Sonner } from "components/ui/sonner";
import { TooltipProvider } from "components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "contexts/AuthContext";
import { CartProvider } from "contexts/CartContext";
import { MessagingProvider } from "contexts/MessagingContext";
import { VendorServicesProvider } from "contexts/VendorServicesContext";
import { ProtectedRoute } from "components/routes/ProtectedRoute";
import { AdminRoute } from "components/routes/AdminRoute";
import { PublicRoute } from "components/routes/PublicRoute";
import { Layout } from "components/layout/Layout";

// Public Pages
// Public Pages
// Public Pages
import LandingPage from "./pages/public/Landing";
import HowItWorks from "./pages/public/HowItWorks";
import Pricing from "./pages/public/Pricing";
import Login from "./pages/public/Login";
import Signup from "./pages/public/Signup";
import NotFound from "./pages/public/NotFound";

// Protected Pages
import Services from "./pages/public/ServicesPublic";
import ServiceDetail from "./pages/public/ServiceDetail";
import Dashboard from "./pages/Dashboard";
import VendorProfile from "./pages/vendor/VendorProfile";
import PublicVendorProfile from "./pages/public/PublicVendorProfile";
import VendorGuide from "./pages/vendor/VendorGuide";
import CategoryVendors from "./pages/public/CategoryVendors";
import Cart from "./pages/client/Cart";
import Checkout from "./pages/client/Checkout";
import OrderConfirmation from "./pages/client/OrderConfirmation";
import Messages from "./pages/client/Messages";
import Orders from "./pages/client/Orders";
import MyServices from "./pages/vendor/VendorServices";
import Settings from "./pages/client/Settings";
import Earnings from "./pages/vendor/Earnings";
import VendorServiceDetails from "./pages/vendor/VenderServiceDetails";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/Users";
import AdminVendors from "./pages/admin/Vendors";
import AdminServices from "./pages/admin/Services";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <MessagingProvider>
          <VendorServicesProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes - Only for guests */}
                  <Route path="/" element={
                    <PublicRoute>
                      <LandingPage />
                    </PublicRoute>
                  } />
                  <Route path="/login" element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } />
                  <Route path="/signup" element={
                    <PublicRoute>
                      <Signup />
                    </PublicRoute>
                  } />

                  {/* Publicly accessible pages (Guest Only) */}
                  <Route path="/how-it-works" element={
                    <PublicRoute>
                      <Layout>
                        <HowItWorks />
                      </Layout>
                    </PublicRoute>
                  } />
                  <Route path="/pricing" element={
                    <PublicRoute>
                      <Pricing />
                    </PublicRoute>
                  } />

                  {/* Services & Vendors - public browsing */}
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/:id" element={<ServiceDetail />} />
                  <Route path="/category/:categoryId" element={<CategoryVendors />} />
                  <Route path="/vendors/:vendorId" element={<PublicVendorProfile />} />

                  {/* Cart & Checkout */}
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                  <Route path="/order-confirmation/:orderId" element={
                    <ProtectedRoute>
                      <OrderConfirmation />
                    </ProtectedRoute>
                  } />

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/messages" element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  } />
                  <Route path="/messages/:conversationId" element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />

                  {/* Vendor Routes */}
                  <Route path="/vendor/profile" element={
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <VendorProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-services" element={
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <MyServices />
                    </ProtectedRoute>
                  } />
                  <Route path="/earnings" element={
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <Earnings />
                    </ProtectedRoute>
                  } />
                  <Route path="/vendor/guide" element={
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <VendorGuide />
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  <Route path="/admin/users" element={
                    <AdminRoute>
                      <AdminUsers />
                    </AdminRoute>
                  } />
                  <Route path="/admin/vendors" element={
                    <AdminRoute>
                      <AdminVendors />
                    </AdminRoute>
                  } />
                  <Route path="/admin/services" element={
                    <AdminRoute>
                      <AdminServices />
                    </AdminRoute>
                  } />
                  <Route path="/admin/settings" element={
                    <AdminRoute>
                      <AdminSettings />
                    </AdminRoute>
                  } />

                  <Route path="/vendor/services/:serviceId" element={
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <VendorServiceDetails />
                    </ProtectedRoute>
                  } />
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </VendorServicesProvider>
        </MessagingProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
