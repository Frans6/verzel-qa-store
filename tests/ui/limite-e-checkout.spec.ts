import { test, expect } from '@playwright/test';
import { abrirCarrinho, adicionarAoCarrinho, aplicarCupom, resumo, PRODUTOS } from '../support/loja';

test('CT-021 (UI): vitrine bloqueia a 6ª unidade e mostra o aviso de limite', async ({ page }) => {
  await adicionarAoCarrinho(page, 'P004', 7);
  const card = page.locator('article', { hasText: PRODUTOS.P004 });
  await expect(card.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeDisabled();
  await expect(card.getByText('Limite de 5 unidades atingido.')).toBeVisible();
  await expect(page.locator('.contador-carrinho')).toHaveText('5');
});

test('CT-022 (UI): carrinho desabilita "+" no limite de 5 unidades', async ({ page }) => {
  await adicionarAoCarrinho(page, 'P004', 5);
  await abrirCarrinho(page);
  await expect(page.getByRole('button', { name: /Aumentar quantidade/ })).toBeDisabled();
  await expect(page.getByText('Limite de 5 unidades por produto.')).toBeVisible();
});

async function irParaCheckout(page: import('@playwright/test').Page) {
  await adicionarAoCarrinho(page, 'P005');
  await page.goto('/checkout');
}

test('CT-035 (UI): checkout valida campos obrigatórios', async ({ page }) => {
  await irParaCheckout(page);
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();
  await expect(page.getByText('Informe o nome completo.')).toBeVisible();
  await expect(page.getByText('Informe o e-mail.')).toBeVisible();
  await expect(page.getByText('Informe o CEP.')).toBeVisible();
});

test('CT-036 (UI): checkout rejeita nome sem sobrenome, e-mail e CEP inválidos', async ({ page }) => {
  await irParaCheckout(page);
  await page.getByLabel('Nome completo').fill('Maria');
  await page.getByLabel('E-mail').fill('a@b');
  await page.getByLabel('CEP').fill('0131010');
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();
  await expect(page.getByText('Informe nome e sobrenome.')).toBeVisible();
  await expect(page.getByText('Informe um e-mail válido.')).toBeVisible();
  await expect(page.getByText('Informe um CEP com 8 dígitos.')).toBeVisible();
});

test('CT-037 (UI): pedido válido é confirmado e mostra o número no formato VZ-000000', async ({ page }) => {
  await irParaCheckout(page);
  await page.getByLabel('Nome completo').fill('Maria Silva');
  await page.getByLabel('E-mail').fill('maria@exemplo.com');
  await page.getByLabel('CEP').fill('01310-100');
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();
  await expect(page).toHaveURL(/pedido-confirmado/);
  await expect(page.locator('.numero-pedido')).toHaveText(/^VZ-\d{6}$/);
});

test('CT-049 (UI): resumo do checkout e da confirmação são iguais, com cupom', async ({ page }) => {
  await adicionarAoCarrinho(page, 'P007', 5);
  await abrirCarrinho(page);
  await aplicarCupom(page, 'BEMVINDO10');
  await expect(resumo(page).total).toHaveText('R$ 1.034,55');
  await page.getByRole('link', { name: 'Finalizar compra' }).click();
  await expect(resumo(page).total).toHaveText('R$ 1.034,55');
  await page.getByLabel('Nome completo').fill('Maria Silva');
  await page.getByLabel('E-mail').fill('maria@exemplo.com');
  await page.getByLabel('CEP').fill('01310-100');
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();
  await expect(page).toHaveURL(/pedido-confirmado/);
  await expect(resumo(page).subtotal).toHaveText('R$ 1.149,50');
  await expect(resumo(page).desconto).toHaveText('- R$ 114,95');
  await expect(resumo(page).frete).toHaveText('Grátis');
  await expect(resumo(page).total).toHaveText('R$ 1.034,55');
});

test('CT-051 (UI): recarregar a página (F5) mantém carrinho e cupom', async ({ page }) => {
  await adicionarAoCarrinho(page, 'P005');
  await abrirCarrinho(page);
  await aplicarCupom(page, 'BEMVINDO10');
  await expect(resumo(page).total).toHaveText('R$ 109,90');
  await page.reload();
  await expect(page.locator('.contador-carrinho')).toHaveText('1');
  await expect(page.getByText('Cupom BEMVINDO10 aplicado.')).toBeVisible();
  await expect(resumo(page).total).toHaveText('R$ 109,90');
});

test('CT-038 (UI): checkout com carrinho vazio redireciona para o carrinho', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page).toHaveURL(/\/carrinho$/);
});
