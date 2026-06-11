/**
 * STATIONS.JS – Alle Stationen der Rallye
 *
 * Lösungswort: ANTIFA (10 Buchstaben)
 * Stationen: propaganda · feindbilder · medien · fake news · wahlen · zivilcourage
 *
 * Fragetypen:
 *   multiple-choice  – Antwortauswahl
 *   image-analysis   – Klickbereiche auf Bild (Station 1)
 *   card-sort        – Karten in Kategorien einordnen (Station 2)
 *   detective        – Quellen analysieren (Station 3)
 *   comparison       – Artikel bewerten (Station 4)
 *   seek-find        – Elemente auf Bild finden (Station 5)
 *   story            – Interaktive Geschichte (Station 6)
 *   reflection       – Freitext-Reflexion
 */

const SOLUTION_WORD = "ANTIFA";

const STATIONS = [
    /* =========================================================
       STATION 1 – PROPAGANDA ERKENNEN
       Spielmechanik: Bildanalyse / Klick-Hotspots
    ========================================================= */
    {
        id: "propaganda",
        name: "Propaganda erkennen",
        icon: "📢",
        letter: "A",
        letterPosition: 0,
        color: "#c9292b",
        intro: "Propagandaplakate nutzen gezielte visuelle Mittel, um Emotionen zu manipulieren. In dieser Station analysierst du ein historisches Plakat und entdeckst, welche Techniken eingesetzt wurden.",
        questions: [
            {
                type: "image-analysis",
                instruction: "Klicke auf alle Elemente des Plakats, die Propaganda-Mittel darstellen. Du kannst mehrere Bereiche anklicken.",
                // SVG-Beschreibung des fiktiven Plakats (wird in app.js gerendert)
                posterContent: "fist-eagle",
                targets: [
                    { id: "a", label: "Faust / Macht-Symbol",    x: 48, y: 55, explanation: "Überdimensionale Fäuste symbolisieren rohe Kraft und Dominanz – klassisches Macht-Symbol." },
                    { id: "b", label: "Feindliches Konterfei",   x: 22, y: 30, explanation: "Karikaturen des 'Feindes' übertreiben Merkmale, um Angst und Abscheu zu erzeugen." },
                    { id: "c", label: "Nationalfarben",          x: 75, y: 20, explanation: "Farben der Flagge wecken patriotisches Gefühl und Zusammengehörigkeit." },
                    { id: "d", label: "Schlagwort / Slogan",     x: 50, y: 82, explanation: "Kurze, emotionale Slogans prägen sich ein und ersetzen komplexes Denken durch einfache Botschaften." }
                ],
                pointsPerTarget: 5,
                minToPass: 3
            },
            {
                type: "multiple-choice",
                visual: "🎨",
                question: "Welches Mittel wird in Propaganda NICHT typischerweise verwendet?",
                options: [
                    "Starke Emotionen wecken",
                    "Komplexe Sachverhalte vereinfachen",
                    "Verschiedene Perspektiven ausgewogen zeigen",
                    "Feindbilder aufbauen"
                ],
                correctIndex: 2,
                explanation: "Propaganda zeigt bewusst nur eine Seite und vermeidet jede differenzierte Darstellung – das würde die Botschaft schwächen.",
                points: 10
            },
            {
                type: "reflection",
                visual: "💡",
                question: "Welche Propaganda-Methoden begegnen dir in sozialen Medien? Beschreibe ein konkretes Beispiel.",
                placeholder: "Deine Beobachtungen...",
                points: 5
            }
        ]
    },

    /* =========================================================
       STATION 2 – FAKE NEWS ODER FAKT?
       Spielmechanik: Karten sortieren (Drag & Drop / Buttons)
    ========================================================= */
    {
        id: "fakenews",
        name: "Fakt oder Fake?",
        icon: "🔍",
        letter: "N",
        letterPosition: 1,
        color: "#2563eb",
        intro: "Nicht alles, was du liest, ist wahr – und nicht alles Falsche ist Fake News. Lerne den Unterschied zwischen Fakt, Meinung, Propaganda und Desinformation.",
        questions: [
            {
                type: "card-sort",
                instruction: "Ordne jede Aussage der richtigen Kategorie zu. Tippe zuerst auf eine Aussage, dann auf die Kategorie.",
                categories: [
                    { id: "fakt",           label: "✅ Fakt",           color: "#1e7e44" },
                    { id: "meinung",        label: "💬 Meinung",        color: "#2563eb" },
                    { id: "propaganda",     label: "📢 Propaganda",     color: "#c9292b" },
                    { id: "desinformation", label: "❌ Desinformation",  color: "#b45309" }
                ],
                cards: [
                    { id: "c1", text: "Das Grundgesetz der Bundesrepublik Deutschland trat am 23. Mai 1949 in Kraft.",    correctCategory: "fakt",           explanation: "Nachprüfbare historische Tatsache." },
                    { id: "c2", text: "Demokratie ist die beste Regierungsform, die je erfunden wurde.",                  correctCategory: "meinung",        explanation: "Werturteil – nicht objektiv beweisbar." },
                    { id: "c3", text: "Flüchtlinge sind die Hauptursache für steigende Kriminalität in Deutschland.",     correctCategory: "desinformation", explanation: "Statistisch widerlegbar – dient der Stimmungsmache." },
                    { id: "c4", text: "Nur wir können Deutschland retten – alle anderen sind Verräter!",                  correctCategory: "propaganda",     explanation: "Typische Wir-gegen-die-Rhetorik mit Heilsversprechen." },
                    { id: "c5", text: "Deutschland hat 16 Bundesländer.",                                                 correctCategory: "fakt",           explanation: "Überprüfbare geografische Tatsache." },
                    { id: "c6", text: "Soziale Medien machen die Demokratie kaputt.",                                     correctCategory: "meinung",        explanation: "Eine verbreitete, aber bewertende Einschätzung." }
                ],
                pointsPerCard: 5
            },
            {
                type: "multiple-choice",
                visual: "🌐",
                question: "Was unterscheidet Desinformation von einem ehrlichen Irrtum?",
                options: [
                    "Desinformation ist immer auf Englisch",
                    "Bei Desinformation werden falsche Infos absichtlich verbreitet",
                    "Desinformation kommt nur in sozialen Medien vor",
                    "Desinformation ist immer sofort erkennbar"
                ],
                correctIndex: 1,
                explanation: "Der entscheidende Unterschied ist die Absicht: Desinformation wird bewusst gestreut, um zu täuschen oder zu schaden.",
                points: 10
            }
        ]
    },

    /* =========================================================
       STATION 3 – DAS FEINDBILD-LABOR
       Spielmechanik: Detektiv-Aufgabe (Quellen analysieren)
    ========================================================= */
    {
        id: "feindbilder",
        name: "Das Feindbild-Labor",
        icon: "🔬",
        letter: "T",
        letterPosition: 2,
        color: "#7c3aed",
        intro: "Feindbilder werden mit sprachlichen Mitteln konstruiert. In dieser Station wirst du zum Detektiv: Analysiere historische Textquellen und entlarve, wie Ausgrenzung durch Sprache funktioniert.",
        questions: [
            {
                type: "detective",
                instruction: "Lies die Quellen aufmerksam. Finde die sprachlichen Mittel, mit denen Feindbilder aufgebaut werden. Klicke auf jede Quelle, um sie zu untersuchen.",
                sources: [
                    {
                        id: "s1",
                        type: "Zeitungsartikel",
                        date: "Berlin, März 1933",
                        text: "Das sogenannte Volk klagt und leidet unter dem Einfluss <mark>fremdartiger Elemente</mark>, die sich in unser ehrliches Gemeinschaftsleben eingeschlichen haben und es <mark>zersetzen</mark>.",
                        clues: ["Entmenschlichung (Elemente)", "biologische Metapher (zersetzen)", "Wir-vs-Sie (unser/fremd)"]
                    },
                    {
                        id: "s2",
                        type: "Propagandarede",
                        date: "München, November 1938",
                        text: "Es ist eine <mark>Pest</mark>, die sich ausbreitet. Die <mark>Schmarotzer</mark> unserer Nation müssen erkannt und bekämpft werden, bevor es zu spät ist.",
                        clues: ["Krankheits-Metapher (Pest)", "parasitäre Sprache (Schmarotzer)", "Gefahr-Framing (zu spät)"]
                    },
                    {
                        id: "s3",
                        type: "Schulbuch",
                        date: "Leipzig, 1935",
                        text: "Der <mark>Rassenunterschied</mark> zeigt sich nicht nur äußerlich, sondern auch im Charakter. Nur die Reinheit des Blutes kann die <mark>Stärke des Volkes</mark> sichern.",
                        clues: ["Pseudowissenschaft (Rassenunterschied)", "Reinheits-Ideologie", "kollektive Bedrohung"]
                    }
                ],
                targetClues: [
                    "Entmenschlichung", "biologische Metapher", "Krankheits-Metapher",
                    "parasitäre Sprache", "Pseudowissenschaft", "Wir-vs-Sie"
                ],
                minClues: 4,
                pointsPerClue: 5,
                summaryQuestion: "Welche dieser Textquellen enthält eine biologische Metapher?",
                summaryOptions: ["Zeitungsartikel", "Propagandarede", "Schulbuch", "Alle drei"],
                summaryCorrect: 3,
                summaryExplanation: "Alle drei Quellen nutzen biologische/medizinische Metaphern – ein typisches Mittel der NS-Propaganda zur Entmenschlichung.",
                summaryPoints: 10
            },
            {
                type: "multiple-choice",
                visual: "🎭",
                question: "Warum ist Sprache so mächtig beim Aufbau von Feindbildern?",
                options: [
                    "Weil schöne Wörter Menschen glücklich machen",
                    "Weil Sprache Wahrnehmungen prägt und Realität konstruiert",
                    "Weil niemand genau hinliest",
                    "Weil Sprache keine echten Auswirkungen hat"
                ],
                correctIndex: 1,
                explanation: "Sprache formt, wie wir die Welt wahrnehmen. Wer bestimmt, welche Worte wir benutzen, beeinflusst auch das Denken.",
                points: 10
            }
        ]
    },

    /* =========================================================
       STATION 4 – MEDIENKONTROLLE
       Spielmechanik: Vergleichsspiel (Artikel bewerten)
    ========================================================= */
    {
        id: "medien",
        name: "Medienkontrolle",
        icon: "📺",
        letter: "I",
        letterPosition: 3,
        color: "#0891b2",
        intro: "Freie Medien sind unverzichtbar für Demokratie. Aber wie erkennst du den Unterschied zwischen unabhängigem Journalismus und staatlich gesteuerter Propaganda?",
        questions: [
            {
                type: "comparison",
                instruction: "Lies die beiden Artikel zum gleichen Ereignis. Entscheide für jeden, ob er eher unabhängigen Journalismus oder Propaganda darstellt.",
                articles: [
                    {
                        id: "a1",
                        sourceName: "Volksbeobachter",
                        date: "Hamburg, September 1938",
                        headline: "Triumphaler Empfang für unseren Führer – ganz Hamburg jubelt!",
                        excerpt: "Hunderttausende begeisterte Bürger säumten gestern die Straßen, um den Retter des Vaterlandes zu begrüßen. Wer nicht jubelte, stand offensichtlich nicht auf dem Boden unserer Gemeinschaft.",
                        correct: "propaganda",
                        explanation: "Merkmale: Heldensprache ('Retter'), fehlende Quellen, implizite Drohung gegen Andersdenkende, keine Gegenperspektive."
                    },
                    {
                        id: "a2",
                        sourceName: "Neue Zürcher Zeitung",
                        date: "Zürich, September 1938",
                        headline: "Hitler-Besuch in Hamburg: Polizei schätzt 50.000 Zuschauer",
                        excerpt: "Zur gestrigen Kundgebung in Hamburg gibt die Polizei eine Besucherzahl von rund 50.000 an. Augenzeugen berichten von teils erzwungener Teilnahme in Betrieben. Die Regierung äußerte sich auf NZZ-Anfrage nicht.",
                        correct: "free",
                        explanation: "Merkmale: Konkrete Zahlen mit Quelle, kritische Einordnung, Zitat aus verschiedenen Quellen, keine wertenden Adjektive."
                    }
                ],
                verdictLabels: { free: "✅ Unabhängig", propaganda: "⚠️ Propaganda" },
                pointsPerArticle: 10
            },
            {
                type: "multiple-choice",
                visual: "🗞️",
                question: "Was ist ein typisches Merkmal von Qualitätsjournalismus?",
                options: [
                    "Eindeutige Parteinahme für eine Seite",
                    "Mehrere Quellen, Transparenz über Meinungen vs. Fakten",
                    "Möglichst emotionale Überschriften",
                    "Keine Einschränkungen durch Fakten"
                ],
                correctIndex: 1,
                explanation: "Seriöser Journalismus trennt Nachricht und Kommentar, nennt seine Quellen und ermöglicht Überprüfbarkeit.",
                points: 10
            },
            {
                type: "reflection",
                visual: "📱",
                question: "Wie überprüfst du im Alltag, ob eine Nachricht vertrauenswürdig ist? Beschreibe deine Strategie.",
                placeholder: "Deine Methoden zur Faktenüberprüfung...",
                points: 5
            }
        ]
    },

    /* =========================================================
       STATION 5 – PERSONENKULT (Suchbild)
       Spielmechanik: Elemente auf einem Bild finden
    ========================================================= */
    {
        id: "wahlen",
        name: "Personenkult",
        icon: "👁️",
        letter: "F",
        letterPosition: 4,
        color: "#c8922a",
        intro: "Autoritäre Regime inszenieren ihre Führungsfiguren als gottgleiche Helden. Lerne die typischen Merkmale von Personenkult erkennen – sie sind heute noch in manchen Ländern zu sehen.",
        questions: [
            {
                type: "seek-find",
                instruction: "Auf diesem Bild einer fiktiven Propagandaveranstaltung sind typische Merkmale von Personenkult versteckt. Finde alle markierten Elemente!",
                sceneEmoji: "🏟️",
                sceneDescription: "Massenkundgebung mit Riesenporträt",
                // Targets als Prozent-Koordinaten (x%, y%)
                seekTargets: [
                    { id: "t1", label: "Riesenporträt des Führers",  x: 50, y: 15, explanation: "Überlebensgroße Porträts signalisieren Gottgleichheit und Unausweichlichkeit." },
                    { id: "t2", label: "Massenaufmarsch",             x: 50, y: 70, explanation: "Organisierte Massen zeigen scheinbar universelle Zustimmung." },
                    { id: "t3", label: "Einheitliche Uniformen",      x: 20, y: 60, explanation: "Gleichförmigkeit unterdrückt Individualität und stärkt Kollektivgefühl." },
                    { id: "t4", label: "Reichs-Symbole / Flaggen",    x: 80, y: 35, explanation: "Nationalistische Symbole verschmelzen Führer mit dem Vaterland." },
                    { id: "t5", label: "Erhöhtes Podest / Bühne",    x: 50, y: 42, explanation: "Räumliche Erhöhung symbolisiert Überlegenheit und Macht." }
                ],
                pointsPerTarget: 6,
                minToPass: 4
            },
            {
                type: "multiple-choice",
                visual: "👑",
                question: "Was ist das Hauptziel von Personenkult?",
                options: [
                    "Den Staatschef populär und sympathisch machen",
                    "Eine kritische Loyalität gegenüber Institutionen fördern",
                    "Eine Person über das Gesetz und den Staat stellen, Kritik unmöglich machen",
                    "Das Volk besser über Politik informieren"
                ],
                correctIndex: 2,
                explanation: "Personenkult soll den Führenden über alle Kritik stellen. Wer zweifelt, zweifelt am 'Heilsbringer' selbst – das ist psychologisch sehr wirksam.",
                points: 10
            }
        ]
    },

    /* =========================================================
       STATION 6 – ZIVILCOURAGE (Interaktive Story)
       Spielmechanik: Verzweigte Geschichte mit Entscheidungen
    ========================================================= */
    {
        id: "zivilcourage",
        name: "Zivilcourage",
        icon: "🦸",
        letter: "A",
        letterPosition: 5,
        color: "#1e7e44",
        intro: "Zivilcourage heißt, für andere einzustehen – auch wenn es unbequem ist. In dieser Geschichte triffst du Entscheidungen, die zeigen, wie Mut im Alltag aussehen kann.",
        questions: [
            {
                type: "story",
                scenes: [
                    {
                        id: "scene1",
                        emoji: "🚌",
                        location: "Im Bus auf dem Weg zur Arbeit",
                        narrator: "Montagmorgen, 8:15 Uhr",
                        text: "Du sitzt im überfüllten Bus. Vor dir werden zwei Jugendliche von einem älteren Mann lautstark und rassistisch beleidigt. Die anderen Fahrgäste schauen weg.",
                        choices: [
                            { id: "c1a", icon: "🗣️", text: "Du sprichst die Jugendlichen direkt an: 'Alles okay? Setzt euch zu mir.'", positive: true,  nextScene: "scene2_good" },
                            { id: "c1b", icon: "📱", text: "Du zückst dein Handy und filmst heimlich.", positive: false, nextScene: "scene2_bad"  },
                            { id: "c1c", icon: "👀", text: "Du schaust aus dem Fenster und tust so, als hättest du nichts gehört.", positive: false, nextScene: "scene2_bad" }
                        ]
                    },
                    {
                        id: "scene2_good",
                        emoji: "🤝",
                        location: "Im Bus – nach deiner Reaktion",
                        narrator: "Kurz danach",
                        text: "Die Jugendlichen setzen sich zu dir. Der Mann hört auf. Andere Fahrgäste nicken dir zu. An der nächsten Haltestelle steigen zwei Mitfahrende aus und bedanken sich bei dir.",
                        choices: [
                            { id: "c2a", icon: "💬", text: "Du fragst die Jugendlichen, ob sie okay sind und ob sie solche Situationen öfter erleben.", positive: true, nextScene: "scene3" },
                            { id: "c2b", icon: "🎧", text: "Du steckst wieder deine Kopfhörer rein – gut gemacht, Aufgabe erfüllt.", positive: false, nextScene: "scene3" }
                        ]
                    },
                    {
                        id: "scene2_bad",
                        emoji: "😔",
                        location: "Im Bus – Stille Beobachtung",
                        narrator: "Kurz danach",
                        text: "Die Situation eskaliert. Die Jugendlichen steigen weinend aus. Mitfahrende auf ihren Handys. Der Mann verlässt den Bus mit einem Grinsen.",
                        choices: [
                            { id: "c2c", icon: "🚨", text: "Du meldest den Vorfall beim Fahrer und notierst die Linie.", positive: true,  nextScene: "scene3" },
                            { id: "c2d", icon: "😶", text: "Du gehst zur Arbeit und versuchst, den Vorfall zu vergessen.", positive: false, nextScene: "scene3" }
                        ]
                    },
                    {
                        id: "scene3",
                        emoji: "🏫",
                        location: "Schule / Arbeit – Pausengespräch",
                        narrator: "Am gleichen Tag",
                        text: "In der Pause erzählt ein Kollege lauthals einen Witz, der eine ethnische Gruppe abwertet. Die ganze Gruppe lacht – außer dir.",
                        choices: [
                            { id: "c3a", icon: "✋", text: "Du sagst ruhig: 'Ich find solche Witze nicht lustig. Sowas verletzt echte Menschen.'", positive: true,  nextScene: "end_good" },
                            { id: "c3b", icon: "😬", text: "Du lachst mit, um den Frieden zu wahren.", positive: false, nextScene: "end_ok"   },
                            { id: "c3c", icon: "🚶", text: "Du gehst still weg.", positive: false, nextScene: "end_ok" }
                        ]
                    }
                ],
                endScenes: {
                    end_good: {
                        type: "positive",
                        title: "Echte Zivilcourage!",
                        text: "Du hast mehrfach klar Stellung bezogen. Das war nicht immer einfach – aber genau das macht den Unterschied. Zivilcourage ist keine Einmaltat, sondern eine Haltung.",
                        points: 30
                    },
                    end_ok: {
                        type: "negative",
                        title: "Manchmal ist es schwer...",
                        text: "Du hast gezögert oder geschwiegen. Das ist menschlich. Wichtig ist, daraus zu lernen: Was hättest du anders machen können? Zivilcourage ist eine Fähigkeit – man kann sie üben.",
                        points: 10
                    }
                },
                pointsPerGoodChoice: 10
            },
            {
                type: "reflection",
                visual: "🤔",
                question: "Beschreibe eine Situation, in der du Zivilcourage gezeigt hast oder gerne gezeigt hättest. Was hat dich gezögert?",
                placeholder: "Deine Erfahrungen...",
                points: 5
            }
        ]
    }
];

/**
 * Hilfsfunktionen
 */
function getStationById(id) {
    return STATIONS.find(s => s.id === id) || null;
}
function getAllStationIds() {
    return STATIONS.map(s => s.id);
}