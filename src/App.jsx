import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ArticlePage from './pages/ArticlePage';
import Stocks from './pages/Stocks';
import CategoryPage from './pages/CategoryPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news/:id" element={<ArticlePage />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/tech" element={<CategoryPage category="Tech" />} />
          <Route path="/business" element={<CategoryPage category="Business" />} />
          <Route path="/economy" element={<CategoryPage category="Economy" />} />
          <Route path="/geopolitics" element={<CategoryPage category="Geopolitics" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
