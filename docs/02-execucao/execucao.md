# Execução dos testes

- **Data:** 07/10/2026
- **Ambiente:** https://verzel-store.qa-test-verzel-store.workers.dev/ (card VZS-142, v2.3.0)
- **Navegador / SO:** Chromium 156 (Playwright, headless) e Chrome, Windows 11
- **Tipo:** manual/exploratório (scripts de apoio em `scripts/`) + automatizado (Playwright)

Resultado: ✅ Passou · ❌ Falhou · ℹ️ Informativo (comportamento registrado, sem critério para julgar)

## Resultado por cenário

| ID | Cenário | Camada | Resultado | Bug | Evidência / observações |
|----|---------|--------|-----------|-----|-------------------------|
| CT-001 | BEMVINDO10 aplica 10% | UI+API | ✅ | | desconto 10,00; total 109,90 · `UI-09` |
| CT-002 | Cupom em minúsculas / misto | UI+API | ✅ | | `UI-06` (" BemVindo10 ") |
| CT-003 | Cupom com espaços nas pontas | UI+API | ✅ | | `api-probe-1` |
| CT-004 | Cupom inexistente: "Cupom inválido." | UI+API | ✅ | | `UI-07`; API 200 sem desconto |
| CT-005 | Cupom expirado: "Cupom expirado." | UI+API | ✅ | | `UI-08` |
| CT-006 | Cupom em branco: "Informe um cupom." | UI | ✅ | | `ui-exploracao.log` (mensagem não está na documentação) |
| CT-007 | Apenas um cupom por vez | UI | ✅ | | campo some após aplicar · `UI-09` |
| CT-008 | Remover cupom restaura valores | UI | ✅ | | `ui-exploracao.log` |
| CT-009 | Desconto não incide sobre frete | UI+API | ✅ | | 10% de 100,00, total 109,90 |
| CT-010 | Cupom recalcula ao mudar quantidade | UI | ✅ | | qtd 2 → 20,00 · qtd 1 → 10,00 |
| CT-011 | Pedido com cupom inexistente: 422 | API | ✅ | | `CUPOM_INVALIDO` |
| CT-012 | Pedido com cupom expirado: 422 | API | ✅ | | `CUPOM_EXPIRADO` |
| CT-013 | Subtotal 100,00 → frete 19,90, faltam 100,00 | UI+API | ✅ | | |
| CT-014 | Subtotal 199,80 → frete 19,90, faltam 0,20 | UI+API | ✅ | | `UI-05` |
| CT-015 | Subtotal 199,90 → frete 19,90, faltam 0,10 | API | ✅ | | `api-probe-1` |
| **CT-016** | **Subtotal 200,00 → frete grátis** | UI+API | ❌ | **BUG-001** | frete 19,90 · `BUG-001-ui-borda-200` |
| CT-017 | Subtotal 209,90 / 219,80 / 229,90 → grátis | UI+API | ✅ | | |
| CT-018 | Frete considera subtotal antes do cupom | UI+API | ✅ | | 219,80 + cupom → total 197,82, frete grátis · `UI-06` |
| CT-019 | Aviso "Faltam R$ 0,20…" | UI | ✅ | | `UI-05` |
| **CT-020** | **Subtotal 200,00 + cupom → frete grátis** | UI+API | ❌ | **BUG-001** | total 199,90 (esperado 180,00) · `UI-04` |
| CT-021 | Vitrine bloqueia a 6ª unidade | UI | ✅ | | `UI-02` |
| CT-022 | Carrinho desabilita "+" no limite | UI | ✅ | | `UI-03` |
| CT-023a | API aceita 5 unidades | API | ✅ | | |
| **CT-023b** | **API rejeita 6 unidades (calcular)** | API | ❌ | **BUG-002** | 200 com qtd 6 |
| **CT-024** | **API rejeita pedido com 6+ unidades** | API | ❌ | **BUG-002** | 201 com 6 e com 100 unidades |
| CT-025 | Quantidade inválida (0, -1, 1.5, "2", null, ausente) | API | ✅ | | 422 `QUANTIDADE_INVALIDA` |
| CT-026 | Produto duplicado | API | ✅ | | 422 `ITEM_DUPLICADO` |
| CT-027 | Desconto arredondado (5,99 / 2,99 / 4,99) | API | ✅ | | |
| CT-028 | Subtotal sem erro de ponto flutuante (3 × 29,90) | API | ✅ | | 89,70 / 8,97 / 100,63 |
| CT-029 | Listar produtos | API | ✅ | | 8 produtos |
| CT-030 | Pedido válido: 201, VZ-000000, CEP normalizado | API | ✅ | | |
| CT-031 | DADOS_INVALIDOS com detalhes em "campos" | API | ✅ | | |
| CT-032 | 404 rota inexistente / 405 método | API | ✅ | | |
| CT-033 | JSON inválido: 400 | API | ✅ | | |
| CT-034 | Consulta de produto: 200 / 404 | API | ✅ | | |
| CT-035 | Checkout: campos obrigatórios | UI | ✅ | | `UI-11` |
| CT-036 | Checkout: nome/e-mail/CEP inválidos | UI | ✅ | | `ui-exploracao.log` |
| CT-037 | Pedido confirmado | UI | ✅ | | `UI-12` |
| CT-038 | Checkout com carrinho vazio → /carrinho | UI | ✅ | | |
| **CT-039** | **Cupom não deve persistir após esvaziar** | UI | ❌ | **BUG-003** | `UI-10` (baixa severidade) |
| CT-040 | Pedido aceita cupom em minúsculas/espaços | API | ✅ | | |
| CT-041 | Itens inválidos (vazio, ausente, string, id inexistente / minúsculo) | API | ✅ | | |
| CT-042 | CEP com e sem hífen | UI/API | ✅ | | com hífen na UI; sem hífen na API (201) e pela regex da UI |
| CT-043 | Sobrenome de 1 letra ("Maria S") | UI+API | ℹ️ | | rejeitado nos dois; ver ambiguidade 3 |
| CT-044 | Vitrine exibe os 8 produtos conforme documentação e API | UI+API | ✅ | | nome, categoria, descrição e preço sem divergência · `UI-15` · `ui-produtos.log` |
| CT-045 | Preço na vitrine = preço no carrinho | UI | ✅ | | 8 produtos · `UI-16` |
| CT-046 | Contador e subtotal com 1 de cada produto | UI | ✅ | | contador 8; subtotal R$ 849,40 |
| CT-047 | Falha ao carregar produtos mostra mensagem | UI | ✅ | | API simulada com erro 500 · `UI-17` |
| **CT-048** | **Item sem `produtoId` retorna `ITEM_INVALIDO`** | API | ❌ | **BUG-004** | retorna `PRODUTO_NAO_ENCONTRADO` "Produto undefined…" |
| CT-049 | Resumo do checkout = confirmação (com cupom, valores com milhar) | UI | ✅ | | R$ 1.034,55 · `UI-19` |
| CT-050 | Duplo clique em "Confirmar pedido" gera 1 pedido | UI | ✅ | | 1 POST · `ui-varredura.log` |
| CT-051 | F5 mantém carrinho e cupom | UI | ✅ | | |

## Resumo
- **Cenários:** 51 — ✅ 44 · ❌ 6 · ℹ️ 1
- **Bugs:** 4 (BUG-001 e BUG-002 de severidade alta; BUG-003 e BUG-004 baixa) + observações em `docs/03-bugs/OBSERVACOES.md`
- **Automação Playwright:** 52 testes — 47 passam, 5 falham (os 5 são os testes marcados `@bug-001`, `@bug-002` e `@bug-004`, que cobrem os bugs; ver `../04-evidencias/logs/playwright-run.txt`)

## Verificação manual no Chrome (09/10/2026)
Os principais cenários foram repetidos à mão, clicando na loja no Chrome (Windows 11), com o carrinho vazio como ponto de partida. A API foi chamada com `fetch` pelo console da própria página.

| Cenário | Passos feitos | Resultado |
|---------|---------------|-----------|
| CT-016 / CT-020 (BUG-001) | 1 Mochila + 2 Garrafas; depois cupom `  bemvindo10 ` | ❌ Frete R$ 19,90 e "Faltam R$ 0,00"; com cupom, total R$ 199,90 (esperado R$ 180,00) |
| CT-002/003 | Cupom em minúsculas e com espaços | ✅ Aplicado: desconto R$ 20,00 |
| CT-039 (BUG-003) | Cupom aplicado → "Remover" nos 2 itens → adicionar Kit de Meias | ❌ Cupom BEMVINDO10 ainda aplicado (desconto R$ 2,99) |
| CT-023b / CT-024 (BUG-002) | `fetch` em `/api/carrinho/calcular` e `/api/pedidos` com 6 e 100 unidades | ❌ 200 e 201 (pedidos VZ-223431 e VZ-457852); com 5 un. 200; qtd 0 → 422 |
| CT-004 / CT-005 | Cupom `XYZ` e `verao2026` | ✅ "Cupom inválido." e "Cupom expirado."; sem desconto |
| CT-022 | Clicar "+" até passar de 5 unidades | ✅ Para em 5, botão desabilitado, "Limite de 5 unidades por produto." |
| CT-035 / CT-036 | Checkout vazio; depois "Maria", "a@b", "0131010" | ✅ Mensagens de erro corretas em cada campo |
| CT-037 | Pedido válido com dados fictícios do exemplo da documentação | ✅ Pedido confirmado (VZ-448975) com 5x Kit, frete R$ 19,90, total R$ 169,40 |

Também foram lidos o **console** (sem nenhuma mensagem) e a **rede** (somente chamadas `/api/produtos` e `/api/carrinho/calcular` com status 200) enquanto o fluxo acima era executado, além de simulações de falha de API e de uma auditoria de acessibilidade. Ver `docs/03-bugs/OBSERVACOES.md` (O10 e O11) e `docs/04-evidencias/logs/ui-visual.log`.

Observação (sem bug): depois de alterar a quantidade, a mensagem de erro do último cupom digitado ("Cupom expirado.") continua visível até um novo envio.

## Testes exploratórios

| Sessão | Charter | Achados |
|--------|---------|---------|
| EXP-01 | Explorar a API com valores de borda e payloads malformados (`scripts/probe.mjs`, `probe2.mjs`) | BUG-001, BUG-002; demais respostas conforme documentação |
| EXP-02 | Explorar o fluxo de carrinho/cupom na UI, trocando quantidades, cupons e esvaziando o carrinho (`scripts/explore-ui.mjs`) | BUG-003; aviso "Faltam R$ 0,00" (parte do BUG-001) |
| EXP-03 | Navegação e responsividade: rota inexistente, `/pedido-confirmado` direto, viewport 375 px | Sem defeitos: página 404 própria, redirecionamento do checkout vazio, sem scroll horizontal (`UI-13`, `UI-14`) |
| EXP-04 | Conferir a vitrine de produtos contra a documentação e a API, preços no carrinho e falha da API de produtos (`scripts/explore-produtos.mjs`) | Sem divergências |
| EXP-05 | Varredura ampla: 164 combinações de carrinho contra um cálculo independente, 15 comparações calcular × pedidos, ~50 entradas incomuns na API (`scripts/probe3.mjs`) e fluxos extras na UI (`scripts/explore-ui-3.mjs`) | BUG-004; observações O1–O9; a única divergência de valores é o BUG-001 |

## Cobertura
Todos os critérios CA01–CA11 têm cenário (ver matriz em [`../01-cenarios/README.md`](../01-cenarios/README.md)). Fora do escopo: carga, estresse e segurança.
