import React, { useState, useEffect } from 'react';
import { getMenuItems } from '../../api/menuApi';
import { addOrderItem } from '../../api/orderApi';
import { formatMoney } from '../../utils/formatMoney';

function OrderItemEditor({ orderId, onClose, onRefresh }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await getMenuItems();
      setItems(res.data.filter(i => i.available !== false));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedItem) return alert("Vui lòng chọn món");
    
    // Backend expects { items: [{ menuItemId, quantity, note }] }
    const requestData = {
      items: [
        {
          menuItemId: Number(selectedItem),
          quantity: Number(quantity),
          note: note
        }
      ]
    };

    try {
      await addOrderItem(orderId, requestData);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Lỗi thêm món: " + (err.response?.data?.message || "Không xác định"));
    }
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <h4>Thêm món mới</h4>
      <form onSubmit={handleAdd}>
        <div className="form-group">
          <input className="form-control" placeholder="Tìm món..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="form-group">
          <select className="form-control" value={selectedItem} onChange={e => setSelectedItem(e.target.value)} required>
            <option value="">-- Chọn món --</option>
            {filteredItems.map(i => (
              <option key={i.id} value={i.id}>{i.name} - {formatMoney(i.price)}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label>Số lượng</label>
            <input type="number" min="1" className="form-control" value={quantity} onChange={e => setQuantity(e.target.value)} />
          </div>
          <div style={{ flex: 2 }}>
            <label>Ghi chú</label>
            <input type="text" className="form-control" placeholder="Ít đá, không đường..." value={note} onChange={e => setNote(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn btn-success">Thêm</button>
          <button type="button" className="btn btn-danger" onClick={onClose}>Hủy</button>
        </div>
      </form>
    </div>
  );
}

export default OrderItemEditor;