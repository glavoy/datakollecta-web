import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Surveys from "./pages/Surveys";
import SurveyDesignerPage from "./pages/SurveyDesignerPage";
import Teams from "./pages/Teams";
import DataView from "./pages/DataView";
import SettingsPage from "./pages/SettingsPage";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes - require authentication */}
            <Route path="/app" element={<Navigate to="/app/projects" replace />} />
            <Route path="/app/projects" element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            } />
            <Route path="/app/projects/:slug" element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            } />
            <Route path="/app/projects/:slug/surveys/new" element={
              <ProtectedRoute>
                <SurveyDesignerPage />
              </ProtectedRoute>
            } />
            <Route path="/app/projects/:slug/surveys/:surveyId" element={
              <ProtectedRoute>
                <SurveyDesignerPage />
              </ProtectedRoute>
            } />
            <Route path="/app/surveys" element={
              <ProtectedRoute>
                <Surveys />
              </ProtectedRoute>
            } />
            <Route path="/app/surveys/designer" element={
              <ProtectedRoute>
                <SurveyDesignerPage />
              </ProtectedRoute>
            } />
            <Route path="/app/teams" element={
              <ProtectedRoute>
                <Teams />
              </ProtectedRoute>
            } />
            <Route path="/app/data" element={
              <ProtectedRoute>
                <DataView />
              </ProtectedRoute>
            } />
            <Route path="/app/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
