import type { CaseFile } from "@/types/case";

const zodiac: CaseFile = {
  id: "zodiac",
  codename: "THE ZODIAC",
  title: "The Zodiac Killer",
  status: "OPEN — UNSOLVED",
  years: "1968 – 1969 (letters through 1974)",
  jurisdiction: "Solano, Napa & San Francisco Counties, California",
  tagline: "He wrote to the newspapers. He dared them to catch him. They never did.",
  bodyCount: "5 confirmed murdered · 2 survived · the killer claimed 37",
  briefing: [
    "Northern California, the end of the 1960s. A man with no face and no name shoots young couples parked in the dark, then mails taunting letters to the newspapers signed with a crossed-circle — a gunsight — and the words: THIS IS THE ZODIAC SPEAKING.",
    "He sends ciphers he swears will reveal his identity. He phones the police. He threatens to shoot schoolchildren off a bus. And then, as suddenly as he appeared, he goes quiet. The letters stop. The case never closes.",
    "Five decades of detectives, FBI agents, and amateur sleuths have chased him. One of his codes stayed unbroken for 51 years. His name has never been confirmed.",
  ],
  mission:
    "You hold the file now, Detective. Read every report. Weigh the evidence. Study the men who fell under suspicion. Then do what no one in 1969 could — put a name to the Zodiac. Choose carefully. The record is waiting for your verdict.",

  victims: [
    {
      name: "David Faraday & Betty Lou Jensen",
      age: "17 and 16",
      date: "December 20, 1968",
      location: "Lake Herman Road, Benicia (Solano County)",
      status: "MURDERED",
      details:
        "On their first date, the teenagers parked at a gravel turnout. A gunman approached on foot and opened fire with a .22 rifle. Both were shot dead beside the car. There was no robbery, no assault — no apparent motive at all.",
      sourceUrl: "https://www.zodiackiller.com/FaradayJensen.html",
    },
    {
      name: "Darlene Ferrin",
      age: "22",
      date: "July 4, 1969",
      location: "Blue Rock Springs Park, Vallejo",
      status: "MURDERED",
      details:
        "A car pulled up beside Ferrin's. A man walked over with a bright flashlight and a 9mm pistol and fired through the window. Less than an hour later, a man called Vallejo police, calmly took credit for this shooting AND the Lake Herman Road murders, and hung up.",
      sourceUrl: "https://www.zodiackiller.com/FerrinMageau.html",
    },
    {
      name: "Michael Mageau",
      age: "19",
      date: "July 4, 1969",
      location: "Blue Rock Springs Park, Vallejo",
      status: "SURVIVED",
      details:
        "Shot in the face, neck, and chest in the same attack that killed Ferrin, Mageau lived. His description of a heavyset young man would become one of the few first-hand accounts of the killer.",
      sourceUrl: "https://www.zodiackiller.com/FerrinMageau.html",
    },
    {
      name: "Cecelia Shepard",
      age: "22",
      date: "September 27, 1969",
      location: "Lake Berryessa, Napa County",
      status: "MURDERED",
      details:
        "A man in a black executioner-style hood, a crossed-circle symbol sewn on his chest, approached two picknickers with a gun, tied them up, and stabbed them repeatedly. Shepard died of her wounds two days later. On the victims' car door the killer wrote the dates of his crimes in felt pen.",
      sourceUrl: "https://www.zodiackiller.com/ShepardHartnell.html",
    },
    {
      name: "Bryan Hartnell",
      age: "20",
      date: "September 27, 1969",
      location: "Lake Berryessa, Napa County",
      status: "SURVIVED",
      details:
        "Stabbed repeatedly in the back during the hooded attack, Hartnell survived and described the costume and the crossed-circle emblem in chilling detail.",
      sourceUrl: "https://www.zodiackiller.com/ShepardHartnell.html",
    },
    {
      name: "Paul Lee Stine",
      age: "29",
      date: "October 11, 1969",
      location: "Presidio Heights, San Francisco",
      status: "MURDERED",
      details:
        "A cab driver shot once in the head. The killer tore away a piece of Stine's bloodstained shirt and later mailed swatches of it to the Chronicle to prove the murders were his. Teenagers across the street witnessed part of the crime, producing the famous police sketch.",
      sourceUrl: "https://zodiackiller.com/zodiac-killer-victim-paul-stine/",
    },
  ],

  timeline: [
    { date: "Oct 30, 1966", event: "Cheri Jo Bates is murdered in Riverside, CA. Years later the Zodiac would be linked to it by some investigators — a connection that remains disputed.", sourceUrl: "https://zodiacrevisited.com/cheri-jo-bates-evidence-analysis/" },
    { date: "Dec 20, 1968", event: "David Faraday & Betty Lou Jensen shot dead on Lake Herman Road.", sourceUrl: "https://www.zodiackiller.com/FaradayJensen.html" },
    { date: "Jul 4, 1969", event: "Darlene Ferrin killed and Michael Mageau wounded at Blue Rock Springs. A man phones in a confession.", sourceUrl: "https://www.zodiackiller.com/FerrinMageau.html" },
    { date: "Aug 1, 1969", event: "Three near-identical letters reach Bay Area papers, each carrying one third of a 408-symbol cipher. The writer threatens a killing spree unless they are printed.", sourceUrl: "https://vault.fbi.gov/The%20Zodiac%20Killer" },
    { date: "Aug 8, 1969", event: "Schoolteacher Donald Harden and his wife Bettye crack the 408 cipher in days.", sourceUrl: "https://zodiackillerciphers.com/wiki/index.php?title=Solved_408-character_cipher" },
    { date: "Aug 1969", event: "A new letter opens: THIS IS THE ZODIAC SPEAKING. The name is born.", sourceUrl: "https://vault.fbi.gov/The%20Zodiac%20Killer" },
    { date: "Sep 27, 1969", event: "The hooded attack at Lake Berryessa. The killer writes on the victims' car door.", sourceUrl: "https://www.zodiackiller.com/ShepardHartnell.html" },
    { date: "Oct 11, 1969", event: "Paul Stine murdered in San Francisco. A piece of his shirt is taken.", sourceUrl: "https://zodiackiller.com/zodiac-killer-victim-paul-stine/" },
    { date: "Nov 8, 1969", event: "The 340 cipher arrives at the Chronicle. It will resist every code-breaker for 51 years.", sourceUrl: "https://vault.fbi.gov/The%20Zodiac%20Killer" },
    { date: "Nov 9, 1969", event: "A seven-page letter threatens to wipe out a school bus and includes a diagram of a bomb.", sourceUrl: "https://vault.fbi.gov/The%20Zodiac%20Killer" },
    { date: "Oct 27, 1970", event: "A Halloween card is mailed to Chronicle reporter Paul Avery: PEEK-A-BOO, YOU ARE DOOMED.", sourceUrl: "https://vault.fbi.gov/The%20Zodiac%20Killer" },
    { date: "Jan 29, 1974", event: "The 'Exorcist' letter — widely accepted as the last authentic Zodiac communication.", sourceUrl: "https://vault.fbi.gov/The%20Zodiac%20Killer" },
    { date: "Dec 5, 2020", event: "A team of three amateur cryptographers finally solves the 340 cipher. It contains taunts — but no name.", sourceUrl: "https://zodiackillerciphers.com/wiki/index.php?title=Solution_to_the_340" },
    { date: "Today", event: "The case remains open and unsolved. The file is now in your hands.", sourceUrl: "https://oag.ca.gov/zodiac" },
  ],

  evidence: [
    {
      id: "symbol",
      title: "The Crossed-Circle Signature",
      tag: "SIGNATURE",
      description:
        "A circle bisected by a cross — a gunsight — appears on nearly every letter and was stitched onto the killer's hood at Lake Berryessa. It became the brand of the case and the killer's calling card.",
      sourceUrl: "https://www.zodiackiller.com/Letters.html",
      sourceLabel: "zodiackiller.com — The Letters",
    },
    {
      id: "letters",
      title: "The Newspaper Letters",
      tag: "CORRESPONDENCE",
      date: "1969 – 1974",
      description:
        "Dozens of letters and cards mailed mostly to the San Francisco Chronicle. The killer demanded they be printed on the front page and threatened to kill if ignored. The handwriting, misspellings, and phrasing are among the most-studied in criminal history.",
      quote: "This is the Zodiac speaking.",
      sourceUrl: "https://www.zodiackiller.com/Letters.html",
      sourceLabel: "zodiackiller.com — The Letters",
    },
    {
      id: "shirt",
      title: "The Bloodstained Shirt Swatch",
      tag: "PHYSICAL — VERIFIED",
      date: "Oct 1969",
      description:
        "To prove he killed cab driver Paul Stine, the Zodiac mailed pieces of Stine's torn, bloodstained shirt to the Chronicle. It is the single strongest physical link between the letters and a confirmed murder.",
      sourceUrl: "https://zodiackillerfacts.com/the-crimes/10-11-69-san-francisco/",
      sourceLabel: "zodiackillerfacts.com — Paul Stine crime",
    },
    {
      id: "costume",
      title: "The Lake Berryessa Costume",
      tag: "WITNESS ACCOUNT",
      date: "Sep 27, 1969",
      description:
        "Survivor Bryan Hartnell described a black hood with clip-on sunglasses over the eye holes and the crossed-circle emblem on the chest. The killer wrote the dates of his crimes on the car door in felt-tip pen.",
      sourceUrl: "https://www.zodiackiller.com/ShepardHartnell.html",
      sourceLabel: "zodiackiller.com — Shepard & Hartnell attack",
    },
    {
      id: "sketch",
      title: "The Composite Sketch",
      tag: "WITNESS — SFPD",
      date: "Oct 1969",
      description:
        "Built from teenagers who watched the Stine murder from across the street and from survivor Michael Mageau: a heavyset white male, roughly 25–35, with short brown hair and glasses. The sketch has framed every suspect since.",
      sourceUrl: "https://zodiackillerfacts.com/Descriptions.htm",
      sourceLabel: "zodiackillerfacts.com — Eyewitness descriptions",
    },
    {
      id: "ballistics",
      title: "Ballistics",
      tag: "FORENSIC",
      description:
        "A .22 caliber rifle at Lake Herman Road; a 9mm pistol at Blue Rock Springs. The killer changed weapons and methods — gun, then knife, then gun again — frustrating any simple signature.",
      sourceUrl: "https://zodiackillerfacts.com/case-summary/",
      sourceLabel: "zodiackillerfacts.com — Case summary & forensics",
    },
    {
      id: "prints",
      title: "Unidentified Fingerprints",
      tag: "FORENSIC — UNMATCHED",
      date: "Oct 1969",
      description:
        "Bloody fingerprints were lifted from Paul Stine's cab. Investigators have never conclusively matched them to any suspect — a fact that has both cleared men and kept the case open.",
      sourceUrl: "https://zodiackillerfacts.com/tag/fingerprint/",
      sourceLabel: "zodiackillerfacts.com — Fingerprint evidence",
    },
    {
      id: "dna",
      title: "Partial DNA from the Envelopes",
      tag: "FORENSIC — PARTIAL",
      description:
        "Saliva on stamps and envelope flaps has yielded only partial, degraded genetic profiles. Investigators have used them to test suspects and, in recent years, to attempt forensic genetic genealogy — so far without a confirmed match.",
      sourceUrl: "https://zodiackillerfacts.com/zodiac-unsub/unsub-the-evidence/zodiac-dna/zodiac-dna-questions/",
      sourceLabel: "zodiackillerfacts.com — DNA evidence",
    },
    {
      id: "watch",
      title: "The 'Zodiac' Wristwatch Brand",
      tag: "LEAD",
      description:
        "The Sea Wolf watch made by the Zodiac watch company carried a crossed-circle logo nearly identical to the killer's symbol. The detail tied the case to a brand — and, for some investigators, to one particular suspect who owned that very watch.",
      sourceUrl: "https://zodiackiller.com/zodiac-killer-suspect-arthur-leigh-allen/",
      sourceLabel: "zodiackiller.com — Arthur Leigh Allen",
    },
  ],

  ciphers: [
    {
      id: "z408",
      name: "The 408 Cipher (Z408)",
      date: "August 1, 1969",
      status: "SOLVED",
      solvedBy: "Donald & Bettye Harden, within about a week",
      description:
        "Sent in three pieces to three newspapers. A homophonic substitution cipher — each letter could be written with several different symbols — meant to taunt, not to confess.",
      solution:
        "I LIKE KILLING PEOPLE BECAUSE IT IS SO MUCH FUN... THE BEST PART OF IT IS THAT WHEN I DIE I WILL BE REBORN IN PARADICE AND ALL THE I HAVE KILLED WILL BECOME MY SLAVES. (The final 18 characters were never deciphered.)",
      sourceUrl: "https://zodiackillerciphers.com/wiki/index.php?title=Solved_408-character_cipher",
    },
    {
      id: "z340",
      name: "The 340 Cipher (Z340)",
      date: "November 8, 1969",
      status: "SOLVED",
      solvedBy: "David Oranchak, Sam Blake & Jarl Van Eycke — December 2020",
      description:
        "The killer's most notorious code. It used substitution PLUS a diagonal transposition across a 17-column grid, and defeated cryptanalysts — including the FBI and NSA — for 51 years.",
      solution:
        "I HOPE YOU ARE HAVING LOTS OF FUN IN TRYING TO CATCH ME... I AM NOT AFRAID OF THE GAS CHAMBER BECAUSE IT WILL SEND ME TO PARADICE ALL THE SOONER. Again — a taunt, never a name.",
      sourceUrl: "https://zodiackillerciphers.com/wiki/index.php?title=Solution_to_the_340",
    },
    {
      id: "z13",
      name: "The 'My Name Is' Cipher (Z13)",
      date: "April 20, 1970",
      status: "UNSOLVED",
      description:
        "Just 13 characters, sent under the line 'My name is —'. The killer claimed it spelled his identity. With so few symbols, it may never be provably solved.",
      sourceUrl: "https://zodiackillerciphers.com/wiki/index.php?title=Unsolved_13-character_%22My_name_is%22_cipher",
    },
    {
      id: "z32",
      name: "The Map Cipher (Z32)",
      date: "June 26, 1970",
      status: "UNSOLVED",
      description:
        "A 32-symbol cipher mailed with a map of the Bay Area and instructions to a buried bomb, supposedly revealing where it was set. It has never been cracked.",
      sourceUrl: "https://zodiackillerciphers.com/wiki/index.php?title=Unsolved_32-character_%22map_code%22_cipher",
    },
  ],

  suspects: [
    {
      id: "allen",
      name: "Arthur Leigh Allen",
      alias: "THE PRIME SUSPECT",
      lived: "Vallejo, California",
      fate: "Died of a heart attack, August 1992",
      summary:
        "The only suspect ever served with a search warrant, and the man at the center of the investigation for decades. A former schoolteacher who lived minutes from two of the crime scenes.",
      pointsFor: [
        "A friend, Don Cheney, told police that before the murders Allen had spoken of killing couples, mounting a flashlight on a gun, and calling himself 'Zodiac'.",
        "Allen owned a Sea Wolf wristwatch made by the Zodiac brand — bearing the same crossed-circle logo as the killer's symbol.",
        "He lived near the Vallejo crime scenes and matched the general build of the killer.",
        "He had a documented history of violent and predatory behavior.",
      ],
      pointsAgainst: [
        "His fingerprints did not match the bloody prints from Paul Stine's cab.",
        "Handwriting experts concluded the Zodiac letters were not in Allen's hand.",
        "A partial DNA profile from the envelopes did not match him — though the sample is degraded and its value is debated.",
      ],
      whatHappened:
        "Police searched Allen's home in 1991 and found suggestive items but no decisive proof. He died of a heart attack in August 1992, before any charge could be brought. He remains the most famous Zodiac suspect — and the case against him is entirely circumstantial. He was never charged.",
      sourceUrl: "https://zodiackiller.com/zodiac-killer-suspect-arthur-leigh-allen/",
    },
    {
      id: "poste",
      name: "Gary Francis Poste",
      alias: "THE 2021 HEADLINE",
      lived: "Groveland, California",
      fate: "Died in 2018",
      summary:
        "Named publicly in 2021 by a private group of investigators calling themselves the Case Breakers, who declared the case solved.",
      pointsFor: [
        "The group claimed a hidden anagram in the letters spelled Poste's name.",
        "They pointed to forehead scars said to match details in the police sketch.",
        "They cited a violent personal history described by former associates.",
      ],
      pointsAgainst: [
        "The FBI did not confirm the identification and the case stayed officially open.",
        "Most veteran investigators and cryptographers rejected the anagram reasoning.",
        "No physical or forensic evidence ties Poste to any of the murders.",
      ],
      whatHappened:
        "The 2021 announcement made headlines around the world, then collapsed under scrutiny. The FBI reiterated that the case remained open. Poste, who had died in 2018, was never charged, and the claim is widely regarded as unproven.",
      sourceUrl: "https://www.newsweek.com/zodiac-killer-suspect-investigation-new-evidence-gary-poste-1636501",
    },
    {
      id: "gaikowski",
      name: "Richard Gaikowski",
      alias: "THE NEWSPAPERMAN",
      lived: "San Francisco, California",
      fate: "Died in 2004",
      summary:
        "An editor at the San Francisco underground paper Good Times during the murders, promoted as a suspect by a handful of researchers.",
      pointsFor: [
        "A witness who had heard the Zodiac's voice on a phone call reportedly believed it matched Gaikowski's.",
        "He bore some resemblance to the composite sketch.",
        "He was in San Francisco throughout the active period of the killings.",
      ],
      pointsAgainst: [
        "The theory rests almost entirely on a single voice identification.",
        "No physical evidence connects him to any crime scene.",
        "Much of the supporting argument is circumstantial timing.",
      ],
      whatHappened:
        "Gaikowski was never charged and the voice-identification theory was never corroborated by physical evidence. He remains a fringe suspect, kept alive mainly by independent researchers.",
      sourceUrl: "https://zodiackiller.com/zodiac-killer-suspect-richard-gaikowski/",
    },
    {
      id: "kane",
      name: "Lawrence 'Larry' Kane",
      alias: "THE STALKER THEORY",
      lived: "Nevada / California",
      fate: "Whereabouts and death poorly documented",
      summary:
        "Tied to the case through the people around victim Darlene Ferrin and a possible later abduction.",
      pointsFor: [
        "Darlene Ferrin's sister claimed a man had been following Darlene in the weeks before her murder.",
        "Kathleen Johns — a woman the Zodiac may have abducted in 1970 — reportedly later identified Kane.",
      ],
      pointsAgainst: [
        "The identifications were inconsistent and came years after the events.",
        "There is no forensic link between Kane and any crime scene.",
        "Memory and suggestion make the witness accounts unreliable.",
      ],
      whatHappened:
        "Kane was investigated on the strength of witness recollection but never charged. The connection has never been substantiated with hard evidence.",
      sourceUrl: "https://zodiackiller.com/zodiac-killer-suspect-lawrence-kane/",
    },
    {
      id: "sullivan",
      name: "Ross Sullivan",
      alias: "THE RIVERSIDE LINK",
      lived: "Riverside, California",
      fate: "Died in 1977",
      summary:
        "A library assistant at Riverside City College, where student Cheri Jo Bates was murdered in 1966 — a killing some link to the Zodiac.",
      pointsFor: [
        "He worked at the library Bates had visited the night she was killed.",
        "He resembled composite sketches and reportedly behaved strangely after the murder.",
        "He was said to be absent from work in the days that followed.",
      ],
      pointsAgainst: [
        "Investigators reported he had an alibi and ruled him out.",
        "The link between the Bates murder and the Zodiac is itself disputed.",
        "No forensic evidence connects him to the confirmed Zodiac crimes.",
      ],
      whatHappened:
        "Sullivan was looked at and set aside by investigators. He died in 1977. He endures as a footnote suspect, dependent on the contested theory that the Zodiac killed Cheri Jo Bates.",
      sourceUrl: "https://zodiacrevisited.com/cheri-jo-bates-evidence-analysis/",
    },
  ],

  investigation: [
    {
      id: "lake-herman",
      label: "December 20, 1968 · 11:00 PM",
      title: "The first blood on Lake Herman Road",
      narrative:
        "It starts on a gravel turnout outside Benicia. Two teenagers on their first date, parked in the dark. A man walks up out of the night and opens fire — no robbery, no words, no motive anyone can name. By morning Solano County has two dead kids and not a single suspect.\n\nBefore you can chase a killer, you have to read the scene the way the first deputies did. Start with the weapon left in the shell casings.",
      puzzle: {
        type: "multiple-choice",
        question:
          "The shell casings scattered at the turnout tell you what the killer fired at David Faraday and Betty Lou Jensen. What was the weapon?",
        options: ["A .22 caliber rifle", "A 9mm pistol", "A 12-gauge shotgun", "A hunting knife"],
        answer: "A .22 caliber rifle",
        hint: "It's a rifle round — small caliber, the same kind a deer hunter might carry.",
        explanation:
          "Correct. A .22 caliber rifle was used at Lake Herman Road — the first of the killer's confirmed murders. There was no robbery and no assault: the sheer absence of motive is what made the case so chilling, and so cold.",
      },
    },
    {
      id: "blue-rock-springs",
      label: "July 4, 1969 · just after midnight",
      title: "The phone call that confessed",
      narrative:
        "Seven months later, Blue Rock Springs Park in Vallejo. A car pulls alongside Darlene Ferrin and Michael Mageau. A man crosses over with a bright light and a 9mm, fires through the window, and is gone. Ferrin dies. Mageau lives.\n\nLess than an hour later, the killer does something new — something that turns a string of shootings into a single hunter. He picks up a telephone.",
      puzzle: {
        type: "multiple-choice",
        question:
          "Within the hour of the Blue Rock Springs attack, the killer made a phone call. Who did he call — and what did he do?",
        options: [
          "He called Vallejo police and took credit for this shooting AND the Lake Herman Road murders",
          "He called Darlene Ferrin's family to taunt them",
          "He called the San Francisco Chronicle to demand money",
          "He called an ambulance for Michael Mageau",
        ],
        answer:
          "He called Vallejo police and took credit for this shooting AND the Lake Herman Road murders",
        hint: "He wanted credit — and he tied two crime scenes together himself.",
        explanation:
          "Right. The killer phoned Vallejo PD, calmly claimed both the Blue Rock Springs shooting and the December murders on Lake Herman Road, then hung up. It was the first time anyone realized the crimes were the work of one man.",
      },
    },
    {
      id: "the-408",
      label: "August 1, 1969",
      title: "Three letters, one cipher",
      narrative:
        "Now he reaches for a pen. Three near-identical letters land at three Bay Area newspapers, each carrying one third of a 408-symbol cipher. Print it on the front page, he warns, or there will be a killing spree.\n\nA schoolteacher and his wife break it in about a week. The decoded text opens with a line that has haunted the case ever since. Read the killer's own first words.",
      puzzle: {
        type: "text",
        question:
          "The solved 408 cipher begins with the killer's motive, in his own misspelled hand: \"I like ______ people because it is so much fun.\" Fill in the missing word.",
        answer: "killing",
        acceptable: ["kill", "killin"],
        hint: "It's the act itself — the thing he says is more fun than hunting wild game.",
        explanation:
          "Exactly. \"I LIKE KILLING PEOPLE BECAUSE IT IS SO MUCH FUN…\" The Z408 was a homophonic substitution cipher — multiple symbols per letter — cracked by Donald and Bettye Harden in roughly a week. It was a taunt, never a confession of identity.",
      },
    },
    {
      id: "this-is-the-zodiac",
      label: "August 1969",
      title: "A killer gives himself a name",
      narrative:
        "A new letter arrives, and with its opening line the case acquires the name it will carry forever. Every letter after this one will open the same way. The press has its monster; the monster has his brand.",
      puzzle: {
        type: "text",
        question:
          "Complete the four-word salutation that opened the letter — and every letter after it: \"This is the ______ speaking.\"",
        answer: "zodiac",
        acceptable: ["the zodiac"],
        hint: "It's the name the whole case is filed under.",
        explanation:
          "\"THIS IS THE ZODIAC SPEAKING.\" The name was born in this letter and became the signature on a decade of correspondence. He was no longer just a shooter in the dark — he was a character demanding an audience.",
      },
    },
    {
      id: "lake-berryessa",
      label: "September 27, 1969",
      title: "The man in the hood",
      narrative:
        "Lake Berryessa, Napa County. Two picnickers, Cecelia Shepard and Bryan Hartnell, look up to find a man in a black executioner's hood, a strange symbol stitched to his chest. He ties them up and stabs them both. Shepard dies; Hartnell survives to describe every detail.\n\nThe emblem on that hood is the killer's calling card — the same mark that closes his letters. Name it.",
      puzzle: {
        type: "multiple-choice",
        question:
          "Survivor Bryan Hartnell described a symbol sewn onto the killer's hood — the same mark that signs the letters. What is it?",
        options: [
          "A crossed-circle — a gunsight",
          "A pentagram",
          "An inverted cross",
          "A coiled serpent",
        ],
        answer: "A crossed-circle — a gunsight",
        hint: "A circle with a cross through it — like looking through the sight of a gun.",
        explanation:
          "Correct. The crossed-circle — a gunsight — was stitched to the Lake Berryessa hood and signed nearly every letter. After this attack the killer wrote the dates of his crimes on the victims' car door in felt pen, treating the car like a scoreboard.",
      },
    },
    {
      id: "paul-stine",
      label: "October 11, 1969",
      title: "Proof torn from a dead man's shirt",
      narrative:
        "Presidio Heights, San Francisco. Cab driver Paul Stine is shot once in the head. Teenagers across the street watch enough to give the city its famous sketch. But the killer takes a souvenir from the body — and later mails pieces of it to the Chronicle to prove the murders are his.\n\nThat souvenir is the single strongest physical link between the letters and a confirmed killing. What did he take?",
      puzzle: {
        type: "multiple-choice",
        question:
          "From Paul Stine's body the killer tore away an object he later mailed to the Chronicle as proof. What was it?",
        options: [
          "A piece of his bloodstained shirt",
          "His taxi license",
          "His wristwatch",
          "A page from his logbook",
        ],
        answer: "A piece of his bloodstained shirt",
        hint: "He mailed swatches of it to the newspaper — stained with blood.",
        explanation:
          "Right. The Zodiac tore a swatch from Stine's bloodstained shirt and mailed pieces to the Chronicle to prove the murders were his work. Bloody fingerprints were also lifted from the cab — prints that have never been conclusively matched to any suspect.",
      },
    },
    {
      id: "the-340",
      label: "December 5, 2020",
      title: "Fifty-one years of silence, broken",
      narrative:
        "On November 8, 1969 the Zodiac mailed his masterpiece: the 340 cipher. It used substitution plus a diagonal transposition across a 17-column grid, and it defeated the FBI, the NSA, and every codebreaker alive — for half a century.\n\nThen, in December 2020, a team of three amateurs finally cracked it. Everyone hoped for a name. They got another taunt. How long had the Z340 stood unsolved?",
      puzzle: {
        type: "text",
        question:
          "The Z340 cipher resisted every codebreaker for how many years before it was solved in 2020? (Answer with the number.)",
        answer: "51",
        acceptable: ["51 years", "fifty-one", "fifty one"],
        hint: "Mailed in 1969, solved in 2020 — do the math.",
        explanation:
          "Fifty-one years. David Oranchak, Sam Blake, and Jarl Van Eycke solved the Z340 in December 2020. Like the 408 before it, it held only a taunt — \"I HOPE YOU ARE HAVING LOTS OF FUN IN TRYING TO CATCH ME\" — and never the name the killer kept promising.",
      },
    },
    {
      id: "the-prime-suspect",
      label: "The investigation",
      title: "The only man ever served a warrant",
      narrative:
        "Decades of detectives, FBI agents, and citizen sleuths chased him. Thousands of persons of interest were logged. But one name sat at the center of the file longer than any other — a former schoolteacher from Vallejo, the only suspect ever served with a search warrant.\n\nYou've read the events. Before you can file a verdict, name the man the investigation circled for thirty years.",
      puzzle: {
        type: "text",
        question:
          "Who is the prime suspect — the only person ever served a search warrant in the Zodiac case? (First and last name.)",
        answer: "arthur leigh allen",
        acceptable: ["arthur allen", "leigh allen", "allen", "arthur leigh allen"],
        hint: "He owned a Sea Wolf watch with a crossed-circle logo and lived minutes from the Vallejo scenes.",
        explanation:
          "Arthur Leigh Allen. The case against him was entirely circumstantial — a friend's account, the matching watch logo, his proximity to the crimes — and it never held: his fingerprints, handwriting, and partial DNA did not match. He died in 1992, never charged. The file is now yours to close.",
      },
    },
  ],

  verdict: [
    "You have named your suspect. Now here is the truth the badge could never escape:",
    "Despite thousands of persons of interest, decades of work by the Vallejo and San Francisco police, the Napa County Sheriff and the FBI, and an army of citizen investigators — no one was ever charged with the Zodiac murders.",
    "His ciphers were broken. They held only taunts. His letters were dissected letter by letter. His DNA, what little survives, has never delivered a confirmed match. Every suspect above was either cleared, never charged, or died before the question could be answered.",
    "Whatever name you chose, the real killer was never brought to justice. The Zodiac simply stopped writing — and walked off into history.",
    "CASE STATUS: UNSOLVED.",
  ],

  photos: [
    {
      id: "wanted-poster",
      url: "/zodiac/wanted-poster.png",
      caption: "Official SFPD/Vallejo PD wanted poster, October 1969 — released after the Paul Stine murder. Contains the two composite sketches built from witness accounts and survivor Michael Mageau's description. This poster is one of the most widely reproduced documents of the case.",
      credit: "San Francisco Police Department / public domain",
      year: "1969",
    },
    {
      id: "z408-cipher",
      url: "/zodiac/z408-cipher.png",
      caption: "The Z408 cipher — sent to three Bay Area newspapers on August 1, 1969. The Zodiac used 54 distinct symbols for 26 letters (homophonic substitution) to make it harder to crack. Donald and Bettye Harden solved it in roughly a week. The final 18 characters remain unbroken.",
      credit: "Zodiac Killer / public domain (historical document)",
      year: "1969",
    },
    {
      id: "z340-cipher",
      url: "/zodiac/z340-cipher.jpg",
      caption: "The Z340 cipher envelope and dripping-pen card, mailed to the San Francisco Chronicle on November 8, 1969. The cipher itself — 340 symbols across a 17-column grid with diagonal transposition — resisted the FBI, NSA, and every codebreaker for 51 years until December 2020.",
      credit: "Zodiac Killer / public domain (historical document)",
      year: "1969",
    },
    {
      id: "berryessa-sketch",
      url: "/zodiac/berryessa-sketch.jpg",
      caption: "Composite sketch of the Zodiac Killer as described by three women sunbathing at Lake Berryessa on September 27, 1969 — witnesses to part of the hooded attack. Their account contributed key details about his build and gait.",
      credit: "Napa County Sheriff's Office / public domain",
      year: "1969",
    },
    {
      id: "lake-herman-road",
      url: "/zodiac/lake-herman-road.png",
      caption: "Lake Herman Road, Benicia — the site of the Zodiac's first confirmed double murder on December 20, 1968. David Faraday and Betty Lou Jensen, both teenagers on their first date, were shot dead at a gravel turnout on this rural stretch of road.",
      credit: "Wikimedia Commons / public domain",
      year: "1968",
    },
    {
      id: "hartnell-car-door",
      url: "/zodiac/hartnell-car-door.jpg",
      caption: "The car door of Bryan Hartnell's white Volkswagen at Lake Berryessa. After stabbing Hartnell and Cecelia Shepard, the Zodiac wrote the dates of his previous attacks in felt-tip pen on this door — treating the car as a scoreboard.",
      credit: "Napa County Sheriff's Office / public domain",
      year: "1969",
    },
    {
      id: "lake-berryessa",
      url: "/zodiac/lake-berryessa.jpg",
      caption: "Lake Berryessa, Napa County — looking northeast from Oak Shore, near the site of the September 27, 1969 attack. The Zodiac approached two picnickers wearing a black executioner's hood with a crossed-circle stitched to the chest.",
      credit: "Wikimedia Commons / public domain",
      year: "Contemporary",
    },
    {
      id: "stine-crime-scene",
      url: "/zodiac/stine-crime-scene.jpg",
      caption: "Washington Street and Cherry Street, Presidio Heights, San Francisco — the site of the Paul Stine murder on October 11, 1969. Stine was shot once in the head in his cab. The Zodiac tore a swatch from his bloodstained shirt and later mailed it to the Chronicle as proof.",
      credit: "Wikimedia Commons / public domain",
      year: "2009",
    },
    {
      id: "zodiac-letter-jul1969",
      url: "/zodiac/zodiac-letter-jul1969.jpg",
      caption: "One of the three near-identical letters sent to Bay Area newspapers on July 31, 1969 — each carrying one third of the Z408 cipher. The killer demanded front-page publication and threatened a killing spree if ignored. This letter went to the San Francisco Chronicle.",
      credit: "Zodiac Killer / public domain (historical document)",
      year: "1969",
    },
    {
      id: "zodiac-letter-nov1969",
      url: "/zodiac/zodiac-letter-nov1969.jpg",
      caption: "Page one of the seven-page Zodiac letter to the San Francisco Chronicle, November 9, 1969 — mailed the day after the Z340 cipher. The letter threatened to shoot out the tires of a school bus and kill the children, and included a diagram of a bomb.",
      credit: "Zodiac Killer / public domain (historical document)",
      year: "1969",
    },
  ],

  sources: [
    {
      label: "zodiackiller.com — Case archive",
      url: "https://www.zodiackiller.com",
      description: "Michael Butterfield's exhaustive case archive. Real AP photos of victims and crime scenes, suspect profiles, letters, and timeline — the most photographically complete Zodiac resource online.",
    },
    {
      label: "zodiackillerfacts.com — Forensic deep-dive",
      url: "https://zodiackillerfacts.com/case-summary/",
      description: "Crime-by-crime forensic breakdown: ballistics, fingerprints, DNA, eyewitness accounts, and official police reports. Essential for evaluating the physical evidence.",
    },
    {
      label: "zodiackillerciphers.com — Cipher research",
      url: "https://zodiackillerciphers.com/wiki/index.php?title=Main_Page",
      description: "David Oranchak's cipher wiki — he led the team that finally cracked the Z340 in 2020 after 51 years. Every cipher analyzed in rigorous detail.",
    },
    {
      label: "FBI Vault — Declassified Zodiac Files",
      url: "https://vault.fbi.gov/The%20Zodiac%20Killer",
      description: "The FBI's own released files on the case — internal memos, correspondence with SFPD and Napa SO, and handwriting analysis reports.",
    },
    {
      label: "zodiacrevisited.com — Independent analysis",
      url: "https://www.zodiacrevisited.com",
      description: "Michael Cole's independent cold-case analysis, including the contested Cheri Jo Bates connection and detailed comparisons of all major suspects.",
    },
    {
      label: "Arthur Leigh Allen — Prime suspect file",
      url: "https://zodiackiller.com/zodiac-killer-suspect-arthur-leigh-allen/",
      description: "Full documented profile on the only man ever served a search warrant in the Zodiac case. Evidence for and against, search results, and investigator accounts.",
    },
    {
      label: "California DOJ — Official case status",
      url: "https://oag.ca.gov/zodiac",
      description: "The California Attorney General's office confirms the case is still open. The official government position: no one has ever been charged.",
    },
    {
      label: "Wikipedia — Zodiac Killer overview",
      url: "https://en.wikipedia.org/wiki/Zodiac_Killer",
      description: "A well-sourced encyclopedic summary of the entire case — useful as a starting reference with footnotes to primary sources.",
    },
  ],
};

const lockedCase = (
  id: string,
  codename: string,
  years: string,
  tagline: string
): CaseFile => ({
  id,
  codename,
  title: codename,
  status: "SEALED",
  locked: true,
  years,
  jurisdiction: "FILE SEALED",
  tagline,
  bodyCount: "FILE SEALED",
  briefing: [],
  mission: "",
  victims: [],
  timeline: [],
  evidence: [],
  ciphers: [],
  suspects: [],
  verdict: [],
});

export const cases: CaseFile[] = [
  zodiac,
  lockedCase(
    "black-dahlia",
    "THE BLACK DAHLIA",
    "1947",
    "A Hollywood murder so brutal it became legend. Evidence locker not yet opened."
  ),
  lockedCase(
    "jack-the-ripper",
    "JACK THE RIPPER",
    "1888",
    "Whitechapel's autumn of terror. Casefile pending declassification."
  ),
];

export function getCase(id: string): CaseFile | undefined {
  return cases.find((c) => c.id === id);
}

export function getCases(): CaseFile[] {
  return cases;
}
