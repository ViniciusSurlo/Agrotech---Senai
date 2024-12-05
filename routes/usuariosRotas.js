const express = require('express')
const BD = require('../db')
const router = express.Router()

// Lista usuarios
router.get('/', async (req, res) => {
    const { busca = '', ordenar = "usuarios.nome" } = req.query
    const buscaDados = await BD.query(`SELECT * from  usuarios where upper(usuarios.nome) like $1 order by ${ordenar}`, [`%${busca.toUpperCase()}%`])
    res.render('usuariosTelas/lista', {usuarios: buscaDados.rows, busca, ordenar})
})

// create
router.get('/novo', async  (req, res) => {
    try{
        const resultado =  await BD.query(`SELECT * FROM usuarios`)
        // res.render('usuariosTelas/novo', {usuarios: resultado.rows})
    }catch (erro){
        console.log('Erro ao abrir tela de cadastro de úsuario', erro);
        res.render('usuariosTelas/novo', {mensagem: erro})
    }
})
router.post('/novo/', async (req,res)=>{
    try{
        const {nome, usuario, imagem, senha} = req.body
        await BD.query(`INSERT INTO usuarios (nome, usuario, imagem, senha) values ($1, $2, $3, $4)`, [nome, usuario, imagem, senha])
        res.redirect('/usuarios/')
    }catch (erro){
        console.log('Erro ao abrir tela de cadastro de úsuario', erro);
        res.render('usuariosTelas/novo', {mensagem: erro})
    }
})

//update
router.get('/:id/editar' , async (req,res)=>{
    try{
        const id = req.params.id
        const usuarios = await BD.query(' SELECT * from usuarios WHERE id_usuario = $1', [id])
        res.render('usuariosTelas/editar' , {usuarios: usuarios.rows[0]})
    }catch(erro){
        console.log('Erro ao editar usuario', erro);
        res.render('usuariosTelas/editar', {mensagem: erro})
    }
})

router.post('/:id/editar', async (req,res)=>{
try{
    const {id} = req.params
    const {nome, usuario, imagem, senha} = req.body
    await BD.query(`UPDATE usuarios set nome = $1, usuario = $2, imagem = $3, senha = $4 WHERE id_usuario = $5`, [nome, usuario, imagem, senha, id])
    res.redirect('/usuarios/')
}catch(erro){
    console.log('Erro ao editar usuario', erro);
    res.render('usuariosTelas/editar', {mensagem: erro})
}
})

router.post('/:id/deletar',  async (req, res) => {
    const id = req.params.id
    await BD.query (`DELETE FROM usuarios WHERE id_usuario = $1`, [id])
    res.redirect('/usuarios/')
})

module.exports = router