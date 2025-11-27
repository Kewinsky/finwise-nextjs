<!-- cSpell:disable -->

# SPIS TREŚCI

## 1. WPROWADZENIE

1.1. Cel i zakres pracy  
1.1.1. Zakres merytoryczny projektu  
1.1.2. Zakres technologiczny (Next.js, Supabase, Stripe, OpenAI)  
1.1.3. Zakres badawczy i ewaluacyjny  
1.2. Uzasadnienie wyboru tematu  
1.2.1. Kontekst rozwoju FinTech w Polsce i na świecie  
1.2.2. Problem zarządzania finansami osobistymi  
1.2.3. Luka rynkowa adresowana przez Finwise  
1.3. Kontekst rynkowy i problem badawczy  
1.3.1. Analiza trendów i konkurencji  
1.3.2. Formułowanie pytań badawczych  
1.3.3. Hipotezy dotyczące skuteczności systemu  
1.4. Metodyka realizacji projektu  
1.4.1. Metody badań jakościowych i ilościowych  
1.4.2. Proces projektowo-implementacyjny  
1.4.3. Narzędzia i źródła danych  
1.5. Struktura dokumentu  
1.5.1. Logika układu rozdziałów  
1.5.2. Zakres treści poszczególnych części  
1.5.3. Powiązania między rozdziałami

## 2. ANALIZA TEORETYCZNA I PRZEGLĄD ROZWIĄZAŃ

2.1. Zarządzanie finansami osobistymi – podstawy  
2.1.1. Kluczowe pojęcia i modele decyzyjne  
2.1.2. Rola automatyzacji i danych w finansach osobistych  
2.1.3. Wyzwania behawioralne użytkowników  
2.2. Modele aplikacji finansowych  
2.2.1. Kategorie funkcjonalne rozwiązań FinTech  
2.2.2. Modele monetyzacji i subskrypcji  
2.2.3. Wymagania regulacyjne dla aplikacji finansowych  
2.3. Technologie webowe w architekturze SaaS  
2.3.1. Charakterystyka architektury Next.js + Supabase  
2.3.2. Integracje w modelu serverless (Vercel, Upstash)  
2.3.3. Standardy bezpieczeństwa (OAuth2, JWT, RLS)  
2.4. Sztuczna inteligencja w FinTech  
2.4.1. Wykorzystanie OpenAI API do analizy i dialogu  
2.4.2. Aspekty etyczne i odpowiedzialne AI  
2.4.3. Personalizacja rekomendacji finansowych  
2.5. Przegląd istniejących platform  
2.5.1. Mint, YNAB, Revolut, PocketGuard – charakterystyka  
2.5.2. Tabela porównawcza funkcjonalności i technologii  
2.5.3. Wnioski benchmarkingowe dla Finwise

## 3. ANALIZA WYMAGAŃ I PROJEKT SYSTEMU

3.1. Grupa docelowa i scenariusze użycia  
3.1.1. Segmentacja użytkowników i personas  
3.1.2. Kluczowe potrzeby i oczekiwane rezultaty  
3.1.3. Priorytetyzacja przypadków użycia  
3.2. Wymagania funkcjonalne  
3.2.1. User stories i przypadki użycia (tabela)  
3.2.2. Zarządzanie kontami, transakcjami i subskrypcją  
3.2.3. Moduły AI, raportowania i eksportu danych  
3.3. Wymagania niefunkcjonalne  
3.3.1. Wydajność, dostępność i skalowalność  
3.3.2. Bezpieczeństwo danych i zgodność z RODO  
3.3.3. Dostępność (WCAG) i doświadczenie użytkownika  
3.4. Architektura systemu  
3.4.1. Diagram architektury i przepływ server actions  
3.4.2. Integracja OpenAI (AI assistant)  
3.4.3. Integracja Stripe (billing i subskrypcje)  
3.4.4. Integracja Supabase i Upstash (autoryzacja, RLS, cache)  
3.5. Projekt bazy danych  
3.5.1. Diagram ERD i kluczowe encje  
3.5.2. Reguły RLS i polityki bezpieczeństwa  
3.5.3. Strategie migracji oraz backupu  
3.6. Modele UX  
3.6.1. Wireframes i makiety high-fidelity  
3.6.2. Warianty dark/light mode i responsywność  
3.6.3. Standardy dostępności i heurystyki UX

## 4. IMPLEMENTACJA

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

## 5. TESTY I WALIDACJA SYSTEMU

5.1. Strategia testów  
5.1.1. Zakres testów funkcjonalnych i regresyjnych  
5.1.2. Narzędzia (Vitest, Playwright, Lighthouse)  
5.1.3. Automatyzacja w pipeline CI/CD  
5.2. Testy funkcjonalne  
5.2.1. Scenariusze krytyczne (kont, transakcji, AI)  
5.2.2. Walidacja przepływów płatności i subskrypcji  
5.2.3. Testy integracji z API zewnętrznymi  
5.3. Testy bezpieczeństwa  
5.3.1. Odniesienie do OWASP Top 10  
5.3.2. Testy RLS, OAuth2, JWT i szyfrowania danych  
5.3.3. Analiza podatności i monitoring incydentów  
5.4. Testy UX i wydajności  
5.4.1. Badania użyteczności i mini-ankiety użytkowników  
5.4.2. Core Web Vitals i Lighthouse  
5.4.3. Testy obciążeniowe API oraz bazy danych

## 6. WNIOSKI I KIERUNKI ROZWOJU

6.1. Ocena implementacji  
6.1.1. Stopień realizacji celów i wymagań  
6.1.2. Analiza jakości kodu i utrzymania  
6.1.3. Wnioski dotyczące zastosowanego stacku  
6.2. Analiza ograniczeń  
6.2.1. Ograniczenia technologiczne i integracyjne  
6.2.2. Bariery czasowe i budżetowe projektu  
6.2.3. Ograniczenia danych i badań użytkowników  
6.3. Kierunki rozwoju  
6.3.1. Import danych (CSV, bankowość otwarta)  
6.3.2. Zaawansowana analityka ML i prognozowanie wydatków  
6.3.3. Analiza trendów i rekomendacje inwestycyjne  
6.4. Podsumowanie  
6.4.1. Kluczowe rezultaty projektu  
6.4.2. Wkład pracy w rozwój FinTech  
6.4.3. Rekomendacje dla dalszych badań

## 7. STUDIUM PRZYPADKU UŻYTKOWNIKA (opcjonalnie)

7.1. Scenariusze użytkownika  
7.1.1. Nowy użytkownik – onboarding i konfiguracja  
7.1.2. Zaawansowany użytkownik – codzienne zarządzanie finansami  
7.1.3. Użytkownik premium – praca z modułem AI i subskrypcją  
7.2. Analiza przebiegu interakcji  
7.2.1. Mierniki sukcesu i satysfakcji  
7.2.2. Bariery i punkty tarcia w ścieżkach  
7.2.3. Rekomendacje usprawnień UX

## 8. BIBLIOGRAFIA

## 9. ZAŁĄCZNIKI

9.1. Materiały projektowe  
9.1.1. Diagramy architektury i ERD  
9.1.2. Flowchart server actions i integracji  
9.1.3. Wireframes, mockupy i warianty UI  
9.2. Materiały techniczne  
9.2.1. Instrukcje uruchomienia i konfiguracji środowisk  
9.2.2. Dokumentacja API i konfiguracji CI/CD  
9.2.3. Raporty z testów (Vitest, Playwright, Lighthouse)  
9.3. Inne materiały  
9.3.1. Wyniki badań użytkowników i ankiet  
9.3.2. Dokumentacja zgodności (RODO, polityka prywatności)  
9.3.3. Link do repozytorium i materiałów uzupełniających

---

**Uwaga:** Struktura może zostać dostosowana do wymagań promotora lub regulaminu uczelni; rekomenduje się konsultację przed finalizacją.
