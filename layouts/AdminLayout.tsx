import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Users, Gavel, Building2, LogOut, School, FileText, Calendar, DollarSign, Scale, User, X, Lock, Mail, UserCircle, Save, CheckSquare, GraduationCap, Megaphone, Settings, Bot, Newspaper, Contact } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

import { useTheme } from '../contexts/ThemeContext';

const AdminLayout: React.FC = () => {
    const { signOut, user, profile } = useAuth();
    const { menuMode, customTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Permission Helper
    const canSee = (key: string) => {
        if (!profile) return true;
        if (profile.role === 'admin') return true;
        if (key === 'settings') return false;
        if (profile.permissions) {
            return profile.permissions[key] !== false;
        }
        return true;
    };

    // MacBook Mode Colors
    const getIconColor = (key: string) => {
        const colors: Record<string, string> = {
            dashboard: 'text-blue-500',
            franchises: 'text-purple-500',
            leads: 'text-green-500',
            auctions: 'text-orange-500',
            tasks: 'text-red-500',
            training: 'text-indigo-500',
            documents: 'text-yellow-500',
            marketing: 'text-pink-500',
            agenda: 'text-teal-500',
            finance: 'text-emerald-500',
            datajud: 'text-cyan-500',
            ai_assistant: 'text-violet-500', // Robot purple
            settings: 'text-gray-500',
        };
        return colors[key] || 'text-gray-500';
    };

    // Sidebar items config
    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', key: 'dashboard' },
        { label: 'Notícias (Blog)', icon: Newspaper, path: '/admin/news', key: 'news' },
        { label: 'Franquias', icon: Building2, path: '/admin/franquias', key: 'franchises' },
        { label: 'Leads (Kanban)', icon: Users, path: '/admin/leads', key: 'leads' },
        { label: 'Base de Clientes', icon: Contact, path: '/admin/clients', key: 'clients' },
        { label: 'Leilões', icon: Gavel, path: '/admin/leiloes', key: 'auctions' },
        { label: 'Tarefas', icon: CheckSquare, path: '/admin/tarefas', key: 'tasks' },
        { label: 'Treinamento', icon: GraduationCap, path: '/admin/treinamento', key: 'training' },
        { label: 'Documentos', icon: FileText, path: '/admin/documentos', key: 'documents' },
        { label: 'Marketing', icon: Megaphone, path: '/admin/marketing', key: 'marketing' },
        { label: 'Agenda', icon: Calendar, path: '/admin/agenda', key: 'agenda' },
        { label: 'Financeiro', icon: DollarSign, path: '/admin/financeiro', key: 'finance' },
        { label: 'Jurídico (Datajud)', icon: Scale, path: '/admin/datajud', key: 'datajud' },
        { label: 'I.A. Jurídica', icon: Bot, path: '/admin/ia-juridica', key: 'ai_assistant' },
        { label: 'E-mail & Fluxos', icon: Mail, path: '/admin/email-marketing', key: 'marketing' },
        { label: 'Configurações', icon: Settings, path: '/admin/settings', key: 'settings' },
    ];
    const isActive = (path: string) => location.pathname.includes(path);

    // Dynamic Styles based on Mode
    const isMacBook = menuMode === 'macbook';

    const sidebarClasses = isMacBook
        ? "w-64 hidden md:flex flex-col m-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl"
        : "w-64 bg-[#151d38] text-white hidden md:flex flex-col";

    const logoClasses = isMacBook
        ? "text-2xl font-bold tracking-tight text-gray-800"
        : "text-2xl font-bold tracking-tight text-white";

    // Mobile Menu State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Helper for Glass Effect
    const hexToRgba = (hex: string, alpha: number) => {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex[1] + hex[2], 16);
            g = parseInt(hex[3] + hex[4], 16);
            b = parseInt(hex[5] + hex[6], 16);
        }
        return `rgba(${r},${g},${b},${alpha})`;
    };

    return (
        <div className={`flex h-screen ${isMacBook ? 'bg-cover bg-center bg-no-repeat' : 'bg-gray-100'}`} style={isMacBook ? { backgroundImage: 'url("https://4kwallpapers.com/images/wallpapers/macos-monterey-stock-light-layer-5k-5120x2880-5897.jpg")' } : {}}>

            {/* Standard Sidebar (Hidden in MacBook Mode) */}
            {!isMacBook && (
                <aside
                    className={`hidden md:flex flex-col transition-all duration-300 ${isMacBook ? 'w-64' : customTheme.menuViewMode === 'grid' ? (customTheme.gridColumns === 3 ? 'w-80' : 'w-64') : 'w-64'} ${customTheme.glassEffect ? 'backdrop-blur-xl border-r border-white/20 shadow-xl' : ''}`}
                    style={{
                        backgroundColor: customTheme.glassEffect ? hexToRgba(customTheme.sidebarColor, 0.85) : customTheme.sidebarColor,
                        color: customTheme.textColor
                    }}
                >
                    <div className="p-6">
                        <h1 className={`font-bold tracking-tight ${customTheme.fontSize === 'lg' ? 'text-3xl' : customTheme.fontSize === 'sm' ? 'text-xl' : 'text-2xl'}`} style={{ fontFamily: customTheme.fontFamily }}>
                            E-Lance <span style={{ color: customTheme.primaryColor }}>Admin</span>
                        </h1>
                    </div>

                    <nav className={`flex-1 px-4 py-6 overflow-y-auto custom-scrollbar ${customTheme.menuViewMode === 'grid'
                            ? `grid ${customTheme.gridColumns === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 content-start`
                            : 'space-y-1'
                        }`}>
                        {menuItems.map((item) => {
                            if (!canSee(item.key)) return null;
                            const active = location.pathname.includes(item.path);

                            // Grid Mode Item
                            if (customTheme.menuViewMode === 'grid') {
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all aspect-square border ${active
                                                ? 'bg-opacity-20 border-opacity-30' // Grid active state is subtle
                                                : 'border-transparent hover:bg-white/5'
                                            }`}
                                        style={{
                                            backgroundColor: active ? customTheme.primaryColor : 'transparent',
                                            borderColor: active ? customTheme.primaryColor : 'transparent'
                                        }}
                                        title={item.label}
                                    >
                                        <item.icon
                                            size={customTheme.iconSize + 4}
                                            className={customTheme.colorfulIcons && !active ? getIconColor(item.key) : ''}
                                            style={{ color: active ? customTheme.primaryColor : (customTheme.colorfulIcons ? undefined : customTheme.textColor) }}
                                        />
                                        <span className="text-[10px] text-center mt-1 truncate w-full" style={{ fontFamily: customTheme.fontFamily }}>
                                            {item.label.split(' ')[0]}
                                        </span>
                                    </Link>
                                );
                            }

                            // List Mode Item
                            const pyClass = customTheme.menuSpacing === 'compact' ? 'py-2' : customTheme.menuSpacing === 'relaxed' ? 'py-4' : 'py-3';
                            const textClass = customTheme.fontSize === 'sm' ? 'text-xs' : customTheme.fontSize === 'lg' ? 'text-lg' : 'text-sm';

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 rounded-lg transition-colors ${pyClass} ${active ? 'bg-opacity-100 shadow-sm' : 'hover:bg-white/5'
                                        }`}
                                    style={{
                                        backgroundColor: active ? customTheme.primaryColor : 'transparent',
                                        color: active ? '#fff' : customTheme.textColor,
                                        fontFamily: customTheme.fontFamily
                                    }}
                                >
                                    <item.icon
                                        size={customTheme.iconSize}
                                        className={customTheme.colorfulIcons && !active ? getIconColor(item.key) : ''}
                                        style={{ color: active ? '#fff' : (customTheme.colorfulIcons ? undefined : customTheme.textColor) }}
                                    />
                                    <span className={`font-medium ${textClass}`}>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-white/10">
                        <button onClick={signOut} className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-white/5 rounded-lg transition-colors">
                            <LogOut size={customTheme.iconSize} />
                            <span style={{ fontFamily: customTheme.fontFamily, fontSize: customTheme.fontSize === 'sm' ? '0.8rem' : '1rem' }}>Sair</span>
                        </button>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <header className={`${isMacBook ? 'bg-white/70 backdrop-blur-md border-b border-white/20' : 'bg-white shadow-sm'} h-16 flex items-center px-6 justify-between z-10 transition-all`}>
                    <div className="flex items-center gap-3">
                        {isMacBook && <h1 className="text-xl font-bold tracking-tight text-gray-800 mr-4">E-Lance</h1>}
                        <h2 className={`text-xl font-semibold ${isMacBook ? 'text-gray-700' : 'text-gray-800'} truncate max-w-[200px] md:max-w-none`}>
                            {location.pathname.includes('dashboard') ? 'Dashboard' :
                                location.pathname.includes('leads') ? 'Gestão de Leads' :
                                    location.pathname.includes('leiloes') ? 'Gestão de Leilões' :
                                        location.pathname.includes('franquias') ? 'Gestão de Franquias' : 'Painel'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <ProfileMenu />
                    </div>
                </header>

                <main className={`flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 ${isMacBook ? 'bg-transparent pb-32' : 'bg-gray-100 pb-24 md:pb-6'}`}>
                    <div className={`${isMacBook ? 'bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 min-h-full' : ''}`}>
                        <Outlet />
                    </div>
                </main>

                {/* MacBook Dock (Desktop Only) */}
                {isMacBook && (
                    <div className="hidden md:block absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                        <div className="flex items-end gap-2 px-4 py-3 bg-white/40 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl transition-all duration-300 hover:px-6 hover:gap-4 hover:scale-105">
                            {menuItems.map((item) => {
                                if (!canSee(item.key)) return null;
                                const active = location.pathname.includes(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className="group relative flex flex-col items-center justify-end transition-all duration-200 hover:-translate-y-3"
                                    >
                                        <div className={`
                                            w-12 h-12 flex items-center justify-center rounded-xl shadow-lg transition-all duration-300
                                            ${active ? 'bg-white scale-110 ring-2 ring-blue-400' : 'bg-white/80 hover:bg-white hover:scale-125'}
                                        `}>
                                            <item.icon size={24} className={getIconColor(item.key)} />
                                        </div>
                                        <span className="absolute -top-10 bg-gray-900/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {item.label}
                                        </span>
                                        {active && <div className="w-1 h-1 bg-gray-800 rounded-full mt-1" />}
                                    </Link>
                                );
                            })}
                            <div className="w-px h-10 bg-gray-400/30 mx-1" />
                            <button
                                onClick={signOut}
                                className="group relative flex flex-col items-center justify-end transition-all duration-200 hover:-translate-y-3"
                            >
                                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50/80 shadow-lg hover:bg-red-100 hover:scale-125 transition-all">
                                    <LogOut size={22} className="text-red-500" />
                                </div>
                                <span className="absolute -top-10 bg-gray-900/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    Sair
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* =================================================================================
                    MOBILE NAVIGATION (Floating Button + Grid Overlay)
                   ================================================================================= */}

                {/* 1. Floating Launcher Button (Visible only on Mobile) */}
                <div className="md:hidden absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#151d38]/90 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all text-white font-medium"
                    >
                        <LayoutDashboard size={20} />
                        <span className="text-sm">Menu</span>
                    </button>
                </div>

                {/* 2. Fullscreen Grid Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 flex flex-col bg-[#151d38]/95 backdrop-blur-2xl animate-in fade-in duration-200">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-white">Navegação</h2>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Grid Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-3 gap-6">
                                {menuItems.map((item) => {
                                    if (!canSee(item.key)) return null;
                                    const active = location.pathname.includes(item.path);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex flex-col items-center gap-2 group"
                                        >
                                            <div className={`
                                                w-16 h-16 flex items-center justify-center rounded-2xl shadow-xl transition-all duration-300
                                                ${active
                                                    ? 'bg-gradient-to-br from-[#3a7ad1] to-[#2a61b0] text-white ring-2 ring-white/50'
                                                    : 'bg-white/10 text-white hover:bg-white/20'
                                                }
                                            `}>
                                                <item.icon size={28} className={active ? 'text-white' : ''} />
                                            </div>
                                            <span className="text-xs font-medium text-white text-center leading-tight">
                                                {item.label.replace(' (Kanban)', '').replace(' (Datajud)', '')}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Additional Actions */}
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <button
                                    onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 transition-colors"
                                >
                                    <LogOut size={20} /> Sair do Sistema
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};



const ProfileMenu: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
        setProfile(data);
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold hover:bg-blue-200 transition-colors border border-blue-200"
                title="Configurações do Perfil"
            >
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User size={18} />}
            </button>

            {showModal && <ProfileSettingsModal user={user} profile={profile} onClose={() => setShowModal(false)} onUpdate={fetchProfile} />}
        </>
    );
};

const ProfileSettingsModal = ({ user, profile, onClose, onUpdate }: any) => {
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            // 1. Update Profile (Name)
            if (fullName !== profile?.full_name) {
                const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
                if (error) throw error;
            }

            // 2. Update Auth (Email/Password)
            if (password || email !== user.email) {
                const updates: any = {};
                if (email !== user.email) updates.email = email;
                if (password) updates.password = password;

                const { error } = await supabase.auth.updateUser(updates);
                if (error) throw error;
                if (password) alert('Senha atualizada com sucesso!');
            }

            onUpdate();
            alert('Perfil atualizado com sucesso!');
            onClose();
        } catch (error: any) {
            alert('Erro ao atualizar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-[#151d38] p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <UserCircle className="text-[#3a7ad1]" />
                        Meu Perfil
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-white" /></button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex justify-center mb-4">
                        <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400 border-2 border-dashed border-gray-300">
                            {fullName ? fullName.charAt(0).toUpperCase() : <User size={32} />}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                className="w-full border rounded-lg pl-10 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="Seu nome"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                className="w-full border rounded-lg pl-10 p-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled // Email update often requires confirmation, creating complexity. Let's keep it disabled or handle simpler. "updateUser" sends confirmation email.
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Para alterar o email, entre em contato com o suporte.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alterar Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="password"
                                className="w-full border rounded-lg pl-10 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Nova senha (deixe em branco para manter)"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cargo / Função</label>
                        <div className="w-full border rounded-lg p-2 text-sm bg-blue-50 text-blue-800 font-semibold border-blue-100">
                            {profile?.role === 'admin' ? 'Super Admin (Matriz)' : profile?.role === 'manager' ? 'Gerente de Franquia' : 'Colaborador'}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg">Cancelar</button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-[#3a7ad1] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#2a61b0] flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : <><Save size={18} /> Salvar Alterações</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
