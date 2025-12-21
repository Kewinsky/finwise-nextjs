<!-- cSpell:disable -->

# 6. WNIOSKI I KIERUNKI ROZWOJU

Rozdział szósty stanowi podsumowanie prac nad systemem Finwise oraz próbę krytycznej oceny przyjętych rozwiązań. W odróżnieniu od poprzednich rozdziałów, które koncentrowały się na analizie wymagań, projektowaniu, implementacji i testowaniu, niniejsza część pracy ma charakter refleksyjny.

W kolejnych podrozdziałach przedstawiono ocenę stopnia realizacji celów i wymagań, analizę jakości kodu i utrzymania, a także wnioski dotyczące zastosowanego stosu technologicznego. Następnie wskazano kierunki dalszego rozwoju systemu. Rozdział zamyka zwięzłe ujęcie najważniejszych rezultatów oraz refleksja nad wkładem projektu w rozwój rozwiązań FinTech.

## 6.1. Ocena implementacji

W niniejszym podrozdziale dokonano oceny zrealizowanej implementacji systemu Finwise, uwzględniając zarówno perspektywę spełnienia wymagań, jak i jakości samego rozwiązania technicznego. Analiza obejmuje stopień realizacji celów określonych w części analitycznej pracy, ocenę architektury i utrzymania kodu oraz wnioski płynące z doboru stosu technologicznego.

### 6.1.1. Stopień realizacji celów i wymagań

Implementacja systemu Finwise w znacznym stopniu zrealizowała cele określone w części analitycznej pracy. Z perspektywy wymagań funkcjonalnych zdefiniowanych dla użytkownika indywidualnego udało się dostarczyć spójny zestaw funkcji związanych z rejestrowaniem transakcji, zarządzaniem kontami i kategoriami wydatków, przeglądaniem historii oraz generowaniem podsumowań finansowych. Realizacja tych funkcji w postaci aplikacji webowej dostępnej w modelu SaaS jest zgodna z przyjętym celem głównym – stworzeniem nowoczesnego narzędzia wspierającego codzienne decyzje finansowe.

Istotnym elementem wymagań było także zapewnienie czytelnego interfejsu użytkownika, dostosowanego do pracy na urządzeniach desktopowych i mobilnych. Zastosowanie komponentów UI zgodnych z dobrymi praktykami projektowania interfejsów, wsparcie dla trybu jasnego i ciemnego oraz konsekwentne wykorzystanie semantycznych znaczników pozwoliło osiągnąć wysoki poziom dostępnosci. Z punktu widzenia funkcji wspierających, takich jak moduł asystenta AI, aplikacja spełnia założenie uzupełnienia klasycznego panelu finansowego o warstwę inteligentnych podsumowań.

Wymagania niefunkcjonalne dotyczyły głównie wydajności, bezpieczeństwa i niezawodności. Wykorzystanie architektury opartej na Next.js oraz hostingu w chmurze pozwoliło osiągnąć zadowalające czasy ładowania dla kluczowych widoków, co zostało potwierdzone pomiarami Lighthouse. Z kolei integracja z Supabase i Stripe umożliwiła skorzystanie z gotowych mechanizmów uwierzytelniania, autoryzacji i obsługi płatności cyklicznych, co znacząco podniosło poziom bezpieczeństwa w porównaniu z rozwiązaniami budowanymi od podstaw. Analiza testów funkcjonalnych i integracyjnych wskazuje, że kluczowe ścieżki użytkownika są stabilne, choć skala projektu nie pozwala jeszcze na pełne wnioskowanie o zachowaniu systemu w warunkach produkcyjnych.

Podsumowując, implementacja Finwise w obecnej formie realizuje większość zdefiniowanych wymagań i dowodzi, że przyjęta koncepcja może być skutecznie zastosowana w praktyce. System demonstruje, że połączenie klasycznego modułu finansów osobistych z usługami chmurowymi i komponentem AI jest możliwe przy użyciu współczesnych narzędzi, pozostawiając jednocześnie przestrzeń na dalsze doprecyzowanie wymagań wynikających z realnego użycia.

### 6.1.2. Analiza jakości kodu i utrzymania

Architektura implementacji Finwise została oparta na modularnym podziale odpowiedzialności, co sprzyja zarówno czytelności kodu, jak i jego utrzymaniu. Warstwa prezentacji wykorzystuje komponenty podzielone według obszarów domenowych (np. panel użytkownika, formularze transakcji, moduł asystenta), natomiast logika biznesowa i funkcje pomocnicze zostały wydzielone do osobnych modułów. Dzięki temu komponenty interfejsu są w dużej mierze pozbawione rozbudowanej logiki, a poszczególne elementy można rozwijać i refaktoryzować w odseparowanych częściach kodu.

Istotnym wzmocnieniem jakości kodu było wprowadzenie testów jednostkowych i integracyjnych. Testy funkcji formatujących oraz schematów walidacji danych pozwalają wychwycić błędy na wczesnym etapie, zanim ujawnią się w produkcyjnych scenariuszach użytkownika. Pokrycie testami kluczowych reguł domenowych (np. poprawność typów transakcji, spójność kont źródłowych i docelowych) przekłada się na większą pewność podczas refaktoryzacji i rozbudowy systemu. Uzupełnieniem są testy end‑to‑end weryfikujące całe ścieżki użytkownika w przeglądarce.

Należy jednocześnie zauważyć, że jakość kodu i łatwość utrzymania nie zostały jeszcze zweryfikowane w warunkach długotrwałego rozwoju i pracy zespołowej. Obecna struktura sprzyja współpracy wielu programistów, jednak dopiero włączenie procesów przeglądu kodu, automatycznego testowania w pipeline CI/CD oraz monitoringu jakości pozwoliłoby w pełni ocenić przygotowanie projektu do wieloletniego utrzymania.

### 6.1.3. Wnioski dotyczące zastosowanego stacku

Dobór stosu technologicznego obejmującego Next.js, Supabase, Stripe, OpenAI, Upstash oraz Vercel okazał się trafny z punktu widzenia szybkiego prototypowania oraz budowy kompletnego rozwiązania SaaS w ramach pracy magisterskiej. Next.js zapewnił spójną podstawę dla aplikacji webowej, oferując renderowanie po stronie serwera, routing oraz integrację z mechanizmem server actions, co uprościło komunikację z backendem. Supabase dostarczył gotowe mechanizmy uwierzytelniania, przechowywania danych i zarządzania schematem bazy, eliminując konieczność samodzielnego tworzenia zaplecza API i infrastruktury bazodanowej.

Integracja ze Stripe znacząco obniżyła próg wejścia w obsługę płatności cyklicznych, jednocześnie zapewniając zgodność z wymaganiami bezpieczeństwa i standardami branżowymi. Dzięki temu możliwe było skupienie się na warstwie domenowej systemu, zamiast na implementacji niskopoziomowej logiki billingowej. Wykorzystanie OpenAI jako dostawcy modeli językowych umożliwiło zbudowanie modułu asystenta AI bez konieczności trenowania własnych modeli i utrzymywania skomplikowanej infrastruktury. Upstash i Vercel uzupełniły stos o elementy związane z kolejkowaniem, cachingiem i skalowalnym hostingiem.

Doświadczenia z realizacji projektu wskazują jednak również na ograniczenia wybranego stosu. Zależność od wielu usług zewnętrznych komplikuje konfigurację środowisk, wymaga ostrożnego zarządzania kluczami i limitami API oraz utrudnia pełną replikację środowiska produkcyjnego w warunkach lokalnych. W przypadku modułu AI ograniczenia kosztów i prywatności danych wymuszają stosowanie cache’owania odpowiedzi oraz alternatywnych trybów działania bez każdorazowego odwoływania się do zewnętrznego API. Mimo tych wyzwań, analizowany stos technologiczny można uznać za adekwatny do skali i celów pracy, a zebrane doświadczenia stanowią wartościowy punkt wyjścia dla dalszego rozwoju systemu.

## 6.2. Kierunki rozwoju

W podrozdziale przedstawiono możliwe kierunki dalszej ewolucji systemu Finwise, wynikające zarówno z analizy obecnych ograniczeń, jak i obserwowanych trendów w branży FinTech. Proponowane ścieżki rozwoju obejmują w szczególności usprawnienie pozyskiwania danych, rozbudowę warstwy analitycznej oraz poszerzenie funkcjonalności o elementy edukacyjne i inwestycyjne.

### 6.2.1. Import danych (CSV, open banking)

Jednym z najbardziej oczywistych i zarazem najbardziej wartościowych kierunków rozwoju Finwise jest rozbudowa mechanizmów importu danych finansowych. Obecna wersja systemu zakłada wprowadzanie transakcji głównie ręcznie. W praktyce użytkownicy aplikacji finansowych oczekują jednak możliwości masowego importu historii operacji z różnych źródeł – od plików CSV eksportowanych z systemów bankowości elektronicznej po bezpośrednie połączenia z rachunkami bankowymi.

Pierwszym krokiem mogłoby być wprowadzenie modułu importu plików CSV o elastycznie definiowanym formacie. Mechanizm mapowania kolumn na pola domenowe (data, kwota, opis, kategoria, konto) wraz z możliwością zapamiętywania szablonów dla poszczególnych banków znacząco obniżyłby barierę wejścia dla nowych użytkowników i przyspieszył migrację z innych narzędzi. W połączeniu z prostymi regułami klasyfikacji, system mógłby automatycznie przypisywać kategorie do powtarzalnych transakcji, ograniczając nakład pracy ręcznej.

Kolejnym etapem byłaby integracja z otwartą bankowością. Włączenie dostawców usług open banking umożliwiłoby regularną synchronizację transakcji bez konieczności ręcznego eksportu plików, a w dalszej perspektywie także obsługę wielu rachunków w różnych instytucjach z poziomu jednego panelu. Tego typu integracje wiążą się jednak z dodatkowymi wymaganiami regulacyjnymi i bezpieczeństwa, dlatego ich implementacja powinna być poprzedzona analizą prawną i wyborem odpowiednich partnerów technologicznych.

### 6.2.2. Analiza trendów i rekomendacje inwestycyjne

Kolejnym perspektywicznym obszarem rozwoju jest rozszerzenie funkcjonalności Finwise o elementy analizy trendów rynkowych oraz rekomendacji inwestycyjnych. Obecnie system koncentruje się na budżetowaniu i kontroli wydatków, podczas gdy w praktyce zarządzanie finansami osobistymi obejmuje również decyzje dotyczące oszczędzania i inwestowania. Włączenie modułów prezentujących syntetyczne informacje o trendach na rynkach finansowych, poziomach inflacji czy stopach procentowych mogłoby znacząco zwiększyć wartość aplikacji dla użytkowników chcących aktywnie budować długoterminowe bezpieczeństwo finansowe.

Moduły rekomendacyjne mogłyby wykorzystywać zarówno proste reguły oparte na wiedzy eksperckiej (np. „jeśli wydatki na jedną kategorię przekraczają określony próg, zaproponuj ich ograniczenie”), jak i metody oparte na sztucznej inteligencji. Na przykład, system mógłby identyfikować nadwyżki finansowe w budżecie użytkownika i sugerować scenariusze ich ulokowania, uwzględniając profil ryzyka oraz horyzont czasowy. Jednocześnie kluczowe byłoby zachowanie transparentności rekomendacji oraz jednoznaczne rozgraniczenie między sugestiami edukacyjnymi, a doradztwem inwestycyjnym w sensie regulacyjnym.

Rozbudowa w tym kierunku wymagałaby ścisłej współpracy z ekspertami finansowymi oraz uwzględnienia obowiązujących regulacji prawnych. Z tego względu moduły inwestycyjne powinny być projektowane etapowo, od prostych materiałów edukacyjnych i symulacji budżetowych, aż po bardziej zaawansowane narzędzia analityczne, potencjalnie integrowane z zewnętrznymi platformami inwestycyjnymi.

### 6.2.3. Aplikacja mobilna

Naturalnym uzupełnieniem obecnej wersji Finwise byłoby opracowanie dedykowanej aplikacji mobilnej, umożliwiającej użytkownikom wygodne zarządzanie finansami z poziomu urządzenia mobilnego. Aplikacja mogłaby oferować uproszczony interfejs do szybkiego dodawania transakcji, przeglądania kluczowych wskaźników oraz odbierania powiadomień o przekroczeniu budżetu czy pojawieniu się nowych rekomendacji asystenta AI.

Z technicznego punktu widzenia rozwój aplikacji mobilnej mógłby zostać zrealizowany w oparciu o technologie wieloplatformowe, pozwalające na współdzielenie logiki z istniejącą aplikacją webową (np. poprzez wspólne API i moduły domenowe). Wymagałoby to jednak dopracowania zagadnień związanych z synchronizacją danych offline, projektowaniem interfejsu pod kątem małych ekranów oraz zapewnieniem spójnego doświadczenia użytkownika między wersją przeglądarkową, a mobilną.

### 6.2.4. Możliwe sposoby komercjalizacji

Architektura i funkcjonalności Finwise zostały zaprojektowany w sposób umożliwiający jego potencjalne wykorzystanie komercyjne w modelu SaaS. Najbardziej oczywistym scenariuszem byłoby oferowanie aplikacji w modelu subskrypcyjnym dla użytkownika indywidualnego (B2C), z rozróżnieniem na plan bezpłatny oraz warianty płatne. Plan podstawowy mógłby obejmować ograniczoną liczbę kont oraz zapytań kierowanych do asystenta AI, podczas gdy plany premium oferowałyby zaawansowane analizy, nielimitowany dostęp do modułu asystenta o rozszerzonych możliwościach oraz priorytetowe wsparcie użytkownika.

Drugim kierunkiem komercjalizacji mogłoby być skierowanie produktu do segmentu B2B lub B2B2C, czyli współpraca z instytucjami finansowymi lub firmami z sektora HR i benefitów pracowniczych. W takim scenariuszu Finwise funkcjonowałby jako narzędzie do edukacji finansowej klientów lub pracowników integrowane z istniejącymi systemami. Podobnie jak Workday, który dostarcza moduły HR i finansowe osadzane w portalach pracowniczych, czy programy wellbeingowe typu Headspace for Work, oferowane firmom jako element ich ekosystemu benefitów. Taki model pozwalałby udostępniać Finwise użytkownikom końcowym za pośrednictwem już istniejących systemów partnerów, przy zachowaniu jednej, wspólnej instancji aplikacji utrzymywanej i rozwijanej centralnie przez dostawcę.

Trzecim, uzupełniającym sposobem komercjalizacji mogłoby być oferowanie wybranych komponentów systemu, w szczególności modułu analitycznego lub asystenta AI, jako usług API dla innych aplikacji finansowych. Przykładem podobnego modelu jest Plaid, który udostępnia integracje z rachunkami bankowymi wyłącznie w formie API wykorzystywanego przez inne aplikacje finansowe (np. aplikacje budżetowe czy inwestycyjne) do pobierania i analizy danych użytkowników. Takie podejście wymagałoby dopracowania mechanizmów autoryzacji, limitowania zapytań oraz rozliczania zużycia zasobów, ale mogłoby otworzyć drogę do współpracy z mniejszymi podmiotami, które nie posiadają własnych zasobów do budowy zaawansowanych modułów analitycznych. Niezależnie od wybranego wariantu, kluczowe znaczenie miałoby dopracowanie kwestii bezpieczeństwa, ochrony danych i zgodności regulacyjnej, które stanowią fundament zaufania w sektorze FinTech.

## 6.4. Podsumowanie

Ostatni podrozdział zamyka pracę, koncentrując się na znaczeniu projektu Finwise w kontekście rozwoju rozwiązań FinTech oraz na możliwych kierunkach dalszych badań naukowych i prac wdrożeniowych związanych z aplikacjami do zarządzania finansami osobistymi.

### 6.4.1. Wkład pracy w rozwój FinTech

Projekt pokazuje, że nawet w warunkach ograniczonych zasobów możliwe jest stworzenie spójnego rozwiązania łączącego funkcje analityczne, płatnicze i wspierane przez AI, bez budowania od podstaw własnej infrastruktury. Stanowi to ilustrację szerszego trendu polegającego na komponowaniu nowoczesnych usług finansowych z segmentów dostarczanych przez wyspecjalizowanych dostawców.

Istotnym aspektem wkładu jest również demonstracja sposobu, w jaki narzędzia sztucznej inteligencji mogą wspierać użytkownika w interpretacji danych finansowych, zamiast jedynie prezentować surowe wykresy i tabele. Choć moduł AI w obecnej wersji ma charakter prototypowy, wskazuje kierunek, w którym mogą rozwijać się aplikacje osobistego zarządzania finansami.

### 6.4.2. Rekomendacje dla dalszych badań

Analiza rezultatów projektu prowadzi do szeregu rekomendacji dla dalszych badań naukowych i prac rozwojowych. Po pierwsze, zasadnym kierunkiem jest pogłębiona analiza wpływu narzędzi takich jak Finwise na rzeczywiste zachowania finansowe użytkowników. Wymagałoby to przeprowadzenia badań na odpowiednio dużej próbie, z wykorzystaniem zarówno metod ilościowych, jak i jakościowych. Szczególnie interesujące byłoby zbadanie, w jakim stopniu stosowanie inteligentnych rekomendacji przekłada się na trwałą zmianę nawyków oszczędzania i kontroli wydatków.

Po drugie, warto kontynuować prace nad modelami analitycznymi i rekomendacyjnymi dostosowanymi do specyfiki danych finansowych gospodarstw domowych. Obejmuje to zarówno rozwój metod prognozowania i oceny ryzyka, jak i badania nad czytelnością oraz zrozumiałością komunikatów generowanych przez systemy AI. Kluczowym wyzwaniem badawczym pozostaje znalezienie równowagi między złożonością modeli, a przejrzystością ich działania dla użytkownika końcowego.

Po trzecie, istotnym polem dalszych prac jest kwestia bezpieczeństwa i prywatności w kontekście wykorzystania chmurowych usług AI do przetwarzania danych finansowych. Badania mogą koncentrować się na technikach anonimizacji, przetwarzaniu po stronie klienta, a także na modelach hybrydowych łączących lokalne przetwarzanie z usługami zewnętrznymi. Wyniki takich badań mogłyby przyczynić się do wypracowania praktycznych wytycznych dla projektantów aplikacji FinTech korzystających z zaawansowanych narzędzi analitycznych.

Podsumowując, projekt Finwise stanowi punkt wyjścia do dalszych analiz i eksperymentów, zarówno w wymiarze technicznym, jak i społecznym. Przedstawione wnioski i rekomendacje wskazują możliwe ścieżki rozwoju, które mogą zostać podjęte w kolejnych pracach badawczych lub przy próbie komercyjnego rozwinięcia systemu.
