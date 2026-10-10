# language: pt
@arredondamento
Funcionalidade: Arredondamento de valores
  Todos os valores são arredondados para 2 casas decimais (CA11)

  @CA11 @API
  Esquema do Cenário: CT-027 - Desconto de 10% sobre preços com centavos
    Dado que o carrinho tem 1 unidade de <produto>
    Quando aplico o cupom "BEMVINDO10"
    Então o desconto é <desconto>
    E o total é <total>

    Exemplos:
      | produto | desconto | total |
      | P001    | 5,99     | 73,81 |
      | P006    | 2,99     | 46,81 |
      | P004    | 4,99     | 64,81 |

  @CA11 @API
  Cenário: CT-028 - Subtotal sem erro de ponto flutuante
    Dado que o carrinho tem 3 unidades de P006 (R$ 29,90)
    Então o subtotal é 89,70 e não 89,69999999999999
    Quando aplico o cupom "BEMVINDO10"
    Então o desconto é 8,97 e o total é 100,63
