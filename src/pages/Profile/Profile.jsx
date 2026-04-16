import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import {
  SignOut,
  Info,
  CaretRight,
  CaretLeft,
  Sun,
  Crown,
  Fire,
  Coin,
  X,
  Envelope,
  Globe,
  Code,
  Heart,
  Translate,
  Check,
  Copy,
  Gift,
  UsersThree,
  Question,
} from '@phosphor-icons/react';
import AnimatedCounter from '../../components/AnimatedCounter/AnimatedCounter';
import FlipCard from '../../components/FlipCard/FlipCard';
import StarsBackground from '../../components/StarsBackground/StarsBackground';
import { LEADERBOARD_DATA, USER_PROFILE, UPCOMING_MATCHES } from '../../data/mockData';
import { useAuth } from '../../context/AuthContextBase';
import { useTheme } from '../../context/ThemeContextBase';
import { useWorldCupMatches } from '../../hooks/useWorldCupMatches';
import { useTier } from '../../hooks/useTier';
import { useMAIis } from '../../hooks/useMAIis';
import { useTranslation } from '../../i18n';
import { applyReferralCode } from '../../services/referral';
import { useTour } from '../../context/TourContextBase';
import styles from './Profile.module.css';

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } },
};

const LANGUAGE_OPTIONS = [
  { code: 'es', flag: '🇪🇸' },
  { code: 'en', flag: '🇺🇸' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, refreshProfile } = useAuth();
  const { startTour } = useTour();
  const { theme, toggleTheme } = useTheme();
  const { matches } = useWorldCupMatches();
  const tier = useTier();
  const { currentMAIis, predictions, addBankMAIis } = useMAIis();
  const { t, language, setLanguage } = useTranslation();
  const archetype = localStorage.getItem('archetype') || 'practico';
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralInput, setReferralInput] = useState('');
  const [referralStatus, setReferralStatus] = useState('idle'); // idle | loading | success | error
  const [referralMsg, setReferralMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const allMatches = matches?.length ? matches : UPCOMING_MATCHES;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const predictionHistory = Object.entries(predictions).map(([matchId, choice]) => {
    const match = allMatches.find((m) => String(m.id) === String(matchId));
    return match ? { ...match, prediction: choice } : null;
  }).filter(Boolean);

  const currentPredictionsCount = USER_PROFILE.totalPredictions + predictionHistory.length;
  const currentRank = 1 + LEADERBOARD_DATA.filter((player) => player.points > currentMAIis).length;
  const recentProfileActivity = predictionHistory.length > 0 ? predictionHistory.slice(0, 4) : USER_PROFILE.recentActivity;

  const accuracy = USER_PROFILE.winRate;
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (accuracy / 100) * circumference;

  const currentLangOption = LANGUAGE_OPTIONS.find(l => l.code === language) || LANGUAGE_OPTIONS[0];

  const handleCopy = async () => {
    if (!user?.referral_code) return;
    try {
      await navigator.clipboard.writeText(user.referral_code);
    } catch {
      const el = document.createElement('textarea');
      el.value = user.referral_code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyReferral = async () => {
    const inputClean = referralInput.trim().toUpperCase();
    if (!inputClean || !user?.id || referralStatus === 'loading') return;
    setReferralStatus('loading');
    setReferralMsg('');

    // MODO PRUEBA: Permite ingresar el código "AIBANKS" infinitas veces para sumar puntos localmente
    if (inputClean === 'AIBANKS') {
      setTimeout(() => {
        addBankMAIis(100);
        setReferralStatus('success');
      }, 700);
      return;
    }

    try {
      await applyReferralCode(inputClean, user.id);
      await refreshProfile(); // Esto trae los +100 puntos desde Supabase directo
      setReferralStatus('success');
    } catch (err) {
      const code = err.message;
      const msgMap = {
        ALREADY_USED: t('profile.referral.errorAlreadyUsed'),
        OWN_CODE: t('profile.referral.errorOwnCode'),
        NOT_FOUND: t('profile.referral.errorNotFound'),
        UPDATE_ERROR: t('profile.referral.errorGeneral'),
      };
      setReferralMsg(msgMap[code] || t('profile.referral.errorGeneral'));
      setReferralStatus('error');
    }
  };



  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px'
            }}
          >
            <CaretLeft size={26} weight="bold" />
          </button>
          <h2 className={styles.title} style={{ marginBottom: 0 }}>{t('profile.title')}</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>{t('profile.subtitle')}</p>
      </motion.div>

      {/* Profile Card with Stars */}
      <motion.div
        className={styles.profileCard}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
      >
        <StarsBackground count={20} />
        <div className={styles.profileContent}>
          <motion.div
            className={styles.avatarWrap}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          >
            <span className={styles.avatar}>{USER_PROFILE.avatar}</span>
            <motion.span
              className={styles.tierBadge}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Crown size={20} weight="bold" />
            </motion.span>
          </motion.div>
          <div className={styles.profileInfo}>
            <h3 className={styles.name}>{user?.name || USER_PROFILE.name}</h3>
            <motion.span
              className={styles.tier}
              animate={{ boxShadow: ['0 0 0 rgba(255,215,0,0)', '0 0 12px rgba(255,215,0,0.3)', '0 0 0 rgba(255,215,0,0)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {tier}
            </motion.span>
          </div>
          <div className={`${styles.pointsBig} tour-step-profile-pts`}>
            <Coin size={24} weight="bold" />
            <AnimatedCounter
              value={currentMAIis.toLocaleString()}
              className={styles.pointsNum}
            />
            <span className={styles.ptsCurrency}>{t('common.mAIles')}</span>
          </div>
        </div>
      </motion.div>

      {/* Referral Code Card */}
      {user?.referral_code && (
        <motion.section
          className={`${styles.section} tour-step-profile-referral`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <h3 className={styles.sectionTitle}>{t('profile.referral.sectionTitle')}</h3>
          <div className={styles.referralCard}>
            <div className={styles.referralTop}>
              <div className={styles.referralTextGroup}>
                <p className={styles.referralSubtitle}>{t('profile.referral.subtitle')}</p>
                <p className={styles.referralRewardHint}>
                  +280 mAIles {t('profile.referral.rewardOwnerSuffix')}
                </p>
              </div>
              <UsersThree size={26} weight="fill" className={styles.referralIcon} />
            </div>
            <div className={styles.referralCodeRow}>
              <span className={styles.referralCode}>{user.referral_code}</span>
              <motion.button
                className={`${styles.referralCopyBtn} ${copied ? styles.referralCopied : ''}`}
                onClick={handleCopy}
                whileTap={{ scale: 0.85 }}
              >
                {copied
                  ? <Check size={14} weight="bold" />
                  : <Copy size={14} weight="bold" />}
                <span>{copied ? t('profile.referral.copied') : t('profile.referral.copyBtn')}</span>
              </motion.button>
            </div>
            {referralStatus === 'success' ? (
              <>
                <Confetti
                  width={window.innerWidth}
                  height={window.innerHeight}
                  recycle={false}
                  numberOfPieces={400}
                  gravity={0.12}
                  style={{ position: 'fixed', top: 0, left: 0, zIndex: 99999, pointerEvents: 'none' }}
                />
                <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ marginTop: '16px', padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(34, 197, 94, 0.2)' }}
              >
                <span style={{ fontSize: '2rem' }}>🎉</span>
                <p style={{ color: '#22c55e', fontWeight: 'bold', margin: '8px 0 4px' }}>{t('profile.referral.successTitle')}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>{t('profile.referral.successDesc', { points: 100 })}</p>
                <motion.button
                  onClick={() => {
                    setReferralStatus('idle');
                    setReferralInput('');
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{ background: 'var(--gold-primary)', color: 'var(--bg-primary)', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
                >
                  {t('profile.referral.enterAnotherCode') || 'Ingresar otro código'}
                </motion.button>
              </motion.div>
              </>
            ) : (
              <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,215,0,0.1)', paddingTop: '16px' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {t('profile.referral.modalSubtitle')}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className={`${styles.referralInput} ${referralStatus === 'error' ? styles.referralInputError : ''}`}
                    type="text"
                    placeholder={t('profile.referral.inputPlaceholder')}
                    value={referralInput}
                    onChange={(e) => {
                      setReferralInput(e.target.value.toUpperCase());
                      if (referralStatus === 'error') setReferralStatus('idle');
                    }}
                    maxLength={8}
                    disabled={referralStatus === 'loading'}
                    autoComplete="off"
                    autoCapitalize="characters"
                    style={{ flex: 1, padding: '12px 14px', fontSize: '0.95rem' }}
                  />
                  <motion.button
                    className={styles.referralApplyBtn}
                    onClick={handleApplyReferral}
                    disabled={!referralInput.trim() || referralStatus === 'loading'}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '0 16px', width: 'auto', borderRadius: '12px' }}
                  >
                    {referralStatus === 'loading' ? '⏳' : t('profile.referral.applyBtn')}
                  </motion.button>
                </div>
                <AnimatePresence>
                  {referralStatus === 'error' && referralMsg && (
                    <motion.p
                      className={styles.referralError}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ marginTop: '12px', fontSize: '0.75rem', color: '#f87171' }}
                    >
                      ⚠️ {referralMsg}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* Stats Grid */}
      <motion.div
        className={styles.statsGrid}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Precision & Totals */}
        <motion.div variants={staggerItem}>
          <div className={styles.statCard}>
            <div className={styles.ringWrap}>
              <svg viewBox="0 0 100 100" className={styles.ring}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none" stroke={theme === 'dark' ? '#ffd700' : '#b8960c'} strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <span className={styles.ringValue}>{accuracy}%</span>
            </div>
            <span className={styles.statBoxLabel}>{t('profile.effectiveness')}</span>
            <div className={styles.statMini}>
              <span className={styles.statWin}>✅ {USER_PROFILE.correctPredictions}</span>
              <span className={styles.statLoss}>❌ {USER_PROFILE.totalPredictions - USER_PROFILE.correctPredictions}</span>
            </div>
          </div>
        </motion.div>

        {/* Ranking */}
        <motion.div variants={staggerItem}>
          <div className={styles.statCard}>
            <AnimatedCounter value={`#${currentRank}`} className={styles.statBigNum} />
            <span className={styles.statBoxLabel}>{t('profile.globalRanking')}</span>
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div variants={staggerItem} style={{ gridColumn: 'span 2' }}>
          <div className={`${styles.statCard} ${styles.streakCard}`}>
            <motion.div
              className={styles.streakWrap}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Fire size={32} weight="fill" className={styles.fireIcon} />
              <span className={styles.statBigNum} style={{ fontSize: '1.8rem' }}>{USER_PROFILE.streak} {t('profile.days')}</span>
            </motion.div>
            <span className={styles.statBoxLabel}>{t('profile.bestStreak')}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Achievements with stagger */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('profile.achievements')}</h3>
        <motion.div
          className={styles.achievements}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {USER_PROFILE.achievements.map((ach, index) => (
            <motion.div
              key={ach.id}
              className={`${styles.achBadge} ${!ach.unlocked ? styles.achLocked : ''}`}
              variants={staggerItem}
              whileTap={{ scale: 0.92, rotate: ach.unlocked ? [0, -3, 3, 0] : 0 }}
            >
              <motion.span
                className={styles.achIcon}
                animate={ach.unlocked ? { y: [0, -3, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.12 }}
              >
                {ach.icon}
              </motion.span>
              <span className={styles.achName}>{ach.name}</span>
              {!ach.unlocked && <span className={styles.achLock}>🔒</span>}
            </motion.div>
          ))}
        </motion.div>
      </section>



      {/* Archetype Section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('profile.archetype')}</h3>
        <motion.div
          className={`${styles.archetypeCard} tour-step-profile-stats`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.archetypeContent}>
            <span className={styles.archetypeIcon}>
              {archetype === 'practico' ? '🎁' : archetype === 'acumulador' ? '📈' : '🏆'}
            </span>
            <div>
              <h4 className={styles.archetypeName}>
                {t(`profile.archetypes.${archetype}`)}
              </h4>
              <p className={styles.archetypeDesc}>
                {t(`profile.archetypes.${archetype}Desc`)}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Prediction History */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('profile.predictionHistory')}</h3>
        <motion.div
          className={`${styles.historyList} tour-step-profile-history`}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {predictionHistory.length > 0 ? (
            predictionHistory.map((pred) => (
              <motion.div
                key={pred.id}
                className={styles.historyItem}
                variants={staggerItem}
              >
                <div className={styles.historyMatch}>
                  <span className={styles.historyFlag}>{pred.home.flag}</span>
                  <span>{pred.home.name} vs {pred.away.name}</span>
                  <span className={styles.historyFlag}>{pred.away.flag}</span>
                </div>
                <div className={styles.historyPred}>
                  {t('profile.yourPrediction')} <strong>{pred.prediction === 'home' ? pred.home.name : pred.prediction === 'away' ? pred.away.name : t('common.draw')}</strong>
                </div>
                <div className={styles.historyPoints}>+{pred.points} {t('common.mAIles')}</div>
              </motion.div>
            ))
          ) : (
            <p className={styles.noHistory}>{t('profile.noPredictions')}</p>
          )}
        </motion.div>
      </section>

      {/* Menu Items */}
      <section className={`${styles.section} tour-step-profile-settings`}>
        <motion.div
          className={styles.menuList}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {[
            {
              icon: <Sun size={20} weight="bold" />,
              label: t('profile.appTheme'),
              value: theme === 'dark' ? t('profile.themeDark') : t('profile.themeLight'),
              action: toggleTheme,
            },
            {
              icon: <Translate size={20} weight="bold" />,
              label: t('profile.language'),
              value: `${currentLangOption.flag} ${t(`languageSelector.${language}`)}`,
              action: () => setShowLanguageModal(true),
            },
            { icon: <Info size={20} weight="bold" />, label: t('profile.about'), action: () => setShowAboutModal(true) },
            {
              icon: <SignOut size={20} weight="bold" />,
              label: t('profile.logout'),
              danger: true,
              action: handleLogout,
            },
          ].map((item, i) => (
            <motion.button
              key={i}
              className={`${styles.menuItem} ${item.danger ? styles.menuDanger : ''}`}
              variants={staggerItem}
              whileTap={{ scale: 0.98, x: 4 }}
              onClick={item.action}
            >
              <div className={styles.menuItemLeft}>
                <span className={styles.menuIcon}>{item.icon}</span>
                <div className={styles.menuLabelGroup}>
                  <span>{item.label}</span>
                  {item.value && <span className={styles.menuItemValue}>{item.value}</span>}
                </div>
              </div>
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              >
                <CaretRight size={16} weight="bold" className={styles.menuChevron} />
              </motion.span>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* Language Selector Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLanguageModal(false)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalHandle} />
                <div className={styles.modalHeaderRow}>
                  <Translate size={22} weight="bold" style={{ color: 'var(--gold-primary)' }} />
                  <h3 className={styles.modalTitle}>{t('languageSelector.title')}</h3>
                  <motion.button className={styles.modalClose} onClick={() => setShowLanguageModal(false)} whileTap={{ scale: 0.85 }}>
                    <X size={18} weight="bold" />
                  </motion.button>
                </div>
              </div>
              <div className={styles.modalBody}>
                <p className={styles.langSubtitle}>{t('languageSelector.subtitle') || 'Selecciona tu idioma preferido'}</p>
                <div className={styles.langGrid}>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <motion.button
                      key={lang.code}
                      className={`${styles.langOption} ${language === lang.code ? styles.langOptionActive : ''}`}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLanguageModal(false);
                      }}
                      whileTap={{ scale: 0.96 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className={styles.langFlag}>{lang.flag}</span>
                      <div className={styles.langInfo}>
                        <span className={styles.langName}>{t(`languageSelector.${lang.code}`)}</span>
                        <span className={styles.langNative}>
                          {lang.code === 'es' ? 'Español' : 'English'}
                        </span>
                      </div>
                      {language === lang.code && (
                        <motion.div
                          className={styles.langCheck}
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        >
                          <Check size={13} weight="bold" color="#000" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About Modal */}
      <AnimatePresence>
        {showAboutModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAboutModal(false)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalHandle} />
                <div className={styles.modalHeaderRow}>
                  <Info size={22} weight="bold" style={{ color: 'var(--gold-primary)' }} />
                  <h3 className={styles.modalTitle}>{t('profile.aboutModal.title')}</h3>
                  <motion.button className={styles.modalClose} onClick={() => setShowAboutModal(false)} whileTap={{ scale: 0.85 }}>
                    <X size={18} weight="bold" />
                  </motion.button>
                </div>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.aboutHero}>
                  <span className={styles.aboutLogo}>⚽</span>
                  <h4 className={styles.aboutAppName}>{t('profile.aboutModal.appName')}</h4>
                  <span className={styles.aboutVersion}>{t('profile.aboutModal.version')}</span>
                </div>
                <div className={styles.infoRow}>
                  <Globe size={20} weight="bold" className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>{t('profile.aboutModal.whatIs')}</div>
                    <div className={styles.infoDesc}>{t('profile.aboutModal.whatIsDesc')}</div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <Code size={20} weight="bold" className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>{t('profile.aboutModal.technology')}</div>
                    <div className={styles.infoDesc}>{t('profile.aboutModal.technologyDesc')}</div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <Heart size={20} weight="bold" className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>{t('profile.aboutModal.developedBy')}</div>
                    <div className={styles.infoDesc}>{t('profile.aboutModal.developedByDesc')}</div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <Envelope size={20} weight="bold" className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>{t('profile.aboutModal.contact')}</div>
                    <div className={styles.infoDesc}>{t('profile.aboutModal.contactDesc')}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div
        className={styles.footer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className={styles.footerBrand}>AI Banks Ecuador</span>
        <span className={styles.footerPowered}>{t('common.poweredBy')} <strong>TCS</strong></span>
        <span className={styles.footerVersion}>v1.0.0</span>
      </motion.div>
    </div>
  );
}
