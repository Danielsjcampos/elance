import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Task, Profile, TaskTemplate, TaskTemplateStep, TaskStep } from '../../../types';
import { 
    Plus, 
    Calendar, 
    User, 
    CheckCircle,
    Clock,
    Trash2,
    Layers,
    List,
    Settings,
    ChevronDown,
    ChevronRight,
    X,
    Save
} from 'lucide-react';

const TasksPage = () => {
    const [activeTab, setActiveTab] = useState<'kanban' | 'templates'>('kanban');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [templates, setTemplates] = useState<TaskTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    
    // Modals
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

    useEffect(() => {
        fetchProfiles();
        fetchTasks();
        fetchTemplates();
    }, []);

    const fetchProfiles = async () => {
        const { data } = await supabase.from('profiles').select('*');
        setProfiles(data || []);
    };

    const fetchTasks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('tasks')
            .select('*, assignee:profiles!assignee_id(full_name), steps:task_steps(*)')
            .order('created_at', { ascending: false });

        if (!error) setTasks(data || []);
        setLoading(false);
    };

    const fetchTemplates = async () => {
        const { data } = await supabase
            .from('task_templates')
            .select('*') // We will fetch steps when editing a template
            .order('created_at', { ascending: false });
        setTemplates(data || []);
    };

    const handleDeleteTask = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            await supabase.from('tasks').delete().eq('id', id);
            fetchTasks();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Centro de Tarefas</h1>
                    <p className="text-gray-400">Gerencie tarefas, automações e processos da franquia.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('kanban')}
                        className={`px-4 py-2 rounded-xl border border-white/10 font-medium transition-colors ${activeTab === 'kanban' ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#151d38] text-gray-400 hover:text-white'}`}
                    >
                        Tarefas
                    </button>
                    <button 
                        onClick={() => setActiveTab('templates')}
                        className={`px-4 py-2 rounded-xl border border-white/10 font-medium transition-colors ${activeTab === 'templates' ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#151d38] text-gray-400 hover:text-white'}`}
                    >
                        Modelos e Automação
                    </button>
                    
                    {activeTab === 'kanban' ? (
                        <button 
                            onClick={() => { setSelectedTask(null); setShowTaskModal(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-xl text-white font-bold hover:bg-green-500 shadow-lg ml-2"
                        >
                            <Plus size={20} />
                            Nova Tarefa
                        </button>
                    ) : (
                         <button 
                            onClick={() => { setSelectedTemplate(null); setShowTemplateModal(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-xl text-white font-bold hover:bg-green-500 shadow-lg ml-2"
                        >
                            <Plus size={20} />
                            Novo Modelo
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'kanban' ? (
                <KanbanBoard 
                    tasks={tasks} 
                    loading={loading} 
                    profiles={profiles}
                    onDelete={handleDeleteTask}
                    onOpenTask={(task) => { setSelectedTask(task); setShowTaskModal(true); }}
                />
            ) : (
                <TemplatesList 
                    templates={templates} 
                    onOpenTemplate={(tpl) => { setSelectedTemplate(tpl); setShowTemplateModal(true); }}
                    refreshTemplates={fetchTemplates}
                />
            )}

            {/* TASK MODAL (Create/Edit/View) */}
            {showTaskModal && (
                <TaskModal 
                    task={selectedTask}
                    profiles={profiles}
                    onClose={() => setShowTaskModal(false)}
                    onSuccess={() => { setShowTaskModal(false); fetchTasks(); }}
                    templates={templates}
                />
            )}

            {/* TEMPLATE MODAL */}
            {showTemplateModal && (
                <TemplateModal 
                    template={selectedTemplate}
                    onClose={() => setShowTemplateModal(false)}
                    onSuccess={() => { setShowTemplateModal(false); fetchTemplates(); }}
                />
            )}
        </div>
    );
};

// --- SUB COMPONENTS ---

const KanbanBoard = ({ tasks, loading, profiles, onDelete, onOpenTask }: any) => {
    if (loading) return <div className="text-white">Carregando tarefas...</div>;

    const columns = [
        { id: 'pending', label: 'A Fazer', icon: <Clock className="text-orange-400" /> },
        { id: 'in_progress', label: 'Em Andamento', icon: <User className="text-blue-400" /> },
        { id: 'completed', label: 'Concluído', icon: <CheckCircle className="text-green-400" /> },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] overflow-hidden">
            {columns.map(col => (
                <div key={col.id} className="bg-[#1e293b] rounded-2xl p-4 border border-white/5 h-full flex flex-col">
                    <h3 className="font-bold text-gray-300 mb-4 flex items-center gap-2">
                        {col.icon}
                        {col.label}
                        <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs text-gray-400">
                            {tasks.filter((t: Task) => t.status === col.id).length}
                        </span>
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {tasks.filter((t: Task) => t.status === col.id).map((task: Task) => (
                           <TaskCard task={task} onDelete={onDelete} onClick={() => onOpenTask(task)} key={task.id} /> 
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const TaskCard = ({ task, onDelete, onClick }: { task: Task, onDelete: (id: string) => void, onClick: () => void }) => {
    // Calculate progress
    const totalSteps = task.steps?.length || 0;
    const completedSteps = task.steps?.filter(s => s.completed).length || 0;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    return (
        <div 
            onClick={onClick}
            className="bg-[#0f172a] p-4 rounded-xl border border-white/5 hover:border-blue-500/30 group relative cursor-pointer hover:bg-[#152035] transition-all"
        >
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className="absolute top-2 right-2 p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all z-10"
            >
                <Trash2 size={14} />
            </button>
            <div className="flex justify-between items-start mb-2 pr-6">
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                    task.priority === 'urgent' ? 'bg-red-500/20 text-red-500' :
                    task.priority === 'high' ? 'bg-orange-500/20 text-orange-500' :
                    'bg-blue-500/20 text-blue-500'
                }`}>
                    {task.priority}
                </span>
                
                {task.due_date && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(task.due_date).toLocaleDateString('pt-BR')}
                    </span>
                )}
            </div>
            
            <h4 className="font-medium text-white mb-1">{task.title}</h4>
            <p className="text-xs text-gray-400 line-clamp-2 mb-3">{task.description}</p>
            
            {/* Steps Progress Bar */}
            {totalSteps > 0 && (
                <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                        <span>Progresso</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400 font-bold">
                        {(task.assignee as any)?.full_name?.charAt(0) || '?'}
                    </div>
                    <span className="text-xs text-gray-500 truncate max-w-[100px]">{(task.assignee as any)?.full_name || 'Sem dono'}</span>
                </div>
            </div>
        </div>
    );
};

const TemplatesList = ({ templates, onOpenTemplate, refreshTemplates }: any) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl: TaskTemplate) => (
                <div key={tpl.id} className="bg-[#1e293b] p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                            <Layers size={24} />
                        </div>
                        {tpl.trigger_event !== 'none' && (
                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full border border-purple-500/20">
                                Auto: {tpl.trigger_event}
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{tpl.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 h-10 line-clamp-2">{tpl.description || 'Sem descrição'}</p>
                    
                    <button 
                        onClick={() => onOpenTemplate(tpl)}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm font-medium transition-colors border border-white/10"
                    >
                        Editar Etapas e Gatilhos
                    </button>
                </div>
            ))}
        </div>
    );
};

// --- MODALS ---

const TaskModal = ({ task, profiles, onClose, onSuccess, templates }: any) => {
    const [formData, setFormData] = useState<Partial<Task>>({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        assignee_id: '',
        due_date: new Date().toISOString().slice(0, 10),
        ...task
    });
    const [steps, setSteps] = useState<TaskStep[]>(task?.steps || []);
    const [newStepTitle, setNewStepTitle] = useState('');

    // If new task, allow selecting template
    const handleTemplateSelect = async (templateId: string) => {
        if (!templateId) return;
        const tpl = templates.find((t: any) => t.id === templateId);
        if (tpl) {
            setFormData(prev => ({ ...prev, title: tpl.title, description: tpl.description || prev.description }));
            // Fetch steps for this template
            const { data: tsteps } = await supabase.from('task_template_steps').select('*').eq('template_id', templateId).order('order_index');
            if (tsteps) {
                setSteps(tsteps.map(ts => ({ 
                    id: Math.random().toString(), // temp id
                    task_id: '', 
                    title: ts.title, 
                    completed: false, 
                    order_index: ts.order_index 
                })));
            }
        }
    };

    const handleSave = async () => {
        let taskId = task?.id;

        if (!taskId) {
            const { data, error } = await supabase.from('tasks').insert([{
                 ...formData,
                 created_at: undefined, updated_at: undefined // let db handle
            }]).select().single();
            if (error) { alert('Erro ao salvar'); return; }
            taskId = data.id;
        } else {
            // Update
             await supabase.from('tasks').update({
                 title: formData.title,
                 description: formData.description,
                 status: formData.status,
                 priority: formData.priority,
                 assignee_id: formData.assignee_id,
                 due_date: formData.due_date
            }).eq('id', taskId);
        }

        // Save Steps
        // Delete existing steps if updating? Or merge? simple strategy: delete all and re-create for editing consistency or just update status
        // For checklist interaction in detailed view, we update status. For here, maybe only add?
        // Let's assume we can add new steps here.
        if (steps.length > 0) {
            const stepsToInsert = steps.filter(s => !task?.steps?.find((os: any) => os.id === s.id)).map(s => ({
                task_id: taskId,
                title: s.title,
                completed: s.completed,
                order_index: s.order_index
            }));
            
            if (stepsToInsert.length > 0) {
                 await supabase.from('task_steps').insert(stepsToInsert);
            }

            // Update existing steps status
            for (const s of steps) {
                if (task?.steps?.find((os: any) => os.id === s.id)) {
                    await supabase.from('task_steps').update({ completed: s.completed }).eq('id', s.id);
                }
            }
        }

        onSuccess();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1e293b] rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">{task ? 'Detalhes da Tarefa' : 'Nova Tarefa'}</h3>
                    {task && (
                        <div className="flex gap-2">
                             <select 
                                className="bg-[#0f172a] border border-white/10 text-white rounded-lg text-sm px-2"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value as any})}
                             >
                                <option value="pending">A Fazer</option>
                                <option value="in_progress">Em Andamento</option>
                                <option value="completed">Concluída</option>
                             </select>
                        </div>
                    )}
                </div>
                
                <div className="p-6 space-y-6">
                    {!task && (
                        <div>
                             <label className="block text-sm text-gray-400 mb-1">Usar Modelo (opcional)</label>
                             <select className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white" onChange={e => handleTemplateSelect(e.target.value)}>
                                 <option value="">Selecione...</option>
                                 {templates.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
                             </select>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="md:col-span-2">
                            <label className="block text-sm text-gray-400 mb-1">Título</label>
                            <input 
                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                            <textarea 
                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                                rows={3}
                                value={formData.description || ''}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Responsável</label>
                            <select 
                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                                value={formData.assignee_id || ''}
                                onChange={e => setFormData({...formData, assignee_id: e.target.value})}
                            >
                                <option value="">Sem responsável</option>
                                {profiles.map((p: any) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm text-gray-400 mb-1">Prazo</label>
                             <input type="date" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                                value={formData.due_date ? formData.due_date.slice(0, 10) : ''}
                                onChange={e => setFormData({...formData, due_date: e.target.value})}
                             />
                        </div>
                    </div>

                    {/* STEPS */}
                    <div className="bg-[#0f172a] p-4 rounded-xl border border-white/5">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                            <List size={16} className="text-blue-400"/> Checklist de Etapas
                        </h4>
                        <div className="space-y-2 mb-3">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2 bg-[#1e293b] rounded-lg">
                                    <input 
                                        type="checkbox" 
                                        checked={step.completed} 
                                        onChange={() => {
                                            const newSteps = [...steps];
                                            newSteps[idx].completed = !newSteps[idx].completed;
                                            setSteps(newSteps);
                                        }}
                                        className="w-5 h-5 rounded border-white/20 bg-transparent text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className={`text-sm ${step.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                        {step.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 bg-[#1e293b] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                                placeholder="Nova etapa..."
                                value={newStepTitle}
                                onChange={e => setNewStepTitle(e.target.value)}
                                onKeyDown={e => {
                                    if(e.key === 'Enter' && newStepTitle) {
                                        setSteps([...steps, { id: Math.random().toString(), task_id: '', title: newStepTitle, completed: false, order_index: steps.length }]);
                                        setNewStepTitle('');
                                    }
                                }}
                            />
                            <button 
                                onClick={() => {
                                    if(newStepTitle) {
                                        setSteps([...steps, { id: Math.random().toString(), task_id: '', title: newStepTitle, completed: false, order_index: steps.length }]);
                                        setNewStepTitle('');
                                    }
                                }}
                                className="px-3 py-1.5 bg-blue-600 rounded-lg text-white text-sm font-bold"
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-[#151d38]/50">
                    <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 rounded-xl text-white font-bold flex items-center gap-2">
                        <Save size={18} /> Salvar Tarefa
                    </button>
                </div>
            </div>
        </div>
    );
};

const TemplateModal = ({ template, onClose, onSuccess }: any) => {
    const [formData, setFormData] = useState<Partial<TaskTemplate>>({
        title: '',
        description: '',
        trigger_event: 'none',
        ...template
    });
    const [steps, setSteps] = useState<TaskTemplateStep[]>([]);
    const [loading, setLoading] = useState(false);
    const [newStep, setNewStep] = useState('');

    useEffect(() => {
        if (template?.id) {
            fetchSteps();
        }
    }, [template]);

    const fetchSteps = async () => {
        const { data } = await supabase.from('task_template_steps').select('*').eq('template_id', template.id).order('order_index');
        if (data) setSteps(data);
    };

    const handleSave = async () => {
        setLoading(true);
        let tplId = template?.id;
        
        // Save Template
        if (!tplId) {
            const { data, error } = await supabase.from('task_templates').insert([formData]).select().single();
            if (error) { alert('Erro ao criar modelo'); setLoading(false); return; }
            tplId = data.id;
        } else {
            await supabase.from('task_templates').update(formData).eq('id', tplId);
        }

        // Save Steps (Simplified: Delete all and re-insert for ordering)
        if (tplId) {
           // We are not deleting to preserve IDs if needed, but for MVP re-inserting is safer for order updates
           // ACTUALLY, let's just insert new ones or update. 
           // For now, simpler: user adds steps one by one.
        }
        
        setLoading(false);
        onSuccess();
    };

    const handleAddStep = async () => {
        if (!newStep || !template?.id) return; // Must save template first?
        // If creating new template, we can't add steps immediately in this simple UI unless we save first.
        // Let's force save first if new.
        if (!template?.id) {
            alert('Salve o modelo básico primeiro antes de adicionar etapas.');
            return;
        }

        const { error } = await supabase.from('task_template_steps').insert({
            template_id: template.id,
            title: newStep,
            order_index: steps.length
        });
        
        if (!error) {
            setNewStep('');
            fetchSteps();
        }
    };

    const handleDeleteStep = async (id: string) => {
        await supabase.from('task_template_steps').delete().eq('id', id);
        fetchSteps();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
             <div className="bg-[#1e293b] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl">
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-xl font-bold text-white">{template ? 'Editar Modelo' : 'Novo Modelo'}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Nome do Modelo</label>
                        <input className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Gatilho de Automação</label>
                        <select className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white"
                             value={formData.trigger_event} onChange={e => setFormData({...formData, trigger_event: e.target.value as any})}
                        >
                            <option value="none">Manual (Sem gatilho)</option>
                            <option value="auction_created">Ao Cadastrar Imóvel (Leilão)</option>
                            <option value="lead_created">Ao Cadastrar Lead</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Se selecionado, uma tarefa será criada automaticamente quando o evento ocorrer.
                        </p>
                    </div>

                    {template?.id && (
                        <div className="border-t border-white/10 pt-4 mt-4">
                            <label className="block text-sm text-gray-400 mb-2">Etapas do Processo</label>
                            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto custom-scrollbar">
                                {steps.map((s, i) => (
                                    <div key={s.id} className="flex justify-between items-center bg-[#0f172a] p-2 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 text-xs font-mono">{i+1}.</span>
                                            <span className="text-gray-200 text-sm">{s.title}</span>
                                        </div>
                                        <button onClick={() => handleDeleteStep(s.id)} className="text-red-400 hover:text-red-300"><X size={14} /></button>
                                    </div>
                                ))}
                                {steps.length === 0 && <p className="text-gray-500 text-xs italic">Nenhuma etapa cadastrada.</p>}
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    className="flex-1 bg-[#0f172a] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                                    placeholder="Nome da etapa..."
                                    value={newStep}
                                    onChange={e => setNewStep(e.target.value)}
                                />
                                <button onClick={handleAddStep} className="px-3 py-1.5 bg-blue-600 rounded-lg text-white text-xs font-bold">Adicionar</button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 rounded-xl text-white font-bold">
                        {template?.id ? 'Salvar Alterações' : 'Criar Modelo'}
                    </button>
                </div>
             </div>
        </div>
    );
};

export default TasksPage;
