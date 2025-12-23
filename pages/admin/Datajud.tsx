import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
// lucide-react might not have 'Scale' in older versions, checking package.json... it has 0.556.0, should be fine or use 'Balance'. 'Scale' exists.
import { Scale, Search, Save, Check, ExternalLink, AlertCircle, Database, Users, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TRIBUTAL_GROUPS = [
    {
        label: 'Justiça Federal',
        options: [
            { id: 'trf1', name: 'TRF1 - Federal 1ª Região' },
            { id: 'trf2', name: 'TRF2 - Federal 2ª Região' },
            { id: 'trf3', name: 'TRF3 - Federal 3ª Região' },
            { id: 'trf4', name: 'TRF4 - Federal 4ª Região' },
            { id: 'trf5', name: 'TRF5 - Federal 5ª Região' },
            { id: 'trf6', name: 'TRF6 - Federal 6ª Região' },
        ]
    },
    {
        label: 'Justiça Estadual',
        options: [
            { id: 'tjac', name: 'TJAC - Acre' },
            { id: 'tjal', name: 'TJAL - Alagoas' },
            { id: 'tjam', name: 'TJAM - Amazonas' },
            { id: 'tjap', name: 'TJAP - Amapá' },
            { id: 'tjba', name: 'TJBA - Bahia' },
            { id: 'tjce', name: 'TJCE - Ceará' },
            { id: 'tjdft', name: 'TJDFT - Distrito Federal' },
            { id: 'tjes', name: 'TJES - Espírito Santo' },
            { id: 'tjgo', name: 'TJGO - Goiás' },
            { id: 'tjma', name: 'TJMA - Maranhão' },
            { id: 'tjmg', name: 'TJMG - Minas Gerais' },
            { id: 'tjms', name: 'TJMS - Mato Grosso do Sul' },
            { id: 'tjmt', name: 'TJMT - Mato Grosso' },
            { id: 'tjpa', name: 'TJPA - Pará' },
            { id: 'tjpb', name: 'TJPB - Paraíba' },
            { id: 'tjpe', name: 'TJPE - Pernambuco' },
            { id: 'tjpi', name: 'TJPI - Piauí' },
            { id: 'tjpr', name: 'TJPR - Paraná' },
            { id: 'tjrj', name: 'TJRJ - Rio de Janeiro' },
            { id: 'tjrn', name: 'TJRN - Rio Grande do Norte' },
            { id: 'tjro', name: 'TJRO - Rondônia' },
            { id: 'tjrr', name: 'TJRR - Roraima' },
            { id: 'tjrs', name: 'TJRS - Rio Grande do Sul' },
            { id: 'tjsc', name: 'TJSC - Santa Catarina' },
            { id: 'tjse', name: 'TJSE - Sergipe' },
            { id: 'tjsp', name: 'TJSP - São Paulo' },
            { id: 'tjto', name: 'TJTO - Tocantins' },
        ]
    },
    {
        label: 'Justiça do Trabalho',
        options: [
            { id: 'trt1', name: 'TRT1 - 1ª Região' },
            { id: 'trt2', name: 'TRT2 - 2ª Região' },
            { id: 'trt3', name: 'TRT3 - 3ª Região' },
            { id: 'trt4', name: 'TRT4 - 4ª Região' },
            { id: 'trt5', name: 'TRT5 - 5ª Região' },
            { id: 'trt6', name: 'TRT6 - 6ª Região' },
            { id: 'trt7', name: 'TRT7 - 7ª Região' },
            { id: 'trt8', name: 'TRT8 - 8ª Região' },
            { id: 'trt9', name: 'TRT9 - 9ª Região' },
            { id: 'trt10', name: 'TRT10 - 10ª Região' },
            { id: 'trt11', name: 'TRT11 - 11ª Região' },
            { id: 'trt12', name: 'TRT12 - 12ª Região' },
            { id: 'trt13', name: 'TRT13 - 13ª Região' },
            { id: 'trt14', name: 'TRT14 - 14ª Região' },
            { id: 'trt15', name: 'TRT15 - 15ª Região' },
            { id: 'trt16', name: 'TRT16 - 16ª Região' },
            { id: 'trt17', name: 'TRT17 - 17ª Região' },
            { id: 'trt18', name: 'TRT18 - 18ª Região' },
            { id: 'trt19', name: 'TRT19 - 19ª Região' },
            { id: 'trt20', name: 'TRT20 - 20ª Região' },
            { id: 'trt21', name: 'TRT21 - 21ª Região' },
            { id: 'trt22', name: 'TRT22 - 22ª Região' },
            { id: 'trt23', name: 'TRT23 - 23ª Região' },
            { id: 'trt24', name: 'TRT24 - 24ª Região' },
        ]
    }
];

const API_KEY = 'APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

const Datajud: React.FC = () => {
    const { isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');

    // Search State
    const [selectedTribunal, setSelectedTribunal] = useState('trf1');
    const [searchQuery, setSearchQuery] = useState(''); // e.g., "penhora"
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');

    // Saved Leads State
    const [savedLeads, setSavedLeads] = useState<any[]>([]);
    const [loadingSaved, setLoadingSaved] = useState(false);

    useEffect(() => {
        if (activeTab === 'saved') {
            fetchSavedLeads();
        }
    }, [activeTab]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearching(true);
        setError('');
        setResults([]);

        try {
            // Using a simple match query for now. Datajud supports complex DSL.
            // If user typed a Process Number, use 'numeroProcesso'. Otherwise try 'assuntos.nome' or generic match?
            // The prompt example used 'numeroProcesso' or 'classe.codigo'.
            // To search text like "penhora", we might need to search in movements or subjects.

            const isProcessNumber = /^\d+$/.test(searchQuery.replace(/\D/g, ''));

            let queryBody: any = {
                "size": 20,
                "query": {
                    "bool": {
                        "must": []
                    }
                }
            };

            if (isProcessNumber) {
                queryBody.query.bool.must.push({
                    "match": { "numeroProcesso": searchQuery.replace(/\D/g, '') }
                });
            } else {
                // Text search is trickier on Datajud without exact fields. 
                // We will try querying 'assuntos.nome' and 'movimentos.nome' with 'match_phrase' or 'match'
                queryBody.query.bool.should = [
                    { "match": { "assuntos.nome": searchQuery } },
                    { "match": { "movimentos.nome": searchQuery } },
                    { "match": { "classe.nome": searchQuery } }
                ];
                queryBody.query.bool.minimum_should_match = 1;
            }

            // USE PROXY for local development (avoid CORS)
            // In production, you would need a Backend Proxy or Supabase Edge Function
            const response = await fetch(`/api-datajud/api_publica_${selectedTribunal}/_search`, {
                method: 'POST',
                headers: {
                    'Authorization': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(queryBody)
            });

            if (!response.ok) {
                // If CORS fails, browser throws before this. If this happens, it's a 4xx/5xx from API.
                if (response.status === 403) throw new Error('Acesso negado (API Key inválida ou IP bloqueado).');
                throw new Error(`Erro API: ${response.status}`);
            }

            const data = await response.json();
            const hits = data.hits?.hits?.map((hit: any) => hit._source) || [];
            if (hits.length === 0) setError('Nenhum processo encontrado.');
            setResults(hits);

        } catch (err: any) {
            console.error(err);
            if (err.message === 'Failed to fetch') {
                setError('Erro de Conexão: Possível bloqueio CORS. A API do Datajud pode não permitir chamadas diretas do navegador local.');
            } else {
                setError(err.message);
            }
        } finally {
            setSearching(false);
        }
    };

    const saveLead = async (processData: any) => {
        try {
            const { error } = await supabase.from('legal_process_leads').insert([{
                process_number: processData.numeroProcesso,
                tribunal: processData.tribunal,
                court_name: processData.orgaoJulgador?.nome,
                assuntos_data: processData.assuntos,
                parties_data: processData, // Save FULL object to ensure we catch 'polos' or 'movimentos'
                status: 'new',
                notes: `Importado do Datajud. Classe: ${processData.classe?.nome}`
            }]);

            if (error) {
                if (error.code === '23505') alert('Este processo já foi importado.');
                else throw error;
            } else {
                alert('Processo salvo! Veja na aba "Leads Salvos".');
            }
        } catch (err: any) {
            console.error(err);
            alert('Erro ao salvar: ' + err.message);
        }
    };

    const fetchSavedLeads = async () => {
        setLoadingSaved(true);
        const { data } = await supabase.from('legal_process_leads').select('*').order('created_at', { ascending: false });
        setSavedLeads(data || []);
        setLoadingSaved(false);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.setTextColor(58, 122, 209); // #3a7ad1
        doc.text('E-Lance Admin - Relatório Datajud', 14, 20);

        // Find tribunal name for header
        let tribunalName = selectedTribunal;
        for (const group of TRIBUTAL_GROUPS) {
            const found = group.options.find(t => t.id === selectedTribunal);
            if (found) {
                tribunalName = found.name;
                break;
            }
        }

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Data da Emissão: ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`, 14, 26);
        doc.text(`Tribunal: ${tribunalName}`, 14, 31);
        doc.text(`Termo de Busca: "${searchQuery}"`, 14, 36);

        // Table
        const tableColumn = ["Processo", "Tribunal", "Classe", "Assunto", "Conferido", "Status", "Responsável"];
        const tableRows: any[] = [];

        results.forEach(proc => {
            const assunto = proc.assuntos?.[0]?.nome || proc.assuntos?.[0]?.[0]?.nome || 'N/A';
            const rowFragment = [
                proc.numeroProcesso,
                proc.tribunal,
                proc.classe?.nome || 'N/A',
                assunto,
                '', // Conferido box
                '', // Status line
                ''  // Responsável line
            ];
            tableRows.push(rowFragment);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [58, 122, 209] },
            columnStyles: {
                0: { cellWidth: 45 }, // Processo
                1: { cellWidth: 20 }, // Tribunal
                2: { cellWidth: 35 }, // Classe
                3: { cellWidth: 35 }, // Assunto
                4: { cellWidth: 15, halign: 'center' }, // Conferido
                5: { cellWidth: 20 }, // Status
                6: { cellWidth: 20 }  // Responsável
            },
            didDrawCell: (data) => {
                // Draw Checkbox for "Conferido"
                if (data.section === 'body' && data.column.index === 4) {
                    // Empty square
                    // doc.rect(data.cell.x + 4, data.cell.y + 2, 6, 6); // Simple check box
                }
            }
        });

        doc.save(`relatorio_datajud_${searchQuery.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    };

    // --- Details Modal Logic ---
    const [selectedLead, setSelectedLead] = useState<any>(null);

    const getLawyers = (json: any) => {
        // Attempt to find lawyers in standard Datajud structures
        // Structure A: polos -> advogados
        // Structure B: sujeitosProcessuais -> advogado

        let lawyers: any[] = [];

        // Try Polos (Common)
        if (json?.polos) {
            json.polos.forEach((polo: any) => {
                if (polo.advogados) {
                    polo.advogados.forEach((adv: any) => {
                        lawyers.push({ name: adv.nome, type: polo.polo === 'AT' ? 'Ativo (Autor)' : 'Passivo (Réu)', oab: adv.numeroOab });
                    });
                }
            });
        }

        return lawyers;
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Scale className="text-[#3a7ad1]" />
                    Datajud (Leads Jurídicos)
                </h2>
                <div className="flex bg-gray-200 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'search' ? 'bg-white shadow text-[#3a7ad1]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Pesquisar
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'saved' ? 'bg-white shadow text-[#3a7ad1]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Leads Salvos
                    </button>
                </div>
            </div>

            {activeTab === 'search' && (
                <div className="space-y-6">
                    {/* Search Form */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-1/4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tribunal</label>
                                <select
                                    className="w-full border rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                                    value={selectedTribunal}
                                    onChange={e => setSelectedTribunal(e.target.value)}
                                >
                                    {TRIBUTAL_GROUPS.map((group) => (
                                        <optgroup key={group.label} label={group.label}>
                                            {group.options.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Termo de Pesquisa</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Penhora, Leilão, 0000832..."
                                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-[#3a7ad1] outline-none"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">Busque por número do processo ou palavras-chave (Assunto/Movimento).</p>
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={searching}
                                    className="bg-[#3a7ad1] text-white px-6 py-2.5 rounded-lg hover:bg-[#2a61b0] transition-colors flex items-center gap-2 disabled:opacity-70"
                                >
                                    {searching ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Search size={20} />}
                                    Pesquisar
                                </button>
                                {results.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={exportToPDF}
                                        className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 ml-2"
                                    >
                                        <FileText size={20} />
                                        Exportar PDF
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Results */}
                    {
                        error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )
                    }

                    {
                        results.length > 0 && (
                            <div className="grid grid-cols-1 gap-4">
                                {results.map((proc: any) => (
                                    <div key={proc.numeroProcesso} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:border-[#3a7ad1] transition-colors group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">{proc.tribunal}</span>
                                                    <h4 className="font-mono font-semibold text-gray-800">{proc.numeroProcesso}</h4>
                                                </div>
                                                <p className="text-gray-600 font-medium">{proc.classe?.nome}</p>
                                                <p className="text-sm text-gray-500">{proc.orgaoJulgador?.nome} - {proc.orgaoJulgador?.codigoMunicipioIBGE}</p>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {proc.assuntos?.map((assunto: any, idx: number) => (
                                                        <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                                            {Array.isArray(assunto) ? assunto[0]?.nome : assunto.nome}
                                                        </span>
                                                    ))}
                                                </div>

                                                <p className="text-xs text-gray-400 mt-3">Última atualização: {new Date(proc.dataHoraUltimaAtualizacao).toLocaleDateString()} | Sistema: {proc.sistema?.nome}</p>
                                            </div>
                                            <button
                                                onClick={() => saveLead(proc)}
                                                className="text-gray-400 hover:text-[#3a7ad1] p-2 rounded-full hover:bg-blue-50 transition-colors"
                                                title="Salvar como Lead"
                                            >
                                                <Save size={24} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    }
                </div >
            )}

            {
                activeTab === 'saved' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                <Database size={20} className="text-[#3a7ad1]" />
                                Leads Jurídicos Salvos
                            </h3>
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">{savedLeads.length} Processos</span>
                        </div>

                        {loadingSaved ? (
                            <div className="p-8 text-center text-gray-500">Carregando...</div>
                        ) : savedLeads.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">Nenhum processo salvo ainda.</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {savedLeads.map((lead) => (
                                    <div key={lead.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono font-bold text-gray-800 truncate">{lead.process_number}</span>
                                                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded shrink-0">{lead.id.slice(0, 8)}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 font-medium">{lead.court_name} ({lead.tribunal})</p>
                                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{lead.notes}</p>
                                            </div>
                                            <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                                                <button
                                                    onClick={() => setSelectedLead(lead)}
                                                    className="px-3 py-1.5 text-sm bg-blue-50 text-[#3a7ad1] rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2"
                                                >
                                                    <ExternalLink size={16} />
                                                    Ver Detalhes
                                                </button>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${lead.status === 'new' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {lead.status === 'new' ? 'Novo' : lead.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {/* Lead Details Modal */}
            {
                selectedLead && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Scale className="text-[#3a7ad1]" />
                                    Detalhes do Processo
                                </h3>
                                <button
                                    onClick={() => setSelectedLead(null)}
                                    className="text-gray-400 hover:text-gray-600 p-2"
                                >
                                    <ExternalLink className="rotate-180" size={24} /> {/* Close icon substitute */}
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Header Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-1">Número Unificado</p>
                                    <p className="text-2xl font-mono font-bold text-gray-900">{selectedLead.process_number}</p>

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Tribunal</p>
                                            <p className="text-gray-800">{selectedLead.tribunal}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Vara / Órgão</p>
                                            <p className="text-gray-800">{selectedLead.court_name}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Lawyers Extraction */}
                                <div>
                                    <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                                        <Users size={20} className="text-[#3a7ad1]" />
                                        Advogados & Partes
                                    </h4>

                                    {selectedLead.parties_data ? (
                                        <div className="space-y-3">
                                            {/* Logic to parser parties_data JSON */}
                                            {(() => {
                                                const lawyers = getLawyers(selectedLead.parties_data);
                                                if (lawyers.length > 0) {
                                                    return lawyers.map((adv: any, i: number) => (
                                                        <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg">
                                                            <div>
                                                                <p className="font-bold text-gray-800">{adv.name}</p>
                                                                <p className="text-xs text-gray-500">OAB: {adv.oab || 'N/A'}</p>
                                                            </div>
                                                            <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-600">{adv.type}</span>
                                                        </div>
                                                    ));
                                                } else {
                                                    return (
                                                        <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-500">
                                                            <p>Nenhum advogado encontrado na estrutura padrão.</p>
                                                            <p className="text-xs mt-1">Verifique os dados brutos abaixo.</p>
                                                        </div>
                                                    );
                                                }
                                            })()}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 italic">Dados detalhados não disponíveis na importação.</p>
                                    )}
                                </div>

                                {/* Raw Data Inspector */}
                                <div>
                                    <h4 className="font-bold text-sm text-gray-500 uppercase mb-2">Dados Brutos (Debug)</h4>
                                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-60">
                                        <pre>{JSON.stringify(selectedLead.parties_data || {}, null, 2)}</pre>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                                <button
                                    onClick={() => setSelectedLead(null)}
                                    className="px-6 py-2 bg-[#3a7ad1] text-white rounded-lg hover:bg-[#2a61b0] font-medium"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Datajud;
