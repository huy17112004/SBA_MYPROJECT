import { useState, useEffect } from 'react';

function MenuItemFormModal({ isOpen, item, categories, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        categoryId: '',
        description: '',
        available: true,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (item) {
                setFormData({
                    name: item.name || '',
                    price: item.price || '',
                    categoryId: item.categoryId || '',
                    description: item.description || '',
                    available: item.available !== false,
                });
            } else {
                setFormData({
                    name: '',
                    price: '',
                    categoryId: categories.length > 0 ? categories[0].id : '',
                    description: '',
                    available: true,
                });
            }
            setErrors({});
        }
    }, [isOpen, item, categories]);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Tên món không được để trống';
        if (!formData.price && formData.price !== 0) newErrors.price = 'Giá không được để trống';
        else if (Number(formData.price) < 0) newErrors.price = 'Giá phải >= 0';
        if (!formData.categoryId) newErrors.categoryId = 'Vui lòng chọn loại món';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSave({
            name: formData.name.trim(),
            price: Number(formData.price),
            categoryId: Number(formData.categoryId),
            description: formData.description?.trim() || null,
            available: formData.available,
        });
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{item ? 'Sửa món' : 'Thêm món mới'}</h3>
                    <button className="modal-close-btn" onClick={onCancel}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Tên món *</label>
                            <input
                                type="text"
                                className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                                placeholder="VD: Trà đá, Nước sấu..."
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                autoFocus
                            />
                            {errors.name && <span className="form-error">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Giá (VNĐ) *</label>
                            <input
                                type="number"
                                className={`form-input ${errors.price ? 'form-input-error' : ''}`}
                                placeholder="VD: 5000"
                                value={formData.price}
                                onChange={(e) => handleChange('price', e.target.value)}
                                min="0"
                                step="1000"
                            />
                            {errors.price && <span className="form-error">{errors.price}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Loại món *</label>
                            <select
                                className={`form-input form-select ${errors.categoryId ? 'form-input-error' : ''}`}
                                value={formData.categoryId}
                                onChange={(e) => handleChange('categoryId', e.target.value)}
                            >
                                <option value="">-- Chọn loại --</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mô tả</label>
                            <textarea
                                className="form-input form-textarea"
                                placeholder="Mô tả ngắn về món (tùy chọn)"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows="2"
                            />
                        </div>

                        <div className="form-group form-group-inline">
                            <label className="form-label">Còn hàng</label>
                            <button
                                type="button"
                                className={`toggle-btn ${formData.available ? 'toggle-on' : 'toggle-off'}`}
                                onClick={() => handleChange('available', !formData.available)}
                            >
                                <span className="toggle-track">
                                    <span className="toggle-thumb"></span>
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onCancel}>Hủy</button>
                        <button type="submit" className="btn btn-primary">
                            {item ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MenuItemFormModal;
