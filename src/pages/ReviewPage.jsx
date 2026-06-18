import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Brain, CheckCircle2, Download, RotateCcw } from "lucide-react";
import chaptersData from "../data/chapters.json";
import ChapterPicker from "../components/ChapterPicker";
import PageHeader from "../components/PageHeader";
import { addChapterToReview, db, reviewCard } from "../data/learningDb";

const ratings = [
  { id: "again", label: "Quên", hint: "Ôn lại sau 10 phút", className: "danger" },
  { id: "hard", label: "Khó", hint: "Ôn lại ngày mai", className: "warning" },
  { id: "good", label: "Nhớ", hint: "Tăng khoảng cách ôn", className: "success" },
  { id: "easy", label: "Dễ", hint: "Đưa vào nhóm đã vững", className: "primary" },
];

export default function ReviewPage() {
  const chapters = chaptersData.chapters;
  const [chapterNum, setChapterNum] = useState(
    () => Number(localStorage.getItem("flipped_current_chapter")) || 1,
  );
  const [showAnswer, setShowAnswer] = useState(false);
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const cards = useLiveQuery(() => db.flashcards.toArray(), [], []);

  const chapterCards = useMemo(
    () => cards.filter((card) => card.chapterNum === chapterNum),
    [cards, chapterNum],
  );
  const dueCards = useMemo(
    () =>
      chapterCards
        .filter((card) => card.dueAt <= now)
        .sort((a, b) => a.dueAt - b.dueAt),
    [chapterCards, now],
  );
  const currentCard = dueCards[0];
  const currentChapter = chapters.find((chapter) => chapter.chapterNum === chapterNum);

  async function importChapter() {
    const count = await addChapterToReview(currentChapter);
    setNow(Date.now());
    setMessage(`Đã đưa ${count} từ của chương ${chapterNum} vào lịch ôn.`);
  }

  async function handleRating(rating) {
    await reviewCard(currentCard, rating);
    setShowAnswer(false);
  }

  return (
    <section className="feature-page">
      <PageHeader
        eyebrow="Spaced repetition"
        title="Ôn từ bằng SRS"
        description="Chỉ ôn những thẻ đến hạn. Mỗi đánh giá sẽ tự điều chỉnh ngày gặp lại từ đó."
        actions={
          <>
            <ChapterPicker chapters={chapters} value={chapterNum} onChange={setChapterNum} />
            <button className="primary-button" onClick={importChapter}>
              <Download size={17} /> Nạp từ chương này
            </button>
          </>
        }
      />

      {message && <div className="notice success-notice">{message}</div>}

      <div className="stat-strip">
        <article>
          <strong>{chapterCards.length}</strong>
          <span>Tổng thẻ</span>
        </article>
        <article>
          <strong>{dueCards.length}</strong>
          <span>Đến hạn</span>
        </article>
        <article>
          <strong>{chapterCards.filter((card) => card.status === "mastered").length}</strong>
          <span>Đã vững</span>
        </article>
      </div>

      {currentCard ? (
        <div className="review-stage">
          <article className={`flashcard ${showAnswer ? "revealed" : ""}`}>
            <div className="flashcard-label">
              <Brain size={18} /> {currentCard.type || "Từ vựng"}
            </div>
            <h2>{currentCard.word}</h2>
            {currentCard.ipa && <p className="flashcard-ipa">{currentCard.ipa}</p>}
            <p className="flashcard-context">{currentCard.context}</p>

            {showAnswer ? (
              <div className="flashcard-answer">
                <h3>{currentCard.vi}</h3>
                {currentCard.contextVi && <p>{currentCard.contextVi}</p>}
                {currentCard.example && currentCard.example !== currentCard.context && (
                  <blockquote>{currentCard.example}</blockquote>
                )}
              </div>
            ) : (
              <button className="primary-button reveal-button" onClick={() => setShowAnswer(true)}>
                Lật thẻ
              </button>
            )}
          </article>

          {showAnswer && (
            <div className="rating-grid">
              {ratings.map((rating) => (
                <button
                  key={rating.id}
                  className={`rating-button ${rating.className}`}
                  onClick={() => handleRating(rating.id)}
                >
                  <strong>{rating.label}</strong>
                  <small>{rating.hint}</small>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          {chapterCards.length ? <CheckCircle2 size={52} /> : <RotateCcw size={52} />}
          <h2>{chapterCards.length ? "Đã ôn hết thẻ đến hạn" : "Chưa có thẻ ôn tập"}</h2>
          <p>
            {chapterCards.length
              ? "Bạn có thể chuyển sang chương khác hoặc quay lại khi thẻ đến hạn."
              : "Nhấn “Nạp từ chương này” để tạo bộ thẻ đầu tiên."}
          </p>
        </div>
      )}
    </section>
  );
}
