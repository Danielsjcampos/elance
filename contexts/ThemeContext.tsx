import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type MenuMode = 'default' | 'macbook';

export interface CustomTheme {
    menuSpacing: 'compact' | 'normal' | 'relaxed';
    fontFamily: 'sans' | 'serif' | 'mono';
    fontSize: 'sm' | 'base' | 'lg';
    iconSize: number;
    menuViewMode: 'list' | 'grid';
    gridColumns: 2 | 3;
    primaryColor: string;
    sidebarColor: string;
    textColor: string;
    colorfulIcons: boolean;
    glassEffect: boolean;
}

const defaultTheme: CustomTheme = {
    menuSpacing: 'normal',
    fontFamily: 'sans',
    fontSize: 'base',
    iconSize: 20,
    menuViewMode: 'list',
    gridColumns: 2,
    primaryColor: '#3a7ad1',
    sidebarColor: '#151d38',
    textColor: '#ffffff',
    colorfulIcons: false, // Default standard
    glassEffect: false
};

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
    customTheme: CustomTheme;
    updateCustomTheme: (updates: Partial<CustomTheme>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [menuMode, setMenuMode] = useState<MenuMode>('default');
    const [branding, setBranding] = useState<BrandingSettings>({});
    const [customTheme, setCustomTheme] = useState<CustomTheme>(defaultTheme);

    useEffect(() => {
        const savedMode = localStorage.getItem('site_elance_menu_mode');
        if (savedMode === 'macbook' || savedMode === 'default') {
            setMenuMode(savedMode);
        }

        const savedTheme = localStorage.getItem('site_elance_custom_theme');
        if (savedTheme) {
            try {
                setCustomTheme({ ...defaultTheme, ...JSON.parse(savedTheme) });
            } catch (e) {
                console.error('Error parsing saved theme', e);
            }
        }

        fetchBranding();
    }, []);

    const fetchBranding = async () => {
        try {
            const { data, error } = await supabase
                .from('franchise_units')
                .select('id, logo_url, icon_url, name, site_title, featured_image_url, created_at');

            if (data && !error && data.length > 0) {
                const mainUnit = data.find(u => u.site_title || u.logo_url) || data[0];
                setBranding(mainUnit);

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

    const updateCustomTheme = (updates: Partial<CustomTheme>) => {
        const newTheme = { ...customTheme, ...updates };
        setCustomTheme(newTheme);
        localStorage.setItem('site_elance_custom_theme', JSON.stringify(newTheme));
    };

    return (
        <ThemeContext.Provider value={{
            menuMode,
            setMenuMode: handleSetMenuMode,
            branding,
            customTheme,
            updateCustomTheme
        }}>
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
