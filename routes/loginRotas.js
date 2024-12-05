const express = require("express");
const router = express.Router();
const BD = require("../db");
const session = require('express-session');

// Define sua rota de login
router.get('/login', (req, res) => {
    res.render('admin/login')
});

router.post('/login', async (req, res) => {
    const { usuario, senha } = req.body;
    const buscaDados = await BD.query(`
    select * from usuarios
    where usuario = $1 and senha = $2
    `, [usuario, senha])
    // Verifica se o login e senha são válidos (substitua pela lógica real)
    if (buscaDados.rows.length > 0) {
        // Usuário autenticado, salva a sessão
        req.session.usuarioLogado = buscaDados.rows[0].usuario;
        req.session.nomeUsuario = buscaDados.rows[0].nome;
        req.session.idUsuario = buscaDados.rows[0].id_usuario;
        req.session.fotoUsuario = buscaDados.rows[0].imagem;
        res.redirect('/admin/');
    } else {
        res.render('admin/login', { mensagem: 'Usuário não autenticado, tente novamente' })
    }
})

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/');
    });
});
//  reutilizar se preciso ---> '/auth/login'
module.exports = router