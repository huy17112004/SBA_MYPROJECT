import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, deleteCategory } from '../../api/menuApi';

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createCategory({ name: newName });
      setNewName('');
      fetchCategories();
    } catch (e) {
      alert("Lỗi thêm danh mục");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa danh mục này? Các món thuộc danh mục này sẽ mất liên kết danh mục.")) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (e) {
      alert("Lỗi xóa danh mục");
    }
  };

  return (
    <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#f9f9f9' }}>
      <h3 className="card-title">Quản Lý Danh Mục</h3>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input 
          className="form-control" 
          placeholder="Tên danh mục mới (vd: Đồ uống...)" 
          value={newName} 
          onChange={e => setNewName(e.target.value)} 
        />
        <button type="submit" className="btn btn-success">Thêm</button>
      </form>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {categories.map(cat => (
          <div key={cat.id} className="badge badge-available" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            {cat.name}
            <span 
              style={{ cursor: 'pointer', fontWeight: 'bold', color: '#fff' }} 
              onClick={() => handleDelete(cat.id)}
            >×</span>
          </div>
        ))}
        {categories.length === 0 && <p>Chưa có danh mục nào.</p>}
      </div>
    </div>
  );
}

export default CategoryManager;