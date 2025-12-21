import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import '../styles/CreateRecipe.css';
// Sidebar stilleri Navbar.css içinde olduğu için ekstra bir şeye gerek yok

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const CreateRecipe = () => {
    const navigate = useNavigate();

    // --- FORM STATE'LERİ ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Kategori State'leri
    const [allCategories, setAllCategories] = useState([]);
    const [catSearchTerm, setCatSearchTerm] = useState('');
    const [catSearchResults, setCatSearchResults] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    // Malzeme State'leri
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // --- SIDEBAR STATE'LERİ (YENİ) ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    // Sidebar Aç/Kapa
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleNotif = () => setIsNotifOpen(!isNotifOpen);
    const closeAll = () => { setIsSidebarOpen(false); setIsNotifOpen(false); };

    // Çıkış Yap
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // --- VERİ ÇEKME (Kategoriler) ---
    useEffect(() => {
        window.scrollTo(0, 0); // Sayfa açılınca en üste git
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setAllCategories(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Kategori hatası:", err);
            }
        };
        fetchCategories();
    }, []);

    // --- KATEGORİ FONKSİYONLARI ---
    const handleCategorySearch = (val) => {
        setCatSearchTerm(val);
        if (val.trim().length > 0) {
            const filtered = allCategories.filter(cat =>
                cat.name.toLowerCase().includes(val.toLowerCase()) &&
                !selectedCategories.find(s => s.id === cat.id)
            );
            setCatSearchResults(filtered);
        } else {
            setCatSearchResults([]);
        }
    };

    const addCategory = (cat) => {
        setSelectedCategories([...selectedCategories, cat]);
        setCatSearchTerm('');
        setCatSearchResults([]);
    };

    const removeCategory = (id) => {
        setSelectedCategories(selectedCategories.filter(c => c.id !== id));
    };

    // --- MALZEME FONKSİYONLARI ---
    const handleSearch = async (val) => {
        setSearchTerm(val);
        if (val.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${API_BASE_URL}/ingredients/search?name=${val}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setSearchResults(await res.json());
            }
        } catch (err) {
            console.error("Bağlantı Hatası:", err);
        }
    };

    const addIngredient = (ing) => {
        if (!selectedIngredients.find(i => i.id === ing.id)) {
            setSelectedIngredients([...selectedIngredients, { ...ing, amountInGrams: 100 }]);
        }
        setSearchTerm('');
        setSearchResults([]);
    };

    const updateAmount = (index, newVal) => {
        const updatedIngredients = [...selectedIngredients];
        updatedIngredients[index].amountInGrams = newVal;
        setSelectedIngredients(updatedIngredients);
    };

    const removeIngredient = (index) => {
        const updatedIngredients = [...selectedIngredients];
        updatedIngredients.splice(index, 1);
        setSelectedIngredients(updatedIngredients);
    };

    // Toplam Kalori
    const totalCal = selectedIngredients.reduce((acc, curr) => {
        const calPer100 = curr.calories || curr.calories100g || 0;
        return acc + (calPer100 * (curr.amountInGrams || 0) / 100);
    }, 0);

    // --- KAYDETME (SUBMIT) ---
    const handleSubmit = async () => {
        if (selectedIngredients.length === 0) {
            alert("Please add at least one ingredient!");
            return;
        }

        const recipeData = {
            title,
            description,
            instructions: description,
            categoryId: selectedCategories.length > 0 ? selectedCategories[0].id : null,
            ingredients: selectedIngredients.map(i => ({
                ingredientId: i.id,
                amountInGrams: parseFloat(i.amountInGrams)
            }))
        };

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Oturum süreniz dolmuş.");
                navigate('/login');
                return;
            }

            const res = await fetch(`${API_BASE_URL}/api/recipes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(recipeData)
            });

            if (res.ok) {
                navigate('/dashboard');
            } else {
                const errText = await res.text();
                alert("Hata oluştu: " + errText);
            }
        } catch (err) {
            console.error("Submit error:", err);
            alert("Sunucu hatası.");
        }
    };

    return (
        <div className="dashboard-container"> {/* Arka plan rengi için aynı class'ı kullandık */}

            {/* --- OVERLAY --- */}
            {(isSidebarOpen || isNotifOpen) && <div className="overlay" onClick={closeAll}></div>}

            {/* --- SOL SIDEBAR (MENÜ) --- */}
            <div className={`sidebar-menu ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <span>Menu</span>
                    <button className="close-btn" onClick={closeAll}>&times;</button>
                </div>
                <ul className="sidebar-links">
                    <li onClick={() => navigate('/dashboard')}>🏠 Dashboard</li>
                    <li onClick={() => navigate('/create-recipe')} style={{color:'var(--chef-orange)'}}>🍳 Create Recipe</li>
                    <li onClick={() => navigate('/favorites')}>❤️ Favorites</li>
                    <li onClick={() => navigate('/profile')}>👤 My Profile</li>
                    <li className="logout-item" onClick={handleLogout}>🚪 Logout</li>
                </ul>
            </div>

            {/* --- SAĞ SIDEBAR (BİLDİRİMLER) --- */}
            <div className={`notification-sidebar ${isNotifOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <span>Notifications</span>
                    <button className="close-btn" onClick={closeAll}>&times;</button>
                </div>
                <div className="notif-content">
                    <div className="empty-notif">
                        <span style={{fontSize: '2rem'}}>🎉</span>
                        <p>Ready to cook something new?</p>
                    </div>
                </div>
            </div>

            {/* --- NAVBAR (DÜZELTİLDİ: Logo Ortada) --- */}
            <nav className="top-navbar">
                <div className="nav-left">
                    <button className="icon-btn" onClick={toggleSidebar}>☰</button>
                </div>
                <div className="nav-center">
                    <div className="brand-logo-large" onClick={() => navigate('/dashboard')} style={{cursor:'pointer'}}>
                        <span className="macro">Macro</span><span className="chef">Chef</span>
                    </div>
                </div>
                <div className="nav-right">
                    <button className="icon-btn" onClick={toggleNotif}>🔔</button>
                </div>
            </nav>

            {/* --- ANA İÇERİK ALANI --- */}
            <div className="main-content-area" style={{paddingTop: '100px'}}>

                {/* --- CREATE RECIPE KARTI (SARI RENK KALDIRILDI ✅) --- */}
                <div className="create-recipe-card">

                    {/* Header */}
                    <div className="cr-header">
                        <button className="back-btn-modern" onClick={() => navigate(-1)}>
                            <span>←</span> Back
                        </button>
                        <h2>Create New Recipe</h2>
                    </div>

                    {/* 1. Başlık */}
                    <label className="cr-label">Recipe Title</label>
                    <input
                        type="text"
                        className="modern-input"
                        placeholder="e.g. Avocado Toast with Eggs"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    {/* 2. Kategori */}
                    <label className="cr-label">Category</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="modern-input"
                            placeholder="Search category (e.g. Breakfast)..."
                            value={catSearchTerm}
                            onChange={(e) => handleCategorySearch(e.target.value)}
                        />
                        {catSearchResults.length > 0 && (
                            <div className="search-results-dropdown">
                                {catSearchResults.map(cat => (
                                    <div key={cat.id} className="search-item" onClick={() => addCategory(cat)}>
                                        {cat.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Seçili Kategoriler */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {selectedCategories.map(cat => (
                            <span key={cat.id} className="category-tag-pill">
                                {cat.name}
                                <span onClick={() => removeCategory(cat.id)}>×</span>
                            </span>
                        ))}
                    </div>

                    {/* 3. Açıklama */}
                    <label className="cr-label">Description (Steps)</label>
                    <textarea
                        className="modern-textarea"
                        rows="5"
                        placeholder="How to cook it..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>

                    {/* 4. Malzeme Ekleme */}
                    <label className="cr-label">Add Ingredients</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="modern-input"
                            placeholder="Search: Chicken, Egg..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        {searchResults.length > 0 && (
                            <div className="search-results-dropdown">
                                {searchResults.map((ing) => (
                                    <div key={ing.id} className="search-item" onClick={() => addIngredient(ing)}>
                                        {ing.name} ({ing.calories || ing.calories100g} kcal/100g)
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Eklenen Malzemeler Listesi */}
                    <div style={{ marginTop: '20px' }}>
                        {selectedIngredients.map((item, index) => (
                            <div key={index} className="ing-item-card">
                                <div>
                                    <strong>{item.name}</strong>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b', marginLeft: '10px' }}>
                                        ({item.calories || item.calories100g} kcal/100g)
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="number"
                                        style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                                        value={item.amountInGrams}
                                        onChange={(e) => updateAmount(index, e.target.value)}
                                    />
                                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>g</span>
                                    <button
                                        onClick={() => removeIngredient(index)}
                                        style={{
                                            background: '#fee2e2', color: '#ef4444', border: 'none',
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FOOTER */}
                    <div className="form-footer">
                        <div className="total-cal-display">
                            <span className="total-cal-label">Total Calories</span>
                            <div className="total-cal-value">
                                {totalCal.toFixed(0)} <span>KCAL</span>
                            </div>
                        </div>


                        <button type="button" className="submit-btn-large" onClick={handleSubmit}>
                            Share Recipe →
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CreateRecipe;