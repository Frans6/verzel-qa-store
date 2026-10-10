# Bugs encontrados

Um arquivo por bug, a partir de [`_TEMPLATE.md`](_TEMPLATE.md).

| ID | Título | Severidade | Camada | Critério | Cenários | Teste que deve passar após o conserto |
|----|--------|------------|--------|----------|----------|----------------------------------------|
| [BUG-001](BUG-001.md) | Subtotal de exatamente R$ 200,00 cobra frete (deveria ser grátis) | Alta | API + UI | CA06 | CT-016, CT-020 | `CT-016 @bug-001` (API e UI) |
| [BUG-002](BUG-002.md) | API aceita mais de 5 unidades por produto (cálculo e pedido) | Alta | API | CA10 | CT-023b, CT-024 | `CT-023b @bug-002`, `CT-024 @bug-002` |
| [BUG-003](BUG-003.md) | Cupom permanece aplicado após remover o último item pelo botão "Remover" | Baixa | UI | (inconsistência) | CT-039 | sem teste automatizado; repetir os passos do bug |
| [BUG-004](BUG-004.md) | Item sem `produtoId` gera "Produto undefined não encontrado" em vez de `ITEM_INVALIDO` | Baixa | API | Tabela de erros | CT-048 | `CT-048 @bug-004` |

## Ordem sugerida de correção
1. **BUG-001:** afeta o valor cobrado do cliente e é a regra central do card (frete grátis). Provável correção de uma linha (`>` em vez de `>=`).
2. **BUG-002:** regra de negócio que pode ser burlada pela API. Exige validar o limite no servidor, como já é feito com os outros erros de quantidade.
3. **BUG-004:** correção simples de validação do item.
4. **BUG-003:** depende de decisão de produto (o que fazer com o cupom ao esvaziar o carrinho). Pode ficar para depois.

Para conferir os consertos, rode `npm test` na raiz: os testes marcados `@bug-xxx` deixam de falhar.

Outras observações que **não** foram reportadas como bug estão em [`OBSERVACOES.md`](OBSERVACOES.md).

## Não reportado como bug (conforme "Sobre este ambiente")
Carrinho só na aba, pedidos não armazenados/consultáveis, sem e-mail nem cobrança, produtos/preços/cupons fixos, sem estoque e API sem estado.
