import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Auction, Lead } from '../../../../types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  Gavel, 
  Calendar, 
  DollarSign, 
  MoreVertical,
  Clock,
  X,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateAutoArrematacao } from '../../../utils/pdfGenerator';

const COLUMNS = [
  { id: 'preparacao', title: 'Preparação', color: 'bg-gray-500/10 border-gray-500/20 text-gray-400' },
  { id: 'publicado', title: 'Publicado', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  { id: 'primeira_praca', title: '1ª Praça', color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' },
  { id: 'segunda_praca', title: '2ª Praça', color: 'bg-orange-500/10 border-orange-500/20 text-orange-400' },
  { id: 'arrematado', title: 'Arrematado', color: 'bg-green-500/10 border-green-500/20 text-green-400' },
  { id: 'suspenso', title: 'Suspenso', color: 'bg-red-500/10 border-red-500/20 text-red-400' },
];

const AuctionsKanban = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [arrematantes, setArrematantes] = useState<Lead[]>([]);
  const [selectedArrematanteId, setSelectedArrematanteId] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchAuctions();
    fetchArrematantes();
  }, []);

  const fetchAuctions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('auctions')
      .select('*, comitente:leads!comitente_id(name)') 
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching auctions:', error);
    } else {
      setAuctions(data || []);
    }
    setLoading(false);
  };

  const fetchArrematantes = async () => {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('type', 'arrematante');
    setArrematantes(data || []);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;

    // Se moveu para ARREMATADO, abrir modal e PAUSAR atualização
    if (newStatus === 'arrematado') {
      setSelectedAuctionId(draggableId);
      setIsModalOpen(true);
      return; 
    }

    // Fluxo normal para outras colunas
    const updatedAuctions = auctions.map(a => 
      a.id === draggableId ? { ...a, status: newStatus as any } : a
    );
    setAuctions(updatedAuctions);

    const { error } = await supabase
      .from('auctions')
      .update({ status: newStatus })
      .eq('id', draggableId);

    if (error) {
      console.error('Error updating status:', error);
      fetchAuctions(); 
    }
  };

  const handleConfirmArrematacao = async () => {
    if (!selectedAuctionId || !selectedArrematanteId) return;
    setGenerating(true);

    const auction = auctions.find(a => a.id === selectedAuctionId);
    const bidder = arrematantes.find(a => a.id === selectedArrematanteId);

    if (auction && bidder) {
      // 1. Atualizar banco
      const { error } = await supabase
        .from('auctions')
        .update({ 
          status: 'arrematado', 
          arrematante_id: selectedArrematanteId 
        })
        .eq('id', selectedAuctionId);

      if (!error) {
        // 2. Gerar PDF
        generateAutoArrematacao(auction, bidder);

        // 3. Atualizar UI
        const updatedAuctions = auctions.map(a => 
          a.id === selectedAuctionId 
            ? { ...a, status: 'arrematado' as const, arrematante_id: selectedArrematanteId } 
            : a
        );
        setAuctions(updatedAuctions);
        setIsModalOpen(false);
        setSelectedAuctionId(null);
        setSelectedArrematanteId('');
      } else {
        alert('Erro ao atualizar arrematação');
      }
    }
    setGenerating(false);
  };

  const getColumnAuctions = (status: string) => {
    return auctions.filter(a => a.status === status);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ -';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="h-full overflow-x-auto pb-4 relative">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 min-w-[1200px]">
          {COLUMNS.map(column => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="w-80 flex-shrink-0"
                >
                  <div className={`p-3 rounded-t-xl border-b-2 flex items-center justify-between ${column.color.replace('bg-', 'bg-opacity-20 ')} bg-[#1e293b]`}>
                    <h3 className="font-bold text-sm uppercase tracking-wide">{column.title}</h3>
                    <span className="bg-[#0f172a] text-xs px-2 py-0.5 rounded-full text-white/70">
                      {getColumnAuctions(column.id).length}
                    </span>
                  </div>
                  
                  <div className="bg-[#1e293b]/50 rounded-b-xl p-2 min-h-[500px] border border-white/5 border-t-0 space-y-3">
                    {getColumnAuctions(column.id).map((auction, index) => (
                      <Draggable key={auction.id} draggableId={auction.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-[#0f172a] p-4 rounded-xl border border-white/10 hover:border-blue-500/50 shadow-sm transition-all group ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 rotate-2' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                                {auction.process_number}
                              </span>
                              <Link 
                                to={`/admin/leiloes/${auction.id}`} 
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all text-gray-400"
                              >
                                <MoreVertical size={14} />
                              </Link>
                            </div>
                            
                            <p className="text-sm text-gray-200 font-medium line-clamp-2 mb-3" title={auction.description || ''}>
                              {auction.description || 'Sem descrição'}
                            </p>

                            <div className="space-y-2 text-xs text-gray-500">
                              <div className="flex items-center gap-2">
                                <DollarSign size={12} />
                                <span>Aval: <span className="text-gray-300">{formatCurrency(auction.valuation_value)}</span></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar size={12} />
                                <span>1ª P: {auction.first_auction_date ? new Date(auction.first_auction_date).toLocaleDateString('pt-BR') : '-'}</span>
                              </div>
                            </div>

                            {/* Alert if 2nd Praca is close (stub logic) */}
                            {auction.second_auction_date && new Date(auction.second_auction_date) < new Date(Date.now() + 172800000) && (
                              <div className="mt-3 flex items-center gap-1.5 text-orange-400 text-xs bg-orange-500/10 p-1.5 rounded-lg">
                                <Clock size={12} />
                                <span>2ª Praça Próxima!</span>
                              </div>
                            )}

                            {/* Badge de Arrematado */}
                            {auction.status === 'arrematado' && (
                              <div className="mt-3 flex items-center justify-between text-green-400 text-xs bg-green-500/10 p-1.5 rounded-lg">
                                <span className="flex items-center gap-1.5">
                                    <Gavel size={12} />
                                    Arrematado
                                </span>
                                <button className="hover:text-white" title="Reemitir Auto">
                                    <FileText size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Modal de Arrematação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Gavel className="text-green-500" />
                Registrar Arrematação
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-300">
                Selecione o arrematante para finalizar o leilão. Um <strong>Auto de Arrematação</strong> será gerado automaticamente em PDF.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Arrematante</label>
                <select
                  value={selectedArrematanteId}
                  onChange={(e) => setSelectedArrematanteId(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
                >
                  <option value="">Selecione...</option>
                  {arrematantes.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.cpf_cnpj})</option>
                  ))}
                </select>
                {arrematantes.length === 0 && (
                    <p className="text-xs text-red-400 mt-2">Nenhum arrematante cadastrado. Cadastre um lead do tipo 'Arrematante' primeiro.</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-[#151d38]/50 rounded-b-2xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmArrematacao}
                disabled={!selectedArrematanteId || generating}
                className="px-6 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {generating ? 'Gerando...' : 'Confirmar e Gerar Auto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionsKanban;
