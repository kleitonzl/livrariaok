
import "dotenv/config" 
import express, { request, response }  from "express"
import mysql from "mysql2"
import { v4 as uuidv4 } from "uuid"

const PORT = process.env.PORT

const app = express()

//Receber dados no formato JSON
app.use(express.json())

//Criar conexões com o banco de dados
const conn = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
})
//Conectr ao banco
conn.connect((err) => {
    if (err) {
        console.error(err)
    }
    app.listen(PORT, () => {
        console.log("Servidor on PORT" + PORT)
    })
    console.log("MYSQL Conectado")
})

app.get('/livros', (request, response) => {
    
    const sql = /*sql*/ `select * from livros2`
    conn.query(sql, (err, data) => {
        if(err){
            console.error(err)
            response.status(500).json({err: "Erro ao buscar livros"})
            return
        }
        const livros =  data
        response.status(200).json(livros)

    })

})

app.post("/livros", (request, response) =>{
    const { titulo, autor, ano_publicacao, genero, preco } = request.body

    //Validações
    if(!titulo){
        response.status(400).json({err: "O titulo e obrigatorio"})
        return
    }
    if(!autor){
        response.status(400).json({err: "O preco e obrigatorio"})
        return
    }
    if(!ano_publicacao){
        response.status(400).json({err: "O ano de publicacao e obrigatorio"})
        return
    }
    if(!genero){
        response.status(400).json({err: "O genero e obrigatorio"})
        return
    }
    if(!preco){
        response.status(400).json({err: "O preco e obrigatorio"})
        return
    }

    //Verificar se o livro nao foi cadasyrado
    const checkSql = /*sql*/ `select * from livros2 where titulo = "${titulo}" and autor = "${autor}" and ano_publicacao = "${ano_publicacao}" `
    conn.query(checkSql, (err, data) => {
        if(err){
            console.error(err)
            response.status(500).json({err: "Erro ao buscar livros"})
            return
        }


        if(data.length > 0){
            response.status(409).json({err: "livro ja foi cadastrado"})
            return
        }
        
        //cadastrar o livro
        const id = uuidv4()
        const desponibilidade = 1
        const insertSql = /*sql*/ `INSERT INTO livros2
        (livro_id, titulo, autor, ano_publicacao, genero, preco, desponibilidade) VALUES
        ("${id}", "${titulo}" , "${autor}", "${ano_publicacao}","${genero}", "${preco}", "${desponibilidade}" )
        `
        conn.query(insertSql, (err, data)=>{
            if(err){
                console.error(err)
                response.status(500).json({err: "Erro ao cadastrar livro"})
                return
            }
            response.status(201).json({message:"Livro cadastrado"})
        })
    })
})

 //listar
app.get('/livros/:id', (request, response) => {
    const {id} = request.params

    const sql = /*sql*/ `select * from livros2 where livro_id = "${id}"  `
    conn.query(sql , (err, data)=>{
        if(err){
            console.error(err)
            response.status(500).json({err: "Erro ao buscar livro"})
            return
        }
        
        if(data.length === 0){
            response.status(404).json({err: "Livro nao encontrado"})
            return
        }

        const livro = data[0]
        response.status(200).json(livro)
    })
})

//atualizar
app.get('/livros/:id', (request, response) => {
const {id} = request.params
const {titulo, autor, genero, preco, desponibilidade, ano_publicacao} = request.body

if(!titulo){
    response.status(400).json({err: "O titulo e obrigatorio"})
    return
}
if(!autor){
    response.status(400).json({err: "O preco e obrigatorio"})
    return
}
if(!ano_publicacao){
    response.status(400).json({err: "O ano de publicacao e obrigatorio"})
    return
}
if(!genero){
    response.status(400).json({err: "O genero e obrigatorio"})
    return
}
if(!preco){
    response.status(400).json({err: "O preco e obrigatorio"})
    return
}
if(desponibilidade === undefined){
    response.status(400).json({err: "A disponibilidade é obrigatoria"})
    return
}

const checkSql = /*sql*/ `select * from livros2 where titulo = "${titulo}" and autor = "${autor}" and ano_publicacao = "${ano_publicacao}" `
    conn.query(checkSql, (err, data) => {
        if(err){
            console.error(err)
            response.status(500).json({err: "Erro ao buscar livros"})
            return
        }


        if(data.length === 0){
            response.status(404).json({err: "livro ja foi encontrado"})
            return
        }
        const updateSql = /*sql*/ `update livros2 set
        titulo = "${titulo}", autor = "${autor}", ano_publicacao = "${ano_publicacao}",genero = "${genero}" preco "${preco}", disponibilidade = "${desponibilidade}"
        where livro_id = "${id}"
        `
        conn.query(updateSql, (err, info)=>{
            if(err){
                console.error(err)
                response.status(500).json({err: "Erro ao atualizar livro"})
                return
            }
           
            console.log(info)
            response.status(200).json({message: "Livro atualizado"})
        })
    })
})
//delete
app.get('/livros/:id', (request, response) => {
    const {} = request.params

    const deleteSql = /*sql*/ `delete from livros2 where livro_id = "${id}"
    
    `
    conn.query(deleteSql, (err, info) =>{
        if(err){
            console.error(err)
            response.status(500).json({err: "Error ao deletar livro"})
            return
        }
        if(info.affectedRows === 0){
            response.status(404).json({err: "Livro não encontrado"})
            return
        }
        response.status(200).json("Livro Deletado")
    })
})

/** Rotas de funcionarios */
/** tabela (id, nome, cargo, data_contratacao, salario, email, created_at, updated_at)
 * 1° listar todos os funcionarios
 * 2°cadastrar um funcionario (email é unico)
 * 3°listar um funcionario
 * 4°atualizar um funcionario (não pode ter o email do outro func.)
 * 5°deletar um funcionario
 */
