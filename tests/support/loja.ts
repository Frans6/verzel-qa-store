import { expect, type APIRequestContext, type Page } from '@playwright/test';

export type Item = { produtoId: string; quantidade: number };

export const PRODUTOS = {
  P001: 'Camiseta Essencial',
  P002: 'Calça Jeans Slim',
  P003: 'Tênis Casual Urbano',
  P004: 'Boné Aba Curva',
  P005: 'Mochila Urbana 20L',
  P006: 'Kit 3 Pares de Meias',
  P007: 'Jaqueta Corta-Vento',
  P008: 'Garrafa Térmica 750ml',
} as const;

export const CLIENTE = { nome: 'Maria Silva', email: 'maria@exemplo.com', cep: '01310-100' };

// ---------- API ----------
export async function calcular(api: APIRequestContext, itens: Item[], cupom?: string) {
  return api.post('/api/carrinho/calcular', { data: { itens, ...(cupom !== undefined ? { cupom } : {}) } });
}

export async function criarPedido(api: APIRequestContext, itens: Item[], cupom?: string, cliente = CLIENTE) {
  return api.post('/api/pedidos', { data: { cliente, itens, ...(cupom !== undefined ? { cupom } : {}) } });
}

// ---------- UI ----------
export async function adicionarAoCarrinho(page: Page, produtoId: keyof typeof PRODUTOS, vezes = 1) {
  await page.goto('/');
  const botao = page
    .locator('article', { hasText: PRODUTOS[produtoId] })
    .getByRole('button', { name: 'Adicionar ao carrinho' });
  for (let i = 0; i < vezes; i++) {
    if (await botao.isDisabled()) break;
    await botao.click();
  }
}

export function resumo(page: Page) {
  const valor = (k: string) => page.locator(`[data-valor="${k}"]`);
  return {
    subtotal: valor('subtotal'),
    desconto: valor('desconto'),
    frete: valor('frete'),
    total: valor('total'),
    avisoFrete: page.locator('.aviso-frete'),
  };
}

export async function aplicarCupom(page: Page, codigo: string) {
  await page.getByLabel('Cupom de desconto').fill(codigo);
  await page.getByRole('button', { name: 'Aplicar cupom' }).click();
}

export async function abrirCarrinho(page: Page) {
  await page.goto('/carrinho');
  await expect(page.getByRole('heading', { name: 'Carrinho' })).toBeVisible();
}
