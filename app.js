import express from "express";
import path from "path";
import session from "express-session";
import Parse from "parse/node.js";
import config from "./config.js";
import Carrinho from "./models/carrinho.js";

const app = express();
const port = process.env.PORT || 3000;

// Initialize Parse
Parse.initialize(config.PARSE_APP_ID, config.PARSE_JS_KEY);
Parse.serverURL = config.PARSE_SERVER_URL;

// Middleware setup
app.set("view engine", "ejs");
app.use("/public", express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "chave-super-hyper-mega-secreta",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);

// Carrinho Middleware
app.use((req, res, next) => {
  if (!req.session.carrinho) {
    req.session.carrinho = { clienteId: null, produtos: [], totalItens: 0 };
  }
  req.carrinho = new Carrinho(req.session.carrinho.clienteId);
  req.carrinho.produtos = req.session.carrinho.produtos;
  res.locals.carrinho = req.carrinho;
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", async (req, res) => {
  try {
    const colecoes = await fetchColecoes();
    const destaque = await fetchDestaque();
    const banner = await fetchBanner();
    res.render("index", { colecoes, destaque, banner });
  } catch (error) {
    res.status(500).send("Erro ao buscar coleções");
    console.error("Erro ao renderizar a página principal", error);
  }
});

app.get("/colecao/:nomeColecao", async (req, res) => {
  const nomeColecao = req.params.nomeColecao;
  try {
    const colecoes = await fetchColecoes();
    const colecaoId = await fetchColecao(nomeColecao);
    const allProducts = await fetchCardByColection(colecaoId);
    res.render("colecao", { colecoes, allProducts });
  } catch (error) {
    res.status(500).send("Erro ao buscar coleções");
    console.error("Erro ao renderizar a página de coleção", error);
  }
});

app.get("/buscar", async (req, res) => {
  const termoBusca = req.query.busca;
  const allProducts = await fetchTermo(termoBusca);
  try {
    const colecoes = await fetchColecoes();
    res.render("colecao", { colecoes, allProducts: allProducts });
  } catch (error) {
    res.status(500).send("Erro ao buscar o produto");
    console.error("Erro ao renderizar a página do produto", error);
  }
});

app.get("/produtos/:produtoId", async (req, res) => {
  const idProduto = req.params.produtoId;
  try {
    const colecoes = await fetchColecoes();
    const produto = await fetchProduto(idProduto);
    res.render("productPage", { colecoes, produto: produto[0] });
  } catch (error) {
    res.status(500).send("Erro ao buscar o produto");
    console.error("Erro ao renderizar a página do produto", error);
  }
});

app.get("/carrinho", (req, res) => {
  res.json(req.carrinho);
});

app.get("/carrinho-compras", async (req, res) => {
  const colecoes = await fetchColecoes();
  res.render("carrinhoPage", { colecoes });
});

app.post("/adicionar-ao-carrinho", (req, res) => {
  const {
    clienteId,
    id_carta,
    nome,
    raridade,
    preco,
    quantidade,
    estq_max,
    img,
  } = req.body;
  req.carrinho.adicionarProduto(
    id_carta,
    nome,
    raridade,
    parseFloat(preco),
    parseInt(quantidade),
    img,
    estq_max
  );
  req.session.carrinho = { clienteId, produtos: req.carrinho.produtos };
  res.json({
    mensagem: "Produto adicionado ao carrinho!",
    carrinho: req.session.carrinho,
  });
});

app.post("/remover-do-carrinho", (req, res) => {
  const { id_carta, raridade } = req.body;
  req.carrinho.removerProduto(id_carta, raridade);
  res.json({ quantidadeItens: req.session.carrinho.produtos.length });
});

app.post("/atualizar-carrinho", (req, res) => {
  const { id_carta, quantidade, raridade } = req.body;
  req.carrinho.atualizarQuantidade(id_carta, quantidade, raridade);
  res.json({ quantidadeItens: req.session.carrinho.produtos.length });
});

// Fetch functions
const fetchDestaque = async () => {
  const produtos = Parse.Object.extend("produtos");
  const query = new Parse.Query(produtos);
  query.equalTo("destacar", true);
  try {
    const results = await query.find();
    return results.map((colecao) => colecao.toJSON());
  } catch (error) {
    console.error("Erro ao buscar produtos em destaque:", error);
    throw error;
  }
};

const fetchProduto = async (produtoId) => {
  const produtos = Parse.Object.extend("produtos");
  const query = new Parse.Query(produtos);
  query.equalTo("id_carta", produtoId);
  try {
    const results = await query.find();
    return results.map((produto) => produto.toJSON());
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    throw error;
  }
};
const fetchTermo = async (termo) => {
  const produtos = Parse.Object.extend("produtos");
  const query = new Parse.Query(produtos);
  query.matches("nome", `.*${termo}.*`, 'i'); //busca case sensitice de termo parecido
  query.ascending("nome");
  query.limit(280);
  try {
    const results = await query.find();    
    if (results.length > 0) {
      return results.map((produto) => produto.toJSON());
    } else {
      throw new Error(`Nenhuma coleção encontrada com o nome: ${termo}`);
    }
  } catch (error) {
    console.error("Erro ao buscar coleções: ", termo, error);
    throw error;
  }
};

const fetchColecao = async (nomeColecao) => {
  const colecoes = Parse.Object.extend("colecao");
  const query = new Parse.Query(colecoes);
  query.equalTo("nome", nomeColecao);
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

const fetchColecoes = async () => {
  const colecoes = Parse.Object.extend("colecao");
  const query = new Parse.Query(colecoes);
  try {
    const results = await query.find();
    return results.map((colecao) => colecao.toJSON());
  } catch (error) {
    console.error("Erro ao buscar coleções:", error);
    throw error;
  }
};

const fetchCardByColection = async (colecaoId) => {
  const produtos = Parse.Object.extend("produtos");
  const query = new Parse.Query(produtos);
  query.equalTo("colecao", colecaoId);
  query.ascending("id_carta");
  query.limit(280);
  try {
    const results = await query.find();
    return results.map((produto) => produto.toJSON());
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    throw error;
  }
};

const fetchBanner = async () => {
  const banner = Parse.Object.extend("img");
  const query = new Parse.Query(banner);
  query.equalTo("imgCode", "banner");
  try {
    const results = await query.find();
    return results.map((produto) => produto.toJSON());
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    throw error;
  }
};

// Start server
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
