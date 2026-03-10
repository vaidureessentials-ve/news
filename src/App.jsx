import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ArticlePage from './pages/ArticlePage';
import Stocks from './pages/Stocks';
import CategoryPage from './pages/CategoryPage';
import LatestNews from './pages/LatestNews';
import Data from './pages/Data';
import USData from './pages/USData';
import EuroData from './pages/EuroData';
import ChatbotWidget from './components/ChatbotWidget';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/latest" element={<LatestNews />} />
          <Route path="/news/:id" element={<ArticlePage />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/tech" element={<CategoryPage category="Tech" />} />
          <Route path="/business" element={<CategoryPage category="Business" />} />
          <Route path="/economy" element={<CategoryPage category="Economy" />} />
          <Route path="/geopolitics" element={<CategoryPage category="Geopolitical" />} />
          <Route path="/data" element={<Data />} />
          <Route path="/data/us" element={<USData />} />
          <Route path="/data/euro" element={<EuroData />} />
        </Routes>
        <ChatbotWidget />
      </div>
    </Router>
  );
}

export default App;
