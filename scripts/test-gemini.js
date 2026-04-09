// scripts/test-gemini.js
// Test autocontenido (sin dependencias) para validar conexión y respuesta de Gemini.

import fs from 'node:fs';
import path from 'node:path';

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMsFromHeaders(res) {
  try {
    const raw = res?.headers?.get?.('retry-after');
    if (!raw) return null;

    // Can be seconds or an HTTP date.
    const seconds = Number(raw);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1000);

    const dateMs = Date.parse(raw);
    if (!Number.isNaN(dateMs)) {
      const delta = dateMs - Date.now();
      return delta > 0 ? delta : 0;
    }
  } catch {
    // ignore
  }
  return null;
}

function parseRetryDelayMsFromGeminiErrorRaw(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;

  // 1) Try structured JSON first.
  try {
    const parsed = JSON.parse(text);
    const retryInfo = Array.isArray(parsed?.error?.details)
      ? parsed.error.details.find((d) => String(d?.['@type'] || '').includes('RetryInfo'))
      : null;
    const retryDelay = String(retryInfo?.retryDelay || '').trim();
    const match = retryDelay.match(/(\d+(?:\.\d+)?)s/i);
    if (match) return Math.round(Number(match[1]) * 1000);
  } catch {
    // ignore
  }

  // 2) Fallback: parse human message like "Please retry in 16.78s".
  const msgMatch = text.match(/retry\s+in\s+(\d+(?:\.\d+)?)s/i);
  if (msgMatch) return Math.round(Number(msgMatch[1]) * 1000);

  return null;
}

function loadDotEnvFile(dotEnvPath) {
  try {
    const content = fs.readFileSync(dotEnvPath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const eqIndex = line.indexOf('=');
      if (eqIndex <= 0) continue;

      const key = line.slice(0, eqIndex).trim();
      let value = line.slice(eqIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
    return true;
  } catch {
    return false;
  }
}

function normalizeModelName(value) {
  const raw = String(value || '').trim();
  if (!raw) return DEFAULT_MODEL;
  return raw.startsWith('models/') ? raw.slice('models/'.length) : raw;
}

function safeJsonExtract(text) {
  if (!text) return null;

  const cleaned = String(text)
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
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
      ? questionnaireSelections.map((s) => `- Q${s.id}: ${s.text} (tag=${s.value})`).join('\n')
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

function maskKey(url) {
  return String(url).replace(/([?&]key=)[^&]+/i, '$1***');
}

async function callGemini({ url, prompt, temperature, maxOutputTokens }) {
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens,
      thinkingConfig: {
        // Gemini 2.5 usa thinking por defecto (-1). Para respuestas JSON cortas,
        // conviene desactivarlo para evitar truncamiento.
        thinkingBudget: 0,
      },
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  return { res, raw };
}

async function run() {
  const envPath = path.resolve(process.cwd(), '.env');
  loadDotEnvFile(envPath);

  const viteKey = String(process.env.VITE_GEMINI_API_KEY || '').trim();
  const googleKey = String(process.env.GOOGLE_API_KEY || '').trim();
  const apiKey = viteKey || googleKey;
  if (!apiKey) {
    console.error('ERROR: No encuentro API key. Define VITE_GEMINI_API_KEY en el .env (es la que usa la app).');
    console.error(`Ruta esperada: ${envPath}`);
    process.exitCode = 1;
    return;
  }

  if (!viteKey && googleKey) {
    console.warn('AVISO: Encontré GOOGLE_API_KEY pero no VITE_GEMINI_API_KEY.');
    console.warn('      La app (Vite) solo expone variables que empiezan con VITE_.');
    console.warn('      Copia tu key a VITE_GEMINI_API_KEY para que funcione en el frontend.');
  }

  const model = normalizeModelName(process.env.VITE_GEMINI_MODEL);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  // Contexto de prueba (edítalo si quieres simular tu caso real).
  const context = {
    userName: 'Usuario de Prueba',
    currentPoints: 500,
    predictionsCount: 15,
    redeemedCount: 2,
    redeemedCategories: ['Tecnología'],
    financialTier: 'Oro',
    creditRating: 'A',
    questionnaireSelections: [
      { id: 1, text: 'Prefiero premios que pueda usar de inmediato', value: 'practico' },
      { id: 5, text: 'Me motiva competir y estar en la cima del ranking', value: 'competidor' },
    ],
  };

  const prompt = buildGeminiPrompt(context);

  const temperature = 0.35;
  const maxOutputTokens = 512;

  console.log('Iniciando test Gemini...');
  console.log(`Modelo: ${model}`);
  console.log(`URL: ${maskKey(url)}`);

  const MAX_ATTEMPTS = 3;
  let attempt = 1;
  let currentMaxTokens = maxOutputTokens;
  let rateRetryUsed = false;
  let parseRetryUsed = false;
  let data;
  let text = '';
  let finishReason = null;
  let usage = null;

  while (attempt <= MAX_ATTEMPTS) {
    const { res, raw } = await callGemini({
      url,
      prompt,
      temperature,
      maxOutputTokens: currentMaxTokens,
    });

    console.log(`HTTP: ${res.status} ${res.statusText} (intento ${attempt}, maxOutputTokens=${currentMaxTokens})`);

    if (!res.ok) {
      console.error('Respuesta de error (raw):');
      console.error(raw || '(vacío)');

      if (res.status === 429 && !rateRetryUsed) {
        const retryAfterMs =
          parseRetryAfterMsFromHeaders(res) ??
          parseRetryDelayMsFromGeminiErrorRaw(raw);

        // Evitamos esperas largas (p.ej. cuota diaria). Si el delay es pequeño,
        // respetamos el retry recomendado y reintentamos una vez.
        if (Number.isFinite(retryAfterMs) && retryAfterMs > 0 && retryAfterMs <= 30_000) {
          rateRetryUsed = true;
          const seconds = Math.ceil(retryAfterMs / 1000);
          console.warn(`429 Too Many Requests: reintentando en ~${seconds}s...`);
          await sleep(retryAfterMs + 250);
          attempt += 1;
          continue;
        }
      }

      process.exitCode = 1;
      return;
    }

    try {
      data = JSON.parse(raw);
    } catch {
      console.error('ERROR: La respuesta no es JSON válido (raw):');
      console.error(raw || '(vacío)');
      process.exitCode = 1;
      return;
    }

    finishReason = data?.candidates?.[0]?.finishReason ?? null;
    usage = data?.usageMetadata ?? null;

    text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p?.text)
        .filter(Boolean)
        .join('\n') ||
      '';

    const extracted = safeJsonExtract(text);
    if (extracted) {
      // Éxito
      console.log(`finishReason: ${finishReason || '(N/D)'}`);
      if (usage) console.log(`usage: ${JSON.stringify(usage)}`);

      console.log('\nTexto del modelo:');
      console.log('------------------------------------');
      console.log(text || '(sin texto)');
      console.log('------------------------------------');

      const arquetipo = normalizeArchetype(extracted.arquetipo);
      const premios_recomendados = normalizeRecommendedRewards(extracted.premios_recomendados);

      const mensaje =
        extracted.mensaje && typeof extracted.mensaje === 'object'
          ? {
              recomendacion: String(extracted.mensaje.recomendacion || '').trim(),
              motivacion: String(extracted.mensaje.motivacion || '').trim(),
              retencion: String(extracted.mensaje.retencion || '').trim(),
            }
          : { recomendacion: '', motivacion: '', retencion: '' };

      const confianzaRaw = Number(extracted.confianza);
      const confianza = Number.isFinite(confianzaRaw)
        ? Math.max(0, Math.min(1, confianzaRaw))
        : null;

      console.log('\nResultado normalizado (como la app):');
      console.log(
        JSON.stringify(
          {
            arquetipo,
            premios_recomendados,
            mensaje,
            confianza,
            raw: extracted,
          },
          null,
          2
        )
      );
      return;
    }

    // Falló el parseo: mostramos diagnósticos y reintentamos si tiene pinta de truncamiento.
    console.warn(`finishReason: ${finishReason || '(N/D)'}`);
    if (usage) console.warn(`usage: ${JSON.stringify(usage)}`);

    console.warn('No pude parsear JSON desde el texto devuelto.');
    console.warn('Texto recibido:');
    console.warn('------------------------------------');
    console.warn(text || '(sin texto)');
    console.warn('------------------------------------');

    const shouldRetry =
      !parseRetryUsed &&
      (finishReason === 'MAX_TOKENS' ||
        finishReason === 'RECITATION' ||
        // Heurística: parece que se cortó en medio.
        (text.trim().startsWith('{') && !text.trim().endsWith('}')));

    if (!shouldRetry) {
      console.error('ERROR: No pude obtener un JSON válido con el formato esperado.');
      process.exitCode = 1;
      return;
    }

    parseRetryUsed = true;
    attempt += 1;
    currentMaxTokens = 1024;
  }

  // No debería llegar aquí.
  process.exitCode = 1;
}

run().catch((error) => {
  console.error('ERROR: Falló el test Gemini.');
  console.error(error);
  process.exitCode = 1;
});
