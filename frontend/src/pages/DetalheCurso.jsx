// frontend/src/pages/DetalheCurso.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = "https://api-catalogo-filipe.onrender.com";
const SEU_NUMERO_WHATSAPP = "5561982915935";

export default function DetalheCurso() {
  // Pega o "id" da URL (ex: /curso/42)
  const { id } = useParams(); 
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efeito para buscar os dados do curso específico na API
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/curso/${id}`)
      .then(res => {
        setCurso(res.data);
        setError(null);
      })
      .catch(err => {
        console.error("Erro ao buscar detalhe do curso:", err);
        setError("Curso não encontrado.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]); // Roda de novo se o ID na URL mudar

  // --- Define o link do WhatsApp ---
  const getLinkWhatsApp = () => {
    if (!curso) return "#";
    const textoWhatsApp = encodeURIComponent(
      `Olá, tenho interesse no curso *${curso.Nome}* da *${curso.Instituição}*. Poderia me passar mais informações?`
    );
    return `https://api.whatsapp.com/send?phone=${SEU_NUMERO_WHATSAPP}&text=${textoWhatsApp}`;
  };

  // --- Renderização ---

  if (loading) {
    return <div className="container" id="loading">Carregando detalhes do curso...</div>;
  }

  if (error) {
    return <div className="container"><p>{error}</p></div>;
  }

  if (!curso) {
    return <div className="container"><p>Curso não encontrado.</p></div>;
  }

  // Se deu tudo certo, mostra o card de detalhe
  return (
    <div className="container" style={{ marginTop: '30px' }}>
      {/* Link para voltar para a home */}
      <Link to="/" style={{ textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
        &larr; Voltar para a busca
      </Link>

      <div className="curso-card">
        <h3>{curso.Nome}</h3>
        <p><strong>ID do Curso:</strong> {curso.id}</p>
        <p><strong>Instituição:</strong> {curso.Instituição}</p>
        <p><strong>Categoria:</strong> {curso.Categoria} {curso.Subcategoria ? `(${curso.Subcategoria})` : ''}</p>
        <p><strong>Duração:</strong> {curso.Duração}</p>
        <p><strong>Requisitos:</strong> {curso.Requisitos}</p>
        <p><strong>Área de Atuação:</strong> {curso.empregabilidade_area || "Não informado"}</p>

        <p className="argumento">{curso.argumento_venda || 'Consulte mais informações.'}</p>

        <a href={getLinkWhatsApp()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
          Iniciar Venda (WhatsApp)
        </a>
      </div>
    </div>
  );
}