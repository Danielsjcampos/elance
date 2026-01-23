
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ModalProvider } from './contexts/ModalContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import GlobalSEO from './components/GlobalSEO';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import RequirePermission from './components/RequirePermission';

// Pages
import Home from './pages/Home';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import News from './pages/admin/News'; // Added
import Clients from './pages/admin/Clients';
import Leads from './pages/admin/Leads';
import Auctions from './pages/admin/Auctions';
import Franchises from './pages/admin/Franchises';
import Tasks from './pages/admin/Tasks';
import Training from './pages/admin/Training';
import Documents from './pages/admin/Documents';
import Marketing from './pages/admin/Marketing';
import Agenda from './pages/admin/Agenda';
import Financial from './pages/admin/Financial';
import Franchise from './components/Franchise';
import FranchiseBroker from './components/FranchiseBroker';
import Contact from './components/Contact';
import Consultoria from './components/Consultoria';
import Escola from './components/Escola';
import EscolaLeiloeiros from './components/EscolaLeiloeiros';
import CourseImoveis from './components/CourseImoveis';
import Downloads from './components/Downloads';
import CursoAdvogados from './components/CursoAdvogados';
import Mentoria from './Mentoria';
import Ecossistema from './Ecossistema';
import Indique from './Indique';
import BidInvest from './components/BidInvest';
import Datajud from './pages/admin/Datajud';
import Settings from './pages/admin/Settings';
import AiAssistant from './pages/admin/AiAssistant';
import EmailFlowCenter from './pages/admin/EmailFlowCenter';
import MinimalLayout from './layouts/MinimalLayout';
import LpElance from './pages/LpElance';
import Detran from './pages/Detran';

function App() {
  return (
    <HelmetProvider>
      <ModalProvider>
        <AuthProvider>
          <ThemeProvider>
            <GlobalSEO />
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<Home />} />
                  <Route path="franchise" element={<Franchise />} />
                  <Route path="franchise-broker" element={<FranchiseBroker />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="consultoria" element={<Consultoria />} />
                  <Route path="escola" element={<Escola />} />
                  <Route path="escola-leiloeiros" element={<EscolaLeiloeiros />} />
                  <Route path="curso-imoveis" element={<CourseImoveis />} />
                  <Route path="downloads" element={<Downloads />} />
                  <Route path="curso-advogados" element={<CursoAdvogados />} />
                  <Route path="mentoria" element={<Mentoria />} />
                  <Route path="ecossistema" element={<Ecossistema />} />
                  <Route path="indique" element={<Indique />} />
                  <Route path="bid-invest" element={<BidInvest />} />
                  <Route path="detran" element={<Detran />} />
                </Route>

                <Route element={<MinimalLayout />}>
                  <Route path="/lp-e-lance" element={<LpElance />} />
                </Route>

                {/* Admin Login */}
                <Route path="/admin/login" element={<Login />} />

                {/* Protected Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="news" element={<RequirePermission permissionKey="dashboard"><News /></RequirePermission>} />
                    <Route path="franquias" element={<RequirePermission permissionKey="franchises"><Franchises /></RequirePermission>} />
                    <Route path="tarefas" element={<RequirePermission permissionKey="tasks"><Tasks /></RequirePermission>} />
                    <Route path="treinamento" element={<RequirePermission permissionKey="training"><Training /></RequirePermission>} />
                    <Route path="documentos" element={<RequirePermission permissionKey="documents"><Documents /></RequirePermission>} />
                    <Route path="marketing" element={<RequirePermission permissionKey="marketing"><Marketing /></RequirePermission>} />
                    <Route path="agenda" element={<RequirePermission permissionKey="agenda"><Agenda /></RequirePermission>} />
                    <Route path="financeiro" element={<RequirePermission permissionKey="finance"><Financial /></RequirePermission>} />
                    <Route path="financial" element={<RequirePermission permissionKey="finance"><Financial /></RequirePermission>} />
                    <Route path="leads" element={<RequirePermission permissionKey="leads"><Leads /></RequirePermission>} />
                    <Route path="clients" element={<RequirePermission permissionKey="leads"><Clients /></RequirePermission>} />
                    <Route path="leiloes" element={<RequirePermission permissionKey="auctions"><Auctions /></RequirePermission>} />
                    <Route path="datajud" element={<RequirePermission permissionKey="datajud"><Datajud /></RequirePermission>} />
                    <Route path="ia-juridica" element={<RequirePermission permissionKey="ai_assistant"><AiAssistant /></RequirePermission>} />
                    <Route path="email-marketing" element={<RequirePermission permissionKey="marketing"><EmailFlowCenter /></RequirePermission>} />
                    <Route path="settings" element={<RequirePermission permissionKey="settings"><Settings /></RequirePermission>} />
                  </Route>
                </Route>

                {/* Global Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </ThemeProvider>
        </AuthProvider>
      </ModalProvider>
    </HelmetProvider>
  );
}

export default App;