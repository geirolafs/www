/**
 * The copy that client components read: tips, the live editor and the break
 * editor. It lives apart from `localhost-hyphenation.ts` so the page's other
 * copy (the samples, how it works, the credits) stays on the server and out of
 * the client chunk. Keep server-only copy out of this file.
 */

/**
 * The example texts. Each one holds every problem the package solves:
 * long compounds, a title, numbers with units, dates and ordinals,
 * abbreviations with numbers, a kennitala or phone number, a title before a
 * name, straight quotes, a number range, one-letter words, a web address and
 * an email that must stay whole, an acronym and a patronymic. A line that
 * starts with `# ` is a title.
 */
const examples = [
  {
    id: "news",
    label: "Frétt",
    text: `# Kjörsókn í Hrafnafjarðarbyggð aldrei meiri í sveitarstjórnarkosningum

Kjörsókn í sveitarstjórnarkosningunum 16. maí 2026 var sú mesta sem mælst hefur í Hrafnafjarðarbyggð, 91,4%. Á árunum 1990-2010 var hún að jafnaði um 78%. "Þetta er söguleg niðurstaða," sagði dr. Guðrún Sigurðardóttir, formaður yfirkjörstjórnar, á blaðamannafundi kl. 14.30 daginn eftir.

Landssamtök ungra kjósenda (LUKA) fylgdust með framkvæmdinni. Í skýrslu þeirra, á bls. 12, kemur fram að kosningaþátttaka ungs fólks hafi aukist mest. Nánari upplýsingar eru á www.example.is og fyrirspurnir má senda á kosningar@example.is eða í síma 555-1234.`,
  },
  {
    id: "notice",
    label: "Tilkynning",
    text: `# Heilbrigðisþjónusta á landsbyggðinni: nýr afgreiðslutími

Frá og með 1. nóvember 2026 verður heilsugæslustöðin í Fjarðarseli opin kl. 8-16 alla virka daga. Komugjald fyrir fullorðna er 1.000 kr. en börn greiða ekkert. Bókið tíma á www.example.is eða í síma 555 1234. Rekstraraðili er Fjarðarsel ehf., kt. 450190-2939.

Í "Þjónustuhandbók" stöðvarinnar, sjá bls. 4, er fjallað um réttindi sjúklinga. Ungbarnavernd er á 2. hæð og SMS-áminning er send daginn fyrir skoðun. Hjúkrunarfræðingar svara fyrirspurnum alla virka daga og sr. Anna Guðmundsdóttir veitir sálgæslu eftir samkomulagi.`,
  },
  {
    id: "event",
    label: "Viðburður",
    text: `# Smásagnaverðlaun grunnskólanema afhent í hátíðarsal Menningarhússins

Verðlaunin verða afhent á degi íslenskrar tungu, mánudaginn 16. nóvember 2026 kl. 20.00. Miðaverð er 2.500 kr. og dagskráin tekur um 90 mín. Kynnir kvöldsins er Jón Þór Hafsteinsson rithöfundur.

Í ár var stafrófið sjálft þema keppninnar. Kynnirinn opnar kvöldið á setningunni "Kæmi ný öxi hér, ykist þjófum nú bæði víl og ádrepa", sem rúmar alla stafi stafrófsins. Miðar fást á www.example.is, í síma 555-5555 og í miðasölunni, sem er opin kl. 12-18.`,
  },
  {
    id: "beer",
    label: "Bjórlíki",
    text: `# Bjórlíkið snýr aftur eitt kvöld: kráareigendur rifja upp bjórbannsárin

Fimmtudaginn 1. mars 2029 eru 40 ár liðin frá bjórdeginum, þegar ÁTVR seldi bjór í fyrsta sinn. Af því tilefni býður Kráin við Tjörnina upp á bjórlíki, léttöl með slettu af vodka og viskíi, eins og það var blandað á börum borgarinnar áður en dómsmálaráðherra bannaði það árið 1985. Hálfur lítri kostar 1.989 kr. og styrkurinn er u.þ.b. 5 af hundraði.

"Það bragðaðist eins og pilsner sem hafði lent í slæmum félagsskap," segir hr. Gunnar Þór Ásgeirsson, sem stóð á bak við barinn 1983-1985. Kl. 21 verður gengið á milli kráa og bjórlíki hellt niður, eins og mótmælendur gerðu í september 1985. Borðapantanir eru á www.krain.is, á netfanginu bjorliki@krain.is og í síma 555-1989.`,
  },
  {
    id: "gsm",
    label: "GSM 1994",
    text: `# Nýi vasasíminn passar í brjóstvasann en trillukarlarnir halda í NMT-bílasímana

Laugardaginn 3. september 1994 hefst sala á nýju GSM-símunum í Farsímabúðinni í Skeifunni. Síminn vegur aðeins 380 g og rafhlaðan dugar í u.þ.b. 90 mín. af tali. Hann kostar 79.900 kr. með hleðslutæki, en leðurhulstrið með beltisklemmunni er selt sér.

Sjómenn ætla ekki að skipta. "Bílasíminn minn nær út á Halamið, þessi nær varla út á Granda," segir hr. Guðmundur Óli Sæmundsson skipstjóri, sem hefur haft NMT-síma í 6-8 ár. Áskrift krefst kennitölu, t.d. 120458-2219. Nánari upplýsingar eru á veraldarvefnum, www.farsimabudin.is, á netfanginu gsm@farsimabudin.is og í síma 555-1994.`,
  },
  {
    id: "y2k",
    label: "2000-vandinn",
    text: `# Tölvuþjónustan ráðleggur heimilum að fylla baðkerið fyrir áramótin vegna 2000-vandans

Föstudaginn 31. desember 1999 hættir klukkan í mörgum tölvum að skilja ártalið. Tölvuþjónustan Bitinn ehf. ráðleggur heimilum að taka út u.þ.b. 20.000 kr. í reiðufé, fylla baðkerið af vatni og prenta út símaskrána. Stjórnvöld hafa sett á fót sérstaka nefnd og segja kerfin tilbúin, en "það er alltaf gott að eiga kerti," segir dr. Þórdís Lilja Bergsdóttir tölvunarfræðingur.

Eigendur PC-tölva eru beðnir að slökkva á þeim fyrir miðnætti, en myndbandstæki og vekjaraklukkur eru sögð í lítilli hættu. Þeir sem eiga Commodore 64 þurfa ekki að hafa áhyggjur. Bakvaktin svarar kl. 22-04 í síma 555-1999 og á netfanginu aldamot@bitinn.is. Nánar á www.bitinn.is/2000.`,
  },
  {
    id: "club",
    label: "Thomsen 2001",
    text: `# Teknóveisla í kjallaranum á Thomsen: plötusnúðar frá Berlín og Breiðholti

Laugardaginn 17. nóvember 2001 opnar kjallarinn á Thomsen í Hafnarstræti kl. 23.00 og lokar ekki fyrr en dyravörðurinn gefst upp. Aðgangseyrir er 1.500 kr. fyrir miðnætti en 2.000 kr. eftir það. Bassaboxin, sem vega u.þ.b. 300 kg hvert, voru borin niður stigann af sex sjálfboðaliðum úr Fjölbrautaskólanum í Breiðholti.

"Við spilum 130-145 BPM og ekki slagi minna," segir hr. Kjartan Ýmir Þorgeirsson, sem tekur við plötuspilurunum kl. 2. Reykvélin er stillt á "skoskt mistur" og fatahengið tekur við úlpum til kl. 4. Gestalistinn er á www.thomsen.is, og ábendingar um týnda síma og staka vettlinga sendist á kjallarinn@simnet.is eða í síma 555-2001.`,
  },
  {
    id: "weekend",
    label: "Dirty weekend",
    text: `# Kærunni vísað frá og breskum ferðamönnum fjölgaði um fimmtung eftir "óþekku helgina"

Auglýsingar Icelandair í Bretlandi vöktu hneykslun hér heima árið 2003. Þar var Bretum boðið upp á "Fancy a dirty weekend in Iceland?" og jafnvel "One Night Stand in Reykjavík". Jafnréttisstofa og Kvenréttindafélag Íslands (KRFÍ) kærðu auglýsingarnar, en kærunni var vísað frá þar sem þær birtust aðeins í Bretlandi. Á skandinavískum vef félagsins mátti líka spila leik þar sem Halldór og Hildur eltust hvort við annað í Bláa lóninu.

Bretum fjölgaði úr 44.800 árið 2002 í 53.900 árið 2003. "Þeir spyrja allir hvar klúbbarnir eru og fara svo að sofa kl. 23," segir Sigrún Ósk Haraldsdóttir, sem er á 5. ári sem leiðsögumaður og tekur á móti 30-40 Bretum um hverja helgi. Hópferðir eru á www.leidsogn.is, á netfanginu sigrun@leidsogn.is og í síma 555-2003.`,
  },
  {
    id: "speech",
    label: "Útrásarræðan",
    text: `# Forsetinn útskýrir velgengni íslenskra fjárfesta fyrir Lundúnabúum í Walbrook-klúbbnum

Þriðjudaginn 3. maí 2005 flutti hr. Ólafur Ragnar Grímsson, forseti Íslands, erindið "How to Succeed in Modern Business: Lessons from the Icelandic Voyage" í Walbrook-klúbbnum í Lundúnum. Þar taldi hann upp 13 eiginleika sem skýrðu velgengni íslenskra athafnamanna, meðal annars arfleifð landkönnuða og víkingasagnanna.

"Ég vissi ekki að Njála væri viðskiptaáætlun," segir dr. Hrafnkell Freyr Stefánsson, sjóðstjóri hjá Jöklafjárfestingu hf., sem er með MBA-gráðu frá London og keypti 3-4 eintök af sögunum eftir fundinn. Erindið má lesa á www.forseti.is. Sjóðstjórinn svarar fyrirspurnum á netfanginu hrafnkell@joklafjarfesting.is og í síma 555-2005.`,
  },
  {
    id: "party",
    label: "Elton John",
    text: `# Elton John söng óvænt í fimmtugsafmæli forstjóra Samskipa í Reykjavík

Í janúar 2007 var sir Elton John leynigestur í fimmtugsafmæli Ólafs Ólafssonar, forstjóra Samskipa. Hann steig á svið kl. 21 og lék fyrir gestina í klukkustund. Á eftir honum tóku Bubbi Morthens, Björgvin Halldórsson og Kristjana Stefánsdóttir við með Stórsveit Reykjavíkur.

"Við smurðum 1.200 snittur og fluttum inn u.þ.b. 40 kg af humri, og enginn spurði hvað það kostaði," segir hr. Bragi Þór Kjartansson, veislustjóri hjá Snittunni ehf., sem stóð vaktina kl. 18-03. VIP-gestir fengu sæti á 2. hæð. Veisluþjónustan er á www.snittan.is, á netfanginu veislur@snittan.is og í síma 555-2007.`,
  },
] as const;

/**
 * Shown in place of the characters that are invisible in normal text. A
 * no-break space and a non-breaking hyphen need no mark: each is shown as
 * itself, on an amber fill.
 */
const marks = {
  softHyphen: "·",
} as const;

export const localhostHyphenationClientContent = {
  marks,
  examples,

  tips: {
    softHyphen:
      "A soft hyphen (U+00AD) is an invisible character. It shows a hyphen only when the line breaks right there.",
    noBreakSpace:
      "A no-break space (U+00A0) looks like a space but keeps the words on both sides of it on one line.",
  },

  liveEditor: {
    textLabel: "Text",
    outputLabel: "Output",
    initialText: examples[0].text,
    composer: {
      exampleLabel: "Example",
      /** The select's first option, shown once the text no longer matches an example. */
      customLabel: "Your text",
      hint: "Start a line with # to make it a title.",
      use: "Use this text on the whole page",
      useShortcut: "Ctrl + Enter",
      used: "The page now uses this text",
      unused: "Not used on the page yet",
      words: (count: number) => `${count} ${count === 1 ? "word" : "words"}`,
    },
    /** What the editor starts with. The page renders the first output from these on the server. */
    initial: { mode: "body", rules: "typographic", typeset: true },
    mode: {
      label: "Mode",
      tip: "Body breaks a word at every allowed spot. Heading is stricter: only long words break, with more letters kept on each side, and a word breaks only at its compound joints when one fits: those on the exception list, the break after a linking syllable (stjórnar-völd) and a name’s ending (Sigurðar-dóttir).",
      options: [
        { value: "body", label: "Body" },
        { value: "heading", label: "Heading" },
      ],
    },
    rules: {
      label: "Rules",
      tip: "Typographic keeps only breaks that look good: in body text, words of 6 or more letters with 2 letters before and 3 after the break (in a heading 12, 3 and 4), and never just before a linking syllable (stjórnar-völd, not stjórn-ar-völd). Ritreglur allows every break the patterns allow, close to the official spelling rules: 1 letter before, 2 after. Words of 4+ letters (Skiptingar’s own limit).",
      options: [
        { value: "typographic", label: "Typographic" },
        { value: "ritreglur", label: "Ritreglur" },
      ],
    },
    options: {
      label: "Options",
    },
    /** Under the settings, until one is pointed at, focused or tapped. */
    hint: "Point at a setting, or tap it, to read what it does.",
    typeset: {
      label: "Typeset",
      tip: "Swaps some spaces for no-break spaces, in 1.000 kr. and 30. september for example, straight quotes for Icelandic quotes, and the hyphen in a range like 1990-2010 for an en dash. Each change swaps one character for another.",
    },
    showBreaks: {
      label: "Show breaks",
      tip: "Draws a red · for every soft hyphen, and puts every no-break space and non-breaking hyphen (U+2011) on an amber fill, so you can see what the components put in.",
    },
    rag: {
      label: "Settle rag",
      tip: "Chooses every line break for the whole paragraph the way a typesetter would: lines full enough, no word jutting out or leaving a hole, few hyphens and no 3-letter pieces, a short word like og, í or að kept off a line’s end when that costs nothing elsewhere (a preference of this package, not an Icelandic rule), and a last line of one word only when the edge is better for it. Titles are balanced. It needs the real line widths, so it runs in the browser. With Show breaks on, each space it glued has an amber fill.",
    },
    overhang: {
      label: "Overhang",
      tip: "The cheat a typesetter makes by hand: a line’s last letter or mark may go a little past the edge, when that keeps a word on its line and makes the paragraph better. At most about half an em at 16px, a smaller share of the size as the type grows, never more than the character itself, and never at a hyphen. Works with Settle rag. With Show breaks on, the overhanging character is on an amber fill.",
    },
    textWrap: {
      label: "text-wrap",
      tip: "The browser’s own line breaking, used when Settle rag is off: text-pretty (text-wrap: pretty) for body text and text-balance (text-wrap: balance) for titles. Off wraps each line greedily. With Settle rag on this does nothing: Settle rag chooses every break itself and balances titles. How it works shows each one with and without.",
    },
    /** The result box's width slider, in px. */
    width: { min: 120, max: 720, initial: 320 },
    breaks: (count: number) => `${count} ${count === 1 ? "break" : "breaks"}`,
    noBreakSpaces: (count: number) =>
      `${count} no-break ${count === 1 ? "space" : "spaces"}`,
  },

  /** The settings, kept in view once the editor's own controls scroll away. */
  dock: {
    label: "Page settings",
    open: "Edit settings",
    close: "Close settings",
    on: "on",
    off: "off",
  },

  /** The copy button on a code block. */
  install: {
    /** The accessible name of the package-manager choice. */
    managerLabel: "Package manager",
  },

  copyCode: {
    states: {
      idle: "Copy",
      copied: "Copied",
      failed: "Copy failed",
    },
  },

  /** A width slider over a specimen. */
  measure: {
    label: "Width",
    value: (px: number) => `${px} px`,
  },

  /** A pair that shows a text without the package, then with it. */
  pair: {
    without: "Without",
    withoutCaption: "the browser alone",
    with: "With Skiptingar",
    withCaption: "page settings",
  },

  breakEditor: {
    wordLabel: "Word",
    initialWord: "þjóðfélagsumræða",
    lineLabel: "Exception line",
    gapsLabel: "Breaks between letters",
    keyLabel: "Key",
    states: {
      none: {
        name: "none",
        mark: "·",
        tip: "No break here. The word stays whole at this spot.",
      },
      break: {
        name: "break",
        mark: "-",
        tip: "A line may break here. It becomes a soft hyphen.",
      },
      joint: {
        name: "compound joint",
        mark: "=",
        tip: "The seam between two parts of a compound. In heading mode, a word on the exception list breaks only at these.",
      },
    },
    gapLabel: (letter: string, state: string) => `Gap after ${letter}: ${state}`,
    copy: {
      idle: "Copy line",
      copied: "Copied",
      failed: "Copy failed",
    },
  },
} as const;
