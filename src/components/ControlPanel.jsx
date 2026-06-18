import {
  Bookmark,
  BookOpen,
  Columns,
  Layers,
  Palette,
  Type,
} from "lucide-react";

export default function ControlPanel({
  chapters,
  currentChapterNum,
  onChapterChange,
  readingMode,
  setReadingMode,
  theme,
  setTheme,
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  onOpenSavedWords,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-scrollable">
        {/* Chapter Selection */}
        <div className="control-section">
          <label className="control-label">
            <BookOpen
              size={14}
              style={{ marginRight: "4px", verticalAlign: "middle" }}
            />
            Chọn Chương Học
          </label>
          <select
            className="chapter-select"
            value={currentChapterNum}
            onChange={(e) => onChapterChange(Number(e.target.value))}
          >
            {chapters.map((ch) => (
              <option key={ch.chapterNum} value={ch.chapterNum}>
                {ch.title}
              </option>
            ))}
          </select>
        </div>

        {/* Reading Mode Selection */}
        <div className="control-section">
          <label className="control-label">
            <Columns
              size={14}
              style={{ marginRight: "4px", verticalAlign: "middle" }}
            />
            Chế độ Đọc
          </label>
          <div className="mode-toggle-group">
            <button
              className={`mode-btn ${readingMode === "parallel" ? "active" : ""}`}
              onClick={() => setReadingMode("parallel")}
              title="Xem song song hai bản dịch"
            >
              <Columns size={14} />
              Song Song
            </button>
            <button
              className={`mode-btn ${readingMode === "tabbed" ? "active" : ""}`}
              onClick={() => setReadingMode("tabbed")}
              title="Xem riêng biệt từng tab"
            >
              <Layers size={14} />
              Tab Độc Lập
            </button>
          </div>
        </div>

        {/* Customizable Color Themes */}
        <div className="control-section">
          <label className="control-label">
            <Palette
              size={14}
              style={{ marginRight: "4px", verticalAlign: "middle" }}
            />
            Giao Diện Màu
          </label>
          <div className="theme-grid">
            <button
              className={`theme-btn theme-btn-light ${theme === "light" ? "active" : ""}`}
              onClick={() => setTheme("light")}
            >
              Sáng
            </button>
            <button
              className={`theme-btn theme-btn-dark ${theme === "dark" ? "active" : ""}`}
              onClick={() => setTheme("dark")}
            >
              Tối
            </button>
            <button
              className={`theme-btn theme-btn-sepia ${theme === "sepia" ? "active" : ""}`}
              onClick={() => setTheme("sepia")}
            >
              Sepia
            </button>
            <button
              className={`theme-btn theme-btn-forest ${theme === "forest" ? "active" : ""}`}
              onClick={() => setTheme("forest")}
            >
              Rừng Rậm
            </button>
          </div>
        </div>

        {/* Typography Customization */}
        <div className="control-section">
          <label className="control-label">
            <Type
              size={14}
              style={{ marginRight: "4px", verticalAlign: "middle" }}
            />
            Cỡ chữ ({fontSize}px)
          </label>
          <div className="range-control">
            <input
              type="range"
              min="14"
              max="28"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
            <span className="range-val">{fontSize}px</span>
          </div>
        </div>

        <div className="control-section">
          <label className="control-label">
            <Type
              size={14}
              style={{ marginRight: "4px", verticalAlign: "middle" }}
            />
            Khoảng cách dòng ({lineHeight})
          </label>
          <div className="range-control">
            <input
              type="range"
              min="1.4"
              max="2.2"
              step="0.1"
              value={lineHeight}
              onChange={(e) => setLineHeight(Number(e.target.value))}
            />
            <span className="range-val">{lineHeight}</span>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="footer-btn" onClick={onOpenSavedWords}>
          <Bookmark size={16} />
          Sổ tay từ vựng lưu trữ
        </button>
      </div>
    </aside>
  );
}
