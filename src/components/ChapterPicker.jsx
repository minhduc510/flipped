export default function ChapterPicker({ chapters, value, onChange, label = "Chương" }) {
  return (
    <label className="inline-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(Number(event.target.value))}>
        {chapters.map((chapter) => (
          <option key={chapter.chapterNum} value={chapter.chapterNum}>
            {chapter.title}
          </option>
        ))}
      </select>
    </label>
  );
}
