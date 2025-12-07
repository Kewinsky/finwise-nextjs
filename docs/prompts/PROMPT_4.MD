Zadanie:
Wygeneruj kompletny Rozdział 4 mojej pracy magisterskiej w języku polskim, zgodnie z poniższymi wytycznymi.
Podziel wynik na osobne pliki:

4.md

4.1.md

4.2.md

4.3.md

4.4.md

4.5.md

4.6.md

Każdy plik ma zawierać tylko swoją sekcję.

🎓 KONTEKST PRACY

Piszesz rozdział implementacyjny pracy magisterskiej dotyczącej aplikacji Finwise — systemu SaaS do zarządzania finansami osobistymi, opartego na:

Next.js (App Router, server actions),

Supabase (PostgreSQL, Auth, RLS),

Stripe (billing, subskrypcje),

OpenAI API,

Upstash (Redis/Rate limiting),

Vercel (serverless hosting),

TailwindCSS, shadcn/ui, TypeScript.

Wszystkie szczegóły dotyczące architektury, modeli danych, przepływów, struktur katalogów, integracji i implementacji znajdują się w folderze /docs, m.in.:

TECHNICAL_DOCUMENTATION.md

pliki z diagramami

cała dokumentacja generowana wcześniej w ramach projektu

Rozdział ma opisywać realną implementację, zgodną z tym, co rzeczywiście znajduje się w repozytorium.

📚 Źródła i cytowania

Cytowania obowiązkowe tylko do dokumentacji technologii, zgodnie z LITERATURE.md.

Poziom cytowań: minimalny — pojedyncze cytowanie na sekcję, tylko gdy coś rzeczywiście wynika z dokumentacji.

Style cytowań: (Next.js Documentation, 2025) itp.

Nie cytujemy literatury naukowej w tym rozdziale — ten rozdział jest praktyczny, bazuje na dokumentacji.

🧱 ZAKRES DO NAPISANIA (obowiązkowy)

Treść rozdziału 4 musi odpowiadać strukturze:

4. IMPLEMENTACJA

4.1. Stack technologiczny
4.1.1. Next.js, TypeScript, TailwindCSS, shadcn/ui
4.1.2. Supabase, PostgreSQL, OAuth2, JWT
4.1.3. Stripe, OpenAI API, Upstash, Vercel, Pino, Sentry

4.2. Frontend
4.2.1. Struktura aplikacji i routing (App Router, server actions)
4.2.2. System komponentów i stylowanie (TailwindCSS, shadcn/ui)
4.2.3. Mechanizmy personalizacji UI oraz tryby dostępności

4.3. Backend
4.3.1. Warstwa usług i integracje Supabase
4.3.2. Obsługa autoryzacji, RLS i zarządzanie sesją
4.3.3. Logowanie zdarzeń i monitoring (Pino, Sentry)

4.4. Integracja płatności Stripe
4.4.1. Konfiguracja planów i webhooków
4.4.2. Przepływy billingowe i fakturowanie
4.4.3. Obsługa reklamacji i zwrotów

4.5. Moduł sztucznej inteligencji
4.5.1. Analiza finansów i insighty generowane przez AI
4.5.2. Chatbot konwersacyjny i zarządzanie kontekstem
4.5.3. Mechanizmy ograniczania kosztów i rate limiting

4.6. Eksport danych i personalizacja
4.6.1. Eksport CSV/PDF oraz integracje zewnętrzne
4.6.2. Profile użytkownika i preferencje UI
4.6.3. Mechanizmy lokalizacji i wielojęzyczności (opcjonalnie)

📊 Diagramy (obowiązkowe)

Dodaj diagramy w formacie Mermaid, ale wyłącznie:

diagram architektury systemu SaaS,

diagram przepływu server actions,

diagram integracji usług (OpenAI, Stripe, Supabase, Upstash),

diagram ERD (wysoki poziom — bez wrażliwych szczegółów, zgodny z załącznikami),

diagram autoryzacji i RLS.

Zakaz:
❌ Nie wolno generować diagramów dotyczących implementacji Finwise, których nie ma w dokumentach /docs.
❌ Nie wolno dopisywać nieistniejących modeli.
❌ Nie wolno pokazywać szczegółowych kluczy API, secretów itp.

Jeśli brak danych — pomiń diagram.

✍️ Wymagania stylistyczne

Styl konsekwentny z rozdziałem 2 i 3 (naturalny akademicki, nieregularne akapity).

Piszesz z perspektywy projektowej:
„W tej części zaprojektowano…, wdrożono…, opracowano…”

Zero ogólników.

Zero fikcyjnych informacji — wyłącznie to, co znajduje się w dokumentacji oraz w plikach /docs.

Sekcje muszą być logiczne, techniczne, precyzyjne.

🧠 Instrukcje obowiązkowe

Analizuj i wykorzystuj pliki z folderu /docs.

Opieraj się na realnej strukturze kodu i implementacji.

Dodawaj cytowania tylko gdy naprawdę opierasz się na dokumentacji.

Unikaj równoformatowych akapitów — ich długość powinna być nieregularna.

Każdy plik .md musi być samodzielny i poprawnie sformatowany.
