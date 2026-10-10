# language: pt
@limite
Funcionalidade: Limite de 5 unidades por produto
  Como loja
  Quero limitar a 5 unidades por produto em cada pedido
  Para controlar o volume por compra

  @CA10 @UI
  Cenário: CT-021 - Vitrine bloqueia a 6ª unidade
    Quando clico 7 vezes em "Adicionar ao carrinho" do "Boné Aba Curva"
    Então o carrinho tem 5 unidades
    E o botão fica desabilitado
    E vejo "Limite de 5 unidades atingido."

  @CA10 @UI
  Cenário: CT-022 - Carrinho desabilita o botão "+" no limite
    Dado que o carrinho tem 5 unidades do "Boné Aba Curva"
    Então o botão "+" está desabilitado
    E vejo "Limite de 5 unidades por produto."

  @CA10 @borda @API
  Cenário: CT-023a - API aceita 5 unidades
    Quando calculo um carrinho com 5 unidades de P004
    Então recebo 200

  @CA10 @borda @negativo @API @bug-002
  Cenário: CT-023b - API rejeita 6 unidades no cálculo
    Quando calculo um carrinho com 6 unidades de P004
    Então recebo 422 com o código "QUANTIDADE_MAXIMA_EXCEDIDA"

  @CA10 @negativo @API @bug-002
  Cenário: CT-024 - API rejeita pedido com mais de 5 unidades
    Quando confirmo um pedido com 6 unidades de P004
    Então recebo 422 com o código "QUANTIDADE_MAXIMA_EXCEDIDA"
    # Também testado manualmente com 100 unidades

  @negativo @API
  Esquema do Cenário: CT-025 - Quantidade inválida
    Quando calculo um carrinho com quantidade <quantidade> de P004
    Então recebo 422 com o código "QUANTIDADE_INVALIDA"

    Exemplos:
      | quantidade |
      | 0          |
      | -1         |
      | 1.5        |
      | "2"        |
      | null       |
      | (ausente)  |

  @negativo @API
  Cenário: CT-026 - Mesmo produto repetido na lista
    Quando calculo um carrinho com P004 duas vezes na lista de itens
    Então recebo 422 com o código "ITEM_DUPLICADO"
