import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from "./shared/components/Layout/MainLayout.jsx";
import Homepage from "./features/Homepage/views/Homepage.jsx";
import DetailPage from "./features/Detailpage/views/Detailpage.jsx";
import { AuthProvider } from "./app/context/authcontext/AuthContext.jsx";
import FavoritesPage from "./features/Favoritemoviepage/views/Favoritepage.jsx";

function App() {
  return (
    <AuthProvider>
      <Router basename="/MovieApp_-">
        <Routes>
          {/* public route */}
          <Route path="/" element={<MainLayout children={<Homepage />} />} />
          {/* private route */}
          <Route path="/Movie/:id" element={
            <MainLayout children={<DetailPage />} />
          } />
          <Route path="/favorites" element={
            <MainLayout children={<FavoritesPage />} />
          } />
          {/* error route */}

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

