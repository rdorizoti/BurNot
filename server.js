const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const conexao = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

conexao.getConnection()
    .then((conn) => {
        console.log("✅ Conectado ao banco de dados BurNot!");
        conn.release();
    })
    .catch((erro) => {
        console.error("❌ Erro ao conectar ao MySQL:", erro.message);
    });

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/cadastro", async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: "Preencha todos os campos." });
    }

    if (senha.length < 6) {
        return res.status(400).json({ erro: "A senha precisa ter pelo menos 6 caracteres." });
    }

    try {
        const [existe] = await conexao.query(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        );

        if (existe.length > 0) {
            return res.status(409).json({ erro: "Este e-mail já está cadastrado." });
        }

    
        const senhaCriptografada = await bcrypt.hash(senha, 10);

       
        await conexao.query(
            "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)",
            [nome, email, senhaCriptografada]
        );

        return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
    } catch (erro) {
        console.error("Erro ao salvar no banco:", erro);
        return res.status(500).json({ erro: "Erro interno ao salvar no banco de dados." });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 BurNot rodando em http://localhost:${PORT}`);
});