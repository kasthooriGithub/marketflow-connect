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
import PlatformReviewForm from "components/reviews/PlatformReviewForm";

// Public Pages
import LandingPage from "./pages/public/Landing";
import HowItWorks from "./pages/public/HowItWorks";
import Pricing from "./pages/public/Pricing";
import TrustSafety from "./pages/public/TrustSafety";
import BecomeSeller from "./pages/public/BecomeSeller";
import SellerResources from "./pages/public/SellerResources";
import Community from "./pages/public/Community";
import SuccessStories from "./pages/public/SuccessStories";
import About from "./pages/public/About";
import Careers from "./pages/public/Careers";
import Press from "./pages/public/Press";
import Contact from "./pages/public/Contact";
import HelpCenter from "./pages/public/HelpCenter";
import FAQ from "./pages/public/FAQ";
import Terms from "./pages/public/Terms";
import Privacy from "./pages/public/Privacy";
import Login from "./pages/public/Login";
import Signup from "./pages/public/Signup";
import NotFound from "./pages/public/NotFound";

// Protected Pages
import Services from "./pages/public/ServicesPublic";
import ServiceDetail from "./pages/public/ServiceDetail";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import ProfileRedirect from "./pages/ProfileRedirect";

// Client Specific Pages
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientMessages from "./pages/client/Messages";
import ClientOrders from "./pages/client/Orders";
import ClientSettings from "./pages/client/Settings";
import ClientProfile from "./pages/client/Profile";
import SavedServices from "./pages/client/SavedServices";
import PaymentProcess from "./pages/client/PaymentProcess";
import PaymentHistory from "./pages/client/PaymentHistory";
import Cart from "./pages/client/Cart";
import Checkout from "./pages/client/Checkout";
import OrderConfirmation from "./pages/client/OrderConfirmation";
import SettingsPersonal from "./pages/client/SettingsPersonal";
import SettingsNotifications from "./pages/client/SettingsNotifications";
import SettingsSecurity from "./pages/client/SettingsSecurity";

// Vendor Specific Pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorMessages from "./pages/vendor/Messages";
import VendorOrders from "./pages/vendor/Orders";
import VendorSettings from "./pages/vendor/Settings";
import VendorProfile from "./pages/vendor/VendorProfile";
import VendorGuide from "./pages/vendor/VendorGuide";
import MyServices from "./pages/vendor/VendorServices";
import Earnings from "./pages/vendor/Earnings";
import VendorServiceDetails from "./pages/vendor/VenderServiceDetails";

// Other Imports
import PublicVendorProfile from "./pages/public/PublicVendorProfile";
import CategoryVendors from "./pages/public/CategoryVendors";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/Users";
import AdminVendors from "./pages/admin/Vendors";
import AdminServices from "./pages/admin/Services";
import AdminSettings from "./pages/admin/Settings";
import AdminReviews from "./pages/admin/Reviews";
import AdminRevenue from "./pages/admin/Revenue";
import MigrationPage from './pages/admin/MigrationPage';

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
                  <Route path="/" element={<LandingPage />} />
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
                    <Layout>
                      <HowItWorks />
                    </Layout>
                  } />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/trust-safety" element={<TrustSafety />} />
                  <Route path="/become-seller" element={<BecomeSeller />} />
                  <Route path="/seller-resources" element={<SellerResources />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/success-stories" element={<SuccessStories />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/press" element={<Press />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/help-center" element={<HelpCenter />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />

                  {/* Services & Vendors - public browsing */}
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/:id" element={<ServiceDetail />} />
                  <Route path="/category/:categoryId" element={<CategoryVendors />} />
                  <Route path="/vendors/:vendorId" element={<PublicVendorProfile />} />

                  {/* Cart & Checkout */}
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/order-confirmation/:orderId" element={
                    <ProtectedRoute>
                      <OrderConfirmation />
                    </ProtectedRoute>
                  } />

                  {/* Platform Review Route */}
                  <Route path="/dashboard/review-platform" element={
                    <ProtectedRoute>
                      <Layout>
                        <PlatformReviewForm />
                      </Layout>
                    </ProtectedRoute>
                  } />

                  {/* Protected Routes - Switcher/Redirection */}
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
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfileRedirect />
                    </ProtectedRoute>
                  } />

                  {/* Client Specific Routes */}
                  <Route path="/client/dashboard" element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/client/messages" element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientMessages />
                    </ProtectedRoute>
                  } />
                  <Route path="/client/messages/:conversationId" element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientMessages />
                    </ProtectedRoute>
                  } />
                  <Route path="/client/orders" element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="/client/profile" element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/client/settings" element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="/client/settings/personal" element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <SettingsPersonal />
                    </ProtectedRoute>
                  } />
                  <Route path="/client/settings/notifications" element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <SettingsNotifications />
                    </ProtectedRoute>
                  } />
                  <Route path="/client/settings/security" element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <SettingsSecurity />
                    </ProtectedRoute>
                  } />
                  <Route path="/client/saved-services" element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <SavedServices />
                    </ProtectedRoute>
                  } />
                  <Route path="/client/payment/:orderId" element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <PaymentProcess />
                    </ProtectedRoute>
                  } />
                  <Route path="/client/payment-history" element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <PaymentHistory />
                    </ProtectedRoute>
                  } />


                  <Route path="/admin/migrate" element={<MigrationPage />} />
                  {/* Vendor Specific Routes */}
                  <Route path="/vendor/dashboard" element={
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <VendorDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/vendor/messages" element={
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <VendorMessages />
                    </ProtectedRoute>
                  } />
                  <Route path="/vendor/messages/:conversationId" element={
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <VendorMessages />
                    </ProtectedRoute>
                  } />
                  <Route path="/vendor/orders" element={
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <VendorOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="/vendor/profile" element={
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <VendorProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/vendor/settings" element={
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <VendorSettings />
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
                  <Route path="/admin/reviews" element={
                    <AdminRoute>
                      <AdminReviews />
                    </AdminRoute>
                  } />
                  <Route path="/admin/revenue" element={
                    <AdminRoute>
                      <AdminRevenue />
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