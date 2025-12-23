import React from 'react';
import { Outlet } from 'react-router-dom';

const MinimalLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#151d38] text-white">
            {/* Background patterns could go here if global */}
            <Outlet />
        </div>
    );
};

export default MinimalLayout;
