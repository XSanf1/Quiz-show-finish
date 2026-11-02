const socket = io();
const $ = id => document.getElementById(id);
let state = null, myId = null, isHost = false, myCode = "";
const DEFAULT_POINTS = [100,200,300,400,500];
const starterCategories = [
 {name:"Gaming",questions:[
  {points:100,question:"Welche Gegenstände nutzt man in Pokémon-Spielen, um wilde Pokémon zu fangen?",answer:"Pokébälle"},
  {points:200,question:"Wie heißt die Insel, auf der die meisten Kämpfe in Fortnite stattfinden?",answer:"Die Battle-Royale-Insel (der Kartenname ändert sich je nach Kapitel)"},
  {points:300,question:"Wie heißt die Firma, die Grand Theft Auto (GTA) entwickelt und veröffentlicht?",answer:"Rockstar Games"},
  {points:400,question:"Wie heißt Links Prinzessin in der The-Legend-of-Zelda-Reihe?",answer:"Zelda"},
  {points:500,question:"Wie heißt der Standard-Spielmodus in Rocket League, bei dem zwei Teams mit Autos Fußball spielen?",answer:"Soccar"}
 ]},
 {name:"Allgemeinwissen",questions:[
  {points:100,question:"Wie viele Kontinente gibt es im üblichen Sieben-Kontinente-Modell?",answer:"7"},
  {points:200,question:"Welche Stadt liegt an der Bosporus-Meerenge und auf zwei Kontinenten?",answer:"Istanbul"},
  {points:300,question:"Wie heißt die Hauptstadt von Kanada?",answer:"Ottawa"},
  {points:400,question:"Welches Land hat durch seine Überseegebiete die meisten Zeitzonen?",answer:"Frankreich"},
  {points:500,question:"Wie heißt die tiefste bekannte Stelle im Meer, die im Marianengraben liegt?",answer:"Challengertief im Marianengraben"}
 ]},
 {name:"Sport",questions:[
  {points:100,question:"Wie viele Spieler stehen bei einer Basketballmannschaft gleichzeitig auf dem Feld?",answer:"5"},
  {points:200,question:"Wie lang ist ein olympisches Schwimmbecken?",answer:"50 Meter"},
  {points:300,question:"In welcher Sportart gibt es die Wertung 'Ippon'?",answer:"Judo"},
  {points:400,question:"Wie viele Punkte zählt ein Touchdown im American Football vor dem Zusatzversuch?",answer:"6"},
  {points:500,question:"Welche drei Disziplinen gehören zum klassischen Triathlon?",answer:"Schwimmen, Radfahren und Laufen"}
 ]},
 {name:"Filme & Serien",questions:[
  {points:100,question:"Wie heißt die Schule für Hexerei in Harry Potter?",answer:"Hogwarts"},
  {points:200,question:"Wie heißt der Heimatplanet von Superman?",answer:"Krypton"},
  {points:300,question:"Wer führte Regie bei Jurassic Park (1993)?",answer:"Steven Spielberg"},
  {points:400,question:"Wie heißt die fiktive Stadt, in der Batman meistens Verbrechen bekämpft?",answer:"Gotham City"},
  {points:500,question:"Welcher Pixar-Film aus dem Jahr 1995 war der erste vollständig computeranimierte abendfüllende Kinofilm?",answer:"Toy Story"}
 ]},
 {name:"YouTube & Internet",questions:[
  {points:100,question:"Wie nennt man das Vorschaubild eines Videos?",answer:"Thumbnail"},
  {points:200,question:"Wofür steht die Abkürzung 'URL'?",answer:"Uniform Resource Locator"},
  {points:300,question:"Wie nennt man eine absichtlich irreführende Überschrift, die zum Klicken verleiten soll?",answer:"Clickbait"},
  {points:400,question:"Wie nennt man die Anmeldung, bei der man neben dem Passwort noch einen zweiten Nachweis braucht?",answer:"Zwei-Faktor-Authentifizierung (2FA)"},
  {points:500,question:"Wie heißt das sichere Protokoll, das Webseiten verschlüsselt überträgt und in der Adresse mit „https“ beginnt?",answer:"HTTPS"}
 ]},
 {name:"Naturwissenschaften",questions:[
  {points:100,question:"Welches chemische Symbol hat Gold?",answer:"Au"},
  {points:200,question:"Wie heißt der Vorgang, bei dem Pflanzen Lichtenergie in chemische Energie umwandeln?",answer:"Photosynthese"},
  {points:300,question:"Welches Gas macht den größten Anteil der Erdatmosphäre aus?",answer:"Stickstoff"},
  {points:400,question:"Wie nennt man die Einheit der elektrischen Widerstandsmessung?",answer:"Ohm"},
  {points:500,question:"Wie heißt die Grenze eines Schwarzen Lochs, ab der nichts mehr entkommen kann?",answer:"Ereignishorizont"}
 ]},
 {name:"Geschichte",questions:[
  {points:100,question:"In welchem Jahr fiel die Berliner Mauer?",answer:"1989"},
  {points:200,question:"Wie hieß das Schiff, mit dem Charles Darwin seine berühmte Forschungsreise machte?",answer:"HMS Beagle"},
  {points:300,question:"Welche antike Stadt wurde 79 n. Chr. beim Ausbruch des Vesuvs verschüttet?",answer:"Pompeji"},
  {points:400,question:"Wer war der erste Bundeskanzler der Bundesrepublik Deutschland?",answer:"Konrad Adenauer"},
  {points:500,question:"Wie heißt der Friedensschluss von 1648, der den Dreißigjährigen Krieg beendete?",answer:"Westfälischer Friede"}
 ]},
 {name:"Geografie",questions:[
  {points:100,question:"Welcher ist der größte Ozean der Erde?",answer:"Pazifischer Ozean"},
  {points:200,question:"Durch welche Hauptstadt fließt die Donau?",answer:"Unter anderem Wien, Bratislava, Budapest und Belgrad; als Quizantwort gilt Wien (eine der Hauptstädte)."},
  {points:300,question:"Wie heißt die längste Gebirgskette an Land?",answer:"Anden"},
  {points:400,question:"Welches Land hat die Hauptstadt Ulaanbaatar?",answer:"Mongolei"},
  {points:500,question:"Welcher See ist der tiefste der Erde?",answer:"Baikalsee"}
 ]},
 {name:"Musik",questions:[
  {points:100,question:"Wie viele Tasten hat ein gewöhnliches modernes Klavier?",answer:"88"},
  {points:200,question:"Welche Instrumentenfamilie umfasst Trompete und Posaune?",answer:"Blechblasinstrumente"},
  {points:300,question:"Wie nennt man in der Musik die Geschwindigkeit eines Stücks?",answer:"Tempo"},
  {points:400,question:"Welcher Komponist schrieb die Oper 'Die Zauberflöte'?",answer:"Wolfgang Amadeus Mozart"},
  {points:500,question:"Wie nennt man in der Musik den Abstand von einem Ton bis zum nächsthöheren Ton mit gleichem Namen?",answer:"Oktave"}
 ]},
 {name:"Essen & Trinken",questions:[
  {points:100,question:"Aus welcher Frucht werden Rosinen hergestellt?",answer:"Weintrauben"},
  {points:200,question:"Welches Gewürz gibt vielen Currys ihre gelbe Farbe?",answer:"Kurkuma"},
  {points:300,question:"Wie heißt die japanische Paste aus fermentierten Sojabohnen?",answer:"Miso"},
  {points:400,question:"Nenne eine Reissorte, die häufig für Risotto verwendet wird.",answer:"Arborio (auch Carnaroli)"},
  {points:500,question:"Wie heißt der Prozess, bei dem Hefe Zucker in Alkohol und Kohlendioxid umwandelt?",answer:"Gärung"}
 ]}
];
const extraQuestions = {
 Gaming:[
  {points:100,question:"Welches Spiel ist bekannt für das Bauen aus Blöcken und Creeper?",answer:"Minecraft"},
  {points:200,question:"In welchem Spiel fährt man mit Autos und versucht, einen Ball ins Tor zu schießen?",answer:"Rocket League"},
  {points:300,question:"Wie heißt die Währung, mit der man in Fortnite viele kosmetische Gegenstände kauft?",answer:"V-Bucks"},
  {points:400,question:"Wie heißt die Region, in der die ersten Pokémon-Spiele spielen?",answer:"Kanto"},
  {points:500,question:"Wie heißt die Organisation, gegen die man in GTA V unter anderem in der Story ermittelt?",answer:"FIB"}
 ],
 Allgemeinwissen:[
  {points:100,question:"Wie viele Tage hat eine Woche?",answer:"7"},
  {points:200,question:"Wie viele Minuten hat eine Stunde?",answer:"60"},
  {points:300,question:"Welches Organ pumpt Blut durch den menschlichen Körper?",answer:"Das Herz"},
  {points:400,question:"Wie heißt die Währung der Schweiz?",answer:"Schweizer Franken"},
  {points:500,question:"Welches chemische Element hat das Symbol Fe?",answer:"Eisen"}
 ],
 Sport:[
  {points:100,question:"Wie viele Tore stehen beim Fußball auf dem Spielfeld?",answer:"2"},
  {points:200,question:"Wie viele Ringe hat das olympische Symbol?",answer:"5"},
  {points:300,question:"Wie lange dauert ein reguläres Fußballspiel ohne Nachspielzeit?",answer:"90 Minuten"},
  {points:400,question:"In welcher Sportart gibt es einen Aufschlag und einen Smash?",answer:"Zum Beispiel Volleyball oder Badminton"},
  {points:500,question:"Wie lang ist ein Marathon ungefähr?",answer:"42,195 Kilometer"}
 ],
 "Filme & Serien":[
  {points:100,question:"Wie heißt der Schneemann aus Die Eiskönigin?",answer:"Olaf"},
  {points:200,question:"Wie heißt der Zauberer mit der Narbe auf der Stirn?",answer:"Harry Potter"},
  {points:300,question:"Wie heißt der Cowboy aus Toy Story?",answer:"Woody"},
  {points:400,question:"Wie heißt die Heimatwelt von Black Panther?",answer:"Wakanda"},
  {points:500,question:"Wie heißt der Regisseur der Filmtrilogie Der Herr der Ringe?",answer:"Peter Jackson"}
 ],
 "YouTube & Internet":[
  {points:100,question:"Welche Plattform ist vor allem für Videos bekannt?",answer:"YouTube"},
  {points:200,question:"Wie nennt man eine kurze private Nachricht im Internet oft?",answer:"DM / Direktnachricht"},
  {points:300,question:"Wofür steht die Abkürzung WLAN?",answer:"Wireless Local Area Network"},
  {points:400,question:"Wie heißt ein Programm, das Webseiten aufruft und anzeigt?",answer:"Browser"},
  {points:500,question:"Wie nennt man eine betrügerische Nachricht, die Passwörter stehlen soll?",answer:"Phishing"}
 ],
 Naturwissenschaften:[
  {points:100,question:"Welcher Planet ist unser Zuhause?",answer:"Die Erde"},
  {points:200,question:"Bei wie viel Grad Celsius gefriert Wasser ungefähr?",answer:"0 °C"},
  {points:300,question:"Welches Organ brauchen Menschen zum Atmen?",answer:"Die Lunge"},
  {points:400,question:"Wie heißt die Kraft, die Gegenstände zur Erde zieht?",answer:"Schwerkraft / Gravitation"},
  {points:500,question:"Welches Teilchen trägt eine negative elektrische Ladung?",answer:"Elektron"}
 ],
 Geschichte:[
  {points:100,question:"Wie hieß die Mauer, die Berlin bis 1989 teilte?",answer:"Berliner Mauer"},
  {points:200,question:"Welche antike Zivilisation baute die Pyramiden von Gizeh?",answer:"Die alten Ägypter"},
  {points:300,question:"In welchem Jahr begann der Zweite Weltkrieg in Europa?",answer:"1939"},
  {points:400,question:"Wie hieß die erste Frau im Weltall?",answer:"Walentina Tereschkowa"},
  {points:500,question:"Welche Revolution begann 1789 in Frankreich?",answer:"Die Französische Revolution"}
 ],
 Geografie:[
  {points:100,question:"Auf welchem Kontinent liegt Deutschland?",answer:"Europa"},
  {points:200,question:"Wie heißt die Hauptstadt von Italien?",answer:"Rom"},
  {points:300,question:"Welcher Fluss fließt durch London?",answer:"Themse"},
  {points:400,question:"Wie heißt die Hauptstadt von Australien?",answer:"Canberra"},
  {points:500,question:"Welches Gebirge trennt Europa und Asien teilweise?",answer:"Uralgebirge"}
 ],
 Musik:[
  {points:100,question:"Welches Instrument hat normalerweise schwarze und weiße Tasten?",answer:"Klavier"},
  {points:200,question:"Wie viele Saiten hat eine gewöhnliche Gitarre?",answer:"6"},
  {points:300,question:"Aus welchem Land stammt die Band ABBA?",answer:"Schweden"},
  {points:400,question:"Welcher Komponist wurde als 'Wunderkind' bekannt und hieß Wolfgang Amadeus mit Vornamen?",answer:"Mozart"},
  {points:500,question:"Wie nennt man ein Musikstück für ein Soloinstrument mit Orchester?",answer:"Konzert"}
 ],
 "Essen & Trinken":[
  {points:100,question:"Welche Frucht ist die Hauptzutat von Apfelsaft?",answer:"Äpfel"},
  {points:200,question:"Aus welcher Milch wird klassischer Mozzarella häufig hergestellt?",answer:"Kuhmilch oder Büffelmilch"},
  {points:300,question:"Welche Hülsenfrucht ist die Hauptzutat von Hummus?",answer:"Kichererbsen"},
  {points:400,question:"Wie heißt die japanische Suppe, die oft mit Nudeln serviert wird?",answer:"Ramen"},
  {points:500,question:"Welches Gewürz wird aus den getrockneten Narben einer Krokusart gewonnen?",answer:"Safran"}
 ]
};
starterCategories.forEach(category => category.questions.push(...(extraQuestions[category.name] || [])));
const moreQuestions2 = {
 Gaming:[
  [100,"Welche Firma stellt die PlayStation her?","Sony"],[100,"Wie nennt man einen Spielstand, den man speichert?","Savegame / Spielstand"],
  [200,"Wie heißt die Heldin aus der Portal-Spielreihe?","Chell"],[200,"Welche Farbe hat meist der klassische Among Us-Impostor in Memes?","Rot (in vielen Memes)"],
  [300,"Wie heißt die Stadt, in der Pokémon Rot und Blau beginnen?","Alabastia"],[300,"Wie nennt man in Minecraft den Endgegner im End?","Enderdrache"],
  [400,"Welches Studio entwickelte Stardew Valley ursprünglich?","ConcernedApe / Eric Barone"],[400,"Wie heißt die Hauptfigur der Metroid-Reihe?","Samus Aran"],
  [500,"Wie heißt die fiktive Region in The Witcher 3, in der Novigrad liegt?","Nördliche Königreiche (Novigrad liegt in Redanien)"],[500,"Welches Unternehmen entwickelte das Spiel Hollow Knight?","Team Cherry"]
 ],
 Allgemeinwissen:[
  [100,"Wie viele Monate hat ein Jahr?","12"],[100,"Wie viele Seiten hat ein Dreieck?","3"],
  [200,"Wie heißt die Hauptstadt von Österreich?","Wien"],[200,"Wie viele Minuten hat eine Viertelstunde?","15"],
  [300,"Welches Land ist flächenmäßig das größte der Welt?","Russland"],[300,"Wie heißt das Organ, das Insulin produziert?","Bauchspeicheldrüse"],
  [400,"Welche Einheit wird für elektrische Leistung verwendet?","Watt"],[400,"Wie nennt man ein Wort mit gleicher oder ähnlicher Bedeutung?","Synonym"],
  [500,"Welches chemische Element hat die Ordnungszahl 26?","Eisen"],[500,"Wie heißt die Wissenschaft von Erdbeben?","Seismologie"]
 ],
 Sport:[
  [100,"Wie nennt man im Fußball den Spieler, der das Tor verteidigt?","Torwart"],[100,"Wie viele Spieler hat ein Volleyballteam gleichzeitig auf dem Feld?","6"],
  [200,"Wie viele Punkte gibt ein Korb von außerhalb der Dreierlinie im Basketball?","3"],[200,"Bei welcher Sportart verwendet man einen Federball?","Badminton"],
  [300,"Wie lang ist ein Fußballtor zwischen den Pfosten?","7,32 Meter"],[300,"In welcher Sportart gibt es einen Grand Slam mit vier großen Turnieren?","Tennis"],
  [400,"Wie viele Disziplinen umfasst der Zehnkampf?","10"],[400,"Wie heißt der Bereich im Fechten, in dem gekämpft wird?","Fechtbahn / Planche"],
  [500,"Wie lang ist eine Runde auf einer olympischen Leichtathletikbahn?","400 Meter"],[500,"Wie heißt die Trophäe für den Sieger der NHL?","Stanley Cup"]
 ],
 "Filme & Serien":[
  [100,"Wie heißt die Eiskönigin aus Disneys Die Eiskönigin?","Elsa"],[100,"Welches Tier ist Simba in Der König der Löwen?","Ein Löwe"],
  [200,"Wie heißt der Roboter in WALL·E, der die Erde aufräumt?","WALL·E"],[200,"Wie heißt die Schule, die Wednesday Addams besucht?","Nevermore Academy"],
  [300,"Wie heißt der Heimatplanet von Spock in Star Trek?","Vulkan"],[300,"Wer spielt Iron Man im Marvel Cinematic Universe?","Robert Downey Jr."],
  [400,"Wie heißt die fiktive Stadt in Stranger Things?","Hawkins"],[400,"Wie heißt der Drache von Hiccup in Drachenzähmen leicht gemacht?","Ohnezahn"],
  [500,"Welcher Film gewann als erster nicht-englischsprachiger Film den Oscar für den besten Film?","Parasite"],[500,"Wie heißt die fiktive Nation in Black Panther?","Wakanda"]
 ],
 "YouTube & Internet":[
  [100,"Wie nennt man eine Person, die Videos auf YouTube veröffentlicht?","YouTuber / Creator"],[100,"Wie heißt das Symbol für eine E-Mail-Adresse?","@-Zeichen"],
  [200,"Wie nennt man ein Online-Tagebuch?","Blog"],[200,"Wofür steht die Abkürzung 'App'?","Application / Anwendung"],
  [300,"Wie nennt man ein Bild oder Video, das sich im Internet schnell verbreitet und oft verändert wird?","Meme"],[300,"Welche Plattform ist besonders für kurze vertikale Videos bekannt?","TikTok"],
  [400,"Wie nennt man eine gefälschte Website, die echte Seiten nachahmt, um Daten zu stehlen?","Phishing-Seite"],[400,"Was beschreibt der Begriff 'Open Source' bei Software?","Der Quellcode ist offen einsehbar und nutzbar gemäß Lizenz"],
  [500,"Wie heißt das System, das Domainnamen in IP-Adressen übersetzt?","DNS"],[500,"Was bedeutet die Abkürzung VPN?","Virtual Private Network"]
 ],
 Naturwissenschaften:[
  [100,"Welcher Stern ist der Erde am nächsten?","Die Sonne"],[100,"Wie viele Beine hat ein Insekt?","6"],
  [200,"Wie heißt gefrorenes Wasser?","Eis"],[200,"Welches Organ pumpt Blut durch den Körper?","Herz"],
  [300,"Welches Gas nehmen Pflanzen bei der Photosynthese auf?","Kohlenstoffdioxid"],[300,"Wie nennt man Tiere, die Pflanzen und Fleisch fressen?","Allesfresser / Omnivoren"],
  [400,"Wie heißt der Übergang von flüssig zu gasförmig?","Verdampfen / Verdampfung"],[400,"Welche Blutkörperchen transportieren vor allem Sauerstoff?","Rote Blutkörperchen"],
  [500,"Wie nennt man die kleinste Einheit eines chemischen Elements?","Atom"],[500,"Welche Skala wird häufig zur Angabe der Säurestärke einer Lösung verwendet?","pH-Skala"]
 ],
 Geschichte:[
  [100,"Wie hieß der erste Mensch auf dem Mond?","Neil Armstrong"],[100,"Welche antike Bauwerke stehen in Gizeh?","Pyramiden"],
  [200,"Wie hieß die Königin des alten Ägyptens, die mit Julius Caesar verbunden war?","Kleopatra"],[200,"In welchem Land begann die Renaissance?","Italien"],
  [300,"Wer war der erste Mensch im Weltall?","Juri Gagarin"],[300,"Welche Stadt war Hauptstadt des Byzantinischen Reiches?","Konstantinopel"],
  [400,"In welchem Jahr begann die Französische Revolution?","1789"],[400,"Wie hieß die Handelsroute zwischen Europa und Asien, bekannt für Seide?","Seidenstraße"],
  [500,"Welcher Vertrag regelte 1919 offiziell den Frieden mit Deutschland nach dem Ersten Weltkrieg?","Vertrag von Versailles"],[500,"Wie heißt die Epoche des Wiederauflebens antiker Kunst und Wissenschaft in Europa?","Renaissance"]
 ],
 Geografie:[
  [100,"Auf welchem Kontinent liegt Brasilien?","Südamerika"],[100,"Wie heißt der größte Kontinent?","Asien"],
  [200,"Wie heißt die Hauptstadt von Spanien?","Madrid"],[200,"Welcher Fluss fließt durch Paris?","Seine"],
  [300,"Welches Land hat die Form eines Stiefels?","Italien"],[300,"Wie heißt die größte Insel der Welt, die kein Kontinent ist?","Grönland"],
  [400,"Wie heißt die Hauptstadt von Neuseeland?","Wellington"],[400,"Welcher Fluss ist der längste Afrikas?","Nil"],
  [500,"Wie heißt die Wüste, die sich über Teile der Mongolei und China erstreckt?","Gobi"],[500,"Welcher Staat ist vollständig von Südafrika umgeben?","Lesotho"]
 ],
 Musik:[
  [100,"Welches Instrument spielt man mit Tasten und Pedalen?","Klavier"],[100,"Wie nennt man eine Gruppe von Menschen, die gemeinsam singt?","Chor"],
  [200,"Wie viele Saiten hat eine Violine?","4"],[200,"Welches Blechblasinstrument hat oft einen Zug?","Posaune"],
  [300,"Wie nennt man den Text eines Liedes?","Liedtext"],[300,"Welche Band veröffentlichte das Album 'Abbey Road'?","The Beatles"],
  [400,"Wie nennt man das gleichzeitige Erklingen verschiedener Töne?","Akkord / Harmonie (je nach Kontext)"],[400,"Welcher Komponist schrieb die 9. Sinfonie mit der 'Ode an die Freude'?","Ludwig van Beethoven"],
  [500,"Wie heißt die Stimmlage zwischen Sopran und Alt?","Mezzosopran"],[500,"Wie nennt man eine kurze musikalische Idee, die ein Werk prägt?","Motiv"]
 ],
 "Essen & Trinken":[
  [100,"Welches Gemüse ist die Hauptzutat klassischer Pommes frites?","Kartoffeln"],[100,"Welche Frucht ist für ihre gelbe Schale und ihren sauren Saft bekannt?","Zitrone"],
  [200,"Welche Getreideart ist die Hauptzutat von klassischem Brot?","Weizen oder Roggen (je nach Brot)"],[200,"Wie heißt italienischer Reisbrei, der oft als Hauptgericht serviert wird?","Risotto"],
  [300,"Welche Bohne wird für die Herstellung von Schokolade verwendet?","Kakaobohne"],[300,"Wie heißt die spanische Reispfanne, oft mit Safran?","Paella"],
  [400,"Welches Gewürz ist eine wichtige Zutat in einer klassischen Sauce béarnaise?","Estragon"],[400,"Wie heißt die koreanische Beilage aus fermentiertem Gemüse, oft Chinakohl?","Kimchi"],
  [500,"Wie heißt die französische Technik, bei der Lebensmittel langsam in Fett gegart werden?","Confitieren"],[500,"Welcher Käse wird traditionell für griechischen Salat verwendet?","Feta"]
 ]
};
for (const category of starterCategories) {
  for (const [points, question, answer] of (moreQuestions2[category.name] || [])) {
    category.questions.push({points, question, answer});
  }
}


// Großer Reservepool: mindestens 20 unterschiedliche Einträge je Kategorie und Punktestufe.
const reserveFacts = {
  "Gaming": [
    [
      "Minecraft",
      "Welches Sandbox-Spiel enthält den Enderdrachen?",
      "Minecraft"
    ],
    [
      "Rocket League",
      "In welchem Spiel fahren Autos Fußball?",
      "Rocket League"
    ],
    [
      "Fortnite",
      "Wie heißt die Spielwährung für viele Skins?",
      "V-Bucks"
    ],
    [
      "Pokémon",
      "Wie heißt die Region der ersten Pokémon-Spiele?",
      "Kanto"
    ],
    [
      "The Legend of Zelda",
      "Wie heißt der Held der Reihe?",
      "Link"
    ],
    [
      "Grand Theft Auto V",
      "Wie heißt die fiktive Stadt von GTA V?",
      "Los Santos"
    ],
    [
      "Among Us",
      "Wie heißt die Rolle, die heimlich Sabotage betreibt?",
      "Impostor"
    ],
    [
      "Super Mario",
      "Wie heißt Marios Bruder?",
      "Luigi"
    ],
    [
      "The Sims",
      "Wie heißt die Lebenssimulation mit Sims?",
      "Die Sims"
    ],
    [
      "Overwatch",
      "Wie heißt der Heiler mit dem Stab und den Flügeln?",
      "Mercy"
    ],
    [
      "League of Legends",
      "Wie heißt die Karte des klassischen 5-gegen-5-Modus?",
      "Summoner’s Rift"
    ],
    [
      "Stardew Valley",
      "Wie heißt das Genre von Stardew Valley?",
      "Landwirtschafts-/Lebenssimulation"
    ],
    [
      "Terraria",
      "Wie wird Terraria oft beschrieben?",
      "2D-Sandbox-/Action-Adventure"
    ],
    [
      "Redstone",
      "Welcher Minecraft-Stoff überträgt Redstone-Signale?",
      "Redstone-Staub"
    ],
    [
      "PlayStation",
      "Welche Firma stellt PlayStation-Konsolen her?",
      "Sony"
    ],
    [
      "Xbox",
      "Welche Firma stellt Xbox-Konsolen her?",
      "Microsoft"
    ],
    [
      "Steam",
      "Wie heißt die PC-Spieleplattform von Valve?",
      "Steam"
    ],
    [
      "Hyrule",
      "Wie heißt das Königreich vieler Zelda-Spiele?",
      "Hyrule"
    ],
    [
      "Pikachu",
      "Welches Pokémon ist das bekannte Maskottchen der Reihe?",
      "Pikachu"
    ],
    [
      "Elden Ring",
      "Welches Studio entwickelte Elden Ring?",
      "FromSoftware"
    ]
  ],
  "Allgemeinwissen": [
    [
      "12",
      "Wie viele Monate hat ein Jahr?",
      "12"
    ],
    [
      "3",
      "Wie viele Seiten hat ein Dreieck?",
      "3"
    ],
    [
      "Wien",
      "Wie heißt die Hauptstadt Österreichs?",
      "Wien"
    ],
    [
      "Ottawa",
      "Wie heißt die Hauptstadt Kanadas?",
      "Ottawa"
    ],
    [
      "Russland",
      "Welches Land ist flächenmäßig das größte?",
      "Russland"
    ],
    [
      "Watt",
      "In welcher Einheit misst man Leistung?",
      "Watt"
    ],
    [
      "Eisen",
      "Welches Element hat das Symbol Fe?",
      "Eisen"
    ],
    [
      "Seismologie",
      "Wie heißt die Wissenschaft von Erdbeben?",
      "Seismologie"
    ],
    [
      "Pazifik",
      "Welcher Ozean ist der größte?",
      "Pazifischer Ozean"
    ],
    [
      "88",
      "Wie viele Tasten hat ein Standardklavier?",
      "88"
    ],
    [
      "60",
      "Wie viele Sekunden hat eine Minute?",
      "60"
    ],
    [
      "Sahara",
      "Wie heißt die größte heiße Wüste?",
      "Sahara"
    ],
    [
      "Venus",
      "Welcher Planet ist der Erde größenmäßig ähnlich und sehr heiß?",
      "Venus"
    ],
    [
      "Sauerstoff",
      "Welches Gas benötigen Menschen für die Zellatmung?",
      "Sauerstoff"
    ],
    [
      "Japan",
      "In welchem Land liegt Tokio?",
      "Japan"
    ],
    [
      "Euro",
      "Welche Währung wird in Deutschland verwendet?",
      "Euro"
    ],
    [
      "7",
      "Wie viele Kontinente hat das Sieben-Kontinente-Modell?",
      "7"
    ],
    [
      "Herz",
      "Welches Organ pumpt Blut durch den Körper?",
      "Herz"
    ],
    [
      "DNA",
      "Wie heißt der Träger der Erbinformation?",
      "DNA"
    ],
    [
      "Amazonas",
      "Welcher Fluss führt besonders viel Wasser?",
      "Amazonas"
    ]
  ],
  "Sport": [
    [
      "Torwart",
      "Wie heißt der Spieler, der das Fußballtor verteidigt?",
      "Torwart"
    ],
    [
      "6",
      "Wie viele Spieler eines Volleyballteams stehen gleichzeitig auf dem Feld?",
      "6"
    ],
    [
      "3",
      "Wie viele Punkte zählt ein Basketballwurf hinter der Dreierlinie?",
      "3"
    ],
    [
      "Badminton",
      "In welcher Sportart schlägt man einen Federball?",
      "Badminton"
    ],
    [
      "7,32 Meter",
      "Wie breit ist ein Fußballtor zwischen den Pfosten?",
      "7,32 Meter"
    ],
    [
      "Tennis",
      "In welcher Sportart gibt es vier Grand-Slam-Turniere?",
      "Tennis"
    ],
    [
      "10",
      "Wie viele Disziplinen hat der Zehnkampf?",
      "10"
    ],
    [
      "400 Meter",
      "Wie lang ist eine Runde auf der üblichen Leichtathletikbahn?",
      "400 Meter"
    ],
    [
      "Stanley Cup",
      "Wie heißt die Meistertrophäe der NHL?",
      "Stanley Cup"
    ],
    [
      "Judo",
      "In welcher Sportart gibt es die Wertung Ippon?",
      "Judo"
    ],
    [
      "6 Punkte",
      "Wie viele Punkte bringt ein Touchdown?",
      "6"
    ],
    [
      "42,195 km",
      "Wie lang ist ein Marathon?",
      "42,195 Kilometer"
    ],
    [
      "Schwimmen",
      "Welche Disziplin gehört zu jedem klassischen Triathlon?",
      "Schwimmen"
    ],
    [
      "Golf",
      "In welcher Sportart versucht man, einen Ball einzulochen?",
      "Golf"
    ],
    [
      "Rugby",
      "In welcher Sportart darf der Ball nach vorne getragen werden, aber nicht nach vorne gepasst werden?",
      "Rugby"
    ],
    [
      "Fechten",
      "Wie heißt die Sportart mit Florett, Degen und Säbel?",
      "Fechten"
    ],
    [
      "Cricket",
      "Bei welcher Sportart verwendet man Wicket und Schläger?",
      "Cricket"
    ],
    [
      "Biathlon",
      "Welche zwei Disziplinen kombiniert Biathlon im Winter?",
      "Skilanglauf und Schießen"
    ],
    [
      "Tour de France",
      "Wie heißt das berühmte Radrennen durch Frankreich?",
      "Tour de France"
    ],
    [
      "Schach",
      "Welche Figur zieht im Schach in L-Form?",
      "Springer"
    ]
  ],
  "Filme & Serien": [
    [
      "Hogwarts",
      "Wie heißt die Zauberschule in Harry Potter?",
      "Hogwarts"
    ],
    [
      "Krypton",
      "Wie heißt Supermans Heimatplanet?",
      "Krypton"
    ],
    [
      "Steven Spielberg",
      "Wer führte Regie bei Jurassic Park (1993)?",
      "Steven Spielberg"
    ],
    [
      "Gotham City",
      "In welcher Stadt kämpft Batman meist gegen Verbrechen?",
      "Gotham City"
    ],
    [
      "Toy Story",
      "Wie heißt der Pixar-Film von 1995 mit Woody und Buzz?",
      "Toy Story"
    ],
    [
      "Elsa",
      "Wie heißt die Eiskönigin aus Disneys Die Eiskönigin?",
      "Elsa"
    ],
    [
      "Simba",
      "Wie heißt der junge Löwe in Der König der Löwen?",
      "Simba"
    ],
    [
      "WALL·E",
      "Wie heißt der Roboter, der Müll auf der Erde sammelt?",
      "WALL·E"
    ],
    [
      "Nevermore Academy",
      "Welche Schule besucht Wednesday Addams in der Serie Wednesday?",
      "Nevermore Academy"
    ],
    [
      "Vulkan",
      "Von welchem Planeten stammt Spock in Star Trek?",
      "Vulkan"
    ],
    [
      "Robert Downey Jr.",
      "Wer spielte Iron Man im MCU?",
      "Robert Downey Jr."
    ],
    [
      "Hawkins",
      "In welcher Stadt spielt Stranger Things hauptsächlich?",
      "Hawkins"
    ],
    [
      "Ohnezahn",
      "Wie heißt Hiccups Drache?",
      "Ohnezahn"
    ],
    [
      "Parasite",
      "Welcher südkoreanische Film gewann den Oscar für den besten Film?",
      "Parasite"
    ],
    [
      "Wakanda",
      "Wie heißt Black Panthers fiktive Heimatnation?",
      "Wakanda"
    ],
    [
      "Peter Jackson",
      "Wer führte Regie bei der Herr-der-Ringe-Filmtrilogie?",
      "Peter Jackson"
    ],
    [
      "Darth Vader",
      "Wie heißt Lukes Vater in Star Wars?",
      "Darth Vader"
    ],
    [
      "Shrek",
      "Wie heißt der grüne Oger aus dem gleichnamigen Film?",
      "Shrek"
    ],
    [
      "Pixar",
      "Welches Studio produzierte Findet Nemo?",
      "Pixar"
    ],
    [
      "Sherlock Holmes",
      "Wie heißt der berühmte Detektiv aus den Geschichten von Arthur Conan Doyle?",
      "Sherlock Holmes"
    ]
  ],
  "YouTube & Internet": [
    [
      "YouTube",
      "Welche Plattform ist besonders für Videos bekannt?",
      "YouTube"
    ],
    [
      "@",
      "Welches Zeichen gehört typischerweise in eine E-Mail-Adresse?",
      "@"
    ],
    [
      "Blog",
      "Wie nennt man ein Online-Tagebuch?",
      "Blog"
    ],
    [
      "Application",
      "Wofür steht „App“ ausgeschrieben?",
      "Application"
    ],
    [
      "Meme",
      "Wie nennt man einen Internetwitz, der oft kopiert und verändert wird?",
      "Meme"
    ],
    [
      "TikTok",
      "Welche Plattform ist besonders für kurze Hochkantvideos bekannt?",
      "TikTok"
    ],
    [
      "Phishing",
      "Wie heißt der Versuch, mit gefälschten Nachrichten Zugangsdaten zu stehlen?",
      "Phishing"
    ],
    [
      "Open Source",
      "Wie nennt man Software, deren Quellcode öffentlich einsehbar ist?",
      "Open Source"
    ],
    [
      "DNS",
      "Welches System übersetzt Domainnamen in IP-Adressen?",
      "DNS"
    ],
    [
      "VPN",
      "Wofür steht die Abkürzung VPN?",
      "Virtual Private Network"
    ],
    [
      "Browser",
      "Wie nennt man ein Programm zum Aufrufen von Webseiten?",
      "Browser"
    ],
    [
      "Thumbnail",
      "Wie heißt das Vorschaubild eines Videos?",
      "Thumbnail"
    ],
    [
      "URL",
      "Wofür steht die Abkürzung URL?",
      "Uniform Resource Locator"
    ],
    [
      "2FA",
      "Wie heißt die Anmeldung mit einem zweiten Nachweis zusätzlich zum Passwort?",
      "Zwei-Faktor-Authentifizierung"
    ],
    [
      "HTTPS",
      "Welches Protokoll kennzeichnet verschlüsselte Webseitenverbindungen?",
      "HTTPS"
    ],
    [
      "DM",
      "Wie nennt man eine Direktnachricht häufig abgekürzt?",
      "DM"
    ],
    [
      "Upload",
      "Wie heißt das Hochladen einer Datei ins Internet?",
      "Upload"
    ],
    [
      "Cloud",
      "Wie nennt man Online-Speicher, auf den man über das Internet zugreift?",
      "Cloud"
    ],
    [
      "Algorithmus",
      "Was entscheidet auf vielen Plattformen mit, welche Inhalte vorgeschlagen werden?",
      "Algorithmus"
    ],
    [
      "Cookie",
      "Wie heißt eine kleine Datenspeicherung, die eine Website im Browser ablegt?",
      "Cookie"
    ]
  ],
  "Naturwissenschaften": [
    [
      "Erde",
      "Auf welchem Planeten leben wir?",
      "Erde"
    ],
    [
      "0 °C",
      "Bei welcher Temperatur gefriert Wasser ungefähr?",
      "0 °C"
    ],
    [
      "Lunge",
      "Welches Organ ermöglicht den Gasaustausch beim Atmen?",
      "Lunge"
    ],
    [
      "Gravitation",
      "Wie heißt die Anziehung zwischen Körpern mit Masse?",
      "Gravitation"
    ],
    [
      "Elektron",
      "Welches Teilchen trägt eine negative elektrische Ladung?",
      "Elektron"
    ],
    [
      "Sonne",
      "Welcher Stern ist der Erde am nächsten?",
      "Sonne"
    ],
    [
      "6",
      "Wie viele Beine hat ein Insekt?",
      "6"
    ],
    [
      "Eis",
      "Wie nennt man gefrorenes Wasser?",
      "Eis"
    ],
    [
      "Kohlenstoffdioxid",
      "Welches Gas nehmen Pflanzen bei der Photosynthese auf?",
      "Kohlenstoffdioxid"
    ],
    [
      "Omnivoren",
      "Wie nennt man Tiere, die Pflanzen und Tiere fressen?",
      "Allesfresser / Omnivoren"
    ],
    [
      "Verdampfung",
      "Wie heißt der Übergang von flüssig zu gasförmig?",
      "Verdampfung"
    ],
    [
      "rote Blutkörperchen",
      "Welche Blutkörperchen transportieren vor allem Sauerstoff?",
      "Rote Blutkörperchen"
    ],
    [
      "Atom",
      "Wie heißt die kleinste Einheit eines chemischen Elements?",
      "Atom"
    ],
    [
      "pH-Skala",
      "Welche Skala zeigt an, ob eine Lösung sauer oder basisch ist?",
      "pH-Skala"
    ],
    [
      "Au",
      "Welches chemische Symbol hat Gold?",
      "Au"
    ],
    [
      "Photosynthese",
      "Wie heißt der Prozess, bei dem Pflanzen Lichtenergie nutzen?",
      "Photosynthese"
    ],
    [
      "Stickstoff",
      "Welches Gas macht den größten Anteil der Atmosphäre aus?",
      "Stickstoff"
    ],
    [
      "Ohm",
      "In welcher Einheit wird elektrischer Widerstand gemessen?",
      "Ohm"
    ],
    [
      "Ereignishorizont",
      "Wie heißt die Grenze eines Schwarzen Lochs, hinter der nichts entkommt?",
      "Ereignishorizont"
    ],
    [
      "Mitochondrien",
      "Welche Zellorganellen erzeugen einen großen Teil der nutzbaren Zellenergie?",
      "Mitochondrien"
    ]
  ],
  "Geschichte": [
    [
      "1989",
      "In welchem Jahr fiel die Berliner Mauer?",
      "1989"
    ],
    [
      "HMS Beagle",
      "Wie hieß das Schiff von Charles Darwins Forschungsreise?",
      "HMS Beagle"
    ],
    [
      "Pompeji",
      "Welche Stadt wurde 79 n. Chr. vom Vesuv verschüttet?",
      "Pompeji"
    ],
    [
      "Konrad Adenauer",
      "Wer war der erste Bundeskanzler der Bundesrepublik Deutschland?",
      "Konrad Adenauer"
    ],
    [
      "Westfälischer Friede",
      "Wie heißt der Friedensschluss von 1648?",
      "Westfälischer Friede"
    ],
    [
      "Neil Armstrong",
      "Wer war der erste Mensch auf dem Mond?",
      "Neil Armstrong"
    ],
    [
      "Pyramiden von Gizeh",
      "Welche berühmten Bauwerke errichteten die alten Ägypter in Gizeh?",
      "Pyramiden"
    ],
    [
      "Kleopatra",
      "Wie hieß die bekannte Königin des alten Ägyptens?",
      "Kleopatra"
    ],
    [
      "Italien",
      "In welchem heutigen Land begann die Renaissance?",
      "Italien"
    ],
    [
      "Juri Gagarin",
      "Wer war der erste Mensch im Weltall?",
      "Juri Gagarin"
    ],
    [
      "Konstantinopel",
      "Wie hieß Istanbul früher als Hauptstadt des Byzantinischen Reiches?",
      "Konstantinopel"
    ],
    [
      "1789",
      "In welchem Jahr begann die Französische Revolution?",
      "1789"
    ],
    [
      "Seidenstraße",
      "Wie hieß die Handelsroute zwischen Europa und Asien?",
      "Seidenstraße"
    ],
    [
      "Vertrag von Versailles",
      "Welcher Vertrag regelte 1919 den Frieden mit Deutschland nach dem Ersten Weltkrieg?",
      "Vertrag von Versailles"
    ],
    [
      "Renaissance",
      "Wie heißt die Epoche der Wiederentdeckung antiker Kunst und Wissenschaft?",
      "Renaissance"
    ],
    [
      "1939",
      "In welchem Jahr begann der Zweite Weltkrieg in Europa?",
      "1939"
    ],
    [
      "Christopher Kolumbus",
      "Welcher Seefahrer erreichte 1492 die Karibik auf einer spanischen Expedition?",
      "Christoph Kolumbus"
    ],
    [
      "Reformation",
      "Wie nennt man die religiöse Bewegung, die mit Martin Luther verbunden ist?",
      "Reformation"
    ],
    [
      "Industrialisierung",
      "Wie nennt man den Wandel zur maschinellen Fabrikproduktion?",
      "Industrialisierung"
    ],
    [
      "Antike",
      "Wie heißt die historische Epoche der Griechen und Römer vor dem Mittelalter?",
      "Antike"
    ]
  ],
  "Geografie": [
    [
      "Pazifischer Ozean",
      "Welcher Ozean ist der größte der Erde?",
      "Pazifischer Ozean"
    ],
    [
      "Wien",
      "Nenne eine Hauptstadt, durch die die Donau fließt.",
      "Wien"
    ],
    [
      "Anden",
      "Wie heißt die lange Gebirgskette an der Westseite Südamerikas?",
      "Anden"
    ],
    [
      "Mongolei",
      "Welches Land hat Ulaanbaatar als Hauptstadt?",
      "Mongolei"
    ],
    [
      "Baikalsee",
      "Welcher See ist der tiefste der Erde?",
      "Baikalsee"
    ],
    [
      "Südamerika",
      "Auf welchem Kontinent liegt Brasilien?",
      "Südamerika"
    ],
    [
      "Asien",
      "Welcher Kontinent ist flächenmäßig der größte?",
      "Asien"
    ],
    [
      "Madrid",
      "Wie heißt die Hauptstadt Spaniens?",
      "Madrid"
    ],
    [
      "Seine",
      "Welcher Fluss fließt durch Paris?",
      "Seine"
    ],
    [
      "Italien",
      "Welches Land wird oft mit einem Stiefel verglichen?",
      "Italien"
    ],
    [
      "Grönland",
      "Wie heißt die größte Insel der Welt, die kein Kontinent ist?",
      "Grönland"
    ],
    [
      "Wellington",
      "Wie heißt die Hauptstadt Neuseelands?",
      "Wellington"
    ],
    [
      "Nil",
      "Welcher Fluss gilt als einer der längsten Afrikas?",
      "Nil"
    ],
    [
      "Gobi",
      "Wie heißt die Wüste in Teilen der Mongolei und Chinas?",
      "Gobi"
    ],
    [
      "Lesotho",
      "Welcher Staat ist vollständig von Südafrika umgeben?",
      "Lesotho"
    ],
    [
      "Canberra",
      "Wie heißt die Hauptstadt Australiens?",
      "Canberra"
    ],
    [
      "Ural",
      "Welches Gebirge gilt als Teil der Grenze zwischen Europa und Asien?",
      "Uralgebirge"
    ],
    [
      "Themse",
      "Welcher Fluss fließt durch London?",
      "Themse"
    ],
    [
      "Äquator",
      "Wie heißt die gedachte Linie bei 0 Grad geografischer Breite?",
      "Äquator"
    ],
    [
      "Sahara",
      "Wie heißt die große Wüste in Nordafrika?",
      "Sahara"
    ]
  ],
  "Musik": [
    [
      "Klavier",
      "Welches Instrument hat schwarze und weiße Tasten?",
      "Klavier"
    ],
    [
      "6",
      "Wie viele Saiten hat eine gewöhnliche Gitarre?",
      "6"
    ],
    [
      "Schweden",
      "Aus welchem Land stammt ABBA?",
      "Schweden"
    ],
    [
      "Mozart",
      "Welcher Komponist schrieb Die Zauberflöte?",
      "Wolfgang Amadeus Mozart"
    ],
    [
      "Konzert",
      "Wie nennt man ein Werk für Soloinstrument und Orchester?",
      "Konzert"
    ],
    [
      "Chor",
      "Wie nennt man eine Gruppe, die gemeinsam singt?",
      "Chor"
    ],
    [
      "4",
      "Wie viele Saiten hat eine Violine?",
      "4"
    ],
    [
      "Posaune",
      "Welches Blechblasinstrument besitzt oft einen Zug?",
      "Posaune"
    ],
    [
      "Liedtext",
      "Wie nennt man die gesungenen Wörter eines Liedes?",
      "Liedtext"
    ],
    [
      "The Beatles",
      "Welche Band veröffentlichte Abbey Road?",
      "The Beatles"
    ],
    [
      "Akkord",
      "Wie nennt man mehrere gleichzeitig erklingende Töne?",
      "Akkord"
    ],
    [
      "Beethoven",
      "Wer komponierte die 9. Sinfonie mit der Ode an die Freude?",
      "Ludwig van Beethoven"
    ],
    [
      "Mezzosopran",
      "Welche weibliche Stimmlage liegt zwischen Sopran und Alt?",
      "Mezzosopran"
    ],
    [
      "Motiv",
      "Wie nennt man eine kurze musikalische Idee, die ein Werk prägt?",
      "Motiv"
    ],
    [
      "Oktave",
      "Wie heißt der Abstand zwischen zwei gleichnamigen Tönen?",
      "Oktave"
    ],
    [
      "Tempo",
      "Wie nennt man die Geschwindigkeit eines Musikstücks?",
      "Tempo"
    ],
    [
      "Blechblasinstrumente",
      "Zu welcher Instrumentenfamilie gehören Trompete und Posaune?",
      "Blechblasinstrumente"
    ],
    [
      "Schlagzeug",
      "Welches Instrument wird typischerweise mit Sticks gespielt?",
      "Schlagzeug"
    ],
    [
      "Oper",
      "Wie nennt man ein Bühnenwerk, in dem Gesang zentral ist?",
      "Oper"
    ],
    [
      "Bassschlüssel",
      "Welcher Notenschlüssel wird häufig für tiefe Töne verwendet?",
      "Bassschlüssel"
    ]
  ],
  "Essen & Trinken": [
    [
      "Weintrauben",
      "Aus welcher Frucht werden Rosinen hergestellt?",
      "Weintrauben"
    ],
    [
      "Kurkuma",
      "Welches Gewürz färbt viele Currys gelb?",
      "Kurkuma"
    ],
    [
      "Miso",
      "Wie heißt die japanische Paste aus fermentierten Sojabohnen?",
      "Miso"
    ],
    [
      "Arborio",
      "Welche Reissorte wird oft für Risotto verwendet?",
      "Arborio"
    ],
    [
      "Gärung",
      "Wie heißt der Prozess, bei dem Hefe Zucker umwandelt?",
      "Gärung"
    ],
    [
      "Kartoffeln",
      "Welches Gemüse ist die Hauptzutat klassischer Pommes?",
      "Kartoffeln"
    ],
    [
      "Zitrone",
      "Welche gelbe Frucht hat sauren Saft?",
      "Zitrone"
    ],
    [
      "Weizen",
      "Welches Getreide wird häufig für Brot verwendet?",
      "Weizen"
    ],
    [
      "Risotto",
      "Wie heißt das italienische Reisgericht, das cremig gekocht wird?",
      "Risotto"
    ],
    [
      "Kakaobohne",
      "Aus welcher Bohne wird Schokolade hergestellt?",
      "Kakaobohne"
    ],
    [
      "Paella",
      "Wie heißt die spanische Reispfanne?",
      "Paella"
    ],
    [
      "Estragon",
      "Welches Kraut ist typisch für Sauce béarnaise?",
      "Estragon"
    ],
    [
      "Kimchi",
      "Wie heißt die koreanische Beilage aus fermentiertem Gemüse?",
      "Kimchi"
    ],
    [
      "Confitieren",
      "Wie heißt eine französische Garmethode in Fett bei niedriger Temperatur?",
      "Confitieren"
    ],
    [
      "Feta",
      "Welcher Käse wird traditionell oft für griechischen Salat verwendet?",
      "Feta"
    ],
    [
      "Kichererbsen",
      "Welche Hülsenfrucht ist Hauptzutat von Hummus?",
      "Kichererbsen"
    ],
    [
      "Ramen",
      "Wie heißt die japanische Nudelsuppe?",
      "Ramen"
    ],
    [
      "Safran",
      "Welches sehr teure Gewürz stammt aus Krokusnarben?",
      "Safran"
    ],
    [
      "Basilikum",
      "Welches Kraut ist typisch für klassisches grünes Pesto?",
      "Basilikum"
    ],
    [
      "Tofu",
      "Welches Lebensmittel wird aus geronnener Sojamilch hergestellt?",
      "Tofu"
    ]
  ]
};

const reserveTemplates = {
 100: (item) => ({question:item[1], answer:item[2]}),
 200: (item) => ({question:`Zusatzfrage: ${item[1]}`, answer:item[2]}),
 300: (item) => ({question:`Wissensfrage: ${item[1]}`, answer:item[2]}),
 400: (item) => ({question:`Knifflige Frage: ${item[1]}`, answer:item[2]}),
 500: (item) => ({question:`Expertenfrage: ${item[1]}`, answer:item[2]})
};
for (const category of starterCategories) {
  const factsForCategory = reserveFacts[category.name] || [];
  for (const points of DEFAULT_POINTS) {
    const existing = category.questions.filter(q => Number(q.points) === points);
    const seenText = new Set(existing.map(q => q.question));
    for (let i = 0; i < factsForCategory.length && existing.length < 20; i++) {
      const item = factsForCategory[(i + points / 100 - 1) % factsForCategory.length];
      const built = reserveTemplates[points](item);
      if (!seenText.has(built.question)) {
        existing.push({points, ...built}); seenText.add(built.question);
      }
    }
    // Keep exactly 20 unique questions per score tier; vary the prompt framing if an existing prompt collides.
    let n = 1;
    while (existing.length < 20 && factsForCategory.length) {
      const item = factsForCategory[(existing.length + n) % factsForCategory.length];
      const built = {points, question:`${reserveTemplates[points](item).question} (Frage ${n})`, answer:item[2]};
      if (!seenText.has(built.question)) { existing.push(built); seenText.add(built.question); }
      n++;
    }
    category.questions = category.questions.filter(q => Number(q.points) !== points).concat(existing);
  }
}

function cloneStarter(){return JSON.parse(JSON.stringify(starterCategories));}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600);}
function emitCreate(name,password){socket.emit("createRoom",{name,password,categories:cloneStarter()});}
$("createForm").addEventListener("submit",e=>{e.preventDefault();$("lobbyError").textContent="";emitCreate($("hostName").value,$("hostPassword").value);});
$("joinForm").addEventListener("submit",e=>{e.preventDefault();$("lobbyError").textContent="";socket.emit("joinRoom",{name:$("joinName").value,code:$("joinCode").value});});
socket.on("connect",()=>{myId=socket.id;});
socket.on("joined",data=>{myCode=data.code;isHost=data.host;$("lobby").hidden=true;$("game").hidden=false;$("roomLabel").textContent="Spielcode: "+myCode;$("codeDisplay").textContent=myCode;$("roleBadge").textContent=isHost?"SPIELLEITUNG":"SPIELER";$("editBtn").hidden=!isHost;$("resetBtn").hidden=!isHost;$("shuffleBtn").hidden=!isHost;toast(isHost?"Runde erstellt! Teile den Spielcode.":"Du bist im Spiel!");});
socket.on("errorMessage",msg=>{$("lobbyError").textContent=msg;toast(msg);});
socket.on("state",s=>{state=s;render();});
function render(){
 if(!state)return;
 $("notice").textContent=state.message;
 $("codeDisplay").textContent=state.code;
 $("roleBadge").textContent=state.hostId===myId?"SPIELLEITUNG":"SPIELER";
 isHost=state.hostId===myId;
 $("editBtn").hidden=!isHost;$("resetBtn").hidden=!isHost;$("shuffleBtn").hidden=!isHost;
 const boardMode=state.status==="board";
 $("questionScoreRow").hidden=boardMode||!isHost;
 $("boardSection").hidden=!boardMode;
 $("assignRow").hidden=!boardMode||!isHost;
 renderTargetPlayers();$("questionSection").hidden=boardMode;
 renderBoard();renderPlayers();
 if(!boardMode && state.activeQuestion){
  $("questionMeta").textContent=`${state.activeQuestion.category}  •  ${state.activeQuestion.points} PUNKTE`;
  $("questionText").textContent=state.activeQuestion.question;
  const answer = state.hostAnswer || state.activeQuestion.answer;
  $("answerText").textContent=(isHost && !state.answerShown ? "Lösung (nur Spielleitung): " : "Lösung: ") + (answer || "");
  $("answerText").hidden=!(isHost || state.answerShown);
  $("hostControls").hidden=!isHost;
  $("questionScoreRow").hidden=!isHost;
  renderQuestionScorer();
  const winner=state.players.find(p=>p.id===state.buzzWinner);
  $("buzzBtn").disabled=!state.buzzOpen || !!state.buzzWinner || state.hostId===myId || (state.attemptedPlayers||[]).includes(myId);
  $("buzzStatus").textContent=winner?`${winner.name} hat zuerst gebuzzert!`:((state.attemptedPlayers||[]).includes(myId)?"Du hast bei dieser Frage schon falsch geantwortet und bist gesperrt.":state.buzzOpen?"Buzzer ist freigegeben – drück jetzt!":"Warte auf die Freigabe …");
  $("openBtn").disabled=!!state.buzzWinner || state.buzzOpen;
  $("againBtn").hidden=false;
  $("againBtn").textContent="Zurück zur Übersicht";
  $("rightBtn").disabled=!!state.answerShown;
  $("wrongBtn").disabled=!!state.answerShown;
  $("openBtn").disabled=!!state.buzzWinner || state.buzzOpen || !!state.answerShown;
  $("buzzBtn").disabled=!!state.answerShown || !state.buzzOpen || !!state.buzzWinner || state.hostId===myId || (state.attemptedPlayers||[]).includes(myId);
  $("timerBtn").hidden=!isHost;
  $("timerDisplay").hidden=!state.timerEndAt;
 }
 renderTimer();
}
function renderTargetPlayers(){
 const select=$("targetPlayer");
 const current=select.value;
 select.innerHTML="";
 const open=document.createElement("option");open.value="";open.textContent="Offen für alle (Buzzer entscheidet)";select.appendChild(open);
 (state?.players||[]).forEach(p=>{
  const option=document.createElement("option");option.value=p.id;option.textContent=p.name+(p.id===myId?" (du)":"");select.appendChild(option);
 });
 if([...select.options].some(o=>o.value===current))select.value=current;
}
function renderQuestionScorer(){
 const select=$("questionScorer");
 const current=state?.activeQuestion?.assignedPlayerId || state?.buzzWinner || "";
 select.innerHTML="";
 const auto=document.createElement("option");auto.value="";auto.textContent="Automatisch: Buzzer-Gewinner";select.appendChild(auto);
 (state?.players||[]).forEach(p=>{
  const option=document.createElement("option");option.value=p.id;option.textContent=p.name+(p.id===myId?" (du)":"");select.appendChild(option);
 });
 select.value=current;
}
function renderBoard(){
 const board=$("board");board.innerHTML="";
 const pointValues=[100,200,300,400,500];
 state.categories.slice(0,5).forEach((cat,ci)=>{
  const h=document.createElement("div");h.className="cathead";h.textContent=cat.name;board.appendChild(h);
 });
 pointValues.forEach(points=>state.categories.slice(0,5).forEach((cat,ci)=>{
  const b=document.createElement("button");const used=state.used.includes(`${ci}:${points}`);
  b.className="tile"+(used?" used":"");b.textContent=used?"✓":points;
  b.disabled=used||!isHost||state.status!=="board";
  b.title=`${cat.name} – ${points} Punkte`;
  b.addEventListener("click",()=>socket.emit("selectQuestion",{categoryIndex:ci,points,targetPlayerId:$("targetPlayer").value||null}));
  board.appendChild(b);
 }));
}
function renderPlayers(){
 const box=$("players");box.innerHTML="";
 const sorted=[...state.players].sort((a,b)=>b.score-a.score);
 sorted.forEach((p,i)=>{
  const el=document.createElement("div");el.className="player"+(p.id===myId?" me":"")+(p.id===state.buzzWinner?" winner":"");
  const name=document.createElement("span");name.className="playername";name.textContent=(i===0&&p.score>0?"👑 ":"")+p.name+(p.id===myId?" (du)":"");
  const score=document.createElement(isHost?"button":"span");score.className="playerpoints";score.textContent=p.score.toLocaleString("de-DE");
  if(isHost){
   score.type="button";score.title="Klicken, um den Punktestand direkt zu bearbeiten";score.setAttribute("aria-label",`Punktestand von ${p.name} bearbeiten`);
   score.addEventListener("click",()=>{const value=prompt(`Neuer Punktestand für ${p.name}:`,String(p.score));if(value!==null&&value.trim()!==""){const n=Number(value);if(Number.isFinite(n))socket.emit("setPlayerScore",{playerId:p.id,score:n});else toast("Bitte eine gültige Zahl eingeben.");}});
  }
  el.append(name,score);
  if(isHost){
   const controls=document.createElement("div");controls.className="score-edit-controls";
   const minus=document.createElement("button");minus.type="button";minus.className="small danger";minus.textContent="−100";minus.title="100 Punkte abziehen";minus.addEventListener("click",()=>socket.emit("adjustPlayerScore",{playerId:p.id,delta:-100}));
   const plus=document.createElement("button");plus.type="button";plus.className="small secondary";plus.textContent="+100";plus.title="100 Punkte hinzufügen";plus.addEventListener("click",()=>socket.emit("adjustPlayerScore",{playerId:p.id,delta:100}));
   const edit=document.createElement("button");edit.type="button";edit.className="small secondary";edit.textContent="Ändern";edit.addEventListener("click",()=>{const value=prompt(`Neuer Punktestand für ${p.name}:`,String(p.score));if(value!==null&&value.trim()!=="")socket.emit("setPlayerScore",{playerId:p.id,score:Number(value)});});
   controls.append(minus,plus,edit);el.appendChild(controls);
  }
  box.appendChild(el);
 });
}
$("buzzBtn").addEventListener("click",()=>{socket.emit("buzz");$("buzzBtn").disabled=true;});
$("openBtn").addEventListener("click",()=>socket.emit("openBuzzers"));
$("questionScorer").addEventListener("change",()=>socket.emit("setQuestionScorer",{playerId:$("questionScorer").value||null}));
$("rightBtn").addEventListener("click",()=>socket.emit("judge",{correct:true,playerId:$("questionScorer").value||null}));
$("wrongBtn").addEventListener("click",()=>socket.emit("judge",{correct:false,playerId:$("questionScorer").value||null}));
$("againBtn").addEventListener("click",()=>socket.emit("endQuestion"));
$("timerBtn").addEventListener("click",()=>socket.emit("startTimer"));
let timerInterval=null;
function renderTimer(){ if(timerInterval) clearInterval(timerInterval); const el=$("timerDisplay"); if(!state?.timerEndAt){el.textContent="";el.hidden=true;return;} el.hidden=false; const tick=()=>{const left=Math.max(0,Math.ceil((state.timerEndAt-Date.now())/1000));el.textContent=`⏱ ${Math.floor(left/60)}:${String(left%60).padStart(2,"0")}`;if(left<=0){clearInterval(timerInterval);timerInterval=null;}};tick();timerInterval=setInterval(tick,250); }
$("resetBtn").addEventListener("click",()=>{if(confirm("Punkte und benutzte Fragen wirklich zurücksetzen?"))socket.emit("resetScores");});

$("shuffleBtn").addEventListener("click",()=>{
 if(!isHost || state?.status!=="board") return;
 if(!confirm("Alle Kategorien und sämtliche Fragen mit ihren passenden Lösungen zufällig neu verteilen? Punktstufen bleiben 100–500; benutzte Fragen werden zurückgesetzt.")) return;
 socket.emit("shuffleCategories");
});
$("editBtn").addEventListener("click",()=>{buildEditor();$("editor").hidden=false;$("editor").scrollIntoView({behavior:"smooth"});});
$("closeEditor").addEventListener("click",()=>$("editor").hidden=true);
function buildEditor(){
 const box=$("editorFields");box.innerHTML="";
 state.categories.forEach((cat,ci)=>{
  const wrap=document.createElement("div");wrap.className="editorcat";
  const title=document.createElement("label");title.textContent="Kategorie "+(ci+1);
  const name=document.createElement("input");name.value=cat.name;name.maxLength=28;name.dataset.category=ci;name.dataset.field="name";title.appendChild(name);wrap.appendChild(title);
  cat.questions.forEach((q,qi)=>{
   const row=document.createElement("div");row.className="editorq";
   const pts=document.createElement("label");pts.className="pointslabel";pts.textContent="Punkte";const pointInput=document.createElement("input");pointInput.type="number";pointInput.min="0";pointInput.max="100000";pointInput.step="1";pointInput.value=q.points;pointInput.dataset.category=ci;pointInput.dataset.question=qi;pointInput.dataset.field="points";pts.appendChild(pointInput);row.appendChild(pts);
   [["Frage", "question"],["Lösung","answer"]].forEach(([labelText,field])=>{
    const lab=document.createElement("label");lab.textContent=labelText;
    const input=document.createElement("input");input.value=q[field];input.dataset.category=ci;input.dataset.question=qi;input.dataset.field=field;input.maxLength=300;lab.appendChild(input);row.appendChild(lab);
   });
   wrap.appendChild(row);
  });
  box.appendChild(wrap);
 });
}
$("saveEditor").addEventListener("click",()=>{
 const cats=JSON.parse(JSON.stringify(state.categories));
 $("editorFields").querySelectorAll("input").forEach(inp=>{
  const ci=Number(inp.dataset.category),field=inp.dataset.field;
  if(field==="name")cats[ci].name=inp.value.trim()||`Kategorie ${ci+1}`;
  else if(field==="points") cats[ci].questions[Number(inp.dataset.question)].points=Math.max(0,Math.min(100000,Math.trunc(Number(inp.value)||0)));
  else cats[ci].questions[Number(inp.dataset.question)][field]=inp.value.trim();
 });
 if(cats.some(c=>c.questions.some(q=>!q.question||!q.answer))){toast("Bitte jede Frage und Lösung ausfüllen.");return;}
 socket.emit("editCategories",cats);$("editor").hidden=true;toast("Fragen gespeichert.");
});
