import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Robot, PaperPlaneTilt, X, ChatCircleText } from '@phosphor-icons/react';
import { getChatResponse } from '../../services/gemini';
import './ChatBotFlotante.css';

export default function ChatBotFlotante() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', parts: [{ text: '¡Hola! Soy AI-AGENT, tu asistente inteligente. ¿En qué puedo ayudarte hoy?' }] }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Preparamos el historial para Gemini
      const history = messages.concat(userMessage);
      const responseText = await getChatResponse(history);
      
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
    } catch (error) {
      console.error('Error in ChatBot:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: 'Ups, parece que tengo un problema de conexión. Inténtalo de nuevo más tarde.' }] 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="chatbot-container"
      drag
      dragConstraints={{ left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 160, bottom: 0 }}
      dragElastic={0.1}
      dragMomentum={false}
      style={{ touchAction: 'none' }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chatbot-window"
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onPointerDown={(e) => e.stopPropagation()} // Evita que el drag se active al usar el chat
          >
            <div className="chatbot-header">
              <div className="robot-avatar">
                <img src="/ai-agent.png" alt="AI-Agent" className="avatar-img" />
              </div>
              <div className="chatbot-info">
                <h3>AI-AGENT</h3>
                <div className="chatbot-status">
                  <span className="status-dot"></span>
                  En línea
                </div>
              </div>
              <button 
                className="close-button" 
                onClick={() => setIsOpen(false)}
                style={{ marginLeft: 'auto', background: 'none', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="chatbot-messages" onPointerDown={(e) => e.stopPropagation()}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}>
                  {msg.parts[0].text}
                </div>
              ))}
              {isLoading && (
                <div className="message bot">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chatbot-input-area" onSubmit={handleSend} onPointerDown={(e) => e.stopPropagation()}>
              <input 
                type="text" 
                placeholder="Escribe un mensaje..." 
                className="chatbot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                type="submit" 
                className="send-button"
                disabled={!input.trim() || isLoading}
              >
                <PaperPlaneTilt weight="fill" size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            className="chatbot-tooltip"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: 1 }}
          >
            ¡Hola! 
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        className="chatbot-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X weight="bold" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="button-icon-wrapper"
            >
              <img src="/ai-agent.png" alt="AI-Agent" className="button-img" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
