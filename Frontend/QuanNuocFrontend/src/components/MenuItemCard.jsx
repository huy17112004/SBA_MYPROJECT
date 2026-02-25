function MenuItemCard({ item, onEdit, onDelete, onToggle }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    return (
        <div className={`menu-item-card card ${!item.available ? 'menu-item-unavailable' : ''}`}>
            <div className="menu-item-card-header">
                <div className="menu-item-info">
                    <h4 className="menu-item-name">{item.name}</h4>
                    {item.categoryName && (
                        <span className="menu-item-category-badge">{item.categoryName}</span>
                    )}
                </div>
                <div className="menu-item-price">{formatPrice(item.price)}</div>
            </div>

            {item.description && (
                <p className="menu-item-description">{item.description}</p>
            )}

            <div className="menu-item-card-footer">
                <button
                    className={`toggle-btn ${item.available ? 'toggle-on' : 'toggle-off'}`}
                    onClick={() => onToggle(item.id)}
                    title={item.available ? 'Đánh dấu hết hàng' : 'Đánh dấu còn hàng'}
                >
                    <span className="toggle-track">
                        <span className="toggle-thumb"></span>
                    </span>
                    <span className="toggle-label">
                        {item.available ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                </button>

                <div className="menu-item-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => onEdit(item)}>
                        ✏️ Sửa
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(item)}>
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MenuItemCard;
