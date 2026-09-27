// torph's playground cases (https://torph.lochie.me/playground), from
// packages/test-cases/src/cases.ts and number-cases.ts in lochie/torph, so
// the tune page can run every one of them. Rendering fields only: their
// verify functions check torph's own segment IDs.

export type TorphCase = {
  label: string;
  description: string;
  tags: string[];
  values: (string | number)[];
  /** Caret after each value's edit, for the editable-field cases. */
  cursors?: (number | undefined)[];
  locale?: string;
  decimals?: number;
  align?: "left" | "center" | "right";
  /** Lines the stage keeps room for. */
  minLines?: number;
  tabular?: boolean;
};

export const TORPH_TEXT_CASES: TorphCase[] = [
  {
    label: "Word reorder + exit",
    description:
      "Transaction should FLIP to its new position. Safe should exit, Processing should enter.",
    tags: ["flip", "exit direction"],
    values: ["Transaction Safe", "Processing Transaction"],
  },
  {
    label: "Same word, reversed order",
    description:
      'Both "hello" and "world" FLIP to swap positions. No enter/exit — just movement.',
    tags: ["flip"],
    values: ["hello world", "world hello"],
  },
  {
    label: "Add word",
    description: '"hello" persists in place. "world" enters with fade + scale.',
    tags: ["enter"],
    values: ["hello", "hello world"],
  },
  {
    label: "Remove word",
    description: '"hello" persists. "world" exits with fade out.',
    tags: ["exit"],
    values: ["hello world", "hello"],
  },
  {
    label: "Dissimilar word replacement",
    description:
      '"cat" and "dog" exit as whole words (no char morph). "fish" and "bird" enter. "and" persists.',
    tags: ["no morph", "enter", "exit"],
    values: ["cat and dog", "fish and bird"],
  },
  {
    label: "Resemblance across a surviving word",
    description:
      '"Copy" and "Copied" share "Cop", but "Address" survives between them. "Copy" exits and "Copied" enters — the shared characters do not cross the value.',
    tags: ["no morph", "enter", "exit"],
    values: ["Copy Address", "Address Copied"],
  },
  {
    label: "Multi-word persist",
    description:
      '"the" and "brown" persist across states. Changed words enter/exit smoothly.',
    tags: ["flip", "enter", "exit"],
    values: [
      "the quick brown fox",
      "the slow brown dog",
      "a quick brown fox jumps",
    ],
  },
  {
    label: "Duplicate words",
    description:
      'Both "the" instances persist with distinct IDs. "cat"/"dog" exit, "big"/"small" enter.',
    tags: ["duplicates", "flip"],
    values: ["the cat and the dog", "the big and the small"],
  },
  {
    label: "Character morph (add prefix)",
    description:
      '"p" enters while "n", "p", "m" persist and FLIP. "i" and "torph" stay unchanged.',
    tags: ["char morph", "split"],
    values: ["npm i torph", "pnpm i torph"],
  },
  {
    label: "Character morph + word swap",
    description:
      '"npm" morphs to "pnpm" at char level. "i" exits, "add" enters. "torph" persists.',
    tags: ["char morph", "enter", "exit"],
    values: ["npm i torph", "pnpm add torph"],
  },
  {
    label: "Reverse character morph",
    description:
      '"pnpm" splits into chars. "n", "p", "m" persist into "npm", the leading "p" exits.',
    tags: ["char morph", "reverse"],
    values: ["pnpm i torph", "npm i torph"],
  },
  {
    label: "Single character change",
    description: '"c", "a", "r" persist. "t" exits and "d" enters.',
    tags: ["char morph"],
    values: ["cart", "card"],
  },
  {
    label: "Case change",
    description:
      "Same words, different casing. Char morph handles the letter-level changes.",
    tags: ["char morph"],
    values: ["Hello World", "hello world"],
  },
  {
    label: "Punctuation",
    description:
      '"Hello," char-morphs to "Hello" — shared char IDs persist. "world!" likewise morphs to "world".',
    tags: ["char morph"],
    values: ["Hello, world!", "Hello world"],
  },
  {
    label: "Numbers morph by place",
    description:
      "A numeric word goes to the number matcher, not to character matching. Four orders of magnitude is past the point where the two are the same figure moving, so only the affix holds and the number itself is replaced.",
    tags: ["number", "place"],
    values: ["$1,234", "$12,345,678", "$99"],
    align: "right",
  },
  {
    label: "Number inside a sentence",
    description:
      "The figure morphs by place while the words around it hold their identity — the units digit stays put as the count grows a tens column.",
    tags: ["number", "place"],
    values: ["3 unread messages", "13 unread messages", "9 unread messages"],
  },
  {
    label: "Digits and symbols are told apart",
    description:
      "Kinds drive the animation: digits slide down into place, the symbols around them slide up. Everything else stays text.",
    tags: ["number"],
    values: ["$1,234", "$5,678"],
  },
  {
    label: "Version strings stay text",
    description:
      'A token has to be a quantity all the way through to morph as one. "v1.2.3" has no units column, so it morphs character by character like any other word.',
    tags: ["number"],
    values: ["v1.2.3", "v1.3.0", "v2.0.0"],
  },
  {
    label: "Two numbers, one sentence",
    description:
      "The second figure pairs with the second figure, not with the first. Both numbers stand in for each other during the word-level match, so their order in the sentence is what carries them across.",
    tags: ["number", "place"],
    values: ["2 of 10 done", "2 of 15 done", "7 of 15 done"],
  },
  {
    label: "Emptying a number to its affix",
    description:
      'Backspacing the last digit out of "$4" leaves a token with no digits left to be a number by. The dollar sign is still the same dollar sign, so it holds rather than re-entering.',
    tags: ["number", "exit"],
    values: ["$4", "$", "$4", "$420"],
  },
  {
    label: "A number never claims a word",
    description:
      '"5" and "five" are the same quantity and share no characters, so the digit leaves and the word arrives. Spelling is the only thing the diff can see.',
    tags: ["number"],
    values: ["5 items", "five items"],
  },
  {
    label: "Affixes hold while digits churn",
    description:
      "Brackets, currency symbols and group separators are the still part of a number. Every digit can change under them without any of them moving.",
    tags: ["number", "place"],
    values: ["(1,234)", "(5,678)", "12%", "97%"],
    align: "right",
  },
  {
    label: "A digit pushed into the middle",
    description:
      "1,234 gains a column and 123,456 gains a digit in the middle of itself. Both keep every digit they already had: when a number changes shape rather than just value, what carries is which digits are the same digits, so the run slides to its new magnitude instead of the whole figure being rebuilt around the newcomer.",
    tags: ["number", "place", "enter"],
    values: ["123,456", "1,234,576"],
  },
  {
    label: "A number holds across a new line",
    description:
      "A second line arrives above a figure that has not itself changed. Each numeric character sits in its own clip box rather than relying on the root, so gaining a line costs the number nothing — every digit keeps its identity and its place.",
    tags: ["number", "multiline"],
    values: ["1,234", "Total\n1,234"],
    minLines: 2,
  },
  {
    label: "A number changes as a line arrives",
    description:
      "The second line and a new figure land on the same morph. Place matching still applies across the line change, and every digit here is different — so the group separator is the one thing that carries.",
    tags: ["number", "multiline", "place"],
    values: ["1,234", "Total\n5,678"],
    minLines: 2,
  },
  {
    label: "A number on a middle line updates",
    description:
      "The figure between two other lines is replaced while they hold still, newlines included. A digit slides one line box, not the height of the whole block, and its slot is what it disappears behind — so the lines around it are never touched.",
    tags: ["number", "multiline", "place"],
    values: ["a\n1,234\nb", "a\n5,678\nb"],
    minLines: 3,
  },
  {
    label: "A number swaps lines with its label",
    description:
      "The figure moves from the bottom line to the top and the label goes the other way. Both are matched as whole words across the newline, so they trade places intact rather than being rebuilt.",
    tags: ["number", "multiline"],
    values: ["text\n1,234", "1,234\ntext"],
    minLines: 2,
  },
  {
    label: "Dates stay text",
    description:
      "Same rule, and the one that matters most for a default: a hyphen is not a group separator, so a date is never mistaken for a number.",
    tags: ["number"],
    values: ["2024-01-01", "2024-02-01"],
  },
  {
    label: "Long word char morph",
    description:
      "Character-level morph on a long single word with partial overlap.",
    tags: ["char morph", "stress"],
    values: ["abcdefghijklmnop", "abcmnopqrstuvwx"],
  },
  {
    label: "Multiline basic",
    description:
      "Shared words persist across line breaks. Newlines are treated as word boundaries.",
    tags: ["multiline"],
    values: ["hello\nworld", "hello\nuniverse"],
    minLines: 2,
  },
  {
    label: "Multiline add line",
    description: "Adding a new line enters new words. Existing words persist.",
    tags: ["multiline", "enter"],
    values: ["hello world\ngoodbye", "hello world\ngoodbye\nfarewell"],
    minLines: 2,
  },
  {
    label: "Multiline remove line",
    description: "Removing a line exits those words. Remaining words persist.",
    tags: ["multiline", "exit"],
    values: ["hello world\nfoo bar\ngoodbye moon", "hello world\ngoodbye moon"],
    minLines: 2,
  },
  {
    label: "Multiline reorder",
    description:
      "Swapping line order. Shared words persist and FLIP to new positions.",
    tags: ["multiline", "flip"],
    values: ["alpha bravo\ncharlie delta", "charlie delta\nalpha bravo"],
    minLines: 2,
  },
  {
    label: "Multiline with edits",
    description:
      "Lines change content while shared words persist across the multiline transition.",
    tags: ["multiline", "flip"],
    values: [
      "the quick brown fox\njumps over the lazy dog",
      "the slow red fox\nleaps over the happy cat",
    ],
    minLines: 2,
  },
  {
    label: "Multiline ↔ single line",
    description:
      "Toggling between line break and space. Words persist and FLIP between vertical/horizontal layout.",
    tags: ["multiline", "flip"],
    values: ["hello\nworld", "hello world"],
  },
  {
    label: "Empty lines",
    description: "Collapsing a blank line. Words on remaining lines persist.",
    tags: ["multiline", "edge case"],
    values: ["hello\n\nworld", "hello\nworld"],
  },
  {
    label: "Multiline empty transition",
    description:
      "Multiline text exits to empty, then new multiline content enters from empty.",
    tags: ["multiline", "edge case"],
    values: ["hello\nworld", "", "foo\nbar"],
  },
  {
    label: "Empty to text",
    description:
      '"hello world" enters from empty. Morphing back to "" fades all words out gracefully.',
    tags: ["edge case"],
    values: ["", "hello world", ""],
  },
  {
    label: "Single character",
    description:
      "Minimal content — single char replacement. Each transition is a full exit/enter.",
    tags: ["edge case"],
    values: ["a", "b", "c"],
  },
  {
    label: "Complete replacement",
    description:
      "No character overlap. Everything exits and enters — no morph or persistence.",
    tags: ["edge case", "enter", "exit"],
    values: ["abcdef", "xyz"],
  },
  {
    label: "Whitespace normalization",
    description:
      "Extra spaces should not cause unexpected segment splits or ID changes.",
    tags: ["edge case"],
    values: ["hello world", "hello  world", "hello world"],
  },
  {
    label: "Emoji",
    description:
      "Emoji grapheme clusters are treated as single segments and persist correctly.",
    tags: ["grapheme"],
    values: ["Hello 👋", "Goodbye 👋"],
  },
  {
    label: "Compound emoji",
    description:
      "Complex emoji (family, flag sequences) are treated as single grapheme segments.",
    tags: ["grapheme"],
    values: ["Hello 👨‍👩‍👧‍👦", "Goodbye 👨‍👩‍👧‍👦"],
  },
  {
    label: "Unicode accents",
    description:
      "Accented characters (café → cafe). Shared base chars persist.",
    tags: ["grapheme"],
    values: ["café", "cafe"],
  },
  {
    label: "RTL text (Arabic)",
    description:
      "Arabic text segments and diffs correctly. Shared words persist.",
    tags: ["i18n"],
    values: ["مرحبا بالعالم", "مرحبا يا صديقي"],
  },
  {
    label: "RTL text (Hebrew)",
    description: "Hebrew text segmentation and persistence of shared words.",
    tags: ["i18n"],
    values: ["שלום עולם", "שלום חברים"],
  },
  {
    label: "Long sentence overlap",
    description: '"quick", "fox", "over" persist. Other words swap in/out.',
    tags: ["stress", "flip"],
    values: [
      "the quick brown fox jumps over the lazy dog",
      "the quick red fox leaps over the happy cat",
    ],
  },
  {
    label: "Long paragraph",
    description:
      "Stress test with paragraph-length text. Common words persist, unique words enter/exit.",
    tags: ["stress", "flip"],
    values: [
      "The quick brown fox jumps over the lazy dog while the sun sets behind the distant mountains",
      "The slow gray wolf runs under the bright moon while the rain falls across the nearby valleys",
    ],
  },
  {
    label: "Multi-cycle stability",
    description:
      '"Transaction" ID stays the same across 4+ cycles. Exit direction should never flip.',
    tags: ["stability", "cycles"],
    values: ["Transaction Safe", "Processing Transaction"],
  },
  {
    label: "Rapid spam (auto-cycle)",
    description:
      "Hit Auto to toggle every 150ms. Animations should queue gracefully without glitches.",
    tags: ["spam", "resilience"],
    values: ["Transaction Safe", "Processing Transaction"],
  },
];

export const TORPH_NUMBER_CASES: TorphCase[] = [
  {
    label: "Counter tick",
    description:
      "Only the units digit changes. The hundreds and tens digits should sit perfectly still.",
    tags: ["place", "counter"],
    values: [100, 101, 102, 103],
  },
  {
    label: "Integer grows left",
    description:
      "199 keeps 99 where it is and grows a new hundreds digit on the left, rather than shunting every digit along.",
    tags: ["place", "enter"],
    values: ["99", "199", "1,199"],
  },
  {
    label: "Mismatched digit mid-number",
    description:
      "A changed hundreds digit says nothing about the digits either side — they hold their places while it swaps.",
    tags: ["place"],
    values: ["1,234", "1,834"],
  },
  {
    label: "Every digit changes",
    description:
      "Nothing to persist. All four digits exit downward and their replacements enter from above, in place.",
    tags: ["enter", "exit"],
    values: ["1234", "5678"],
  },
  {
    label: "Separator slides up a magnitude",
    description:
      "999,999 → 1,000,000: the comma belongs to the second group now, not the first. It should slide one group along, not snap to the front.",
    tags: ["separator", "place"],
    values: ["999,999", "1,000,000"],
  },
  {
    label: "Separator slides back down",
    description:
      "The value loses a magnitude and keeps all four of the digits it still has, so they travel down together. The comma cannot travel with them — it would have to cross the run to reach its new group, the two passing in opposite directions — so it leaves and the new boundary arrives.",
    tags: ["separator", "exit"],
    values: ["12,345", "1,234"],
  },
  {
    label: "Separator survives a round trip",
    description:
      "Crossing 10,000 in both directions. The comma must keep one identity — a new one each way means it re-enters on every tick.",
    tags: ["separator", "stability"],
    values: ["9,999", "10,000"],
  },
  {
    label: "Currency to millions",
    description:
      "Four orders of magnitude apart. The $ is fixed and never moves, but the figure it denominates is not the same figure moving — hundreds and millions overlap so little that carrying anything across reads as a smear rather than as continuity. Nothing inside the number survives, so it can be replaced whole.",
    tags: ["currency", "magnitude"],
    values: ["$999.50", "$1,000,000.00"],
  },
  {
    label: "Trailing unit held",
    description:
      'The " MB" is not part of the number. It should stay put while the fraction changes length underneath it.',
    tags: ["unit", "place"],
    values: ["1.25 MB", "1.5 MB", "999 MB"],
  },
  {
    label: "Percent sign held",
    description:
      "0% → 50%: the % holds and the 0 slides right into the tens place as a new digit enters in front of it.",
    tags: ["unit", "place"],
    values: ["0%", "50%", "100%"],
  },
  {
    label: "Negative sign enters",
    description:
      "The digit is unchanged, so only the minus animates in — the 5 should not flicker.",
    tags: ["enter", "place"],
    values: ["5", "-5"],
  },
  {
    label: "Fraction grows right",
    description:
      "The fraction side is walked outward from the decimal point, so 1.5 → 1.55 appends rather than shifting.",
    tags: ["decimal", "place"],
    values: ["1.5", "1.55", "1.555"],
  },
  {
    label: "Fixed decimals",
    description:
      "Formatted to two places by the `decimals` option. Both sides of the point change, so only the point itself persists.",
    tags: ["decimal", "decimals"],
    values: [3.14159, 2.71828, 1.41421],
    decimals: 2,
  },
  {
    label: "Fixed-width clock",
    description:
      "09:59 → 10:00. The colon is the only character that holds; every digit around it changes.",
    tags: ["place", "unit"],
    values: ["09:59", "10:00", "10:01"],
  },
  {
    label: "German separators",
    description:
      "de-DE groups with dots and pivots on the comma. The decimal pivot holds, the integer digits carry across, and the group separator gives way to a new one rather than crossing them.",
    tags: ["locale", "separator"],
    values: ["1.234,56", "12.345,67"],
    locale: "de-DE",
  },
  {
    label: "Locale formatting",
    description:
      "Raw numbers formatted by TextMorph itself. Grouping follows the locale, so the same value reads differently per step.",
    tags: ["locale"],
    values: [1234567.891, 9876543.21],
    locale: "de-DE",
    decimals: 2,
  },
  {
    label: "French narrow spaces",
    description:
      "fr-FR groups with a narrow no-break space (U+202F) rather than a glyph. It is treated as the separator it is — including giving way when the digits around it are re-shaped.",
    tags: ["locale", "separator", "space"],
    values: ["1 234,56", "12 345,67", "1 234 567,89"],
    locale: "fr-FR",
  },
  {
    label: "Cursor insert",
    description:
      "A caret at index 3 says the 9 was typed there. Everything after it keeps its identity instead of being re-matched by place.",
    tags: ["cursor", "enter"],
    values: ["1234", "12934"],
    cursors: [undefined, 3],
  },
  {
    label: "Cursor delete",
    description:
      "Backspacing the last digit of a currency field. The caret pins the rest in place — no reflow of the digits in front.",
    tags: ["cursor", "exit"],
    values: ["$4.20", "$4.2"],
    cursors: [undefined, 4],
  },
  {
    label: "Typing a currency field",
    description:
      "The full type-in from the homepage demo, driven by caret position at every step.",
    tags: ["cursor", "currency", "spam"],
    values: ["$", "$2", "$20", "$420", "$4,020", "$4.20"],
    cursors: [1, 2, 3, 2, 4, 3],
  },
  {
    label: "Cursor grows a separator",
    description:
      "Typing the 4 of 1,234 is one keystroke that lands as two characters, and they are not adjacent. The caret speaks for the digit only — the comma it pushed in is new, and the digits before it slide rather than mutating into it.",
    tags: ["cursor", "separator", "enter"],
    values: ["123", "1,234", "12,345"],
    cursors: [undefined, 5, 6],
  },
  {
    label: "Cursor insert beside the same digit",
    description:
      "1,111 → 11,111 is the case place matching cannot call: every digit is a 1, so only the caret says which one was typed. The comma stays the comma while the digit at the caret is the one that enters.",
    tags: ["cursor", "separator", "enter"],
    values: ["1,111", "11,111"],
    cursors: [undefined, 2],
  },
  {
    label: "Currency symbol swaps",
    description:
      "Only the symbol changes. Every digit, the separator and the decimal point should be perfectly still — this is the case where any wobble is unambiguously a bug.",
    tags: ["currency", "place"],
    values: ["$99.00", "€99.00", "£99.00", "¥99.00"],
  },
  {
    label: "Delta badge",
    description:
      "A signed percentage. The sign flips and the digits change, but the decimal point and the % hold their places on either side of them.",
    tags: ["unit", "sign"],
    values: ["+2.4%", "−0.8%", "+11.2%", "0.0%"],
  },
  {
    label: "Compact suffix",
    description:
      "999K → 1.2K rewrites the number and grows a decimal point, but the K is an affix and belongs where it already is.",
    tags: ["unit", "decimal"],
    values: ["999K", "1.2K", "12.4M", "1.1B"],
  },
  {
    label: "Scoreline",
    description:
      "Spaces are segments too. Only the digit that actually changed should move; the spaces and the dash between them hold.",
    tags: ["space", "place"],
    values: ["0 - 0", "1 - 0", "1 - 1", "2 - 1"],
  },
  {
    label: "Tabular digits hold their column",
    description:
      "Same length in and out, so against tabular figures every character should sit in exactly the same place — only the glyphs swap. Any lateral movement here is the diff's fault, not the font's.",
    tags: ["tabular", "place"],
    values: ["1,234", "9,876", "5,555"],
    tabular: true,
  },
  {
    label: "Tabular currency counter",
    description:
      "A live price ticking under tabular figures: the $, the separators and the decimal all hold their columns while the digits swap underneath them.",
    tags: ["tabular", "currency", "counter"],
    values: ["$1,234.50", "$9,876.50", "$5,555.55"],
    tabular: true,
  },
  {
    label: "Tabular width change",
    description:
      "Crossing a magnitude adds a column, so the number legitimately gets wider. Everything to the right of the new digit still holds its own place — the row grows, it does not slide.",
    tags: ["tabular", "separator"],
    values: ["9,999", "10,000"],
    tabular: true,
  },
  {
    label: "Repeated digit shrinks",
    description:
      "Which of four identical 1s survives? Place matching keeps the rightmost three — the units digit stays the units digit — rather than the leftmost, which would shift the whole number one column left.",
    tags: ["repeat", "place"],
    values: ["1111", "111", "11", "1"],
  },
  {
    label: "Empty and back",
    description:
      "Nothing to match against, so both characters enter fresh. Collapsing to zero width is the rough edge here — watch the container, not the diff.",
    tags: ["empty", "container"],
    values: ["", "42", ""],
  },
  {
    label: "IDs stay unique",
    description:
      "IDs address DOM children, so a repeat inside one value would make two characters fight over the same node.",
    tags: ["ids", "spam"],
    values: ["1", "11", "111", "1,111", "11,111", "1,111", "111", "11", "1"],
  },
];
