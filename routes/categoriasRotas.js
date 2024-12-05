const express = require('express')
const router = express.Router()
const BD = require('../db')

//Listar Categorias (R - Read)
// Rota localhost:3000/categorias/
router.get('/', async (req, res) => {
    try {
    const {busca = '', ordenar = "categorias.nome_categoria" } = req.query;
    const buscaDados = await BD.query(`SELECT * from categorias where upper(categorias.nome_categoria) like $1 and inativo is null order by ${ordenar}`, [`%${busca.toUpperCase()}%`])
    const inativos = await BD.query(`select * from categorias where inativo = 'S'`)
    res.render('categoriasTelas/lista', {categorias: buscaDados.rows, busca, ordenar, inativos: inativos.rows})}
    catch(erro){
        console.log('Erro ao listar Categorias', erro);
        res.render('categoriasTelas/lista', {mensagem:erro, categorias: []})
    }
})

// Criar nova categoria
router.get("/novo", async (req, res) => {
    try {
        const resultado = await BD.query(`Select * from categorias order by nome_categoria`)
        res.render('categoriasTelas/criar', {categoriasCadastradas: resultado.rows})
    }catch (erro){
        console.log('Erro ao criar Categorias', erro);
        req.render('categoriasTelas/criar', {mensagem:erro})
    }
})

router.post('/novo', async (req, res) => {
    try{
        const  {nome_categoria} = req.body
        await BD.query(
            `INSERT INTO categorias (nome_categoria) values ($1)`,
            [nome_categoria]
        );
        res.redirect('/categorias/')
    }catch(erro){
        console.log('Erro ao criar Categorias', erro);
        res.render('categoriasTelas/criar', {mensagem:erro})
    }
})

// Update (editar categorias)
router.get('/:id/editar', async (req, res) => {
    try {
        const id = req.params.id
        const resultado = await BD.query("SELECT * FROM categorias WHERE id_categoria = $1", [id])
        res.render('categoriasTelas/editar', {categorias: resultado.rows[0]})
    } catch(erro){
        console.log('Erro ao editar Categorias', erro);
        res.render('categoriasTelas/editar', {mensagem:erro})
    }
})

router.post('/:id/editar', async (req, res) => {
    try {
        const id = req.params.id
        const nome = req.body.nome
        await BD.query(`update categorias set nome_categoria = $1 where id_categoria = $2`, [nome, id]);
        res.redirect('/categorias/')
    }catch(erro){
        console.log('Erro ao editar Categorias', erro);
    }
})

// Ativar categoria Desativada
router.post('/:id/ativar', async (req, res) => {
    try {
        const id = req.params.id
        await BD.query(`update categorias set inativo = null where id_categoria = $1`, [id]);
        res.redirect('/categorias/')
    }catch(erro){
        console.log('Erro ao ativar Categoria', erro);
    }
})


// Criar nova categoria
router.get("/novo", async (req, res) => {
    try {
        const resultado = await BD.query(`Select * from categorias order by nome_categoria`)
        res.render('categoriasTelas/criar', { categoriasCadastradas: resultado.rows })
    } catch (erro) {
        console.error('Erro ao criar Categorias', erro);
        res.status(500).render('categoriasTelas/criar', { mensagem: erro })
    }
})

router.post('/novo', async (req, res) => {
    try {
        const { nome_categoria } = req.body
        if (!nome_categoria) {
            throw new Error('Nome da categoria é obrigatório')
        }
        await BD.query(
            `INSERT INTO categorias (nome_categoria) values ($1)`,
            [nome_categoria]
        );
        res.redirect('/categorias/')
    } catch (erro) {
        console.error('Erro ao criar Categorias', erro);
        res.status(500).render('categoriasTelas/criar', { mensagem: erro })
    }
})

// Update (editar categorias)
router.get('/:id/editar', async (req, res) => {
    try {
        const id = req.params.id
        const resultado = await BD.query("SELECT * FROM categorias WHERE id_categoria = $1", [id])
        if (!resultado.rows[0]) {
            throw new Error('Categoria não encontrada')
        }
        res.render('categoriasTelas/editar', { categorias: resultado.rows[0] })
    } catch (erro) {
        console.error('Erro ao editar Categorias', erro);
        res.status(404).render('categoriasTelas/editar', { mensagem: erro })
    }
})

router.post('/:id/editar', async (req, res) => {
    try {
        const id = req.params.id
        const { nome_categoria } = req.body
        if (!nome_categoria) {
            throw new Error('Nome da categoria é obrigatório')
        }
        await BD.query(`update categorias set nome_categoria = $1 where id_categoria = $2`, [nome_categoria, id]);
        res.redirect('/categorias/')
    } catch (erro) {
        console.error('Erro ao editar Categorias', erro);
        res.status(500).render('categoriasTelas/editar', { mensagem: erro })
    }
})

router.post('/:id/deletar', async (req, res) => {
    try {
        const id = req.params.id
        // await BD.query("DELETE FROM categorias WHERE id_categoria = $1", [id])
        await BD.query("UPDATE categorias set inativo = 'S' WHERE id_categoria = $1", [id])
        res.redirect('/categorias/')
    } catch (erro) {
        console.error('Erro ao deletar Categorias', erro);
        res.status(500).redirect('/categorias/')
    }
})
    



module.exports = router