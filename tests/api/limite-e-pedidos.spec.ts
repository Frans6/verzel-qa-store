import { test, expect } from '@playwright/test';
import { calcular, criarPedido, CLIENTE } from '../support/loja';

const BONE = (quantidade: number) => [{ produtoId: 'P004', quantidade }];

// CA10 — limite de 5 unidades na API
test('CT-023a: calcular aceita 5 unidades de um produto', async ({ request }) => {
  expect((await calcular(request, BONE(5))).status()).toBe(200);
});

test('CT-023b @bug-002: calcular rejeita 6 unidades com 422 QUANTIDADE_MAXIMA_EXCEDIDA', async ({ request }) => {
  const r = await calcular(request, BONE(6));
  expect(r.status()).toBe(422);
  expect((await r.json()).erro.codigo).toBe('QUANTIDADE_MAXIMA_EXCEDIDA');
});

test('CT-024 @bug-002: pedido com 6 unidades é rejeitado com 422 QUANTIDADE_MAXIMA_EXCEDIDA', async ({ request }) => {
  const r = await criarPedido(request, BONE(6));
  expect(r.status()).toBe(422);
  expect((await r.json()).erro.codigo).toBe('QUANTIDADE_MAXIMA_EXCEDIDA');
});

for (const q of [0, -1, 1.5, '2', null]) {
  test(`CT-025: quantidade inválida (${JSON.stringify(q)}) retorna 422 QUANTIDADE_INVALIDA`, async ({ request }) => {
    const r = await request.post('/api/carrinho/calcular', { data: { itens: [{ produtoId: 'P004', quantidade: q }] } });
    expect(r.status()).toBe(422);
    expect((await r.json()).erro.codigo).toBe('QUANTIDADE_INVALIDA');
  });
}

test('CT-048 @bug-004: item sem produtoId retorna 422 ITEM_INVALIDO (e não "Produto undefined")', async ({ request }) => {
  const r = await request.post('/api/carrinho/calcular', { data: { itens: [{ quantidade: 1 }] } });
  expect(r.status()).toBe(422);
  const e = (await r.json()).erro;
  expect(e.codigo).toBe('ITEM_INVALIDO');
  expect(e.mensagem).not.toContain('undefined');
});

test('CT-026: produto duplicado retorna 422 ITEM_DUPLICADO', async ({ request }) => {
  const r = await calcular(request, [...BONE(1), ...BONE(1)]);
  expect(r.status()).toBe(422);
  expect((await r.json()).erro.codigo).toBe('ITEM_DUPLICADO');
});

// Pedidos
test('CT-030: pedido válido retorna 201 com número VZ-000000 e CEP normalizado', async ({ request }) => {
  const r = await criarPedido(request, [{ produtoId: 'P005', quantidade: 1 }], 'BEMVINDO10');
  expect(r.status()).toBe(201);
  const p = await r.json();
  expect(p.numero).toMatch(/^VZ-\d{6}$/);
  expect(p.cliente.cep).toBe('01310100');
  expect(p).toMatchObject({ subtotal: 100, desconto: 10, frete: 19.9, total: 109.9 });
});

test('CT-031: pedido com dados do cliente inválidos retorna 422 DADOS_INVALIDOS com detalhes em "campos"', async ({ request }) => {
  const r = await criarPedido(request, [{ produtoId: 'P005', quantidade: 1 }], undefined, { nome: 'Maria', email: 'x', cep: '1' });
  expect(r.status()).toBe(422);
  const e = (await r.json()).erro;
  expect(e.codigo).toBe('DADOS_INVALIDOS');
  expect(e.campos.map((c: { campo: string }) => c.campo)).toEqual(['cliente.nome', 'cliente.email', 'cliente.cep']);
});

test('CT-032: rotas e métodos inexistentes retornam 404/405 no formato padrão', async ({ request }) => {
  const a = await request.get('/api/xpto');
  expect(a.status()).toBe(404);
  expect((await a.json()).erro.codigo).toBe('ROTA_NAO_ENCONTRADA');
  const b = await request.get('/api/pedidos');
  expect(b.status()).toBe(405);
  expect((await b.json()).erro.codigo).toBe('METODO_NAO_PERMITIDO');
});

test('CT-033: JSON inválido retorna 400 JSON_INVALIDO', async ({ request }) => {
  const r = await request.post('/api/carrinho/calcular', { headers: { 'Content-Type': 'application/json' }, data: '{bad' });
  expect(r.status()).toBe(400);
  expect((await r.json()).erro.codigo).toBe('JSON_INVALIDO');
});

test('CT-034: consulta de produto existente e inexistente', async ({ request }) => {
  expect((await request.get('/api/produtos/P001')).status()).toBe(200);
  const r = await request.get('/api/produtos/P999');
  expect(r.status()).toBe(404);
  expect((await r.json()).erro.codigo).toBe('PRODUTO_NAO_ENCONTRADO');
  expect(CLIENTE.nome).toBeTruthy();
});
