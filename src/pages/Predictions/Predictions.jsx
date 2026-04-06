import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MatchCard from '../../components/MatchCard/MatchCard';
import AnimatedCounter from '../../components/AnimatedCounter/AnimatedCounter';
import { useWorldCupMatches } from '../../hooks/useWorldCupMatches';
import styles from './Predictions.module.css';

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function Predictions() {
  const { matches, loading, error } = useWorldCupMatches();
  const [activeGroup, setActiveGroup] = useState('Todos');
  
  // Persistencia local para los pronósticos
  const [predictions, setPredictions] = useState(() => {
    const saved = localStorage.getItem('aibanks_preds');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('aibanks_preds', JSON.stringify(predictions));
  }, [predictions]);

  // Clasificamos partidos según estado de predicción
  const predictedMatches = matches.filter(m => predictions[m.id]);
  const pendingMatches = matches.filter(m => !predictions[m.id]);

  // Calcular grupos disponibles solo de los pendientes, y agregar tab Pronosticados
  const dynamicGroups = ['Todos', ...new Set(pendingMatches.map(m => m.group).filter(Boolean))].sort();
  dynamicGroups.push('Pronosticados');

  const filtered =
    activeGroup === 'Pronosticados' 
      ? predictedMatches 
      : activeGroup === 'Todos'
        ? pendingMatches
        : pendingMatches.filter((m) => m.group === activeGroup);

  const handlePredict = (matchId, choice) => {
    setPredictions((prev) => ({ ...prev, [matchId]: choice }));
  };

  // Puntos apostados asegurados
  const ptsEnJuego = predictedMatches.reduce((acc, m) => acc + m.points, 0);

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className={styles.title}>🎯 Predicciones</h2>
        <p className={styles.subtitle}>Elige el ganador y acumula puntos</p>
      </motion.div>

      {/* Group Filter Tabs with animated indicator */}
      <div className={styles.filters}>
        {dynamicGroups.map((g) => (
          <motion.button
            key={g}
            className={`${styles.filterBtn} ${activeGroup === g ? styles.filterActive : ''}`}
            onClick={() => setActiveGroup(g)}
            whileTap={{ scale: 0.93 }}
            style={{ position: 'relative' }}
          >
            {g === 'Todos' ? '🌎 Todos' : g === 'Pronosticados' ? '✅ Pronosticados' : (g.length === 1 ? `Grupo ${g}` : g)}
            {activeGroup === g && (
              <motion.div
                className={styles.filterIndicator}
                layoutId="filterIndicator"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
          Cargando partidos de la FIFA... ⚽
        </div>
      )}
      {error && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#ff4444' }}>
          Error al cargar: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats Bar with animated values */}
      <motion.div
        className={styles.statsBar}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className={styles.stat}>
          <motion.span
            className={styles.statValue}
            key={predictedMatches.length}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
          >
            {predictedMatches.length}
          </motion.span>
          <span className={styles.statLabel}>Predicciones</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <AnimatedCounter value={pendingMatches.length} className={styles.statValue} />
          <span className={styles.statLabel}>Restantes</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <AnimatedCounter value={ptsEnJuego} className={styles.statValueGold} />
          <span className={styles.statLabel}>Pts en Juego</span>
        </div>
      </motion.div>

      {/* Match List - staggered */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGroup}
          className={styles.matchList}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -10 }}
        >
          {filtered.map((match) => (
            <motion.div key={match.id} variants={staggerItem}>
              <MatchCard
                match={match}
                onPredict={handlePredict}
                predictedChoice={predictions[match.id]}
              />
            </motion.div>
          ))}
        </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
