import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './MondaiDisplay.module.css';

export default function MondaiDisplay({
  mondais = [],
  mode = 'learning',
  showResults = false,
  userAnswers = {},
  setUserAnswers,
}) {
  const isInstantMode = mode === 'learning' || mode === 'instant';
  const isTestMode = mode === 'test';

  // === Trạng thái Toolbar ===
  const [showToolbar, setShowToolbar] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef(null);

  const synthRef = useRef(null);

  // Speech Synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => synthRef.current?.cancel();
  }, []);

  const handleSelect = (qKey, optKey) => {
    if ((isInstantMode && userAnswers[qKey]) || (isTestMode && showResults)) return;

    setUserAnswers(prev => ({ ...prev, [qKey]: optKey }));
  };

  // ====================== Render Text ======================
  const renderTextWithFurigana = (text) => {
    if (!text || typeof text !== 'string') return text;
    const furiganaPattern = /<([^>]+)>\{([^}]+)\}/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = furiganaPattern.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.substring(lastIndex, match.index));
      parts.push(
        <ruby key={match.index} className={styles.ruby}>
          {match[1]}
          <rt className={styles.furigana}>{match[2]}</rt>
        </ruby>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(text.substring(lastIndex));
    return parts.length > 0 ? parts : text;
  };

  const renderWithStar = (text) => {
    if (!text?.includes('★')) return text;
    const parts = text.split('★');
    return (
      <>
        {parts[0]}
        <span className={styles.starMarker}>★</span>
        {parts.slice(1).join('★')}
      </>
    );
  };

  const renderContent = (content) => {
    if (!content) return null;
    return renderWithStar(typeof content === 'string' 
      ? renderTextWithFurigana(content) 
      : content
    );
  };

  const getReadingOnly = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/<[^>]+>\{([^}]+)\}/g, '$1')
      .replace(/[^\u3040-\u309F\s]/g, '')
      .replace(/\s+/g, '') || text;
  };

  const speakText = useCallback((text) => {
    if (!synthRef.current || !text?.trim()) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.92;
    const voices = synthRef.current.getVoices();
    const jpVoice = voices.find(v => v.lang.includes('ja') || v.name.toLowerCase().includes('japanese'));
    if (jpVoice) utterance.voice = jpVoice;
    synthRef.current.speak(utterance);
  }, []);

  // ====================== Toolbar & Selection ======================
  const handleMouseUp = useCallback((e) => {
    setTimeout(() => {
      const text = window.getSelection()?.toString().trim() || '';
      if (text) {
        const range = window.getSelection().getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setToolbarPosition({
          top: rect.top + window.scrollY - 55,
          left: rect.left + window.scrollX + rect.width / 2 - 80,
        });
        setShowToolbar(true);
      } else {
        setShowToolbar(false);
      }
    }, 10);
  }, []);

  const handleClickOutside = useCallback((e) => {
    if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
      setShowToolbar(false);
    }
  }, []);

  useEffect(() => {
    const wrapper = document.querySelector(`.${styles.wrapper}`);
    wrapper?.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      wrapper?.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleMouseUp, handleClickOutside]);

  // ====================== Render Question ======================
  const renderQuestion = (q, qKey, id) => {
    const selected = userAnswers[qKey];
    const correct = q.answer;
    const isRevealed = isInstantMode ? !!selected : showResults;
    const isCorrect = selected === correct;

    return (
      <div className={styles.questionContainer} key={qKey}>
        <div className={styles.questionText}>
          <span 
            className={styles.qNumber} 
            onClick={() => speakText(getReadingOnly(q.question))} 
            style={{ cursor: 'pointer' }}
          >
            Q.{id + 1}
          </span>
          {renderContent(q.question)}
        </div>

        <div className={styles.optionsGrid}>
          {Object.entries(q.options || {}).map(([optKey, optText]) => {
            const isThisSelected = selected === optKey;
            const isThisCorrect = optKey === correct;

            let optionCls = styles.optionItem;
            if (isRevealed) {
              if (isThisCorrect) optionCls += ` ${styles.correct}`;
              else if (isThisSelected) optionCls += ` ${styles.wrong}`;
            } else if (isThisSelected) {
              optionCls += ` ${styles.selected}`;
            }

            return (
              <div key={optKey} className={optionCls}   onClick={() => speakText(getReadingOnly(optText))} >
                <div 
                  className={styles.customRadio} 
                  onClick={() => handleSelect(qKey, optKey)}
                >
                  {isThisSelected && <div className={styles.radioDot} />}
                </div>
                <span 
                  className={styles.optValue} 
                  onClick={() => speakText(getReadingOnly(optText))} 
                  style={{ cursor: 'pointer' }}
                >
                  {renderContent(optText)}
                </span>
              </div>
            );
          })}
        </div>

        {isRevealed && (
          <div className={`${styles.feedbackBox} ${isCorrect ? styles.bgCorrect : styles.bgWrong}`}>
            <div className={styles.statusRow}>
              {isCorrect ? 'Chính xác!' : 'Sai rồi!'}
            </div>
            <div className={styles.answerRow}>
              Đáp án đúng: <strong>{correct} - {renderContent(q.options?.[correct])}</strong>
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
      {/* Floating Toolbar - Giữ lại chức năng đọc khi chọn text */}
      {showToolbar && (
        <div 
          ref={toolbarRef} 
          className={styles.floatingToolbar} 
          style={{ 
            position: 'absolute', 
            top: `${toolbarPosition.top}px`, 
            left: `${toolbarPosition.left}px`, 
            zIndex: 1000 
          }}
        >
          <button 
            className={styles.speakButton} 
            onClick={() => speakText(selectedText)} 
            title="Đọc"
          >
            🔊 Đọc
          </button>
        </div>
      )}

      {/* Render Mondais */}
      {mondais.map((mondai, mIdx) => (
        <div key={mIdx} className={styles.mondaiSection}>
          <h3 className={styles.mondaiTitle}>
            Mondai {mIdx + 1}: {renderContent(mondai.mondai_title)}
          </h3>

          <div className={styles.mondaiBody}>
            {String(mondai.type) === '6' ? (
              mondai.passages?.map((p, pIdx) => (
                <div key={pIdx} className={styles.passageWrapper}>
                  <div className={styles.passageText}>{renderContent(p.passage)}</div>
                  {p.question_list?.map((q, qIdx) => 
                    renderQuestion(q, `${mIdx}-${pIdx}-${qIdx}`, qIdx)
                  )}
                </div>
              ))
            ) : (
              <>
                {mondai.passage && (
                  <div className={styles.mainPassage}>
                    {renderContent(mondai.passage)}
                  </div>
                )}
                {mondai.ques_list?.map((q, qIdx) => 
                  renderQuestion(q, `${mIdx}-${qIdx}`, qIdx)
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}