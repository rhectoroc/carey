"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatbotContextType {
    isOpen: boolean;
    openChatbot: (message?: string) => void;
    closeChatbot: () => void;
    predefinedMessage: string | null;
    clearPredefinedMessage: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [predefinedMessage, setPredefinedMessage] = useState<string | null>(null);

    const openChatbot = (message?: string) => {
        if (message) {
            setPredefinedMessage(message);
        }
        setIsOpen(true);
    };

    const closeChatbot = () => {
        setIsOpen(false);
    };

    const clearPredefinedMessage = () => {
        setPredefinedMessage(null);
    };

    return (
        <ChatbotContext.Provider value={{ isOpen, openChatbot, closeChatbot, predefinedMessage, clearPredefinedMessage }}>
            {children}
        </ChatbotContext.Provider>
    );
}

export function useChatbot() {
    const context = useContext(ChatbotContext);
    if (!context) {
        throw new Error('useChatbot must be used within ChatbotProvider');
    }
    return context;
}
