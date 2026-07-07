import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Handshake, DollarSign, Users, Settings, UserCircle, LogOut,
  ChevronDown, ChevronUp, Menu, X, Bell, Moon, Sun, Shield, Clock, Calendar,
  CreditCard, Send, ArrowLeftRight, Receipt, UserPlus, Search, HelpCircle,
  AlertTriangle, CheckCircle, TrendingUp, BarChart3, History, Wallet,
  UserCheck, Eye, ListChecks
} from 'lucide-react';

import logo from '../assets/logo.svg';
import AxiosInstance from './AxiosInstance';

// Configuration des rôles (admin et agent uniquement)
const ROLE_CONFIG = {
  admin: { label: 'Administrateur', color: 'error', icon: Shield, description: 'Accès total', level: 100 },
  agent: { label: 'Agent', color: 'primary', icon: Users, description: 'Opérations terrain', level: 60 }
};

const Navbar = ({ content, mode, toggleColorMode }) => {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  // États
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState({
    'TABLEAU DE BORD': true,
    'PARTENAIRES & FINANCES': true,
    'AGENTS': false,
    'ADMINISTRATION': false,
    'MON ESPACE': false
  });
  
  const [userInitial, setUserInitial] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [userRole, setUserRole] = useState('admin');
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [agentBalance, setAgentBalance] = useState(null);
  
  // Compteurs (optionnels)
  const [transfertsRecents, setTransfertsRecents] = useState(0);
  const [alertesCount, setAlertesCount] = useState(0);
  const [agentsCount, setAgentsCount] = useState(0);

  // Récupérer l'utilisateur depuis localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('User');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };

  const user = getUserData();
  const role = user?.role || 'admin';
  const userEmail = user?.email || '';
  const firstName = user?.first_name || '';
  const lastName = user?.last_name || '';
  const userName = firstName || lastName || user?.username || userEmail?.split('@')[0] || 'Utilisateur';

  // Horloge
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  // Charger les données utilisateur et notifications
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user?.id) {
          const userRes = await AxiosInstance.get(`/users/${user.id}/`);
          setUserData(userRes.data);
          setUserRole(userRes.data.role || role);
        } else {
          setUserRole(role);
        }
        
        const isAdmin = role === 'admin';
        const isAgent = role === 'agent';
        
        // Charger le solde de l'agent si c'est un agent
        if (isAgent) {
          try {
            const balanceRes = await AxiosInstance.get('/agents-balance/me/');
            setAgentBalance(balanceRes.data);
          } catch (err) {
            console.error('Erreur chargement solde agent:', err);
          }
        }
        
        // Charger des compteurs pour les notifications
        if (isAdmin) {
          try {
            const agentsRes = await AxiosInstance.get('/agents-balance/');
            setAgentsCount(agentsRes.data?.length || 0);
          } catch (err) {
            console.error('Erreur chargement agents:', err);
          }
          
          // Construire les notifications (exemples)
          const notifs = [];
          if (agentsCount > 0) {
            notifs.push({ 
              id: 'agents', 
              title: 'Agents actifs', 
              message: `${agentsCount} agent(s) enregistré(s)`, 
              link: '/agents', 
              type: 'info' 
            });
          }
          if (alertesCount > 0) {
            notifs.push({ 
              id: 'alerts', 
              title: 'Alertes financières', 
              message: `${alertesCount} alerte(s)`, 
              link: '/comptes', 
              type: 'warning' 
            });
          }
          setNotifications(notifs);
          setNotificationCount(notifs.length);
        }
      } catch (error) {
        console.error('Erreur chargement:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [role, transfertsRecents, alertesCount, agentsCount]);

  // Initiale utilisateur
  useEffect(() => {
    if (firstName && lastName) {
      setUserInitial(`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase());
      setUserFullName(`${firstName} ${lastName}`);
    } else if (userName) {
      setUserInitial(userName.charAt(0).toUpperCase());
      setUserFullName(userName);
    }
  }, [firstName, lastName, userName]);

  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.agent;
  const RoleIcon = roleConfig.icon;
  
  // Permissions simplifiées
  const isAdmin = role === 'admin';
  const isAgent = role === 'agent';
  
  // Méthodes de permission pour le module financier
  const canViewDashboard = () => true;
  const canManagePartners = () => isAdmin;
  const canViewPartners = () => isAdmin || isAgent;
  const canRecordDeposit = () => isAdmin || isAgent;
  const canTransferToAgent = () => isAdmin;
  const canRecordWithdrawal = () => isAgent;
  const canViewAccounts = () => isAdmin || isAgent;
  const canViewTransactions = () => isAdmin || isAgent;
  const canViewAdmin = () => isAdmin;
  const canViewAgents = () => isAdmin;
  const canViewMyBalance = () => isAgent;

  const handleSectionToggle = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const logoutUser = () => {
    setIsUserMenuOpen(false);
    localStorage.removeItem('Token');
    localStorage.removeItem('User');
    navigate('/');
  };

  // Menu sections (finance, agents, admin, espace)
  const menuSections = [
    {
      name: 'TABLEAU DE BORD',
      icon: LayoutDashboard,
      items: [
        { id: 'dashboard', text: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', permission: canViewDashboard() },
        { id: 'statistiques', text: 'Statistiques financières', icon: TrendingUp, path: '/statistiques', permission: isAdmin },
        { id: 'analyses', text: 'Analyses', icon: BarChart3, path: '/analyses', permission: isAdmin }
      ]
    },
    {
      name: 'PARTENAIRES & FINANCES',
      icon: Handshake,
      permission: true,
      items: [
        { id: 'partners', text: 'Partenaires', icon: Users, path: '/partenaires', permission: canViewPartners() },
        { id: 'partners-create', text: 'Nouveau partenaire', icon: UserPlus, path: '/partenaires/ajouter', permission: canManagePartners() },
        { id: 'deposit', text: 'Dépôt partenaire', icon: CreditCard, path: '/depots', permission: canRecordDeposit() },
        { id: 'transfer-to-agent', text: 'Transfert → agent', icon: Send, path: '/transferts-vers-agents', permission: canTransferToAgent() },
        { id: 'withdrawal', text: 'Retrait partenaire', icon: ArrowLeftRight, path: '/retraits', permission: canRecordWithdrawal() },
        { id: 'accounts', text: 'Comptes', icon: DollarSign, path: '/comptes', permission: canViewAccounts() },
        { id: 'transactions', text: 'Transactions', icon: Receipt, path: '/transactions', permission: canViewTransactions() }
      ]
    },
    {
      name: 'AGENTS',
      icon: Users,
      permission: isAdmin || isAgent,
      items: [
        // Admin
        ...(isAdmin ? [
          { id: 'agents-list', text: 'Liste des agents', icon: ListChecks, path: '/agents', permission: isAdmin },
          { id: 'agents-balance', text: 'Soldes des agents', icon: Wallet, path: '/agents', permission: isAdmin },
          { id: 'agents-transfer', text: 'Transférer à un agent', icon: Send, path: '/agents/transfer', permission: isAdmin }
        ] : []),
        // Agent
        ...(isAgent ? [
          { id: 'my-balance', text: 'Mon solde', icon: Wallet, path: '/agents/me', permission: isAgent },
          { id: 'my-transactions', text: 'Mes transactions', icon: Receipt, path: '/transactions', permission: isAgent }
        ] : [])
      ]
    },
    ...(canViewAdmin() ? [{
      name: 'ADMINISTRATION',
      icon: Settings,
      items: [
        { id: 'utilisateurs', text: 'Utilisateurs', icon: Users, path: '/utilisateurs', permission: isAdmin },
        { id: 'roles', text: 'Rôles & Permissions', icon: Shield, path: '/roles', permission: isAdmin },
        { id: 'audit', text: "Journal d'audit", icon: History, path: '/audit', permission: isAdmin },
        { id: 'parametres', text: 'Paramètres', icon: Settings, path: '/parametres', permission: isAdmin }
      ]
    }] : []),
    {
      name: 'MON ESPACE',
      icon: UserCircle,
      items: [
        { id: 'profile', text: 'Mon Profil', icon: UserCircle, path: '/profile', permission: true },
        { id: 'settings', text: 'Paramètres', icon: Settings, path: '/settings', permission: true },
        { id: 'support', text: 'Support', icon: HelpCircle, path: '/support', permission: true }
      ]
    }
  ];

  // Filtrer les sections vides
  const visibleSections = menuSections.filter(section => {
    if (section.permission === false) return false;
    const visibleItems = section.items.filter(item => item.permission);
    return visibleItems.length > 0;
  });

  // Raccourci clavier recherche (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = searchQuery.length > 1 ? 
    visibleSections.flatMap(section => 
      section.items.filter(item => 
        item.permission &&
        (item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.name.toLowerCase().includes(searchQuery.toLowerCase()))
      ).map(item => ({ ...item, section: section.name }))
    ) : [];

  return (
    <div className="min-h-screen bg-base-200">
      
      {/* Overlay recherche */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
          <div className="flex items-start justify-center pt-20 px-4" onClick={e => e.stopPropagation()}>
            <div className="w-full max-w-2xl bg-base-100 rounded-2xl shadow-2xl overflow-hidden border border-primary/20">
              <div className="p-4 border-b border-base-200">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-primary" />
                  <input
                    type="text"
                    placeholder="Rechercher un menu... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-base-content placeholder:text-base-content/40"
                    autoFocus
                  />
                  <button onClick={() => setIsSearchOpen(false)} className="p-1 rounded-lg hover:bg-base-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto p-2">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <item.icon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-base-content">{item.text}</p>
                        <p className="text-xs text-base-content/40">{item.section}</p>
                      </div>
                    </Link>
                  ))
                ) : searchQuery.length > 1 ? (
                  <div className="text-center py-8">
                    <p className="text-base-content/40">Aucun résultat pour "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-base-content/40">Tapez pour rechercher un menu</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barre de navigation supérieure */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-primary to-primary/90 shadow-lg border-b-2 border-accent">
        <div className="px-4 sm:px-6 lg:pl-72">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex p-2 rounded-lg text-primary-content hover:bg-primary-content/10 transition-colors"
                title={sidebarOpen ? "Réduire le menu" : "Agrandir le menu"}
              >
                {sidebarOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-primary-content hover:bg-primary-content/10 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link to="/dashboard" className="hidden lg:flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-content/20 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
                  <div className="relative w-10 h-10 bg-base-100 rounded-xl flex items-center justify-center shadow-lg border-2 border-accent">
                    <img src={logo} alt="Logo" className="w-7 h-7 object-contain" />
                  </div>
                </div>
                <div>
                  <h1 className="text-primary-content font-bold text-lg tracking-wide">EBSF</h1>
                  <p className="text-primary-content/60 text-[10px] font-medium">Finance & Partenaires</p>
                </div>
              </Link>

              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-base-100 rounded-lg flex items-center justify-center border-2 border-accent">
                  <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-primary-content font-bold text-sm">EBSF</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-content/10 backdrop-blur-sm">
                <Calendar className="w-4 h-4 text-primary-content/80" />
                <span className="text-sm font-medium text-primary-content">{formattedDate}</span>
                <div className="w-px h-4 bg-primary-content/30 mx-1"></div>
                <Clock className="w-4 h-4 text-primary-content/80" />
                <span className="text-sm font-medium text-primary-content">{formattedTime}</span>
              </div>
              
              {/* Solde de l'agent dans la barre */}
              {isAgent && agentBalance && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/20 backdrop-blur-sm border border-success/30">
                  <Wallet className="w-4 h-4 text-success" />
                  <span className="text-sm font-bold text-success">
                    {new Intl.NumberFormat('fr-FR').format(agentBalance.balance)} {agentBalance.currency || 'XOF'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-lg text-primary-content hover:bg-primary-content/10 transition-colors"
                title="Rechercher (Ctrl+K)"
              >
                <Search className="w-5 h-5" />
              </button>

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-content/10">
                <RoleIcon className="w-4 h-4 text-primary-content" />
                <span className="text-primary-content text-xs font-medium">{roleConfig.label}</span>
              </div>

              {isAdmin && (
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 rounded-lg text-primary-content hover:bg-primary-content/10 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-accent text-accent-content text-xs rounded-full flex items-center justify-center font-bold px-1">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </button>
                  
                  {isNotificationsOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-xl shadow-xl z-50 border border-primary/20 overflow-hidden">
                        <div className="p-3 bg-gradient-to-r from-primary to-primary/80 text-primary-content">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">Notifications</p>
                            {notificationCount > 0 && (
                              <span className="text-xs bg-primary-content/20 px-2 py-0.5 rounded-full">{notificationCount} nouvelle(s)</span>
                            )}
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto divide-y divide-base-200">
                          {notifications.map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => {
                                setIsNotificationsOpen(false);
                                navigate(notif.link);
                              }}
                              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left"
                            >
                              <div className={`p-2 rounded-lg ${
                                notif.type === 'warning' ? 'bg-warning/20' : 
                                notif.type === 'error' ? 'bg-error/20' : 'bg-info/20'
                              }`}>
                                {notif.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-warning" /> : 
                                 notif.type === 'error' ? <AlertTriangle className="w-4 h-4 text-error" /> :
                                 <Users className="w-4 h-4 text-info" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-base-content">{notif.title}</p>
                                <p className="text-xs text-base-content/40">{notif.message}</p>
                              </div>
                            </button>
                          ))}
                          {notifications.length === 0 && (
                            <div className="px-4 py-8 text-center">
                              <CheckCircle className="w-10 h-10 text-success mx-auto mb-2" />
                              <p className="text-sm text-base-content/50">Tout est bon !</p>
                              <p className="text-xs text-base-content/40">Aucune notification</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <button
                onClick={toggleColorMode}
                className="p-2 rounded-lg text-primary-content hover:bg-primary-content/10 transition-colors"
                title={mode === 'dark' ? "Mode clair" : "Mode sombre"}
              >
                {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-primary-content/10 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-content font-bold border-2 border-primary-content shadow-md">
                    {userInitial || 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-primary-content hidden sm:block" />
                </button>
                
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-xl shadow-xl z-50 border border-primary/20 overflow-hidden">
                      <div className="p-4 bg-gradient-to-r from-primary to-primary/80 text-primary-content">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary-content/20 flex items-center justify-center text-xl font-bold">
                            {userInitial || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{userFullName || userName}</p>
                            <p className="text-xs text-primary-content/70 truncate">{userEmail}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className={`badge badge-${roleConfig.color} badge-sm`}>
                                {roleConfig.label}
                              </span>
                              {isAgent && agentBalance && (
                                <span className="badge badge-success badge-sm">
                                  {new Intl.NumberFormat('fr-FR').format(agentBalance.balance)} {agentBalance.currency || 'XOF'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        {isAgent && (
                          <Link
                            to="/agents/me"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors"
                          >
                            <Wallet className="w-5 h-5 text-base-content/40" />
                            <span className="text-sm text-base-content">Mon solde</span>
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors"
                        >
                          <UserCircle className="w-5 h-5 text-base-content/40" />
                          <span className="text-sm text-base-content">Mon profil</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors"
                        >
                          <Settings className="w-5 h-5 text-base-content/40" />
                          <span className="text-sm text-base-content">Paramètres</span>
                        </Link>
                        <div className="border-t border-base-200 my-1"></div>
                        <button
                          onClick={logoutUser}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-error/10 transition-colors text-error"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-sm">Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Desktop */}
      <aside className={`
        fixed left-0 top-16 bottom-0 z-30
        bg-base-100 shadow-xl border-r border-primary/20
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-72' : 'w-20'}
        hidden lg:block
      `}>
        <div className="h-full flex flex-col">
          <div className={`p-4 border-b border-primary/20 ${!sidebarOpen && 'text-center'} bg-gradient-to-r from-primary/5 to-transparent`}>
            <div className={`flex items-center ${!sidebarOpen && 'justify-center'} gap-3`}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <img src={logo} alt="Logo" className="w-7 h-7 object-contain" />
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="font-bold text-base-content text-sm">EBSF</h2>
                  <p className="text-xs text-base-content/50">Finance & Partenaires</p>
                </div>
              )}
            </div>
          </div>

          <div className={`p-4 border-b border-primary/20 ${!sidebarOpen && 'text-center'} ${roleConfig.color === 'error' ? 'bg-error/5' : 'bg-primary/5'}`}>
            <div className={`flex items-center ${!sidebarOpen && 'flex-col'} gap-3`}>
              <div className="avatar placeholder">
                <div className={`bg-gradient-to-br from-primary to-primary/80 text-primary-content rounded-xl ${sidebarOpen ? 'w-12 h-12' : 'w-10 h-10'} shadow-lg ring-2 ring-primary/20`}>
                  <span className={`${sidebarOpen ? 'text-xl' : 'text-lg'} font-bold`}>{userInitial || 'U'}</span>
                </div>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-base-content">{userFullName || userName}</p>
                  <p className="text-xs text-base-content/50 truncate">{userEmail}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className={`badge badge-${roleConfig.color} badge-sm`}>
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {roleConfig.label}
                    </span>
                    {isAgent && agentBalance && (
                      <span className="badge badge-success badge-sm">
                        {new Intl.NumberFormat('fr-FR').format(agentBalance.balance)} {agentBalance.currency || 'XOF'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {visibleSections.map((section, idx) => {
              const visibleItems = section.items.filter(item => item.permission);
              if (visibleItems.length === 0) return null;
              const SectionIcon = section.icon;
              const isOpen = openSections[section.name];
              
              return (
                <div key={idx} className="mb-1">
                  <button
                    onClick={() => handleSectionToggle(section.name)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${!sidebarOpen && 'justify-center'}
                      ${isOpen 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-base-content/70 hover:bg-primary/5 hover:text-primary'
                      }
                    `}
                  >
                    <SectionIcon className={`w-5 h-5 ${isOpen ? 'text-primary' : ''}`} />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-xs font-semibold tracking-wide uppercase">
                          {section.name}
                        </span>
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </>
                    )}
                  </button>
                  
                  {sidebarOpen && isOpen && (
                    <div className="ml-6 mt-2 space-y-1 border-l-2 border-primary pl-4">
                      {visibleItems.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = path === item.path;
                        return (
                          <Link
                            key={item.id}
                            to={item.path}
                            className={`
                              flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                              ${isActive 
                                ? 'bg-primary text-primary-content shadow-md' 
                                : 'text-base-content/60 hover:bg-primary/10 hover:text-primary'
                              }
                            `}
                          >
                            <ItemIcon className={`w-4 h-4 ${isActive ? 'text-primary-content' : ''}`} />
                            <span className="flex-1">{item.text}</span>
                            {item.badge > 0 && (
                              <span className={`badge badge-error badge-xs ${isActive ? 'badge-outline' : ''}`}>
                                {item.badge > 99 ? '99+' : item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-4 border-t border-primary/20 bg-base-100">
            {sidebarOpen ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                  <span className="text-xs text-base-content/50">v1.0.0</span>
                </div>
                <span className="badge badge-primary badge-sm">Gestion financière</span>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className={`transition-all duration-300 pt-16 ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-20'}`}>
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            content
          )}
        </div>
      </main>

      {/* Menu mobile (version simplifiée) */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed top-0 left-0 bottom-0 w-80 bg-base-100 z-50 shadow-2xl lg:hidden overflow-y-auto">
            <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-base-100 rounded-xl flex items-center justify-center p-2 shadow-lg">
                    <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-primary-content font-bold text-lg">EBSF</h2>
                    <p className="text-primary-content/70 text-xs">Finance</p>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-primary-content p-2 rounded-lg hover:bg-primary-content/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {isAgent && agentBalance && (
                <div className="bg-primary-content/10 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-primary-content/80 text-sm">Mon solde</span>
                  <span className="text-primary-content font-bold">
                    {new Intl.NumberFormat('fr-FR').format(agentBalance.balance)} {agentBalance.currency || 'XOF'}
                  </span>
                </div>
              )}
            </div>

            <div className="py-4 px-3 space-y-1">
              {visibleSections.map((section, idx) => {
                const visibleItems = section.items.filter(item => item.permission);
                if (visibleItems.length === 0) return null;
                const SectionIcon = section.icon;
                const isOpen = openSections[section.name];
                
                return (
                  <div key={idx} className="mb-2">
                    <button
                      onClick={() => handleSectionToggle(section.name)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <SectionIcon className="w-5 h-5 text-primary" />
                        <span className="text-xs font-bold uppercase">{section.name}</span>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {isOpen && (
                      <div className="ml-6 mt-2 space-y-1 border-l-2 border-primary pl-4">
                        {visibleItems.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = path === item.path;
                          return (
                            <Link
                              key={item.id}
                              to={item.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`
                                flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                                ${isActive ? 'bg-primary text-primary-content' : 'hover:bg-primary/10'}
                              `}
                            >
                              <ItemIcon className="w-4 h-4" />
                              <span>{item.text}</span>
                              {item.badge > 0 && (
                                <span className="badge badge-error badge-xs ml-auto">{item.badge > 99 ? '99+' : item.badge}</span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;