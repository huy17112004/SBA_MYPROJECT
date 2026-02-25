import { useState, useEffect, useCallback } from 'react';
import menuItemService from '../services/menuItemService';
import categoryService from '../services/categoryService';
import MenuItemCard from '../components/MenuItemCard';
import MenuItemFormModal from '../components/MenuItemFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import CategoryManager from '../components/CategoryManager';

function MenuPage() {
    // Data state
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter state
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedAvailability, setSelectedAvailability] = useState(null);
    const [keyword, setKeyword] = useState('');

    // Modal state
    const [showItemForm, setShowItemForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);
    const [showCategoryManager, setShowCategoryManager] = useState(false);

    // Toast state
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // --- Data fetching ---
    const fetchCategories = useCallback(async () => {
        try {
            const res = await categoryService.getAll();
            setCategories(res.data.data || []);
        } catch {
            setError('Không thể tải danh mục');
        }
    }, []);

    const fetchMenuItems = useCallback(async () => {
        try {
            const params = {};
            if (selectedCategory) params.categoryId = selectedCategory;
            if (selectedAvailability !== null) params.available = selectedAvailability;
            if (keyword.trim()) params.keyword = keyword.trim();
            const res = await menuItemService.getAll(params);
            setMenuItems(res.data.data || []);
        } catch {
            setError('Không thể tải danh sách món');
        }
    }, [selectedCategory, selectedAvailability, keyword]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchCategories();
            setLoading(false);
        };
        loadData();
    }, [fetchCategories]);

    useEffect(() => {
        fetchMenuItems();
    }, [fetchMenuItems]);

    // --- MenuItem CRUD ---
    const handleCreateItem = () => {
        setEditingItem(null);
        setShowItemForm(true);
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setShowItemForm(true);
    };

    const handleSaveItem = async (formData) => {
        try {
            if (editingItem) {
                await menuItemService.update(editingItem.id, formData);
                showToast('Cập nhật món thành công');
            } else {
                await menuItemService.create(formData);
                showToast('Thêm món thành công');
            }
            setShowItemForm(false);
            setEditingItem(null);
            fetchMenuItems();
        } catch (err) {
            const msg = err.response?.data?.message || 'Có lỗi xảy ra';
            showToast(msg, 'error');
        }
    };

    const handleDeleteItem = (item) => {
        setDeletingItem(item);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteItem = async () => {
        try {
            await menuItemService.delete(deletingItem.id);
            showToast('Xóa món thành công');
            setShowDeleteConfirm(false);
            setDeletingItem(null);
            fetchMenuItems();
        } catch (err) {
            const msg = err.response?.data?.message || 'Không thể xóa';
            showToast(msg, 'error');
        }
    };

    const handleToggle = async (id) => {
        try {
            await menuItemService.toggleAvailability(id);
            fetchMenuItems();
        } catch {
            showToast('Không thể cập nhật trạng thái', 'error');
        }
    };

    // --- Category CRUD ---
    const handleAddCategory = async (data) => {
        try {
            await categoryService.create(data);
            showToast('Thêm loại món thành công');
            fetchCategories();
        } catch (err) {
            const msg = err.response?.data?.message || 'Có lỗi xảy ra';
            showToast(msg, 'error');
        }
    };

    const handleUpdateCategory = async (id, data) => {
        try {
            await categoryService.update(id, data);
            showToast('Cập nhật loại món thành công');
            fetchCategories();
            fetchMenuItems();
        } catch (err) {
            const msg = err.response?.data?.message || 'Có lỗi xảy ra';
            showToast(msg, 'error');
        }
    };

    const handleDeleteCategory = async (cat) => {
        if (!window.confirm(`Xóa loại "${cat.name}"? Các món thuộc loại này sẽ mất danh mục.`)) return;
        try {
            await categoryService.delete(cat.id);
            showToast('Xóa loại món thành công');
            if (selectedCategory === cat.id) setSelectedCategory(null);
            fetchCategories();
            fetchMenuItems();
        } catch (err) {
            const msg = err.response?.data?.message || 'Không thể xóa loại món';
            showToast(msg, 'error');
        }
    };

    // --- Render ---
    if (loading) {
        return (
            <div className="page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            {/* Toast */}
            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="page-header menu-page-header">
                <div>
                    <h2>Quản lý Menu</h2>
                    <p className="page-subtitle">
                        {menuItems.length} món · {categories.length} loại
                    </p>
                </div>
                <div className="menu-header-actions">
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setShowCategoryManager(!showCategoryManager)}
                    >
                        📂 {showCategoryManager ? 'Ẩn loại' : 'Loại món'}
                    </button>
                    <button className="btn btn-primary" onClick={handleCreateItem}>
                        + Thêm món
                    </button>
                </div>
            </div>

            {/* Category Manager (collapsible) */}
            {showCategoryManager && (
                <CategoryManager
                    categories={categories}
                    onAdd={handleAddCategory}
                    onUpdate={handleUpdateCategory}
                    onDelete={handleDeleteCategory}
                />
            )}

            {/* Search & Filters */}
            <div className="menu-filters">
                <div className="menu-search">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Tìm món..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    {keyword && (
                        <button className="search-clear" onClick={() => setKeyword('')}>✕</button>
                    )}
                </div>

                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${selectedCategory === null ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        Tất cả
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`filter-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="filter-tabs filter-status">
                    <button
                        className={`filter-tab ${selectedAvailability === null ? 'active' : ''}`}
                        onClick={() => setSelectedAvailability(null)}
                    >
                        Tất cả
                    </button>
                    <button
                        className={`filter-tab filter-available ${selectedAvailability === true ? 'active' : ''}`}
                        onClick={() => setSelectedAvailability(selectedAvailability === true ? null : true)}
                    >
                        🟢 Còn hàng
                    </button>
                    <button
                        className={`filter-tab filter-unavailable ${selectedAvailability === false ? 'active' : ''}`}
                        onClick={() => setSelectedAvailability(selectedAvailability === false ? null : false)}
                    >
                        🔴 Hết hàng
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="error-banner">
                    ❌ {error}
                    <button onClick={() => { setError(null); fetchMenuItems(); }}>Thử lại</button>
                </div>
            )}

            {/* Menu Items Grid */}
            <div className="menu-items-grid">
                {menuItems.length === 0 ? (
                    <div className="placeholder-content">
                        <span className="placeholder-icon">📋</span>
                        <p>{keyword || selectedCategory || selectedAvailability !== null
                            ? 'Không tìm thấy món nào phù hợp'
                            : 'Chưa có món nào. Nhấn "+ Thêm món" để bắt đầu!'}</p>
                    </div>
                ) : (
                    menuItems.map((item) => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            onEdit={handleEditItem}
                            onDelete={handleDeleteItem}
                            onToggle={handleToggle}
                        />
                    ))
                )}
            </div>

            {/* Modals */}
            <MenuItemFormModal
                isOpen={showItemForm}
                item={editingItem}
                categories={categories}
                onSave={handleSaveItem}
                onCancel={() => { setShowItemForm(false); setEditingItem(null); }}
            />

            <DeleteConfirmModal
                isOpen={showDeleteConfirm}
                itemName={deletingItem?.name}
                onConfirm={confirmDeleteItem}
                onCancel={() => { setShowDeleteConfirm(false); setDeletingItem(null); }}
            />
        </div>
    );
}

export default MenuPage;
