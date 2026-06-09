"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { useChatbot } from '@/context/ChatbotContext';
import { usePathname } from 'next/navigation';
import styles from './Chatbot.module.css';

export default function Chatbot() {
    const pathname = usePathname();
    const { isOpen, openChatbot, closeChatbot, predefinedMessage, clearPredefinedMessage } = useChatbot();

    // Do not show chatbot in admin routes
    if (pathname?.startsWith('/admin')) {
        return null;
    }
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
        { role: 'bot', text: '¡Hola! Soy Carey, tu asistente virtual. ¿En qué puedo ayudarte?' }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
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
        setIsThinking(true);

        try {
            const response = await fetch('https://adrielssystems-n8n-new.1m85g5.easypanel.host/webhook/c190dcf0-ee0b-47bc-800f-954b7511c582/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'sendMessage',
                    chatInput: text,
                    sessionId: 'carey-session-' + (pathname || 'home').replace(/\//g, '-')
                })
            });

            const data = await response.json();
            // n8n Chat node usually returns answer in 'output' or 'text'
            const botText = data.output || data.text || data.response || 'Lo siento, hubo un problema al procesar tu solicitud.';

            setMessages(prev => [...prev, { role: 'bot', text: botText }]);
        } catch (error) {
            console.error('Chatbot Error:', error);
            setMessages(prev => [...prev, { role: 'bot', text: 'Lo siento, perdimos la conexión con mi servidor central. Por favor intenta más tarde.' }]);
        } finally {
            setIsThinking(false);
        }
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
                {isOpen ? <X size={24} /> : (
                    <div className={styles.fabAvatarWrapper}>
                        <img src="/images/carey-avatar.png" alt="Carey" className={styles.fabAvatar} />
                    </div>
                )}
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
                            <div className={styles.avatarWrapper}>
                                <img src="/images/carey-avatar.png" alt="Carey" className={styles.avatar} />
                            </div>
                            <h3>Carey Assistant</h3>
                            <button onClick={closeChatbot} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.messages}>
                            {messages.map((m, i) => (
                                <div key={i} className={`${styles.message} ${m.role === 'user' ? styles.user : styles.bot}`}>
                                    {m.text}
                                </div>
                            ))}
                            {isThinking && (
                                <div className={`${styles.message} ${styles.bot} ${styles.thinking}`}>
                                    <span className={styles.dot}>.</span>
                                    <span className={styles.dot}>.</span>
                                    <span className={styles.dot}>.</span>
                                </div>
                            )}
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
