# AE Gen – Generator Apelu Ewangelicznego

Prosta aplikacja Next.js + Tailwind do generowania apelu ewangelicznego dla katolickich skautów na podstawie daty i referencji Ewangelii. Backend wywołuje model `gpt-4o-mini` przez OpenAI API.

## Wymagania
- Node.js 18+ (zalecane 20)
- Klucz OpenAI: `OPENAI_API_KEY`

## Szybki start (Windows PowerShell)

```powershell
# 1) Zainstaluj zależności
npm install

# 2) Skonfiguruj klucz API
Copy-Item .env.example .env.local
# Edytuj .env.local i wstaw swój klucz OpenAI

# 3) Uruchom w trybie deweloperskim
npm run dev
```

Otwórz `http://localhost:3000`, wpisz datę i referencję Ewangelii (np. `J 2,1-12`), opcjonalnie fragment treści, a następnie kliknij „Generuj apel”.

## Konfiguracja
- Zmienna środowiskowa: `OPENAI_API_KEY`
- Endpoint API: `POST /api/generate` body: `{ date: string, gospelRef: string, passageText?: string }`

## Skrypty
- `npm run dev` – start dev server
- `npm run build` – build produkcyjny
- `npm run start` – start produkcyjny
- `npm run lint` – lint
- `npm run type-check` – TypeScript

## Uwaga dot. zgodności nauczania
W promptcie wymuszamy zgodność z nauczaniem Kościoła, eliminację nieprawdziwych cytatów i ostrożność wobec świąt, aby uniknąć „halucynacji”.

## Licencja
MIT
