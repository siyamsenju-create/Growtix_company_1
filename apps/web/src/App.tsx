import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { HomePage } from "./pages/marketing/HomePage";
import { ServicesPage } from "./pages/marketing/ServicesPage";
import { CaseStudiesPage } from "./pages/marketing/CaseStudiesPage";
import { BookPage } from "./pages/marketing/BookPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { AppLayout } from "./layouts/AppLayout";
import { LeadsPage } from "./pages/app/LeadsPage";
import { CampaignsPage } from "./pages/app/CampaignsPage";
import { AnalyticsPage } from "./pages/app/AnalyticsPage";
import { SettingsPage } from "./pages/app/SettingsPage";
import { AdminPage } from "./pages/admin/AdminPage";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { ChatWidget } from "./components/ChatWidget";

import type { ReactElement } from "react";

function RequireAuth({ children, admin }: { children: ReactElement; admin?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ padding: "4rem" }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/app" replace />;
  return children;
}

function MarketingLayout() {
  return (
    <>
      <SiteHeader />
      <Outlet />
      <SiteFooter />
      <ChatWidget />
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/case-studies" element={<CaseStudiesPage />} />
          <Route path="/book" element={<BookPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="leads" replace />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireAuth admin>
              <AppLayout admin />
            </RequireAuth>
          }
        >
          <Route index element={<AdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
