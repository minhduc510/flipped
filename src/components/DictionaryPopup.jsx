import { X, Bookmark, BookmarkCheck } from 'lucide-react';
import { useMemo } from 'react';

export default function DictionaryPopup({
  selectedTerm,
  onClose,
  vocabulary = [],
  grammar = [],
  onSaveWord,
  savedWords = []
}) {
  const details = useMemo(() => {
    if (!selectedTerm) return null;
    if (selectedTerm.type === 'vocab') {
      return vocabulary.find(
        (v) => v.word.toLowerCase() === selectedTerm.text.toLowerCase()
      );
    } else {
      return grammar.find((g) => {
        const cleanPattern = g.structure
          .replace(/\[.*?\]/g, "")
          .replace(/\+.*$/g, "")
          .trim()
          .toLowerCase();
        return cleanPattern === selectedTerm.text.toLowerCase();
      });
    }
  }, [selectedTerm, vocabulary, grammar]);

  if (!selectedTerm || !details) return null;

  const isVocab = selectedTerm.type === 'vocab';
  const termName = isVocab ? details.word : details.structure;
  const termType = isVocab ? details.type : 'Ngữ pháp';
  const termIpa = isVocab ? details.ipa : '';
  
  const isAlreadySaved = savedWords.some(
    (item) => item.word.toLowerCase() === termName.toLowerCase()
  );

  const handleSave = () => {
    if (isAlreadySaved) return;
    const saveDefinition = isVocab ? (details.vi || details.definition) : details.meaning;
    onSaveWord({
      word: termName,
      type: termType,
      ipa: termIpa,
      definition: saveDefinition,
      example: details.context || ''
    });
  };

  return (
    <div className="dict-popup-overlay" onClick={onClose}>
      <div className="dict-popup" onClick={(e) => e.stopPropagation()}>
        <div className="dict-header">
          <div className="dict-word-info">
            <span className="dict-word">{termName}</span>
            <div className="dict-meta">
              <span className="dict-type">{termType}</span>
              {termIpa && <span className="dict-ipa">{termIpa}</span>}
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <div className="dict-body" style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingRight: '4px' }}>
          {isVocab && (
            <>
              {details.definition && details.definition !== details.vi && (
                <div className="dict-definition" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>
                  {details.definition}
                </div>
              )}
              {details.vi && (
                <div className="vocab-vi" style={{ fontSize: '0.95rem', color: 'var(--accent-color)', fontWeight: '600', margin: 0 }}>
                  🇻🇳 {details.vi}
                </div>
              )}
            </>
          )}

          {!isVocab && (
            <div className="dict-definition" style={{ fontSize: '0.95rem', color: 'var(--accent-color)', fontWeight: '600', margin: 0 }}>
              {details.meaning}
            </div>
          )}

          {details.context && (
            <div className="dict-example" style={{ margin: 0 }}>
              <strong>Ngữ cảnh trong chương:</strong>
              <div style={{ marginTop: '0.2rem', fontStyle: 'italic' }}>"{details.context}"</div>
              {details.contextVi && (
                <div style={{ marginTop: '0.2rem', fontStyle: 'italic', opacity: 0.85 }}>
                  — {details.contextVi}
                </div>
              )}
            </div>
          )}

          {isVocab && details.example && details.example !== details.context && (
            <div className="dict-example" style={{ margin: 0 }}>
              <strong>Ví dụ khác:</strong>
              <div style={{ marginTop: '0.2rem', fontStyle: 'italic' }}>"{details.example}"</div>
              {details.exampleVi && (
                <div style={{ marginTop: '0.2rem', fontStyle: 'italic', opacity: 0.85 }}>
                  — {details.exampleVi}
                </div>
              )}
            </div>
          )}

          {details.explanation && (
            <div className="dict-explanation" style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-primary)',
              padding: '0.6rem 0.75rem',
              borderRadius: '8px',
              borderLeft: '3px solid var(--border-color)',
              lineHeight: '1.45'
            }}>
              <strong>Giải thích:</strong> {details.explanation}
            </div>
          )}
        </div>

        <button
          className={`dict-save-btn ${isAlreadySaved ? 'saved' : ''}`}
          onClick={handleSave}
          disabled={isAlreadySaved}
          style={{ marginTop: '0.5rem' }}
        >
          {isAlreadySaved ? (
            <>
              <BookmarkCheck size={14} /> Đã lưu vào sổ tay
            </>
          ) : (
            <>
              <Bookmark size={14} /> Lưu vào sổ tay
            </>
          )}
        </button>
      </div>
    </div>
  );
}
