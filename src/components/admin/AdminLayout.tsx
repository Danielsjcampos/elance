import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  LayoutDashboard, 
  Users, 
  Gavel, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  CheckSquare,
  AlertCircle,
  Clock,
  Activity,
  Palette,
  Globe,
  Shield,
  DollarSign
} from 'lucide-react';
import { Logo } from '../../../components/Logo';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { layoutMode } = useTheme();

  useEffect(() => {
    // Consolidated session and profile fetch
    const initSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/admin/login');
            return;
        }
        await loadUserProfile(session.user);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!session) {
            navigate('/admin/login', { state: { loggedOut: true } });
        } else {
             await loadUserProfile(session.user);
        }
    });
    
    fetchAlerts();
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch User Profile
  const loadUserProfile = async (authUser: any) => {
      if (!authUser) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
            full_name, 
            role, 
            access_profile:access_profiles(name, permissions),
            unit:franchise_units(name)
        `)
        .eq('id', authUser.id)
        .single();
      
      const accessProfileData = Array.isArray(profile?.access_profile) ? profile.access_profile[0] : profile?.access_profile;
      const unitData = Array.isArray(profile?.unit) ? profile.unit[0] : profile?.unit;
      
      setUser({
          ...authUser,
          full_name: profile?.full_name || authUser.email,
          role_name: accessProfileData?.name || (profile?.role === 'admin' ? 'Administrador' : 'Colaborador'),
          unit_name: unitData?.name || 'Matriz Elite',
          permissions: accessProfileData?.permissions || {} 
      });
  };

  const fetchAlerts = async () => {
     const { count: pendingTasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending');
     const { count: newLeads } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'novo');
     
     const newAlerts = [];
     if (pendingTasks) newAlerts.push({ type: 'task', count: pendingTasks, label: 'Tarefas Pendentes', path: '/admin/tarefas', icon: CheckSquare, color: 'text-orange-400' });
     if (newLeads) newAlerts.push({ type: 'lead', count: newLeads, label: 'Novos Leads', path: '/admin/leads', icon: Users, color: 'text-green-400' });
     
     newAlerts.push({ type: 'system', count: 1, label: 'Backup do Sistema', path: '/admin/configuracoes', icon: Settings, color: 'text-blue-400' });

     setAlerts(newAlerts);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Navigation is handled by onAuthStateChange listener
  };

  // Permission Verification Helper
  const hasPermission = (permission_key: string) => {
      if (!user) return false;
      // Admin Master / God Mode
      if (user.role_name === 'Administrador Master' || user.permissions?.all) return true;
      // Specific check
      return !!user.permissions?.[permission_key];
  };

  const allNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', color: 'text-blue-400', glow: 'shadow-blue-500/50', gradient: 'from-blue-500 to-cyan-500', reqPerm: null }, // Always visible
    { label: 'Tarefas', icon: CheckSquare, path: '/admin/tarefas', color: 'text-emerald-400', glow: 'shadow-emerald-500/50', gradient: 'from-emerald-500 to-green-500', reqPerm: 'tasks' },
    { label: 'Treinamento', icon: Activity, path: '/admin/treinamento', color: 'text-amber-400', glow: 'shadow-amber-500/50', gradient: 'from-amber-500 to-orange-500', reqPerm: 'training' },
    { label: 'Documentos', icon: FileText, path: '/admin/documentos', color: 'text-slate-300', glow: 'shadow-slate-500/50', gradient: 'from-slate-400 to-gray-500', reqPerm: 'view_legal' },
    { label: 'Marketing', icon: Palette, path: '/admin/marketing', color: 'text-pink-400', glow: 'shadow-pink-500/50', gradient: 'from-pink-500 to-rose-500', reqPerm: 'marketing' },
    { label: 'Agenda', icon: Clock, path: '/admin/agenda', color: 'text-violet-400', glow: 'shadow-violet-500/50', gradient: 'from-violet-500 to-purple-500', reqPerm: null }, // Every employee usually has agenda?
    { label: 'Leads & CRM', icon: Users, path: '/admin/leads', color: 'text-indigo-400', glow: 'shadow-indigo-500/50', gradient: 'from-indigo-500 to-blue-600', reqPerm: 'leads' },
    { label: 'Leilões', icon: Gavel, path: '/admin/leiloes', color: 'text-red-400', glow: 'shadow-red-500/50', gradient: 'from-red-500 to-orange-600', reqPerm: 'auctions' },
    { label: 'Franqueados', icon: Globe, path: '/admin/franqueados', color: 'text-cyan-400', glow: 'shadow-cyan-500/50', gradient: 'from-cyan-500 to-blue-500', reqPerm: 'view_financial' }, // Usually only Managers/Admins
    { label: 'Colaboradores', icon: Shield, path: '/admin/colaboradores', color: 'text-teal-400', glow: 'shadow-teal-500/50', gradient: 'from-teal-500 to-emerald-500', reqPerm: 'manage_team' },
    { label: 'Financeiro', icon: DollarSign, path: '/admin/financeiro', color: 'text-green-400', glow: 'shadow-green-500/50', gradient: 'from-green-500 to-lime-500', reqPerm: 'view_financial' },
  ];

  // Filter items
  const navItems = allNavItems.filter(item => {
      if (!item.reqPerm) return true; // No permission required
      return hasPermission(item.reqPerm);
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 flex overflow-hidden font-sans selection:bg-pink-500/30">
      {/* Sidebar (Only if layoutMode is sidebar) */}
      {layoutMode === 'sidebar' && (
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1e293b]/95 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 ease-in-out transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0`}
        >
          <div className="h-full flex flex-col">
            <div className="h-20 flex flex-col justify-center px-6 border-b border-white/5">
              <Logo className="h-6 w-auto mb-1" />
              {user && (
                 <div className="flex flex-col">
                     <span className="text-xs text-blue-400 font-bold tracking-wide uppercase">{user.role_name || 'Usuário'}</span>
                     <span className="text-[10px] text-gray-500 truncate">{user.unit_name || 'Matriz'}</span>
                 </div>
              )}
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? `bg-white/5 border border-white/5 ${item.color} shadow-lg shadow-black/20`
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`}
                  >
                    <item.icon
                      size={20}
                      className={`transition-colors duration-300 ${isActive ? item.color : 'text-gray-500 group-hover:text-gray-300'}`}
                    />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>
      )}

      {/* Main Content Component */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0">
          {layoutMode === 'sidebar' && (
             <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
          {layoutMode === 'dock' && <Logo className="h-8 w-auto ml-2" />}

          <div className="flex-1 max-w-xl mx-4 lg:mx-8 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Buscar leads, processos ou documentos..."
                className="w-full bg-[#1e293b]/50 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            
            <button
              onClick={() => navigate('/admin/configuracoes')}
              className="p-2.5 text-gray-400 hover:text-primary-400 rounded-xl hover:bg-white/5 transition-all active:scale-95"
              title="Configurações"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 text-gray-400 hover:text-red-400 rounded-xl hover:bg-white/5 transition-all active:scale-95"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
            
            <div className="h-6 w-px bg-white/10 mx-2"></div>

            {/* Bell Icon */}
            <div className="relative">
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2.5 rounded-xl hover:bg-white/5 transition-all active:scale-95 ${showNotifications ? 'text-white bg-white/5' : 'text-gray-400'}`}
                >
                    <Bell size={20} />
                    {alerts.length > 0 && (
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-[#1e293b] animate-pulse"></span>
                    )}
                </button>
                {showNotifications && (
                    <div className="absolute right-0 top-full mt-4 w-80 bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 animate-fade-in-up overflow-hidden ring-1 ring-white/5">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h3 className="font-bold text-white text-sm">Notificações</h3>
                            <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                           {alerts.length === 0 ? (
                                <p className="text-center text-gray-500 py-8 text-xs">Nenhuma notificação.</p>
                            ) : (
                                alerts.map((alert, idx) => (
                                    <Link 
                                        to={alert.path} 
                                        key={idx}
                                        onClick={() => setShowNotifications(false)}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                                    >
                                        <div className={`p-2 rounded-lg bg-opacity-10 ${alert.icon === CheckSquare ? 'bg-orange-500' : 'bg-green-500'} ${alert.color}`}>
                                            <alert.icon size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{alert.label}</span>
                                                <span className="text-[10px] font-bold text-white bg-white/10 px-1.5 py-0.5 rounded border border-white/5">{alert.count}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">Toque para ver</p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <div 
                onClick={() => navigate('/admin/configuracoes')}
                className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white/10 shadow-lg cursor-pointer ml-1 hover:scale-105 transition-transform hover:ring-2 hover:ring-white/20" 
                title="Seu Perfil"
            ></div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
            {/* Page Content */}
            <main className="flex-1 overflow-y-auto bg-[#0f172a] p-4 lg:p-8 pb-36 relative scroll-smooth selection:bg-purple-500/30">
                 {/* Subtle Background Glows */}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]"></div>
                    <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]"></div>
                </div>
                <div className="relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>

        {/* --- DOCK / MACBOOK STYLE MENU --- */}
        {layoutMode === 'dock' && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center gap-2">
              <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3 flex gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/5 animate-fade-in-up items-end pb-4">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="group relative flex flex-col items-center transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-3 hover:scale-110 active:scale-95"
                    >
                      {/* Icon Container with Glass Effect */}
                      <div className={`p-3 rounded-2xl backdrop-blur-md border border-white/5 transition-all duration-300 ${
                          isActive 
                          ? `bg-gradient-to-b ${item.gradient} text-white shadow-lg ${item.glow} scale-110 mb-1 ring-1 ring-white/20` 
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20 hover:shadow-lg hover:shadow-white/5'
                      }`}>
                          <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      
                      {/* Reflection/Dot for Active */}
                      {isActive && (
                          <div className={`absolute -bottom-3 w-1.5 h-1.5 rounded-full bg-white opacity-80 shadow-[0_0_8px_rgba(255,255,255,0.8)]`}></div>
                      )}

                      {/* Tooltip */}
                      <span className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0 text-xs font-semibold text-white bg-[#1e293b]/90 backdrop-blur px-2.5 py-1 rounded-lg border border-white/10 shadow-xl whitespace-nowrap pointer-events-none">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
          </div>
        )}
      </div>

      {/* Mobile Sidebar Overlay (Only for sidebar mode) */}
      {layoutMode === 'sidebar' && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;
