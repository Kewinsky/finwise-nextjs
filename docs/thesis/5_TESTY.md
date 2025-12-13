<!-- cSpell:disable -->

# 5. TESTY I WALIDACJA SYSTEMU

Rozdział piąty opisuje, w jaki sposób system Finwise został zweryfikowany pod względem poprawności działania, spójności integracji oraz podstawowych wymagań niefunkcjonalnych. W odróżnieniu od rozdziału czwartego, skupionego na samej implementacji, w tym rozdziale nacisk położono na sprawdzenie, czy zaimplementowany kod rzeczywiście realizuje scenariusze użytkownika opisane w analizie wymagań i czy krytyczne elementy architektury (Supabase, Stripe, moduł AI, interfejs webowy) współpracują ze sobą w przewidywalny sposób.

W testach przyjęto pragmatyczne podejście: zamiast dążyć do pełnego pokrycia liniami kodu, skoncentrowano się na minimalnym, ale reprezentatywnym zestawie przypadków testowych. Każdy z poziomów testowania został dobrany tak, aby pokrywać te fragmenty systemu, które są kluczowe z punktu widzenia użytkownika oraz architektury SaaS.

## 5.1. STRATEGIA TESTÓW I NARZĘDZIA

Strategia testów Finwise została zaprojektowana tak, aby możliwie prosto odzwierciedlać rzeczywistą strukturę projektu i istniejący kod, bez wprowadzania ciężkiej infrastruktury testowej typowej dla dużych zespołów. Celem nie było zbudowanie kompletnej platformy QA, lecz pokazanie, że kluczowe elementy systemu zostały zweryfikowane w sposób systematyczny i powtarzalny, z wykorzystaniem nowoczesnych narzędzi. Zastosowano cztery poziomy testowania:

- **testy jednostkowe** – skupione na czystych funkcjach i logice biznesowej (formatowanie danych, walidacja, moduł AI),
- **testy integracyjne** – sprawdzające zachowanie kodu w obecności zewnętrznych usług (Stripe, OpenAI, Supabase),
- **testy end‑to‑end** – odwzorowujące realne ścieżki użytkownika w przeglądarce,
- **pomiary wydajności** – wykonane z użyciem Lighthouse dla strony głównej.

### 5.1.1. Testy jednostkowe i integracyjne z wykorzystaniem Vitest

Do testów jednostkowych i integracyjnych wykorzystano bibliotekę **Vitest**, skonfigurowaną w pliku `vitest.config.mts`. Testy domyślnie obejmują pliki `src/**/*.test.{ts,tsx}`, a dodatkowo rozszerzono zakres o `integration/**/*.test.ts`, gdzie umieszczono testy integracyjne dla Stripe, OpenAI i Supabase. Vitest, zgodnie z dokumentacją, zapewnia szybki runner testów kompatybilny składniowo z Jest, obsługę trybu watch oraz raportowanie pokrycia kodu, co zostało odzwierciedlone w skryptach `package.json` (Vitest Documentation, 2025):

- `pnpm test` – uruchomienie wszystkich testów (unit + integration),
- `pnpm test:watch` – tryb obserwacji podczas pracy deweloperskiej,
- `pnpm test:coverage` – raport pokrycia kodu.

### 5.1.2. Testy end‑to‑end z wykorzystaniem Playwright

Testy end‑to‑end zrealizowano w oparciu o **Playwright**. Konfiguracja znajduje się w pliku `playwright.config.ts` i definiuje katalog `e2e/`, domyślny adres aplikacji (`http://127.0.0.1:3000`) oraz proces uruchamiania serwera deweloperskiego (`pnpm dev`) przed startem testów, zgodnie z przykładowymi przepływami startu aplikacji opisanymi w dokumentacji Playwright (Playwright Documentation, 2025). Dzięki temu zestaw E2E można uruchomić jedną komendą:

```bash
# w jednym terminalu
pnpm dev

# w drugim terminalu
pnpm test:e2e
```

### 5.1.3. Pomiary wydajności jako element strategii testów

Ostatnim elementem strategii są **pomiary wydajności**. W tym celu wykorzystano Lighthouse uruchamiany z poziomu przeglądarki (Chrome DevTools). Skupiono się na stronie głównej, która jest pierwszym punktem kontaktu użytkownika z aplikacją SaaS i ma największy wpływ na subiektywną ocenę szybkości działania.

## 5.2. TESTY JEDNOSTKOWE – LOGIKA, WALIDACJA, MODUŁ AI

Testy jednostkowe w Finwise skupiają się przede wszystkim na tych fragmentach kodu, które są łatwe do izolacji i jednocześnie istotne z punktu widzenia poprawności obliczeń oraz walidacji danych wejściowych. Obejmują one zarówno proste funkcje pomocnicze (formatowanie kwot i dat), jak i bardziej złożone schematy Zod oraz fragmenty logiki modułu sztucznej inteligencji.

### 5.2.1. Testy funkcji pomocniczych w module utils

Pierwszą grupę stanowią testy funkcji pomocniczych z modułu `src/lib/utils`. W pliku `src/lib/utils/currency.test.ts` zweryfikowano m.in. poprawność działania funkcji `calculatePercentageChange` (przypadki wzrostu, spadku oraz sytuacja graniczna, gdy poprzednia wartość wynosi zero) oraz `formatPercentageChange`, która zaokrągla wynik do jednego miejsca po przecinku i dodaje znak plus lub minus. Dodatkowo sprawdzono funkcję `formatCurrency`, która korzysta z `Intl.NumberFormat` do formatowania kwot w różnych walutach.

Uzupełnieniem tej grupy jest plik `src/lib/utils/date.test.ts`, gdzie przetestowano funkcję `formatDisplayDate`. Funkcja ta odpowiada za konwersję dat ISO na skróconą, przyjazną dla użytkownika postać (np. "Jan 15" dla języka angielskiego). Test nie narzuca konkretnego formatu regionalnego, lecz weryfikuje obecność miesiąca i dnia w wygenerowanym ciągu znaków.

### 5.2.2. Testy walidacji danych opartej na schematach Zod

Drugą, ważniejszą z punktu widzenia domeny finansowej grupą są testy schematów Zod opisujących transakcje. W pliku `src/validation/finance.transactions.test.ts` sprawdzono m.in.:

- poprawną walidację transakcji typu `income` z poprawnie uzupełnionym kontem docelowym,
- odrzucenie transakcji `income` bez konta docelowego z komunikatem "Income must have a destination account",
- odrzucenie transakcji `transfer`, w której oba konta są takie same,
- wymaganie kategorii dla transakcji innych niż `transfer` w `transactionFormSchema`,
- poprawność formatu daty w `updateTransactionSchema` (wzorzec `YYYY-MM-DD`).

Dzięki tym testom można mieć pewność, że najczęściej używane ścieżki (dodawanie i edycja transakcji) są chronione przed typowymi błędami użytkownika już na poziomie walidacji danych.

### 5.2.3. Testy modułu sztucznej inteligencji (AIAssistantService)

Trzecia grupa testów jednostkowych dotyczy modułu sztucznej inteligencji. W pliku `src/services/ai.service.test.ts` sprawdzono zachowanie klasy `AIAssistantService` w dwóch wymiarach. Po pierwsze, metoda wewnętrzna `analyzeFinancialData` otrzymuje zagregowane dane finansowe (miesięczne podsumowanie, rozbicie wydatków na kategorie, trendy, salda kont) i na ich podstawie generuje listy wniosków: `spendingInsights`, `savingsTips`, `budgetOptimization` oraz `areasOfConcern`. Testy weryfikują, że przy danych wejściowych odpowiadających "trudnej" sytuacji finansowej (wydatki przewyższają dochody, ujemne saldo na jednym z kont) moduł AI wskazuje to w swoich wnioskach jako obszar wymagający uwagi.

Po drugie, sprawdzono zachowanie metody `generateMockResponse`, która pełni rolę fallbacku w sytuacji, gdy OpenAI API jest niedostępne lub celowo wyłączone. Funkcja ta analizuje treść pytania użytkownika i generuje odpowiedzi oraz sugestie dalszych pytań. W testach przygotowano kilka przykładowych pytań dotyczących wydatków, oszczędzania i stanu kont, a następnie sprawdzono, czy proponowane odpowiedzi zawierają odpowiednie sugestie.

Dzięki połączeniu testów prostych utili, walidacji Zod oraz logiki AI, warstwa testowania jednostkowego zapewnia wystarczajacy poziom pewności, że kluczowe obliczenia i reguły biznesowe w Finwise działają zgodnie z oczekiwaniami, zanim zostaną połączone z zewnętrznymi usługami i warstwą interfejsu.

## 5.3. TESTY INTEGRACYJNE – STRIPE, OPENAI, SUPABASE

Testy integracyjne w Finwise zostały zaprojektowane jako cienka warstwa nad istniejącymi usługami domenowymi i klientami zewnętrznymi. Celem nie jest pełne odtworzenie zachowania Stripe czy OpenAI, lecz upewnienie się, że kod aplikacji poprawnie reaguje na typowe zdarzenia (np. webhook z opłaconą fakturą) oraz potrafi obsłużyć wybrane klasy błędów (np. przekroczenie limitu zapytań do API).

### 5.3.1. Integracja ze Stripe – obsługa webhooków płatności

Pierwszy zestaw testów integracyjnych dotyczy integracji ze Stripe. W pliku `integration/stripe/stripe-webhook.test.ts` przetestowano funkcję `handleWebhookEvent` z modułu `src/lib/stripe/webhooks`. Test buduje przykładowy obiekt `Stripe.Event` typu `invoice.payment_succeeded`, zawierający m.in. identyfikator faktury, klienta oraz subskrypcji. Następnie, przy pomocy mechanizmu `vi.mock`, podmienione zostają funkcje `syncSubscriptionToDatabase` oraz klient Stripe, aby nie wykonywać rzeczywistych połączeń HTTP. Po wywołaniu `handleWebhookEvent` asercje sprawdzają, czy funkcja synchronizacji została wywołana dokładnie raz, z odpowiednim identyfikatorem subskrypcji. W ten sposób potwierdzono, że aplikacja poprawnie interpretuje zdarzenie webhooka i aktualizuje stan subskrypcji w bazie danych.

### 5.3.2. Integracja z OpenAI – wywołania API i obsługa błędów

Drugi zestaw testów integracyjnych obejmuje komunikację z OpenAI. W pliku `integration/ai/openai-service.test.ts` przetestowano funkcję `callOpenAI` z modułu `src/lib/openai/client`. Kluczowym elementem jest tutaj pełne zamockowanie biblioteki `openai` – test definiuje klasę zastępczą, w której metoda `chat.completions.create` zgłasza błąd "Request failed due to rate limit". Dodatkowo skonfigurowano środowisko tak, aby funkcja nie kończyła się na wczesnym błędzie braku klucza API. Następnie sprawdzono, że `callOpenAI` przechwytuje wyjątek z klienta i zwraca ujednolicony wynik z polem `error` ustawionym na "Rate limit exceeded" oraz komunikatem tekstowym, który można przekazać użytkownikowi. Test ten jest ważny z dwóch powodów: pokazuje, że obsługa błędów API jest spójna i przewidywalna, a zarazem pozwala rozwijać moduł AI bez konieczności wykonywania kosztownych zapytań do OpenAI podczas każdej sesji testów.

### 5.3.3. Integracja z Supabase – operacje na transakcjach

Trzeci test integracyjny odwołuje się do bazy danych Supabase. Został umieszczony w pliku `integration/supabase/transactions-integration.test.ts` i uruchamia się tylko wtedy, gdy w środowisku testowym zdefiniowane są zmienne `NEXT_PUBLIC_SUPABASE_URL` oraz `SUPABASE_SERVICE_ROLE_KEY`. Test wykorzystuje `createServiceClient` (klienta z uprawnieniami service role, obchodzącego RLS) do utworzenia tymczasowego użytkownika, konta oraz przykładowej transakcji typu `income`. Następnie sprawdza, czy wstawiony rekord ma oczekiwane `user_id` i kwotę. Test ten dowodzi, że aplikacja poprawnie współpracuje z rzeczywistą instancją Supabase.

Podsumowując, testy integracyjne w Finwise zostały celowo ukierunkowane na niewielki, ale najważniejszy zestaw punktów styku z usługami zewnętrznymi. Takie zawężenie zakresu pozwoliło znacząco ograniczyć ryzyko trudnych do wykrycia błędów na granicy aplikacji i dostawców (Stripe, OpenAI, Supabase), jednocześnie bez konieczności tworzenia rozbudowanej infrastruktury mocków.

## 5.4. TESTY END-TO-END – GŁÓWNE SCENARIUSZE UŻYTKOWNIKA

Testy end‑to‑end (E2E) mają na celu sprawdzenie, czy najważniejsze scenariusze użytkownika można zrealizować w przeglądarce bez błędów, przy współdziałaniu wszystkich warstw systemu. Do ich implementacji wykorzystano bibliotekę Playwright oraz wydzielony katalog `e2e/`.

Wspólnym elementem wszystkich testów E2E jest konsekwentne używanie atrybutów `data-testid` w komponentach UI (formularze, przyciski, wiersze tabel), co pozwala uniknąć selekorów podatnych na zmiany struktury DOM lub treści tekstu, a jednocześnie nie wpływa na dostępność aplikacji.

### 5.4.1. Weryfikacja strony głównej

Najprostszym testem E2E jest weryfikacja strony głównej. W pliku `e2e/landing.spec.ts` przetestowano, czy po wejściu na `/` użytkownik widzi główny nagłówek marketingowy ("Take Control of Your Finances") oraz przycisk call‑to‑action prowadzący do panelu (`Start tracking free`). Test korzysta z semantycznych selektorów `getByRole` i weryfikuje zarówno treść nagłówka, jak i obecność linku, co zapewnia, że podstawowy punkt wejścia do aplikacji jest poprawnie zrenderowany.

### 5.4.2. Logowanie z użyciem magic linku

Drugi test E2E dotyczy logowania z użyciem magic linku i został zapisany w pliku `e2e/auth.spec.ts`. Scenariusz polega na wejściu na `/login`, wypełnieniu pola e‑mail oraz kliknięciu przycisku wysyłającego link. W pełnym, skonfigurowanym środowisku testowym test oczekuje przekierowania na stronę `/email-sent` i wyświetlenia komunikatu potwierdzającego wysłanie wiadomości. Test oczekuje przekierowania na stronę /email-sent i wyświetlenia komunikatu potwierdzającego wysłanie wiadomości, co w praktyce weryfikuje poprawność integracji formularza z mechanizmem wysyłki magic linków w Supabase.

### 5.4.3. Dodawanie transakcji z poziomu dashboardu

Bardziej zaawansowane scenariusze E2E dotyczą panelu użytkownika (dashboardu). W pliku `e2e/transactions.spec.ts` zaimplementowano test dodawania nowej transakcji z poziomu dashboardu. Test wykorzystuje mechanizm `storageState` Playwrighta, aby skorzystać z wcześniej nagranej sesji zalogowanego użytkownika (plik `playwright/.auth/user.json`). Następnie przechodzi na `/dashboard`, otwiera formularz dodawania wydatku przy pomocy szybkiej akcji (przycisk z `data-testid="quick-action-expense"`), wypełnia podstawowe pola (kwota, opis) i klika przycisk zapisu. Po zatwierdzeniu transakcji test sprawdza, czy opis pojawił się w sekcji „Recent Activity”, co potwierdza poprawność całej ścieżki – od formularza, przez server action, po zapis w bazie i odświeżenie widoku.

### 5.4.4. Interakcja z asystentem AI

Ostatni scenariusz E2E związany jest bezpośrednio z modułem AI. W pliku `e2e/ai-assistant.spec.ts` przetestowano, czy użytkownik może zadać pytanie asystentowi AI z poziomu dashboardu i otrzymać odpowiedź. Test, podobnie jak poprzedni, korzysta z `storageState`, aby mieć dostęp do zalogowanego kontekstu. Po wejściu na `/dashboard` wyszukuje panel asystenta (`data-testid="ai-chat-interface"`), wprowadza pytanie w polu tekstowym (`ai-chat-input`), wysyła je (`ai-chat-send-button`) i oczekuje, że w historii czatu pojawi się odpowiedź zawierająca słowa kluczowe związane z wydatkami lub oszczędzaniem. W tym scenariuszu nie jest istotne, czy odpowiedź pochodzi bezpośrednio z OpenAI, czy z fallbacku `generateMockResponse` – ważne jest, że użytkownik na poziomie interfejsu otrzymuje spójne i sensowne informacje.

Zestaw testów end‑to‑end pokrywa najważniejsze ścieżki: wejście na stronę, logowanie, dodanie transakcji oraz podstawową interakcję z modułem AI. Taki zakres jest wystarczający, aby pokazać, że system został zweryfikowany również z perspektywy realnego użytkownika, a nie wyłącznie na poziomie funkcji i usług backendowych.

## 5.5. TESTY WYDAJNOŚCI (LIGHTHOUSE) I OGRANICZENIA TESTOWANIA

Uzupełnieniem testów funkcjonalnych i integracyjnych są pomiary wydajności oraz krótkie spojrzenie na ograniczenia przyjętego podejścia testowego. W przypadku Finwise skupiono się na analizie strony głównej, ponieważ to ona najczęściej decyduje o pierwszym wrażeniu użytkownika oraz wpływa na wskaźniki takie jak współczynnik odrzuceń czy czas do pierwszej interakcji.

### 5.5.1. Metodyka pomiarów z użyciem Lighthouse

Do pomiaru wydajności użyto narzędzia **Lighthouse** uruchamianego z poziomu przeglądarki (Chrome DevTools). Analiza została przeprowadzona dla adresu `/` w konfiguracji desktopowej, przy wykorzystaniu domyślnego profilu symulującego wolniejsze łącze sieciowe i ograniczoną moc CPU. Wynik raportu dołączono w formie pliku PDF w Załączniku 8.2.1, co umożliwia jego ponowną analizę lub porównanie z wynikami przyszłych wersji systemu.

Raport Lighthouse obejmuje cztery główne kategorie: Performance, Accessibility, Best Practices oraz SEO. W przypadku Finwise szczególną uwagę zwrócono na:

- metryki czasu ładowania (Largest Contentful Paint, First Input Delay),
- rozmiar i strukturę bundla JavaScript,
- wykorzystanie pamięci podręcznej przeglądarki oraz cache na poziomie Vercel,
- poprawność semantyki HTML i etykiet ARIA (mając na uwadze wymagania dostępnościowe opisane w rozdziale trzecim).

Uzyskane wyniki wykazały, że strona główna osiąga niemal maksymalny poziom wydajności w warunkach zbliżonych do rzeczywistych, co w dużej mierze wynika z włączenia globalnego cache na Vercel. W kategoriach Best Practices i SEO Finwise osiągnęło wysokie noty dzięki zastosowaniu semantycznych znaczników, poprawnej konfiguracji meta‑tagów oraz obsłudze trybu dark/light bez nadmiernej ilości dodatkowego kodu.

### 5.5.2. Ograniczenia przyjętego podejścia do testowania

Ograniczenia przyjętego podejścia testowego wynikają głównie z charakteru pracy magisterskiej oraz skali projektu. Testy jednostkowe i integracyjne obejmują najważniejsze fragmenty logiki, a nie każdy możliwy przypadek brzegowy. Testy end‑to‑end koncentrują się na głównych ścieżkach użytkownika i nie pokrywają wszystkich kombinacji błędów czy stanów krawędziowych (np. pracy w trybie offline). Testy integracji z Supabase zostały świadomie ograniczone do scenariusza dodania transakcji przy użyciu klienta service role, aby nie komplikować konfiguracji baz testowych.

Mimo tych ograniczeń, opisany zestaw testów i pomiarów wydajności stanowi solidną podstawę do oceny jakości implementacji Finwise. Zapewnia on równowagę między złożonością, a wartością informacyjną i może być w przyszłości rozszerzony o bardziej zaawansowane testy obciążeniowe, monitorowanie produkcyjne czy automatyczne testy uruchamiane w pipeline CI/CD.
