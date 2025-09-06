import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from "./shared/components/Layout/MainLayout.jsx";
import Homepage from "./features/Homepage/views/Homepage.jsx";
import DetailPage from "./features/Detailpage/views/Detailpage.jsx";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout children={<Homepage />} />} />
        <Route path="/movie/:id" element={<MainLayout children={<DetailPage />} />} />
      </Routes>
    </Router>
  );
}

export default App;

