import { useState, useEffect } from 'react';
import { USER_PROFILE } from '../data/mockData';

const PAYLOAD_GOLD = {
  saldo_por_vencer: 4131.06,
  saldo_vencido: 0.0,
  saldo_no_devenga: 0.0,
  cartera_total: 4131.06,
  cartera_en_riesgo: 0.0,
  saldo_mora: 0.0,
  dias_mora: 0
};

const PAYLOAD_SILVER = {
  saldo_por_vencer: 303.97,
  saldo_vencido: 0.0,
  saldo_no_devenga: 0.0,
  cartera_total: 900.03,
  cartera_en_riesgo: 0.0,
  saldo_mora: 596.07,
  dias_mora: 45
};

const SEGMENTO_MAP = {
  'A': 'Gold',
  'B': 'Silver',
  'C': 'Bronce',
  'D': 'Madera'
};

export function useTier() {
  const [tier, setTier] = useState(sessionStorage.getItem('financial_tier') || 'Calculando...');

  useEffect(() => {
    if (sessionStorage.getItem('financial_tier')) {
      return; 
    }

    const fetchTier = async () => {
      try {
        const payload = Math.random() > 0.5 ? PAYLOAD_GOLD : PAYLOAD_SILVER;
        const apiUrl = import.meta.env.VITE_AI_BACKEND_URL || 'http://127.0.0.1:8000';
        
        const response = await fetch(`${apiUrl}/predict_segmento`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        // Guardar el segmento crudo (A/B/C/D) para otras experiencias (ej: Gemini prompt)
        if (data?.segmento_asignado) {
          sessionStorage.setItem('financial_segment', data.segmento_asignado);
        }

        const mappedTier = SEGMENTO_MAP[data.segmento_asignado] || 'Básico';
        setTier(mappedTier);
        sessionStorage.setItem('financial_tier', mappedTier);
      } catch (err) {
        console.error("Error consultando Segmento con IA:", err);
        const fallback = USER_PROFILE.tier.replace('VIP ', ''); // Fallback
        setTier(fallback);
        sessionStorage.setItem('financial_tier', fallback);
      }
    };
    
    fetchTier();
  }, []);

  return tier;
}
