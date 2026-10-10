# language: pt
# Camadas: @UI = interface da loja | @API = POST /api/carrinho/calcular e /api/pedidos
# Tags: @CAxx = critério de aceite | @borda | @negativo | @bug-xxx = cenário que expõe um bug

@cupom
Funcionalidade: Cupom de desconto
  Como cliente da Verzel Store
  Quero aplicar um cupom de desconto no carrinho
  Para pagar menos nas minhas compras

  Contexto:
    Dado que o carrinho contém 1 "Mochila Urbana 20L" (R$ 100,00)

  @CA01 @UI @API
  Cenário: CT-001 - Cupom BEMVINDO10 aplica 10% sobre o subtotal
    Quando aplico o cupom "BEMVINDO10"
    Então o desconto é R$ 10,00
    E o frete é R$ 19,90
    E o total é R$ 109,90

  @CA02 @UI @API
  Esquema do Cenário: CT-002/003 - Código do cupom ignora maiúsculas/minúsculas e espaços nas pontas
    Quando aplico o cupom "<codigo>"
    Então o cupom "BEMVINDO10" é aplicado com desconto de R$ 10,00

    Exemplos:
      | codigo         |
      | bemvindo10     |
      | BemVindo10     |
      |   BEMVINDO10   |

  @CA03 @negativo @UI @API
  Cenário: CT-004 - Cupom inexistente
    Quando aplico o cupom "XYZ"
    Então vejo a mensagem "Cupom inválido."
    E nenhum desconto é aplicado

  @CA04 @negativo @UI @API
  Cenário: CT-005 - Cupom expirado
    Quando aplico o cupom "VERAO2026"
    Então vejo a mensagem "Cupom expirado."
    E nenhum desconto é aplicado

  @negativo @UI
  Cenário: CT-006 - Aplicar cupom com o campo em branco
    Quando aplico o cupom "   "
    Então vejo a mensagem "Informe um cupom."

  @CA05 @UI
  Cenário: CT-007 - Apenas um cupom por vez
    Dado que o cupom "BEMVINDO10" está aplicado
    Então o campo para digitar outro cupom não é exibido
    Quando removo o cupom atual
    Então o campo de cupom volta a ser exibido
    E o desconto volta a ser R$ 0,00

  @CA05 @UI
  Cenário: CT-008 - Remover o cupom restaura os valores originais
    Dado que o cupom "BEMVINDO10" está aplicado
    Quando removo o cupom atual
    Então o subtotal, o frete e o total voltam aos valores sem cupom

  @CA09 @UI @API
  Cenário: CT-009 - O desconto do cupom não incide sobre o frete
    Quando aplico o cupom "BEMVINDO10"
    Então o desconto é 10% do subtotal (R$ 10,00) e não do subtotal + frete
    E o total é subtotal - desconto + frete = R$ 109,90

  @UI
  Cenário: CT-010 - Cupom é recalculado ao alterar a quantidade
    Dado que o cupom "BEMVINDO10" está aplicado
    Quando aumento a quantidade da mochila para 2
    Então o desconto é R$ 20,00
    Quando diminuo a quantidade para 1
    Então o desconto é R$ 10,00

  @negativo @API
  Cenário: CT-011 - Pedido com cupom inexistente é rejeitado
    Quando confirmo um pedido com o cupom "XYZ"
    Então recebo 422 com o código "CUPOM_INVALIDO"

  @negativo @API
  Cenário: CT-012 - Pedido com cupom expirado é rejeitado
    Quando confirmo um pedido com o cupom "VERAO2026"
    Então recebo 422 com o código "CUPOM_EXPIRADO"

  @CA02 @API
  Cenário: CT-040 - Pedido aceita cupom em minúsculas e com espaços
    Quando confirmo um pedido com o cupom " bemvindo10 "
    Então recebo 201 com desconto de R$ 10,00

  @exploratorio @UI @bug-003
  Cenário: CT-039 - Cupom não deve permanecer após o carrinho ser esvaziado
    Dado que o cupom "BEMVINDO10" está aplicado
    Quando removo o único item do carrinho
    E adiciono outro produto
    Então o carrinho novo não deveria ter cupom aplicado
