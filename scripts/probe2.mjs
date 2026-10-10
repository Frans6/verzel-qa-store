const B='https://verzel-store.qa-test-verzel-store.workers.dev/api';
async function call(m,p,body,raw){const r=await fetch(B+p,{method:m,headers:{'Content-Type':'application/json'},body:raw??(body?JSON.stringify(body):undefined)});return {s:r.status,t:await r.text()};}
const it=(id,q)=>({produtoId:id,quantidade:q});
const cli={nome:'Maria Silva',email:'maria@exemplo.com',cep:'01310-100'};
const ped=(o)=>call('POST','/pedidos',{cliente:cli,itens:[it('P005',1)],...o});
const calc=(itens,cupom)=>call('POST','/carrinho/calcular',{itens,cupom});
const cases=[
 ['calc P007 cupom (frete antes do cupom)',()=>calc([it('P007',1)],'BEMVINDO10')],
 ['calc 200.01? P005+P008+P006x? (100+50+50=200)',()=>calc([it('P005',1),it('P008',1),it('P008',1)])],
 ['calc 200.00 outra comb: P004x4 + ...',()=>calc([it('P004',2),it('P008',2)])],   // 199.8
 ['calc 210: P005x1+P003? 289.9',()=>calc([it('P003',1),it('P006',1)])],  //219.8
 ['calc 200.50?: P006x5 +P008 = 199.5',()=>calc([it('P006',5),it('P008',1)])],
 ['calc 200.10?: P001x1+P002x1+... ',()=>calc([it('P004',1),it('P005',1),it('P008',1)])], //199.9
 ['calc 200.1:P006x1+P001x? ',()=>calc([it('P006',1),it('P001',1),it('P008',1),it('P005',0+1)])], //239.8
 ['calc 200.30',()=>calc([it('P001',1),it('P008',1),it('P005',1)])], //209.9
 ['ped ok',()=>ped({})],
 ['ped ok cupom',()=>ped({cupom:'BEMVINDO10'})],
 ['ped exatos 200 sem cupom',()=>ped({itens:[it('P005',1),it('P008',2)]})],
 ['ped qtd 6',()=>ped({itens:[it('P004',6)]})],
 ['ped qtd 5',()=>ped({itens:[it('P004',5)]})],
 ['ped qtd 100',()=>ped({itens:[it('P004',100)]})],
 ['ped cupom invalido',()=>ped({cupom:'XYZ'})],
 ['ped cupom expirado',()=>ped({cupom:'VERAO2026'})],
 ['ped cupom minusc',()=>ped({cupom:' bemvindo10 '})],
 ['ped sem cliente',()=>call('POST','/pedidos',{itens:[it('P005',1)]})],
 ['ped nome 1 palavra',()=>ped({cliente:{...cli,nome:'Maria'}})],
 ['ped nome vazio',()=>ped({cliente:{...cli,nome:''}})],
 ['ped nome espacos',()=>ped({cliente:{...cli,nome:'   '}})],
 ['ped email invalido',()=>ped({cliente:{...cli,email:'maria@'}})],
 ['ped email sem ponto',()=>ped({cliente:{...cli,email:'a@b'}})],
 ['ped cep 7 dig',()=>ped({cliente:{...cli,cep:'0131010'}})],
 ['ped cep 8 sem hifen',()=>ped({cliente:{...cli,cep:'01310100'}})],
 ['ped cep 9 dig',()=>ped({cliente:{...cli,cep:'013101000'}})],
 ['ped cep letras',()=>ped({cliente:{...cli,cep:'abcde-fgh'}})],
 ['ped cep hifen errado',()=>ped({cliente:{...cli,cep:'013-10100'}})],
 ['ped tudo invalido',()=>ped({cliente:{nome:'',email:'x',cep:'1'}})],
 ['ped itens vazio',()=>ped({itens:[]})],
 ['ped dup',()=>ped({itens:[it('P004',1),it('P004',1)]})],
 ['GET pedidos',()=>call('GET','/pedidos')],
 ['produtos id minusc',()=>call('GET','/produtos/p001')],
 ['calc sem content-type json invalido',()=>call('POST','/carrinho/calcular',null,'')],
 ['ped preco desconto 10% arred',()=>ped({itens:[it('P006',1)],cupom:'BEMVINDO10'})],
];
for(const [n,f] of cases){const r=await f().catch(e=>({s:'ERR',t:String(e)}));console.log('##',n,'->',r.s);console.log(r.t.replace(/\s+/g,' ').replace(/"itens":\[.*?\],"subtotal"/,'"itens":[..],"subtotal"').slice(0,420));}
