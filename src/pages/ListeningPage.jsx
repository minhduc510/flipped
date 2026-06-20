import { Check, Headphones, Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import ChapterPicker from "../components/ChapterPicker";
import PageHeader from "../components/PageHeader";
import chaptersData from "../data/chapters.json";
import { db } from "../data/learningDb";
import { normalizeAnswer, splitIntoSentences } from "../utils/learning";

export default function ListeningPage() {
  const chapters = chaptersData.chapters;
  const [chapterNum, setChapterNum] = useState(
    () => Number(localStorage.getItem("flipped_current_chapter")) || 1,
  );
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [speed, setSpeed] = useState(0.9);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [dictation, setDictation] = useState("");
  const [checked, setChecked] = useState(false);
  const chapter =
    chapters.find((item) => item.chapterNum === chapterNum) || chapters[0];
  const paragraph = chapter.paragraphs[paragraphIndex] || chapter.paragraphs[0];
  const sentences = splitIntoSentences(paragraph.en);
  const dictationCorrect =
    normalizeAnswer(dictation).replace(/[^\w\s']/g, "") ===
    normalizeAnswer(paragraph.en).replace(/[^\w\s']/g, "");

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function stopSpeech() {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }

  function speak(text) {
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = speed;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  async function markListened() {
    await db.listeningProgress.put({
      id: `${chapterNum}:${paragraphIndex}`,
      chapterNum,
      paragraphIndex,
      completed: true,
      updatedAt: Date.now(),
    });
  }

  function selectParagraph(nextIndex) {
    stopSpeech();
    setParagraphIndex(nextIndex);
    setDictation("");
    setChecked(false);
  }

  return (
    <section className="feature-page">
      <Helmet>
        <title>{`Luyện Nghe Chương ${chapterNum} | Flipped Song Ngữ`}</title>
        <meta
          name="description"
          content={`Luyện nghe và chép chính tả (dictation) theo từng câu trích từ Chương ${chapterNum} sách Flipped hỗ trợ phát triển kỹ năng nhận âm.`}
        />
        <meta property="og:title" content={`Luyện Nghe Chương ${chapterNum} | Flipped Song Ngữ`} />
        <meta
          property="og:description"
          content={`Luyện nghe và chép chính tả (dictation) theo từng câu trích từ Chương ${chapterNum} sách Flipped hỗ trợ phát triển kỹ năng nhận âm.`}
        />
        <meta property="og:image" content={`${import.meta.env.VITE_SITE_URL}/cover.jpg`} />
        <meta property="og:url" content={`${import.meta.env.VITE_SITE_URL}/listen`} />
      </Helmet>
      <PageHeader
        eyebrow="Listening & dictation"
        title="Nghe từng câu"
        description="Nghe toàn đoạn hoặc từng câu, điều chỉnh tốc độ và chép chính tả để kiểm tra khả năng nhận âm."
        actions={
          <>
            <ChapterPicker
              chapters={chapters}
              value={chapterNum}
              onChange={(value) => {
                setChapterNum(value);
                selectParagraph(0);
              }}
            />
            <label className="inline-field">
              <span>Tốc độ {speed}×</span>
              <input
                type="range"
                min="0.5"
                max="1.3"
                step="0.1"
                value={speed}
                onChange={(event) => setSpeed(Number(event.target.value))}
              />
            </label>
          </>
        }
      />

      {!("speechSynthesis" in window) && (
        <div className="notice warning-notice">
          Trình duyệt này không hỗ trợ Web Speech API. Phần chép chính tả vẫn sử
          dụng được.
        </div>
      )}

      <div className="listening-layout">
        <aside className="paragraph-picker">
          <h2>Đoạn văn</h2>
          {chapter.paragraphs.map((item, index) => (
            <button
              key={`${chapterNum}-${index}`}
              className={index === paragraphIndex ? "active" : ""}
              onClick={() => selectParagraph(index)}
            >
              <span>{index + 1}</span>
              <span className="paragraph-text-preview">{item.en.slice(0, 70)}…</span>
            </button>
          ))}
        </aside>

        <div className="listening-workspace">
          <div className="audio-toolbar">
            <button
              className="primary-button"
              onClick={() => (isSpeaking ? stopSpeech() : speak(paragraph.en))}
            >
              {isSpeaking ? <Pause size={18} /> : <Play size={18} />}
              {isSpeaking ? "Dừng" : "Nghe cả đoạn"}
            </button>
            <button className="secondary-button" onClick={markListened}>
              <Check size={18} /> Đánh dấu đã nghe
            </button>
          </div>

          <article className="sentence-player">
            {sentences.map((sentence, index) => (
              <div key={`${sentence}-${index}`}>
                <button onClick={() => speak(sentence)} title="Nghe câu này">
                  <Volume2 size={18} />
                </button>
                <p>{sentence}</p>
              </div>
            ))}
          </article>

          <article className="dictation-card">
            <div>
              <Headphones size={20} />
              <h2>Chép chính tả</h2>
            </div>
            <p>Nghe đoạn văn, sau đó nhập lại toàn bộ câu bạn nghe được.</p>
            <textarea
              value={dictation}
              onChange={(event) => {
                setDictation(event.target.value);
                setChecked(false);
              }}
              placeholder="Type what you hear..."
            />
            <button
              className="primary-button"
              disabled={!dictation.trim()}
              onClick={() => setChecked(true)}
            >
              So sánh
            </button>
            {checked && (
              <div
                className={`dictation-result ${dictationCorrect ? "correct" : "incorrect"}`}
              >
                <strong>
                  {dictationCorrect ? "Chính xác!" : "Chưa khớp hoàn toàn."}
                </strong>
                {!dictationCorrect && <p>Đáp án: {paragraph.en}</p>}
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
