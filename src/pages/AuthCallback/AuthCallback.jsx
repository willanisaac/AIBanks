import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import styles from './AuthCallback.module.css';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error params in hash or query string
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const queryParams = new URLSearchParams(window.location.search);

        const errorCode = hashParams.get('error_code') || queryParams.get('error_code');
        const errorDescription =
          hashParams.get('error_description') || queryParams.get('error_description');

        if (errorCode || errorDescription) {
          const decoded = errorDescription
            ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
            : 'Ocurrió un error al verificar tu cuenta.';
          setStatus('error');
          setErrorMsg(decoded);
          return;
        }

        // Let Supabase pick up the tokens from the URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setStatus('error');
          setErrorMsg(error.message);
          return;
        }

        if (data.session) {
          // Successfully authenticated — redirect to home
          navigate('/', { replace: true });
        } else {
          // No session yet, wait for the auth state change
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
              subscription.unsubscribe();
              navigate('/', { replace: true });
            }
          });

          // Timeout fallback: if no session after 5s, show error
          setTimeout(() => {
            subscription.unsubscribe();
            setStatus('error');
            setErrorMsg(
              'No se pudo completar la verificación. El enlace puede haber expirado.'
            );
          }, 5000);
        }
      } catch (err) {
        setStatus('error');
        setErrorMsg(err.message || 'Error inesperado al procesar la verificación.');
      }
    };

    handleCallback();
  }, [navigate]);

  if (status === 'error') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconError}>✕</div>
          <h2>Error de verificación</h2>
          <p>{errorMsg}</p>
          <button className={styles.btn} onClick={() => navigate('/login', { replace: true })}>
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.spinner} />
        <h2>Verificando tu cuenta…</h2>
        <p>Esto solo toma un momento.</p>
      </div>
    </div>
  );
}
