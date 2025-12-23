import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, Circle, Plus, Calendar, X, Building2, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Tasks: React.FC = () => {
    const { user, profile } = useAuth();
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Task Form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [assigneeType, setAssigneeType] = useState<'single' | 'multiple' | 'franchise'>('single');

    // Selection Data
    const [users, setUsers] = useState<any[]>([]);
    const [franchises, setFranchises] = useState<any[]>([]);

    // Selected IDs
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]); // For single or multiple
    const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchTasks();
        fetchOptions();
    }, [user]);

    const fetchOptions = async () => {
        // Fetch Users (Collaborators/Managers)
        const { data: userData } = await supabase.from('profiles').select('id, full_name, email, role, franchise_unit_id');
        if (userData) setUsers(userData);

        // Fetch Franchises
        const { data: franchiseData } = await supabase.from('franchise_units').select('id, name');
        if (franchiseData) setFranchises(franchiseData);
    };

    const fetchTasks = async () => {
        if (!user) return;
        try {
            // FIX: "profiles" is ambiguous because we have assigned_to AND created_by.
            // We must specify the column used for the join: profiles!assigned_to
            const { data, error } = await supabase
                .from('tasks')
                .select('*, assignee:profiles!assigned_to(full_name), franchise:franchise_units(name)')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase Error fetching tasks:', error);
                throw error;
            }
            console.log('Fetched tasks:', data);
            setTasks(data || []);
        } catch (error: any) {
            console.error('Error in fetchTasks:', error);
            alert('Erro ao carregar tarefas: ' + error.message); // Visible Alert
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = async (task: any) => {
        try {
            const newStatus = task.status === 'done' ? 'todo' : 'done';
            const { error } = await supabase
                .from('tasks')
                .update({ status: newStatus })
                .eq('id', task.id);

            if (error) throw error;

            // Optional: Notify created_by if someone else completed it? 
            // Skipping to keep simple as requested: "receive notification as a bell" (recipients)

            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleCreateTask = async () => {
        if (!title) return alert("Título é obrigatório");
        if (assigneeType === 'franchise' && !selectedFranchiseId) return alert("Selecione uma franquia");
        if ((assigneeType === 'single' || assigneeType === 'multiple') && selectedUserIds.length === 0) return alert("Selecione pelo menos um usuário");

        setCreating(true);
        try {
            const newTasksPayload = [];
            let notificationRecipients: string[] = [];

            if (assigneeType === 'franchise') {
                // 1. Create ONE task for the Franchise (General)
                // assigned_to is NULL (shared by franchise) or logic to assign to all?
                // Request: "quero ter a opcao para colaboradores individuais, ou mais de 1, ou uma fraqnquia."
                // Usually "Franchise Task" means anyone in franchise can do it.

                const taskData = {
                    title,
                    description,
                    due_date: dueDate || null,
                    franchise_id: selectedFranchiseId,
                    created_by: user?.id,
                    status: 'todo',
                    assigned_to: null // Meaning "Open to Franchise"
                };

                const { data: task, error } = await supabase.from('tasks').insert(taskData).select().single();
                if (error) throw error;

                // Find all users in this franchise to notify
                const { data: franchiseUsers } = await supabase.from('profiles').select('id').eq('franchise_unit_id', selectedFranchiseId);
                if (franchiseUsers) notificationRecipients = franchiseUsers.map(u => u.id);

                // Notify all
                if (notificationRecipients.length > 0) {
                    const notifications = notificationRecipients.map(uid => ({
                        user_id: uid,
                        title: `Nova Tarefa de Franquia: ${title}`,
                        message: `Uma nova tarefa foi atribuída à sua franquia.`,
                        link: '/admin/tarefas',
                        task_id: task.id
                    }));
                    await supabase.from('notifications').insert(notifications);
                }

            } else {
                // Single or Multiple Users
                // Create a SEPARATE task for EACH user so we can track individual completion?
                // Or one task assigned to multiple? DB `assigned_to` is single UUID FK.
                // So must be Separate Tasks.

                for (const assigneeId of selectedUserIds) {
                    // Need assignee's franchise_id for the row (it's NOT NULL in schema)
                    // If assignee doesn't have franchise (e.g. admin), what then?
                    // We'll fetch user's franchise first.
                    const assigneeUser = users.find(u => u.id === assigneeId);
                    const userFranchiseId = assigneeUser?.franchise_unit_id; // Might be null for Super Admin?

                    // If user has no franchise, we might need a fallback or allow null in DB logic? 
                    // DB schema: franchise_id UUID NOT NULL.
                    // Fallback: If assigning to another Admin (no franchise), we might act as current user's franchise or a default 'Headquarters'.
                    // For now, let's assume valid users created have a franchise or we use the creator's franchise if null?
                    // Safety: If userFranchiseId is missing, use current profile franchise or a placeholder if authorized.

                    // Quick fix: If assignee has no franchise, use the creator's franchise (if admin) or failing that, we cant create.
                    // IMPORTANT: Schema requires franchise_id.

                    const finalFranchiseId = userFranchiseId || profile?.franchise_unit_id;

                    const taskData = {
                        title,
                        description,
                        due_date: dueDate || null,
                        franchise_id: finalFranchiseId, // Required
                        created_by: user?.id,
                        status: 'todo',
                        assigned_to: assigneeId
                    };

                    const { data: task, error } = await supabase.from('tasks').insert(taskData).select().single();
                    if (error) throw error;

                    // Notify this user
                    await supabase.from('notifications').insert({
                        user_id: assigneeId,
                        title: `Nova Tarefa Atribuída: ${title}`,
                        message: `Você recebeu uma nova tarefa.`,
                        link: '/admin/tarefas',
                        task_id: task.id
                    });
                }
            }

            alert("Tarefas enviadas com sucesso!");
            setShowModal(false);
            setTitle('');
            setDescription('');
            setDueDate('');
            setSelectedUserIds([]);
            setSelectedFranchiseId('');
            fetchTasks();

        } catch (error: any) {
            alert('Erro ao criar tarefa: ' + error.message);
        } finally {
            setCreating(false);
        }
    };

    const toggleUserSelection = (uid: string) => {
        if (assigneeType === 'single') {
            setSelectedUserIds([uid]);
        } else {
            if (selectedUserIds.includes(uid)) {
                setSelectedUserIds(prev => prev.filter(id => id !== uid));
            } else {
                setSelectedUserIds(prev => [...prev, uid]);
            }
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestão de Tarefas</h2>
                    <p className="text-sm text-gray-500">Crie e gerencie tarefas para sua equipe e franquias.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#3a7ad1] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2a61b0] transition-colors"
                >
                    <Plus size={20} />
                    Nova Tarefa
                </button>
            </div>

            {/* Task List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {loading ? (
                    <p className="text-gray-500">Carregando tarefas...</p>
                ) : tasks.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhuma tarefa encontrada.</p>
                ) : (
                    <div className="space-y-4">
                        {tasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-4 p-4 rounded-lg border border-gray-50 hover:bg-gray-50 transition-colors">
                                <button
                                    onClick={() => toggleTask(task)}
                                    className={`text-gray-400 hover:text-[#3a7ad1] transition-colors ${task.status === 'done' ? 'text-green-500' : ''}`}
                                >
                                    {task.status === 'done' ? <CheckCircle size={24} /> : <Circle size={24} />}
                                </button>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`font-medium text-gray-800 ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
                                            {task.title}
                                        </h3>
                                        <div className="text-xs text-gray-400 flex flex-col items-end gap-1">
                                            {task.assignee ? (
                                                <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                                    <User size={10} /> {task.assignee.full_name}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                                                    <Building2 size={10} /> {task.franchise?.name || 'Franquia'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                                </div>
                                {task.due_date && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
                                        <Calendar size={16} />
                                        {new Date(task.due_date).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CREATE MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">Nova Tarefa</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basics */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                    <input
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Enviar relatório mensal"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                    <textarea
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none h-24"
                                        value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes da tarefa..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrega</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={dueDate} onChange={e => setDueDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Assignment Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Atribuir para:</label>
                                <div className="flex gap-4 mb-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio" name="assigneeType"
                                            checked={assigneeType === 'single'} onChange={() => { setAssigneeType('single'); setSelectedUserIds([]); }}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">Um Colaborador</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio" name="assigneeType"
                                            checked={assigneeType === 'multiple'} onChange={() => { setAssigneeType('multiple'); setSelectedUserIds([]); }}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">Vários Colaboradores</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio" name="assigneeType"
                                            checked={assigneeType === 'franchise'} onChange={() => { setAssigneeType('franchise'); setSelectedUserIds([]); }}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">Franquia Inteira</span>
                                    </label>
                                </div>

                                {/* Selectors */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                                    {assigneeType === 'franchise' ? (
                                        <div className="space-y-2">
                                            {franchises.map(f => (
                                                <label key={f.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={selectedFranchiseId === f.id}
                                                        onChange={() => setSelectedFranchiseId(f.id)}
                                                        className="text-blue-600"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <Building2 size={16} className="text-gray-400" />
                                                        <span className="text-gray-800">{f.name}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {users.map(u => (
                                                <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer">
                                                    <input
                                                        type={assigneeType === 'single' ? 'radio' : 'checkbox'}
                                                        checked={selectedUserIds.includes(u.id)}
                                                        onChange={() => toggleUserSelection(u.id)}
                                                        className="text-blue-600"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-800">{u.full_name || u.email}</span>
                                                        <span className="text-xs text-gray-500">{u.role}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg">Cancelar</button>
                            <button
                                onClick={handleCreateTask}
                                disabled={creating}
                                className="bg-[#3a7ad1] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#2a61b0] flex items-center gap-2 disabled:opacity-50"
                            >
                                {creating ? 'Enviando...' : 'Criar Tarefa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
