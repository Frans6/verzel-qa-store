# Cenários de teste

Cenários levantados a partir da documentação (card VZS-142, v2.3.0), escritos em Gherkin na pasta [`features/`](features/):

| Arquivo | Conteúdo |
|---------|----------|
| [`cupom.feature`](features/cupom.feature) | CA01–CA05, CA09 |
| [`frete.feature`](features/frete.feature) | CA06–CA09 |
| [`limite-quantidade.feature`](features/limite-quantidade.feature) | CA10 |
| [`arredondamento.feature`](features/arredondamento.feature) | CA11 |
| [`api-e-checkout.feature`](features/api-e-checkout.feature) | Códigos de erro, pedidos e checkout |
| [`produtos.feature`](features/produtos.feature) | Vitrine de produtos (pré-requisito do cálculo) |

Total: **51 cenários** (CT-001 a CT-051). Nos arquivos `.feature` eles aparecem em 49 blocos, porque dois Esquemas de Cenário agrupam IDs com exemplos (CT-002/003 e CT-013/014/015). Os resultados estão em [`../02-execucao/execucao.md`](../02-execucao/execucao.md).

## Matriz de rastreabilidade (critério de aceite → cenários)

| Critério | Resumo | Cenários | Camada |
|----------|--------|----------|--------|
| CA01 | BEMVINDO10 = 10% sobre o subtotal | CT-001 | UI+API |
| CA02 | Cupom sem diferenciar maiúsc./minúsc.; ignora espaços nas pontas | CT-002, CT-003, CT-040 | UI+API |
| CA03 | Cupom inexistente: "Cupom inválido." | CT-004, CT-011 | UI+API |
| CA04 | Cupom expirado: "Cupom expirado." | CT-005, CT-012 | UI+API |
| CA05 | Apenas um cupom por vez; trocar = remover e aplicar outro | CT-007, CT-008 | UI |
| CA06 | Frete grátis a partir de R$ 200,00 (inclusive) | CT-016, CT-017, CT-020 | UI+API |
| CA07 | Abaixo de R$ 200,00: frete R$ 19,90 + aviso do quanto falta | CT-013, CT-014, CT-015, CT-019 | UI+API |
| CA08 | Frete grátis considera subtotal ANTES do cupom | CT-018 | UI+API |
| CA09 | Desconto não incide sobre o frete | CT-009, CT-020 | UI+API |
| CA10 | Máx. 5 unidades por produto (UI e API) | CT-021, CT-022, CT-023a/b, CT-024, CT-025, CT-026 | UI+API |
| CA11 | Valores arredondados em 2 casas | CT-027, CT-028 | API |
| Extra | Cupom em branco, recálculo ao mudar quantidade, API (produtos, erros), pedidos e checkout | CT-006, CT-010, CT-029 a CT-038, CT-041 a CT-043, CT-048 a CT-051 | UI+API |
| Exploratório | Cupom após esvaziar o carrinho | CT-039 | UI |
| Pré-requisito | Vitrine e preços dos produtos | CT-044 a CT-047 | UI+API |

## Técnicas usadas
- **Análise de valor limite:** subtotal 199,80 / 199,90 / 200,00 / 209,90; quantidade 0, 1, 5, 6 e 100.
- **Partição de equivalência:** cupom válido / expirado / inexistente / em branco; CEP com e sem hífen.
- **Tabela de decisão** (cupom × frete): CT-018 e CT-020 testam o cruzamento das duas regras.
- **Teste exploratório** por charters (ver `execucao.md`).

## Convenções
- IDs `CT-001`… · Tags: `@CAxx` (critério), `@UI`/`@API`, `@borda`, `@negativo`, `@bug-xxx`.
