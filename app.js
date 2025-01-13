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
app.use(express.static(path.join(__dirname, "public")));

//variavesi
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

// Função para buscar todos as coleções
const fetchColecoes = async () => {
  const colecoes = Parse.Object.extend("colecao"); // aqui vai o nome da tabela
  const query = new Parse.Query(colecoes);

  //query.where("email", "luis@gmail.com");

  try {
    const results = await query.find();
    return results.map((colecao) => colecao.toJSON()); // Retorna as coleções como JSON
  } catch (error) {
    console.error("Erro ao buscar coleções:", error);
    throw error;
  }
};
fetchColecoes();

// Iniciar o servidor na porta especificada
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
