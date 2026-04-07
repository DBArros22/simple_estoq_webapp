let estoque = JSON.parse(localStorage.getItem('estoque')) || [];
let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
let carrinho = [];
let totalVenda = 0;

// Navegação entre telas
function mudarTela(id, btn) {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('tela-ativa'));
    document.querySelectorAll('.btn-menu').forEach(b => b.classList.remove('ativo'));
    
    document.getElementById('tela-' + id).classList.add('tela-ativa');
    btn.classList.add('ativo');

    if(id === 'estoque') renderEstoque();
    if(id === 'fiados') renderClientes();
}

// Gestão de Estoque
function salvarProduto() {
    const nome = document.getElementById('nome-prod').value;
    const preco = parseFloat(document.getElementById('preco-prod').value);
    let codigo = document.getElementById('codigo-prod').value;

    if(!nome || isNaN(preco)) {
        alert("Preencha Nome e Preço corretamente.");
        return;
    }

    // Se não houver código, gera um interno para não dar erro no sistema
    if(!codigo) {
        codigo = "MANUAL-" + Date.now();
    }

    estoque.push({ nome, preco, codigo });
    localStorage.setItem('estoque', JSON.stringify(estoque));
    
    alert("✅ " + nome + " cadastrado!");
    
    document.getElementById('nome-prod').value = "";
    document.getElementById('preco-prod').value = "";
    document.getElementById('codigo-prod').value = "";
    renderEstoque();
}

function renderEstoque() {
    const lista = document.getElementById('lista-produtos-estoque');
    lista.innerHTML = estoque.length === 0 ? '<p style="color:#999">Nenhum produto cadastrado.</p>' :
        estoque.map(p => `
            <div class="item-lista">
                <span>${p.nome}</span>
                <b>R$ ${p.preco.toFixed(2)}</b>
            </div>
        `).join('');
}

// NOVIDADE: Função para buscar produto por nome (Venda Manual)
function vendaManual() {
    const busca = prompt("Digite o nome do produto:");
    if (!busca) return;

    const encontrados = estoque.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()));

    if (encontrados.length === 0) {
        alert("❌ Produto não encontrado!");
    } else if (encontrados.length === 1) {
        adicionarAoCarrinho(encontrados[0]);
    } else {
        const opcoes = encontrados.map((p, i) => `${i} - ${p.nome} (R$ ${p.preco.toFixed(2)})`).join('\n');
        const escolha = prompt("Vários encontrados, digite o NÚMERO do correto:\n" + opcoes);
        if (encontrados[escolha]) {
            adicionarAoCarrinho(encontrados[escolha]);
        }
    }
}

// Gestão de Vendas e Scanner
function iniciarScanner() {
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            processarCodigo(decodedText);
            html5QrCode.stop();
        }
    ).catch(err => {
        let manual = prompt("Digite o código de barras do produto:");
        if(manual) processarCodigo(manual);
    });
}

function processarCodigo(codigo) {
    const produto = estoque.find(p => p.codigo == codigo);
    if(produto) {
        adicionarAoCarrinho(produto);
    } else {
        alert("❌ Produto não cadastrado!");
    }
}

function adicionarAoCarrinho(produto) {
    carrinho.push(produto);
    totalVenda += produto.preco;
    if (navigator.vibrate) navigator.vibrate(50);
    renderCarrinho();
}

function renderCarrinho() {
    const lista = document.getElementById('lista-carrinho');
    lista.innerHTML = carrinho.map(item => `
        <div class="item-lista">
            <span>${item.nome}</span>
            <span>R$ ${item.preco.toFixed(2)}</span>
        </div>
    `).join('');
    document.getElementById('valor-total').innerText = totalVenda.toFixed(2);
}

function finalizarVenda(tipo) {
    if(carrinho.length === 0) return alert("Carrinho está vazio!");
    alert("🎉 Venda Finalizada com Sucesso!");
    limparVenda();
}

// Gestão de Fiados
function cadastrarCliente() {
    const nome = document.getElementById('nome-cliente').value;
    if(!nome) return alert("Digite o nome do cliente.");
    
    clientes.push({ nome, divida: 0 });
    localStorage.setItem('clientes', JSON.stringify(clientes));
    document.getElementById('nome-cliente').value = "";
    renderClientes();
}

// Atualizado para incluir o botão de Pagar/Abater
function renderClientes() {
    const lista = document.getElementById('lista-clientes-fiado');
    lista.innerHTML = clientes.map((c, index) => `
        <div class="item-lista" style="flex-direction: column; align-items: flex-start; gap: 8px;">
            <div style="display: flex; justify-content: space-between; width: 100%;">
                <span>${c.nome}</span>
                <b style="color:var(--perigo)">R$ ${c.divida.toFixed(2)}</b>
            </div>
            <button onclick="abaterDivida(${index})" style="width: 100%; padding: 8px; border: 1px solid var(--sucesso); color: var(--sucesso); background: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
                PAGAR / ABATER VALOR
            </button>
        </div>
    `).join('');
}

// NOVIDADE: Função para o cliente pagar a conta
function abaterDivida(index) {
    const valor = parseFloat(prompt("Quanto o cliente está pagando?"));
    if (isNaN(valor) || valor <= 0) return;

    if (valor > clientes[index].divida) {
        if (!confirm("O valor é maior que a dívida. Deseja continuar?")) return;
    }

    clientes[index].divida -= valor;
    localStorage.setItem('clientes', JSON.stringify(clientes));
    alert("✅ Pagamento registrado!");
    renderClientes();
}

function abrirModalFiado() {
    if(carrinho.length === 0) return alert("Carrinho vazio!");
    let nome = prompt("Nome do cliente para pendurar:");
    if (!nome) return;

    let cliente = clientes.find(c => c.nome.toLowerCase() === nome.toLowerCase());
    
    if(cliente) {
        cliente.divida += totalVenda;
        localStorage.setItem('clientes', JSON.stringify(clientes));
        alert("Dívida registrada para " + cliente.nome);
        limparVenda();
    } else {
        alert("Cliente não encontrado. Cadastre-o na aba Fiados.");
    }
}

function limparVenda() {
    carrinho = [];
    totalVenda = 0;
    renderCarrinho();
}
