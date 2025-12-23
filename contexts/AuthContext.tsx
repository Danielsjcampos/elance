import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'manager' | 'collaborator';
    franchise_unit_id: string | null;
    permissions?: Record<string, boolean>; // Granular permissions
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: UserProfile | null;
    signOut: () => Promise<void>;
    loading: boolean;
    isAdmin: boolean;
    profileError?: string | null;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    signOut: async () => { },
    loading: true,
    isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const [profileError, setProfileError] = useState<string | null>(null);

    useEffect(() => {
        // Initial fetch
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Auth state listener
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setProfileError(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            setProfileError(null);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                setProfileError(error.message);
            } else {
                setProfile(data);
            }
        } catch (err: any) {
            console.error('Error fetching profile:', err);
            setProfileError(err.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setProfileError(null);
    };

    const isAdmin = profile?.role === 'admin';

    return (
        <AuthContext.Provider value={{ session, user, profile, signOut, loading, isAdmin, profileError }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    return useContext(AuthContext);
};
