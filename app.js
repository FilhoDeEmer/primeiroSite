const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
const Parse = require("parse/node");
const config = require("./config");

Parse.initialize(config.PARSE_APP_ID, config.PARSE_JS_KEY);
Parse.serverURL = config.PARSE_SERVER_URL;

app.set("view engine", "ejs");
app.use("/public", express.static("public"));

//variaveis
allColections = [];

// Rota principal que envia o arquivo index.html
app.get("/", async (req, res) => {
  try {
    const colecoes = await fetchColecoes();
    const destaque = await fetchDestaque();
    const banner = await fetchBanner();
    res.render("index", { colecoes , destaque, banner }); // Passa as coleções diretamente para a view
  } catch (error) {
    res.status(500).send("Erro ao buscar coleções");
    console.error("Erro ao renderizar a página principal", error);
  }
});

//Rota para uma coleção especifica
app.get("/colecao/:nomeColecao", async (req, res) => {
  const nomeColecao = req.params.nomeColecao;
  try {
    const colecoes = await fetchColecoes();
    const colecaoId = await fetchColecao(nomeColecao);
    const allProducts = await fetchCartByColection(colecaoId);
    

    res.render("colecao", { colecoes, allProducts}); // Passa as coleções diretamente para a view
  } catch (error) {
    res.status(500).send("Erro ao buscar coleções");
    console.error("Erro ao renderizar a página principal", error);
  }
});

//Rota para uma produto especifica
app.get("/produtos/:produtoId", async (req, res) => {
  const idProduto = req.params.produtoId;
  const colecoes = await fetchColecoes();
  try {
    const produto = await fetchProduto(idProduto);
    res.render("productPage", {colecoes,produto : produto[0] }); // Passa as coleções diretamente para a view
  } catch (error) {
    res.status(500).send("Erro ao buscar coleções");
    console.error("Erro ao renderizar a página principal", error);
  }
});

// Função para buscar todos as coleções
const fetchColecoes = async () => {
  const colecoes = Parse.Object.extend("colecao"); // aqui vai o nome da tabela
  const query = new Parse.Query(colecoes);

  try {
    const results = await query.find();
    return results.map((colecao) => colecao.toJSON()); // Retorna as coleções como JSON
  } catch (error) {
    console.error("Erro ao buscar coleções:", error);
    throw error;
  }
};
// Função para buscar produtos em destaque
const fetchDestaque = async () => {
  const produtos = Parse.Object.extend("produtos"); // aqui vai o nome da tabela
  const query = new Parse.Query(produtos);
  query.equalTo("destacar", true); 

  try {
    const results = await query.find();
    return results.map((colecao) => colecao.toJSON()); // Retorna as coleções como JSON
  } catch (error) {
    console.error("Erro ao buscar produtos em destaque:", error);
    throw error;
  }
};
// Função para buscar produtos especifico
const fetchProduto = async (produtoId) => {
  const produtos = Parse.Object.extend("produtos"); // aqui vai o nome da tabela
  const query = new Parse.Query(produtos);
  query.equalTo("id_carta", produtoId); 

  try {
    const results = await query.find();
    return results.map((colecao) => colecao.toJSON()); // Retorna as coleções como JSON
  } catch (error) {
    console.error("Erro ao buscar produtos em destaque:", error);
    throw error;
  }
};

//Função busca uma coleção especifica
const fetchColecao = async (nomeColecao) => {
  const colecoes = Parse.Object.extend("colecao"); // aqui vai o nome da tabela
  const query = new Parse.Query(colecoes);
  query.equalTo("nome", nomeColecao); // aqui vai o parametro de busca
  try {
    const results = await query.find();
    if (results.length > 0) {
      return results[0].get("sigla"); 
    } else {
      throw new Error(`Nenhuma coleção encontrada com o nome: ${nomeColecao}`);
    }
  } catch (error) {
    console.error("Erro ao buscar coleções: ", nomeColecao, error);
    throw error;
  }
};

const fetchCartByColection = async (colecaoId) => {
  const produtos = Parse.Object.extend("produtos"); // aqui vai o nome da tabela
  const query = new Parse.Query(produtos);
  query.equalTo("colecao", colecaoId); // aqui vai o parametro de busca
  query.ascending("id_carta"); // Ordena por id
  query.limit(280)

  try {
    const results = await query.find();
    return results.map((produto) => produto.toJSON()); // Retorna como JSON
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    throw error;
  }
};

//buscar banner
const fetchBanner = async () => {
  const banner = Parse.Object.extend("img"); // aqui vai o nome da tabela
  const query = new Parse.Query(banner);
  query.equalTo("imgCode", "banner"); // aqui vai o parametro de busca

  try {
    const results = await query.find();
    return results.map((produto) => produto.toJSON()); // Retorna como JSON
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    throw error;
  }
};

// Iniciar o servidor na porta especificada
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
