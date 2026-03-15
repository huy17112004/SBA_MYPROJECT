import React, { useState, useEffect } from 'react';
import { createMenuItem, updateMenuItem, getCategories } from '../../api/menuApi';

function MenuForm({ item, onClose, onRefresh }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    if (item) {
      setName(item.name);
      setPrice(item.price);
      setCategoryId(item.categoryId || '');
    }
  }, [item]);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
      if (res.data.length > 0 && !item) setCategoryId(res.data[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name, price: Number(price), categoryId: categoryId ? Number(categoryId) : null, available: true };
    try {
      if (item) {
        await updateMenuItem(item.id, data);
      } else {
        await createMenuItem(data);
      }
      onRefresh();
    } catch (err) {
      alert("Lỗi lưu món ăn");
    }
  };

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <h3>{item ? 'Sửa món' : 'Thêm món'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tên món</label>
          <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Giá (VNĐ)</label>
          <input type="number" className="form-control" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Danh mục</label>
          <select className="form-control" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">Chọn danh mục</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn btn-success">Lưu</button>
          <button type="button" className="btn btn-danger" onClick={onClose}>Hủy</button>
        </div>
      </form>
    </div>
  );
}

export default MenuForm;