import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import LearningMode from './LearningMode';
import TestMode from './TestMode';
import styles from './ExerciseDetail.module.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function ExerciseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exerciseData, setExerciseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState(null); // null | 'learning' | 'test'

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('jlpt_exercise_sets')
        .select('*')
        .eq('id', id)
        .single();
      setExerciseData(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className={styles.loading}>Đang tải bài tập...</div>;

  const startMode = (mode) => {
    setSelectedMode(mode);
  };

  const cancel = () => {
    setSelectedMode(null);
    navigate(-1); // hoặc chỉ reset mode
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← Quay lại danh sách
      </button>

      <h1 className={styles.title}>{exerciseData?.title}</h1>

      {!selectedMode ? (
        // === MÀN HÌNH CHỌN MODE ===
        <div className={styles.modeSelection}>
          <h2>Chọn chế độ làm bài</h2>
          <div className={styles.modeCards}>
            <button className={styles.modeCard} onClick={() => startMode('learning')}>
              <h3>📚 Chế độ Học tập</h3>
              <p>Hiện đáp án ngay khi chọn • Có giải thích</p>
              <span className={styles.start}>Bắt đầu học</span>
            </button>

            <button className={styles.modeCard} onClick={() => startMode('test')}>
              <h3>📝 Chế độ Kiểm tra</h3>
              <p>Làm xong mới nộp • Xem điểm & phân tích</p>
              <span className={styles.start}>Bắt đầu kiểm tra</span>
            </button>
          </div>

          <button className={styles.cancelBtn} onClick={cancel}>
            Hủy & Quay lại
          </button>
        </div>
      ) : selectedMode === 'learning' ? (
        <LearningMode exerciseData={exerciseData} onCancel={cancel} />
      ) : (
        <TestMode exerciseData={exerciseData} onCancel={cancel} />
      )}
    </div>
  );
}