import type { Metadata } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import { ChatbotProvider } from "@/context/ChatbotContext";
import Chatbot from "@/components/Chatbot/Chatbot";
import "./globals.css";

export const metadata: Metadata = {
    title: "Carey Tour & Travel | Turismo de Lujo en Venezuela",
    description: "Descubre Venezuela con estilo. Experiencias exclusivas en Los Roques, Canaima y Margarita. Asesoría integral para viajes de lujo.",
    keywords: ["turismo venezuela", "los roques", "canaima", "margarita", "viajes de lujo", "agencia de viajes", "carey tour"],
    openGraph: {
        title: "Carey Tour & Travel | Turismo de Lujo en Venezuela",
        description: "Descubre Venezuela con estilo. Experiencias exclusivas en Los Roques, Canaima y Margarita.",
        url: "https://careytour.com",
        siteName: "Carey Tour & Travel",
        images: [
            {
                url: "/LogoCarey01.png",
                width: 800,
                height: 600,
            },
        ],
        locale: "es_VE",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
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
