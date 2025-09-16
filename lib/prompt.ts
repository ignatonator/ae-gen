export function buildPrompt(args: {
  date: string;
  gospelRef: string; // sigla biblijne (np. "J 2,1-12") – zachowujemy nazwę pola dla zgodności z istniejącym kodem
  passageText?: string;
}) {
  const { date, gospelRef, passageText } = args;

  // Rozpoznaj, czy sigla dotyczą Ewangelii (Mt, Mk, Łk, J)
  const gospelRegex = /^(Mt|Mk|Łk|Lk|J)\s*\d/i;
  const isGospel = gospelRegex.test(gospelRef.trim());

  const passageNote = passageText
    ? `Dodatkowy fragment ${isGospel ? "Ewangelii" : "Pisma Świętego"} do uwzględnienia (jeśli pasuje do referencji):\n---\n${passageText}\n---\n`
    : "";

  return `
WAŻNE: Jeśli podane sigla nie pochodzą z żadnej z 73 ksiąg Pisma Świętego uznawanych przez Kościół katolicki (Stary i Nowy Testament), NIE GENERUJ apelu. Zamiast tego zwróć wyłącznie komunikat: "Podane sigla są nieprawidłowe – nie istnieją w kanonie 73 ksiąg Pisma Świętego Kościoła katolickiego."

Napisz apel ewangeliczny dla katolickich skautów w wieku 12–17 lat na podstawie podanych sigli biblijnych (fragmentu ${isGospel ? "Ewangelii" : "Pisma Świętego"}).
Apel musi być zgodny z nauczaniem Kościoła katolickiego (Katechizm, Tradycja, Magisterium), bez fałszywych cytatów, bez wymyślonych faktów ani „halucynacji”.
Uwzględnij aktualny okres liturgiczny, święta i ich znaczenie. Jeśli nie masz pewności, nie wymyślaj – sformułuj ostrożnie, pozostając wiernym nauce Kościoła.
Styl i struktura muszą być takie, jak w poniższych przykładach:

Tytuł – „Apel ${isGospel ? "Ewangeliczny" : "na podstawie Pisma Świętego"} – ${date}”

Modlitwa na rozpoczęcie – dwie wybrane modlitwy (mogą być inne) z np. „Zdrowaś Maryjo, Słowo Odwieczne, Chwała Ojcu, Ojcze Nasz, Święty Michale Archaniele, Pod Twoją Obronę etc.”

Pytania wstępne – 2–4 pytania wprowadzające, odnoszące się do życia skautów, okresu liturgicznego lub doświadczenia wiary.

${isGospel ? "Ewangelia" : "Fragment z Pisma Świętego"} – podaj sigla biblijne (np. J 2,1-12). Dodaj wskazówkę, że fragment powinien przeczytać jeden z chłopaków.

Pytania do ${isGospel ? "Ewangelii" : "fragmentu"} – 6-10 pytań pogłębiające z krótkimi odpowiedziami w nawiasach, zawsze zgodnymi z nauką Kościoła.

Podsumowanie – omówienie przesłania ${isGospel ? "Ewangelii" : "fragmentu"}, odniesienie do życia codziennego, duchowości skautów, praktyk liturgicznych i tradycji katolickiej. Możesz przytoczyć krótki cytat ze świętego, papieża lub Ojców Kościoła (tylko prawdziwe, sprawdzone cytaty).

Propozycja postanowienia – konkretne, proste zadanie duchowe dla skautów na najbliższy tydzień. Może być jednorazowe lub codzienne. Musi być realistyczne, wykonalne i konkretne.

Modlitwa na koniec – dwie wybrane modlitwy z (mogą być inne) np. „Zdrowaś Maryjo, Słowo Odwieczne, Chwała Ojcu, Ojcze Nasz, Święty Michale Archaniele, Pod Twoją Obronę etc.”, ale inne niż na rozpoczęcie

Przygotowanie: AI

Ton: prosty, zrozumiały dla młodzieży, ale pogłębiony i wierny nauce Kościoła.
Wejście użytkownika: sigla biblijne i data poniżej. Wyjście: kompletny apel w tej strukturze.
Nie cytuj niepewnych źródeł. Nie twórz „halucynacji”. Jeśli niepewne, powiedz ostrożnie.

Data: ${date}
sigla biblijne do wykorzystania: ${gospelRef}
${passageNote}
Wygeneruj kompletny apel.
`.trim();
}