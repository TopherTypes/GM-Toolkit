// Passphrase generation utilities for item cards.

// Vocabulary lists for passphrase generation (kept deliberately short and thematic).
const ADJECTIVES = [
  "ashen",
  "verdant",
  "gilded",
  "hollow",
  "veiled",
  "duskbound",
  "frostbitten",
  "radiant",
  "grave",
  "silent",
  "luminous",
  "iron",
  "arcane",
  "moonlit",
  "winter",
];

const NOUNS = [
  "key",
  "sigil",
  "oath",
  "lantern",
  "crown",
  "blade",
  "covenant",
  "ember",
  "relic",
  "mirror",
  "seal",
  "chalice",
  "glyph",
  "veil",
  "token",
];

const QUALIFIERS = [
  "of dusk",
  "of ash",
  "of winter",
  "of glass",
  "of storms",
  "of iron",
  "of embers",
  "of the deep",
  "of the veil",
];

const TWO_WORD_MIN = 8;
const TWO_WORD_MAX = 20;
const THREE_WORD_MIN = 12;
const THREE_WORD_MAX = 28;

const getRandomEntry = (list) => list[Math.floor(Math.random() * list.length)];

// Normalize passphrases for consistent storage and collision checks.
export const normalizePassphrase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const isLengthValid = (phrase, isThreeWords) => {
  const length = phrase.length;
  if (isThreeWords) {
    return length >= THREE_WORD_MIN && length <= THREE_WORD_MAX;
  }
  return length >= TWO_WORD_MIN && length <= TWO_WORD_MAX;
};

const buildPhrase = (includeQualifier) => {
  const base = `${getRandomEntry(ADJECTIVES)} ${getRandomEntry(NOUNS)}`;
  const phrase = includeQualifier ? `${base} ${getRandomEntry(QUALIFIERS)}` : base;
  return normalizePassphrase(phrase);
};

const toRomanNumeral = (value) => {
  const romanNumerals = ["ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
  return romanNumerals[value - 2] || String(value);
};

// Generate a unique, thematic passphrase for item cards within a campaign scope.
export const generateUniquePassphrase = ({ existingPassphrases = [], maxAttempts = 10 } = {}) => {
  const normalizedSet = new Set(existingPassphrases.map(normalizePassphrase).filter(Boolean));

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const includeQualifier = Math.random() > 0.5;
    const phrase = buildPhrase(includeQualifier);
    if (!isLengthValid(phrase, includeQualifier)) {
      continue;
    }
    if (!normalizedSet.has(phrase)) {
      return { passphrase: phrase, message: "" };
    }
  }

  // Fall back to a suffixed passphrase when repeated collisions occur.
  let base = buildPhrase(false);
  if (!isLengthValid(base, false)) {
    base = buildPhrase(true);
  }
  let suffixValue = 2;
  let candidate = `${base}-${toRomanNumeral(suffixValue)}`;
  while (normalizedSet.has(candidate)) {
    suffixValue += 1;
    candidate = `${base}-${toRomanNumeral(suffixValue)}`;
  }

  return {
    passphrase: candidate,
    message: `Passphrase adjusted to avoid duplicates: "${candidate}".`,
  };
};
