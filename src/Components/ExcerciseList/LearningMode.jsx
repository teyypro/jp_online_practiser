import { useState } from 'react';
import MondaiDisplay from './MondaiDisplay';
import styles from './LearningMode.module.css';

export default function LearningMode({ exerciseData, onCancel }) {
  const [userAnswers, setUserAnswers] = useState({});

  return (
    <>


      <MondaiDisplay
        mondais={exerciseData.mondais || []}
        mode="instant"
        userAnswers={userAnswers}
        setUserAnswers={setUserAnswers}
      />

      <div className={styles.footerActions}>
        <button onClick={onCancel} className={styles.btnSecondary}>Thoát</button>
        <button onClick={() => window.location.reload()} className={styles.btnPrimary}>
          Làm lại từ đầu
        </button>
      </div>
    </>
  );
}