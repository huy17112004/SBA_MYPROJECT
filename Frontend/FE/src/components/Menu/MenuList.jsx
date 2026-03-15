import React, { useState, useEffect } from 'react';
import { getMenuItems, deleteMenuItem, toggleMenuItemAvailability } from '../../api/menuApi';
import { formatMoney } from '../../utils/formatMoney';
import MenuForm from './MenuForm';

function MenuList() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await getMenuItems();
      setItems(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa món này?")) return;
    try {
      await deleteMenuItem(id);
      fetchItems();
    } catch (e) {
      alert("Lỗi khi xóa");
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleMenuItemAvailability(id);
      fetchItems();
    } catch (e) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <input 
          className="form-control" 
          style={{ maxWidth: '300px' }}
          placeholder="Tìm tên món..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-success" onClick={() => { setEditingItem(null); setShowForm(true); }}>Thêm Món</button>
      </div>

      {showForm && (
        <MenuForm 
          item={editingItem} 
          onClose={() => setShowForm(false)} 
          onRefresh={() => { fetchItems(); setShowForm(false); }} 
        />
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên món</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.categoryName || item.categoryId}</td>
                <td>{formatMoney(item.price)}</td>
                <td>
                  <button 
                    className={`btn ${item.available ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => handleToggle(item.id)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  >
                    {item.available ? 'Còn hàng' : 'Hết hàng'}
                  </button>
                </td>
                <td>
                  <button className="btn btn-primary" style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem' }} onClick={() => { setEditingItem(item); setShowForm(true); }}>Sửa</button>
                  <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(item.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MenuList;