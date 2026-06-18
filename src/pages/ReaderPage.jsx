import { useEffect, useState } from "react";
import chaptersData from "../data/chapters.json";
import ControlPanel from "../components/ControlPanel";
import Reader from "../components/Reader";
import VocabularyList from "../components/VocabularyList";
import SavedWords from "../components/SavedWords";
import { markChapterCompleted, markChapterOpened } from "../data/learningDb";

export default function ReaderPage() {
  const chapters = chaptersData.chapters;
  const [currentChapterNum, setCurrentChapterNum] = useState(
    () => Number(localStorage.getItem("flipped_current_chapter")) || 1,
  );
  const [readingMode, setReadingMode] = useState(
    () => localStorage.getItem("flipped_reading_mode") || "parallel",
  );
  const [theme, setTheme] = useState(
    () => localStorage.getItem("flipped_theme") || "sepia",
  );
  const [fontSize, setFontSize] = useState(
    () => Number(localStorage.getItem("flipped_font_size")) || 18,
  );
  const [lineHeight, setLineHeight] = useState(
    () => Number(localStorage.getItem("flipped_line_height")) || 1.7,
  );
  const [savedWords, setSavedWords] = useState(() => {
    const saved = localStorage.getItem("flipped_saved_words");
    return saved ? JSON.parse(saved) : [];
  });
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [scrollToTerm, setScrollToTerm] = useState(null);

  useEffect(() => {
    localStorage.setItem("flipped_current_chapter", currentChapterNum);
    markChapterOpened(currentChapterNum);
  }, [currentChapterNum]);
  useEffect(() => localStorage.setItem("flipped_reading_mode", readingMode), [readingMode]);
  useEffect(() => {
    localStorage.setItem("flipped_theme", theme);
    window.dispatchEvent(new CustomEvent("flipped-theme-change", { detail: theme }));
  }, [theme]);
  useEffect(() => localStorage.setItem("flipped_font_size", fontSize), [fontSize]);
  useEffect(() => localStorage.setItem("flipped_line_height", lineHeight), [lineHeight]);
  useEffect(() => {
    localStorage.setItem("flipped_saved_words", JSON.stringify(savedWords));
  }, [savedWords]);

  const currentChapter =
    chapters.find((chapter) => chapter.chapterNum === currentChapterNum) || chapters[0];
  const progressPercent = Math.round((currentChapterNum / chapters.length) * 100);

  function handleSaveWord(wordObj) {
    if (savedWords.some((item) => item.word.toLowerCase() === wordObj.word.toLowerCase())) {
      return;
    }
    setSavedWords((current) => [...current, wordObj]);
  }

  return (
    <div className={`reader-page app-container theme-${theme}`}>
      <ControlPanel
        chapters={chapters}
        currentChapterNum={currentChapterNum}
        onChapterChange={(chapterNum) => {
          setCurrentChapterNum(chapterNum);
          setSelectedTerm(null);
          setScrollToTerm(null);
        }}
        readingMode={readingMode}
        setReadingMode={setReadingMode}
        theme={theme}
        setTheme={setTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
        onOpenSavedWords={() => setIsSavedOpen(true)}
      />

      <main className="main-content">
        <header className="top-bar">
          <div className="chapter-title">
            <h2>{currentChapter.title}</h2>
          </div>
          <div className="reading-progress-container">
            <button
              className="compact-action"
              onClick={() => markChapterCompleted(currentChapterNum)}
            >
              Đánh dấu đã đọc
            </button>
            <span>Tiến trình: {progressPercent}%</span>
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </header>
        <div className="reader-workspace">
          <Reader
            paragraphs={currentChapter.paragraphs}
            readingMode={readingMode}
            fontSize={fontSize}
            lineHeight={lineHeight}
            vocabList={currentChapter.vocabulary || []}
            grammarList={currentChapter.grammar || []}
            onSelectTerm={setSelectedTerm}
            scrollToTerm={scrollToTerm}
          />
        </div>
      </main>

      <VocabularyList
        vocabList={currentChapter.vocabulary || []}
        grammarList={currentChapter.grammar || []}
        selectedTerm={selectedTerm}
        onScrollToTerm={setScrollToTerm}
      />

      <SavedWords
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedWords={savedWords}
        onDeleteWord={(word) =>
          setSavedWords((current) =>
            current.filter((item) => item.word.toLowerCase() !== word.toLowerCase()),
          )
        }
        onAddWord={handleSaveWord}
      />
    </div>
  );
}
