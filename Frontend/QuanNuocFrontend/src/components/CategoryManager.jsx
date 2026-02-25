import { useState } from 'react';

function CategoryManager({ categories, onAdd, onUpdate, onDelete }) {
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        if (!newName.trim()) return;
        onAdd({ name: newName.trim(), displayOrder: categories.length });
        setNewName('');
        setIsAdding(false);
    };

    const startEdit = (cat) => {
        setEditingId(cat.id);
        setEditingName(cat.name);
    };

    const handleUpdate = () => {
        if (!editingName.trim()) return;
        onUpdate(editingId, { name: editingName.trim(), displayOrder: categories.find(c => c.id === editingId)?.displayOrder || 0 });
        setEditingId(null);
        setEditingName('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    return (
        <div className="category-manager">
            <div className="category-manager-header">
                <h3>📂 Quản lý loại món</h3>
                {!isAdding && (
                    <button className="btn btn-primary btn-sm" onClick={() => setIsAdding(true)}>
                        + Thêm loại
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="category-add-row">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Tên loại mới..."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        autoFocus
                    />
                    <button className="btn btn-primary btn-sm" onClick={handleAdd}>Lưu</button>
                    <button className="btn btn-outline btn-sm" onClick={() => { setIsAdding(false); setNewName(''); }}>Hủy</button>
                </div>
            )}

            <div className="category-list">
                {categories.length === 0 && (
                    <p className="category-empty">Chưa có loại món nào. Hãy thêm loại mới!</p>
                )}
                {categories.map((cat) => (
                    <div key={cat.id} className="category-item">
                        {editingId === cat.id ? (
                            <div className="category-edit-row">
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdate();
                                        if (e.key === 'Escape') cancelEdit();
                                    }}
                                    autoFocus
                                />
                                <button className="btn btn-primary btn-sm" onClick={handleUpdate}>Lưu</button>
                                <button className="btn btn-outline btn-sm" onClick={cancelEdit}>Hủy</button>
                            </div>
                        ) : (
                            <div className="category-display-row">
                                <span className="category-name">{cat.name}</span>
                                <div className="category-actions">
                                    <button className="btn-icon" onClick={() => startEdit(cat)} title="Sửa">✏️</button>
                                    <button className="btn-icon btn-icon-danger" onClick={() => onDelete(cat)} title="Xóa">🗑️</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CategoryManager;
