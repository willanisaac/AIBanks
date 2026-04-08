# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Variables de entorno

1. Copia `.env.example` como `.env`.
2. Completa los valores necesarios.

Variables usadas por el frontend:

- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`: autenticación (Supabase).
- `VITE_AI_BACKEND_URL`: backend de IA (FastAPI) para `/predict` y `/predict_segmento`.
- `VITE_GEMINI_API_KEY`: API Key de Gemini (se consume directo desde el navegador).
- `VITE_GEMINI_MODEL` (opcional): modelo Gemini a usar.

Nota: al ser una API key usada en frontend, restringe el uso por dominio/origen en Google Cloud.
