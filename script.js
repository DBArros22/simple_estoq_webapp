let estoque = JSON.parse(localStorage.getItem('estoque')) || [];
let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
let carrinho = [];
let totalVenda = 0;

// Alternar entre telas
function mudarTela(id) {
    document.querySelectorAll('.tela').forEach(t => t.style.display = 'none');
    document.getElementById('tela-' + id).style.display = 'block';
    if(id === 'estoque') renderEstoque();
    if(id === 'fiados') renderClientes();
}

// Lógica de Estoque
function salvarProduto() {
    const nome = document.getElementById('nome-prod').value;
    const preco = parseFloat(document.getElementById('preco-prod').value);
    const codigo = document.getElementById('codigo-prod').value;

    if(nome && preco) {
        estoque.push({ nome, preco, codigo });
        localStorage.setItem('estoque', JSON.stringify(estoque));
        alert("Produto salvo!");
        renderEstoque();
    }
}

function renderEstoque() {
    const lista = document.getElementById('lista-produtos-estoque');
    lista.innerHTML = estoque.map(p => `<li>${p.nome} - R$ ${p.preco.toFixed(2)} <small>${p.codigo}</small></li>`).join('');
}

// Lógica do Scanner
function iniciarScanner() {
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
            const produto = estoque.find(p => p.codigo === decodedText);
            if(produto) {
                adicionarAoCarrinho(produto);
                html5QrCode.stop();
                navigator.vibrate(100); // Feedback tátil
            } else {
                alert("Produto não cadastrado!");
            }
        }
    );
}

function adicionarAoCarrinho(produto) {
    carrinho.push(produto);
    totalVenda += produto.preco;
    renderCarrinho();
}

function renderCarrinho() {
    const lista = document.getElementById('lista-carrinho');
    lista.innerHTML = carrinho.map(item => `<li>${item.nome} <span>R$ ${item.preco.toFixed(2)}</span></li>`).join('');
    document.getElementById('valor-total').innerText = totalVenda.toFixed(2);
}

// Lógica de Fiado (Simplificada)
function cadastrarCliente() {
    const nome = document.getElementById('nome-cliente').value;
    if(nome) {
        clientes.push({ nome, divida: 0 });
        localStorage.setItem('clientes', JSON.stringify(clientes));
        renderClientes();
    }
}

function renderClientes() {
    const lista = document.getElementById('lista-clientes-fiado');
    lista.innerHTML = clientes.map(c => `<li>${c.nome} <strong>Débito: R$ ${c.divida.toFixed(2)}</strong></li>`).join('');
}

function finalizarVenda(tipo) {
    if(carrinho.length === 0) return alert("Carrinho vazio!");
    
    if(tipo === 'pago') {
        alert("Venda Finalizada com Sucesso!");
        carrinho = [];
        totalVenda = 0;
        renderCarrinho();
    }
}

function abrirModalFiado() {
    const nome = prompt("Nome do cliente para pendurar:");
    const cliente = clientes.find(c => c.nome.toLowerCase() === nome.toLowerCase());
    
    if(cliente) {
        cliente.divida += totalVenda;
        localStorage.setItem('clientes', JSON.stringify(clientes));
        alert(`Valor de R$ ${totalVenda.toFixed(2)} adicionado à conta de ${cliente.nome}`);
        carrinho = [];
        totalVenda = 0;
        renderCarrinho();
    } else {
        alert("Cliente não encontrado. Cadastre-o na aba Fiados.");
    }
}
