import React from 'react';
import styles from './MondaiDisplay.module.css';

export default function MondaiDisplay({
  mondais = [],
  mode = 'learning', // Hoặc 'instant' tùy ông đặt tên bên ngoài
  showResults = false, // Chỉ dùng cho Test mode
  userAnswers = {},
  setUserAnswers,
}) {
  const isInstantMode = mode === 'learning' || mode === 'instant';
  const isTestMode = mode === 'test';

  const handleSelect = (qKey, optKey) => {
    // Chặn nếu đã chọn (Instant) hoặc đã nộp bài (Test)
    if (isInstantMode && userAnswers[qKey]) return; 
    if (isTestMode && showResults) return;

    // Cập nhật State cho cha
    setUserAnswers(prev => ({
      ...prev,
      [qKey]: optKey
    }));
  };

  // Hàm xử lý text với furigana - dạng <kanji>{kana}
  const renderTextWithFurigana = (text) => {
    if (!text) return null;
    if (typeof text !== 'string') return text;

    // Regex để tìm pattern: <kanji>{kana}
    const furiganaPattern = /<([^>]+)>\{([^}]+)\}/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = furiganaPattern.exec(text)) !== null) {
      // Thêm text trước match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Thêm component ruby (furigana)
      const kanji = match[1]; // phần trong < > - đây là kanji
      const kana = match[2]; // phần trong { } - đây là furigana
      
      parts.push(
        <ruby key={match.index} className={styles.ruby}>
          {kanji}
          <rt className={styles.furigana}>{kana}</rt>
        </ruby>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Thêm phần text còn lại
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  // Hàm xử lý dấu ★
  const renderWithStar = (text) => {
    if (!text) return null;
    if (typeof text !== 'string') return text;
    
    // Xử lý dấu ★
    if (text.includes('★')) {
      const parts = text.split('★');
      return (
        <>
          {parts[0]}
          <span className={styles.starMarker}>★</span>
          {parts.slice(1).join('★')}
        </>
      );
    }
    
    return text;
  };

  // Hàm render tổng hợp cho tất cả nội dung
  const renderContent = (content) => {
    if (!content) return null;
    // Xử lý furigana trước, sau đó mới xử lý dấu ★
    const withFurigana = renderTextWithFurigana(content);
    if (typeof withFurigana === 'string') {
      return renderWithStar(withFurigana);
    }
    return withFurigana;
  };

  const renderQuestion = (q, qKey, id) => {
    const selected = userAnswers[qKey];
    const correct = q.answer;
    
    // LOGIC THEN CHỐT: Nếu là Instant, cứ có 'selected' là hiện. Nếu là Test, phải đợi 'showResults'.
    const isRevealed = isInstantMode ? !!selected : showResults;
    const isCorrect = selected === correct;

    return (
      <div className={styles.questionContainer} key={qKey}>
        <div className={styles.questionText}>
          <span className={styles.qNumber}>Q.{id+1}</span>
          {renderContent(q.question)}
        </div>

        <div className={styles.optionsGrid}>
          {Object.entries(q.options || {}).map(([optKey, optText]) => {
            const isThisSelected = selected === optKey;
            const isThisCorrect = optKey === correct;

            // Tính toán Class CSS dựa trên trạng thái Revealed
            let optionCls = styles.optionItem;
            if (isRevealed) {
              if (isThisCorrect) optionCls += ` ${styles.correct}`;
              else if (isThisSelected) optionCls += ` ${styles.wrong}`;
            } else if (isThisSelected) {
              optionCls += ` ${styles.selected}`;
            }

            return (
              <div
                key={optKey}
                className={optionCls}
                onClick={() => handleSelect(qKey, optKey)}
              >
                <div className={styles.customRadio}>
                  {isThisSelected && <div className={styles.radioDot} />}
                </div>
                {/* <span className={styles.optKey}>{optKey}.</span> */}
                <span className={styles.optValue}>{renderContent(optText)}</span>
              </div>
            );
          })}
        </div>

        {/* PHẦN HIỂN THỊ ĐÁP ÁN (Chỉ hiện khi isRevealed = true) */}
        {isRevealed && (
          <div className={`${styles.feedbackBox} ${isCorrect ? styles.bgCorrect : styles.bgWrong}`}>
            <div className={styles.statusRow}>
              {isCorrect ? 'Chính xác!' : 'Sai rồi!'}
            </div>
            <div className={styles.answerRow}>
              Đáp án đúng: <strong>{correct} - {renderContent(q.options[correct])}</strong>
            </div>
            {q.explanation && (
              <div className={styles.explanation}>
                <strong>Giải thích:</strong> {renderContent(q.explanation)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      {mondais.map((mondai, mIdx) => (
        <div key={mIdx} className={styles.mondaiSection}>
          <h3 className={styles.mondaiTitle}>Mondai {mIdx+1}: {renderContent(mondai.mondai_title)}</h3>
          
          {/* Logic phân tách 8 trường hợp nhưng dùng chung renderQuestion cho gọn */}
          <div className={styles.mondaiBody}>
            {String(mondai.type) === '6' ? (
              mondai.passages?.map((p, pIdx) => (
                <div key={pIdx} className={styles.passageWrapper}>
                  <div className={styles.passageText}>{renderContent(p.passage)}</div>
                  {p.question_list?.map((q, qIdx) => renderQuestion(q, `${mIdx}-${pIdx}-${qIdx}`, qIdx))}
                </div>
              ))
            ) : (
              <>
                {mondai.passage && <div className={styles.mainPassage}>{renderContent(mondai.passage)}</div>}
                {mondai.ques_list?.map((q, qIdx) => renderQuestion(q, `${mIdx}-${qIdx}`, qIdx))}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}