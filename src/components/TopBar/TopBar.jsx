import { motion } from 'framer-motion';
import { Eye, Moon, Sun } from '@phosphor-icons/react';
import { USER_PROFILE } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTier } from '../../hooks/useTier';
import styles from './TopBar.module.css';

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const tier = useTier();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.avatar}>
          <span>{USER_PROFILE.avatar}</span>
        </div>
        <motion.div
           className={styles.greeting}
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.4 }}
        >
          <span className={styles.hello}>Hola {user?.name || USER_PROFILE.name} 👋</span>
          <span className={styles.tier}>{tier}</span>
        </motion.div>
      </div>
      <div className={styles.right}>
        <motion.button
          className={styles.iconBtn}
          onClick={toggleTheme}
          aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          whileTap={{ scale: 0.9 }}
        >
          {theme === 'dark' ? <Sun size={22} weight="bold" /> : <Moon size={22} weight="bold" />}
        </motion.button>

      </div>
    </header>
  );
}
