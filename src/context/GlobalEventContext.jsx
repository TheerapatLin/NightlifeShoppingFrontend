import React, { createContext, useContext, useState, useEffect } from 'react';

export const GlobalEventContext = createContext();

export const GlobalEventProvider = ({ children }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const [currentPage, setCurrentPage] = useState({
        name: 'defaultPageName',
        index: 0,
    });

    useEffect(() => { 
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize, { passive: true });
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const currentPath = window.location.pathname;
        const cleanedPath = currentPath.startsWith('/') ? currentPath.slice(1) : currentPath;
        setCurrentPage({
            name: cleanedPath,
            index: 0,
        });
    }, []);

    const updateCurrentPage = (name, index) => {
        setCurrentPage({ name, index });
    };
    
    return (
        <GlobalEventContext.Provider value={{ isScrolled, windowSize, currentPage, updateCurrentPage }}>
            {children}
        </GlobalEventContext.Provider>
    );
};

export const useGlobalEvent = () => useContext(GlobalEventContext);

export default GlobalEventProvider;