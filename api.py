# Nome do arquivo: api.py
# Salve este script no MESMO diretório do seu arquivo JSON.

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
# Isso permite que um site (index.html) em outro domínio acesse sua API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens (para testes)
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, etc.)
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
    
    # Começa com a lista completa
    resultados = db_cursos

    if termo:
        termo_low = termo.lower()
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


# --- Executar o Servidor (Apenas para rodar direto com 'python api.py') ---
if __name__ == "__main__":
    import os
    # O Render (nuvem) define a porta na variável de ambiente $PORT
    # Se não houver (rodando local), ele usa a porta 8000 como padrão.
    port = int(os.environ.get("PORT", 8000))

    print(f"Iniciando servidor API no host 0.0.0.0 e porta {port}")
    print(f"Acesse a documentação (Swagger) em: http://127.0.0.1:{port}/docs")

    uvicorn.run(
        "api:app",
        host="0.0.0.0",  # OBRIGATÓRIO para aceitar conexões externas
        port=port,
        reload=True     # Mantenha o reload para facilitar (o Render ignora isso)
    )