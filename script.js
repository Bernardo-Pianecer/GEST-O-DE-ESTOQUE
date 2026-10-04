let listaDeProdutos = [];
let indiceProdutoEmEdicao = null;
let temporizadorSucesso;

function cadastrarProduto() {
    clearTimeout(temporizadorSucesso);
    indiceProdutoEmEdicao = null;
    limparFormulario();
    document.getElementById("tituloFormulario").textContent = "CADASTRO DE PRODUTO";
    document.getElementById("confirmarCadastro").textContent = "Confirmar Produto";
    document.getElementById("spamDeCadastro").classList.add("active");
}

function fecharSpamCadastro() {
    clearTimeout(temporizadorSucesso);
    document.getElementById("spamDeCadastro").classList.remove("active");
    document.getElementById("avisoNãoCadastro").classList.remove("active");
    document.getElementById("avisoCadastroSucesso").classList.remove("active");
    indiceProdutoEmEdicao = null;
}

function limparFormulario() {
    document.getElementById("nomeProduto").value = "";
    document.getElementById("codigoProduto").value = "";
    document.getElementById("categoriaProduto").value = "";
    document.getElementById("quantidadeProduto").value = "";
    document.getElementById("precoProduto").value = "";
    document.getElementById("avisoNãoCadastro").classList.remove("active");
    document.getElementById("avisoCadastroSucesso").classList.remove("active");
}

function confirmarCadastro() {
    const nome = document.getElementById("nomeProduto").value.trim();
    const codigo = document.getElementById("codigoProduto").value.trim();
    const categoria = document.getElementById("categoriaProduto").value.trim();
    const quantidade = Number(document.getElementById("quantidadeProduto").value);
    const preco = Number(document.getElementById("precoProduto").value);

    if (
        !nome ||
        !codigo ||
        !categoria ||
        document.getElementById("quantidadeProduto").value === "" ||
        !Number.isInteger(quantidade) ||
        quantidade < 0 ||
        !Number.isFinite(preco) ||
        preco <= 0
    ) {
        document.getElementById("avisoNãoCadastro").classList.add("active");
        document.getElementById("avisoCadastroSucesso").classList.remove("active");
        return;
    }

    const produto = { nome, codigo, categoria, quantidade, preco };
    if (indiceProdutoEmEdicao === null) {
        listaDeProdutos.push(produto);
    } else {
        listaDeProdutos[indiceProdutoEmEdicao] = produto;
    }

    renderizarProduto();
    document.getElementById("avisoNãoCadastro").classList.remove("active");
    document.getElementById("avisoCadastroSucesso").textContent =
        indiceProdutoEmEdicao === null ? "Cadastro feito com sucesso!" : "Produto atualizado com sucesso!";
    document.getElementById("avisoCadastroSucesso").classList.add("active");
    indiceProdutoEmEdicao = null;

    clearTimeout(temporizadorSucesso);
    temporizadorSucesso = setTimeout(() => {
        document.getElementById("avisoCadastroSucesso").classList.remove("active");
        fecharSpamCadastro();
    }, 1000);
}

function editarProduto(indice) {
    const produto = listaDeProdutos[indice];
    if (!produto) return;

    clearTimeout(temporizadorSucesso);
    indiceProdutoEmEdicao = indice;
    document.getElementById("nomeProduto").value = produto.nome;
    document.getElementById("codigoProduto").value = produto.codigo;
    document.getElementById("categoriaProduto").value = produto.categoria;
    document.getElementById("quantidadeProduto").value = produto.quantidade;
    document.getElementById("precoProduto").value = produto.preco;
    document.getElementById("tituloFormulario").textContent = "EDITAR PRODUTO";
    document.getElementById("confirmarCadastro").textContent = "Salvar Alterações";
    document.getElementById("avisoNãoCadastro").classList.remove("active");
    document.getElementById("avisoCadastroSucesso").classList.remove("active");
    document.getElementById("spamDeCadastro").classList.add("active");
}

function alterarEstoque(indice, alteracao) {
    const produto = listaDeProdutos[indice];
    if (!produto) return;

    produto.quantidade = Math.max(0, produto.quantidade + alteracao);
    renderizarProduto();
}

function excluirProduto(indice) {
    const produto = listaDeProdutos[indice];
    if (!produto || !confirm(`Deseja excluir o produto "${produto.nome}"?`)) return;

    listaDeProdutos.splice(indice, 1);
    renderizarProduto();
}

function renderizarProduto() {
    const container = document.getElementById("produtos");
    container.replaceChildren();

    if (listaDeProdutos.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "estadoVazio";
        vazio.textContent = "Nenhum produto cadastrado. Use o botão Cadastrar Produto para começar.";
        container.appendChild(vazio);
    }

    listaDeProdutos.forEach((produto, indice) => {
        const status = produto.quantidade === 0 ? "Zerado" : produto.quantidade < 5 ? "Baixo" : "Normal";
        const linha = document.createElement("div");
        linha.className = "linhaProduto";

        const valores = [
            String(indice + 1),
            produto.nome,
            produto.codigo,
            produto.categoria,
            String(produto.quantidade),
            produto.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        ];

        valores.forEach((valor) => {
            const celula = document.createElement("div");
            celula.className = "celulaProduto";
            celula.textContent = valor;
            linha.appendChild(celula);
        });

        const celulaStatus = document.createElement("div");
        celulaStatus.className = "celulaProduto";
        const etiquetaStatus = document.createElement("span");
        etiquetaStatus.className = `etiquetaStatus ${status.toLowerCase()}`;
        etiquetaStatus.textContent = status;
        celulaStatus.appendChild(etiquetaStatus);
        linha.appendChild(celulaStatus);

        const acoes = document.createElement("div");
        acoes.className = "celulaProduto acoesProduto";
        acoes.appendChild(criarBotaoAcao("−", "Diminuir estoque", "botaoEstoque", () => alterarEstoque(indice, -1)));
        acoes.appendChild(criarBotaoAcao("+", "Aumentar estoque", "botaoEstoque", () => alterarEstoque(indice, 1)));
        acoes.appendChild(criarBotaoAcao("Editar", "Editar produto", "botaoEditar", () => editarProduto(indice)));
        acoes.appendChild(criarBotaoAcao("Excluir", "Excluir produto", "botaoExcluir", () => excluirProduto(indice)));
        linha.appendChild(acoes);
        container.appendChild(linha);
    });

    atualizarResumo();
}

function criarBotaoAcao(texto, descricao, classe, acao) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = classe;
    botao.textContent = texto;
    botao.setAttribute("aria-label", descricao);
    botao.addEventListener("click", acao);
    return botao;
}

function atualizarResumo() {
    const totais = [
        listaDeProdutos.length,
        listaDeProdutos.filter((produto) => produto.quantidade >= 5).length,
        listaDeProdutos.filter((produto) => produto.quantidade > 0 && produto.quantidade < 5).length,
        listaDeProdutos.filter((produto) => produto.quantidade === 0).length
    ];

    document.querySelectorAll(".quantidadeResumo").forEach((elemento, indice) => {
        elemento.textContent = String(totais[indice]);
    });
}
