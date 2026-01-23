import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Task } from '../../../types';
import { X, CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const TasksSidebar = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isOpen, setIsOpen] = useState(false); // Default to CLOSED
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // Only show on admin pages
    if (!location.pathname.startsWith('/admin')) return null;

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(fetchTasks, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const fetchTasks = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('tasks')
            .select('*')
            .eq('assignee_id', user.id)
            .in('status', ['pending', 'in_progress'])
            .order('due_date', { ascending: true });

        setTasks(data || []);
        // Auto-open if there are urgent tasks? optional.
        setLoading(false);
    };

    const handleComplete = async (taskId: string) => {
        // Optimistic update
        setTasks(prev => prev.filter(t => t.id !== taskId));
        
        await supabase
            .from('tasks')
            .update({ status: 'completed' })
            .eq('id', taskId);
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed top-1/2 -translate-y-1/2 z-50 bg-[#1e293b] border border-white/10 p-2 rounded-l-xl shadow-lg transition-all duration-300 ${isOpen ? 'right-80' : 'right-0'}`}
                title="Minhas Tarefas"
            >
                {isOpen ? <ChevronRight size={20} className="text-white" /> : (
                    <div className="relative">
                        <ChevronLeft size={20} className="text-white" />
                        {tasks.length > 0 && (
                            <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                                {tasks.length}
                            </span>
                        )}
                    </div>
                )}
            </button>

            {/* Sidebar Panel */}
            <div className={`fixed right-0 top-20 bottom-0 w-80 bg-[#1e293b] border-l border-white/10 p-4 transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="flex items-center gap-2 font-bold text-white">
                        <AlertCircle className="text-blue-500" />
                        Tarefas Pendentes ({tasks.length})
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {tasks.map(task => (
                        <div key={task.id} className="bg-[#0f172a] p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    task.priority === 'urgent' ? 'bg-red-500/20 text-red-500' :
                                    task.priority === 'high' ? 'bg-orange-500/20 text-orange-500' :
                                    'bg-blue-500/20 text-blue-500'
                                }`}>
                                    {task.priority.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : 'Sem data'}
                                </span>
                            </div>
                            <h4 className="text-sm font-medium text-white mb-2">{task.title}</h4>
                            {task.description && (
                                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                            )}
                            
                            <button 
                                onClick={() => handleComplete(task.id)}
                                className="w-full py-1.5 flex items-center justify-center gap-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-colors text-xs font-bold"
                            >
                                <CheckCircle size={14} />
                                Concluir
                            </button>
                        </div>
                    ))}

                    {tasks.length === 0 && !loading && (
                        <div className="text-center py-10 text-gray-500 text-sm">
                            <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                            <p>Nenhuma tarefa pendente!</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TasksSidebar;
