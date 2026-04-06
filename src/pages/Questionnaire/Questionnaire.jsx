import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlowButton from '../../components/GlowButton/GlowButton';
import styles from './Questionnaire.module.css';

const questions = [
  {
    id: 1,
    question: '¿Qué tipo de premios prefieres?',
    options: [
      { text: 'Premios seguros y garantizados', value: 'conservador', icon: '🛡️' },
      { text: 'Premios con buen equilibrio', value: 'moderado', icon: '⚖️' },
      { text: 'Premios emocionantes y de alto valor', value: 'arriesgado', icon: '🎰' },
    ],
  },
  {
    id: 2,
    question: '¿Cómo te sientes con los sorteos?',
    options: [
      { text: 'Prefiero evitarlos, quiero certeza', value: 'conservador', icon: '❌' },
      { text: 'Me gusta participar en algunos', value: 'moderado', icon: '🤔' },
      { text: '¡Me encantan los sorteos grandes!', value: 'arriesgado', icon: '🎉' },
    ],
  },
  {
    id: 3,
    question: '¿Qué valoras más en un premio?',
    options: [
      { text: 'Estabilidad y utilidad diaria', value: 'conservador', icon: '💰' },
      { text: 'Diversión y entretenimiento', value: 'moderado', icon: '🎬' },
      { text: 'Experiencias únicas y emocionantes', value: 'arriesgado', icon: '🏆' },
    ],
  },
];

export default function Questionnaire() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate archetype
      const counts = { conservador: 0, moderado: 0, arriesgado: 0 };
      Object.values(newAnswers).forEach(val => {
        counts[val]++;
      });
      const archetype = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      completeOnboarding(archetype);
      navigate('/');
    }
  };

  const question = questions[currentQuestion];

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className={styles.progressBar}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Personaliza tus recomendaciones
        </motion.h1>
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Pregunta {currentQuestion + 1} de {questions.length}
        </motion.p>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            className={styles.question}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className={styles.questionText}>{question.question}</h3>
            <div className={styles.options}>
              {question.options.map((option, index) => (
                <motion.button
                  key={option.value}
                  className={styles.optionButton}
                  onClick={() => handleAnswer(option.value)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={styles.optionIcon}>{option.icon}</span>
                  <span className={styles.optionText}>{option.text}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}