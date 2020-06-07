const express = require("express")
const server = express()

// Pegar o banco de dados
const db = require("./database/db")

//configurar pásta publica
server.use(express.static("public"))

// habilitar o uso do req.body na aplicação
server.use(express.urlencoded({ extended: true }))
// Utilizando templates
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})
// configurar caminho da aplicação

// Pagina inicial
// req = requisição
// res = resposta
server.get("/", (req, res) => {
    return res.render("index.html", { title: "Ecoleta - Next Level Week" })
})
server.get("/create-point", (req, res) => {
    return res.render("create-point.html")
})
server.post("/savepoint", (req, res) => {
    // req.body corpo do formulario
    // Inserir dados na tabela
    const query = `
        INSERT INTO places (
            image, name, address, address2, state, city, items)
            VALUES (?, ?, ?, ?, ?, ?, ?);
    `
    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]
    function afterInsertData(err) {
        if (err) {
            console.log(err)
            return res.send("Erro no cadastro!")
        }
        console.log("Cadastrado com Sucesso")
        console.log(this)

        return res.render("create-point.html", { saved: true })
    }

    db.run(query, values, afterInsertData)
})
server.get("/search", (req, res) => {
    const search = req.query.search
    if (search == "") {
        //pesquisa vazia
        return res.render("search-results.html", { total: 0 })
    }
    // pegar os dados do banco de dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function (err, rows) {
        if (err) {
            return console.log(err)
        }
        const total = rows.length
        // mostrar a pag html com os dados do banco de dados
        return res.render("search-results.html", { places: rows, total })
    })
})
// Ligar o Servidor
server.listen(3000)