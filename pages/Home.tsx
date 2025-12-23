import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import LawyerCta from '../components/LawyerCta';
import { useLocation, useOutletContext } from 'react-router-dom';

const Home: React.FC = () => {
    const location = useLocation();
    const { onNavigate } = useOutletContext<{ onNavigate: (pageId: string) => void }>();

    useEffect(() => {
        if (location.hash) {
            const element = document.querySelector(location.hash);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location]);

    return (
        <>
            <Hero onNavigate={onNavigate} />
            <div id="about">
                <About />
            </div>
            <div id="services">
                <Services onNavigate={onNavigate} />
            </div>
            <LawyerCta onNavigate={onNavigate} />
        </>
    );
};

export default Home;
