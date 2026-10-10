import { chromium } from '@playwright/test';
const U = 'https://verzel-store.qa-test-verzel-store.workers.dev';
const SS = 'docs/04-evidencias/screenshots/';
const b = await chromium.launch();
const seed = (p) => p.evaluate(() => {
  sessionStorage.setItem('verzel-store:itens', JSON.stringify([{ produtoId: 'P007', quantidade: 5 }, { produtoId: 'P003', quantidade: 2 }]));
  sessionStorage.setItem('verzel-store:cupom', JSON.stringify('BEMVINDO10'));
});
const casos = [
  ['375', 375, 800, ['/documentacao', '/', '/carrinho', '/checkout']],
  ['1920', 1920, 1000, ['/', '/carrinho']],
];
for (const [nome, w, h, rotas] of casos) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await p.goto(U + '/'); await seed(p);
  for (const r of rotas) {
    await p.goto(U + r); await p.waitForTimeout(1200);
    const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    // elementos cujo texto está cortado/transbordando
    const cortados = await p.evaluate(() => [...document.querySelectorAll('h1,h2,h3,p,span,button,a,dd,dt,td,th,code')].filter((e) => e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible').map((e) => e.tagName + ':' + e.textContent.trim().slice(0, 30)).slice(0, 5));
    // alvos de toque pequenos (< 24px)
    const pequenos = await p.evaluate(() => [...document.querySelectorAll('button,a,input')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24); }).map((e) => (e.getAttribute('aria-label') || e.textContent.trim() || e.tagName).slice(0, 30) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)).slice(0, 6));
    console.log(`${nome}px ${r}: excesso=${over}px | texto cortado=${JSON.stringify(cortados)} | alvos <24px=${JSON.stringify(pequenos)}`);
    await p.screenshot({ path: `${SS}VIS-${nome}${r === '/' ? '-home' : r.replace(/\//g, '-')}.png`, fullPage: true });
  }
}
await b.close();
