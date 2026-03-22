import { useState, useEffect } from 'react';
import styles from './MondaiSetting.module.css';
import { templates } from './templates';

const questionTypes = [
  { id: 1, label: 'Cách đọc những từ được viết bằng Hán tự' },
  { id: 2, label: 'Những từ được viết bằng Hiragana sẽ được viết sang Hán tự hoặc Katakana như thế nào' },
  { id: 3, label: 'Tùy theo mạch văn, tìm từ phù hợp về mặt ngữ nghĩa, phù hợp ngữ pháp, trợ từ' },
  { id: 4, label: 'Tìm cách diễn đạt/từ gần nghĩa với từ đã cho' },
  { id: 5, label: 'Tạo câu mạch lạc, đúng cú pháp vào chỗ ★' },
  { id: 6, label: 'Phân đoạn câu phù hợp với dòng chảy văn bản' },
  { id: 7, label: 'Đọc hiểu Đúng / Sai' },
  { id: 8, label: 'Đọc hiểu 4 câu hỏi đoạn văn' },
];

const mondai_title = {
  1: "Cách đọc những từ được viết bằng Hán tự：______のことばはどう よみますか。ABCDから いちばんいい ものをひとつえらんでください。",
  2: "Những từ được viết bằng Hiragana sẽ được viết sang Hán tự hoặc Katakana：______のことばはどう かきますか。ABCDから いちばんいい ものをひとつえらんでください。",
  3: "Tùy theo mạch văn, tìm từ phù hợp về mặt ngữ nghĩa, ngữ pháp, trợ từ： ( )に何を入れますか。ABCDから いちばんいいものをひとつえらんでください。",
  4: "Tìm cách diễn đạt / từ gần nghĩa với từ đã cho：______のぶんとだいたいおなじいみのぶんがあります。ABCDから いちばんいいものをひとつえらんでください。",
  5: "Tạo câu mạch lạc, đúng cú pháp vào chỗ ★：★に入るものはどれですか。ABCDからいちばんいいものを一つえらんでください。",
  6: "Phân đoạn câu phù hợp với dòng chảy văn bản：______に何を入れますか。ABCDからいちばんいいものを一つえらんでください。",
  7: "Đọc hiểu Đúng / Sai：文章を読んで、正しいものに○、間違っているものに×をつけてください。",
  8: "Đọc hiểu 4 câu hỏi đoạn văn：文章を読んで、質問に答えてください。答えはABCDからいちばんいいものを一つえらんでください。",
};

function MondaiSetting({ index, initialText = '', initialJson = null, onUpdate, onDelete }) {
  const [jsonText, setJsonText] = useState(initialText);
  const [formattedData, setFormattedData] = useState(initialJson);
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setJsonText(initialText);
    setFormattedData(initialJson);
    if (initialJson) {
      setError('');
    }
  }, [initialText, initialJson]);

  const isFormatted = !!formattedData;

  const getPrompt = () => {
    if (!selectedId) return '';
    const typeId = Number(selectedId);
    const template = templates[typeId];
    if (!template) return '';

    return `
As a professional,
For each word that contains Kanji, rewrite it in the following format: <kanji>{furigana}
Example: <食>{た}べます, <綺麗>{きれい}, <今日>{きょう},...
After that convert to json code only following format: ${template}
`.trim();
  };

  const getMondaiTitle = () => {
    if (!selectedId) return '';
    const typeId = Number(selectedId);
    return mondai_title[typeId] || '';
  };

  const handleCopyPrompt = () => {
    const prompt = getPrompt();
    if (!prompt) {
      alert('Vui lòng chọn loại mondai trước!');
      return;
    }
    navigator.clipboard.writeText(prompt)
      .then(() => alert('Đã copy prompt vào clipboard!'))
      .catch(() => alert('Không thể copy, hãy thử thủ công'));
  };

  const handleCopyMondaiTitle = () => {
    const title = getMondaiTitle();
    if (!title) {
      alert('Vui lòng chọn loại mondai trước!');
      return;
    }
    const fullText = `
Tạo dạng bài ôn tập bài X, N câu
Cung cấp đáp án ở cuối: (đáp án, câu hoàn chỉnh, lý giải nghĩa, cấu trúc ngữ pháp)
(yêu cầu đa dạng, vận dụng cao, dài, đánh đố, tổng hợp ngữ pháp, từ vựng)
Dạng bài: ${title},
    `;
    navigator.clipboard.writeText(fullText)
      .then(() => alert(`Đã copy mondai title: ${title}`))
      .catch(() => alert('Không thể copy, hãy thử thủ công'));
  };

  const handleParseJson = () => {
    setError('');
    if (!jsonText.trim()) {
      setError('Vui lòng dán nội dung JSON vào ô bên dưới');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText.trim());
      setFormattedData(parsed);
      onUpdate(jsonText.trim(), parsed);
      setError('');
    } catch (err) {
      setError('JSON không hợp lệ: ' + err.message);
      setFormattedData(null);
      onUpdate(jsonText.trim(), null);
    }
  };

  const handleResetFormat = () => {
    if (window.confirm('Xóa dữ liệu JSON đã parse và quay về chế độ chỉnh sửa?')) {
      setFormattedData(null);
      onUpdate(jsonText.trim(), null);
      setError('');
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Xác nhận XÓA hoàn toàn Mondai ${index} này?\nHành động này không thể hoàn tác.`)) {
      // Reset state nội bộ trước khi gọi onDelete
      setJsonText('');
      setFormattedData(null);
      setSelectedId('');
      setError('');
      onDelete(); // Gọi hàm xóa từ component cha (thường là xóa khỏi mảng mondais)
    }
  };

  return (
    <div className={styles.containerMondai}>
      <div className={styles.taskbarMondai}>
        <h2>Mondai {index}</h2>

        <div className={styles.status}>
          {isFormatted ? (
            <span className={styles.formatted}>✓ Đã format</span>
          ) : (
            <span className={styles.unformatted}>Chưa format</span>
          )}
        </div>

        <div className={styles.typeSelector}>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className={styles.select}
            disabled={isFormatted}
          >
            <option value="" disabled>Chọn loại mondai</option>
            {questionTypes.map(({ id, label }) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>

          {!isFormatted && selectedId && (
            <div className={`${styles.promptoption}`}>
              <button
                onClick={handleCopyMondaiTitle}
                className={`${styles.btn} ${styles.btnCopy}`}
              >
                Copy Mondai Title
              </button>

              <button
                onClick={handleCopyPrompt}
                className={`${styles.btn} ${styles.btnCopy}`}
              >
                Copy Prompts Create JSON
              </button>
            </div>
          )}
            <div className={`${styles.promptoption}`}>
          {!isFormatted && (
            
            <button
              onClick={handleParseJson}
              className={`${styles.btn} ${styles.btnSuccess}`}
              disabled={!jsonText.trim()}
            >
              Parse JSON
            </button>
          )}

          {isFormatted && (
            <button
              onClick={handleResetFormat}
              className={`${styles.btn} ${styles.btnWarning}`}
            >
              Sửa lại
            </button>
          )}

          {/* Nút Xóa luôn hiển thị */}
          <button
            onClick={handleDelete}
            className={`${styles.btn} ${styles.btnDanger}`}
          >
            Xóa
          </button>
          </div>
        </div>
      </div>

      <div className={styles.containerContent}>
        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            if (!isFormatted) {
              setFormattedData(null);
              onUpdate(e.target.value.trim(), null);
            }
          }}
          placeholder={
            isFormatted
              ? "JSON đã được parse. Nhấn 'Sửa lại' nếu muốn chỉnh sửa."
              : "Dán JSON ở đây (sau khi bạn dùng prompt ở trên với AI khác)...\n\nSau đó nhấn Parse JSON"
          }
          className={styles.textarea}
          rows={14}
          disabled={isFormatted}
        />
      </div>

      {error && (
        <div className={styles.error}>
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {isFormatted && (
        <div className={styles.preview}>
          <pre className={styles.pre}>
            {JSON.stringify(formattedData, null, 2).slice(0, 400)}...
          </pre>
        </div>
      )}
    </div>
  );
}

export default MondaiSetting;