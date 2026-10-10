const B='https://verzel-store.qa-test-verzel-store.workers.dev/api';
async function call(m,p,body,raw){
  const r=await fetch(B+p,{method:m,headers:{'Content-Type':'application/json'},body:raw??(body?JSON.stringify(body):undefined)});
  let t=await r.text(); return {s:r.status,t};
}
const calc=(itens,cupom)=>call('POST','/carrinho/calcular',{itens,...(cupom!==undefined?{cupom}:{})});
const it=(id,q)=>({produtoId:id,quantidade:q});
const cases=[
 ['GET produtos',()=>call('GET','/produtos')],
 ['GET P001',()=>call('GET','/produtos/P001')],
 ['GET P999',()=>call('GET','/produtos/P999')],
 ['sem cupom P005x1',()=>calc([it('P005',1)])],
 ['BEMVINDO10 P005x1',()=>calc([it('P005',1)],'BEMVINDO10')],
 ['bemvindo10 minusc',()=>calc([it('P005',1)],'bemvindo10')],
 ['espacos',()=>calc([it('P005',1)],'  BEMVINDO10  ')],
 ['mista',()=>calc([it('P005',1)],'BemVindo10')],
 ['inexistente',()=>calc([it('P005',1)],'XYZ')],
 ['expirado',()=>calc([it('P005',1)],'VERAO2026')],
 ['expirado minusc',()=>calc([it('P005',1)],'verao2026')],
 ['cupom vazio',()=>calc([it('P005',1)],'')],
 ['cupom null',()=>calc([it('P005',1)],null)],
 ['199.80 (P005+P001+..)',()=>calc([it('P001',1),it('P002',1)])],  // 199.80
 ['200.00 P005+P008x? ',()=>calc([it('P005',1),it('P008',2)])], // 200
 ['199.90 ',()=>calc([it('P004',1),it('P002',1),it('P008',0+1)])], // 239.8? 
 ['200 exato c/cupom',()=>calc([it('P005',1),it('P008',2)],'BEMVINDO10')],
 ['P006x1 (29.90)',()=>calc([it('P006',1)])],
 ['P006x3 ',()=>calc([it('P006',3)],'BEMVINDO10')],
 ['P001x3 cupom',()=>calc([it('P001',3)],'BEMVINDO10')],
 ['P001x1 cupom (arred 5.99)',()=>calc([it('P001',1)],'BEMVINDO10')],
 ['P006x1 cupom 2.99',()=>calc([it('P006',1)],'BEMVINDO10')],
 ['P004x1 cupom 4.99',()=>calc([it('P004',1)],'BEMVINDO10')],
 ['P002x1+P004x1 =189.80 cupom',()=>calc([it('P002',1),it('P004',1)],'BEMVINDO10')],
 ['P003 189.90',()=>calc([it('P003',1)])],
 ['P003+P006x? ',()=>calc([it('P003',1),it('P004',0+1)])],
 ['qtd 5',()=>calc([it('P004',5)])],
 ['qtd 6',()=>calc([it('P004',6)])],
 ['qtd 0',()=>calc([it('P004',0)])],
 ['qtd -1',()=>calc([it('P004',-1)])],
 ['qtd 1.5',()=>calc([it('P004',1.5)])],
 ['qtd "2"',()=>calc([it('P004','2')])],
 ['qtd null',()=>calc([{produtoId:'P004',quantidade:null}])],
 ['qtd ausente',()=>calc([{produtoId:'P004'}])],
 ['dup',()=>calc([it('P004',1),it('P004',1)])],
 ['dup soma>5',()=>calc([it('P004',3),it('P004',3)])],
 ['prod inexistente',()=>calc([it('P999',1)])],
 ['produtoId minusc',()=>calc([it('p004',1)])],
 ['itens vazio',()=>calc([])],
 ['sem itens',()=>call('POST','/carrinho/calcular',{})],
 ['itens string',()=>call('POST','/carrinho/calcular',{itens:'x'})],
 ['item invalido',()=>calc(['x'])],
 ['json invalido',()=>call('POST','/carrinho/calcular',null,'{bad')],
 ['json array',()=>call('POST','/carrinho/calcular',null,'[]')],
 ['GET calcular',()=>call('GET','/carrinho/calcular')],
 ['PUT produtos',()=>call('PUT','/produtos')],
 ['rota inexistente',()=>call('GET','/xpto')],
 ['cupom numero',()=>calc([it('P005',1)],123)],
 ['P007 x5 cupom',()=>calc([it('P007',5)],'BEMVINDO10')],
 ['3 itens variados',()=>calc([it('P001',2),it('P006',3),it('P004',1)],'BEMVINDO10')],
];
for(const [n,f] of cases){const r=await f().catch(e=>({s:'ERR',t:String(e)}));console.log('##',n,'->',r.s);console.log(r.t.replace(/\s+/g,' ').slice(0,600));}
