// frontend/src/App.jsx

import { Routes, Route } from 'react-router-dom';

// Importa os componentes e páginas
import Hero from './components/Hero';
import Features from './components/Features';
import TrustBar from './components/TrustBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import DetalheCurso from './pages/DetalheCurso';

// Layout principal (para não repetir o Header/Footer em toda página)
function Layout({ children }) {
  return (
    <>
      <Hero />
      <main>{children}</main> {/* O conteúdo da página (Home ou Detalhe) entra aqui */}
      <Features />
      <TrustBar />
      <Footer />
    </>
  )
}

function App() {
  return (
    <Routes>
      {/* Rota 1: A Página Principal (/) */}
      <Route path="/" element={
        <Layout>
          <Home />
        </Layout>
      } />

      {/* Rota 2: A Página de Detalhes (/curso/:id) */}
      <Route path="/curso/:id" element={
        <Layout>
          <DetalheCurso />
        </Layout>
      } />

      {/* Você pode adicionar uma Rota 404 (Não Encontrado) aqui se quiser */}

    </Routes>
  )
}

export default App