import { test, expect } from '@playwright/test';
import { abrirCarrinho, resumo } from '../support/loja';

const brl = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

type Produto = { id: string; nome: string; descricao: string; categoria: string; preco: number };

test('CT-044 (UI): vitrine exibe os 8 produtos iguais aos da API', async ({ page, request }) => {
  const produtos: Produto[] = await (await request.get('/api/produtos')).json();
  expect(produtos).toHaveLength(8);
  await page.goto('/');
  const cards = page.locator('.produto');
  await expect(cards).toHaveCount(8);
  for (const p of produtos) {
    const card = page.locator('.produto', { hasText: p.nome });
    await expect(card.locator('.produto-categoria')).toHaveText(p.categoria);
    await expect(card.locator('.produto-descricao')).toHaveText(p.descricao);
    await expect(card.locator('.produto-preco')).toHaveText(brl(p.preco));
  }
});

test('CT-045/046 (UI): 1 de cada produto — preços no carrinho, contador e subtotal', async ({ page, request }) => {
  const produtos: Produto[] = await (await request.get('/api/produtos')).json();
  await page.goto('/');
  const botoes = page.getByRole('button', { name: 'Adicionar ao carrinho' });
  await expect(botoes).toHaveCount(8);
  for (let i = 0; i < 8; i++) await botoes.nth(i).click();
  await expect(page.locator('.contador-carrinho')).toHaveText('8');

  await abrirCarrinho(page);
  for (const p of produtos) {
    const linha = page.locator('.item-carrinho', { hasText: p.nome });
    await expect(linha.locator('.item-unitario')).toHaveText(`${brl(p.preco)} cada`);
    await expect(linha.locator('.item-total')).toHaveText(brl(p.preco));
  }
  await expect(resumo(page).subtotal).toHaveText('R$ 849,40');
});

test('CT-047 (UI): falha na API de produtos mostra mensagem de erro', async ({ page }) => {
  await page.route('**/api/produtos', (r) => r.fulfill({ status: 500, body: '{}' }));
  await page.goto('/');
  await expect(page.getByRole('alert')).toHaveText('Não foi possível carregar os produtos. Recarregue a página para tentar de novo.');
});
