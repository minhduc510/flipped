import Dexie from "dexie";

export const db = new Dexie("FlippedLearning");

db.version(1).stores({
  flashcards: "id, chapterNum, word, status, dueAt, updatedAt",
  reviewHistory: "++id, cardId, chapterNum, reviewedAt, rating",
  quizAttempts: "++id, chapterNum, completedAt, score",
  clozeAttempts: "++id, chapterNum, completedAt, score",
  listeningProgress: "id, chapterNum, paragraphIndex, completed, updatedAt",
  chapterProgress: "chapterNum, lastOpenedAt, completedAt",
});

export async function addChapterToReview(chapter) {
  const now = Date.now();
  const cards = (chapter.vocabulary || []).map((item) => ({
    id: `${chapter.chapterNum}:${item.word.toLowerCase()}`,
    chapterNum: chapter.chapterNum,
    word: item.word,
    type: item.type,
    ipa: item.ipa,
    vi: item.vi || item.definition,
    definition: item.definition,
    context: item.context,
    contextVi: item.contextVi,
    example: item.example,
    exampleVi: item.exampleVi,
    status: "new",
    intervalDays: 0,
    ease: 2.5,
    repetitions: 0,
    dueAt: now,
    createdAt: now,
    updatedAt: now,
  }));

  const existingCards = await db.flashcards.bulkGet(cards.map((card) => card.id));
  const newCards = cards.filter((card, index) => !existingCards[index]);
  if (newCards.length) {
    await db.flashcards.bulkAdd(newCards);
  }
  return newCards.length;
}

export async function reviewCard(card, rating) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const currentEase = card.ease || 2.5;
  const currentInterval = card.intervalDays || 0;
  const currentRepetitions = card.repetitions || 0;

  const schedules = {
    again: {
      intervalDays: 0,
      dueAt: now + 10 * 60 * 1000,
      ease: Math.max(1.3, currentEase - 0.2),
      repetitions: 0,
      status: "learning",
    },
    hard: {
      intervalDays: Math.max(1, Math.round(currentInterval * 1.2) || 1),
      ease: Math.max(1.3, currentEase - 0.15),
      repetitions: currentRepetitions + 1,
      status: "learning",
    },
    good: {
      intervalDays:
        currentRepetitions === 0
          ? 1
          : currentRepetitions === 1
            ? 3
            : Math.max(3, Math.round(currentInterval * currentEase)),
      ease: currentEase,
      repetitions: currentRepetitions + 1,
      status: currentRepetitions >= 2 ? "review" : "learning",
    },
    easy: {
      intervalDays:
        currentRepetitions === 0
          ? 4
          : Math.max(4, Math.round(currentInterval * currentEase * 1.3)),
      ease: Math.min(3.2, currentEase + 0.15),
      repetitions: currentRepetitions + 1,
      status: "mastered",
    },
  };

  const schedule = schedules[rating] || schedules.good;
  if (rating !== "again") {
    schedule.dueAt = now + schedule.intervalDays * day;
  }

  await db.transaction("rw", db.flashcards, db.reviewHistory, async () => {
    await db.flashcards.update(card.id, {
      ...schedule,
      lastReviewedAt: now,
      updatedAt: now,
    });
    await db.reviewHistory.add({
      cardId: card.id,
      chapterNum: card.chapterNum,
      word: card.word,
      rating,
      reviewedAt: now,
    });
  });
}

export async function markChapterOpened(chapterNum) {
  const existing = await db.chapterProgress.get(chapterNum);
  await db.chapterProgress.put({
    ...existing,
    chapterNum,
    lastOpenedAt: Date.now(),
  });
}

export async function markChapterCompleted(chapterNum) {
  const existing = await db.chapterProgress.get(chapterNum);
  await db.chapterProgress.put({
    ...existing,
    chapterNum,
    lastOpenedAt: existing?.lastOpenedAt || Date.now(),
    completedAt: Date.now(),
  });
}
