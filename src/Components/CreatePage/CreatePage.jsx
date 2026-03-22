import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import styles from './CreatePage.module.css';
import MondaiSetting from '../Mondai/MondaiSetting';

// Khởi tạo Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Thiếu biến môi trường Supabase. Kiểm tra file .env');
  // Optional: throw new Error('Supabase config missing') nếu bạn muốn dừng app
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function CreatePage() {
  const [mondais, setMondais] = useState([
    { key: crypto.randomUUID(), rawText: '', formattedJson: null }
  ]);

  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const addMondai = () => {
    setMondais(prev => [
      ...prev,
      { key: crypto.randomUUID(), rawText: '', formattedJson: null }
    ]);
  };

  const updateMondai = (arrayIndex, rawText, formattedJson) => {
    setMondais(prev => {
      const newMondais = [...prev];
      newMondais[arrayIndex] = { ...newMondais[arrayIndex], rawText, formattedJson };
      return newMondais;
    });
  };

  const deleteMondai = (arrayIndex) => {
    if (mondais.length <= 1) {
      alert('Không thể xóa khi chỉ còn 1 mondai!');
      return;
    }
    if (window.confirm(`Xác nhận xóa Mondai ${arrayIndex + 1}?`)) {
      setMondais(prev => prev.filter((_, i) => i !== arrayIndex));
    }
  };

  const handlePublish = async () => {
    const validMondais = mondais.filter(m => m.formattedJson !== null);

    if (validMondais.length === 0) {
      setErrorMessage('Chưa có mondai nào được format hợp lệ!');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề bộ đề!');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Kiểm tra trùng title
      const { data: existing } = await supabase
        .from('jlpt_exercise_sets')  // ← Đổi tên bảng ngắn gọn, sửa chính tả
        .select('id')
        .eq('title', title.trim())
        .limit(1);

      if (existing?.length > 0) {
        if (!window.confirm(`Tiêu đề "${title.trim()}" đã tồn tại. Tạo bản sao mới?`)) {
          return;
        }
      }

      const dataToPublish = {
        title: title.trim(),
        created_at: new Date().toISOString(),
        mondais: validMondais.map(m => m.formattedJson),
        // updated_at: new Date().toISOString(), // nếu bảng có cột này
      };

      const { data, error } = await supabase
        .from('jlpt_exercise_sets')  // ← tên bảng bạn nên dùng
        .insert([dataToPublish])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        let msg = error.message || 'Lỗi khi lưu dữ liệu';
        if (error.code === '23505') msg = 'Tiêu đề trùng lặp (unique constraint)';
        if (error.code === '42501') msg = 'Không có quyền insert (kiểm tra RLS policy)';
        throw new Error(msg);
      }

      setSuccessMessage('Publish thành công! Bộ đề đã được lưu.');
      console.log('Inserted:', data?.[0]);

      // Chỉ reset khi thành công
      setTitle('');
      setMondais([{ key: crypto.randomUUID(), rawText: '', formattedJson: null }]);

    } catch (err) {
      setErrorMessage(err.message || 'Có lỗi xảy ra khi publish');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.taskbar}>
        <input
          type="text"
          placeholder="Tiêu đề bộ đề..."
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <div className={styles.taskbarButtons}>
          <button onClick={addMondai} disabled={loading}>
            + Thêm mondai
          </button>
          <button
            onClick={handlePublish}
            className={styles.publishBtn}
            disabled={loading}
          >
            {loading ? 'Đang publish...' : 'Publish'}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className={styles.errorAlert}>
          <strong>Lỗi:</strong> {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className={styles.successAlert}>
          <strong>Thành công:</strong> {successMessage}
        </div>
      )}

      <div className={styles.content}>
        {mondais.map((mondai, idx) => (
          <MondaiSetting
            key={mondai.key}
            index={idx + 1}
            initialText={mondai.rawText}
            initialJson={mondai.formattedJson}
            onUpdate={(raw, json) => updateMondai(idx, raw, json)}
            onDelete={() => deleteMondai(idx)}
          />
        ))}
      </div>
    </div>
  );
}

export default CreatePage;