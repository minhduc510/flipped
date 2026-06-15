import React, { useState, useEffect } from 'react';
import { Award } from 'lucide-react';

export default function VocabularyList({ vocabList = [], grammarList = [], selectedTerm = null }) {
  const [activeTab, setActiveTab] = useState('vocab'); // 'vocab' or 'grammar'

  // --- EFFECT: SCROLL TO SELECTED TERM ---
  useEffect(() => {
    if (selectedTerm) {
      // 1. Switch to the appropriate tab
      setActiveTab(selectedTerm.type);
      
      // 2. Compute the element ID
      const cleanText = selectedTerm.text
        .replace(/\[.*?\]/g, "")
        .replace(/\+.*$/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');
        
      const elementId = `${selectedTerm.type === 'vocab' ? 'vocab' : 'grammar'}-${cleanText}`;
      
      // 3. Delay slightly to ensure tab renders the cards, then scroll and flash
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Apply highlight flash animation
          element.classList.add('flash-card');
          setTimeout(() => {
            element.classList.remove('flash-card');
          }, 1500);
        }
      }, 80);
    }
  }, [selectedTerm]);

  return (
    <aside className="study-panel">
      <div className="study-header">
        <span className="study-title">
          <Award size={18} style={{ color: 'var(--accent-color)' }} />
          Góc Học Tập
        </span>
      </div>

      <nav className="tab-nav">
        <button
          className={`tab-link ${activeTab === 'vocab' ? 'active' : ''}`}
          onClick={() => setActiveTab('vocab')}
          style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', padding: '0.6rem 0' }}
        >
          Từ vựng hay ({vocabList.length})
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
              <div className="no-data">Không có từ vựng chọn lọc cho chương này. Hãy đúp click lên các từ trong văn bản để tra từ trực tiếp!</div>
            ) : (
              vocabList.map((item, idx) => {
                const cleanText = item.word.toLowerCase().replace(/\s+/g, '-');
                return (
                  <div 
                    key={idx} 
                    id={`vocab-${cleanText}`} 
                    className="vocab-card"
                  >
                    <div className="vocab-card-header">
                      <span className="vocab-word">{item.word}</span>
                      <span className="vocab-type">{item.type}</span>
                    </div>
                    <div className="vocab-ipa">{item.ipa}</div>
                    <div className="vocab-definition">{item.definition}</div>
                    {item.context && (
                      <div className="vocab-context">
                        <strong>Ngữ cảnh:</strong> "{item.context}"
                      </div>
                    )}
                    {item.explanation && (
                      <div className="vocab-explanation">
                        <strong>Mẹo giao tiếp:</strong> {item.explanation}
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
              <div className="no-data">Không có điểm ngữ pháp chọn lọc cho chương này. Hãy đọc song ngữ và để ý cách diễn đạt!</div>
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
                    className="grammar-card"
                  >
                    <div className="grammar-structure">{item.structure}</div>
                    <div className="grammar-meaning">{item.meaning}</div>
                    {item.context && (
                      <div className="grammar-context">
                        <strong>Ví dụ:</strong> "{item.context}"
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
