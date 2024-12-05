const express = require('express')
const router = express.Router()
const BD = require('../db')

router.get('/', async (req, res) => {
    const usuarios =  await BD.query(`SELECT * FROM usuarios`)
    res.render('cadastroTelas/cadastro')
})

router.post('/register', async (req, res)=>{
    try{
        const {nome, usuario, senha} = req.body
        await BD.query(`INSERT INTO usuarios (nome, usuario,senha) values ($1,$2,$3)`, [nome, usuario, senha])
        res.redirect('/auth/login/')
    }catch (erro){
        console.log('Erro ao abrir tela de cadastro de usuário', erro);
        res.render('cadastroTelas/cadastro', { mensagem: 'Erro ao realizar o cadastro. Tente novamente.' });
    }
})
module.exports = router