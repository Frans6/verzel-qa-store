# Evidências da execução

Prints e respostas de API que comprovam os resultados da [execução](../02-execucao/execucao.md).

## Screenshots (`screenshots/`)
| Arquivo | Cenário / bug | Descrição |
|---------|---------------|-----------|
| `BUG-001-ui-borda-200.png` | BUG-001, CT-016 | Subtotal R$ 200,00 com frete R$ 19,90 e "Faltam R$ 0,00" |
| `UI-04-borda-200-cupom.png` | BUG-001, CT-020 | Mesmo cenário com cupom: total R$ 199,90 |
| `UI-10-cupom-residual.png` | BUG-003, CT-039 | Cupom ainda aplicado após remover o último item |
| `UI-01-vitrine.png` | — | Vitrine de produtos |
| `UI-02-limite-vitrine.png`, `UI-03-limite-carrinho.png` | CT-021, CT-022 | Limite de 5 unidades |
| `UI-05-subtotal-199-80.png` | CT-014, CT-019 | Frete cobrado e aviso "Faltam R$ 0,20" |
| `UI-06-ca08-cupom-frete.png` | CT-018 | Frete grátis com cupom |
| `UI-07-cupom-invalido.png`, `UI-08-cupom-expirado.png` | CT-004, CT-005 | Mensagens de cupom |
| `UI-09-cupom-aplicado.png` | CT-001, CT-007 | Cupom aplicado |
| `UI-11-checkout-erros.png`, `UI-12-pedido-confirmado.png` | CT-035, CT-037 | Checkout |
| `UI-13-rota-inexistente.png`, `UI-14-mobile-carrinho.png` | EXP-03 | 404 e carrinho em 375 px |
| `VIS-375-*.png`, `VIS-1920-*.png` | EXP-05 | Inspeção visual em 375 px e 1920 px |
| `UI-18` a `UI-23` | CT-049 e O5/O6 | Valores com milhar, confirmação com cupom, estados de armazenamento alterado e mobile 320 px |
| `UI-15-vitrine-produtos.png`, `UI-16-carrinho-8-produtos.png`, `UI-17-vitrine-erro-api.png` | CT-044 a CT-047 | Vitrine, carrinho com os 8 produtos e erro da API de produtos |

## Logs (`logs/`)
| Arquivo | Conteúdo |
|---------|----------|
| `bugs-api-requisicoes.txt` | Requisição e resposta dos BUG-001 e BUG-002 |
| `api-probe-1-calcular.txt` | ~50 chamadas a produtos e `/carrinho/calcular` |
| `api-probe-2-pedidos.txt` | ~35 chamadas a `/pedidos` e bordas de frete |
| `api-probe-3-varredura.txt` | Varredura: 164 combinações contra um oráculo independente, calcular × pedidos e ~50 entradas incomuns |
| `ui-visual.log` | Excesso horizontal, texto cortado e alvos de toque em 375 e 1920 px |
| `ui-varredura.log` | Fluxos extras na UI (formatação, duplo clique, F5, mobile, teclado, storage) |
| `ui-produtos.log` | Comparação vitrine × API × documentação e preços no carrinho |
| `ui-exploracao.log` | Valores lidos da interface em cada passo da exploração |
| `playwright-run.txt` | Saída da execução automatizada (52 testes: 47 ✅, 5 ❌) |

Os scripts que geraram esses logs estão em [`../../scripts/`](../../scripts/). O relatório HTML do Playwright é gerado com `npm run report`.
