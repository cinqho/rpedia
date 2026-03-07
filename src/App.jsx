import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react';

import Sidebar from './components/Sidebar.jsx'
import PageWrapper from './components/PageWrapper.jsx'

import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import AddCharacter from './pages/AddCharacter.jsx'
import Characters from './pages/Characters.jsx'
import Ranking from './pages/Ranking.jsx'
import Pack from './pages/Pack.jsx'
import Deck from './pages/Deck.jsx'
import Admin from './pages/Admin.jsx'
import Owner from './pages/Owner.jsx'
import Equilibrage from './pages/Equilibrage.jsx'

function App() {
  return (
    <BrowserRouter>
      <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
        <Sidebar />

        <Routes>
          <Route path="/" element={<PageWrapper scroll={false}><Home /></PageWrapper>} />
          <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
          <Route path="/add-character" element={<PageWrapper><AddCharacter /></PageWrapper>} />
          <Route path="/characters" element={<PageWrapper><Characters /></PageWrapper>} />
          <Route path="/ranking" element={<PageWrapper><Ranking /></PageWrapper>} />
          <Route path="/pack" element={<PageWrapper><Pack /></PageWrapper>} />
          <Route path="/deck" element={<PageWrapper><Deck /></PageWrapper>} />
          <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
          <Route path="/owner" element={<PageWrapper><Owner /></PageWrapper>} />
          <Route path="/equilibrage" element={<PageWrapper><Equilibrage /></PageWrapper>} />
        </Routes>

        <Analytics />
      </div>
    </BrowserRouter>
  )
}

export default App