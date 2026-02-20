import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ArticlePage from './pages/ArticlePage';
import Stocks from './pages/Stocks';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news/:id" element={<ArticlePage />} />
          <Route path="/stocks" element={<Stocks />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
