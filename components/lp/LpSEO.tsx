import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../../contexts/ThemeContext';

const LpSEO: React.FC = () => {
    const { branding } = useTheme();

    // Default values if not set in branding
    const siteUrl = 'https://e-lance.com.br';
    const logoUrl = branding.logo_url || 'https://e-lance.com.br/wp-content/uploads/2021/08/logo-e-lance-1.png';
    const featuredImage = branding.featured_image_url || logoUrl;
    const siteTitle = branding.site_title || branding.name || 'E-Lance | Franquia e Escola de Leilões';

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": branding.name || "E-Lance",
        "url": siteUrl,
        "logo": logoUrl,
        "sameAs": [
            "https://www.instagram.com/elanceleiloes",
            "https://www.facebook.com/elanceleiloes",
            "https://www.youtube.com/c/elance"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+55-11-99999-9999", // Placeholder
            "contactType": "customer service",
            "areaServed": "BR",
            "availableLanguage": "Portuguese"
        }
    };

    const courseSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "Formação em Leilões E-Lance",
        "description": "Curso completo e mentoria para quem deseja se tornar um leiloeiro oficial ou investir em leilões com segurança.",
        "provider": {
            "@type": "Organization",
            "name": branding.name || "E-Lance Escola",
            "sameAs": "https://escola.e-lance.com.br"
        }
    };

    const franchiseSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Franquia E-Lance",
        "description": "Modelo de franquia para atuar no mercado de leilões de imóveis e veículos com tecnologia e suporte especializado.",
        "brand": {
            "@type": "Brand",
            "name": branding.name || "E-Lance"
        },
        "offers": {
            "@type": "Offer",
            "url": `${siteUrl}/lp-e-lance`,
            "priceCurrency": "BRL",
            "price": "5000.00",
            "priceValidUntil": "2025-12-31",
            "availability": "https://schema.org/InStock"
        }
    };

    const webPageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": siteTitle,
        "description": "Descubra como ingressar no mercado de leilões com a E-Lance. Franquia, cursos e tecnologia para leiloeiros e investidores.",
        "url": `${siteUrl}/lp-e-lance`
    };

    return (
        <Helmet>
            <title>{siteTitle}</title>
            <meta name="description" content="Descubra como ingressar no mercado de leilões com a E-Lance. Franquia, cursos e tecnologia para leiloeiros e investidores. Cadastre-se agora." />

            {/* Open Graph / Facebook */}
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content="A oportunidade definitiva para entrar no mercado de leilões com a metodologia E-Lance." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={`${siteUrl}/lp-e-lance`} />
            <meta property="og:image" content={featuredImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content="A oportunidade definitiva para entrar no mercado de leilões com a metodologia E-Lance." />
            <meta name="twitter:image" content={featuredImage} />

            {/* Structured Data Scripts */}
            <script type="application/ld+json">
                {JSON.stringify(organizationSchema)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(courseSchema)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(franchiseSchema)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(webPageSchema)}
            </script>
        </Helmet>
    );
};

export default LpSEO;
