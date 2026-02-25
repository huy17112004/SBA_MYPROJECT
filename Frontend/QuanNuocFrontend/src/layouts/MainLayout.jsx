import { NavLink, Outlet } from 'react-router-dom';

function MainLayout() {
    return (
        <div className="app-container">
            <header className="app-header">
                <h1 className="app-logo">🧊 QuanNuoc</h1>
            </header>

            <main className="app-content">
                <Outlet />
            </main>

            <nav className="bottom-nav">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <span className="nav-icon">🪑</span>
                    <span className="nav-label">Bàn</span>
                </NavLink>
                <NavLink
                    to="/menu"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <span className="nav-icon">📋</span>
                    <span className="nav-label">Menu</span>
                </NavLink>
                <NavLink
                    to="/orders"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <span className="nav-icon">🧾</span>
                    <span className="nav-label">Orders</span>
                </NavLink>
                <NavLink
                    to="/settings"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <span className="nav-icon">⚙️</span>
                    <span className="nav-label">Cài đặt</span>
                </NavLink>
            </nav>
        </div>
    );
}

export default MainLayout;
