import { motion } from 'framer-motion';
import styles from './SplashScreen.module.css';

export default function SplashScreen({ onComplete }) {
  return (
    <motion.div
      className={styles.splash}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className={styles.content}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, type: 'spring', stiffness: 100 }}
      >
        <motion.div
          className={styles.logo}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          🏦
        </motion.div>
        <motion.h1
          className={styles.title}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          iabank
        </motion.h1>
      </motion.div>
    </motion.div>
  );
}