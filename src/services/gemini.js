const DEFAULT_MODEL = 'gemini-2.5-flash';

const ARCHETYPES = ['competidor', 'acumulador', 'practico'];

const PRIZE_LIBRARY = {
  competidor: [
    'Viaje al Mundial 2026',
    'Entradas VIP',
    'Camiseta oficial',
    'Upgrade de tarjeta / beneficios premium',
    'PlayStation 5',
  ],
  acumulador: [
    'Millas',
    'Cashback acumulado alto',
    'Maleta premium',
    'Celular gama media',
    'Audífonos inalámbricos',
  ],
  practico: [
    'Cashback inmediato',
    'Gift card',
    'Descuentos en comercios aliados',
    'Parlante portátil',
    'Power bank',
  ],
};

export function isGeminiConfigured() {
  return Boolean(String(import.meta.env.VITE_GEMINI_API_KEY || '').trim());
}

function normalizeModelName(value) {
  const raw = String(value || '').trim();
  if (!raw) return DEFAULT_MODEL;

  // Allow users to paste full resource names from the API (e.g. "models/gemini-2.5-flash")
  const withoutPrefix = raw.startsWith('models/') ? raw.slice('models/'.length) : raw;

  // Back-compat: older defaults used in this repo.
  if (withoutPrefix === 'gemini-1.5-flash') return DEFAULT_MODEL;
  if (withoutPrefix === 'gemini-1.5-pro') return 'gemini-2.5-pro';

  return withoutPrefix;
}

function safeJsonExtract(text) {
  if (!text) return null;

  // Remove common Markdown code fences
  const cleaned = String(text)
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Fast path
  try {
    return JSON.parse(cleaned);
  } catch {
    // Attempt to extract first JSON object
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    const candidate = cleaned.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }
}

function normalizeArchetype(value) {
  const raw = String(value || '').toLowerCase().trim();
  if (ARCHETYPES.includes(raw)) return raw;

  if (raw.includes('compet')) return 'competidor';
  if (raw.includes('acumul')) return 'acumulador';
  if (raw.includes('pract')) return 'practico';

  return null;
}

function normalizeRecommendedRewards(rewards) {
  if (!Array.isArray(rewards)) return [];

  return rewards
    .map((item) => {
      if (typeof item === 'string') {
        return { nombre: item, razon: '' };
      }
      if (item && typeof item === 'object') {
        return {
          nombre: String(item.nombre || item.premio || item.title || '').trim(),
          razon: String(item.razon || item.porque || item.reason || '').trim(),
        };
      }
      return null;
    })
    .filter((x) => x && x.nombre);
}

function buildGeminiPrompt(context) {
  const {
    userName,
    currentPoints,
    predictionsCount,
    redeemedCount,
    redeemedCategories,
    financialTier,
    creditRating,
    questionnaireSelections,
  } = context;

  const allowedRewards = {
    competidor: PRIZE_LIBRARY.competidor,
    acumulador: PRIZE_LIBRARY.acumulador,
    practico: PRIZE_LIBRARY.practico,
  };

  return [
    'Eres un asistente experto en personalización y engagement para una app de gamificación (pronósticos deportivos + puntos + canje de premios).',
    'Tu tarea es inferir el arquetipo del usuario y recomendar premios que maximicen participación, engagement, fidelización y retención.',
    '',
    'ARQUETIPOS (elige SOLO uno):',
    '- competidor: ganar, destacar, ranking, reconocimiento; premia estatus, experiencias y aspiracionales.',
    '- acumulador: progreso, puntos, metas, acumulación de valor; premia largo plazo y crecimiento.',
    '- practico: beneficios rápidos, útiles y fáciles de canjear; premia inmediatez y claridad.',
    '',
    'CALIFICACIÓN CREDITICIA (si aplica):',
    '- A: altas deudas o préstamos, buen pago',
    '- B: bajas deudas o préstamos, buen pago',
    '- C: bajas deudas o préstamos, mal pago',
    '- D: altas deudas o préstamos, mal pago',
    '',
    'PREMIOS PERMITIDOS POR ARQUETIPO (elige 3 a 5 para recomendar, NO inventes otros):',
    `- competidor: ${allowedRewards.competidor.join('; ')}`,
    `- acumulador: ${allowedRewards.acumulador.join('; ')}`,
    `- practico: ${allowedRewards.practico.join('; ')}`,
    '',
    'INFORMACIÓN DISPONIBLE DEL USUARIO (prompt dinámico):',
    `- nombre: ${userName || 'N/D'}`,
    `- puntos_actuales: ${Number.isFinite(currentPoints) ? currentPoints : 'N/D'}`,
    `- predicciones_realizadas: ${Number.isFinite(predictionsCount) ? predictionsCount : 'N/D'}`,
    `- canjes_realizados: ${Number.isFinite(redeemedCount) ? redeemedCount : 'N/D'}`,
    `- categorias_canjeadas: ${redeemedCategories?.length ? redeemedCategories.join(', ') : 'N/D'}`,
    `- tier_financiero: ${financialTier || 'N/D'}`,
    `- calificacion_crediticia: ${creditRating || 'N/D'}`,
    '',
    'RESPUESTAS DEL CUESTIONARIO (si existen):',
    questionnaireSelections?.length
      ? questionnaireSelections
          .map((s) => `- Q${s.id}: ${s.text} (tag=${s.value})`)
          .join('\n')
      : '- N/D',
    '',
    'SALIDA OBLIGATORIA: responde SOLO un JSON válido (sin markdown, sin texto adicional) con esta forma:',
    '{',
    '  "arquetipo": "competidor|acumulador|practico",',
    '  "premios_recomendados": [',
    '    { "nombre": "...", "razon": "..." }',
    '  ],',
    '  "mensaje": {',
    '    "recomendacion": "...",',
    '    "motivacion": "...",',
    '    "retencion": "..."',
    '  },',
    '  "confianza": 0.0',
    '}',
  ].join('\n');
}

export async function inferArchetypeWithGemini(context, options = {}) {
  const apiKey = String(import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('Falta configurar VITE_GEMINI_API_KEY');
  }

  const model = normalizeModelName(import.meta.env.VITE_GEMINI_MODEL);
  const prompt = buildGeminiPrompt(context);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 512,
          // Gemini 2.5 usa thinking por defecto; eso puede consumir el presupuesto
          // de salida y truncar el JSON. Lo desactivamos para respuestas estructuradas.
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      }),
      signal: options.signal,
    }
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Gemini HTTP ${res.status}${errorText ? `: ${errorText}` : ''}`);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p?.text)
      .filter(Boolean)
      .join('\n') ||
    '';

  const json = safeJsonExtract(text);
  if (!json) {
    throw new Error('Gemini no devolvió JSON parseable');
  }

  const archetype = normalizeArchetype(json.arquetipo);
  const premios_recomendados = normalizeRecommendedRewards(json.premios_recomendados);

  const mensaje = json.mensaje && typeof json.mensaje === 'object'
    ? {
        recomendacion: String(json.mensaje.recomendacion || '').trim(),
        motivacion: String(json.mensaje.motivacion || '').trim(),
        retencion: String(json.mensaje.retencion || '').trim(),
      }
    : { recomendacion: '', motivacion: '', retencion: '' };

  const confianzaRaw = Number(json.confianza);
  const confianza = Number.isFinite(confianzaRaw)
    ? Math.max(0, Math.min(1, confianzaRaw))
    : null;

  return {
    arquetipo: archetype,
    premios_recomendados,
    mensaje,
    confianza,
    raw: json,
  };
}

export function getPrizeLibrary() {
  return PRIZE_LIBRARY;
}
