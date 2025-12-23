import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadCaptureModal from '../components/LeadCaptureModal';

const PublicLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (pageId: string) => {
        switch (pageId) {
            case 'home':
                navigate('/');
                break;
            case 'franchise':
                navigate('/franchise');
                break;
            case 'franchise-broker':
                navigate('/franchise-broker');
                break;
            case 'contact':
                navigate('/contact');
                break;
            case 'consultoria':
                navigate('/consultoria');
                break;
            case 'escola':
                navigate('/escola');
                break;
            case 'escola-leiloeiros':
                navigate('/escola-leiloeiros');
                break;
            case 'curso-imoveis':
                navigate('/curso-imoveis');
                break;
            case 'downloads':
                navigate('/downloads');
                break;
            case 'curso-advogados':
                navigate('/curso-advogados');
                break;
            case 'mentoria':
                navigate('/mentoria');
                break;
            case 'ecossistema':
                navigate('/ecossistema');
                break;
            case 'indique':
                navigate('/indique');
                break;
            case 'bid-invest':
                navigate('/bid-invest');
                break;
            case 'portal':
                // Portal might be an external link or a specific route.
                // For now, let's assume it shares the 'portal' route or handled differently.
                // Spec says "Portal de Leilões" -> link "portal".
                // Current App.tsx doesn't have a 'portal' page, so it might be a future implementation or missing.
                // Checking existing App.tsx, there IS NO 'portal' case.
                // But NAV_ITEMS has 'portal' with href='#portal'.
                // If it's an anchor on home or a page? 
                // Let's navigate to /portal for now if we create it, or stay.
                navigate('/portal');
                break;
            default:
                // Check if it looks like an ID for the home page (e.g. 'about', 'services')
                if (['about', 'services'].includes(pageId)) {
                    navigate(`/#${pageId}`);
                } else {
                    navigate(`/${pageId}`);
                }
                break;
        }
        window.scrollTo(0, 0);
    };

    return (
        <div className="min-h-screen bg-[#eff0f1] font-sans text-[#151d38]">
            <Navbar onNavigate={handleNavigate} />
            <main>
                {/* We pass handleNavigate to Outlet context if needed by children, 
            but mostly children just need to navigate. 
            However, components like Hero accept onNavigate prop. 
            We can clone element or use context. 
            For simplicity, since we are using React Router, children should ideally use useNavigate.
            But to avoid refactoring ALL components right now, we can pass it via context or pattern.
            Actually, <Outlet context={{ onNavigate: handleNavigate }} /> 
        */}
                <Outlet context={{ onNavigate: handleNavigate }} />
            </main>
            <Footer />
            <LeadCaptureModal />
        </div>
    );
};

export default PublicLayout;
