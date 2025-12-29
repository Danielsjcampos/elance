import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Building, Users, Shield, Check, X, Trash2, Edit, Palette, Mail, Send, Upload } from 'lucide-react';
import { sendEmail } from '../../services/emailService';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Modal } from '../../components/Modal';

interface FranchiseSettings {
    id: string;
    name: string;
    site_title?: string;
    featured_image_url?: string;
    cnpj: string;
    address: string;
    phone: string;
    email_contact: string;
    logo_url: string;
    icon_url?: string;
    smtp_config: {
        host: string;
        port: string;
        user: string;
        pass: string;
        secure: boolean;
        sender_name: string;
        sender_email: string;
        provider?: 'smtp' | 'brevo';
        brevo_key?: string;
    };
}

interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    permissions: Record<string, boolean>;
}

const Settings: React.FC = () => {
    const { profile, isAdmin } = useAuth();
    const { menuMode, setMenuMode, customTheme, updateCustomTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'general' | 'team' | 'appearance' | 'email'>('general');
    const [loading, setLoading] = useState(true);
    const [testLog, setTestLog] = useState<string[]>([]); // Log visual para debug

    // General Settings State
    const [settings, setSettings] = useState<Partial<FranchiseSettings>>({});

    // Team State
    const [team, setTeam] = useState<UserProfile[]>([]);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

    const [isPermModalOpen, setIsPermModalOpen] = useState(false);

    // User Edit State
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [userDataToEdit, setUserDataToEdit] = useState({
        id: '',
        full_name: '',
        email: '',
        password: '', // Optional (blank to keep current)
        role: 'manager'
    });

    useEffect(() => {
        if (profile) {
            // Always fetch team (since we want global visibility)
            fetchTeam();

            if (profile.franchise_unit_id) {
                fetchSettings();
            } else {
                setLoading(false); // Stop loading if no franchise to fetch
            }
        }
    }, [profile]);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('franchise_units')
                .select('*')
                .eq('id', profile?.franchise_unit_id)
                .single();

            if (error) throw error;
            setSettings(data || {});
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeam = async () => {
        try {
            let query = supabase
                .from('profiles')
                .select('*');

            // If NOT admin, filter by franchise. If Admin, show all (or optionally filter, but user requested all).
            // User Request: "Manager e admin pode ver tudo" - disabling filter.
            // if (!isAdmin) {
            //    query = query.eq('franchise_unit_id', profile?.franchise_unit_id);
            // }

            const { data, error } = await query;

            if (error) throw error;
            setTeam(data || []);
        } catch (error) {
            console.error('Error fetching team:', error);
        }
    };

    const [uploading, setUploading] = useState<'logo' | 'icon' | 'featured' | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'icon' | 'featured') => {
        try {
            setUploading(type);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Você deve selecionar uma imagem para upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile?.franchise_unit_id}/${type}_${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            let { error: uploadError } = await supabase.storage
                .from('franchise-assets')
                .upload(filePath, file);

            if (uploadError) {
                // Try upsert if exists? Or random name makes it unique. 
                // But let's handle if bucket bucket doesn't exist? (Assuming we run migration)
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('franchise-assets')
                .getPublicUrl(filePath);

            if (type === 'logo') {
                setSettings({ ...settings, logo_url: publicUrl });
            } else if (type === 'icon') {
                setSettings({ ...settings, icon_url: publicUrl });
            } else if (type === 'featured') {
                setSettings({ ...settings, featured_image_url: publicUrl });
            }

        } catch (error: any) {
            alert('Erro no upload: ' + error.message);
        } finally {
            setUploading(null);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('franchise_units')
                .update({
                    name: settings.name,
                    site_title: settings.site_title,
                    featured_image_url: settings.featured_image_url,
                    cnpj: settings.cnpj,
                    address: settings.address,
                    phone: settings.phone,
                    email_contact: settings.email_contact,
                    logo_url: settings.logo_url,
                    icon_url: settings.icon_url,
                    smtp_config: settings.smtp_config
                })
                .eq('id', profile?.franchise_unit_id);

            if (error) throw error;
            alert('Configurações salvas com sucesso!');
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
        try {
            const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId });
            if (error) throw error;
            alert('Usuário excluído!');
            fetchTeam();
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    // Reusing the Create Modal logic for updates is tricky because the modal is "Create".
    // I should probably make the modal "User Form" handling both, OR make a separate Edit function/modal.
    // For simplicity and speed: I will adapt "Create Modal" to be "User Modal" (Upsert logic).
    // Or simpler: Just add delete for now and rely on "Edit Permissions" for permissions.
    // But user asked to edit.

    // UPDATE: User wants to Edit. I will use the `editingUser` state (perm modal) to also handle Full Edits? 
    // No, `editingUser` is UserProfile. `newUser` is local state.
    // Let's stick to adding DELETE first as easier chunk.

    const handleSavePermissions = async () => {
        if (!editingUser) return;
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ permissions: editingUser.permissions })
                .eq('id', editingUser.id);

            if (error) throw error;
            setIsPermModalOpen(false);
            setEditingUser(null);
            fetchTeam();
            alert('Permissões atualizadas!');
        } catch (error: any) {
            alert('Erro ao atualizar permissões: ' + error.message);
        }
    };

    const openEditUserModal = (user: UserProfile) => {
        setUserDataToEdit({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            password: '',
            role: user.role
        });
        setIsEditUserModalOpen(true);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.rpc('admin_update_user', {
                target_user_id: userDataToEdit.id,
                new_email: userDataToEdit.email,
                new_password: userDataToEdit.password || null, // Pass null if empty
                new_full_name: userDataToEdit.full_name,
                new_role: userDataToEdit.role,
                new_permissions: null // Not updating permissions here
            });

            if (error) throw error;

            alert('Usuário atualizado com sucesso!');
            setIsEditUserModalOpen(false);
            fetchTeam();
        } catch (error: any) {
            alert('Erro ao atualizar usuário: ' + error.message);
        }
    };

    const togglePermission = (key: string) => {
        if (!editingUser) return;
        setEditingUser({
            ...editingUser,
            permissions: {
                ...editingUser.permissions,
                [key]: !editingUser.permissions?.[key]
            }
        });
    };

    const permissionKeys = [
        { key: 'dashboard', label: 'Ver Dashboard' },
        { key: 'leads', label: 'Ver Leads' },
        { key: 'auctions', label: 'Ver Leilões' },
        { key: 'tasks', label: 'Ver Tarefas' },
        { key: 'training', label: 'Ver Treinamentos' },
        { key: 'documents', label: 'Ver Documentos' },
        { key: 'marketing', label: 'Ver Marketing' },
        { key: 'agenda', label: 'Ver Agenda' },
        { key: 'finance', label: 'Ver Financeiro' },
        { key: 'datajud', label: 'Ver Jurídico (Datajud)' },
        { key: 'settings', label: 'Ver Configurações' }
    ];

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creatingUser, setCreatingUser] = useState(false);
    const [newUser, setNewUser] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'manager',
        permissions: {} as Record<string, boolean>
    });

    const toggleNewUserPermission = (key: string) => {
        setNewUser({
            ...newUser,
            permissions: {
                ...newUser.permissions,
                [key]: !newUser.permissions[key]
            }
        });
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingUser(true);

        try {
            const { error } = await supabase.rpc('admin_create_user', {
                new_email: newUser.email,
                new_password: newUser.password,
                new_full_name: newUser.full_name,
                new_role: newUser.role,
                new_franchise_id: profile?.franchise_unit_id,
                new_permissions: newUser.permissions
            });

            if (error) throw error;

            // Send Welcome Email
            try {
                await sendEmail({
                    to: newUser.email,
                    subject: 'Bem-vindo ao Sistema Elance!',
                    html: `
                        <div style="font-family: Arial, sans-serif; color: #333;">
                            <h1 style="color: #3a7ad1;">Bem-vindo, ${newUser.full_name}!</h1>
                            <p>Sua conta foi criada com sucesso no Sistema Elance.</p>
                            <p><b>Login:</b> ${newUser.email}</p>
                            <p><b>Senha:</b> ${newUser.password}</p>
                            <p>Acesse o sistema para começar.</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="font-size: 12px; color: #999;">Esta é uma mensagem automática.</p>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Erro ao enviar email de boas-vindas:', emailError);
                // Don't block success alert if email fails, but maybe warn?
                // alert('Usuário criado, mas erro ao enviar email.');
            }

            alert('Usuário criado com sucesso! Email de boas-vindas enviado.');
            setIsCreateModalOpen(false);
            setNewUser({ full_name: '', email: '', password: '', role: 'collaborator', permissions: {} });
            fetchTeam();
        } catch (error: any) {
            alert('Erro ao criar usuário: ' + error.message);
        } finally {
            setCreatingUser(false);
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
                <p className="text-gray-500">Gerencie os dados da sua unidade e acesso da equipe.</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'general' ? 'border-[#3a7ad1] text-[#3a7ad1]' : 'border-transparent text-gray-500'
                        }`}
                >
                    <Building size={18} /> Dados da Unidade
                </button>
                <button
                    onClick={() => setActiveTab('email')}
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'email' ? 'border-[#3a7ad1] text-[#3a7ad1]' : 'border-transparent text-gray-500'
                        }`}
                >
                    <Mail size={18} /> Email / SMTP
                </button>
                <button
                    onClick={() => setActiveTab('team')}
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'team' ? 'border-[#3a7ad1] text-[#3a7ad1]' : 'border-transparent text-gray-500'
                        }`}
                >
                    <Users size={18} /> Equipe e Permissões
                </button>
                <button
                    onClick={() => setActiveTab('appearance')}
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'appearance' ? 'border-[#3a7ad1] text-[#3a7ad1]' : 'border-transparent text-gray-500'
                        }`}
                >
                    <Palette size={18} /> Aparência
                </button>
            </div>

            {activeTab === 'general' ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-3xl">
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Logo Upload */}
                            <div className="flex gap-6 items-start">
                                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-300 overflow-hidden relative group">
                                    {settings.logo_url ? (
                                        <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-gray-400 text-xs text-center px-2">Logo</span>
                                    )}
                                    {uploading === 'logo' && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Logo do Site</label>
                                    <p className="text-xs text-gray-500 mb-2">Recomendado: 250x100px (PNG transparente)</p>
                                    <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                        <Upload className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                                        <span>Carregar Logo</span>
                                        <input
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, 'logo')}
                                            disabled={uploading !== null}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Icon Upload */}
                            <div className="flex gap-6 items-start">
                                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-300 overflow-hidden relative group">
                                    {settings.icon_url ? (
                                        <img src={settings.icon_url} alt="Icone" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-gray-400 text-xs text-center px-2">Ícone</span>
                                    )}
                                    {uploading === 'icon' && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Ícone do Navegador (Favicon)</label>
                                    <p className="text-xs text-gray-500 mb-2">Recomendado: 32x32px ou 64x64px (PNG/ICO)</p>
                                    <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                        <Upload className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                                        <span>Carregar Ícone</span>
                                        <input
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, 'icon')}
                                            disabled={uploading !== null}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nome da Unidade</label>
                                <input
                                    className="w-full border rounded-lg p-2 outline-none"
                                    value={settings.name || ''}
                                    onChange={e => setSettings({ ...settings, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Título do Site (SEO)</label>
                                <input
                                    className="w-full border rounded-lg p-2 outline-none"
                                    placeholder="Ex: E-Lance | A melhor franquia..."
                                    value={settings.site_title || ''}
                                    onChange={e => setSettings({ ...settings, site_title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">CNPJ</label>
                                <input
                                    className="w-full border rounded-lg p-2 outline-none"
                                    value={settings.cnpj || ''}
                                    onChange={e => setSettings({ ...settings, cnpj: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Telefone</label>
                                <input
                                    className="w-full border rounded-lg p-2 outline-none"
                                    value={settings.phone || ''}
                                    onChange={e => setSettings({ ...settings, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">E-mail de Contato</label>
                                <input
                                    className="w-full border rounded-lg p-2 outline-none"
                                    value={settings.email_contact || ''}
                                    onChange={e => setSettings({ ...settings, email_contact: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Featured Image Upload */}
                        <div className="flex gap-6 items-start pt-4 border-t border-gray-100">
                            <div className="w-48 h-28 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-300 overflow-hidden relative group">
                                {settings.featured_image_url ? (
                                    <img src={settings.featured_image_url} alt="Destaque" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-400 text-xs text-center px-2">Imagem Destaque</span>
                                )}
                                {uploading === 'featured' && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Imagem de Destaque (SEO/Social)</label>
                                <p className="text-xs text-gray-500 mb-2">Imagem que aparece ao compartilhar o link. Recomendado: 1200x630px.</p>
                                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                    <Upload className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                                    <span>Carregar Imagem</span>
                                    <input
                                        type="file"
                                        className="sr-only"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, 'featured')}
                                        disabled={uploading !== null}
                                    />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Endereço Completo</label>
                            <textarea
                                className="w-full border rounded-lg p-2 outline-none h-24"
                                value={settings.address || ''}
                                onChange={e => setSettings({ ...settings, address: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <button
                                type="submit"
                                className="bg-[#3a7ad1] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#2a61b0] flex items-center gap-2"
                            >
                                <Save size={18} /> Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            ) : activeTab === 'email' ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-3xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-gray-800">Configuração de SMTP</h3>
                        <button
                            type="button"
                            onClick={async () => {
                                const email = prompt('Digite o email de destino para o teste:');
                                if (!email) return;

                                setTestLog([`➡️ Iniciando teste para: ${email}`]);

                                try {
                                    setTestLog(prev => [...prev, '📦 Preparando configuração...', JSON.stringify({
                                        provider: settings.smtp_config?.provider,
                                        host: settings.smtp_config?.host,
                                        port: settings.smtp_config?.port,
                                        secure: settings.smtp_config?.secure
                                    })]);

                                    await sendEmail({
                                        to: email,
                                        subject: 'Teste de Envio ' + (settings.smtp_config?.provider === 'brevo' ? '(Brevo API)' : '(SMTP)'),
                                        html: '<h1>Funcionou!</h1><p>Seu sistema de email está configurado corretamente.</p>',
                                        smtpConfig: settings.smtp_config as any
                                    });

                                    setTestLog(prev => [...prev, '✅ Sucesso! Email entregue ao provedor.']);
                                    alert('Email enviado com sucesso!');
                                } catch (error: any) {
                                    setTestLog(prev => [...prev, `❌ ERRO FATAL: ${error.message}`]);
                                    alert('Erro ao enviar (veja o log detalhado)');
                                }
                            }}
                            className="text-[#3a7ad1] border border-[#3a7ad1] px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 flex items-center gap-2"
                        >
                            <Send size={16} /> Testar Envio
                        </button>
                    </div>
                    {testLog.length > 0 && (
                        <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700 max-h-60 overflow-y-auto">
                            <p className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Console de Diagnóstico:</p>
                            {testLog.map((log, i) => (
                                <div key={i} className="font-mono text-xs py-1 border-b border-gray-800 last:border-0 break-all whitespace-pre-wrap" style={{
                                    color: log.includes('❌') ? '#ff6b6b' : log.includes('✅') ? '#51cf66' : '#ced4da'
                                }}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        {/* Provider Selection */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Método de Envio</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${(settings.smtp_config?.provider || 'smtp') === 'smtp'
                                    ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500'
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="provider"
                                            value="smtp"
                                            className="w-4 h-4 text-blue-600"
                                            checked={(settings.smtp_config?.provider || 'smtp') === 'smtp'}
                                            onChange={() => setSettings({ ...settings, smtp_config: { ...settings.smtp_config, provider: 'smtp' } as any })}
                                        />
                                        <div>
                                            <p className="font-bold text-gray-800">Servidor SMTP Próprio</p>
                                            <p className="text-xs text-gray-500">Usa seu servidor de e-mail atual (ex: 2TimeWeb)</p>
                                        </div>
                                    </div>
                                </label>

                                <label className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${settings.smtp_config?.provider === 'brevo'
                                    ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500'
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="provider"
                                            value="brevo"
                                            className="w-4 h-4 text-blue-600"
                                            checked={settings.smtp_config?.provider === 'brevo'}
                                            onChange={() => setSettings({ ...settings, smtp_config: { ...settings.smtp_config, provider: 'brevo' } as any })}
                                        />
                                        <div>
                                            <p className="font-bold text-gray-800">API Brevo (Sendinblue)</p>
                                            <p className="text-xs text-gray-500">Alta entregabilidade, ideal para marketing.</p>
                                        </div>
                                    </div>
                                    <div className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">Recomendado</div>
                                </label>

                            </div>
                        </div>

                        {settings.smtp_config?.provider === 'brevo' ? (
                            <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-top-4">
                                <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100">
                                    <p className="font-bold mb-1">Como obter sua chave Brevo:</p>
                                    <ol className="list-decimal ml-4 space-y-1">
                                        <li>Acesse sua conta no <a href="https://app.brevo.com" target="_blank" className="underline">Brevo.com</a></li>
                                        <li>Vá em <b>SMTP & API</b> no menu superior direito.</li>
                                        <li>Gere uma nova chave API v3 e cole abaixo.</li>
                                    </ol>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Chave de API (v3)</label>
                                    <input
                                        type="password"
                                        className="w-full border rounded-lg p-2 outline-none font-mono text-sm"
                                        value={settings.smtp_config?.brevo_key || ''}
                                        onChange={e => setSettings({ ...settings, smtp_config: { ...settings.smtp_config, brevo_key: e.target.value } as any })}
                                        placeholder="xkeysib-..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4">
                                <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg text-sm text-gray-800 border border-gray-200 mb-2">
                                    <p className="font-bold mb-1">Configurações Recomendadas (2TimeWeb):</p>
                                    <ul className="list-disc ml-4 space-y-1">
                                        <li><b>Host:</b> 2timeweb.com.br (ou mail.2timeweb.com.br se o DNS propagar)</li>
                                        <li><b>SSL/TLS:</b> Porta 465 (Seguro: Ativado)</li>
                                        <li><b>SMTP:</b> Porta 587 (Seguro: Desativado/STARTTLS)</li>
                                        <li><b>Usuário:</b> elance@2timeweb.com.br</li>
                                    </ul>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Host SMTP</label>
                                    <input
                                        className="w-full border rounded-lg p-2 outline-none"
                                        value={settings.smtp_config?.host || ''}
                                        onChange={e => setSettings({ ...settings, smtp_config: { ...settings.smtp_config, host: e.target.value } as any })}
                                        placeholder="mail.2timeweb.com.br"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Porta</label>
                                    <input
                                        className="w-full border rounded-lg p-2 outline-none"
                                        value={settings.smtp_config?.port || ''}
                                        onChange={e => setSettings({ ...settings, smtp_config: { ...settings.smtp_config, port: e.target.value } as any })}
                                        placeholder="465 ou 587"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Usuário / E-mail</label>
                                    <input
                                        className="w-full border rounded-lg p-2 outline-none"
                                        value={settings.smtp_config?.user || ''}
                                        onChange={e => setSettings({ ...settings, smtp_config: { ...settings.smtp_config, user: e.target.value } as any })}
                                        placeholder="elance@2timeweb.com.br"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
                                <input
                                    className="w-full border rounded-lg p-2 outline-none"
                                    type="password"
                                    value={settings.smtp_config?.pass || ''}
                                    onChange={e => setSettings({ ...settings, smtp_config: { ...settings.smtp_config, pass: e.target.value } as any })}
                                    placeholder="Use a senha da conta de email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Remetente</label>
                                <input
                                    className="w-full border rounded-lg p-2 outline-none"
                                    value={settings.smtp_config?.sender_name || ''}
                                    onChange={e => setSettings({ ...settings, smtp_config: { ...settings.smtp_config, sender_name: e.target.value } as any })}
                                    placeholder="Ex: E-Lance Portal"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email do Remetente</label>
                                <input
                                    className="w-full border rounded-lg p-2 outline-none"
                                    value={settings.smtp_config?.sender_email || ''}
                                    onChange={e => setSettings({ ...settings, smtp_config: { ...settings.smtp_config, sender_email: e.target.value } as any })}
                                    placeholder="elance@2timeweb.com.br"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="secureSmtp"
                                    className="w-5 h-5 accent-[#3a7ad1]"
                                    checked={settings.smtp_config?.secure || false}
                                    onChange={e => setSettings({ ...settings, smtp_config: { ...settings.smtp_config, secure: e.target.checked } as any })}
                                />
                                <label htmlFor="secureSmtp" className="text-sm font-bold text-gray-700 cursor-pointer">Usar conexão segura (SSL/TLS - Porta 465)</label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <button
                                type="submit"
                                className="bg-[#3a7ad1] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#2a61b0] flex items-center gap-2"
                            >
                                <Save size={18} /> Salvar Configurações
                            </button>
                        </div>
                    </form>
                </div>
            ) : activeTab === 'team' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <div className="p-4 flex justify-between items-center bg-gray-50 border-b border-gray-100">
                            <h3 className="font-bold text-gray-700">Membros da Equipe</h3>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-[#3a7ad1] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#2a61b0] flex items-center gap-2"
                            >
                                <Users size={16} /> Adicionar Membro
                            </button>
                        </div>
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Nome</th>
                                <th className="p-4 font-semibold text-gray-600">Email</th>
                                <th className="p-4 font-semibold text-gray-600">Função</th>
                                <th className="p-4 font-semibold text-gray-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {team.map(member => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-800">{member.full_name}</td>
                                    <td className="p-4 text-gray-500">{member.email}</td>
                                    <td className="p-4">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs uppercase font-bold">
                                            {member.role === 'admin' ? 'Admin / Gestor' : member.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => {
                                                setEditingUser(member);
                                                setIsPermModalOpen(true);
                                            }}
                                            className="text-[#3a7ad1] hover:underline text-sm font-medium flex items-center gap-1"
                                            title="Editar Permissões"
                                        >
                                            <Shield size={16} /> Permissões
                                        </button>
                                        <button
                                            onClick={() => openEditUserModal(member)}
                                            className="text-gray-600 hover:text-[#3a7ad1] ml-3"
                                            title="Editar Dados"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(member.id)}
                                            className="text-red-500 hover:text-red-700 ml-3"
                                            title="Excluir Usuário"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}

            {
                activeTab === 'appearance' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-4xl animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Personalização do Menu</h3>
                                <p className="text-sm text-gray-500">Personalize a aparência do menu lateral. As alterações são salvas automaticamente neste dispositivo.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setMenuMode('default');
                                    updateCustomTheme({
                                        menuSpacing: 'normal',
                                        fontFamily: 'sans',
                                        fontSize: 'base',
                                        iconSize: 20,
                                        menuViewMode: 'list',
                                        gridColumns: 2,
                                        primaryColor: '#3a7ad1',
                                        sidebarColor: '#151d38',
                                        textColor: '#ffffff'
                                    });
                                }}
                                className="text-sm text-red-500 hover:text-red-700 font-medium"
                            >
                                Restaurar Padrões
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Layout & Typography */}
                            <div className="space-y-6">
                                {/* View Mode */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Modo de Visualização</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => updateCustomTheme({ menuViewMode: 'list' })}
                                            className={`p-2 rounded-lg border text-sm flex flex-col items-center gap-2 transition-all ${customTheme.menuViewMode === 'list' ? 'bg-white border-blue-500 ring-1 ring-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <div className="space-y-1 w-full px-2">
                                                <div className="h-1 w-full bg-current opacity-30 rounded"></div>
                                                <div className="h-1 w-full bg-current opacity-30 rounded"></div>
                                                <div className="h-1 w-full bg-current opacity-30 rounded"></div>
                                            </div>
                                            Lista
                                        </button>
                                        <button
                                            onClick={() => updateCustomTheme({ menuViewMode: 'grid', gridColumns: 2 })}
                                            className={`p-2 rounded-lg border text-sm flex flex-col items-center gap-2 transition-all ${customTheme.menuViewMode === 'grid' && customTheme.gridColumns === 2 ? 'bg-white border-blue-500 ring-1 ring-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <div className="grid grid-cols-2 gap-1 w-full px-2">
                                                <div className="aspect-square bg-current opacity-30 rounded"></div>
                                                <div className="aspect-square bg-current opacity-30 rounded"></div>
                                            </div>
                                            Grid (2 Col)
                                        </button>
                                        <button
                                            onClick={() => updateCustomTheme({ menuViewMode: 'grid', gridColumns: 3 })}
                                            className={`p-2 rounded-lg border text-sm flex flex-col items-center gap-2 transition-all ${customTheme.menuViewMode === 'grid' && customTheme.gridColumns === 3 ? 'bg-white border-blue-500 ring-1 ring-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <div className="grid grid-cols-3 gap-1 w-full px-1">
                                                <div className="aspect-square bg-current opacity-30 rounded"></div>
                                                <div className="aspect-square bg-current opacity-30 rounded"></div>
                                                <div className="aspect-square bg-current opacity-30 rounded"></div>
                                            </div>
                                            Grid (3 Col)
                                        </button>
                                    </div>
                                </div>

                                {/* Typography Section */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Fonte</label>
                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                            {[
                                                { id: 'sans', label: 'Sans (Padrão)', font: 'sans-serif' },
                                                { id: 'serif', label: 'Serif', font: 'serif' },
                                                { id: 'mono', label: 'Mono', font: 'monospace' }
                                            ].map((font) => (
                                                <button
                                                    key={font.id}
                                                    onClick={() => updateCustomTheme({ fontFamily: font.id as any })}
                                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${customTheme.fontFamily === font.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                    style={{ fontFamily: font.font }}
                                                >
                                                    {font.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Tamanho da Fonte</label>
                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                            {[
                                                { id: 'sm', label: 'Pequena' },
                                                { id: 'base', label: 'Média' },
                                                { id: 'lg', label: 'Grande' }
                                            ].map((size) => (
                                                <button
                                                    key={size.id}
                                                    onClick={() => updateCustomTheme({ fontSize: size.id as any })}
                                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${customTheme.fontSize === size.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    {size.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Colors & Spacing */}
                            <div className="space-y-6">
                                {/* Colors */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Cores do Tema</label>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Cor Principal (Ativo)</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={customTheme.primaryColor}
                                                    onChange={(e) => updateCustomTheme({ primaryColor: e.target.value })}
                                                    className="w-8 h-8 rounded cursor-pointer border-0"
                                                />
                                                <span className="text-xs font-mono text-gray-400">{customTheme.primaryColor}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Fundo do Menu</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={customTheme.sidebarColor}
                                                    onChange={(e) => updateCustomTheme({ sidebarColor: e.target.value })}
                                                    className="w-8 h-8 rounded cursor-pointer border-0"
                                                />
                                                <span className="text-xs font-mono text-gray-400">{customTheme.sidebarColor}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Texto</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={customTheme.textColor}
                                                    onChange={(e) => updateCustomTheme({ textColor: e.target.value })}
                                                    className="w-8 h-8 rounded cursor-pointer border-0"
                                                />
                                                <span className="text-xs font-mono text-gray-400">{customTheme.textColor}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Spacing & Icons */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Espaçamento (Padding)</label>
                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                            {[
                                                { id: 'compact', label: 'Compacto' },
                                                { id: 'normal', label: 'Normal' },
                                                { id: 'relaxed', label: 'Relaxado' }
                                            ].map((space) => (
                                                <button
                                                    key={space.id}
                                                    onClick={() => updateCustomTheme({ menuSpacing: space.id as any })}
                                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${customTheme.menuSpacing === space.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    {space.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="block text-sm font-bold text-gray-700">Tamanho do Ícone</label>
                                            <span className="text-xs text-gray-500">{customTheme.iconSize}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="16"
                                            max="48"
                                            step="2"
                                            value={customTheme.iconSize}
                                            onChange={(e) => updateCustomTheme({ iconSize: parseInt(e.target.value) })}
                                            className="w-full accent-[#3a7ad1]"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                            <span>16px</span>
                                            <span>32px</span>
                                            <span>48px</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Efeitos & Estilo</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={customTheme.glassEffect}
                                                    onChange={(e) => updateCustomTheme({ glassEffect: e.target.checked })}
                                                    className="w-4 h-4 accent-[#3a7ad1] rounded"
                                                />
                                                <span className="text-sm text-gray-700">Efeito de Vidro (Glassmorphism)</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={customTheme.colorfulIcons}
                                                    onChange={(e) => updateCustomTheme({ colorfulIcons: e.target.checked })}
                                                    className="w-4 h-4 accent-[#3a7ad1] rounded"
                                                />
                                                <span className="text-sm text-gray-700">Ícones Coloridos</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mode Toggle Checkbox (Legacy support for MacBook mode) */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="menuMode"
                                        checked={menuMode === 'default'}
                                        onChange={() => setMenuMode('default')}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Edição Personalizada (Ativa)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer opacity-70 hover:opacity-100">
                                    <input
                                        type="radio"
                                        name="menuMode"
                                        checked={menuMode === 'macbook'}
                                        onChange={() => setMenuMode('macbook')}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Modo MacBook (Glassmorphism Padrão)</span>
                                </label>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 ml-6">O Modo MacBook ignora as personalizações manuais acima para manter o padrão visual.</p>
                        </div>
                    </div>
                )
            }

            {/* Permissions Modal */}
            <Modal
                isOpen={isPermModalOpen}
                onClose={() => setIsPermModalOpen(false)}
                title={`Permissões: ${editingUser?.full_name}`}
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 mb-4">Selecione o que este usuário pode acessar no painel.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {permissionKeys.map(({ key, label }) => {
                            // Logic: Checked unless explicitly FALSE
                            // If undefined (new user or legacy), it is Checked (Allowed)
                            const isAllowed = editingUser?.permissions?.[key] !== false;

                            return (
                                <label key={key} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${isAllowed ? 'bg-[#3a7ad1] border-[#3a7ad1]' : 'border-gray-300 bg-white'}`}>
                                        {isAllowed && <Check size={14} className="text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={isAllowed}
                                        onChange={() => togglePermission(key)}
                                    />
                                    <span className="text-gray-700 font-medium">{label}</span>
                                </label>
                            );
                        })}
                    </div>

                    <div className="flex justify-end gap-2 pt-6 border-t mt-4">
                        <button
                            onClick={() => setIsPermModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSavePermissions}
                            className="px-4 py-2 bg-[#3a7ad1] text-white rounded-lg hover:bg-[#2a61b0] font-bold"
                        >
                            Salvar Permissões
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Create User Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Novo Membro da Equipe"
            >
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                        <input
                            required
                            className="w-full border rounded-lg p-2 outline-none"
                            placeholder="Ex: João Silva"
                            value={newUser.full_name}
                            onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email de Acesso</label>
                        <input
                            required
                            type="email"
                            className="w-full border rounded-lg p-2 outline-none"
                            placeholder="email@empresa.com"
                            value={newUser.email}
                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Senha Provisória</label>
                        <input
                            required
                            type="password"
                            className="w-full border rounded-lg p-2 outline-none"
                            placeholder="******"
                            value={newUser.password}
                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Função</label>
                        <select
                            className="w-full border rounded-lg p-2 outline-none bg-white"
                            value={newUser.role}
                            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <option value="manager">Gerente (Acesso Padrão)</option>
                            <option value="admin">Administrador (Acesso Total)</option>
                        </select>
                    </div>

                    <div className="pt-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Permissões de Acesso</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {permissionKeys.map(({ key, label }) => {
                                // Logic: Everyone is Manager/Default allowed.
                                // If permission is explicitly FALSE, then it's unchecked. Otherwise Checked.
                                const isAllowed = newUser.permissions[key] !== false;
                                return (
                                    <label key={key} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${isAllowed ? 'bg-[#3a7ad1] border-[#3a7ad1]' : 'border-gray-300 bg-white'}`}>
                                            {isAllowed && <Check size={14} className="text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isAllowed}
                                            onChange={() => toggleNewUserPermission(key)}
                                        />
                                        <span className="text-gray-700 font-medium">{label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-6 border-t mt-4">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={creatingUser}
                            className="px-4 py-2 bg-[#3a7ad1] text-white rounded-lg hover:bg-[#2a61b0] font-bold disabled:opacity-50"
                        >
                            {creatingUser ? 'Criando...' : 'Criar Usuário'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit User Data Modal */}
            <Modal
                isOpen={isEditUserModalOpen}
                onClose={() => setIsEditUserModalOpen(false)}
                title="Editar Usuário"
            >
                <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                        <input
                            required
                            className="w-full border rounded-lg p-2 outline-none"
                            value={userDataToEdit.full_name}
                            onChange={e => setUserDataToEdit({ ...userDataToEdit, full_name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input
                            required
                            type="email"
                            className="w-full border rounded-lg p-2 outline-none"
                            value={userDataToEdit.email}
                            onChange={e => setUserDataToEdit({ ...userDataToEdit, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nova Senha (Opcional)</label>
                        <input
                            type="password"
                            className="w-full border rounded-lg p-2 outline-none"
                            placeholder="Deixe em branco para manter a atual"
                            value={userDataToEdit.password}
                            onChange={e => setUserDataToEdit({ ...userDataToEdit, password: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Função</label>
                        <select
                            className="w-full border rounded-lg p-2 outline-none bg-white"
                            value={userDataToEdit.role}
                            onChange={e => setUserDataToEdit({ ...userDataToEdit, role: e.target.value })}
                        >
                            <option value="manager">Gerente (Acesso Padrão)</option>
                            <option value="admin">Administrador (Acesso Total)</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-6 border-t mt-4">
                        <button
                            type="button"
                            onClick={() => setIsEditUserModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#3a7ad1] text-white rounded-lg hover:bg-[#2a61b0] font-bold"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </Modal>
        </div >
    );
};

export default Settings;
