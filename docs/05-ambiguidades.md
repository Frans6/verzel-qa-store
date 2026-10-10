# Ambiguidades e interpretações

Pontos em que a documentação não deixa claro o comportamento esperado, e como foram interpretados.

| # | Trecho da documentação | Dúvida | Interpretação adotada | Impacto |
|---|------------------------|--------|-----------------------|---------|
| 1 | CA11: "valores arredondados para 2 casas" | Qual regra de arredondamento (half-up, half-even)? Todos os preços têm no máximo 1 casa decimal, então 10% sempre dá no máximo 2 casas e o arredondamento nunca é exercitado. | Considerei só que não aparecem valores com mais de 2 casas nem erro de ponto flutuante (ex.: 3 × 29,90 = 89,70). | Não foi possível testar a regra de arredondamento em si, só o resultado. |
| 2 | CA02: "espaços no início e no fim são ignorados" | Vale também para espaços no meio ("BEMVINDO 10")? | Só nas pontas, como escrito. Não testei espaços no meio como defeito. | Baixo |
| 3 | "O nome do cliente precisa ter nome e sobrenome" | "Maria S" (sobrenome de 1 letra) é válido? | Interface e API rejeitam ("Informe nome e sobrenome."). Registrei como comportamento (CT-043), não como bug. | Baixo; pode barrar nomes com iniciais |
| 4 | CA03/CA04 | O que o carrinho mostra com cupom em branco? | A UI mostra "Informe um cupom." (não está na documentação). Aceitei como comportamento razoável. | Baixo |
| 5 | CA05: "Apenas um cupom por vez" | O que acontece com o cupom aplicado quando o carrinho é esvaziado? | A documentação não diz. "Esvaziar carrinho" limpa o cupom, mas "Remover" no último item não. Reportei a inconsistência como BUG-003 de baixa severidade. | Baixo |
| 6 | CA10: "máximo de 5 unidades por pedido" | O limite é por produto ou por pedido? | O texto diz "cada produto pode ter no máximo 5 unidades"; interpretei **por produto** (não há limite no total do pedido). | Define o que é bug no BUG-002 |
| 7 | CA06 vs. aviso de quanto falta | Quando o subtotal é exatamente 200,00, o aviso deveria aparecer? | Não: com frete grátis não deve haver aviso. Faz parte do BUG-001. | Médio |
| 8 | API `calcular` vs. `pedidos` | A API deve se comportar igual no limite de 5 unidades e nas regras de frete nos dois endpoints? | Sim, considerei que ambos usam as mesmas regras (a doc diz "o mesmo resumo de valores"). | Médio |
