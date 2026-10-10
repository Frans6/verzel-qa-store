# language: pt
@frete
Funcionalidade: Frete grátis
  Como cliente da Verzel Store
  Quero ganhar frete grátis em compras maiores
  Para pagar menos nas minhas compras

  @CA07 @UI @API
  Esquema do Cenário: CT-013/014/015 - Abaixo de R$ 200,00 cobra R$ 19,90 e informa quanto falta
    Dado que o carrinho tem subtotal de R$ <subtotal>
    Então o frete é R$ 19,90
    E o carrinho informa "Faltam R$ <falta> para o frete grátis."

    Exemplos:
      | subtotal | falta  | composição                          |
      | 100,00   | 100,00 | 1x Mochila                          |
      | 199,80   | 0,20   | 1x Camiseta + 1x Calça              |
      | 199,90   | 0,10   | 1x Boné + 1x Mochila + 1x Garrafa   |

  @CA06 @borda @UI @API @bug-001
  Cenário: CT-016 - Subtotal EXATO de R$ 200,00 tem frete grátis (inclusive)
    Dado que o carrinho contém 1 "Mochila Urbana 20L" e 2 "Garrafa Térmica 750ml"
    Então o subtotal é R$ 200,00
    E o frete é grátis
    E não há aviso de "faltam R$ ... para o frete grátis"
    E o total é R$ 200,00

  @CA06 @UI @API
  Esquema do Cenário: CT-017 - Acima de R$ 200,00 o frete é grátis
    Dado que o carrinho tem subtotal de R$ <subtotal>
    Então o frete é grátis

    Exemplos:
      | subtotal | composição                          |
      | 209,90   | 1x Camiseta + 1x Mochila + 1x Garrafa |
      | 219,80   | 1x Tênis + 1x Meias                 |
      | 229,90   | 1x Jaqueta                          |

  @CA08 @UI @API
  Cenário: CT-018 - Frete grátis considera o subtotal ANTES do cupom
    Dado que o carrinho tem subtotal de R$ 219,80 (1x Tênis + 1x Meias)
    Quando aplico o cupom "BEMVINDO10"
    Então o desconto é R$ 21,98
    E o frete continua grátis
    E o total é R$ 197,82

  @CA07 @UI
  Cenário: CT-019 - O carrinho mostra quanto falta para o frete grátis
    Dado que o carrinho tem subtotal de R$ 199,80
    Então vejo "Faltam R$ 0,20 para o frete grátis."

  @CA06 @CA09 @borda @UI @API @bug-001
  Cenário: CT-020 - Subtotal de R$ 200,00 com cupom: frete grátis e desconto só nos produtos
    Dado que o carrinho tem subtotal de R$ 200,00
    Quando aplico o cupom "BEMVINDO10"
    Então o desconto é R$ 20,00
    E o frete é grátis
    E o total é R$ 180,00
