import { useState } from 'react';
import MondaiDisplay from './MondaiDisplay';
import styles from './TestMode.module.css';

export default function TestMode({ exerciseData, onCancel }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    let correct = 0;
    const totalQuestions = exerciseData.mondais.reduce((sum, m) => sum + (m.ques_list?.length || 0), 0);

    exerciseData.mondais.forEach((mondai, mIdx) => {
      mondai.ques_list?.forEach((q, qIdx) => {
        const key = `${mIdx}-${qIdx}`;
        if (userAnswers[key] === q.answer) correct++;
      });
    });

    setScore(Math.round((correct / totalQuestions) * 100));
    setSubmitted(true);
  };

  return (
    <>


      <MondaiDisplay
        mondais={exerciseData.mondais || []}
        mode="test"
        showResults={submitted}
        userAnswers={userAnswers}
        setUserAnswers={setUserAnswers}
      />

      {!submitted ? (
        <button className={styles.submitBtnBig} onClick={handleSubmit}>
          📤 NỘP BÀI & XEM KẾT QUẢ
        </button>
      ) : (
        <div className={styles.resultPanel}>
          <h2>Kết quả: <span className={score >= 80 ? styles.green : styles.red}>{score}%</span></h2>
          <button onClick={() => { setSubmitted(false); setUserAnswers({}); }} className={styles.btnPrimary}>
            Làm lại bài
          </button>
          <button onClick={onCancel} className={styles.btnSecondary}>Thoát</button>
        </div>
      )}
    </>
  );
}