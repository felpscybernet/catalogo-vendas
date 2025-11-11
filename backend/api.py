# Nome do arquivo: api.py
# (Código v3.0 - Lendo v3.0 JSON, com Paginação e Busca por ID)

import json
import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

# --- Configuração ---
# ***** MUDANÇA IMPORTANTE *****
# Agora lê o novo arquivo v3.0 com IDs
CATALOGO_FILE = 'Catalogo_Mestre_Vendas_v3.0.json'
db_cursos = []

# --- Carregar o Banco de Dados (JSON) na Memória ---
try:
    with open(CATALOGO_FILE, 'r', encoding='utf-8') as f:
        db_cursos = json.load(f)
    print(f"Sucesso: Catálogo v3.0 carregado com {len(db_cursos)} cursos.")
except FileNotFoundError:
    print(f"ERRO FATAL: Arquivo '{CATALOGO_FILE}' não encontrado.")
    print("Por favor, rode o script 'upgrade_json.py' primeiro.")
except Exception as e:
    print(f"Erro ao carregar ou processar o JSON: {e}")

# --- Inicializar a Aplicação FastAPI ---
app = FastAPI(
    title="API Catálogo de Cursos v3.0",
    description="API para consultar cursos (com Paginação e IDs)."
)

# --- Configurar CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints da API ---

@app.get("/")
def read_root():
    return {"status": "online", "cursos_carregados": len(db_cursos)}

# --- ENDPOINT DE BUSCA (AGORA COM PAGINAÇÃO) ---
@app.get("/cursos/", summary="Busca cursos com filtros e paginação")
def buscar_cursos(
    termo: Optional[str] = None,
    categoria: Optional[str] = None,
    instituicao: Optional[str] = None,
    page: int = Query(1, ge=1, description="Número da página"),
    limit: int = Query(10, ge=1, le=100, description="Cursos por página")
):
    """
    Busca cursos no catálogo.
    - **page**: Número da página (começa em 1).
    - **limit**: Quantidade de resultados por página (padrão: 10).
    """
    
    resultados_filtrados = db_cursos

    if termo:
        termo_low = termo.lower()
        resultados_filtrados = [
            c for c in resultados_filtrados 
            if termo_low in c.get('Nome', '').lower()
        ]

    if categoria:
        resultados_filtrados = [
            c for c in resultados_filtrados
            if c.get('Categoria', '') == categoria
        ]
    
    if instituicao:
        resultados_filtrados = [
            c for c in resultados_filtrados
            if c.get('Instituição', '') == instituicao
        ]
    
    # Lógica da Paginação
    total_cursos = len(resultados_filtrados)
    inicio = (page - 1) * limit
    fim = inicio + limit
    
    cursos_paginados = resultados_filtrados[inicio:fim]
    
    return {
        "total_cursos": total_cursos,
        "total_paginas": (total_cursos + limit - 1) // limit, # Calcula o teto
        "pagina_atual": page,
        "limite_por_pagina": limit,
        "cursos": cursos_paginados
    }

# --- NOVO ENDPOINT (SUGESTÃO DO CHATGPT) ---
@app.get("/curso/{id_curso}", summary="Busca um curso pelo seu ID único")
def get_curso_por_id(id_curso: int):
    """
    Retorna os detalhes de um único curso pelo seu ID.
    """
    for curso in db_cursos:
        if curso.get('id') == id_curso:
            return curso
    
    # Se o loop terminar e não achar, retorna erro 404
    raise HTTPException(status_code=404, detail="Curso não encontrado")


# --- ENDPOINTS DE FILTRO (SEM MUDANÇAS) ---
@app.get("/categorias/", summary="Lista todas as categorias únicas", response_model=List[str])
def get_categorias():
    categorias = sorted(list(set(c.get('Categoria', 'N/A') for c in db_cursos)))
    return categorias

@app.get("/instituicoes/", summary="Lista todas as instituições únicas", response_model=List[str])
def get_instituicoes():
    instituicoes = sorted(list(set(c.get('Instituição', 'N/A') for c in db_cursos)))
    return instituicoes

@app.get("/cursos/nomes/", summary="Lista todos os nomes únicos de cursos", response_model=List[str])
def get_nomes_cursos():
    nomes = sorted(list(set(c.get('Nome', 'N/A') for c in db_cursos if c.get('Nome'))))
    return nomes

# --- Executar o Servidor (Pronto para Produção) ---
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    
    print(f"Iniciando servidor API v3.0 no host 0.0.0.0 e porta {port}")
    print(f"Acesse a documentação (Swagger) em: http://127.0.0.1:{port}/docs")
    
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )