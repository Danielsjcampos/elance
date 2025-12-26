import React, { useState } from 'react';
import { Mail, Users, Brain, Layout, Repeat, BarChart3, Plus, Send } from 'lucide-react';
import EmailDashboard from './EmailDashboard';
import ContactManagement from './ContactManagement';
import SegmentManagement from './SegmentManagement';
import TemplateManagement from './TemplateManagement';
import FlowManagement from './FlowManagement';
import QueueManagement from './QueueManagement';

type Tab = 'dashboard' | 'contacts' | 'segments' | 'templates' | 'flows' | 'queue';

const EmailFlowCenter: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');

    const tabs = [
        { id: 'dashboard', label: 'Relatórios', icon: BarChart3 },
        { id: 'contacts', label: 'Contatos', icon: Users },
        { id: 'segments', label: 'Segmentos', icon: Brain },
        { id: 'templates', label: 'Templates', icon: Layout },
        { id: 'flows', label: 'Fluxos', icon: Repeat },
        { id: 'queue', label: 'Disparos/Fila', icon: Send },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <EmailDashboard />;
            case 'contacts': return <ContactManagement />;
            case 'segments': return <SegmentManagement />;
            case 'templates': return <TemplateManagement />;
            case 'flows': return <FlowManagement />;
            case 'queue': return <QueueManagement />;
            default: return <EmailDashboard />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Mail className="text-[#3a7ad1]" /> Central de Fluxos de E-mail
                    </h2>
                    <p className="text-gray-500">Gestão completa de automação e disparos.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-white text-[#3a7ad1] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                                }`}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px]">
                {renderContent()}
            </div>
        </div>
    );
};

export default EmailFlowCenter;
