// models/carrinho.js
class Carrinho {
    constructor(clienteId) {
      this.clienteId = clienteId; // ID do cliente
      this.produtos = []; // Array de produtos no carrinho
    }
  
    // Obtém a quantidade total de itens no carrinho
    obterQuantidadeTotal() {
      return this.produtos.reduce((total, produto) => total + produto.quantidade, 0);
    }
  
    // Adiciona um produto ao carrinho
    adicionarProduto(id_carta, nome, raridade, preco, quantidade, img, estq_max) {
      if (quantidade <= 0) {
        throw new Error("A quantidade deve ser maior que zero.");
      }
      if (quantidade > estq_max) {
        throw new Error(`Quantidade excede o limite de estoque (máximo: ${estq_max}).`);
      }
  
      const produtoExistente = this.produtos.find(
        (p) => p.id_carta === id_carta && p.raridade === raridade
      );
  
      if (produtoExistente) {
        // Se o produto já estiver no carrinho, aumenta a quantidade
        produtoExistente.quantidade += quantidade;
      } else {
        // Caso contrário, adiciona um novo item
        this.produtos.push({
          id_carta,
          nome,
          raridade,
          preco,
          quantidade,
          img,
          estq_max,
        });
      }
    }
  
    // Remove um produto do carrinho
    removerProduto(id_carta, raridade) {
      const index = this.produtos.findIndex(
        (p) => p.id_carta === id_carta && p.raridade === raridade
      );
  
      if (index === -1) {
        throw new Error("Produto não encontrado no carrinho.");
      }
  
      // Remove o produto da lista
      this.produtos.splice(index, 1);
    }
  
    // Atualiza a quantidade de um produto
    atualizarQuantidade(id_carta, quantidade, raridade) {
      if (isNaN(quantidade) || quantidade < 0) {
        console.warn("Quantidade inválida:", quantidade);
        return false; // Evita atualizar valores inválidos
      }
  
      const produto = this.produtos.find(
        (p) => p.id_carta === id_carta && p.raridade === raridade
      );
  
      if (!produto) {
        console.error("Produto não encontrado no carrinho:", id_carta, raridade);
        return false;
      }
  
      if (quantidade === 0) {
        // Remove o produto do carrinho se a quantidade for 0
        this.produtos = this.produtos.filter(
          (p) => !(p.id_carta === id_carta && p.raridade === raridade)
        );
        console.log("Produto removido do carrinho:", id_carta);
      } else {
        produto.quantidade = quantidade;
      }
  
      return true; // Sucesso na atualização
    }
  
    // Calcula o total do carrinho
    calcularTotal() {
      return this.produtos.reduce((total, p) => total + p.preco * p.quantidade, 0);
    }
  
    // Limpa o carrinho
    limparCarrinho() {
      this.produtos = [];
    }
  
    // Verifica se o carrinho está vazio
    estaVazio() {
      return this.produtos.length === 0;
    }
  
    // Obtém a lista de produtos no carrinho
    obterProdutos() {
      return this.produtos;
    }
  }
  
  export default Carrinho;
  