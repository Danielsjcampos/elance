import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AccessDeniedProps {
    requiredPermission: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ requiredPermission }) => {
    const { profile, isAdmin } = useAuth();

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
                <ShieldAlert size={40} />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">Acesso Negado</h1>
            <p className="text-gray-500 max-w-md mb-8">
                Você não tem permissão para acessar o módulo <strong>{requiredPermission}</strong>.
                Entre em contato com o administrador se acredita que isso é um erro.
            </p>

            {/* Debug Info */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-left text-xs text-gray-400 mb-8 max-w-sm w-full mx-auto font-mono">
                <p className="font-bold border-b pb-1 mb-2">Debug Info:</p>
                <p>Role: {profile?.role}</p>
                <p>IsAdmin: {isAdmin ? 'Yes' : 'No'}</p>
                <p>Required: {requiredPermission}</p>
                <p>Your Permissions:</p>
                <pre className="mt-1 whitespace-pre-wrap">
                    {JSON.stringify(profile?.permissions || {}, null, 2)}
                </pre>
            </div>

            <Link
                to="/admin/dashboard"
                className="flex items-center gap-2 px-6 py-3 bg-[#3a7ad1] text-white rounded-lg font-bold hover:bg-[#2a61b0] transition-colors"
            >
                <ArrowLeft size={20} />
                Voltar ao Dashboard
            </Link>
        </div>
    );
};

export default AccessDenied;
