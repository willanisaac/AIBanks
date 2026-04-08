import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PaperPlaneRight, Receipt, CreditCard, Bank, CaretRight, X, Trophy } from '@phosphor-icons/react';
import Confetti from 'react-confetti';
import { USER_PROFILE } from '../../data/mockData';
import { useMAIis } from '../../hooks/useMAIis';
import styles from './Home.module.css';

function TransactionModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !account) return;
    
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess(250); // Misión paga 250 mAIis
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={styles.modalOverlay}>
        <motion.div 
          className={styles.modalContent}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
          <h2 className={styles.modalTitle}>Nueva Transferencia</h2>
          <p className={styles.modalDesc}>Transfiere a otras cuentas desde tu App AIBank.</p>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Cuenta Destino</label>
              <input 
                type="text" 
                placeholder="Ej. 2200334455" 
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Monto ($)</label>
              <input 
                type="number" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isProcessing}
                min="0.01"
                step="0.01"
              />
            </div>
            <button 
              type="submit" 
              className={styles.submitBtn} 
              disabled={isProcessing || !amount || !account}
            >
              {isProcessing ? 'Procesando...' : 'Transferir'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { currentMAIis, addBankMAIis } = useMAIis();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleTransactionSuccess = (earnedPts) => {
    setIsModalOpen(false);
    addBankMAIis(earnedPts);
    setSuccessMessage(`¡Transferencia Exitosa! Has ganado +${earnedPts} mAIis`);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      setSuccessMessage('');
    }, 5000);
  };

  return (
    <div className={styles.dashboardContainer}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      
      {/* Saludo y Resumen */}
      <header className={styles.header}>
        <h1 className={styles.greeting}>Mis Finanzas</h1>
        <p className={styles.subtitle}>AIBank Móvil</p>
      </header>

      {/* Cuentas y Tarjetas */}
      <section className={styles.accountsSection}>
        <motion.div 
          className={styles.accountCard}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className={styles.cardHeader}>
            <span className={styles.accountType}>Cuenta de Ahorros</span>
            <span className={styles.accountNumber}>**** 8901</span>
          </div>
          <div className={styles.cardBalance}>
            <span className={styles.currency}>$</span>
            <span className={styles.amount}>4,250</span>
            <span className={styles.decimals}>.00</span>
          </div>
        </motion.div>

        <motion.div 
          className={`${styles.accountCard} ${styles.creditCard}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.cardHeader}>
            <span className={styles.accountType}>Tarjeta de Crédito</span>
            <span className={styles.accountNumber}>**** 4567</span>
          </div>
          <div className={styles.cardBalance}>
            <span className={styles.label}>Cupo Disponible</span>
            <div>
              <span className={styles.currency}>$</span>
              <span className={styles.amount}>1,850</span>
              <span className={styles.decimals}>.50</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Banner Temporada Mundial */}
      <motion.section 
        className={styles.seasonBanner}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate('/season')}
        whileTap={{ scale: 0.98 }}
      >
        <div className={styles.bannerContent}>
          <div className={styles.bannerTitles}>
            <span className={styles.seasonTag}>MÓDULO DE RECOMPENSAS</span>
            <h3 className={styles.bannerTitle}>Temporada Mundial 2026</h3>
            <p className={styles.bannerDesc}>Tienes <strong>{currentMAIis} mAIis</strong>. ¡Úsalos para predecir y ganar premios!</p>
          </div>
          <div className={styles.bannerIcon}>
            <Trophy size={32} weight="fill" />
            <CaretRight size={20} weight="bold" />
          </div>
        </div>
      </motion.section>

      {successMessage && (
        <motion.div 
          className={styles.alertSuccess}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {successMessage}
        </motion.div>
      )}

      {/* Acciones Rápidas */}
      <section className={styles.quickActionsSection}>
        <h3 className={styles.sectionTitle}>Acciones Rápidas</h3>
        <div className={styles.actionsGrid}>
          <button className={styles.actionBtn} onClick={() => setIsModalOpen(true)}>
            <div className={styles.actionIconWrapper} style={{ background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}>
              <PaperPlaneRight size={24} weight="fill" />
            </div>
            <span>Transferir</span>
          </button>
          <button className={styles.actionBtn}>
            <div className={styles.actionIconWrapper} style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
              <Receipt size={24} weight="fill" />
            </div>
            <span>Pagar Servicios</span>
          </button>
          <button className={styles.actionBtn}>
            <div className={styles.actionIconWrapper} style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48' }}>
              <CreditCard size={24} weight="fill" />
            </div>
            <span>Pagar Tarjeta</span>
          </button>
          <button className={styles.actionBtn}>
            <div className={styles.actionIconWrapper} style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
              <Bank size={24} weight="fill" />
            </div>
            <span>Mi Banco</span>
          </button>
        </div>
      </section>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleTransactionSuccess} 
      />
    </div>
  );
}
