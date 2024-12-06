const express = require('express')
const path = require('path')
const session = require('express-session')
const fileUpload = require('express-fileupload')   
const app = express()

// Configurações do Servidor
app.set('views', path.join(__dirname, 'views')); // Configura o diretório das views
app.set('view engine', 'ejs')  //Configura o motor de templates para EJS
app.use(express.static(path.join(__dirname, 'public'))); //Define pasta para arquivos css / img
app.use(express.urlencoded({ extended: true })) //Para processar os dados do formulário
app.use(express.json());  // utilizar dados em formato JSON

// Configuração Login
app.use(session({
    secret: 'sesisenai', // Um segredo para assinar a sessão
    resave: true, // Não salva a sessão se não houver modificações
    saveUninitialized: true // Não salva uma sessão vazia
}));
// Middleware para verificar se o usuário está logado
// e disponibilizar a sessão em todas as views
const verificarAutenticacao = (req, res, next) => {
    if (req.session.usuarioLogado) {
        res.locals.usuarioLogado = req.session.usuarioLogado || null;
        res.locals.nomeUsuario = req.session.nomeUsuario || null;
        res.locals.idUsuario = req.session.idUsuario || null;
        res.locals.fotoUsuario = req.session.fotoUsuario || null;
        next(); // Usuário está logado, pode continuar
    } else {
       res.redirect('/auth/login'); // Redireciona para a página de login
    }
}

// Middleware para fazer upload do arquivo img
app.use(fileUpload())

// Utilizando Rotas de Login
const loginRotas = require('./routes/loginRotas')
app.use('/auth', loginRotas)
// Rota da pagina Principal "Landing Page"
app.get('/', (req, res) => {
    //  views /landing/index.ejs
    res.render('landing/index')
})

const cadastroRotas = require('./routes/cadastroRotas')
app.use('/cadastro', cadastroRotas)

// Utilizando rotas admin
const adminRotas = require('./routes/admin')
app.use('/admin', verificarAutenticacao, adminRotas)

// Utilizando rotas de categorias
const categoriasRotas = require('./routes/categoriasRotas')
app.use('/categorias', verificarAutenticacao, categoriasRotas)

// utlizando rotas de produtos
const produtosRotas = require('./routes/produtosRotas')
app.use('/produtos', verificarAutenticacao, produtosRotas)

// Utilizando rotas usuarios
const usuariosRotas = require('./routes/usuariosRotas')
app.use('/usuarios', verificarAutenticacao, usuariosRotas)

// Utilizando rotas de Dashbard
const dashboardRotas = require('./routes/dashboardRotas')
app.use('/dashboard',verificarAutenticacao, dashboardRotas)

const porta = 3000
app.listen(porta, () => {
    // console.log(`Servidor rodando na porta http://192.168.0.130:${porta}`)
    console.log(`Servidor rodando na porta http://localhost:${porta}`)
})


