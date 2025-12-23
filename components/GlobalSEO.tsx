
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../contexts/ThemeContext';

const GlobalSEO: React.FC = () => {
    const { branding } = useTheme();

    // Determine values with fallbacks
    const title = branding.site_title || branding.name || 'E-Lance | Ecossistema de Leilões';
    const icon = branding.icon_url || '/vite.svg';
    const description = "O melhor ecossistema de leilões do Brasil. Mentoria, cursos e tecnologia.";
    const image = branding.featured_image_url || branding.logo_url || "";

    return (
        <Helmet>
            {/* Title */}
            <title>{title}</title>

            {/* Favicon */}
            <link rel="icon" type="image/png" href={icon} />
            <link rel="apple-touch-icon" href={icon} />

            {/* Meta Tags */}
            <meta name="description" content={description} />
            {branding.name && <meta name="application-name" content={branding.name} />}

            {/* Open Graph Global Defaults */}
            <meta property="og:site_name" content={branding.name || "E-Lance"} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {image && <meta property="og:image" content={image} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            {image && <meta name="twitter:image" content={image} />}
        </Helmet>
    );
};

export default GlobalSEO;
