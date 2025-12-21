import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Sayfalar
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import CreateRecipe from './pages/CreateRecipe.jsx';
import Favorites from './pages/Favorites.jsx';


// KORUMA KALKANI
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* --- HERKESE AÇIK --- */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* --- KORUMALI SAYFALAR --- */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />

                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />

                <Route path="/create-recipe" element={
                    <ProtectedRoute>
                        <CreateRecipe />
                    </ProtectedRoute>
                } />

                <Route path="/favorites" element={
                    <ProtectedRoute>
                        <Favorites />
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;