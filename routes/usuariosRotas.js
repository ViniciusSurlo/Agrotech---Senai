const express = require('express')
const BD = require('../db')
const router = express.Router()
const {put, del} = require("@vercel/blob")

const enviarFoto = async (file) => {
    const fileBuffer = file.data
    const originalName = file.name
    const blob = await put(originalName, fileBuffer, {
        access: "public", // Define acesso público ao arquivo
    });
    console.log(`Arquivo enviado com sucesso! URL: ${blob.url}`);
    return blob.url;
};

// Função para excluir a foto 
const excluirFoto = async (imagemUrl) => {
    const nomeArquivo = imagemUrl.split("/").pop();
    if (nomeArquivo) {
        await del(nomeArquivo);
        console.log(`Arquivo ${nomeArquivo} excluído com sucesso.`);
    }
}

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
        const urlImagem = await enviarFoto(req.files.file);
        const {nome, usuario, imagem, senha} = req.body
        await BD.query(`INSERT INTO usuarios (nome, usuario, imagem, senha) values ($1, $2, $3, $4)`, [nome, usuario, urlImagem, senha])
        res.redirect('/usuarios/')
    }catch (erro){
        console.log('Erro ao abrir tela de cadastro de úsuario', erro);
        res.render('usuariosTelas/novo', {mensagem: erro})
    }
})

//update
// router.get('/:id/editar' , async (req,res)=>{
//     try{
//         const id = req.params.id
//         const usuarios = await BD.query(' SELECT * from usuarios WHERE id_usuario = $1', [id])
//         res.render('usuariosTelas/editar' , {usuarios: usuarios.rows[0]})
//     }catch(erro){
//         console.log('Erro ao editar usuario', erro);
//         res.render('usuariosTelas/editar', {mensagem: erro})
//     }
// })

router.post('/:id/editar', async (req,res)=>{
try{
    const {id} = req.params
    const {nome, usuario, imagem, senha} = req.body

    let urlImagem = imagem
    if(req.files && req.files.file){
        await excluirFoto(imagem)
        urlImagem = await enviarFoto(req.files.file)
    }
    
    await BD.query(`UPDATE usuarios set nome = $1, usuario = $2, imagem = $3, senha = $4 WHERE id_usuario = $5`, [nome, usuario, urlImagem, senha, id])
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