const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
const Parse = require("parse/node");

Parse.initialize(
  "D0lHfXTxQ7sUrXie3VctByS2IGFVOlEsr2hIrlRr",
  "fOgD9Avu0fOO9ZHreqEjECWnR8kolrQAWz6ia9Yn"
);
Parse.serverURL = "https://parseapi.back4app.com";

app.set("view engine", "ejs");
app.use("/public", express.static("public"));

//variaveis
allColections = [];

// Rota principal que envia o arquivo index.html
app.get("/", async (req, res) => {
  try {
    const colecoes = await fetchColecoes();
    res.render("index", { colecoes }); // Passa as coleções diretamente para a view
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
    const allProducts = await fetchCarByColection(colecaoId);
    res.render("colecao", { colecoes, allProducts }); // Passa as coleções diretamente para a view
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
fetchColecoes();

//Função busca uma coleção especifica
const fetchColecao = async (nomeColecao) => {
  const colecoes = Parse.Object.extend("colecao"); // aqui vai o nome da tabela
  const query = new Parse.Query(colecoes);
  query.equalTo("nome", nomeColecao); // aqui vai o parametro de busca
  try {
    const results = await query.find();
    if (results.length > 0) {
      
      return results[0].get("Id"); 
    } else {
      throw new Error(`Nenhuma coleção encontrada com o nome: ${nomeColecao}`);
    }
  } catch (error) {
    console.error("Erro ao buscar coleções: ", nomeColecao, error);
    throw error;
  }
};

const fetchCarByColection = async (colecaoId) => {
  const produtos = Parse.Object.extend("produtos"); // aqui vai o nome da tabela
  const query = new Parse.Query(produtos);
  query.equalTo("colecao", parseInt(colecaoId)); // aqui vai o parametro de busca
  query.limit(250)

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
