import React from 'react';
import MenuList from '../components/Menu/MenuList';
import CategoryManager from '../components/Menu/CategoryManager';

function MenuPage() {
  return (
    <div>
      <h1 className="page-title">Quản Lý Menu</h1>
      <CategoryManager />
      <MenuList />
    </div>
  );
}

export default MenuPage;