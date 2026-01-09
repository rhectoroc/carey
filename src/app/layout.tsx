import type { Metadata } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import { ChatbotProvider } from "@/context/ChatbotContext";
import Chatbot from "@/components/Chatbot/Chatbot";
import "./globals.css";

export const metadata: Metadata = {
    title: "Carey Tour & Travel",
    description: "Turismo de Lujo en Venezuela",
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
