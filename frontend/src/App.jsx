// frontend/src/App.jsx
// Versão React v1.0 - Migrado do index.html (v6.0)

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Importa o Axios

// --- URL da API no Render ---
const API_URL = "https://api-catalogo-filipe.onrender.com";
// --- Seu número de WhatsApp (TROQUE AQUI SE PRECISAR) ---
const SEU_NUMERO_WHATSAPP = "5561982915935";

// --- Componente: Cabeçalho (Hero) ---
function Hero() {
  return (
    <section className="hero">
      <h1>Qualifica Cursos EAD</h1>
      <h2>De "quebra-galho" a <strong>referência na equipe</strong>.</h2>
      <p>
        Invista em você e conquiste <strong>mais oportunidades, mais respeito e mais renda</strong>.
        Encontre abaixo seu curso técnico, graduação ou pós-graduação 100% EAD e com <strong>diploma reconhecido pelo MEC/SISTEC</strong>.
      </p>
    </section>
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

  // Efeito para carregar os filtros (instituições, categorias, nomes)
  useEffect(() => {
    // Carrega instituições
    axios.get(`${API_URL}/instituicoes/`)
      .then(res => setInstituicoes(res.data))
      .catch(err => console.error("Erro ao buscar instituições:", err));

    // Carrega categorias
    axios.get(`${API_URL}/categorias/`)
      .then(res => setCategorias(res.data))
      .catch(err => console.error("Erro ao buscar categorias:", err));

    // Carrega nomes para autocomplete
    axios.get(`${API_URL}/cursos/nomes/`)
      .then(res => setListaNomesCursos(res.data))
      .catch(err => console.error("Erro ao buscar nomes:", err));
  }, []);

  // Lógica do Autocomplete
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
    onBuscar(1, { ...filtros, termo: nome }); // Busca ao clicar
  };

  // Fecha o autocomplete se clicar fora
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
    // Passa os filtros atuais (termo, inst, cat) para o App.jsx
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
              <div
                key={index}
                className="autocomplete-item"
                onClick={() => onSugestaoClick(nome)}
              >
                {/* Lógica para destacar o texto digitado (opcional, mas legal) */}
                {nome.split(new RegExp(`(${termo})`, 'gi')).map((part, i) =>
                  part.toLowerCase() === termo.toLowerCase() ? (
                    <strong key={i}>{part}</strong>
                  ) : (
                    part
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="filtro-item">
        <label htmlFor="filtro-instituicao">Instituição:</label>
        <select 
          id="filtro-instituicao" 
          value={filtros.instituicao} 
          onChange={(e) => setFiltros({ ...filtros, instituicao: e.target.value })}
        >
          <option value="">-- Todas --</option>
          {instituicoes.map(inst => <option key={inst} value={inst}>{inst}</option>)}
        </select>
      </div>

      <div className="filtro-item">
        <label htmlFor="filtro-categoria">Categoria:</label>
        <select 
          id="filtro-categoria"
          value={filtros.categoria}
          onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
        >
          <option value="">-- Todas --</option>
          {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <button id="btn-buscar" onClick={handleBuscarClick}>Buscar</button>
    </div>
  );
}

// --- Componente: Card do Curso (individual) ---
function CardCurso({ curso }) {
  const textoWhatsApp = encodeURIComponent(
    `Olá, tenho interesse no curso *${curso.Nome}* da *${curso.Instituição}*. Poderia me passar mais informações?`
  );
  const linkWhatsApp = `https://api.whatsapp.com/send?phone=${SEU_NUMERO_WHATSAPP}&text=${textoWhatsApp}`;

  return (
    <div className="curso-card" data-id={curso.id}>
      <h3>{curso.Nome}</h3>
      <p><strong>Instituição:</strong> {curso.Instituição}</p>
      <p><strong>Categoria:</strong> {curso.Categoria} {curso.Subcategoria ? `(${curso.Subcategoria})` : ''}</p>
      <p><strong>Duração:</strong> {curso.Duração}</p>
      <p><strong>Requisitos:</strong> {curso.Requisitos}</p>
      {/* Usa o novo nome do campo 'argumento_venda' */}
      <p className="argumento">{curso.argumento_venda || 'Consulte mais informações.'}</p>
      <a href={linkWhatsApp} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
        Iniciar Venda (WhatsApp)
      </a>
    </div>
  );
}

// --- Componente: Paginação ---
function Paginacao({ paginaAtual, totalPaginas, onMudarPagina }) {
  if (totalPaginas <= 1) return null; // Não mostra paginação se só tem 1 página

  return (
    <div id="paginacao">
      <button 
        id="btn-anterior" 
        disabled={paginaAtual === 1}
        onClick={() => onMudarPagina(paginaAtual - 1)}
      >
        Anterior
      </button>
      <span id="info-pagina">Página {paginaAtual} de {totalPaginas}</span>
      <button 
        id="btn-proxima"
        disabled={paginaAtual === totalPaginas}
        onClick={() => onMudarPagina(paginaAtual + 1)}
      >
        Próxima
      </button>
    </div>
  );
}

// --- Componente: Seção de Benefícios (Features) ---
function Features() {
  return (
    <section className="features">
      <div className="feature-item">
        <h3>🎓 Certificação Garantida</h3>
        <p>Todos os cursos, do técnico à pós-graduação, são reconhecidos pelo MEC e registrados no SISTEC. Seu diploma tem validade em todo o território nacional.</p>
      </div>
      <div className="feature-item">
        <h3>💻 Flexibilidade Total (100% EAD)</h3>
        <p>Estude no seu ritmo. Nossa plataforma é 100% EAD com vídeo-aulas curtas, material para baixar e tutores no chat para tirar suas dúvidas.</p>
      </div>
      <div className="feature-item">
        <h3>🚀 Foco na Sua Carreira</h3>
        <p>Não deixe o estágio ser um empecilho. Nossos parceiros oferecem alternativas para você concluir seu curso. Foco na conclusão rápida e entrada no mercado.</p>
      </div>
    </section>
  );
}

// --- Componente: Barra de Confiança (Parceiros) ---
function TrustBar() {
  return (
    <section className="trust-bar">
      <h4>Instituições Parceiras Credenciadas</h4>
      <div className="parceiros">
        UNICORP | Metha Educação | UNIFTB | UNIFEMM
      </div>
    </section>
  );
}

// --- Componente: Rodapé ---
function Footer() {
  return (
    <footer>
      <p>© 2025 Qualifica Cursos - Todos os direitos reservados.</p>
      <p>Desenvolvido como ferramenta de consultoria de vendas.</p>
    </footer>
  );
}

// --- Componente Principal: App ---
function App() {
  // --- Estados do App ---
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

  // --- Função Principal de Busca ---
  const buscarCursos = (page = 1, filtrosAtuais = filtros) => {
    setLoading(true);
    setPaginaAtual(page);

    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', 10); // Busca de 10 em 10

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
      .catch(err => {
        console.error("Erro ao buscar cursos:", err);
        // Aqui você pode setar um estado de erro
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Efeito para buscar na primeira vez que a página carrega
  useEffect(() => {
    buscarCursos(1, filtros); // Busca página 1 na inicialização
  }, []); // Array vazio [] significa "só rode uma vez"

  return (
    <> {/* Fragmento: um "container" invisível */}
      <Hero />

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

      <Features />
      <TrustBar />
      <Footer />
    </>
  );
}

export default App;