import type { Metadata } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import { ChatbotProvider } from "@/context/ChatbotContext";
import Chatbot from "@/components/Chatbot/Chatbot";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://viajes-carey.com";

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: "Carey Tour & Travel | Turismo de Lujo en Venezuela",
        template: "%s | Carey Tour & Travel"
    },
    description: "Descubre Venezuela con estilo. Experiencias exclusivas en Los Roques, Canaima y Margarita. Asesoría integral para viajes de lujo y aventuras inolvidables.",
    keywords: ["turismo venezuela", "los roques", "canaima", "margarita", "viajes de lujo", "agencia de viajes", "carey tour", "paquetes turisticos venezuela"],
    authors: [{ name: "Carey Tour & Travel" }],
    creator: "Carey Tour & Travel",
    publisher: "Carey Tour & Travel",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "Carey Tour & Travel | Turismo de Lujo en Venezuela",
        description: "Descubre Venezuela con estilo. Experiencias exclusivas en Los Roques, Canaima y Margarita. Asesoría integral para viajes de lujo.",
        url: baseUrl,
        siteName: "Carey Tour & Travel",
        images: [
            {
                url: "/LogoCarey01.png",
                width: 1200,
                height: 630,
                alt: "Carey Tour & Travel Logo",
            },
        ],
        locale: "es_VE",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Carey Tour & Travel | Turismo de Lujo en Venezuela",
        description: "Descubre Venezuela con estilo. Experiencias exclusivas en Los Roques, Canaima y Margarita.",
        images: ["/LogoCarey01.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "TravelAgency",
                            "name": "Carey Tour & Travel",
                            "url": baseUrl,
                            "logo": `${baseUrl}/LogoCarey01.png`,
                            "description": "Turismo de lujo en Venezuela. Los Roques, Canaima y más.",
                            "address": {
                                "@type": "PostalAddress",
                                "addressCountry": "VE"
                            },
                            "sameAs": [
                                "https://www.instagram.com/careytour",
                                // Add other social media links here
                            ]
                        })
                    }}
                />
            </head>
            <body>
                <LanguageProvider>
                    <ChatbotProvider>
                        {children}
                        <Chatbot />
                    </ChatbotProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
