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
        "nav.home": "Inicio",
        "nav.about": "Nosotros",
        "nav.destinations": "Destinos",
        "nav.contact": "Contacto",
        "sections.promotions": "🔥 Ofertas y Promociones",
        "sections.promotionsSub": "Aprovecha nuestros descuentos exclusivos por tiempo limitado.",
        "hero.subtitle": "Servicios Turísticos Integrales",
        "search.hotels": "Hoteles",
        "search.tours": "Tours",
        "search.destination": "Destino",
        "search.placeholder": "¿A dónde quieres ir?",
        "search.guests": "Huéspedes",
        "search.people": "Personas",
        "search.adults": "Adultos",
        "search.children": "Niños",
        "search.infants": "Infantes",
        "search.pets": "Mascotas",
        "search.button": "Buscar",
        "sections.popular": "Destinos Populares",
        "sections.popularSub": "Explora los lugares más increíbles de Venezuela.",
        "sections.hotels": "Hoteles Exclusivos",
        "sections.hotelsSub": "Hospédate en los mejores hoteles y posadas del país.",
        "sections.tours": "Tours & Aventuras",
        "sections.toursSub": "Experiencias únicas diseñadas para ti.",
        "sections.transfers": "Traslados y Movilidad",
        "sections.transfersSub": "Viaja cómodo y seguro a tu destino.",
        "home.moments": "Momentos Inolvidables",
        "home.loadingMoments": "Cargando momentos increíbles...",
        "catalog.offer": "Oferta",
        "catalog.featured": "Destacado",
        "catalog.from": "desde",
        "catalog.consult": "Consultar tarifa",
        "catalog.noImage": "Sin imagen disponible",
        "modal.details": "Tarifas detalladas",
        "modal.adults": "Adultos",
        "modal.children": "Niños",
        "modal.infants": "Infantes",
        "modal.validUntil": "Tarifas vigentes hasta el",
        "modal.includes": "¿Qué incluye?",
        "modal.bookNow": "Reservar Ahora",
        "modal.defaultDesc": "Disfruta de una experiencia única diseñada para brindarte los mejores momentos.",
        "planner.title": "Asesoría Integral de Viajes",
        "planner.subtitle": "Diseñamos tu viaje a la medida. Desde la logística hasta los pequeños detalles, deja que nuestros expertos se encarguen de todo.",
        "planner.step1Title": "Consulta Inicial",
        "planner.step1Text": "Cuéntanos tus sueños y presupuesto.",
        "planner.step2Title": "Diseño del Plan",
        "planner.step2Text": "Creamos un itinerario personalizado.",
        "planner.step3Title": "Reservas & Gestión",
        "planner.step3Text": "Nos encargamos de toda la logística.",
        "planner.contact": "Contáctanos",
        "footer.tagline": "Viajes exclusivos y experiencias inolvidables en Venezuela y el Caribe.",
        "footer.links": "Enlaces Rápidos",
        "footer.legal": "Legal",
        "footer.contact": "Contacto",
        "footer.terms": "Términos y Condiciones",
        "footer.privacy": "Política de Privacidad",
        "chat.hello": "Hola, ¿en qué puedo ayudarte hoy?",
    },
    en: {
        "nav.home": "Home",
        "nav.about": "About Us",
        "nav.destinations": "Destinations",
        "nav.contact": "Contact",
        "sections.promotions": "🔥 Offers & Promotions",
        "sections.promotionsSub": "Take advantage of our exclusive limited-time discounts.",
        "hero.subtitle": "Comprehensive Travel Services",
        "search.hotels": "Hotels",
        "search.tours": "Tours",
        "search.destination": "Destination",
        "search.placeholder": "Where do you want to go?",
        "search.guests": "Guests",
        "search.people": "People",
        "search.adults": "Adults",
        "search.children": "Children",
        "search.infants": "Infants",
        "search.pets": "Pets",
        "search.button": "Search",
        "sections.popular": "Popular Destinations",
        "sections.popularSub": "Explore the most incredible places in Venezuela.",
        "sections.hotels": "Exclusive Hotels",
        "sections.hotelsSub": "Stay in the best hotels and posadas in the country.",
        "sections.tours": "Tours & Adventures",
        "sections.toursSub": "Unique experiences designed for you.",
        "sections.transfers": "Transfers & Mobility",
        "sections.transfersSub": "Travel comfortably and safely to your destination.",
        "home.moments": "Unforgettable Moments",
        "home.loadingMoments": "Loading incredible moments...",
        "catalog.offer": "Offer",
        "catalog.featured": "Featured",
        "catalog.from": "from",
        "catalog.consult": "Consult rate",
        "catalog.noImage": "No image available",
        "modal.details": "Detailed Rates",
        "modal.adults": "Adults",
        "modal.children": "Children",
        "modal.infants": "Infants",
        "modal.validUntil": "Rates valid until",
        "modal.includes": "What's included?",
        "modal.bookNow": "Book Now",
        "modal.defaultDesc": "Enjoy a unique experience designed to give you the best moments.",
        "planner.title": "Comprehensive Travel Consulting",
        "planner.subtitle": "We design your tailor-made trip. From logistics to small details, let our experts take care of everything.",
        "planner.step1Title": "Initial Consultation",
        "planner.step1Text": "Tell us your dreams and budget.",
        "planner.step2Title": "Plan Design",
        "planner.step2Text": "We create a personalized itinerary.",
        "planner.step3Title": "Bookings & Management",
        "planner.step3Text": "We take care of all the logistics.",
        "planner.contact": "Contact Us",
        "footer.tagline": "Exclusive travels and unforgettable experiences in Venezuela and the Caribbean.",
        "footer.links": "Quick Links",
        "footer.legal": "Legal",
        "footer.contact": "Contact",
        "footer.terms": "Terms & Conditions",
        "footer.privacy": "Privacy Policy",
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
