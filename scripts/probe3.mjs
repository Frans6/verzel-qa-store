// Varredura ampla: oráculo independente + entradas incomuns. Poucas chamadas (ambiente compartilhado).
const B = 'https://verzel-store.qa-test-verzel-store.workers.dev';
const PRECO = { P001: 5990, P002: 13990, P003: 18990, P004: 4990, P005: 10000, P006: 2990, P007: 22990, P008: 5000 }; // em centavos
const ids = Object.keys(PRECO);
const j = (m, p, body, raw, headers = { 'Content-Type': 'application/json' }) =>
  fetch(B + p, { method: m, headers, body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined) })
    .then(async (r) => ({ s: r.status, t: await r.text(), h: r.headers }))
    .catch((e) => ({ s: 'ERR', t: String(e) }));
const calc = (itens, cupom) => j('POST', '/api/carrinho/calcular', { itens, ...(cupom !== undefined ? { cupom } : {}) });
const cli = { nome: 'Maria Silva', email: 'maria@exemplo.com', cep: '01310-100' };
const parse = (r) => { try { return JSON.parse(r.t); } catch { return null; } };

// ---------- A) oráculo independente ----------
let seed = 42; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
let divergencias = 0, total = 0;
const alvo = [];
for (let n = 0; n < 160; n++) {
  const k = 1 + Math.floor(rnd() * 3);
  const escolhidos = [...ids].sort(() => rnd() - 0.5).slice(0, k);
  const itens = escolhidos.map((id) => ({ produtoId: id, quantidade: 1 + Math.floor(rnd() * 5) }));
  alvo.push({ itens, cupom: rnd() < 0.5 ? 'BEMVINDO10' : undefined });
}
// combinações de borda em torno de 200
alvo.push({ itens: [{ produtoId: 'P005', quantidade: 2 }], cupom: undefined });              // 200,00
alvo.push({ itens: [{ produtoId: 'P008', quantidade: 4 }], cupom: undefined });              // 200,00
alvo.push({ itens: [{ produtoId: 'P004', quantidade: 4 }, { produtoId: 'P006', quantidade: 0 + 1 }], cupom: undefined }); // 229,50
alvo.push({ itens: [{ produtoId: 'P001', quantidade: 2 }, { produtoId: 'P006', quantidade: 3 }], cupom: undefined });     // 209,50
for (const { itens, cupom } of alvo) {
  const r = await calc(itens, cupom); const c = parse(r); total++;
  const sub = itens.reduce((s, i) => s + PRECO[i.produtoId] * i.quantidade, 0);
  const desc = cupom ? Math.round(sub * 0.1) : 0;
  const frete = sub >= 20000 ? 0 : 1990;
  const falta = Math.max(0, 20000 - sub);
  const esp = { subtotal: sub / 100, desconto: desc / 100, frete: frete / 100, valorFaltanteFreteGratis: falta / 100, total: (sub - desc + frete) / 100 };
  const dif = Object.entries(esp).filter(([k, v]) => Math.abs((c?.[k] ?? NaN) - v) > 0.0001).map(([k, v]) => `${k}: esperado ${v} obtido ${c?.[k]}`);
  if (dif.length) { divergencias++; console.log('DIVERGE', JSON.stringify(itens), cupom ?? '-', '|', dif.join(' ; ')); }
}
console.log(`A) ${total} combinações, ${divergencias} divergências do oráculo (frete grátis a partir de 200,00 inclusive)`);

// ---------- B) calcular x pedidos devem coincidir ----------
let difCP = 0;
for (let n = 0; n < 15; n++) {
  const { itens, cupom } = alvo[n];
  const a = parse(await calc(itens, cupom));
  const b = parse(await j('POST', '/api/pedidos', { cliente: cli, itens, ...(cupom ? { cupom } : {}) }));
  for (const k of ['subtotal', 'desconto', 'frete', 'freteGratis', 'valorFaltanteFreteGratis', 'total']) if (a?.[k] !== b?.[k]) { difCP++; console.log('calcular x pedidos difere', k, a?.[k], b?.[k], JSON.stringify(itens)); }
}
console.log('B) diferenças calcular x pedidos:', difCP);

// ---------- C) entradas incomuns ----------
const out = async (nome, p) => { const r = await p; console.log('C)', nome.padEnd(46), r.s, r.t.replace(/\s+/g, ' ').slice(0, 170)); };
const base = [{ produtoId: 'P005', quantidade: 1 }];
await out('quantidade 10 (1e1)', j('POST', '/api/carrinho/calcular', null, '{"itens":[{"produtoId":"P004","quantidade":1e1}]}'));
await out('quantidade 5.0', j('POST', '/api/carrinho/calcular', null, '{"itens":[{"produtoId":"P004","quantidade":5.0}]}'));
await out('quantidade 1e21', j('POST', '/api/carrinho/calcular', null, '{"itens":[{"produtoId":"P004","quantidade":1e21}]}'));
await out('quantidade 9007199254740993', j('POST', '/api/carrinho/calcular', null, '{"itens":[{"produtoId":"P004","quantidade":9007199254740993}]}'));
await out('quantidade true', calc([{ produtoId: 'P004', quantidade: true }]));
await out('produtoId com espaço " P004"', calc([{ produtoId: ' P004', quantidade: 1 }]));
await out('produtoId numérico', calc([{ produtoId: 4, quantidade: 1 }]));
await out('produtoId ausente', calc([{ quantidade: 1 }]));
await out('item null', calc([null]));
await out('item array', calc([[]]));
await out('itens objeto', j('POST', '/api/carrinho/calcular', { itens: {} }));
await out('cupom booleano true', calc(base, true));
await out('cupom array', calc(base, ['BEMVINDO10']));
await out('cupom objeto', calc(base, { codigo: 'BEMVINDO10' }));
await out('cupom com TAB/quebra de linha', calc(base, '\tBEMVINDO10\n'));
await out('cupom com espaço NBSP', calc(base, ' BEMVINDO10 '));
await out('cupom com espaço no meio', calc(base, 'BEMVINDO 10'));
await out('cupom 5000 caracteres', calc(base, 'A'.repeat(5000)));
await out('cupom ı (i sem ponto) maiúsc. "BEMVİNDO10"', calc(base, 'BEMVİNDO10'));
await out('cupom ﬃ/unicode "ＢＥＭＶＩＮＤＯ１０" (full width)', calc(base, 'ＢＥＭＶＩＮＤＯ１０'));
await out('corpo vazio', j('POST', '/api/carrinho/calcular', undefined, ''));
await out('corpo "null"', j('POST', '/api/carrinho/calcular', null, 'null'));
await out('corpo número', j('POST', '/api/carrinho/calcular', null, '5'));
await out('sem Content-Type', j('POST', '/api/carrinho/calcular', null, JSON.stringify({ itens: base }), {}));
await out('Content-Type text/plain', j('POST', '/api/carrinho/calcular', null, JSON.stringify({ itens: base }), { 'Content-Type': 'text/plain' }));
await out('campos extras no corpo', j('POST', '/api/carrinho/calcular', { itens: base, foo: 1 }));
await out('GET /api (rota raiz da API)', j('GET', '/api'));
await out('GET /api/ (barra final)', j('GET', '/api/'));
await out('GET /api/produtos/ (barra final)', j('GET', '/api/produtos/'));
await out('GET /api/produtos?x=1', j('GET', '/api/produtos?x=1'));
await out('GET /api/PRODUTOS (caixa)', j('GET', '/api/PRODUTOS'));
await out('DELETE /api/produtos/P001', j('DELETE', '/api/produtos/P001'));
await out('POST /api/produtos', j('POST', '/api/produtos', {}));
await out('OPTIONS /api/pedidos', j('OPTIONS', '/api/pedidos'));
await out('HEAD /api/produtos', j('HEAD', '/api/produtos'));
await out('GET /api/carrinho', j('GET', '/api/carrinho'));
await out('GET /api/produtos/P001/extra', j('GET', '/api/produtos/P001/extra'));
await out('GET /api/produtos/%20', j('GET', '/api/produtos/%20'));

// ---------- D) cliente do pedido ----------
const ped = (cliente) => j('POST', '/api/pedidos', { cliente, itens: base });
await out('nome com espaços nas pontas', ped({ ...cli, nome: '  Maria Silva  ' }));
await out('nome com números "M4ria S1lva"', ped({ ...cli, nome: 'M4ria S1lva' }));
await out('nome com tag HTML', ped({ ...cli, nome: '<b>Maria</b> <i>Silva</i>' }));
await out('nome 1000 letras', ped({ ...cli, nome: 'A'.repeat(500) + ' ' + 'B'.repeat(500) }));
await out('nome só símbolos "!! ??"', ped({ ...cli, nome: '!! ??' }));
await out('nome com 2 palavras de 1 letra "A B"', ped({ ...cli, nome: 'A B' }));
await out('nome "Zé Li" (acento / 2 letras)', ped({ ...cli, nome: 'Zé Li' }));
await out('nome não é string', ped({ ...cli, nome: 123 }));
await out('email com espaço', ped({ ...cli, email: 'ma ria@exemplo.com' }));
await out('email com espaços nas pontas', ped({ ...cli, email: ' maria@exemplo.com ' }));
await out('email "a@b.c"', ped({ ...cli, email: 'a@b.c' }));
await out('email 300 caracteres', ped({ ...cli, email: 'a'.repeat(300) + '@exemplo.com' }));
await out('email duplo arroba', ped({ ...cli, email: 'a@@b.com' }));
await out('cep com espaço "01310 100"', ped({ ...cli, cep: '01310 100' }));
await out('cep com espaços nas pontas', ped({ ...cli, cep: ' 01310-100 ' }));
await out('cep numérico 1310100 (number)', ped({ ...cli, cep: 1310100 }));
await out('cep 00000-000', ped({ ...cli, cep: '00000-000' }));
await out('cliente null', j('POST', '/api/pedidos', { cliente: null, itens: base }));
await out('cliente array', j('POST', '/api/pedidos', { cliente: [], itens: base }));
await out('pedido sem itens e sem cliente', j('POST', '/api/pedidos', {}));
await out('pedido com cliente inválido E itens vazios', j('POST', '/api/pedidos', { cliente: {}, itens: [] }));
await out('pedido com cliente inválido E cupom inválido', j('POST', '/api/pedidos', { cliente: {}, itens: base, cupom: 'XYZ' }));
await out('pedido com qtd 0 E cliente inválido', j('POST', '/api/pedidos', { cliente: {}, itens: [{ produtoId: 'P004', quantidade: 0 }] }));
