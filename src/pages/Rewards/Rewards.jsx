import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Coin, Check, Gift, Star, CurrencyDollar, TShirt, FilmSlate, Buildings } from '@phosphor-icons/react';
import FlipCard from '../../components/FlipCard/FlipCard';
import RippleButton from '../../components/RippleButton/RippleButton';
import FireworksBackground from '../../components/FireworksBackground/FireworksBackground';
import AnimatedCounter from '../../components/AnimatedCounter/AnimatedCounter';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { REWARDS_CATALOG, USER_PROFILE } from '../../data/mockData';
import styles from './Rewards.module.css';

const CATEGORIES = [
  { key: 'all', icon: Gift, label: 'Todos' },
  { key: 'cashback', icon: CurrencyDollar, label: 'Cashback' },
  { key: 'merchandise', icon: TShirt, label: 'Merch' },
  { key: 'entertainment', icon: FilmSlate, label: 'Entreteni.' },
  { key: 'experiences', icon: Buildings, label: 'Experiencias' },
];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 22 } },
};

export default function Rewards() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const archetype = localStorage.getItem('archetype') || 'moderado'; // Default to moderado
  const [activeCategory, setActiveCategory] = useState('all');
  const [redeemed, setRedeemed] = useState({});
  const [showFireworks, setShowFireworks] = useState(false);
  const [lastRedeemed, setLastRedeemed] = useState(null);

  const recommended = REWARDS_CATALOG.filter((r) => r.archetype === archetype).slice(0, 3);
  const filtered =
    activeCategory === 'all'
      ? REWARDS_CATALOG
      : REWARDS_CATALOG.filter((r) => r.category === activeCategory);

  const handleRedeem = (reward) => {
    if (USER_PROFILE.points < reward.cost || redeemed[reward.id]) return;
    setRedeemed((prev) => ({ ...prev, [reward.id]: true }));
    setLastRedeemed(reward);
    setShowFireworks(true);
    setTimeout(() => setShowFireworks(false), 3500);
  };

  return (
    <div className={styles.page}>
      {/* Fireworks Effect on Redeem! */}
      <AnimatePresence>
        {showFireworks && (
          <motion.div
            className={styles.fireworksOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FireworksBackground
              colors={theme === 'dark' ? ['#ffd700', '#ffaa00', '#00e676', '#d500f9', '#00b0ff'] : ['#b8960c', '#d4af37', '#28a745', '#6f42c1', '#007bff']}
              population={2}
              duration={3000}
            />
            {lastRedeemed && (
              <motion.div
                className={styles.redeemCelebration}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
              >
                <span className={styles.celebIcon}>{lastRedeemed.icon}</span>
                <span className={styles.celebText}>¡Canjeado!</span>
                <span className={styles.celebName}>{lastRedeemed.name}</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className={styles.title}><Gift size={24} /> Premios</h2>
      </motion.div>

      {/* Recommended Section */}
      <motion.section
        className={styles.recommended}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className={styles.sectionTitle}><Star size={18} /> Recomendados para ti</h3>
        <motion.div className={styles.recommendedGrid} variants={staggerContainer} initial="hidden" animate="show">
          {recommended.map((reward) => (
            <motion.div key={reward.id} variants={staggerItem}>
              <FlipCard
                front={
                  <div className={styles.rewardCard}>
                    <span className={styles.rewardIcon}>{reward.icon}</span>
                    <h4 className={styles.rewardName}>{reward.name}</h4>
                    <p className={styles.rewardDesc}>{reward.description}</p>
                    <div className={styles.rewardCost}>
                      <AnimatedCounter value={reward.cost} />
                      <span className={styles.pointsLabel}>pts</span>
                    </div>
                  </div>
                }
                back={
                  <div className={styles.rewardBack}>
                    <p>¿Canjear este premio?</p>
                    <RippleButton
                      onClick={() => handleRedeem(reward)}
                      disabled={USER_PROFILE.points < reward.cost || redeemed[reward.id]}
                      className={redeemed[reward.id] ? styles.redeemedBtn : ''}
                    >
                      {redeemed[reward.id] ? <>Canjeado <Check size={14} /></> : 'Canjear'}
                    </RippleButton>
                  </div>
                }
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Balance Card */}
      <motion.div
        className={styles.balance}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className={styles.balanceInfo}>
          <span className={styles.balanceLabel}>Tu saldo disponible</span>
          <div className={styles.balanceValue}>
            <Coin size={20} />
            <AnimatedCounter
              value={USER_PROFILE.points.toLocaleString()}
              className={styles.balanceNum}
            />
            <span className={styles.balanceCurrency}>pts</span>
          </div>
        </div>
        <motion.div
          className={styles.vipTag}
          whileTap={{ scale: 0.95 }}
          animate={{ boxShadow: ['0 0 0px rgba(255,215,0,0)', '0 0 12px rgba(255,215,0,0.3)', '0 0 0px rgba(255,215,0,0)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Crown size={16} />
          <span>{USER_PROFILE.tier}</span>
        </motion.div>
      </motion.div>

      {/* Categories */}
      <div className={styles.categories}>
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.key}
            className={`${styles.catBtn} ${activeCategory === cat.key ? styles.catActive : ''}`}
            onClick={() => setActiveCategory(cat.key)}
            whileTap={{ scale: 0.93 }}
            layout
          >
            <cat.icon size={16} /> {cat.label}
            {activeCategory === cat.key && (
              <motion.div
                className={styles.catIndicator}
                layoutId="catIndicator"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Rewards Grid with FlipCards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          className={styles.grid}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -10 }}
        >
          {filtered.map((reward) => {
            const canAfford = USER_PROFILE.points >= reward.cost;
            const isRedeemed = redeemed[reward.id];

            return (
              <motion.div key={reward.id} variants={staggerItem}>
                <FlipCard
                  front={
                    <div className={`${styles.rewardCard} ${isRedeemed ? styles.redeemed : ''}`}>
                      {reward.popular && !isRedeemed && (
                        <motion.div
                          className={styles.popularTag}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Star size={14} /> Popular
                        </motion.div>
                      )}
                      <motion.span
                        className={styles.rewardIcon}
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                      >
                        {reward.icon}
                      </motion.span>
                      <h4 className={styles.rewardName}>{reward.name}</h4>
                      <p className={styles.rewardDesc}>{reward.description}</p>
                      <div className={styles.rewardFooter}>
                        <div className={styles.rewardCost}>
                          <Coin size={16} />
                          <span className={styles.costValue}>{reward.cost.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className={styles.flipHint}>Toca para más</div>
                    </div>
                  }
                  back={
                    <div className={`${styles.rewardCard} ${styles.rewardCardBack}`}>
                      <span className={styles.rewardIcon}>{reward.icon}</span>
                      <h4 className={styles.rewardName}>{reward.name}</h4>
                      <div className={styles.rewardFooter} style={{ marginTop: 12 }}>
                        {isRedeemed ? (
                          <div className={styles.redeemedBadge}>✅ Canjeado</div>
                        ) : (
                          <RippleButton
                            variant={canAfford ? 'gold' : 'outline'}
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleRedeem(reward); }}
                            disabled={!canAfford}
                            fullWidth
                          >
                            {canAfford ? <><Coin size={14} /> Canjear Ahora</> : 'Puntos Insuficientes'}
                          </RippleButton>
                        )}
                      </div>
                    </div>
                  }
                />
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
