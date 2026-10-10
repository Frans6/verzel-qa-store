# language: pt
@api
Funcionalidade: API de produtos, cálculo e pedidos

  @API
  Cenário: CT-029 - Listar produtos
    Quando faço GET /api/produtos
    Então recebo 200 com 8 produtos com id, nome, descricao, categoria e preco

  @API
  Cenário: CT-030 - Pedido válido
    Quando envio POST /api/pedidos com cliente válido, 1x P005 e cupom "BEMVINDO10"
    Então recebo 201
    E o número segue o formato "VZ-000000"
    E o CEP vem normalizado sem hífen ("01310100")
    E subtotal=100, desconto=10, frete=19,90, total=109,90

  @negativo @API
  Cenário: CT-031 - Dados do cliente inválidos
    Quando envio um pedido com nome "Maria", e-mail "x" e cep "1"
    Então recebo 422 "DADOS_INVALIDOS" com um detalhe em "campos" para cada campo inválido

  @negativo @API
  Cenário: CT-032 - Rota inexistente e método não permitido
    Quando faço GET /api/xpto
    Então recebo 404 "ROTA_NAO_ENCONTRADA"
    Quando faço GET /api/pedidos
    Então recebo 405 "METODO_NAO_PERMITIDO"

  @negativo @API
  Cenário: CT-033 - JSON inválido
    Quando envio o corpo "{bad" em POST /api/carrinho/calcular
    Então recebo 400 "JSON_INVALIDO"

  @API
  Cenário: CT-034 - Consultar produto
    Quando faço GET /api/produtos/P001
    Então recebo 200
    Quando faço GET /api/produtos/P999
    Então recebo 404 "PRODUTO_NAO_ENCONTRADO"

  @negativo @API @bug-004
  Cenário: CT-048 - Item sem produtoId
    Quando calculo um carrinho com um item sem o campo "produtoId"
    Então recebo 422 com o código "ITEM_INVALIDO"
    E a mensagem não contém a palavra "undefined"

  @negativo @API
  Esquema do Cenário: CT-041 - Itens inválidos
    Quando calculo um carrinho com <itens>
    Então recebo 422 com o código "<codigo>"

    Exemplos:
      | itens             | codigo                 |
      | itens vazio       | ITENS_OBRIGATORIOS     |
      | itens ausente     | ITENS_OBRIGATORIOS     |
      | item "x" (string) | ITEM_INVALIDO          |
      | produtoId "P999"  | PRODUTO_NAO_ENCONTRADO |
      | produtoId "p004"  | PRODUTO_NAO_ENCONTRADO |

@checkout
Funcionalidade: Finalizar compra

  Contexto:
    Dado que o carrinho contém 1 "Mochila Urbana 20L"
    E estou na página de checkout

  @negativo @UI
  Cenário: CT-035 - Campos obrigatórios
    Quando confirmo o pedido sem preencher nada
    Então vejo "Informe o nome completo.", "Informe o e-mail." e "Informe o CEP."

  @negativo @UI
  Esquema do Cenário: CT-036 - Dados inválidos
    Quando preencho nome "<nome>", e-mail "<email>" e CEP "<cep>"
    E confirmo o pedido
    Então vejo "<erro>"

    Exemplos:
      | nome        | email   | cep      | erro                          |
      | Maria       | a@b.com | 01310100 | Informe nome e sobrenome.     |
      | Maria Silva | a@b     | 01310100 | Informe um e-mail válido.     |
      | Maria Silva | a@b.com | 0131010  | Informe um CEP com 8 dígitos. |

  @UI
  Cenário: CT-037 - Pedido confirmado
    Quando preencho nome "Maria Silva", e-mail "maria@exemplo.com" e CEP "01310-100"
    E confirmo o pedido
    Então vejo a página de pedido confirmado com número "VZ-000000"
    E o pagamento será feito na entrega

  @UI
  Cenário: CT-038 - Checkout com carrinho vazio
    Dado que o carrinho está vazio
    Quando acesso /checkout
    Então sou redirecionado para /carrinho

  @UI
  Esquema do Cenário: CT-042 - CEP com e sem hífen são aceitos
    Quando preencho o CEP "<cep>"
    Então o pedido é confirmado

    Exemplos:
      | cep       |
      | 01310100  |
      | 01310-100 |

  @UI
  Cenário: CT-049 - Resumo do checkout e da confirmação são iguais, com cupom
    Dado que o carrinho tem 5x "Jaqueta Corta-Vento" e o cupom "BEMVINDO10"
    Quando confirmo o pedido
    Então subtotal R$ 1.149,50, desconto R$ 114,95, frete grátis e total R$ 1.034,55
    E são os mesmos valores mostrados no carrinho e no checkout

  @UI
  Cenário: CT-050 - Duplo clique em "Confirmar pedido" não duplica o pedido
    Quando clico duas vezes seguidas em "Confirmar pedido"
    Então apenas 1 requisição POST /api/pedidos é enviada

  @UI
  Cenário: CT-051 - Recarregar a página mantém carrinho e cupom
    Dado que o carrinho tem 1 "Mochila Urbana 20L" e o cupom "BEMVINDO10"
    Quando recarrego a página (F5)
    Então o carrinho, o cupom e o total R$ 109,90 continuam iguais

  @UI @ambiguidade
  Cenário: CT-043 - Sobrenome de uma letra (ex.: "Maria S")
    Quando preencho o nome "Maria S"
    Então o comportamento é registrado (interface e API rejeitam com "Informe nome e sobrenome.")
