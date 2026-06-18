// extractVocab.cjs
//
// Rebuilds each chapter's study material from the chapter-specific curated
// vocabulary/grammar maps in chapters.json. It also keeps older vocabulary
// entries only when their quoted context can be verified in that chapter.
//
// Vocabulary output:
//   word, type, ipa, definition, vi, context, contextVi,
//   example, exampleVi, explanation
//
// Grammar output:
//   structure, meaning, context, contextVi, example, exampleVi, explanation

const fs = require('fs');
const path = require('path');

const chaptersPath = path.resolve(__dirname, '..', 'data', 'chapters.json');

function normalizeText(value = '') {
  return value
    .normalize('NFKC')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function comparable(value = '') {
  return normalizeText(value)
    .toLocaleLowerCase('en-US')
    .replace(/[^\p{L}\p{N}' -]+/gu, '')
    .trim();
}

function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitSentences(text = '') {
  return normalizeText(text).match(/[^.!?]+(?:[.!?]+["']?|$)/g)?.map(s => s.trim()) || [];
}

function truncate(text = '', max = 360) {
  const clean = normalizeText(text);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function containsText(haystack = '', needle = '') {
  const h = comparable(haystack);
  const n = comparable(needle);
  return Boolean(n && h.includes(n));
}

function exactWordAppears(word = '', text = '') {
  const cleanWord = normalizeText(word);
  if (!cleanWord) return false;
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegex(cleanWord)}(?=$|[^\\p{L}\\p{N}])`, 'iu')
    .test(normalizeText(text));
}

function wordFamilyForms(word = '') {
  const base = normalizeText(word).toLocaleLowerCase('en-US');
  if (!base || base.includes(' ')) return [base];

  const forms = new Set([
    base,
    `${base}s`,
    `${base}es`,
    `${base}ed`,
    `${base}ing`,
    `${base}ly`,
    `${base}ness`,
    `${base}ment`,
    `${base}ance`,
    `${base}ence`,
    `${base}tion`,
    `${base}ship`,
  ]);

  if (base.endsWith('e')) {
    forms.add(`${base}d`);
    forms.add(`${base.slice(0, -1)}ing`);
  }
  if (base.endsWith('y')) {
    forms.add(`${base.slice(0, -1)}ies`);
    forms.add(`${base.slice(0, -1)}ied`);
  }
  if (/[bcdfghjklmnpqrstvwxyz]$/.test(base)) {
    const last = base.at(-1);
    forms.add(`${base}${last}ed`);
    forms.add(`${base}${last}ing`);
  }

  return [...forms];
}

function wordFamilyAppears(word = '', text = '') {
  return wordFamilyForms(word).some(form => exactWordAppears(form, text));
}

function findParagraph(paragraphs, context, term) {
  if (context) {
    const byContext = paragraphs.find(p => containsText(p.en, context));
    if (byContext) return byContext;
  }

  return paragraphs.find(p => wordFamilyAppears(term, p.en)) || null;
}

function findSentence(text, term, preferred = '') {
  if (preferred) {
    const preferredClean = normalizeText(preferred);
    const exact = splitSentences(text).find(sentence => containsText(sentence, preferredClean));
    if (exact) return exact;
    if (containsText(text, preferredClean)) return preferredClean;
  }

  return splitSentences(text).find(sentence => wordFamilyAppears(term, sentence)) || '';
}

function translatedSentence(paragraph, englishSentence) {
  if (!paragraph?.vi) return '';

  const englishSentences = splitSentences(paragraph.en);
  const vietnameseSentences = splitSentences(paragraph.vi);
  const index = englishSentences.findIndex(sentence => containsText(sentence, englishSentence));

  // Paragraph translations in the source are usually sentence-aligned.
  if (index >= 0 && vietnameseSentences[index]) {
    return truncate(vietnameseSentences[index]);
  }

  // When sentence boundaries differ, the whole translated paragraph is still
  // more accurate than an invented machine translation.
  return truncate(paragraph.vi);
}

function findAlternativeExample(paragraphs, term, sourceContext) {
  const source = comparable(sourceContext);

  for (const paragraph of paragraphs) {
    for (const sentence of splitSentences(paragraph.en)) {
      if (wordFamilyAppears(term, sentence) && comparable(sentence) !== source) {
        return {
          example: sentence,
          exampleVi: translatedSentence(paragraph, sentence),
        };
      }
    }
  }

  return {
    example: sourceContext,
    exampleVi: '',
  };
}

function contextualExplanation(entry, vietnameseMeaning) {
  const original = normalizeText(entry.explanation);
  const contextual = vietnameseMeaning
    ? `Trong ngữ cảnh của chương, “${entry.word}” mang nghĩa “${vietnameseMeaning}”.`
    : '';

  if (!original) return contextual;
  if (!contextual || original.includes(vietnameseMeaning)) return original;
  return `${contextual} ${original}`;
}

function vocabularyKey(entry) {
  return comparable(entry.word);
}

function grammarKey(entry) {
  return comparable(entry.structure);
}

function mergeUnique(primary, secondary, keyFn) {
  const result = [];
  const seen = new Set();

  for (const entry of [...primary, ...secondary]) {
    const key = keyFn(entry);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(entry);
  }

  return result;
}

function enrichVocabulary(entry, paragraphs) {
  const paragraph = findParagraph(paragraphs, entry.context, entry.word);
  const context = paragraph
    ? findSentence(paragraph.en, entry.word, entry.context) || normalizeText(entry.context)
    : normalizeText(entry.context);
  const contextVi = paragraph ? translatedSentence(paragraph, context) : '';
  const vietnameseMeaning = normalizeText(entry.vi || entry.definition);
  const alternative = findAlternativeExample(paragraphs, entry.word, context);

  return {
    word: normalizeText(entry.word),
    type: normalizeText(entry.type || 'word'),
    ipa: normalizeText(entry.ipa),
    definition: normalizeText(entry.englishDefinition || entry.definition),
    vi: vietnameseMeaning,
    context,
    contextVi,
    example: alternative.example || context,
    exampleVi: alternative.exampleVi || contextVi,
    explanation: contextualExplanation(entry, vietnameseMeaning),
  };
}

function enrichGrammar(entry, paragraphs) {
  const paragraph = findParagraph(paragraphs, entry.context, '');
  const context = paragraph
    ? findSentence(paragraph.en, '', entry.context) || normalizeText(entry.context)
    : normalizeText(entry.context);
  const contextVi = paragraph ? translatedSentence(paragraph, context) : '';

  return {
    structure: normalizeText(entry.structure),
    meaning: normalizeText(entry.meaning),
    context,
    contextVi,
    example: context,
    exampleVi: contextVi,
    explanation: normalizeText(entry.explanation),
  };
}

function contextAppearsInParagraphs(context, paragraphs) {
  return Boolean(context && paragraphs.some(paragraph => containsText(paragraph.en, context)));
}

function isVerifiedLegacyVocabulary(entry, chapterText, paragraphs) {
  if (!entry?.word || !entry?.context) return false;
  if (entry.context.includes('(from chapter text)')) return false;
  return contextAppearsInParagraphs(entry.context, paragraphs)
    && wordFamilyAppears(entry.word, chapterText);
}

function isRelevantCuratedVocabulary(entry, chapterText, paragraphs) {
  if (!entry?.word) return false;

  // A curated context may intentionally demonstrate another form in the same
  // word family (avoid -> avoidance, embarrass -> embarrassing), so a verified
  // quotation is sufficient even when the headword itself is not literal.
  if (contextAppearsInParagraphs(entry.context, paragraphs)) return true;

  // Some older curated entries used a generic placeholder. Keep those only
  // when the headword itself really occurs; enrichVocabulary will replace the
  // placeholder with the actual sentence from the chapter.
  return wordFamilyAppears(entry.word, chapterText);
}

function isVerifiedLegacyGrammar(entry, chapterText) {
  return Boolean(entry?.structure && entry?.context && containsText(chapterText, entry.context));
}

function rebuild() {
  console.log('Reading chapters.json...');
  const data = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));

  let vocabularyTotal = 0;
  let grammarTotal = 0;

  data.chapters = data.chapters.map(chapter => {
    const chapterId = String(chapter.chapterNum);
    const paragraphs = chapter.paragraphs || [];
    const chapterText = paragraphs.map(p => p.en || '').join(' ');

    const curatedVocabulary = (data.vocabulary?.[chapterId] || [])
      .filter(entry => isRelevantCuratedVocabulary(entry, chapterText, paragraphs));
    const verifiedLegacyVocabulary = (chapter.vocabulary || [])
      .filter(entry => isVerifiedLegacyVocabulary(entry, chapterText, paragraphs));
    const vocabularySource = mergeUnique(
      curatedVocabulary,
      verifiedLegacyVocabulary,
      vocabularyKey,
    );

    const curatedGrammar = data.grammar?.[chapterId] || [];
    const verifiedLegacyGrammar = (chapter.grammar || [])
      .filter(entry => isVerifiedLegacyGrammar(entry, chapterText));
    const grammarSource = mergeUnique(
      curatedGrammar,
      verifiedLegacyGrammar,
      grammarKey,
    );

    const vocabulary = vocabularySource.map(entry => enrichVocabulary(entry, paragraphs));
    const grammar = grammarSource.map(entry => enrichGrammar(entry, paragraphs));

    vocabularyTotal += vocabulary.length;
    grammarTotal += grammar.length;
    console.log(
      `Chapter ${chapter.chapterNum}: ${vocabulary.length} vocabulary, ${grammar.length} grammar`,
    );

    return {
      ...chapter,
      vocabulary,
      grammar,
    };
  });

  fs.writeFileSync(chaptersPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Done: ${vocabularyTotal} vocabulary and ${grammarTotal} grammar items.`);
}

rebuild();
