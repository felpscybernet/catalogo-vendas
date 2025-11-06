# Nome do arquivo: api.py
# (Código v2.0 com o novo endpoint /cursos/nomes/)

import json
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

# --- Configuração ---
CATALOGO_FILE = 'Catalogo_Mestre_Vendas_v2.0.json'
db_cursos = []

# --- Carregar o Banco de Dados (JSON) na Memória ---
try:
    with open(CATALOGO_FILE, 'r', encoding='utf-8') as f:
        db_cursos = json.load(f)
    print(f"Sucesso: Catálogo carregado com {len(db_cursos)} cursos.")
except FileNotFoundError:
    print(f"ERRO FATAL: Arquivo '{CATALOGO_FILE}' não encontrado.")
    print("Por favor, certifique-se de que o JSON está na mesma pasta da api.py")
except Exception as e:
    print(f"Erro ao carregar ou processar o JSON: {e}")

# --- Inicializar a Aplicação FastAPI ---
app = FastAPI(
    title="API Catálogo de Cursos",
    description="API para consultar cursos da UNICORP e Metha."
)

# --- Configurar CORS (IMPORTANTE!) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos
    allow_headers=["*"],  # Permite todos os cabeçalhos
)

# --- Endpoints da API ---

@app.get("/")
def read_root():
    """Endpoint raiz - Verifica se a API está online."""
    return {"status": "online", "cursos_carregados": len(db_cursos)}

@app.get("/cursos/", summary="Busca cursos com filtros")
def buscar_cursos(
    termo: Optional[str] = None,
    categoria: Optional[str] = None,
    instituicao: Optional[str] = None
):
    """
    Busca cursos no catálogo. Todos os filtros são opcionais.

    - **termo**: Busca por palavra-chave no nome do curso.
    - **categoria**: Filtra pela categoria exata.
    - **instituicao**: Filtra pela instituição exata.
    """
    
    resultados = db_cursos

    if termo:
        termo_low = termo.lower()
        # Modificado para buscar se o termo está no nome, ou se o nome é igual ao termo (para o autocomplete)
        resultados = [
            c for c in resultados 
            if termo_low in c.get('Nome', '').lower()
        ]

    if categoria:
        resultados = [
            c for c in resultados
            if c.get('Categoria', '') == categoria
        ]
    
    if instituicao:
        resultados = [
            c for c in resultados
            if c.get('Instituição', '') == instituicao
        ]
    
    return {"count": len(resultados), "cursos": resultados}


@app.get("/categorias/", summary="Lista todas as categorias únicas", response_model=List[str])
def get_categorias():
    """Retorna uma lista única de todas as categorias de cursos."""
    categorias = sorted(list(set(c.get('Categoria', 'N/A') for c in db_cursos)))
    return categorias


@app.get("/instituicoes/", summary="Lista todas as instituições únicas", response_model=List[str])
def get_instituicoes():
    """Retorna uma lista única de todas as instituições."""
    instituicoes = sorted(list(set(c.get('Instituição', 'N/A') for c in db_cursos)))
    return instituicoes

# --- NOVO ENDPOINT PARA O AUTOCOMPLETE ---
@app.get("/cursos/nomes/", summary="Lista todos os nomes únicos de cursos", response_model=List[str])
def get_nomes_cursos():
    """Retorna uma lista única de todos os nomes de cursos para autocomplete."""
    nomes = sorted(list(set(c.get('Nome', 'N/A') for c in db_cursos if c.get('Nome'))))
    return nomes
# --- FIM DO NOVO ENDPOINT ---


# --- Executar o Servidor (Pronto para Produção) ---
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    
    print(f"Iniciando servidor API no host 0.0.0.0 e porta {port}")
    print(f"Acesse a documentação (Swagger) em: http://127.0.0.1:{port}/docs")
    
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )