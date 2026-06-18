export function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

export function createQuiz(chapter, size = 10) {
  const vocabulary = chapter.vocabulary || [];
  const selected = shuffle(vocabulary).slice(0, Math.min(size, vocabulary.length));

  return selected.map((item, index) => {
    const answer = item.vi || item.definition;
    const distractors = shuffle(
      vocabulary.filter(
        (candidate) =>
          candidate.word !== item.word &&
          (candidate.vi || candidate.definition) !== answer,
      ),
    )
      .map((candidate) => candidate.vi || candidate.definition)
      .filter((meaning, meaningIndex, meanings) => meanings.indexOf(meaning) === meaningIndex)
      .slice(0, 3);

    return {
      id: `${chapter.chapterNum}-${index}-${item.word}`,
      prompt: item.context
        ? `Trong câu “${item.context}”, “${item.word}” có nghĩa là gì?`
        : `“${item.word}” có nghĩa là gì?`,
      answer,
      options: shuffle([answer, ...distractors]),
      explanation: item.explanation,
    };
  });
}

export function createClozeExercise(chapter, blankCount = 8) {
  const candidates = shuffle(chapter.vocabulary || []);
  const paragraphs = chapter.paragraphs || [];
  const selected = [];

  for (const vocabulary of candidates) {
    const paragraphIndex = paragraphs.findIndex((paragraph) =>
      new RegExp(
        `(^|[^A-Za-z])${vocabulary.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^A-Za-z])`,
        "i",
      ).test(paragraph.en),
    );

    if (paragraphIndex >= 0 && !selected.some((item) => item.paragraphIndex === paragraphIndex)) {
      selected.push({ ...vocabulary, paragraphIndex });
    }
    if (selected.length >= blankCount) break;
  }

  return selected.map((item) => {
    const paragraph = paragraphs[item.paragraphIndex];
    const regex = new RegExp(
      `(^|[^A-Za-z])(${item.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?=$|[^A-Za-z])`,
      "i",
    );
    return {
      id: `${chapter.chapterNum}:${item.paragraphIndex}:${item.word}`,
      answer: item.word,
      text: paragraph.en.replace(regex, "$1_____"),
      translation: paragraph.vi,
      hint: item.vi || item.definition,
      paragraphIndex: item.paragraphIndex,
    };
  });
}

export function normalizeAnswer(value = "") {
  return value.trim().toLowerCase().replace(/[’]/g, "'");
}

export function splitIntoSentences(text = "") {
  return text.match(/[^.!?]+(?:[.!?]+["']?|$)/g)?.map((item) => item.trim()) || [];
}

export function formatStudyDate(timestamp) {
  if (!timestamp) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(timestamp));
}
