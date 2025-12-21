import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeModal from '../components/RecipeModal'; // 👈 IMPORT ETTİK
import '../styles/Navbar.css';
import '../styles/Dashboard.css';

const API_BASE_URL = "https://macrochef-backend.onrender.com";

const Dashboard = () => {
    const navigate = useNavigate();


    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');


    const [selectedRecipe, setSelectedRecipe] = useState(null);


    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleNotif = () => setIsNotifOpen(!isNotifOpen);
    const closeAll = () => { setIsSidebarOpen(false); setIsNotifOpen(false); };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }
                const headers = { 'Authorization': `Bearer ${token}` };

                const recipesRes = await fetch(`${API_BASE_URL}/api/recipes`, { headers });
                const favsRes = await fetch(`${API_BASE_URL}/api/favorites`, { headers });

                if (recipesRes.ok) {
                    const recipesData = await recipesRes.json();
                    setRecipes(recipesData);
                } else if (recipesRes.status === 401 || recipesRes.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }

                if (favsRes.ok) {
                    const textData = await favsRes.text();
                    try {
                        const favsData = JSON.parse(textData);
                        if (Array.isArray(favsData)) {
                            setFavoriteIds(favsData.map(fav => fav.id));
                        }
                    } catch (parseErr) {
                        console.error("Favori parse hatası", parseErr);
                    }
                }
            } catch (error) {
                console.error("Genel Fetch Hatası:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);


    const toggleFavorite = async (recipeId) => {
        const isCurrentlyFav = favoriteIds.includes(recipeId);
        let newFavIds;
        if (isCurrentlyFav) {
            newFavIds = favoriteIds.filter(id => id !== recipeId);
        } else {
            newFavIds = [...favoriteIds, recipeId];
        }
        setFavoriteIds(newFavIds);

        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/api/favorites/${recipeId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Bağlantı hatası:", err);
        }
    };


    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{display:'flex', justifyContent:'center', marginTop:'100px', color:'#666'}}>Cooking up recipes... 🍳</div>;

    return (
        <div className="dashboard-container">


            {selectedRecipe && (
                <RecipeModal
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                />
            )}


            {(isSidebarOpen || isNotifOpen) && <div className="overlay" onClick={closeAll}></div>}


            <div className={`sidebar-menu ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header"><span>Menu</span><button className="close-btn" onClick={closeAll}>&times;</button></div>
                <ul className="sidebar-links">
                    <li onClick={() => navigate('/dashboard')} style={{color:'var(--chef-orange)'}}>🏠 Dashboard</li>
                    <li onClick={() => navigate('/create-recipe')}>🍳 Create Recipe</li>
                    <li onClick={() => navigate('/favorites')}>❤️ Favorites</li>
                    <li onClick={() => navigate('/profile')}>👤 My Profile</li>
                    <li className="logout-item" onClick={handleLogout}>🚪 Logout</li>
                </ul>
            </div>

            <div className={`notification-sidebar ${isNotifOpen ? 'open' : ''}`}>
                <div className="sidebar-header"><span>Notifications</span><button className="close-btn" onClick={closeAll}>&times;</button></div>
                <div className="notif-content"><div className="empty-notif"><span style={{fontSize: '2rem'}}>🎉</span><p>No new notifications</p></div></div>
            </div>


            <nav className="top-navbar">
                <div className="nav-left"><button className="icon-btn" onClick={toggleSidebar}>☰</button></div>
                <div className="nav-center"><div className="brand-logo-large"><span className="macro">Macro</span><span className="chef">Chef</span></div></div>
                <div className="nav-right"><button className="icon-btn" onClick={toggleNotif}>🔔</button></div>
            </nav>


            <div className="main-content-area">
                <div className="search-section">
                    <div className="search-bar-wrapper">
                        <span className="search-icon">🔍</span>
                        <input type="text" placeholder="Search recipes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        {searchTerm && <button className="clear-search" onClick={() => setSearchTerm('')}>&times;</button>}
                    </div>
                </div>

                {filteredRecipes.length === 0 ? (
                    <div className="empty-state">
                        <p>No recipes found.</p>
                        <button onClick={() => navigate('/create-recipe')}>Create First Recipe</button>
                    </div>
                ) : (
                    <div className="feed-grid">
                        {filteredRecipes.map((recipe) => (
                            <div
                                key={recipe.id}
                                className="recipe-card"

                                onClick={() => setSelectedRecipe(recipe)}
                            >
                                <div className="card-image" style={{
                                    backgroundImage: `url(${recipe.imageUrl && recipe.imageUrl !== 'none' ? recipe.imageUrl : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800'})`
                                }}>
                                    <button
                                        className={`fav-btn ${favoriteIds.includes(recipe.id) ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(recipe.id);
                                        }}
                                        title="Favorite"
                                    >
                                        {favoriteIds.includes(recipe.id) ? '❤️' : '♡'}
                                    </button>

                                    {(recipe.calories || recipe.totalCalories) &&
                                        <span className="cal-badge">🔥 {(recipe.calories || recipe.totalCalories).toFixed(0)} kcal</span>
                                    }
                                </div>
                                <div className="card-content">
                                    <h3>{recipe.title}</h3>
                                    <p className="description">{recipe.description ? recipe.description.substring(0, 60) + '...' : ''}</p>
                                    <div className="card-footer">
                                        {(recipe.totalProtein > 0) && <div className="macro-pill">💪 {recipe.totalProtein.toFixed(1)}g Protein</div>}
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