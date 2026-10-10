import { chromium } from '@playwright/test';
const U = 'https://verzel-store.qa-test-verzel-store.workers.dev';
const SS = 'docs/04-evidencias/screenshots/';

// Tabela "Dados para teste" da documentação
const DOC = {
  P001: ['Camiseta Essencial', 59.9], P002: ['Calça Jeans Slim', 139.9], P003: ['Tênis Casual Urbano', 189.9],
  P004: ['Boné Aba Curva', 49.9], P005: ['Mochila Urbana 20L', 100], P006: ['Kit 3 Pares de Meias', 29.9],
  P007: ['Jaqueta Corta-Vento', 229.9], P008: ['Garrafa Térmica 750ml', 50],
};
const brl = (n) => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const api = await (await fetch(U + '/api/produtos')).json();
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await p.goto(U + '/');
await p.locator('.produto').first().waitFor();
const cards = await p.locator('.produto').evaluateAll((els) => els.map((e) => ({
  nome: e.querySelector('h3')?.textContent.trim(),
  categoria: e.querySelector('.produto-categoria')?.textContent.trim(),
  descricao: e.querySelector('.produto-descricao')?.textContent.trim(),
  preco: e.querySelector('.produto-preco')?.textContent.trim(),
})));
console.log('cards na vitrine:', cards.length, '| produtos na API:', api.length, '| na documentação:', Object.keys(DOC).length);
let falhas = 0;
for (const a of api) {
  const c = cards.find((x) => x.nome === a.nome);
  const d = DOC[a.id];
  const ok = {
    naVitrine: !!c,
    nomeDoc: d && d[0] === a.nome,
    precoDoc: d && d[1] === a.preco,
    precoUI: c && c.preco === brl(a.preco),
    categoria: c && c.categoria === a.categoria,
    descricao: c && c.descricao === a.descricao,
  };
  const bad = Object.entries(ok).filter(([, v]) => !v).map(([k]) => k);
  if (bad.length) falhas++;
  console.log(a.id, a.nome, '|', c?.preco, '|', a.categoria, '|', bad.length ? 'DIVERGE: ' + bad.join(',') : 'ok');
}
console.log('produtos com divergência:', falhas);
await p.screenshot({ path: SS + 'UI-15-vitrine-produtos.png', fullPage: true });

// Preço no carrinho x vitrine, soma e contador (1 de cada produto)
await p.evaluate(() => sessionStorage.clear());
await p.goto(U + '/');
await p.locator('.produto').first().waitFor();
const botoes = p.getByRole('button', { name: 'Adicionar ao carrinho' });
const n = await botoes.count();
for (let i = 0; i < n; i++) await botoes.nth(i).click();
console.log('contador após 1 de cada:', await p.locator('.contador-carrinho').textContent());
await p.goto(U + '/carrinho');
await p.locator('.item-carrinho').first().waitFor();
await p.waitForTimeout(800);
const linhas = await p.locator('.item-carrinho').evaluateAll((els) => els.map((e) => ({
  nome: e.querySelector('h3')?.textContent.trim(),
  unit: e.querySelector('.item-unitario')?.textContent.trim(),
  total: e.querySelector('.item-total')?.textContent.trim(),
})));
for (const l of linhas) {
  const a = api.find((x) => x.nome === l.nome);
  console.log('carrinho:', l.nome, '|', l.unit, '|', l.total, '|', l.unit === brl(a.preco) + ' cada' && l.total === brl(a.preco) ? 'ok' : 'DIVERGE');
}
const soma = api.reduce((s, x) => s + x.preco, 0);
console.log('soma esperada:', brl(Math.round(soma * 100) / 100), '| subtotal exibido:', await p.locator('[data-valor="subtotal"]').first().textContent());
await p.screenshot({ path: SS + 'UI-16-carrinho-8-produtos.png', fullPage: true });

// Falha da API de produtos: a vitrine deve avisar
const p2 = await (await b.newContext()).newPage();
await p2.route('**/api/produtos', (r) => r.fulfill({ status: 500, body: '{}' }));
await p2.goto(U + '/');
await p2.waitForTimeout(1500);
console.log('API de produtos com erro 500 -> vitrine mostra:', await p2.locator('.estado-erro').textContent().catch(() => 'sem mensagem'));
await p2.screenshot({ path: SS + 'UI-17-vitrine-erro-api.png' });
await b.close();
