function DeleteConfirmModal({ isOpen, itemName, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Xác nhận xóa</h3>
                </div>
                <div className="modal-body">
                    <div className="delete-confirm-content">
                        <span className="delete-confirm-icon">⚠️</span>
                        <p>Bạn có chắc muốn xóa <strong>{itemName}</strong>?</p>
                        <p className="delete-confirm-hint">Hành động này không thể hoàn tác.</p>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onCancel}>Hủy</button>
                    <button className="btn btn-danger" onClick={onConfirm}>Xóa</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmModal;
