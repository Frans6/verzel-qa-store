import { chromium } from '@playwright/test';
const U = 'https://verzel-store.qa-test-verzel-store.workers.dev';
const SS = 'docs/04-evidencias/screenshots/';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
const log = (...a) => console.log(...a);
const val = async (k) => (await p.locator(`[data-valor="${k}"]`).first().textContent().catch(() => null));
const resumo = async () => { await p.waitForTimeout(800); return { sub: await val('subtotal'), desc: await val('desconto'), frete: await val('frete'), total: await val('total') }; };
const seed = (itens, cupom = null) => p.evaluate(([i, c]) => { sessionStorage.setItem('verzel-store:itens', JSON.stringify(i)); sessionStorage.setItem('verzel-store:cupom', JSON.stringify(c)); }, [itens, cupom]);
const preencher = async (n = 'Maria Silva', e = 'maria@exemplo.com', c = '01310-100') => {
  await p.getByLabel('Nome completo').fill(n); await p.getByLabel('E-mail').fill(e); await p.getByLabel('CEP').fill(c);
};

await p.goto(U + '/'); await p.evaluate(() => sessionStorage.clear());

// 1) Formatação com milhar: 5x Jaqueta + cupom
await seed([{ produtoId: 'P007', quantidade: 5 }], 'BEMVINDO10');
await p.goto(U + '/carrinho'); log('1) 5x Jaqueta + cupom:', await resumo());
await p.screenshot({ path: SS + 'UI-18-milhar.png', fullPage: true });

// 2) Resumo do checkout x tela de confirmação (valores e cupom)
await p.getByRole('link', { name: 'Finalizar compra' }).click(); await p.waitForTimeout(800);
const resCheckout = await resumo(); log('2) resumo no checkout:', resCheckout);
await preencher(); await p.getByRole('button', { name: 'Confirmar pedido' }).click(); await p.waitForURL(/pedido-confirmado/);
const resConf = await resumo(); log('   resumo na confirmação:', resConf, '| iguais:', JSON.stringify(resCheckout) === JSON.stringify(resConf));
log('   rótulo do desconto na confirmação:', await p.locator('.resumo-valores dt').nth(1).textContent());
await p.screenshot({ path: SS + 'UI-19-confirmacao-cupom.png', fullPage: true });

// 3) Botão Voltar do navegador depois de confirmar
await p.goBack(); await p.waitForTimeout(800); log('3) voltar após confirmar ->', p.url().replace(U, ''), '| h1:', await p.locator('h1').first().textContent());
await p.goBack(); await p.waitForTimeout(800); log('   voltar de novo ->', p.url().replace(U, ''));

// 4) Recarregar a página mantém carrinho e cupom
await p.evaluate(() => sessionStorage.clear());
await seed([{ produtoId: 'P005', quantidade: 1 }], 'BEMVINDO10');
await p.goto(U + '/carrinho'); await p.reload(); log('4) após F5:', await resumo(), '| contador:', await p.locator('.contador-carrinho').textContent());

// 5) Enter no campo de cupom aplica?
await p.getByRole('button', { name: 'Remover cupom' }).click(); await p.waitForTimeout(500);
await p.getByLabel('Cupom de desconto').fill('BEMVINDO10'); await p.getByLabel('Cupom de desconto').press('Enter'); await p.waitForTimeout(900);
log('5) Enter aplica cupom:', await p.locator('.cupom-aplicado').count() === 1);

// 6) Duplo clique em "Confirmar pedido": quantos POST /api/pedidos?
let posts = 0; p.on('request', (r) => { if (r.url().endsWith('/api/pedidos') && r.method() === 'POST') posts++; });
await p.goto(U + '/checkout'); await preencher();
await p.getByRole('button', { name: 'Confirmar pedido' }).dblclick(); await p.waitForTimeout(1500);
log('6) POSTs /api/pedidos com duplo clique:', posts, '->', p.url().replace(U, ''));

// 7) Duplo clique em "Aplicar cupom"
await p.evaluate(() => sessionStorage.clear()); await seed([{ produtoId: 'P005', quantidade: 1 }]);
await p.goto(U + '/carrinho'); let calc = 0; p.on('request', (r) => { if (r.url().endsWith('/api/carrinho/calcular')) calc++; });
await p.getByLabel('Cupom de desconto').fill('BEMVINDO10'); await p.getByRole('button', { name: 'Aplicar cupom' }).dblclick(); await p.waitForTimeout(1200);
log('7) chamadas a /calcular com duplo clique em Aplicar:', calc, '| cupom aplicado:', await p.locator('.cupom-aplicado').count() === 1);

// 8) Cupom aplicado e o subtotal muda: cruza 200 para baixo e para cima (CA08/CA06)
await p.evaluate(() => sessionStorage.clear());
await seed([{ produtoId: 'P003', quantidade: 1 }, { produtoId: 'P006', quantidade: 1 }], 'BEMVINDO10');
await p.goto(U + '/carrinho'); log('8) 219,80 + cupom:', await resumo());
await p.getByRole('button', { name: /Remover Kit 3 Pares/ }).click(); log('   remover Meias (189,90 + cupom):', await resumo());

// 9) Quantidade acima de 5 vinda do armazenamento da aba (a UI confia no que está salvo)
await p.evaluate(() => sessionStorage.clear());
await seed([{ produtoId: 'P004', quantidade: 9 }]);
await p.goto(U + '/carrinho'); await p.waitForTimeout(800);
log('9) sessionStorage com 9 unidades -> UI mostra:', await p.locator('.seletor-quantidade output').textContent(), await resumo(), '| aviso de limite:', await p.locator('.item-limite').count());
await p.screenshot({ path: SS + 'UI-20-quantidade-9-via-storage.png', fullPage: true });

// 10) Dados corrompidos no armazenamento
await p.evaluate(() => { sessionStorage.setItem('verzel-store:itens', '{quebrado'); });
await p.goto(U + '/carrinho'); await p.waitForTimeout(800); log('10) JSON corrompido no storage ->', await p.locator('h1').first().textContent());
await p.evaluate(() => { sessionStorage.setItem('verzel-store:itens', JSON.stringify([{ produtoId: 'P999', quantidade: 1 }])); });
await p.goto(U + '/carrinho'); await p.waitForTimeout(1000);
log('    produto inexistente no storage -> h1:', await p.locator('h1').first().textContent(), '| contador:', await p.locator('.contador-carrinho').textContent(), '| mensagem erro:', await p.getByRole('alert').allTextContents());
await p.screenshot({ path: SS + 'UI-21-produto-inexistente-storage.png', fullPage: true });
await p.evaluate(() => sessionStorage.setItem('verzel-store:cupom', JSON.stringify('VERAO2026')));
await p.evaluate(() => sessionStorage.setItem('verzel-store:itens', JSON.stringify([{ produtoId: 'P005', quantidade: 1 }])));
await p.goto(U + '/carrinho'); await p.waitForTimeout(1000);
log('    cupom EXPIRADO salvo no storage:', await resumo(), '| texto cupom:', await p.locator('.cupom-aplicado').textContent().catch(() => 'sem bloco de cupom'));
await p.screenshot({ path: SS + 'UI-22-cupom-expirado-storage.png', fullPage: true });

// 11) Cupom aplicado, remover cupom e conferir mensagem anterior
// 12) Layout em telas estreitas e teclado
for (const w of [320, 768]) {
  await p.setViewportSize({ width: w, height: 800 });
  await p.evaluate(() => sessionStorage.clear()); await seed([{ produtoId: 'P007', quantidade: 5 }], 'BEMVINDO10');
  for (const rota of ['/', '/carrinho', '/checkout', '/documentacao']) {
    await p.goto(U + rota); await p.waitForTimeout(700);
    const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    log(`12) ${w}px ${rota}: excesso horizontal = ${over}px`);
  }
}
await p.setViewportSize({ width: 320, height: 800 }); await p.goto(U + '/carrinho'); await p.waitForTimeout(800);
await p.screenshot({ path: SS + 'UI-23-mobile-320-carrinho.png', fullPage: true });
await p.setViewportSize({ width: 1280, height: 900 });

// 13) Teclado: ordem de foco no carrinho
await p.goto(U + '/carrinho'); await p.waitForTimeout(600);
const ordem = []; for (let i = 0; i < 12; i++) { await p.keyboard.press('Tab'); ordem.push(await p.evaluate(() => { const e = document.activeElement; return (e?.getAttribute('aria-label') || e?.textContent || e?.tagName || '').trim().slice(0, 35); })); }
log('13) ordem de Tab:', JSON.stringify(ordem));

// 14) Títulos das páginas e foco/idioma
for (const rota of ['/', '/carrinho', '/checkout', '/documentacao', '/pedido-confirmado', '/xpto']) { await p.goto(U + rota); await p.waitForTimeout(400); log('14) título', rota.padEnd(20), '=>', await p.title(), '| lang:', await p.evaluate(() => document.documentElement.lang)); }
await b.close();
