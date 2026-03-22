import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom'; // Nếu bạn muốn link đến trang chi tiết
import styles from './ExcerciseList.module.css'; // Tạo file CSS module riêng

// Khởi tạo Supabase client (tương tự CreatePage)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExercises = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('jlpt_exercise_sets') // ← Đổi tên bảng nếu khác (ví dụ: database_for_jlpt_excercises)
        .select(`
          id,
          title,
          created_at,
          mondais
        `)
        .order('created_at', { ascending: false }); // Mới nhất lên đầu

      if (error) {
        console.error('Supabase fetch error:', error);
        throw new Error(error.message || 'Không thể tải danh sách bộ đề');
      }

      // Thêm số lượng mondais để hiển thị
      const formattedData = data.map(item => ({
        ...item,
        mondaiCount: item.mondais?.length || 0,
      }));

      setExercises(formattedData);
    } catch (err) {
      setError(err.message || 'Có lỗi khi tải dữ liệu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchExercises();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>List Đề</h1>
        <button
          onClick={fetchExercises}
          className={styles.refreshBtn}
          disabled={loading}
        >
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Đang tải danh sách bộ đề...</div>
      ) : exercises.length === 0 ? (
        <div className={styles.empty}>
          Chưa có bộ đề nào được tạo. Hãy quay lại trang tạo đề!
        </div>
      ) : (
        <div className={styles.grid}>
          {exercises.map((ex) => (
            <div key={ex.id} className={styles.card}>
              <h3 className={styles.cardTitle}>{ex.title}</h3>
              <div className={styles.cardInfo}>
                <p>Số lượng Mondai: <strong>{ex.mondaiCount}</strong></p>
                <p>Ngày tạo: <strong>{formatDate(ex.created_at)}</strong></p>
              </div>

              {/* Nếu bạn có trang chi tiết, dùng Link */}
              <Link to={`/exercise/${ex.id}`} className={styles.viewBtn}>
                Xem chi tiết
              </Link>

              {/* Hoặc chỉ hiển thị nút nếu chưa có route */}
              {/* <button className={styles.viewBtn}>Xem chi tiết</button> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExerciseList;