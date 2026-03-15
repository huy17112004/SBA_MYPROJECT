import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/tables" className="nav-link">Sơ Đồ Bàn</NavLink>
      <NavLink to="/kitchen" className="nav-link">Bếp / Chế Biến</NavLink>
      <NavLink to="/history" className="nav-link">Lịch Sử Order</NavLink>
      <NavLink to="/menu" className="nav-link">Quản Lý Menu</NavLink>
      <NavLink to="/stats" className="nav-link">Thống Kê</NavLink>
    </nav>
  );
}

export default Navbar;