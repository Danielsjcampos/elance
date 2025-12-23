import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type MenuMode = 'default' | 'macbook';

interface BrandingSettings {
    id?: string;
    logo_url?: string;
    icon_url?: string;
    name?: string;
    site_title?: string;
    featured_image_url?: string;
}

interface ThemeContextType {
    menuMode: MenuMode;
    setMenuMode: (mode: MenuMode) => void;
    branding: BrandingSettings;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [menuMode, setMenuMode] = useState<MenuMode>('default');
    const [branding, setBranding] = useState<BrandingSettings>({});

    useEffect(() => {
        const savedMode = localStorage.getItem('site_elance_menu_mode');
        if (savedMode === 'macbook' || savedMode === 'default') {
            setMenuMode(savedMode);
        }
        fetchBranding();
    }, []);

    const fetchBranding = async () => {
        try {
            // Fetch all franchise units to find the one with branding data
            // (Assuming reasonably small number of units for now, or we should have a 'is_main' flag)
            const { data, error } = await supabase
                .from('franchise_units')
                .select('id, logo_url, icon_url, name, site_title, featured_image_url, created_at');

            if (data && !error && data.length > 0) {
                // Prioritize unit with site_title or logo_url
                // Fallback to the one named "Franquia de Leilões do Brasil" or similar if needed
                // For now: Find first one with site_title OR logo_url
                const mainUnit = data.find(u => u.site_title || u.logo_url) || data[0];

                console.log('Branding fetched (selected):', mainUnit);
                setBranding(mainUnit);

                // Update Favicon dynamically
                if (mainUnit.icon_url) {
                    const existingLink = document.querySelector("link[rel*='icon']");
                    if (existingLink) {
                        (existingLink as HTMLLinkElement).href = mainUnit.icon_url;
                    } else {
                        const link = document.createElement('link');
                        link.type = 'image/x-icon';
                        link.rel = 'shortcut icon';
                        link.href = mainUnit.icon_url;
                        document.head.appendChild(link);
                    }
                }

                // Update Title: Prefer site_title, fallback to name
                if (mainUnit.site_title) {
                    document.title = mainUnit.site_title;
                } else if (mainUnit.name) {
                    document.title = mainUnit.name;
                }
            }
        } catch (error) {
            console.error('Error fetching branding:', error);
        }
    };

    const handleSetMenuMode = (mode: MenuMode) => {
        setMenuMode(mode);
        localStorage.setItem('site_elance_menu_mode', mode);
    };

    return (
        <ThemeContext.Provider value={{ menuMode, setMenuMode: handleSetMenuMode, branding }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
