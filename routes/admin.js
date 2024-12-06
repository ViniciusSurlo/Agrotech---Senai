const express = require('express')
const router = express.Router()
const BD = require('../db') 

//Rota principal do Painel Administrativo
router.get('/', async (req, res) => {
    const qcategorias = await BD.query(`select count(*) as total_categorias from categorias `)
    const qprodutos = await BD.query(`select count(*) as total_produtos from produtos`)
    const qestoque = await BD.query(`select sum(estoque * valor) as estoque from produtos`)
    // Seleciona a quantidade de produtos por categoria
    const qprodutos_categorias = await BD.query(`select count(*) as produtos_categoria, c.nome_categoria from produtos
         as p inner join categorias as c on p.id_categoria = c.id_categoria group by c.nome_categoria`)
         
    const produtos = await BD.query(`select * from produtos as p`)
    // Seleciona os produtos abaixo do estoque
    const produtos_baixo_estoque = await BD.query(`select count(*) as abaixo_estoque from produtos where estoque < estoque_minimo`)
    // Seleciona produtos acima do estoque
    const produtos_acima_estoque = await BD.query(`select count(*) as acima_estoque from produtos where estoque > estoque_minimo`)

    // Select para a tabela abaixo do estoque
    const produtos_baixo_estoque_tabela = await BD.query(`select nome_produto, estoque, valor from produtos 
        where estoque < estoque_minimo`)
    
// Formatar para o padrão de moeda brasileira (R$)
const valorFormatado = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(qestoque.rows[0].estoque);
    
    res.render('admin/dashboard', {
        totalCategorias: qcategorias.rows[0].total_categorias, 
        totalProdutos: qprodutos.rows[0].total_produtos,
        totalEstoque: qestoque.rows[0].estoque,
        produtos_categorias: qprodutos_categorias.rows,
        produtos: produtos.rows,
        produtos_baixo_estoque: produtos_baixo_estoque.rows[0].abaixo_estoque,
        produtos_acima_estoque: produtos_acima_estoque.rows[0].acima_estoque,
        produtos_baixo_estoque_tabela: produtos_baixo_estoque_tabela.rows,
        valorFormatado
    })
})
router.get('/dashboard', async (req, res) => {
    const qcategorias = await BD.query(`select count(*) as total_categorias from categorias `)
    const qprodutos = await BD.query(`select count(*) as total_produtos from produtos`)
    res.render('admin/dashboard', {
        totalCategorias: qcategorias.rows[0].total_categorias, 
        totalProdutos: qprodutos.rows[0].total_produtos})
})



module.exports = router
