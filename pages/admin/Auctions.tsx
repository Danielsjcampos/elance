import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Calendar, DollarSign, Edit, Trash2, ArrowRight, Settings } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Auction {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'published' | 'active' | 'finished' | 'cancelled';
    pipeline_stage: 'triagem' | 'preparacao' | 'ativo' | 'pos_arrematacao' | 'finalizado';
    minimum_bid: number;
    appraisal_value: number;
    first_date: string;
    second_date: string;
    created_at: string;
}

const STAGES = {
    'triagem': 'Triagem / Análise',
    'preparacao': 'Preparação / Edital',
    'ativo': 'Leilão Ativo',
    'pos_arrematacao': 'Pós-Arrematação',
    'finalizado': 'Finalizado'
};

const Auctions: React.FC = () => {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [tasks, setTasks] = useState<any[]>([]); // Store tasks
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAuction, setCurrentAuction] = useState<Partial<Auction>>({});
    const [isEditing, setIsEditing] = useState(false);

    // Task Input State
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // Financial Modal State
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [saleData, setSaleData] = useState({ auctionId: '', price: 0, commissionRate: 5 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Auctions
            const { data: auctionsData, error: auctionsError } = await supabase
                .from('auctions')
                .select('*')
                .order('created_at', { ascending: false });

            if (auctionsError) throw auctionsError;
            setAuctions(auctionsData || []);

            // Fetch Tasks for these auctions
            const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .not('auction_id', 'is', null);

            if (tasksError) throw tasksError;
            setTasks(tasksData || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const auctionData = {
                title: currentAuction.title,
                description: currentAuction.description,
                status: currentAuction.status,
                pipeline_stage: currentAuction.pipeline_stage || 'triagem',
                minimum_bid: currentAuction.minimum_bid,
                appraisal_value: currentAuction.appraisal_value,
                first_date: currentAuction.first_date,
                second_date: currentAuction.second_date
            };

            if (isEditing && currentAuction.id) {
                const { error } = await supabase
                    .from('auctions')
                    .update(auctionData)
                    .eq('id', currentAuction.id);
                if (error) throw error;
            } else {
                const { data: newAuction, error } = await supabase
                    .from('auctions')
                    .insert([auctionData])
                    .select()
                    .single();

                if (error) throw error;

                // Trigger initial tasks for 'triagem' on create
                if (newAuction) {
                    await triggerAutomation('triagem', newAuction.id);
                }
            }

            // Sync with Agenda (Create Events for Dates)
            // Note: Ideally we should store event_ids in auction or use a trigger, but for now we simplisticly insert.
            if (auctionData.first_date) {
                const eventTitle = `📅 1ª Praça: ${auctionData.title}`;
                // Get Franchise ID
                const { data: profile } = await supabase.from('profiles').select('franchise_unit_id').eq('id', (await supabase.auth.getUser()).data.user?.id).single();

                if (profile?.franchise_unit_id) {
                    await supabase.from('events').insert([{
                        title: eventTitle,
                        start_time: auctionData.first_date,
                        end_time: new Date(new Date(auctionData.first_date).getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2h duration
                        description: `Leilão 1ª Praça do imóvel: ${auctionData.title}`,
                        franchise_id: profile.franchise_unit_id
                    }]);
                }
            }
            if (auctionData.second_date) {
                const eventTitle = `📅 2ª Praça: ${auctionData.title}`;
                const { data: profile } = await supabase.from('profiles').select('franchise_unit_id').eq('id', (await supabase.auth.getUser()).data.user?.id).single();

                if (profile?.franchise_unit_id) {
                    await supabase.from('events').insert([{
                        title: eventTitle,
                        start_time: auctionData.second_date,
                        end_time: new Date(new Date(auctionData.second_date).getTime() + 2 * 60 * 60 * 1000).toISOString(),
                        description: `Leilão 2ª Praça do imóvel: ${auctionData.title}`,
                        franchise_id: profile.franchise_unit_id
                    }]);
                }
            }

            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            alert('Erro ao salvar leilão: ' + error.message);
        }
    };

    // Task Management Functions
    const toggleTask = async (taskId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'done' ? 'todo' : 'done';

            // Optimistic Update
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

            await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
        } catch (error) {
            console.error('Error toggling task:', error);
            fetchData(); // Revert
        }
    };

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !currentAuction.id) return;

        try {
            // Get Franchise ID
            const { data: auction } = await supabase.from('auctions').select('franchise_id').eq('id', currentAuction.id).single();
            if (!auction) return;

            const newTask = {
                title: newTaskTitle,
                auction_id: currentAuction.id,
                status: 'todo',
                franchise_id: auction.franchise_id,
                description: 'Tarefa adicionada manualmente'
            };

            const { data, error } = await supabase.from('tasks').insert([newTask]).select().single();
            if (error) throw error;

            setTasks([...tasks, data]);
            setNewTaskTitle('');
        } catch (error: any) {
            console.error('Error adding task:', error);
            alert('Erro ao adicionar tarefa');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza? Isso apagará também as tarefas vinculadas.')) return;
        try {
            // Tasks delete automatically via cascade usually, but if not:
            await supabase.from('tasks').delete().eq('auction_id', id);

            const { error } = await supabase.from('auctions').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error: any) {
            alert('Erro: ' + error.message);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStage = destination.droppableId as Auction['pipeline_stage'];
        const oldStage = source.droppableId;

        // Optimistic Update
        const updatedAuctions = auctions.map(a =>
            a.id === draggableId ? { ...a, pipeline_stage: newStage } : a
        );
        setAuctions(updatedAuctions);

        try {
            // Update DB
            const { error } = await supabase
                .from('auctions')
                .update({ pipeline_stage: newStage })
                .eq('id', draggableId);

            if (error) throw error;

            // Trigger Automation tasks
            if (newStage !== oldStage) {
                await triggerAutomation(newStage, draggableId);
                fetchData(); // Refresh tasks
            }

            // If moved to 'pos_arrematacao', open Sale Modal
            if (newStage === 'pos_arrematacao') {
                setSaleData({ ...saleData, auctionId: draggableId, price: 0 });
                setIsSaleModalOpen(true);
            }

        } catch (error) {
            console.error('Error moving auction:', error);
            fetchData(); // Revert on error
        }
    };

    const triggerAutomation = async (stage: string, auctionId: string | undefined) => {
        if (!auctionId) return;

        // Fetch templates for this stage
        const { data: templates } = await supabase
            .from('task_templates')
            .select('*')
            .eq('stage_trigger', stage);

        if (!templates || templates.length === 0) return;

        // Get Franchise ID (assuming user context, OR fetch from auction)
        const { data: auction } = await supabase.from('auctions').select('franchise_id').eq('id', auctionId).single();
        if (!auction) return;

        // Create Tasks
        const newTasks = templates.map(t => ({
            title: t.title,
            description: `Automático: ${t.stage_trigger}`,
            status: 'todo',
            due_date: new Date(Date.now() + (t.days_due || 3) * 86400000).toISOString(),
            auction_id: auctionId,
            franchise_id: auction.franchise_id
        }));

        await supabase.from('tasks').insert(newTasks);
        console.log(`✅ ${newTasks.length} tarefas criadas para o estágio ${stage}`);
    };

    const handleSaleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { auctionId, price, commissionRate } = saleData;

            // Get Franchise ID
            const { data: auction } = await supabase.from('auctions').select('franchise_id, title').eq('id', auctionId).single();
            if (!auction) throw new Error("Auction not found");

            const totalCommission = price * (commissionRate / 100);
            const royalty = totalCommission * 0.10;

            // 1. Log Income for Franchise
            await supabase.from('financial_logs').insert({
                description: `Comissão Leilão: ${auction.title}`,
                amount: totalCommission,
                type: 'income',
                auction_id: auctionId,
                franchise_id: auction.franchise_id,
                date: new Date().toISOString()
            });

            // 2. Log Royalty Expense for Franchise
            await supabase.from('financial_logs').insert({
                description: `Royalties Matriz (10%): ${auction.title}`,
                amount: royalty,
                type: 'expense',
                auction_id: auctionId,
                franchise_id: auction.franchise_id,
                date: new Date().toISOString()
            });

            alert('Venda registrada e financeiro atualizado!');
            setIsSaleModalOpen(false);
        } catch (error: any) {
            alert('Erro ao registrar venda: ' + error.message);
        }
    };

    const openNewModal = () => {
        setCurrentAuction({ status: 'draft', pipeline_stage: 'triagem' });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const openEditModal = (auction: Auction) => {
        setCurrentAuction(auction);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    // Filter auctions by stage
    const getAuctionsByStage = (stage: string) => auctions.filter(a => (a.pipeline_stage || 'triagem') === stage);

    // Template Management
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedStage, setSelectedStage] = useState<string>('triagem');
    const [newTemplateTitle, setNewTemplateTitle] = useState('');

    const openSettings = async () => {
        setIsSettingsModalOpen(true);
        fetchTemplates();
    };

    const fetchTemplates = async () => {
        const { data } = await supabase.from('task_templates').select('*').order('created_at');
        setTemplates(data || []);
    };

    const addTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase.from('task_templates').insert([{
                title: newTemplateTitle,
                stage_trigger: selectedStage,
                days_due: 3 // Default
            }]).select().single();

            if (error) throw error;
            setTemplates([...templates, data]);
            setNewTemplateTitle('');
        } catch (error: any) {
            alert('Erro: ' + error.message);
        }
    };

    const deleteTemplate = async (id: string) => {
        try {
            await supabase.from('task_templates').delete().eq('id', id);
            setTemplates(templates.filter(t => t.id !== id));
        } catch (error: any) {
            alert('Erro: ' + error.message);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Pipeline de Leilões</h2>
                    <p className="text-gray-500 text-sm">Gerencie o fluxo de ponta a ponta</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={openSettings}
                        className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors"
                        title="Configurar Automação"
                    >
                        <Settings size={20} />
                        Configurar
                    </button>
                    <button
                        onClick={openNewModal}
                        className="bg-[#3a7ad1] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2a61b0] transition-colors"
                    >
                        <Plus size={20} />
                        Novo Processo
                    </button>
                </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                    {loading ? (
                        <p className="text-gray-500">Carregando leilões...</p>
                    ) : (
                        Object.entries(STAGES).map(([stageKey, stageLabel]) => (
                            <Droppable key={stageKey} droppableId={stageKey}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="min-w-[300px] w-[300px] bg-gray-50 rounded-xl flex flex-col max-h-full"
                                    >
                                        <div className="p-4 border-b border-gray-100 font-bold text-gray-700 flex justify-between items-center bg-gray-100 rounded-t-xl">
                                            {stageLabel}
                                            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                                {getAuctionsByStage(stageKey).length}
                                            </span>
                                        </div>
                                        <div className="p-3 flex-1 overflow-y-auto space-y-3">
                                            {getAuctionsByStage(stageKey).map((auction, index) => (
                                                <Draggable key={auction.id} draggableId={auction.id} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group relative"
                                                            onClick={() => openEditModal(auction)}
                                                        >
                                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(auction.id); }} className="p-1 bg-white shadow rounded-md hover:text-red-500">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>

                                                            <h4 className="font-bold text-gray-800 text-sm mb-2">{auction.title}</h4>

                                                            <div className="space-y-1">
                                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <DollarSign size={12} />
                                                                    Aval: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(auction.appraisal_value || 0)}
                                                                </p>
                                                                {auction.first_date && (
                                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                        <Calendar size={12} />
                                                                        {new Date(auction.first_date).toLocaleDateString()}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Task Progress Bar */}
                                                            <div className="mt-3">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="text-[10px] text-gray-500 font-medium">TAREFAS</span>
                                                                    <span className="text-[10px] text-gray-500">
                                                                        {tasks.filter(t => t.auction_id === auction.id && t.status === 'done').length}/{tasks.filter(t => t.auction_id === auction.id).length}
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                                    <div
                                                                        className="bg-[#3a7ad1] h-1.5 rounded-full transition-all duration-300"
                                                                        style={{ width: `${(tasks.filter(t => t.auction_id === auction.id && t.status === 'done').length / (tasks.filter(t => t.auction_id === auction.id).length || 1)) * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-3 flex justify-between items-center text-xs">
                                                                <span className={`px-1.5 py-0.5 rounded bg-gray-100 text-gray-600`}>
                                                                    {auction.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))
                    )}
                </div>
            </DragDropContext>

            {/* Edit/Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? "Editar Processo" : "Novo Processo de Leilão"}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Título do Imóvel/Processo</label>
                        <input
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                            value={currentAuction.title || ''}
                            onChange={e => setCurrentAuction({ ...currentAuction, title: e.target.value })}
                            required
                            placeholder="Ex: Leilão Judicial Apartamento Moema"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <textarea
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#3a7ad1] outline-none h-20"
                            value={currentAuction.description || ''}
                            onChange={e => setCurrentAuction({ ...currentAuction, description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Valor Avaliação</label>
                            <input
                                type="number"
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                                value={currentAuction.appraisal_value || ''}
                                onChange={e => setCurrentAuction({ ...currentAuction, appraisal_value: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Lance Mínimo</label>
                            <input
                                type="number"
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                                value={currentAuction.minimum_bid || ''}
                                onChange={e => setCurrentAuction({ ...currentAuction, minimum_bid: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Data 1ª Praça</label>
                            <input
                                type="datetime-local"
                                className="w-full border rounded-lg p-2 focus:ring-2 focus://3a7ad1] outline-none"
                                value={currentAuction.first_date ? new Date(currentAuction.first_date).toISOString().slice(0, 16) : ''}
                                onChange={e => setCurrentAuction({ ...currentAuction, first_date: new Date(e.target.value).toISOString() })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Data 2ª Praça</label>
                            <input
                                type="datetime-local"
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                                value={currentAuction.second_date ? new Date(currentAuction.second_date).toISOString().slice(0, 16) : ''}
                                onChange={e => setCurrentAuction({ ...currentAuction, second_date: new Date(e.target.value).toISOString() })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                            value={currentAuction.status || 'draft'}
                            onChange={e => setCurrentAuction({ ...currentAuction, status: e.target.value as any })}
                        >
                            <option value="draft">Rascunho</option>
                            <option value="published">Publicado</option>
                            <option value="active">Em Andamento</option>
                            <option value="finished">Arrematado</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#3a7ad1] text-white rounded-lg hover:bg-[#2a61b0]"
                        >
                            Salvar
                        </button>
                    </div>
                </form>

                {/* Task Checklist Section (Only active when editing existing auction) */}
                {isEditing && currentAuction.id && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            ✅ Checklist de Tarefas
                        </h3>

                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <ul className="space-y-2">
                                {tasks.filter(t => t.auction_id === currentAuction.id).length === 0 ? (
                                    <p className="text-gray-500 text-sm">Nenhuma tarefa para este leilão.</p>
                                ) : (
                                    tasks
                                        .filter(t => t.auction_id === currentAuction.id)
                                        .map(task => (
                                            <li key={task.id} className="flex items-start gap-3 p-2 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={task.status === 'done'}
                                                    onChange={() => toggleTask(task.id, task.status)}
                                                    className="mt-1 w-4 h-4 text-[#3a7ad1] rounded focus:ring-[#3a7ad1]"
                                                />
                                                <div>
                                                    <p className={`text-sm ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                                        {task.title}
                                                    </p>
                                                    {task.description && <p className="text-xs text-gray-400">{task.description}</p>}
                                                </div>
                                            </li>
                                        ))
                                )}
                            </ul>
                        </div>

                        <form onSubmit={addTask} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Adicionar nova tarefa..."
                                className="flex-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-black transition-colors"
                            >
                                <Plus size={18} />
                            </button>
                        </form>
                    </div>
                )}
            </Modal>

            {/* Sale / Financial Modal */}
            <Modal
                isOpen={isSaleModalOpen}
                onClose={() => setIsSaleModalOpen(false)}
                title="Registrar Arrematação (Venda)"
            >
                <form onSubmit={handleSaleSubmit} className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg text-green-800 text-sm mb-4">
                        <p>🎉 Parabéns! Ao registrar a venda, o sistema lançará automaticamente a <strong>Comissão</strong> e os <strong>Royalties (10%)</strong> no módulo Financeiro.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Valor da Arrematação (Venda)</label>
                        <input
                            type="number"
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none font-bold text-lg"
                            value={saleData.price || ''}
                            onChange={e => setSaleData({ ...saleData, price: Number(e.target.value) })}
                            required
                            placeholder="R$ 0,00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Taxa de Comissão (%)</label>
                        <input
                            type="number"
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                            value={saleData.commissionRate || ''}
                            onChange={e => setSaleData({ ...saleData, commissionRate: Number(e.target.value) })}
                            required
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-600">Comissão Total:</span>
                            <span className="font-bold text-green-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saleData.price * (saleData.commissionRate / 100))}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-600">Royalties Matriz (10%):</span>
                            <span className="font-bold text-red-500">
                                - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((saleData.price * (saleData.commissionRate / 100)) * 0.1)}
                            </span>
                        </div>
                        <div className="flex justify-between text-base py-2 font-bold border-t mt-2">
                            <span className="text-gray-800">Receita Líquida Franquia:</span>
                            <span className="text-[#3a7ad1]">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    (saleData.price * (saleData.commissionRate / 100)) - ((saleData.price * (saleData.commissionRate / 100)) * 0.1)
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsSaleModalOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Confirmar Venda
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Settings Modal (Task Templates) */}
            <Modal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                title="⚙️ Configurar Automação"
            >
                <div className="space-y-6">
                    <p className="text-sm text-gray-500">
                        Defina quais tarefas o sistema deve criar automaticamente quando um leilão entra em cada fase.
                    </p>

                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        {Object.entries(STAGES).slice(0, 4).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedStage(key)}
                                className={`flex-1 text-xs py-2 px-1 rounded-md transition-all font-medium text-center ${selectedStage === key ? 'bg-white shadow text-[#3a7ad1]' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {label.split('/')[0]}
                            </button>
                        ))}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                            Tarefas para: {STAGES[selectedStage as keyof typeof STAGES]}
                        </h4>

                        <ul className="space-y-2 mb-4">
                            {templates.filter(t => t.stage_trigger === selectedStage).length === 0 ? (
                                <p className="text-xs text-gray-400 italic">Nenhuma automação configurada.</p>
                            ) : (
                                templates.filter(t => t.stage_trigger === selectedStage).map(t => (
                                    <li key={t.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                                        <span className="text-sm text-gray-700">{t.title}</span>
                                        <button onClick={() => deleteTemplate(t.id)} className="text-gray-300 hover:text-red-500">
                                            <Trash2 size={14} />
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>

                        <form onSubmit={addTemplate} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Nova tarefa automática..."
                                className="flex-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                                value={newTemplateTitle}
                                onChange={e => setNewTemplateTitle(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-[#3a7ad1] text-white px-3 py-2 rounded-lg hover:bg-[#2a61b0] transition-colors"
                            >
                                <Plus size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Auctions;

