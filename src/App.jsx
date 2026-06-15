import React, { useState, useEffect } from "react";
import chaptersData from "./data/chapters.json";
import ControlPanel from "./components/ControlPanel";
import Reader from "./components/Reader";
import VocabularyList from "./components/VocabularyList";
import SavedWords from "./components/SavedWords";

export default function App() {
  // --- Persistent States from LocalStorage ---
  const [currentChapterNum, setCurrentChapterNum] = useState(() => {
    return Number(localStorage.getItem("flipped_current_chapter")) || 1;
  });

  const [readingMode, setReadingMode] = useState(() => {
    return localStorage.getItem("flipped_reading_mode") || "parallel";
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("flipped_theme") || "sepia";
  });

  const [fontSize, setFontSize] = useState(() => {
    return Number(localStorage.getItem("flipped_font_size")) || 18;
  });

  const [lineHeight, setLineHeight] = useState(() => {
    return Number(localStorage.getItem("flipped_line_height")) || 1.7;
  });

  const [savedWords, setSavedWords] = useState(() => {
    const saved = localStorage.getItem("flipped_saved_words");
    return saved ? JSON.parse(saved) : [];
  });

  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  // scrollToTerm: when user clicks a vocab/grammar card, scroll the reader to that word
  const [scrollToTerm, setScrollToTerm] = useState(null);

  // --- Sync State to LocalStorage ---
  useEffect(() => {
    localStorage.setItem("flipped_current_chapter", currentChapterNum);
    setSelectedTerm(null);
    setScrollToTerm(null); // Reset on chapter change
  }, [currentChapterNum]);

  useEffect(() => {
    localStorage.setItem("flipped_reading_mode", readingMode);
  }, [readingMode]);

  useEffect(() => {
    localStorage.setItem("flipped_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("flipped_font_size", fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("flipped_line_height", lineHeight);
  }, [lineHeight]);

  useEffect(() => {
    localStorage.setItem("flipped_saved_words", JSON.stringify(savedWords));
  }, [savedWords]);

  // --- Handlers ---
  const handleSaveWord = (wordObj) => {
    const exists = savedWords.some(
      (w) => w.word.toLowerCase() === wordObj.word.toLowerCase(),
    );
    if (!exists) {
      const newSaved = [
        ...savedWords,
        {
          word: wordObj.word,
          ipa: wordObj.ipa,
          type: wordObj.type,
          definition: wordObj.definition,
          example: wordObj.example,
        },
      ];
      setSavedWords(newSaved);
    }
  };

  const handleDeleteWord = (wordText) => {
    const updated = savedWords.filter(
      (w) => w.word.toLowerCase() !== wordText.toLowerCase(),
    );
    setSavedWords(updated);
  };

  // Find active content
  const chapters = chaptersData.chapters;
  const currentChapter =
    chapters.find((c) => c.chapterNum === currentChapterNum) || chapters[0];
  const currentVocab = currentChapter.vocabulary || [];
  const currentGrammar = currentChapter.grammar || [];

  // Calculate Progress Percent
  const progressPercent = Math.round(
    (currentChapterNum / chapters.length) * 100,
  );

  return (
    <div className={`app-container theme-${theme}`}>
      {/* 1. Sidebar Control Panel */}
      <ControlPanel
        chapters={chapters}
        currentChapterNum={currentChapterNum}
        onChapterChange={setCurrentChapterNum}
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

      {/* 2. Main Work Area (Top Bar + Reading Panel) */}
      <main className="main-content">
        <header className="top-bar">
          <div className="chapter-title">
            <h2>{currentChapter.title}</h2>
          </div>

          <div className="reading-progress-container">
            <span>Tiến trình: {progressPercent}%</span>
            <div
              className="progress-track"
              title={`Bạn đang học chương ${currentChapterNum}/${chapters.length}`}
            >
              <div
                className="progress-bar"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </header>

        <div className="reader-workspace">
          {/* Aligned bilingual reading board */}
          <Reader
            paragraphs={currentChapter.paragraphs}
            readingMode={readingMode}
            fontSize={fontSize}
            lineHeight={lineHeight}
            vocabList={currentVocab}
            grammarList={currentGrammar}
            onSelectTerm={setSelectedTerm}
            scrollToTerm={scrollToTerm}
          />
        </div>
      </main>

      {/* 3. Study Helper (Curated Vocab / Grammar Panel) */}
      <VocabularyList
        vocabList={currentVocab}
        grammarList={currentGrammar}
        selectedTerm={selectedTerm}
        onScrollToTerm={setScrollToTerm}
      />

      {/* 4. Overlay Saved Vocabulary Drawer */}
      <SavedWords
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedWords={savedWords}
        onDeleteWord={handleDeleteWord}
        onAddWord={handleSaveWord}
      />
    </div>
  );
}
