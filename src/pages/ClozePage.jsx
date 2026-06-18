import { useMemo, useState } from "react";
import { Eye, Lightbulb, RefreshCw } from "lucide-react";
import chaptersData from "../data/chapters.json";
import ChapterPicker from "../components/ChapterPicker";
import PageHeader from "../components/PageHeader";
import { db } from "../data/learningDb";
import { createClozeExercise, normalizeAnswer } from "../utils/learning";

export default function ClozePage() {
  const chapters = chaptersData.chapters;
  const [chapterNum, setChapterNum] = useState(
    () => Number(localStorage.getItem("flipped_current_chapter")) || 1,
  );
  const [sessionKey, setSessionKey] = useState(0);
  const [answers, setAnswers] = useState({});
  const [hints, setHints] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const chapter = chapters.find((item) => item.chapterNum === chapterNum) || chapters[0];
  const exercises = useMemo(
    () => {
      void sessionKey;
      return createClozeExercise(chapter, 8);
    },
    [chapter, sessionKey],
  );
  const score = exercises.filter(
    (exercise) => normalizeAnswer(answers[exercise.id]) === normalizeAnswer(exercise.answer),
  ).length;

  function reset(nextChapter = chapterNum) {
    setChapterNum(nextChapter);
    setSessionKey((current) => current + 1);
    setAnswers({});
    setHints({});
    setSubmitted(false);
  }

  async function submit() {
    setSubmitted(true);
    await db.clozeAttempts.add({
      chapterNum,
      score,
      total: exercises.length,
      percentage: Math.round((score / exercises.length) * 100),
      completedAt: Date.now(),
    });
  }

  return (
    <section className="feature-page">
      <PageHeader
        eyebrow="Context practice"
        title="Cloze Reading"
        description="Khôi phục từ bị ẩn trong câu thật của tác phẩm. Hãy dựa vào ngữ cảnh trước khi mở gợi ý."
        actions={
          <>
            <ChapterPicker
              chapters={chapters}
              value={chapterNum}
              onChange={(value) => reset(value)}
            />
            <button className="secondary-button" onClick={() => reset()}>
              <RefreshCw size={17} /> Bộ câu mới
            </button>
          </>
        }
      />

      {submitted && (
        <div className="score-banner">
          <strong>{score}/{exercises.length}</strong>
          <span>Đáp án đúng được tô xanh; hãy đọc lại cả câu thay vì chỉ nhớ riêng từ.</span>
        </div>
      )}

      <div className="cloze-list">
        {exercises.map((exercise, index) => {
          const isCorrect =
            submitted &&
            normalizeAnswer(answers[exercise.id]) === normalizeAnswer(exercise.answer);
          return (
            <article className="cloze-card" key={exercise.id}>
              <span className="question-number">Đoạn {index + 1}</span>
              <p className="cloze-text">{exercise.text}</p>
              <div className="cloze-answer-row">
                <input
                  value={answers[exercise.id] || ""}
                  disabled={submitted}
                  className={submitted ? (isCorrect ? "input-correct" : "input-incorrect") : ""}
                  placeholder="Nhập từ còn thiếu"
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [exercise.id]: event.target.value,
                    }))
                  }
                />
                <button
                  className="icon-text-button"
                  onClick={() =>
                    setHints((current) => ({ ...current, [exercise.id]: !current[exercise.id] }))
                  }
                >
                  <Lightbulb size={16} /> Gợi ý
                </button>
              </div>
              {hints[exercise.id] && <p className="hint-text">Nghĩa: {exercise.hint}</p>}
              {submitted && !isCorrect && (
                <p className="answer-explanation">
                  Đáp án: <strong>{exercise.answer}</strong>
                </p>
              )}
              {submitted && (
                <details>
                  <summary><Eye size={15} /> Xem bản dịch</summary>
                  <p>{exercise.translation}</p>
                </details>
              )}
            </article>
          );
        })}
      </div>

      <div className="sticky-submit">
        <span>Đã điền {Object.values(answers).filter(Boolean).length}/{exercises.length}</span>
        <button
          className="primary-button"
          disabled={submitted || Object.values(answers).filter(Boolean).length !== exercises.length}
          onClick={submit}
        >
          Kiểm tra đáp án
        </button>
      </div>
    </section>
  );
}
