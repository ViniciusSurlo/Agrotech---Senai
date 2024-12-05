const express = require('express')
const router = express.Router()
const BD = require('../db')

// Listar Produtos
// Read
router.get('/', async (req, res) => {
    const { busca = '', ordenar = "p.nome_produto", pg = 1 } = req.query;

    const limite = 6 // numero de registro por pagina
    const offset = (pg - 1) * limite; // numero de registro a ser pular

    const categorias = await BD.query(`SELECT * FROM categorias`)
    const buscaDados = await BD.query(`select p.id_produto, p.nome_produto, p.valor, p.estoque, p.estoque_minimo, p.imagem , c.nome_categoria 
        from produtos as p
        inner join categorias as c on p.id_categoria = c.id_categoria
        where upper(p.nome_produto) like $1 
        or upper(c.nome_categoria) like $1
        order by ${ordenar} limit $2 offset $3`, [`%${busca.toUpperCase()}%`, limite, offset])
    // const categorias = await BD.query(`SELECT * from categorias`)
    
    // Calculando o total de itens da consulta para criar a paginação
    const totalItems = await BD.query(`
        select count(*) as total
        from produtos as p
        inner join categorias as c on p.id_categoria = c.id_categoria
        where upper(p.nome_produto) like $1 
        or upper(c.nome_categoria) like $1`, [`%${busca.toUpperCase()}%`])

    const totalPgs = Math.ceil(totalItems.rows[0].total / limite);

    
    res.render('produtosTelas/lista', {
        produtos: buscaDados.rows,
        busca, 
        ordenar, 
        categorias: categorias.rows,
        pgAtual: parseInt(pg), 
        totalPgs})
})

//create
router.get('/novo', async (req,res)=>{
    try{
        const categorias = await BD.query(`SELECT * FROM categorias`)
        console.log(categorias);
        res.render('produtosTelas/novo', {categorias: categorias.rows})
    }catch(erro){
        console.log('Erro ao entrar tela de cadastro', erro);
        // res.render('produtosTelas/criar', {mensagem: erro})
    }
})
router.post('/novo', async (req, res) => {
    try{
        
        const {nome_produto, valor, estoque, estoque_minimo, imagem, id_categoria} = req.body;
        await BD.query(`INSERT INTO produtos 
            (nome_produto, valor, estoque, estoque_minimo, imagem, id_categoria) 
            values ($1, $2, $3, $4, $5, $6) `, [nome_produto, valor, estoque, estoque_minimo, imagem, id_categoria])
        res.redirect('/produtos/')
    }catch (erro){
        console.log('Erro ao entrar tela de cadastro', erro);
        res.render('produtosTelas/criar', {mensagem: erro})
    }

})

//editar

router.get('/:id/editar', async (req, res) => {
    try{
        const id = req.params.id
        const produtos =  await BD.query(`SELECT * FROM produtos WHERE id_produto = $1`, [id])
        console.log(produtos);
        const categorias = await BD.query(`SELECT * FROM categorias`)
        const movimentacoes = await BD.query(`select m.data_movimentacao, m.tipo_movimentacao, m.estoque, m.quantidade, m.descricao, TO_CHAR(data_movimentacao, 'DD/MM/YYYY') as data from movimentacoes 
            as m where m.id_produto = $1`, [id])
        res.render('produtosTelas/editar', {categoriasCadastradas: categorias.rows, produtos: produtos.rows[0], movimentacoes: movimentacoes.rows})

    }catch (erro){
        console.log('Erro ao editar produto', erro);
        res.render('produtosTelas/editar', {mensagem: erro})
    }
})

router.post('/:id/editar', async  (req, res) => {
    try{
        const id =  req.params.id
        const {nome, valor, estoque, estoque_minimo, imagem, id_categoria} = req.body
        await BD.query(`UPDATE produtos SET nome_produto = $1, valor = $2,  estoque = $3, estoque_minimo =$4, imagem = $5, id_categoria = $6 WHERE id_produto  = $7`, [nome, valor, estoque, estoque_minimo, imagem, id_categoria, id])
        res.redirect('/produtos/')
    }catch  (erro){
        console.log('Erro ao editar produto', erro);
        res.render('produtosTelas/editar', {mensagem: erro})
    }

})

// Lançar movimentação

router.post('/:id/lancar-movimentacao', async (req, res) => {
    try{
        const id = req.params.id;
        const {tipo_movimentacao, quantidade, descricao} = req.body;
        await BD.query(`INSERT INTO movimentacoes (id_produto, tipo_movimentacao, quantidade, descricao, id_usuario, data_movimentacao) VALUES ($1, $2, $3, $4, $5, current_date)`
        , [id, tipo_movimentacao, quantidade, descricao, req.session.idUsuario ])
        res.redirect(`/produtos/${id}/editar`);
    }catch(erro){
        console.log('Erro ao Lançar movimentação', erro);
    }
})




router.post('/:id/deletar',  async (req, res) => {
    const id = req.params.id
    await BD.query (`DELETE FROM produtos WHERE id_produto = $1`, [id])
    res.redirect('/produtos/')
})

module.exports = router