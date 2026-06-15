import React, { useRef, useState, useMemo, useEffect } from 'react';

export default function Reader({
  paragraphs,
  readingMode,
  fontSize,
  lineHeight,
  vocabList = [],
  grammarList = [],
  onSelectTerm,
  scrollToTerm,  // { text, type, ts } – sent from VocabularyList click
}) {
  const [activeIdx, setActiveIdx] = useState(null);
  const [activeTab, setActiveTab] = useState('en');
  
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const isScrollingLeft = useRef(false);
  const isScrollingRight = useRef(false);

  // --- EFFECT: vocab card clicked → scroll reader to that highlighted word ---
  useEffect(() => {
    if (!scrollToTerm || !scrollToTerm.text) return;
    const word = scrollToTerm.text.toLowerCase();
    // Find the first highlighted span whose data-term matches
    const spans = document.querySelectorAll('.highlighted-term[data-term]');
    let target = null;
    for (const span of spans) {
      if (span.dataset.term === word) {
        target = span;
        break;
      }
    }
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Flash animation on the span
      target.classList.add('flash-reader-word');
      setTimeout(() => target.classList.remove('flash-reader-word'), 1800);
    }
  }, [scrollToTerm]);

  // Sync scrolling between English and Vietnamese columns (retained for layout backward compatibility)
  const handleLeftScroll = () => {
    if (readingMode !== 'parallel' || isScrollingRight.current) return;
    isScrollingLeft.current = true;
    if (leftColRef.current && rightColRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = leftColRef.current;
      const scrollPercent = scrollTop / (scrollHeight - clientHeight);
      rightColRef.current.scrollTop = scrollPercent * (rightColRef.current.scrollHeight - rightColRef.current.clientHeight);
    }
    setTimeout(() => {
      isScrollingLeft.current = false;
    }, 50);
  };

  const handleRightScroll = () => {
    if (readingMode !== 'parallel' || isScrollingLeft.current) return;
    isScrollingRight.current = true;
    if (leftColRef.current && rightColRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = rightColRef.current;
      const scrollPercent = scrollTop / (scrollHeight - clientHeight);
      leftColRef.current.scrollTop = scrollPercent * (leftColRef.current.scrollHeight - leftColRef.current.clientHeight);
    }
    setTimeout(() => {
      isScrollingRight.current = false;
    }, 50);
  };

  // --- MEMOIZED SEARCH TERMS FOR HIGHLIGHTING ---
  const sortedTerms = useMemo(() => {
    const terms = [];
    
    // 1. Map vocabulary words
    vocabList.forEach(item => {
      if (item.word && item.word.trim().length > 1) {
        terms.push({ text: item.word.trim(), type: 'vocab', obj: item });
      }
    });
    
    // 2. Map grammar structures (strip brackets/extra symbols)
    grammarList.forEach(item => {
      let pattern = item.structure;
      // Clean up brackets like [someone] or + symbols
      pattern = pattern.replace(/\[.*?\]/g, "").replace(/\+.*$/g, "").trim();
      if (pattern && pattern.length > 2) {
        terms.push({ text: pattern, type: 'grammar', obj: item });
      }
    });
    
    // De-duplicate: longer terms override shorter terms to prevent overlapping matches
    const uniqueTermsMap = new Map();
    terms.forEach(t => {
      const key = t.text.toLowerCase();
      if (!uniqueTermsMap.has(key) || uniqueTermsMap.get(key).text.length < t.text.length) {
        uniqueTermsMap.set(key, t);
      }
    });
    
    return Array.from(uniqueTermsMap.values())
      .sort((a, b) => b.text.length - a.text.length);
  }, [vocabList, grammarList]);

  // --- MEMOIZED REGEX ---
  const termsRegex = useMemo(() => {
    if (sortedTerms.length === 0) return null;
    
    // Escape special regex characters in the search terms
    const escapedTerms = sortedTerms.map(t => 
      t.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    );
    
    // Wrap alpha-only phrases with word boundaries (\b) to avoid mid-word highlights
    const regexPattern = escapedTerms.map(t => {
      if (/^[a-zA-Z0-9\s]+$/.test(t)) {
        return `\\b${t}\\b`;
      }
      return t;
    }).join('|');
    
    try {
      return new RegExp(`(${regexPattern})`, 'gi');
    } catch (e) {
      console.error("Failed to build regex for highlighted terms:", e);
      return null;
    }
  }, [sortedTerms]);

  // --- HIGHLIGHT RENDERER ---
  const renderHighlightedText = (text) => {
    if (!text || !termsRegex || sortedTerms.length === 0) return text;
    
    try {
      const parts = text.split(termsRegex);
      return parts.map((part, index) => {
        // Every odd element is a matched pattern
        if (index % 2 === 1) {
          const matchedTerm = part.toLowerCase();
          const termObj = sortedTerms.find(t => t.text.toLowerCase() === matchedTerm);
          
          if (termObj) {
            const className = termObj.type === 'vocab' ? 'highlight-word-vocab' : 'highlight-word-grammar';
            return (
              <span 
                key={index} 
                className={`highlighted-term ${className}`}
                data-term={termObj.text.toLowerCase()}
                title={termObj.type === 'vocab' ? `Từ vựng: ${termObj.obj.definition}` : `Cấu trúc: ${termObj.obj.meaning}`}
                onClick={() => onSelectTerm && onSelectTerm({ text: termObj.text, type: termObj.type })}
              >
                {part}
              </span>
            );
          }
        }
        return part;
      });
    } catch (e) {
      return text;
    }
  };

  return (
    <div className="reader-panel">
      {/* Parallel Reading View */}
      {readingMode === 'parallel' && (
        <div 
          className="parallel-layout"
          style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
        >
          {paragraphs.map((p, idx) => (
            <div
              key={idx}
              className={`paragraph-row ${activeIdx === idx ? 'highlighted' : ''}`}
              onMouseEnter={() => setActiveIdx(idx)}
              onMouseLeave={() => setActiveIdx(null)}
            >
              <div className="paragraph-cell english-cell">
                {renderHighlightedText(p.en)}
              </div>
              <div className="paragraph-cell vietnamese-cell">
                {p.vi}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabbed Reading View */}
      {readingMode === 'tabbed' && (
        <div className="tabbed-layout">
          <nav className="tab-nav">
            <button
              className={`tab-link ${activeTab === 'en' ? 'active' : ''}`}
              onClick={() => setActiveTab('en')}
            >
              Bản Gốc (English)
            </button>
            <button
              className={`tab-link ${activeTab === 'vi' ? 'active' : ''}`}
              onClick={() => setActiveTab('vi')}
            >
              Bản Dịch (Tiếng Việt)
            </button>
          </nav>
          
          <div className="tab-pane" style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}>
            {activeTab === 'en' ? (
              paragraphs.map((p, idx) => (
                <div key={idx} className="paragraph-block">
                  {renderHighlightedText(p.en)}
                </div>
              ))
            ) : (
              paragraphs.map((p, idx) => (
                <div key={idx} className="paragraph-block">
                  {p.vi}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
