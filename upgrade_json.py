# Nome do arquivo: upgrade_json.py
#
# Este script vai ler seu catálogo v2.0 e criar o v3.0
# com IDs únicos e os novos campos sugeridos.

import json

ARQUIVO_ENTRADA = "Catalogo_Mestre_Vendas_v2.0.json"
ARQUIVO_SAIDA = "Catalogo_Mestre_Vendas_v3.0.json"

def atualizar_catalogo():
    print(f"Iniciando atualização de {ARQUIVO_ENTRADA}...")
    
    try:
        with open(ARQUIVO_ENTRADA, 'r', encoding='utf-8') as f:
            cursos_v2 = json.load(f)
    except FileNotFoundError:
        print(f"ERRO: Arquivo '{ARQUIVO_ENTRADA}' não encontrado.")
        print("Certifique-se de que ele está na mesma pasta.")
        return
    except Exception as e:
        print(f"Erro ao ler o JSON: {e}")
        return

    cursos_v3 = []
    
    # Adiciona os novos campos sugeridos pelo ChatGPT
    for i, curso in enumerate(cursos_v2):
        curso['id'] = i + 1  # Adiciona um ID único (ex: 1, 2, 3...)
        
        # Adiciona novos campos (vazios por enquanto)
        curso['empregabilidade_area'] = "" # Campo para "Área que atua"
        curso['palavras_chave'] = []       # Campo para melhor busca
        
        # Renomeia o argumento de venda para um nome melhor (sem espaços)
        if 'Argumento de Venda' in curso:
            curso['argumento_venda'] = curso.pop('Argumento de Venda')
        
        cursos_v3.append(curso)

    try:
        with open(ARQUIVO_SAIDA, 'w', encoding='utf-8') as f:
            # indent=2 para manter o arquivo legível
            json.dump(cursos_v3, f, ensure_ascii=False, indent=2)
        
        print(f"\nSucesso! 🚀")
        print(f"Foram processados {len(cursos_v3)} cursos.")
        print(f"Seu novo catálogo está salvo como: {ARQUIVO_SAIDA}")
        print("\nPróximo passo: Atualize o 'api.py' para ler o novo arquivo v3.0.")
        
    except Exception as e:
        print(f"Erro ao salvar o novo JSON: {e}")

if __name__ == "__main__":
    atualizar_catalogo()