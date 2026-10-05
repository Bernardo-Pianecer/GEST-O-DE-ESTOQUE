/* ===== ESTADO GLOBAL DO APP =====
    Essas 3 variáveis ficam no topo porque são o "estado" do sistema —
   controlam tudo que acontece na página enquanto ela está aberta. */

// Array que guarda todos os produtos cadastrados (em memória).
let listaDeProdutos = [];

// Guarda a posição do produto que está sendo editado.
// null = não estamos editando (modo cadastro); um número = estamos editando aquele index.
let indiceProdutoEmEdicao = null;

// Guarda o "timer" da mensagem de sucesso para poder cancelá-la depois.
// Sem isso, mensagens antigas continuariam mostrando enquanto uma nova aparece.
let temporizadorSucesso;

/* ===== ABRIR O POPUP (modo cadastro) =====
Sempre que o usuário clica em "Cadastrar Produto":
1. Cancela qualquer timer pendente (evita erros/sobreposição)
2. Zera o modo de edição — estamos começando um cadastro novo
3. Limpa o formulário e as mensagens
4. Reseta título/botão para o texto de cadastro
   5. Adiciona .active → o CSS liga o display: flex e o popup aparece */
function cadastrarProduto() {
    clearTimeout(temporizadorSucesso);
    indiceProdutoEmEdicao = null;
    limparFormulario();
    document.getElementById("tituloFormulario").textContent = "CADASTRO DE PRODUTO";
    document.getElementById("confirmarCadastro").textContent = "Confirmar Produto";
    document.getElementById("spamDeCadastro").classList.add("active");
}

/* ===== FECHAR O POPUP =====
Remove a classe .active (o CSS volta para display: none),
   esconde as mensagens e reseta o modo de edição. */
function fecharSpamCadastro() {
    clearTimeout(temporizadorSucesso);
    document.getElementById("spamDeCadastro").classList.remove("active");
    document.getElementById("avisoNãoCadastro").classList.remove("active");
    document.getElementById("avisoCadastroSucesso").classList.remove("active");
    indiceProdutoEmEdicao = null;
}

/* ===== LIMPAR FORMULÁRIO =====
Só zera os inputs e esconde os avisos.
   Separar isso em uma função evita repetir essas 7 linhas em vários lugares. */
function limparFormulario() {
    document.getElementById("nomeProduto").value = "";
    document.getElementById("codigoProduto").value = "";
    document.getElementById("categoriaProduto").value = "";
    document.getElementById("quantidadeProduto").value = "";
    document.getElementById("precoProduto").value = "";
    document.getElementById("avisoNãoCadastro").classList.remove("active");
    document.getElementById("avisoCadastroSucesso").classList.remove("active");
}

/* ===== CONFIRMAR CADASTRO / EDIÇÃO =====
Essa é a função principal: lê, valida, salva e atualiza a tela.

POR QUE trim()? Remove espaços em branco no começo/fim.
"  " (só espaços) viraria "" depois do trim — ou seja, conta como vazio.
POR QUE Number()? O input type="number" devolve TEXTO ("10"), não número.
Number() converte para 10, permitindo comparações matemáticas (<= 0, etc.). */
function confirmarCadastro() {
    const nome = document.getElementById("nomeProduto").value.trim();
    const codigo = document.getElementById("codigoProduto").value.trim();
    const categoria = document.getElementById("categoriaProduto").value.trim();
    const quantidade = Number(document.getElementById("quantidadeProduto").value);
    const preco = Number(document.getElementById("precoProduto").value);

/* ===== VALIDAÇÃO =====
    Cada condição bloqueia um caso inválido:
    !nome / !codigo / !categoria  → campo vazio (string vazia é "falsa")
    valor === ""                  → usuário não digitou nada na quantidade
    !Number.isInteger(quantidade) → quantidade fracionada (2.5 não faz sentido p/ estoque)
    quantidade < 0                → estoque negativo é impossível
    !Number.isFinite(preco)       → preço que não é número (NaN)
    preco <= 0                    → preço zero ou negativo não é válido
    Se QUALQUER uma for verdadeira, mostra o aviso vermelho e dá return (para aqui). */
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

    // Objeto com os dados limpos e convertidos do formulário
    const produto = { nome, codigo, categoria, quantidade, preco };

/* ===== SALVAR: cadastro novo OU edição =====
    Se não estamos editando → push (adiciona no fim do array)
    Se estamos editando → substitui o produto no index guardado
    (isso é o que permite "editar" sem duplicar o item na lista) */
    if (indiceProdutoEmEdicao === null) {
        listaDeProdutos.push(produto);
    } else {
        listaDeProdutos[indiceProdutoEmEdicao] = produto;
    }

    // Redesenha a tabela com o produto novo/atualizado (sem recarregar a página)
    renderizarProduto();

    // Mostra a mensagem de sucesso com texto diferente para cadastro e edição
    document.getElementById("avisoNãoCadastro").classList.remove("active");
    document.getElementById("avisoCadastroSucesso").textContent =
        indiceProdutoEmEdicao === null ? "Cadastro feito com sucesso!" : "Produto atualizado com sucesso!";
    document.getElementById("avisoCadastroSucesso").classList.add("active");
    indiceProdutoEmEdicao = null;

/* ===== AUTO-FECHAR =====
    setTimeout executa o código após 1000ms (1 segundo).
    POR QUE clearTimeout antes? Se o usuário confirmar 2 vezes rápido,
    o timer antigo é cancelado para não fechar o popup no meio de outra ação. */
    clearTimeout(temporizadorSucesso);
    temporizadorSucesso = setTimeout(() => {
        document.getElementById("avisoCadastroSucesso").classList.remove("active");
        fecharSpamCadastro();
    }, 1000);
}

/* ===== EDITAR PRODUTO =====
Recebe o index do produto clicado e:
1. Copia os valores do produto para os inputs (o usuário vê e altera)
2. Muda o título para "EDITAR PRODUTO" e o botão para "Salvar Alterações"
3. Guarda o index em indiceProdutoEmEdicao — o confirmarCadastro vai
    usar isso para SUBSTITUIR em vez de adicionar
   4. Abre o popup */
function editarProduto(indice) {
    const produto = listaDeProdutos[indice];
    if (!produto) return; // índice inválido? sai sem fazer nada (proteção)

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

/* ===== ALTERAR ESTOQUE (+ / −) =====
Recebe o index e o quanto somar/subtrair (±1).
POR QUE Math.max(0, ...)? Garante que o estoque NUNCA fique negativo —
se tentar diminuir um produto com quantidade 0, o resultado trava em 0. */
function alterarEstoque(indice, alteracao) {
    const produto = listaDeProdutos[indice];
    if (!produto) return;

    produto.quantidade = Math.max(0, produto.quantidade + alteracao);
    renderizarProduto();
}

/* ===== EXCLUIR PRODUTO =====
POR QUE confirm()? É o popup nativo do navegador ("OK/Cancelar") —
evita excluir um produto por clique acidental.
splice(indice, 1) remove só 1 item na posição e REINDEXA o resto
automaticamente (os índices continuam corretos para as outras funções). */
function excluirProduto(indice) {
    const produto = listaDeProdutos[indice];
    if (!produto || !confirm(`Deseja excluir o produto "${produto.nome}"?`)) return;

    listaDeProdutos.splice(indice, 1);
    renderizarProduto();
}

/* ===== RENDERIZAR A TABELA =====
É o coração do "sem refresh": reconstrói todas as linhas a cada mudança.

POR QUE replaceChildren() em vez de innerHTML = ""? É a forma moderna
e mais segura de limpar — e aceita os novos elementos direto.
POR QUE createElement + textContent? textContent trata o texto como
TEXTO puro. Se alguém digitasse "<b>oi</b>" no nome, apareceria literal
"<b>oi</b>" em vez de virar HTML (protege contra injeção de código). */
function renderizarProduto() {
    const container = document.getElementById("produtos");
    container.replaceChildren();

    // Se não há produtos, mostra um aviso amigável no lugar da tabela vazia
    if (listaDeProdutos.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "estadoVazio";
        vazio.textContent = "Nenhum produto cadastrado. Use o botão Cadastrar Produto para começar.";
        container.appendChild(vazio);
    }

    // forEach percorre o array; indice é a posição de cada produto
    listaDeProdutos.forEach((produto, indice) => {
        // Status em ternário: 0 = Zerado, <5 = Baixo, senão = Normal
        const status = produto.quantidade === 0 ? "Zerado" : produto.quantidade < 5 ? "Baixo" : "Normal";

        // Cada produto vira uma "linha" da tabela (mesmo grid do cabeçalho)
        const linha = document.createElement("div");
        linha.className = "linhaProduto";

/* POR QUE toLocaleString("pt-BR", {style:"currency"})?
Formata o preço como moeda brasileira automaticamente:
1200.5 → "R$ 1.200,50". Nada de formatação manual. */
        const valores = [
            String(indice + 1),                                 // ID (1-based: começa em 1, não 0)
            produto.nome,
            produto.codigo,
            produto.categoria,
            String(produto.quantidade),
            produto.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        ];

        // Cria uma célula para cada valor e adiciona na linha
        valores.forEach((valor) => {
            const celula = document.createElement("div");
            celula.className = "celulaProduto";
            celula.textContent = valor;
            linha.appendChild(celula);
        });

        // Célula do status com a etiqueta colorida (classe muda a cor)
        const celulaStatus = document.createElement("div");
        celulaStatus.className = "celulaProduto";
        const etiquetaStatus = document.createElement("span");
        etiquetaStatus.className = `etiquetaStatus ${status.toLowerCase()}`;
        etiquetaStatus.textContent = status;
        celulaStatus.appendChild(etiquetaStatus);
        linha.appendChild(celulaStatus);

    /* ===== BOTÕES DE AÇÃO =====
        POR QUE criarBotaoAcao()? Evita repetir o mesmo código 4 vezes
        (DRY = Don't Repeat Yourself). Cada botão recebe seu texto,
        texto de acessibilidade, classe CSS e a ação ao clicar.
        Ações em arrow function capturam o `indice` daquele produto. */
        const acoes = document.createElement("div");
        acoes.className = "celulaProduto acoesProduto";
        acoes.appendChild(criarBotaoAcao("−", "Diminuir estoque", "botaoEstoque", () => alterarEstoque(indice, -1)));
        acoes.appendChild(criarBotaoAcao("+", "Aumentar estoque", "botaoEstoque", () => alterarEstoque(indice, 1)));
        acoes.appendChild(criarBotaoAcao("Editar", "Editar produto", "botaoEditar", () => editarProduto(indice)));
        acoes.appendChild(criarBotaoAcao("Excluir", "Excluir produto", "botaoExcluir", () => excluirProduto(indice)));
        linha.appendChild(acoes);

        // Adiciona a linha pronta no container da tabela
        container.appendChild(linha);
    });

    // Atualiza os cards de resumo depois que a lista muda
    atualizarResumo();
}

/* ===== FÁBRICA DE BOTÕES =====
Função auxiliar que cria um botão pronto.
POR QUE aria-label? Leitura de tela (acessibilidade): um botão "−"
é ilegível para quem usa leitor de tela; o aria-label diz o que ele faz.
POR QUE addEventListener em vez de onclick? Mais flexível e considerado
boa prática — a função vem pronta para ser chamada pelo clique. */
function criarBotaoAcao(texto, descricao, classe, acao) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = classe;
    botao.textContent = texto;
    botao.setAttribute("aria-label", descricao);
    botao.addEventListener("click", acao);
    return botao;
}

/* ===== ATUALIZAR CARDS DE RESUMO =====
POR QUE filter().length? filter devolve um sub-array com os itens que
passam no teste; .length conta quantos são. Ex.: produtos com qtd >= 5
= "Em Estoque Normal".
Depois, os 4 números são colocados nos 4 cards — o querySelectorAll
retorna na MESMA ORDEM do HTML (Total, Normal, Baixo, Zerado), então
o índice de cada elemento casa com o índice de cada total. */
function atualizarResumo() {
    const totais = [
        listaDeProdutos.length,                                                      // total de produtos
        listaDeProdutos.filter((produto) => produto.quantidade >= 5).length,         // estoque normal
        listaDeProdutos.filter((produto) => produto.quantidade > 0 && produto.quantidade < 5).length, // estoque baixo
        listaDeProdutos.filter((produto) => produto.quantidade === 0).length         // estoque zerado
    ];

    document.querySelectorAll(".quantidadeResumo").forEach((elemento, indice) => {
        elemento.textContent = String(totais[indice]);
    });
}