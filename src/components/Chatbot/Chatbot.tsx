"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { useChatbot } from '@/context/ChatbotContext';
import styles from './Chatbot.module.css';

export default function Chatbot() {
    const { isOpen, openChatbot, closeChatbot, predefinedMessage, clearPredefinedMessage } = useChatbot();
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
        { role: 'bot', text: '¡Hola! Soy Carey, tu asistente virtual. ¿En qué puedo ayudarte a planificar tu viaje?' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => {
        if (isOpen) {
            closeChatbot();
        } else {
            openChatbot();
        }
    };

    // Handle predefined message
    useEffect(() => {
        if (predefinedMessage && isOpen) {
            setInput(predefinedMessage);
            clearPredefinedMessage();
            // Auto-send the predefined message
            setTimeout(() => {
                sendMessageWithText(predefinedMessage);
            }, 300);
        }
    }, [predefinedMessage, isOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessageWithText = async (text: string) => {
        if (!text.trim()) return;

        setMessages(prev => [...prev, { role: 'user', text }]);
        setInput('');

        // Placeholder for n8n webhook integration
        // const response = await fetch('YOUR_N8N_WEBHOOK_URL', { method: 'POST', body: JSON.stringify({ message: text }) });

        // Simulating response
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'bot', text: 'Gracias por tu mensaje. Estoy procesando tu solicitud con el equipo de Carey.' }]);
        }, 1000);
    };

    const sendMessage = () => sendMessageWithText(input);

    return (
        <>
            <motion.button
                className={styles.fab}
                onClick={toggleChat}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.chatWindow}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    >
                        <div className={styles.header}>
                            <h3>Carey Assistant</h3>
                        </div>
                        <div className={styles.messages}>
                            {messages.map((m, i) => (
                                <div key={i} className={`${styles.message} ${m.role === 'user' ? styles.user : styles.bot}`}>
                                    {m.text}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className={styles.inputArea}>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Escribe tu mensaje..."
                            />
                            <button onClick={sendMessage}><Send size={18} /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
