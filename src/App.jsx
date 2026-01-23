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

// Public Pages
// Public Pages
import LandingPage from "./pages/landing/LandingPage";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Protected Pages
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Dashboard from "./pages/Dashboard";
import VendorProfile from "./pages/VendorProfile";
import PublicVendorProfile from "./pages/PublicVendorProfile";
import CategoryVendors from "./pages/CategoryVendors";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Messages from "./pages/Messages";
import Orders from "./pages/Orders";
import MyServices from "./pages/MyServices";
import Settings from "./pages/Settings";
import Earnings from "./pages/Earnings";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminServices from "./pages/admin/AdminServices";
import AdminSettings from "./pages/admin/AdminSettings";

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
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

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
