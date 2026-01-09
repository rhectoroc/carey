"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
    es: {
        "home.welcome": "Bienvenido a Carey",
        "home.subtitle": "Turismo de lujo en Venezuela",
        "nav.home": "Inicio",
        "nav.about": "Nosotros",
        "nav.destinations": "Destinos",
        "nav.contact": "Contacto",
        "chat.hello": "Hola, ¿en qué puedo ayudarte hoy?",
    },
    en: {
        "home.welcome": "Welcome to Carey",
        "home.subtitle": "Luxury tourism in Venezuela",
        "nav.home": "Home",
        "nav.about": "About Us",
        "nav.destinations": "Destinations",
        "nav.contact": "Contact",
        "chat.hello": "Hello, how can I help you today?",
    }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('es');

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
