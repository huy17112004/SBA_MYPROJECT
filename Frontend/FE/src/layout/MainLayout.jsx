import React from 'react';
import Navbar from './Navbar';

function MainLayout({ children }) {
  return (
    <div className="layout-container">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;