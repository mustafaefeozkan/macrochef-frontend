import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const Dashboard = () => {
    const navigate = useNavigate();

    // --- STATE'LER ---
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Sidebar Kontrolleri
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sol Menü (Profil)
    const [isNotifOpen, setIsNotifOpen] = useState(false);     // Sağ Menü (Bildirimler)

    // Bildirim Verisi (Başlangıçta boş)
    const [notifications, setNotifications] = useState([]);

    // Bildirimleri temizle (Demo amaçlı)
    const clearNotifications = () => setNotifications([]);

    // --- VERİ ÇEKME (FETCH) ---
    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }

                const response = await fetch('http://localhost:8080/api/recipes', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setRecipes(data);
                } else if (response.status === 401 || response.status === 403) {
                    // Token geçersizse at
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } catch (error) {
                console.error("Hata:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, [navigate]);

    // --- FONKSİYONLAR ---
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleNotif = () => setIsNotifOpen(!isNotifOpen);

    return (
        <div className="dashboard-container">

            {/* --- ÜST NAVBAR --- */}
            <nav className="top-navbar">
                {/* SOL: Profil İkonu (Menüyü açar) */}
                <div className="nav-left">
                    <div className="profile-circle" onClick={toggleSidebar}>
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                            alt="Profile"
                            style={{width: '28px', opacity: 0.8}}
                        />
                    </div>
                </div>

                {/* ORTA: Logo ve Arama Çubuğu */}
                <div className="nav-center">
                    <div className="brand-logo-large">
                        <span className="macro">Macro</span><span className="chef">Chef</span>
                    </div>
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="modern-search-input"
                            placeholder="Find healthy recipes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* SAĞ: Bildirim Zili (Sağ menüyü açar) */}
                <div className="nav-right">
                    <button className="icon-btn" onClick={toggleNotif} title="Notifications">
                        🔔
                        {notifications.length > 0 && <span className="notif-badge"></span>}
                    </button>
                </div>
            </nav>

            {/* --- SOL SIDEBAR (MENÜ) --- */}
            <div className={`sidebar-menu ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-container">Menu</div>
                    <button className="close-btn" onClick={toggleSidebar}>&times;</button>
                </div>

                <ul className="sidebar-links">
                    <li onClick={() => navigate('/profile')}>
                        <span className="icon">👤</span> Profile
                    </li>
                    <li onClick={() => navigate('/create-recipe')}>
                        <span className="icon">🍳</span> Post Recipe
                    </li>
                    <li onClick={() => navigate('/favorites')}>
                        <span className="icon">❤️</span> Favorites
                    </li>
                    <hr className="sidebar-divider" />
                    <li onClick={handleLogout} className="logout-item">
                        <span className="icon">🚪</span> Logout
                    </li>
                </ul>
            </div>

            {/* --- SAĞ SIDEBAR (BİLDİRİMLER) --- */}
            <div className={`notification-sidebar ${isNotifOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-container" style={{fontSize: '1.2rem'}}>Notifications</div>
                    <button className="close-btn" onClick={toggleNotif}>&times;</button>
                </div>

                <div className="notif-content">
                    {notifications.length === 0 ? (
                        <div className="empty-notif">
                            <span style={{fontSize: '3rem', marginBottom: '10px'}}>🎉</span>
                            <p style={{fontSize: '1rem', color: '#64748b'}}>You're all caught up!</p>
                            <p style={{fontSize: '0.8rem', color: '#94a3b8'}}>No new notifications.</p>
                        </div>
                    ) : (
                        <>
                            {notifications.map((notif) => (
                                <div key={notif.id} className="notif-item">
                                    <div className="notif-icon">💾</div>
                                    <div className="notif-text">
                                        <strong>{notif.user}</strong> {notif.action} <b>{notif.recipe}</b>.
                                        <span className="notif-time">{notif.time}</span>
                                    </div>
                                </div>
                            ))}
                            <button className="clear-btn" onClick={clearNotifications}>Mark all as read</button>
                        </>
                    )}
                </div>
            </div>

            {/* --- OVERLAY (Menüler açıkken arka planı karart) --- */}
            {(isSidebarOpen || isNotifOpen) && (
                <div className="overlay" onClick={() => { setIsSidebarOpen(false); setIsNotifOpen(false); }}></div>
            )}

            {/* --- ANA İÇERİK (TARİF KARTLARI) --- */}
            <div className="main-content-area">
                {loading ? (
                    <div className="loading-state">Cooking up recipes... 🍳</div>
                ) : recipes.length === 0 ? (
                    <div className="empty-state">
                        <p>No recipes found.</p>
                        <button onClick={() => navigate('/create-recipe')}>Create First Recipe</button>
                    </div>
                ) : (
                    <div className="feed-grid">
                        {recipes.map((recipe) => (
                            <div key={recipe.id} className="recipe-card">
                                <div className="card-image" style={{
                                    backgroundImage: `url(${recipe.imageUrl && recipe.imageUrl !== 'none' ? recipe.imageUrl : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'})`
                                }}>
                                    {recipe.calories > 0 && <span className="cal-badge">🔥 {recipe.calories} kcal</span>}
                                </div>
                                <div className="card-content">
                                    <h3>{recipe.title}</h3>
                                    <p className="description">
                                        {recipe.description ? (recipe.description.length > 60 ? recipe.description.substring(0, 60) + '...' : recipe.description) : 'Delicious healthy meal.'}
                                    </p>
                                    <div className="card-footer">
                                        {recipe.totalProtein > 0 && (
                                            <div className="macro-pill protein">
                                                <span>💪 {recipe.totalProtein}g Protein</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;