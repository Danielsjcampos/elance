import React, { useState } from 'react';
import AuctionsKanban from './AuctionsKanban';
import { Link } from 'react-router-dom';
import { Plus, LayoutTemplate, List } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Auction } from '../../../../types';

const AuctionsList = () => {
    // Basic Stub for list view if needed, but for now we focus on Kanban
    // Reusing logic similar to LeadsList but for Auctions if user wants list view
    return (
        <div className="text-center py-20 text-gray-400">
            Modo Lista em desenvolvimento. Use o Kanban.
        </div>
    )
}

const AuctionsModule = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leilões & Processos</h1>
          <p className="text-gray-400">Gerencie o fluxo dos seus leilões.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="bg-[#1e293b] p-1 rounded-lg border border-white/10 flex">
                <button 
                    onClick={() => setViewMode('kanban')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    title="Visualização Kanban"
                >
                    <LayoutTemplate size={20} />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    title="Visualização em Lista"
                >
                    <List size={20} />
                </button>
            </div>

            <Link
                to="/admin/leiloes/new"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 font-bold"
            >
                <Plus size={20} />
                Novo Leilão
            </Link>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? <AuctionsKanban /> : <AuctionsList />}
      </div>
    </div>
  );
};

export default AuctionsModule;
