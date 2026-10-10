# language: pt
@produtos
Funcionalidade: Vitrine de produtos
  Como cliente da Verzel Store
  Quero ver os produtos com nome, categoria, descrição e preço corretos
  Para escolher o que comprar (os preços alimentam todo o cálculo do carrinho)

  @UI @API
  Cenário: CT-044 - Vitrine exibe os 8 produtos conforme a documentação e a API
    Quando abro a vitrine
    Então vejo 8 produtos
    E nome, categoria, descrição e preço de cada um batem com GET /api/produtos
    E nome e preço batem com a tabela "Dados para teste" da documentação

  @UI
  Cenário: CT-045 - Preço do produto é o mesmo na vitrine e no carrinho
    Dado que adiciono cada um dos 8 produtos ao carrinho
    Quando abro o carrinho
    Então o preço unitário e o total de cada linha são iguais ao preço da vitrine

  @UI
  Cenário: CT-046 - Contador do carrinho e subtotal com 1 unidade de cada produto
    Dado que adiciono 1 unidade de cada um dos 8 produtos
    Então o contador do carrinho mostra 8
    E o subtotal é R$ 849,40 (soma dos 8 preços)

  @negativo @UI
  Cenário: CT-047 - Falha ao carregar os produtos
    Dado que a API GET /api/produtos responde com erro 500
    Quando abro a vitrine
    Então vejo "Não foi possível carregar os produtos. Recarregue a página para tentar de novo."
