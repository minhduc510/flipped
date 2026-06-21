import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Award, Bookmark, Check, Sliders } from "lucide-react";
import ControlPanel from "../components/ControlPanel";
import Reader from "../components/Reader";
import SavedWords from "../components/SavedWords";
import VocabularyList from "../components/VocabularyList";
import DictionaryPopup from "../components/DictionaryPopup";
import chaptersData from "../data/chapters.json";
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStudyPanelOpen, setIsStudyPanelOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [scrollToTerm, setScrollToTerm] = useState(null);

  useEffect(() => {
    localStorage.setItem("flipped_current_chapter", currentChapterNum);
    markChapterOpened(currentChapterNum);
  }, [currentChapterNum]);
  useEffect(
    () => localStorage.setItem("flipped_reading_mode", readingMode),
    [readingMode],
  );
  useEffect(() => {
    localStorage.setItem("flipped_theme", theme);
    window.dispatchEvent(
      new CustomEvent("flipped-theme-change", { detail: theme }),
    );
  }, [theme]);
  useEffect(
    () => localStorage.setItem("flipped_font_size", fontSize),
    [fontSize],
  );
  useEffect(
    () => localStorage.setItem("flipped_line_height", lineHeight),
    [lineHeight],
  );
  useEffect(() => {
    localStorage.setItem("flipped_saved_words", JSON.stringify(savedWords));
  }, [savedWords]);

  const currentChapter =
    chapters.find((chapter) => chapter.chapterNum === currentChapterNum) ||
    chapters[0];
  const progressPercent = Math.round(
    (currentChapterNum / chapters.length) * 100,
  );

  function handleSaveWord(wordObj) {
    if (
      savedWords.some(
        (item) => item.word.toLowerCase() === wordObj.word.toLowerCase(),
      )
    ) {
      return;
    }
    setSavedWords((current) => [...current, wordObj]);
  }

  return (
    <div className={`reader-page app-container theme-${theme}`}>
      <Helmet>
        <title>{`Chương ${currentChapterNum}: ${currentChapter.title} | Flipped Song Ngữ`}</title>
        <meta
          name="description"
          content={`Đọc truyện Flipped song ngữ Anh - Việt. Chương ${currentChapterNum}: ${currentChapter.title}. Học từ vựng, ngữ pháp thực tế cho TOEIC 550.`}
        />
        <meta
          property="og:title"
          content={`Chương ${currentChapterNum}: ${currentChapter.title} | Flipped Song Ngữ`}
        />
        <meta
          property="og:description"
          content={`Đọc truyện Flipped song ngữ Anh - Việt. Chương ${currentChapterNum}: ${currentChapter.title}. Học từ vựng, ngữ pháp thực tế cho TOEIC 550.`}
        />
        <meta
          property="og:image"
          content={`${import.meta.env.VITE_SITE_URL}/cover.jpg`}
        />
        <meta
          property="og:url"
          content={`${import.meta.env.VITE_SITE_URL}/read`}
        />
      </Helmet>

      {/* Static ControlPanel for Desktop */}
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

      {/* ControlPanel Drawer for Mobile */}
      {isSettingsOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className="mobile-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <ControlPanel
              chapters={chapters}
              currentChapterNum={currentChapterNum}
              onChapterChange={(chapterNum) => {
                setCurrentChapterNum(chapterNum);
                setSelectedTerm(null);
                setScrollToTerm(null);
                setIsSettingsOpen(false);
              }}
              readingMode={readingMode}
              setReadingMode={setReadingMode}
              theme={theme}
              setTheme={setTheme}
              fontSize={fontSize}
              setFontSize={setFontSize}
              lineHeight={lineHeight}
              setLineHeight={setLineHeight}
              onOpenSavedWords={() => {
                setIsSavedOpen(true);
                setIsSettingsOpen(false);
              }}
              onClose={() => setIsSettingsOpen(false)}
            />
          </div>
        </div>
      )}

      <main className="main-content">
        <header className="top-bar">
          <div className="chapter-title">
            <h1>
              Chương {currentChapterNum}: {currentChapter.title}
            </h1>
          </div>

          <div className="top-bar-actions">
            {/* Mobile Header Quick Actions */}
            <div className="mobile-header-buttons">
              <button
                className="icon-button"
                onClick={() => setIsSettingsOpen(true)}
                title="Cài đặt đọc"
              >
                <Sliders size={16} />
              </button>
              <button
                className="icon-button"
                onClick={() => setIsStudyPanelOpen(true)}
                title="Góc học tập"
              >
                <Award size={16} />
              </button>
              <button
                className="icon-button"
                onClick={() => setIsSavedOpen(true)}
                title="Sổ tay từ vựng"
              >
                <Bookmark size={16} />
              </button>
              <button
                className="icon-button"
                onClick={() => markChapterCompleted(currentChapterNum)}
                title="Đánh dấu đã đọc"
              >
                <Check size={16} />
              </button>
            </div>

            {/* Desktop progress indicator */}
            <div className="reading-progress-container">
              <button
                className="compact-action"
                onClick={() => markChapterCompleted(currentChapterNum)}
              >
                Đánh dấu đã đọc
              </button>
              <span>Tiến trình: {progressPercent}%</span>
              <div className="progress-track">
                <div
                  className="progress-bar"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Thin scroll/progress indicator under the header */}
        <div
          style={{
            height: "2px",
            width: "100%",
            background: "var(--border-color)",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPercent}%`,
              background: "var(--accent-color)",
              transition: "width 0.3s ease",
            }}
          />
        </div>

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

      {/* Static VocabularyList for Desktop */}
      <VocabularyList
        vocabList={currentChapter.vocabulary || []}
        grammarList={currentChapter.grammar || []}
        selectedTerm={selectedTerm}
        onScrollToTerm={setScrollToTerm}
      />

      {/* VocabularyList Drawer for Mobile */}
      {isStudyPanelOpen && (
        <div
          className="mobile-drawer-overlay right"
          onClick={() => setIsStudyPanelOpen(false)}
        >
          <div
            className="mobile-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <VocabularyList
              vocabList={currentChapter.vocabulary || []}
              grammarList={currentChapter.grammar || []}
              selectedTerm={selectedTerm}
              onScrollToTerm={(term) => {
                setScrollToTerm(term);
                setIsStudyPanelOpen(false);
              }}
              onClose={() => setIsStudyPanelOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Saved Words Modal Drawer (All viewports) */}
      <SavedWords
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedWords={savedWords}
        onDeleteWord={(word) =>
          setSavedWords((current) =>
            current.filter(
              (item) => item.word.toLowerCase() !== word.toLowerCase(),
            ),
          )
        }
        onAddWord={handleSaveWord}
      />

      {/* Dictionary Popup/Bottom Sheet for tapped terms */}
      <DictionaryPopup
        selectedTerm={selectedTerm}
        onClose={() => setSelectedTerm(null)}
        vocabulary={currentChapter.vocabulary || []}
        grammar={currentChapter.grammar || []}
        onSaveWord={handleSaveWord}
        savedWords={savedWords}
      />
    </div>
  );
}
