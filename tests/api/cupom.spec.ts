import { test, expect } from '@playwright/test';
import { calcular, criarPedido } from '../support/loja';

const MOCHILA = [{ produtoId: 'P005', quantidade: 1 }];

// CA01, CA02
for (const codigo of ['BEMVINDO10', 'bemvindo10', 'BemVindo10', '  BEMVINDO10  ']) {
  test(`CT-001/002/003: cupom "${codigo}" aplica 10%`, async ({ request }) => {
    const c = await (await calcular(request, MOCHILA, codigo)).json();
    expect(c.cupom).toMatchObject({ codigo: 'BEMVINDO10', aplicado: true });
    expect(c.desconto).toBe(10);
    expect(c.total).toBe(109.9);
  });
}

// CA03
test('CT-004: cupom inexistente retorna 200, sem desconto e "Cupom inválido."', async ({ request }) => {
  const r = await calcular(request, MOCHILA, 'XYZ');
  expect(r.status()).toBe(200);
  const c = await r.json();
  expect(c.desconto).toBe(0);
  expect(c.cupom).toMatchObject({ aplicado: false, mensagem: 'Cupom inválido.' });
});

// CA04
test('CT-005: cupom expirado retorna 200, sem desconto e "Cupom expirado."', async ({ request }) => {
  const r = await calcular(request, MOCHILA, 'VERAO2026');
  expect(r.status()).toBe(200);
  const c = await r.json();
  expect(c.desconto).toBe(0);
  expect(c.cupom).toMatchObject({ aplicado: false, mensagem: 'Cupom expirado.' });
});

// Pedido: cupom ruim vira erro 422
test('CT-011: pedido com cupom inexistente retorna 422 CUPOM_INVALIDO', async ({ request }) => {
  const r = await criarPedido(request, MOCHILA, 'XYZ');
  expect(r.status()).toBe(422);
  expect((await r.json()).erro.codigo).toBe('CUPOM_INVALIDO');
});

test('CT-012: pedido com cupom expirado retorna 422 CUPOM_EXPIRADO', async ({ request }) => {
  const r = await criarPedido(request, MOCHILA, 'VERAO2026');
  expect(r.status()).toBe(422);
  expect((await r.json()).erro.codigo).toBe('CUPOM_EXPIRADO');
});

// CA11 — arredondamento
for (const [produtoId, desconto, total] of [['P001', 5.99, 73.81], ['P006', 2.99, 46.81], ['P004', 4.99, 64.81]] as const) {
  test(`CT-027: valores em 2 casas decimais (${produtoId} com cupom)`, async ({ request }) => {
    const c = await (await calcular(request, [{ produtoId, quantidade: 1 }], 'BEMVINDO10')).json();
    expect(c.desconto).toBe(desconto);
    expect(c.total).toBe(total);
  });
}
