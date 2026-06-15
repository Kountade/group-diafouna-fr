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
                <Route path="/home" element={<Home />} />
                <Route path="/dashboard" element={<Home />} />

                {/* ==================== Partenaire ==================== */}
              <Route path="/partenaires" element={<Partenaires />} />
<Route path="/partenaires/ajouter" element={<PartenaireForm />} />
<Route path="/partenaires/:id" element={<PartenaireDetail />} />
<Route path="/partenaires/:id/modifier" element={<PartenaireForm />} />

                {/* ==================== STOCKS ==================== 
               
                <Route path="/stocks/:productId" element={<StockDetails />} />
              
                <Route path="/lots/:id" element={<LotDetails />} />
                <Route path="/mouvements-stock" element={<MovementsList />} />*/}






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