import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

// API URL'ini dinamik olarak tanımlıyoruz (Vercel değişkeni varsa onu, yoksa localhost'u kullanır)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const CreateRecipe = () => {
    const navigate = useNavigate();
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


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // LOCALHOST yerine API_BASE_URL kullanıyoruz
                const res = await fetch(`${API_BASE_URL}/api/categories`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log("Kategoriler yüklendi:", data);
                    setAllCategories(Array.isArray(data) ? data : []);
                } else {
                    console.error("Kategori servisi hata verdi:", res.status);
                }
            } catch (err) {
                console.error("Bağlantı hatası: Kategoriler çekilemedi", err);
            }
        };
        fetchCategories();
    }, []);

    // --- KATEGORİ MANTIĞI ---
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

    // --- MALZEME MANTIĞI ---
    const handleSearch = async (val) => {
        setSearchTerm(val);
        if (val.trim().length > 1) {
            try {
                // LOCALHOST yerine API_BASE_URL kullanıyoruz
                const res = await fetch(`${API_BASE_URL}/ingredients/search?name=${val}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) setSearchResults(await res.json());
            } catch (err) { console.error(err); }
        } else { setSearchResults([]); }
    };

    const addIngredient = (ing) => {
        if (!selectedIngredients.find(i => i.id === ing.id)) {
            setSelectedIngredients([...selectedIngredients, { ...ing, amountInGrams: 100 }]);
        }
        setSearchTerm('');
        setSearchResults([]);
    };

    const totalCal = selectedIngredients.reduce((acc, curr) =>
        acc + (curr.calories100g * curr.amountInGrams / 100), 0);

    // --- KAYDETME MANTIĞI ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedIngredients.length === 0) {
            alert("Lütfen en az bir malzeme ekleyin!");
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
            // LOCALHOST yerine API_BASE_URL kullanıyoruz
            const res = await fetch(`${API_BASE_URL}/api/recipes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(recipeData)
            });
            if (res.ok) {
                navigate('/');
            } else {
                const errorText = await res.text();
                alert("Tarif kaydedilirken bir hata oluştu: " + errorText);
            }
        } catch (err) {
            console.error("Submit error:", err);
        }
    };

    return (
        <div className="profile-wrapper">
            <nav className="top-navbar">
                <button className="white-back-btn" onClick={() => navigate(-1)}>⬅️</button>
                <div className="brand-logo-large"><span className="macro">Macro</span><span className="chef">Chef</span></div>
                <div style={{width: '45px'}}></div>
            </nav>

            <main className="profile-main-container">
                <form className="profile-master-card" onSubmit={handleSubmit} style={{backgroundColor: '#fff', color: '#333'}}>

                    <div className="form-group">
                        <label>Recipe Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. High Protein Omelette" required />
                    </div>

                    <div className="form-group" style={{position: 'relative'}}>
                        <label>Category Tags</label>
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px'}}>
                            {selectedCategories.map(cat => (
                                <div key={cat.id} className="category-bubble" style={{backgroundColor: '#ff851b', color: 'white', padding: '5px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', fontSize: '14px'}}>
                                    {cat.name} <span onClick={() => removeCategory(cat.id)} style={{cursor:'pointer', marginLeft:'8px', fontWeight: 'bold'}}>×</span>
                                </div>
                            ))}
                        </div>
                        <input type="text" placeholder="Search categories..." value={catSearchTerm} onChange={(e) => handleCategorySearch(e.target.value)} />
                        {catSearchResults.length > 0 && (
                            <div className="search-results-dropdown" style={{position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}}>
                                {catSearchResults.map(cat => (
                                    <div key={cat.id} className="search-item" onClick={() => addCategory(cat)} style={{padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee'}}>
                                        {cat.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Description (Steps)</label>
                        <textarea rows="5" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="How to cook it..." required style={{backgroundColor: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: '8px', padding: '10px'}} />
                    </div>

                    <div className="form-group" style={{position: 'relative'}}>
                        <label>Add Ingredients</label>
                        <input type="text" value={searchTerm} onChange={(e) => handleSearch(e.target.value)} placeholder="Search: Chicken, Egg..." />
                        {searchResults.length > 0 && (
                            <div className="search-results-dropdown" style={{position: 'absolute', zIndex: 10, width: '100%', background: 'white', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}}>
                                {searchResults.map(ing => (
                                    <div key={ing.id} className="search-item" onClick={() => addIngredient(ing)} style={{padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee'}}>
                                        {ing.name} ({ing.calories100g} kcal)
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="selected-ingredients-list">
                        {selectedIngredients.map((ing, idx) => (
                            <div key={idx} className="ing-item-card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '10px', borderRadius: '10px', marginBottom: '8px', border: '1px solid #eee'}}>
                                <span style={{fontWeight: 'bold'}}>{ing.name}</span>
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <input
                                        type="number"
                                        style={{width: '60px', padding: '5px', borderRadius: '5px', border: '1px solid #ccc'}}
                                        value={ing.amountInGrams}
                                        onChange={(e) => {
                                            const newIngs = [...selectedIngredients];
                                            newIngs[idx].amountInGrams = e.target.value;
                                            setSelectedIngredients(newIngs);
                                        }}
                                    />
                                    <span>g</span>
                                    <button type="button" onClick={() => setSelectedIngredients(selectedIngredients.filter((_, i) => i !== idx))} style={{background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem'}}>×</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="total-kcal-banner" style={{textAlign: 'center', padding: '15px', background: '#fdf2e9', borderRadius: '12px', marginTop: '20px', border: '1px solid #ff851b'}}>
                        <span style={{fontSize: '1.2rem', fontWeight: '800', color: '#ff851b'}}>{totalCal.toFixed(0)} TOTAL KCAL</span>
                    </div>

                    <button type="submit" className="auth-button" style={{marginTop: '20px'}} disabled={selectedIngredients.length === 0}>
                        Share Recipe
                    </button>
                </form>
            </main>
        </div>
    );
};

export default CreateRecipe;