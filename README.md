# Verzel Store — Teste técnico QA Júnior

Validação da entrega **VZS-142 (v2.3.0)**: cupom de desconto e frete grátis.

- Loja: https://verzel-store.qa-test-verzel-store.workers.dev/
- Documentação: https://verzel-store.qa-test-verzel-store.workers.dev/documentacao
- API: https://verzel-store.qa-test-verzel-store.workers.dev/api

## Resumo para quem tem 2 minutos
- **O que foi validado:** cupom de desconto (BEMVINDO10) e frete grátis da entrega VZS-142, pela interface e pela API.
- **Resultado:** o cálculo está correto na grande maioria dos casos, mas há **2 bugs de severidade alta**:
  1. O cliente que fecha **exatamente R$ 200,00** paga R$ 19,90 de frete, apesar da regra "a partir de R$ 200,00, inclusive" (**BUG-001**).
  2. A **API aceita mais de 5 unidades** por produto (6, 100...), embora a regra valha para a interface e para a API (**BUG-002**).
- Há ainda 2 bugs de severidade baixa (**BUG-003** e **BUG-004**) e algumas [observações](docs/03-bugs/OBSERVACOES.md) para o time decidir.
- **Como conferir o conserto:** `npm test`. Os 5 testes marcados com `@bug-xxx` falham hoje e passam quando os bugs forem corrigidos. A [ordem sugerida de correção](docs/03-bugs/README.md) está no índice de bugs.

## Resumo dos resultados

| | |
|---|---|
| Cenários (Gherkin) | 51 — ✅ 44 · ❌ 6 · ℹ️ 1 |
| Bugs reportados | **4** — BUG-001 (Alta), BUG-002 (Alta), BUG-003 (Baixa), BUG-004 (Baixa) + [observações](docs/03-bugs/OBSERVACOES.md) |
| Automação Playwright | 52 testes — 47 passam, **5 falham de propósito** (cobrem os bugs 001, 002 e 004) |

**Principais achados**
1. **BUG-001:** subtotal de exatamente R$ 200,00 cobra frete (R$ 19,90) — viola CA06 ("inclusive").
2. **BUG-002:** a API aceita 6, ou até 100, unidades de um produto, tanto no cálculo quanto no pedido — viola CA10 (a UI bloqueia, a API não).
3. **BUG-003:** o cupom continua aplicado depois de remover o último item pelo botão "Remover" (mas não pelo "Esvaziar carrinho").
4. **BUG-004:** item sem `produtoId` retorna "Produto undefined não encontrado" em vez de `ITEM_INVALIDO`.

## Onde encontrar cada entrega

| Entrega | Local |
|---------|-------|
| Cenários de teste (Gherkin) + matriz de rastreabilidade | [`docs/01-cenarios/`](docs/01-cenarios/) |
| Execução e resultado de cada cenário | [`docs/02-execucao/execucao.md`](docs/02-execucao/execucao.md) |
| Report de bugs | [`docs/03-bugs/`](docs/03-bugs/) |
| Evidências (screenshots e logs) | [`docs/04-evidencias/`](docs/04-evidencias/) |
| Ambiguidades e interpretações | [`docs/05-ambiguidades.md`](docs/05-ambiguidades.md) |
| Automação Playwright | [`tests/`](tests/) |
| Scripts de exploração (API e UI) | [`scripts/`](scripts/) |

## Como rodar a automação

Pré-requisito: Node.js 18+.

```bash
npm install
npx playwright install chromium
npm test            # tudo (API + UI)
npm run test:api    # só API
npm run test:ui     # só UI
npm run report      # abre o relatório HTML
```

- A URL base fica em `playwright.config.ts`.
- Os testes rodam com 1 worker, porque o ambiente é compartilhado com outros candidatos.
- **Falhas esperadas:** os testes com `@bug-001`, `@bug-002` e `@bug-004` no nome falham enquanto os bugs existirem (`CT-016` na API e na UI, `CT-023b`, `CT-024` e `CT-048`). Quando os bugs forem corrigidos, passam.

### Estrutura dos testes
```
tests/
├── support/loja.ts                 # helpers (chamadas à API, ações na UI)
├── api/frete.spec.ts               # CA06–CA09
├── api/cupom.spec.ts               # CA01–CA04, CA11 e erros de cupom no pedido
├── api/limite-e-pedidos.spec.ts    # CA10, validações, erros e pedidos
├── ui/carrinho.spec.ts             # cupom e frete no carrinho
├── ui/limite-e-checkout.spec.ts    # limite de 5 unidades e checkout
└── ui/produtos.spec.ts             # vitrine, preços, contador e falha da API de produtos
```

Os `scripts/probe*.mjs` e `scripts/explore-ui*.mjs` são os scripts de exploração usados nas sessões exploratórias; rodam com `node scripts/<arquivo>`.

## Escopo
Fora do escopo, conforme o enunciado: testes de carga, estresse e segurança. Também não foram reportados como bug os comportamentos listados em "Sobre este ambiente" da documentação.
