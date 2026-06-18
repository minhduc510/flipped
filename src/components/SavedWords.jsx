import { useState } from 'react';
import { X, Trash2, BookOpen, Plus } from 'lucide-react';

export default function SavedWords({ isOpen, onClose, savedWords, onDeleteWord, onAddWord }) {
  const [word, setWord] = useState('');
  const [type, setType] = useState('Từ vựng');
  const [ipa, setIpa] = useState('');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!word.trim() || !definition.trim()) {
      alert('Vui lòng điền từ vựng và nghĩa tiếng Việt!');
      return;
    }
    onAddWord({
      word: word.trim(),
      type: type,
      ipa: ipa.trim() ? `/${ipa.trim()}/` : '',
      definition: definition.trim(),
      example: example.trim()
    });
    // Reset form
    setWord('');
    setIpa('');
    setDefinition('');
    setExample('');
    setShowAddForm(false);
  };

  return (
    <div className="saved-drawer-overlay" onClick={onClose}>
      <div className="saved-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="saved-header">
          <span className="saved-title">
            <BookOpen size={20} style={{ color: 'var(--accent-color)' }} />
            Sổ Tay Từ Vựng ({savedWords.length})
          </span>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="saved-body">
          {/* Toggle Button for Add Word Form */}
          <button 
            className="footer-btn" 
            style={{ marginBottom: '1rem', backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={16} />
            {showAddForm ? 'Đóng form nhập liệu' : 'Thêm từ mới vào sổ tay'}
          </button>

          {/* Add Word Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="add-word-form" style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="control-label" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Từ vựng *</label>
                  <input
                    type="text"
                    className="chapter-select"
                    placeholder="Ví dụ: back off"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="control-label" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Loại từ</label>
                  <select
                    className="chapter-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="Từ vựng">Từ vựng</option>
                    <option value="Cụm động từ">Cụm động từ</option>
                    <option value="Thành ngữ">Thành ngữ</option>
                    <option value="Cấu trúc">Cấu trúc</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="control-label" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Phiên âm IPA (không cần gõ / /)</label>
                <input
                  type="text"
                  className="chapter-select"
                  placeholder="Ví dụ: bæk ɒf"
                  value={ipa}
                  onChange={(e) => setIpa(e.target.value)}
                />
              </div>

              <div>
                <label className="control-label" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Nghĩa Tiếng Việt *</label>
                <input
                  type="text"
                  className="chapter-select"
                  placeholder="Ví dụ: lùi lại, ngừng làm phiền"
                  value={definition}
                  onChange={(e) => setDefinition(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="control-label" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Ví dụ minh họa</label>
                <input
                  type="text"
                  className="chapter-select"
                  placeholder="Ví dụ câu trong truyện..."
                  value={example}
                  onChange={(e) => setExample(e.target.value)}
                />
              </div>

              <button type="submit" className="form-submit-btn" style={{
                padding: '0.6rem',
                backgroundColor: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                Lưu vào sổ tay
              </button>
            </form>
          )}

          {savedWords.length === 0 ? (
            <div className="empty-saved">
              <BookOpen size={48} style={{ strokeWidth: 1 }} />
              <p>Sổ tay của bạn đang trống.</p>
              <p style={{ fontSize: '0.8rem', textAlign: 'center', padding: '0 1.5rem' }}>
                Bấm vào nút "Thêm từ mới vào sổ tay" phía trên để ghi chép lại các từ vựng bạn muốn ghi nhớ nhé!
              </p>
            </div>
          ) : (
            savedWords.map((item, idx) => (
              <div key={idx} className="saved-word-item">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{item.word}</strong>
                    <span style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--accent-color)' }}>{item.type}</span>
                  </div>
                  {item.ipa && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>{item.ipa}</div>}
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500', marginBottom: '0.3rem' }}>{item.definition}</div>
                  {item.example && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      <strong>Ví dụ:</strong> "{item.example}"
                    </div>
                  )}
                </div>
                <button className="delete-saved-btn" onClick={() => onDeleteWord(item.word)} title="Xóa từ khỏi sổ tay">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
