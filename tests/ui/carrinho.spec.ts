import { test, expect } from '@playwright/test';
import { abrirCarrinho, adicionarAoCarrinho, aplicarCupom, resumo } from '../support/loja';

test('CT-001 (UI): BEMVINDO10 aplica 10% sobre o subtotal', async ({ page }) => {
  await adicionarAoCarrinho(page, 'P005');
  await abrirCarrinho(page);
  await aplicarCupom(page, 'BEMVINDO10');
  const r = resumo(page);
  await expect(r.desconto).toHaveText('- R$ 10,00');
  await expect(r.frete).toHaveText('R$ 19,90');
  await expect(r.total).toHaveText('R$ 109,90');
  await expect(page.getByText('Cupom BEMVINDO10 aplicado.')).toBeVisible();
});

test('CT-002/003 (UI): cupom em minúsculas e com espaços é aceito', async ({ page }) => {
  await adicionarAoCarrinho(page, 'P005');
  await abrirCarrinho(page);
  await aplicarCupom(page, '  bemvindo10 ');
  await expect(resumo(page).desconto).toHaveText('- R$ 10,00');
});

test('CT-004 (UI): cupom inexistente mostra "Cupom inválido." e não dá desconto', async ({ page }) => {
  await adicionarAoCarrinho(page, 'P005');
  await abrirCarrinho(page);
  await aplicarCupom(page, 'XYZ');
  await expect(page.locator('#mensagem-cupom')).toHaveText('Cupom inválido.');
  await expect(resumo(page).desconto).toHaveText('R$ 0,00');
});

test('CT-005 (UI): cupom expirado mostra "Cupom expirado." e não dá desconto', async ({ page }) => {
  await adicionarAoCarrinho(page, 'P005');
  await abrirCarrinho(page);
  await aplicarCupom(page, 'VERAO2026');
  await expect(page.locator('#mensagem-cupom')).toHaveText('Cupom expirado.');
  await expect(resumo(page).desconto).toHaveText('R$ 0,00');
});

test('CT-007/008 (UI): só um cupom por vez; para trocar é preciso remover o atual', async ({ page }) => {
  await adicionarAoCarrinho(page, 'P005');
  await abrirCarrinho(page);
  await aplicarCupom(page, 'BEMVINDO10');
  await expect(page.getByLabel('Cupom de desconto')).toHaveCount(0);
  await page.getByRole('button', { name: 'Remover cupom' }).click();
  await expect(resumo(page).desconto).toHaveText('R$ 0,00');
  await expect(page.getByLabel('Cupom de desconto')).toBeVisible();
});

test('CT-019 (UI): abaixo de R$ 200,00 cobra frete e informa quanto falta', async ({ page }) => {
  await adicionarAoCarrinho(page, 'P001');
  await adicionarAoCarrinho(page, 'P002');
  await abrirCarrinho(page);
  const r = resumo(page);
  await expect(r.subtotal).toHaveText('R$ 199,80');
  await expect(r.frete).toHaveText('R$ 19,90');
  await expect(r.avisoFrete).toHaveText('Faltam R$ 0,20 para o frete grátis.');
});

test('CT-016 (UI) @bug-001: subtotal EXATO de R$ 200,00 tem frete grátis', async ({ page }) => {
  await adicionarAoCarrinho(page, 'P005');
  await adicionarAoCarrinho(page, 'P008', 2);
  await abrirCarrinho(page);
  const r = resumo(page);
  await expect(r.subtotal).toHaveText('R$ 200,00');
  await expect(r.frete).toHaveText('Grátis');
  await expect(r.total).toHaveText('R$ 200,00');
});

test('CT-018 (UI): frete grátis considera o subtotal antes do cupom', async ({ page }) => {
  await adicionarAoCarrinho(page, 'P003');
  await adicionarAoCarrinho(page, 'P006');
  await abrirCarrinho(page);
  await aplicarCupom(page, 'BEMVINDO10');
  const r = resumo(page);
  await expect(r.desconto).toHaveText('- R$ 21,98');
  await expect(r.frete).toHaveText('Grátis');
  await expect(r.total).toHaveText('R$ 197,82');
});
