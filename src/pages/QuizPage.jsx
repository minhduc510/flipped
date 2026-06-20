import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import ChapterPicker from "../components/ChapterPicker";
import PageHeader from "../components/PageHeader";
import chaptersData from "../data/chapters.json";
import { db } from "../data/learningDb";
import { createQuiz } from "../utils/learning";

export default function QuizPage() {
  const chapters = chaptersData.chapters;
  const [chapterNum, setChapterNum] = useState(
    () => Number(localStorage.getItem("flipped_current_chapter")) || 1,
  );
  const [sessionKey, setSessionKey] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const chapter =
    chapters.find((item) => item.chapterNum === chapterNum) || chapters[0];
  const questions = useMemo(() => {
    void sessionKey;
    return createQuiz(chapter, 10);
  }, [chapter, sessionKey]);
  const score = questions.filter(
    (question) => answers[question.id] === question.answer,
  ).length;

  function resetQuiz(nextChapter = chapterNum) {
    setChapterNum(nextChapter);
    setSessionKey((current) => current + 1);
    setAnswers({});
    setSubmitted(false);
  }

  async function submitQuiz() {
    if (Object.keys(answers).length !== questions.length) return;
    setSubmitted(true);
    await db.quizAttempts.add({
      chapterNum,
      score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      completedAt: Date.now(),
    });
  }

  return (
    <section className="feature-page">
      <Helmet>
        <title>{`Trắc Nghiệm Chương ${chapterNum} | Flipped Song Ngữ`}</title>
        <meta
          name="description"
          content={`Làm bài trắc nghiệm (quiz) ôn tập từ vựng, cấu trúc ngữ pháp trực tiếp từ bối cảnh Chương ${chapterNum} của tiểu thuyết Flipped.`}
        />
      </Helmet>
      <PageHeader
        eyebrow="Active recall"
        title="Quiz theo chương"
        description="10 câu hỏi được tạo trực tiếp từ từ vựng và ngữ cảnh của chương."
        actions={
          <>
            <ChapterPicker
              chapters={chapters}
              value={chapterNum}
              onChange={(value) => resetQuiz(value)}
            />
            <button className="secondary-button" onClick={() => resetQuiz()}>
              <RefreshCw size={17} /> Đề mới
            </button>
          </>
        }
      />

      {submitted && (
        <div className="score-banner">
          <strong>
            {score}/{questions.length}
          </strong>
          <span>
            {score >= 8
              ? "Rất tốt — bạn đã nắm khá chắc chương này."
              : "Hãy xem phần giải thích và thử lại một đề mới."}
          </span>
        </div>
      )}

      <div className="question-list">
        {questions.map((question, index) => (
          <article className="question-card" key={question.id}>
            <div className="question-number">Câu {index + 1}</div>
            <h2>{question.prompt}</h2>
            <div className="option-grid">
              {question.options.map((option) => {
                const selected = answers[question.id] === option;
                const correct = submitted && option === question.answer;
                const incorrect =
                  submitted && selected && option !== question.answer;
                return (
                  <button
                    key={option}
                    disabled={submitted}
                    className={`quiz-option ${selected ? "selected" : ""} ${correct ? "correct" : ""} ${incorrect ? "incorrect" : ""}`}
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: option,
                      }))
                    }
                  >
                    {correct && <CheckCircle2 size={17} />}
                    {incorrect && <XCircle size={17} />}
                    {option}
                  </button>
                );
              })}
            </div>
            {submitted && question.explanation && (
              <p className="answer-explanation">{question.explanation}</p>
            )}
          </article>
        ))}
      </div>

      <div className="sticky-submit">
        <span>
          Đã trả lời {Object.keys(answers).length}/{questions.length}
        </span>
        <button
          className="primary-button"
          disabled={
            submitted || Object.keys(answers).length !== questions.length
          }
          onClick={submitQuiz}
        >
          Chấm điểm
        </button>
      </div>
    </section>
  );
}
