import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AccessDenied from './AccessDenied';

interface RequirePermissionProps {
    permissionKey: string;
    children: React.ReactNode;
}

const RequirePermission: React.FC<RequirePermissionProps> = ({ permissionKey, children }) => {
    // User requested to disable route protection (allow all modules).
    // Visibility is controlled only by Sidebar hiding.
    return <>{children}</>;
};

export default RequirePermission;
