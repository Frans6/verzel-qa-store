import { test, expect } from '@playwright/test';
import { calcular } from '../support/loja';

// CA06, CA07, CA08, CA09 — regras de frete na API
const casos = [
  { ct: 'CT-013', nome: 'subtotal 100,00 cobra frete e informa o que falta', itens: [{ produtoId: 'P005', quantidade: 1 }], frete: 19.9, falta: 100 },
  { ct: 'CT-014', nome: 'subtotal 199,80 cobra frete', itens: [{ produtoId: 'P001', quantidade: 1 }, { produtoId: 'P002', quantidade: 1 }], frete: 19.9, falta: 0.2 },
  { ct: 'CT-015', nome: 'subtotal 199,90 cobra frete', itens: [{ produtoId: 'P004', quantidade: 1 }, { produtoId: 'P005', quantidade: 1 }, { produtoId: 'P008', quantidade: 1 }], frete: 19.9, falta: 0.1 },
  { ct: 'CT-016 @bug-001', nome: 'subtotal EXATO 200,00 tem frete grátis (inclusive)', itens: [{ produtoId: 'P005', quantidade: 1 }, { produtoId: 'P008', quantidade: 2 }], frete: 0, falta: 0 },
  { ct: 'CT-017', nome: 'subtotal 209,90 tem frete grátis', itens: [{ produtoId: 'P001', quantidade: 1 }, { produtoId: 'P005', quantidade: 1 }, { produtoId: 'P008', quantidade: 1 }], frete: 0, falta: 0 },
];

for (const c of casos) {
  test(`${c.ct}: ${c.nome}`, async ({ request }) => {
    const r = await calcular(request, c.itens);
    expect(r.status()).toBe(200);
    const corpo = await r.json();
    expect(corpo.frete).toBe(c.frete);
    expect(corpo.freteGratis).toBe(c.frete === 0);
    expect(corpo.valorFaltanteFreteGratis).toBeCloseTo(c.falta, 2);
  });
}

test('CT-018: frete grátis considera o subtotal ANTES do cupom (CA08)', async ({ request }) => {
  // subtotal 219,80 (>= 200); com cupom o total fica 197,82, mas o frete segue grátis
  const r = await calcular(request, [{ produtoId: 'P003', quantidade: 1 }, { produtoId: 'P006', quantidade: 1 }], 'BEMVINDO10');
  const c = await r.json();
  expect(c.subtotal).toBe(219.8);
  expect(c.desconto).toBe(21.98);
  expect(c.frete).toBe(0);
  expect(c.total).toBe(197.82);
});

test('CT-009: desconto do cupom não incide sobre o frete (CA09)', async ({ request }) => {
  const r = await calcular(request, [{ produtoId: 'P005', quantidade: 1 }], 'BEMVINDO10');
  const c = await r.json();
  expect(c.desconto).toBe(10); // 10% de 100,00 — e não de 119,90
  expect(c.frete).toBe(19.9);
  expect(c.total).toBe(109.9); // 100 - 10 + 19,90
});
