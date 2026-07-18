// App.jsx
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import Navbar from './components/Navbar';
import { Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoutes';
import PasswordResetRequest from './components/PasswordResetRequest';
import PasswordReset from './components/PasswordReset';
import Partenaires from './components/finance/Partenaires';
import PartenaireDetail from './components/finance/PartenaireDetail';
import PartenaireForm from './components/finance/PartenaireForm';
import Depots from './components/finance/Depots';
import DepotForm from './components/finance/DepotForm';
import DepotDetail from './components/finance/DepotDetail';
import DepotPdf from './components/finance/DepotPdf';
import Comptes from './components/finance/Comptes';
import CompteDetail from './components/finance/CompteDetail';
import Transactions from './components/finance/Transactions';
import TransactionDetail from './components/finance/TransactionDetail';
import TransfertEntreAgents from './components/finance/TransfertEntreAgents';

import AgentBalanceList from './components/finance/AgentBalanceList';
import AgentBalanceDetail from './components/finance/AgentBalanceDetail';
import AgentBalanceMe from './components/finance/AgentBalanceMe';
import AgentTransfer from './components/finance/AgentTransfer';
import Utilisateurs from './components/users/Utilisateurs';
import UtilisateurForm from './components/users/UtilisateurForm';
import UtilisateurDetail from './components/users/UtilisateurDetail';
import RetraitAvecBeneficiaire from './components/finance/RetraitAvecBeneficiaire';

import Beneficiaires from './components/finance/Beneficiaires';
import BeneficiaireForm from './components/finance/BeneficiaireForm';
import BeneficiaireDetail from './components/finance/BeneficiaireDetail';

import Dashboard from './components/services/Dashboard';
import Analyses from './components/finance/Analyses';
import DashboardPro from './components/services/DashboardPro';
// Modules Logistique/Catégories




// Modules Clients





// Modules Audit


function App() {
  const location = useLocation();
  
  // Routes sans Navbar (pages d'authentification)
  const noNavBar = location.pathname === "/" || 
                   location.pathname === "/register" || 
                   location.pathname.includes("password") ||
                   location.pathname === "/login";

  return (
    <>
      {noNavBar ? (
        // Routes SANS Navbar (authentification)
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/request/password_reset" element={<PasswordResetRequest />} />
          <Route path="/password-reset/:token" element={<PasswordReset />} />
        </Routes>
      ) : (
        // Routes AVEC Navbar
        <Navbar
          content={
            <Routes>
              {/* Route protégée */}
              <Route element={<ProtectedRoute />}>
               
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/statistiques" element={<DashboardPro />} />
                

<Route path="/analyses" element={<Analyses />} />

                {/* ==================== Partenaire ==================== */}
              <Route path="/partenaires" element={<Partenaires />} />
<Route path="/partenaires/ajouter" element={<PartenaireForm />} />
<Route path="/partenaires/:id" element={<PartenaireDetail />} />
<Route path="/partenaires/:id/modifier" element={<PartenaireForm />} />

                {/* ==================== STOCKS ====================  */}

               <Route path="/depots" element={<Depots />} />
<Route path="/depots/nouveau" element={<DepotForm />} />
<Route path="/depots/:id" element={<DepotDetail />} />
<Route path="/depots/:id/pdf" element={<DepotPdf />} />
                
<Route path="/comptes" element={<Comptes />} />
<Route path="/comptes/:id" element={<CompteDetail />} />


<Route path="/utilisateurs" element={<Utilisateurs />} />
  <Route path="/utilisateurs/ajouter" element={<UtilisateurForm />} />
  <Route path="/utilisateurs/creer" element={<UtilisateurForm />} />
  
  {/* Route pour les détails et modification - AVEC paramètre ID */}
  <Route path="/utilisateurs/:id" element={<UtilisateurDetail />} />
  <Route path="/utilisateurs/:id/modifier" element={<UtilisateurForm />} />

<Route path="/transactions" element={<Transactions />} />
<Route path="/transactions/:id" element={<TransactionDetail />} />


 <Route path="/agents" element={<AgentBalanceList />} />
  <Route path="/agents/:id/balance" element={<AgentBalanceDetail />} />
  <Route path="/agents/me" element={<AgentBalanceMe />} />
  <Route path="/agents/transfer" element={<AgentTransfer />} />
  <Route path="/transfert-entre-agents" element={<TransfertEntreAgents />} />

  
 <Route path="/beneficiaires" element={<Beneficiaires />} />
<Route path="/beneficiaires/ajouter" element={<BeneficiaireForm />} />
<Route path="/beneficiaires/:id" element={<BeneficiaireDetail />} />
<Route path="/beneficiaires/:id/modifier" element={<BeneficiaireForm />} />
                <Route path="/retraits" element={<RetraitAvecBeneficiaire />} />
                {/* ==================== AUDIT ====================
                <Route path="/audit" element={<AuditLog />} />
 */}
                {/* ==================== PARAMÈTRES ==================== 
                <Route path="/parametres" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />*/}
              </Route>
            </Routes>
          }
        />
      )}
    </>
  );
}

export default App;