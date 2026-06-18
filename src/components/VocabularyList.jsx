import React, { useState, useEffect } from 'react';
import { Award, ArrowRight } from 'lucide-react';

export default function VocabularyList({ vocabList = [], grammarList = [], selectedTerm = null, onScrollToTerm }) {
  const [activeTab, setActiveTab] = useState('vocab'); // 'vocab' or 'grammar'

  // --- EFFECT: when user clicks a word in the READER → scroll this panel to that card ---
  useEffect(() => {
    if (selectedTerm) {
      // 1. Switch to the appropriate tab
      setActiveTab(selectedTerm.type === 'grammar' ? 'grammar' : 'vocab');
      
      // 2. Compute the element ID
      const cleanText = selectedTerm.text
        .replace(/\[.*?\]/g, "")
        .replace(/\+.*$/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');
        
      const elementId = `${selectedTerm.type === 'grammar' ? 'grammar' : 'vocab'}-${cleanText}`;
      
      // 3. Delay slightly to ensure tab renders the cards, then scroll and flash
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('flash-card');
          setTimeout(() => {
            element.classList.remove('flash-card');
          }, 1500);
        }
      }, 80);
    }
  }, [selectedTerm]);

  // --- Handler: user clicks a vocab card → scroll the reader to that word ---
  const handleVocabClick = (item) => {
    if (onScrollToTerm) {
      onScrollToTerm({ text: item.word, type: 'vocab', ts: Date.now() });
    }
  };

  const handleGrammarClick = (item) => {
    if (onScrollToTerm) {
      const cleanPattern = item.structure
        .replace(/\[.*?\]/g, "")
        .replace(/\+.*$/g, "")
        .trim();
      onScrollToTerm({ text: cleanPattern, type: 'grammar', ts: Date.now() });
    }
  };

  return (
    <aside className="study-panel">
      <div className="study-header">
        <span className="study-title">
          <Award size={18} style={{ color: 'var(--accent-color)' }} />
          Góc Học Tập
        </span>
        <span style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '2px' }}>
          Click từ để tìm trong bài đọc
        </span>
      </div>

      <nav className="tab-nav">
        <button
          className={`tab-link ${activeTab === 'vocab' ? 'active' : ''}`}
          onClick={() => setActiveTab('vocab')}
          style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', padding: '0.6rem 0' }}
        >
          Từ vựng ({vocabList.length})
        </button>
        <button
          className={`tab-link ${activeTab === 'grammar' ? 'active' : ''}`}
          onClick={() => setActiveTab('grammar')}
          style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', padding: '0.6rem 0' }}
        >
          Ngữ pháp ({grammarList.length})
        </button>
      </nav>

      <div className="study-body">
        {activeTab === 'vocab' && (
          <div>
            {vocabList.length === 0 ? (
              <div className="no-data">Không có từ vựng chọn lọc cho chương này.</div>
            ) : (
              vocabList.map((item, idx) => {
                const cleanText = item.word.toLowerCase().replace(/\s+/g, '-');
                return (
                  <div 
                    key={idx} 
                    id={`vocab-${cleanText}`} 
                    className="vocab-card vocab-card-clickable"
                    onClick={() => handleVocabClick(item)}
                    title="Click để cuộn tới từ này trong bài đọc"
                  >
                    <div className="vocab-card-header">
                      <span className="vocab-word">{item.word}</span>
                      <span className="vocab-type">{item.type}</span>
                      <ArrowRight size={13} className="vocab-scroll-icon" />
                    </div>
                    <div className="vocab-ipa">{item.ipa}</div>
                    {item.definition && item.definition !== item.vi && (
                      <div className="vocab-definition">{item.definition}</div>
                    )}
                    {item.vi && (
                      <div className="vocab-vi">🇻🇳 {item.vi}</div>
                    )}
                    {item.context && (
                      <div className="vocab-context">
                        <strong>Trong chương:</strong> "{item.context}"
                      </div>
                    )}
                    {item.contextVi && (
                      <div className="vocab-context">
                        <strong>Nghĩa câu:</strong> "{item.contextVi}"
                      </div>
                    )}
                    {item.example && item.example !== item.context && (
                      <div className="vocab-context">
                        <strong>Ví dụ khác:</strong> "{item.example}"
                        {item.exampleVi && <> — {item.exampleVi}</>}
                      </div>
                    )}
                    {item.explanation && (
                      <div className="vocab-explanation">
                        <strong>Giải thích:</strong> {item.explanation}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'grammar' && (
          <div>
            {grammarList.length === 0 ? (
              <div className="no-data">Không có điểm ngữ pháp chọn lọc cho chương này.</div>
            ) : (
              grammarList.map((item, idx) => {
                const cleanText = item.structure
                  .replace(/\[.*?\]/g, "")
                  .replace(/\+.*$/g, "")
                  .trim()
                  .toLowerCase()
                  .replace(/\s+/g, '-');
                return (
                  <div 
                    key={idx} 
                    id={`grammar-${cleanText}`} 
                    className="grammar-card grammar-card-clickable"
                    onClick={() => handleGrammarClick(item)}
                    title="Click để cuộn tới cấu trúc này trong bài đọc"
                  >
                    <div className="grammar-structure">
                      {item.structure}
                      <ArrowRight size={13} className="vocab-scroll-icon" style={{ marginLeft: '6px' }} />
                    </div>
                    <div className="grammar-meaning">{item.meaning}</div>
                    {item.context && (
                      <div className="grammar-context">
                        <strong>Ví dụ trong chương:</strong> "{item.context}"
                      </div>
                    )}
                    {item.contextVi && (
                      <div className="grammar-context">
                        <strong>Nghĩa câu:</strong> "{item.contextVi}"
                      </div>
                    )}
                    {item.explanation && (
                      <div className="grammar-explanation">
                        <strong>Giải thích:</strong> {item.explanation}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
