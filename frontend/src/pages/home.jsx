// frontend/src/pages/Home.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Importa o Link

// --- Constantes ---
const API_URL = "https://api-catalogo-filipe.onrender.com";
const SEU_NUMERO_WHATSAPP = "5561982915935";

// --- Componente: Card do Curso (agora com Link) ---
function CardCurso({ curso }) {
  const textoWhatsApp = encodeURIComponent(
    `Olá, tenho interesse no curso *${curso.Nome}* da *${curso.Instituição}*. Poderia me passar mais informações?`
  );
  const linkWhatsApp = `https://api.whatsapp.com/send?phone=${SEU_NUMERO_WHATSAPP}&text=${textoWhatsApp}`;

  return (
    <div className="curso-card" data-id={curso.id}>
      {/* O TÍTULO AGORA É UM LINK PARA A PÁGINA DE DETALHES */}
      <Link to={`/curso/${curso.id}`} style={{ textDecoration: 'none' }}>
        <h3>{curso.Nome}</h3>
      </Link>

      <p><strong>Instituição:</strong> {curso.Instituição}</p>
      <p><strong>Categoria:</strong> {curso.Categoria} {curso.Subcategoria ? `(${curso.Subcategoria})` : ''}</p>
      <p><strong>Duração:</strong> {curso.Duração}</p>
      <p><strong>Requisitos:</strong> {curso.Requisitos}</p>
      <p className="argumento">{curso.argumento_venda || 'Consulte mais informações.'}</p>
      <a href={linkWhatsApp} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
        Iniciar Venda (WhatsApp)
      </a>
    </div>
  );
}

// --- Componente: Buscador (Filtros e Autocomplete) ---
function Buscador({ onBuscar, setFiltros, filtros }) {
  const [listaNomesCursos, setListaNomesCursos] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [termo, setTermo] = useState("");

  const [instituicoes, setInstituicoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_URL}/instituicoes/`).then(res => setInstituicoes(res.data));
    axios.get(`${API_URL}/categorias/`).then(res => setCategorias(res.data));
    axios.get(`${API_URL}/cursos/nomes/`).then(res => setListaNomesCursos(res.data));
  }, []);

  const onTermoChange = (e) => {
    const valor = e.target.value;
    setTermo(valor);
    if (valor.length > 0) {
      const sugestoesFiltradas = listaNomesCursos.filter(nome =>
        nome.toLowerCase().includes(valor.toLowerCase())
      );
      setSugestoes(sugestoesFiltradas.slice(0, 10));
    } else {
      setSugestoes([]);
    }
  };

  const onSugestaoClick = (nome) => {
    setTermo(nome);
    setSugestoes([]);
    onBuscar(1, { ...filtros, termo: nome });
  };

  useEffect(() => {
    function handleClickFora(event) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setSugestoes([]);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const handleBuscarClick = () => {
    onBuscar(1, {
      termo: termo,
      instituicao: filtros.instituicao,
      categoria: filtros.categoria
    });
  };

  return (
    <div className="filtros">
      <div className="filtro-item" style={{ gridColumn: '1 / -1' }} ref={autocompleteRef}>
        <label htmlFor="filtro-termo">Buscar por nome:</label>
        <input
          type="text"
          id="filtro-termo"
          placeholder="Digite o nome do curso..."
          value={termo}
          onChange={onTermoChange}
          autoComplete="off"
        />
        {sugestoes.length > 0 && (
          <div id="autocomplete-list">
            {sugestoes.map((nome, index) => (
              <div key={index} className="autocomplete-item" onClick={() => onSugestaoClick(nome)}>
                {nome.split(new RegExp(`(${termo})`, 'gi')).map((part, i) =>
                  part.toLowerCase() === termo.toLowerCase() ? <strong key={i}>{part}</strong> : part
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="filtro-item">
        <label htmlFor="filtro-instituicao">Instituição:</label>
        <select id="filtro-instituicao" value={filtros.instituicao} onChange={(e) => setFiltros({ ...filtros, instituicao: e.target.value })}>
          <option value="">-- Todas --</option>
          {instituicoes.map(inst => <option key={inst} value={inst}>{inst}</option>)}
        </select>
      </div>
      <div className="filtro-item">
        <label htmlFor="filtro-categoria">Categoria:</label>
        <select id="filtro-categoria" value={filtros.categoria} onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}>
          <option value="">-- Todas --</option>
          {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      <button id="btn-buscar" onClick={handleBuscarClick}>Buscar</button>
    </div>
  );
}

// --- Componente: Paginação ---
function Paginacao({ paginaAtual, totalPaginas, onMudarPagina }) {
  if (totalPaginas <= 1) return null;
  return (
    <div id="paginacao">
      <button id="btn-anterior" disabled={paginaAtual === 1} onClick={() => onMudarPagina(paginaAtual - 1)}>
        Anterior
      </button>
      <span id="info-pagina">Página {paginaAtual} de {totalPaginas}</span>
      <button id="btn-proxima" disabled={paginaAtual === totalPaginas} onClick={() => onMudarPagina(paginaAtual + 1)}>
        Próxima
      </button>
    </div>
  );
}

// --- Página Home (Componente Principal) ---
export default function Home() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCursos, setTotalCursos] = useState(0);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtros, setFiltros] = useState({
    termo: "",
    instituicao: "",
    categoria: ""
  });

  const buscarCursos = (page = 1, filtrosAtuais = filtros) => {
    setLoading(true);
    setPaginaAtual(page);

    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', 10);
    if (filtrosAtuais.termo) params.append('termo', filtrosAtuais.termo);
    if (filtrosAtuais.instituicao) params.append('instituicao', filtrosAtuais.instituicao);
    if (filtrosAtuais.categoria) params.append('categoria', filtrosAtuais.categoria);

    axios.get(`${API_URL}/cursos/?${params.toString()}`)
      .then(res => {
        const data = res.data;
        setCursos(data.cursos);
        setTotalCursos(data.total_cursos);
        setTotalPaginas(data.total_paginas);
      })
      .catch(err => console.error("Erro ao buscar cursos:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    buscarCursos(1, filtros); 
  }, []); 

  return (
    <div className="container">
      <Buscador 
        onBuscar={buscarCursos} 
        setFiltros={setFiltros}
        filtros={filtros}
      />
      <div id="total-resultados">
        {loading ? '' : `${totalCursos} curso(s) encontrado(s).`}
      </div>
      {loading ? (
        <div id="loading">Carregando...</div>
      ) : (
        <div id="resultados-container">
          {cursos.length === 0 && <p>Nenhum curso encontrado com esses filtros.</p>}
          {cursos.map(curso => (
            <CardCurso key={curso.id} curso={curso} />
          ))}
        </div>
      )}
      {!loading && (
        <Paginacao 
          paginaAtual={paginaAtual} 
          totalPaginas={totalPaginas}
          onMudarPagina={buscarCursos}
        />
      )}
    </div>
  );
}