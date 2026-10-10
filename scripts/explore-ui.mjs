import { chromium } from '@playwright/test';
const U = 'https://verzel-store.qa-test-verzel-store.workers.dev';
const SS = 'docs/04-evidencias/screenshots/';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
const prods = { P001: 'Camiseta Essencial', P002: 'Calça Jeans Slim', P003: 'Tênis Casual Urbano', P004: 'Boné Aba Curva', P005: 'Mochila Urbana 20L', P006: 'Kit 3 Pares de Meias', P007: 'Jaqueta Corta-Vento', P008: 'Garrafa Térmica 750ml' };
async function add(id, n = 1) {
  await p.goto(U + '/');
  for (let i = 0; i < n; i++) {
    const btn = p.locator('article', { hasText: prods[id] }).getByRole('button', { name: 'Adicionar ao carrinho' });
    if (await btn.isDisabled()) break;
    await btn.click();
  }
}
async function resumo() {
  await p.waitForTimeout(700);
  const g = async (k) => await p.locator(`[data-valor="${k}"]`).first().textContent().catch(() => null);
  return { sub: await g('subtotal'), desc: await g('desconto'), frete: await g('frete'), total: await g('total'), aviso: await p.locator('.aviso-frete').textContent().catch(() => null) };
}
async function reset() { await p.goto(U + '/carrinho'); await p.evaluate(() => sessionStorage.clear()); await p.goto(U + '/'); }
async function cupom(c) {
  await p.getByLabel('Cupom de desconto').fill(c);
  await p.getByRole('button', { name: 'Aplicar cupom' }).click();
  await p.waitForTimeout(700);
  return await p.locator('#mensagem-cupom').textContent().catch(() => null);
}
const log = (...a) => console.log(...a);

await reset(); await p.screenshot({ path: SS + 'UI-01-vitrine.png', fullPage: true });
await p.goto(U + '/carrinho'); log('vazio:', await p.locator('h1').textContent());

await reset(); await add('P004', 7);
log('limite vitrine:', await p.locator('article', { hasText: prods.P004 }).locator('.produto-aviso').textContent(), '| contador:', await p.locator('.contador-carrinho').textContent());
await p.screenshot({ path: SS + 'UI-02-limite-vitrine.png' });
await p.goto(U + '/carrinho');
log('limite carrinho:', await p.locator('.item-limite').textContent(), '| + disabled:', await p.getByRole('button', { name: /Aumentar/ }).isDisabled(), await resumo());
await p.screenshot({ path: SS + 'UI-03-limite-carrinho.png' });

await reset(); await add('P005', 1); await add('P008', 2); await p.goto(U + '/carrinho');
log('BORDA 200:', await resumo());
await p.screenshot({ path: SS + 'BUG-001-ui-borda-200.png', fullPage: true });
log('cupom msg:', await cupom('bemvindo10'));
log('BORDA 200 + cupom:', await resumo());
await p.screenshot({ path: SS + 'UI-04-borda-200-cupom.png', fullPage: true });

await reset(); await add('P001', 1); await add('P002', 1); await p.goto(U + '/carrinho');
log('199.80:', await resumo());
await p.screenshot({ path: SS + 'UI-05-subtotal-199-80.png', fullPage: true });

await reset(); await add('P007', 1); await p.goto(U + '/carrinho');
log('P007 sem cupom', await resumo());
log('cupom:', await cupom(' BemVindo10 '));
log('P007 com cupom:', await resumo());
await p.screenshot({ path: SS + 'UI-06-ca08-cupom-frete.png', fullPage: true });

await reset(); await add('P005', 1); await p.goto(U + '/carrinho');
log('cupom em branco:', await cupom('   '));
log('inexistente:', await cupom('XYZ'));
await p.screenshot({ path: SS + 'UI-07-cupom-invalido.png' });
log('expirado:', await cupom('VERAO2026'));
await p.screenshot({ path: SS + 'UI-08-cupom-expirado.png' });
log(await resumo());
log('valido:', await cupom('BEMVINDO10'));
log('campo cupom visível após aplicar:', await p.getByLabel('Cupom de desconto').count());
await p.screenshot({ path: SS + 'UI-09-cupom-aplicado.png', fullPage: true });
await p.getByRole('button', { name: 'Remover cupom' }).click(); await p.waitForTimeout(700);
log('após remover:', await resumo());
log('expirado após remover:', await cupom('VERAO2026'));

await reset(); await add('P005', 1); await p.goto(U + '/carrinho'); await cupom('BEMVINDO10');
await p.getByRole('button', { name: /Aumentar/ }).click(); log('cupom + qtd 2:', await resumo());
await p.getByRole('button', { name: /Diminuir/ }).click(); log('cupom + qtd 1:', await resumo());
await p.getByRole('button', { name: /Remover Mochila/ }).click();
log('carrinho vazio h1:', await p.locator('h1').textContent());
await add('P006', 1); await p.goto(U + '/carrinho');
log('cupom residual após esvaziar por Remover:', await p.locator('.cupom-aplicado').textContent().catch(() => 'sem cupom aplicado'), await resumo());
await p.screenshot({ path: SS + 'UI-10-cupom-residual.png', fullPage: true });
await p.getByRole('button', { name: 'Esvaziar carrinho' }).click();
await add('P006', 1); await p.goto(U + '/carrinho');
log('após Esvaziar carrinho:', await p.locator('.cupom-aplicado').textContent().catch(() => 'sem cupom aplicado'));

await reset(); await add('P005', 2); await p.goto(U + '/checkout');
await p.getByRole('button', { name: 'Confirmar pedido' }).click();
log('checkout vazio erros:', await p.locator('.campo .mensagem-erro').allTextContents());
await p.screenshot({ path: SS + 'UI-11-checkout-erros.png', fullPage: true });
for (const [n, e, c] of [['Maria', 'a@b.com', '01310100'], ['Maria S', 'a@b.com', '01310100'], ['Maria Silva', 'a@b', '01310100'], ['Maria Silva', 'a@b.com', '0131010'], ['Maria Silva', 'a@b.com', '01310-100']]) {
  await p.goto(U + '/checkout');
  await p.getByLabel('Nome completo').fill(n); await p.getByLabel('E-mail').fill(e); await p.getByLabel('CEP').fill(c);
  await p.getByRole('button', { name: 'Confirmar pedido' }).click(); await p.waitForTimeout(900);
  log('checkout', JSON.stringify([n, e, c]), '->', p.url().replace(U, ''), await p.locator('.campo .mensagem-erro').allTextContents());
  if (p.url().includes('confirmado')) {
    await p.screenshot({ path: SS + 'UI-12-pedido-confirmado.png', fullPage: true });
    log('confirmado:', await p.locator('h1').textContent(), await resumo());
  }
}
await p.goto(U + '/checkout'); log('checkout carrinho vazio ->', p.url().replace(U, ''));
await p.goto(U + '/xpto'); log('rota inexistente h1:', await p.locator('h1').textContent().catch(() => null));
await p.screenshot({ path: SS + 'UI-13-rota-inexistente.png' });
await p.goto(U + '/pedido-confirmado'); log('pedido-confirmado direto:', await p.locator('h1').textContent());
await b.close();
