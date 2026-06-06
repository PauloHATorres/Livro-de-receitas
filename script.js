const API_URL = "https://script.google.com/macros/s/AKfycbweuT445Xa1D77iz_DPaf4eMDQpKoc2I8t20inQMm5y5Gp7Le2zpHVnqB6DuTY1QfP8gQ/exec";

let receitas = [];
let receitaEditando = null;
let mostrandoTodasFavoritas = false;

const listaReceitas = document.getElementById("listaReceitas");
const listaFavoritas = document.getElementById("listaFavoritas");
const listaBusca = document.getElementById("listaBusca");

const resultadoBusca = document.getElementById("resultadoBusca");
const secaoFavoritas = document.getElementById("secaoFavoritas");
const secaoRecentes = document.getElementById("secaoRecentes");

const busca = document.getElementById("busca");
const btnVerTodasFavoritas = document.getElementById("btnVerTodasFavoritas");

const btnFiltros = document.getElementById("btnFiltros");
const painelFiltros = document.getElementById("painelFiltros");
const filtroFavorita = document.getElementById("filtroFavorita");
const filtroAvaliacao = document.getElementById("filtroAvaliacao");

const modalReceita = document.getElementById("modalReceita");
const detalhesReceita = document.getElementById("detalhesReceita");
const fecharModal = document.getElementById("fecharModal");

const modalFormulario = document.getElementById("modalFormulario");
const btnNovaReceita = document.getElementById("btnNovaReceita");
const fecharFormulario = document.getElementById("fecharFormulario");
const formReceita = document.getElementById("formReceita");

async function carregarReceitas() {
  try {
    listaFavoritas.innerHTML = "<p class='mensagem-lista'>Carregando favoritas...</p>";
    listaReceitas.innerHTML = "<p class='mensagem-lista'>Carregando receitas...</p>";

    const resposta = await fetch(`${API_URL}?action=listar`);
    const dados = await resposta.json();

    receitas = dados.receitas || [];
    aplicarFiltros();
  } catch (erro) {
    console.error(erro);
    listaFavoritas.innerHTML = "<p class='mensagem-lista'>Erro ao carregar favoritas.</p>";
    listaReceitas.innerHTML = "<p class='mensagem-lista'>Erro ao carregar receitas.</p>";
  }
}

function aplicarFiltros() {
  const termo = busca.value.toLowerCase().trim();
  const favoritaSelecionada = filtroFavorita.value;
  const avaliacaoSelecionada = Number(filtroAvaliacao.value || 0);

  const temFiltroAtivo =
    termo ||
    favoritaSelecionada ||
    avaliacaoSelecionada;

  if (temFiltroAtivo) {
    const filtradas = receitas.filter((receita) => {
      const titulo = String(receita.Título || "").toLowerCase();
      const categorias = String(receita.Categorias || "").toLowerCase();
      const ingredientes = String(receita.Ingredientes || "").toLowerCase();

      const passaBusca =
        titulo.includes(termo) ||
        categorias.includes(termo) ||
        ingredientes.includes(termo);

      const passaFavorita =
        !favoritaSelecionada || receita.Favorita === favoritaSelecionada;

      const avaliacaoReceita = Number(receita.Avaliação || 0);

      const passaAvaliacao =
        !avaliacaoSelecionada || avaliacaoReceita >= avaliacaoSelecionada;

      return passaBusca && passaFavorita && passaAvaliacao;
    });

    mostrarResultadoBusca(filtradas);
    return;
  }

  resultadoBusca.classList.add("escondido");
  secaoFavoritas.classList.remove("escondido");
  secaoRecentes.classList.remove("escondido");

  mostrarFavoritas();
  mostrarRecentes();
}

function mostrarFavoritas() {
  const favoritas = receitas.filter(receita => receita.Favorita === "Sim");

  const lista = mostrandoTodasFavoritas
    ? favoritas
    : favoritas.slice(0, 3);

  if (favoritas.length === 0) {
    listaFavoritas.innerHTML = "<p class='mensagem-lista'>Nenhuma receita favorita ainda.</p>";
    btnVerTodasFavoritas.classList.add("escondido");
    return;
  }

  btnVerTodasFavoritas.classList.toggle("escondido", favoritas.length <= 3);
  btnVerTodasFavoritas.textContent = mostrandoTodasFavoritas ? "Mostrar menos ›" : "Ver todas ›";

  listaFavoritas.innerHTML = "";

  lista.forEach((receita) => {
    listaFavoritas.appendChild(criarCardFavorita(receita));
  });
}

function mostrarRecentes() {
  const recentes = [...receitas]
    .sort((a, b) => obterDataReceita(b) - obterDataReceita(a))
    .slice(0, 10);

  if (recentes.length === 0) {
    listaReceitas.innerHTML = "<p class='mensagem-lista'>Nenhuma receita cadastrada ainda.</p>";
    return;
  }

  listaReceitas.innerHTML = "";

  recentes.forEach((receita) => {
    listaReceitas.appendChild(criarItemRecente(receita));
  });
}

function mostrarResultadoBusca(lista) {
  resultadoBusca.classList.remove("escondido");
  secaoFavoritas.classList.add("escondido");
  secaoRecentes.classList.add("escondido");

  if (lista.length === 0) {
    listaBusca.innerHTML = "<p class='mensagem-lista'>Nenhuma receita encontrada.</p>";
    return;
  }

  listaBusca.innerHTML = "";

  lista.forEach((receita) => {
    listaBusca.appendChild(criarCardFavorita(receita));
  });
}

function criarCardFavorita(receita) {
  const card = document.createElement("article");
  card.className = "receita-card";

  const favorita = receita.Favorita === "Sim";

  card.innerHTML = `
    <div class="card-foto">
      ${
        receita.Foto
          ? `<img src="${receita.Foto}" alt="${receita.Título || "Receita"}">`
          : `<div class="sem-foto">🍽️</div>`
      }

      <button 
        class="btn-favorito ${favorita ? "ativo" : ""}" 
        onclick="alternarFavorito(event, '${receita.ID}')"
        title="Favoritar receita"
        type="button"
      >
        ${favorita ? "♥" : "♡"}
      </button>
    </div>

    <div class="receita-info">
      <h3>${receita.Título || "Sem título"}</h3>
      <p>◷ ${receita["Tempo Medio"] || "Tempo não informado"}</p>
      ${criarTags(receita.Categorias)}
    </div>
  `;

  card.addEventListener("click", () => abrirReceita(receita));
  return card;
}

function criarItemRecente(receita) {
  const item = document.createElement("article");
  item.className = "receita-recente";

  const favorita = receita.Favorita === "Sim";
  const descricao = receita.Observações || receita.Categorias || "Receita guardada com carinho.";

  item.innerHTML = `
    ${
      receita.Foto
        ? `<img src="${receita.Foto}" alt="${receita.Título || "Receita"}">`
        : `<div class="sem-foto sem-foto-recente">🍽️</div>`
    }

    <div class="recente-conteudo">
      <h3>${receita.Título || "Sem título"}</h3>
      <p>${descricao}</p>
    </div>

    <div class="recente-info">
      <span>◷ ${receita["Tempo Medio"] || "—"}</span>

      <button 
        class="btn-favorito btn-favorito-recente ${favorita ? "ativo" : ""}" 
        onclick="alternarFavorito(event, '${receita.ID}')"
        title="Favoritar receita"
        type="button"
      >
        ${favorita ? "♥" : "♡"}
      </button>
    </div>
  `;

  item.addEventListener("click", () => abrirReceita(receita));
  return item;
}

function obterDataReceita(receita) {
  const possiveisDatas = [
    receita["Data Atualização"],
    receita["Data Cadastro"],
    receita["Data"],
    receita["Criado em"]
  ];

  for (const data of possiveisDatas) {
    if (data) {
      const valor = new Date(data).getTime();
      if (!Number.isNaN(valor)) return valor;
    }
  }

  return 0;
}

function criarTags(categorias) {
  if (!categorias) {
    return `<span class="tag">Sem categoria</span>`;
  }

  return String(categorias)
    .split(",")
    .map(categoria => categoria.trim())
    .filter(categoria => categoria)
    .map(categoria => `<span class="tag">${categoria}</span>`)
    .join("");
}

async function alternarFavorito(event, id) {
  event.stopPropagation();

  const receita = receitas.find(r => r.ID === id);

  if (!receita) {
    alert("Receita não encontrada.");
    return;
  }

  const valorAntigo = receita.Favorita;
  const novoValor = receita.Favorita === "Sim" ? "Não" : "Sim";

  receita.Favorita = novoValor;
  aplicarFiltros();

  try {
    const resposta = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "favoritar",
        id: id,
        favorita: novoValor
      })
    });

    const dados = await resposta.json();

    if (dados.status !== "ok") {
      receita.Favorita = valorAntigo;
      aplicarFiltros();
      alert("Erro ao atualizar favorito: " + dados.mensagem);
    }
  } catch (erro) {
    console.error(erro);
    receita.Favorita = valorAntigo;
    aplicarFiltros();
    alert("Erro ao conectar com a planilha.");
  }
}

function abrirReceita(receita) {
  const avaliacao = Number(receita.Avaliação || 0);
  const estrelas = avaliacao > 0 ? "★".repeat(avaliacao) : "Não informada";

  detalhesReceita.innerHTML = `
    <div class="receita-detalhe">
      ${
        receita.Foto
          ? `<img src="${receita.Foto}" alt="${receita.Título || "Receita"}">`
          : `<div class="sem-foto detalhe-sem-foto">🍽️</div>`
      }

      <h2>${receita.Título || "Sem título"}</h2>

      ${
        receita.Favorita === "Sim"
          ? `<p class="favorita">♥ Receita favorita</p>`
          : ""
      }

      <div class="detalhes-grid">
        <p><strong>Tempo:</strong><br>${receita["Tempo Medio"] || "Não informado"}</p>
        <p><strong>Rendimento:</strong><br>${receita.Rendimento || "Não informado"}</p>
        <p><strong>Avaliação:</strong><br>${estrelas}</p>
        <p><strong>Origem/Autor:</strong><br>${receita["Origem/Autor"] || "Não informado"}</p>
      </div>

      <p><strong>Categorias:</strong> ${receita.Categorias || "Sem categoria"}</p>

      <h3>Ingredientes</h3>
      <p>${formatarTexto(receita.Ingredientes)}</p>

      <h3>Modo de Preparo</h3>
      <p>${formatarTexto(receita["Modo de Preparo"])}</p>

      <h3>Observações</h3>
      <p>${formatarTexto(receita.Observações || "Sem observações")}</p>

      <button class="btn-editar" onclick="abrirFormularioEdicao('${receita.ID}')">
        Editar Receita
      </button>
    </div>
  `;

  modalReceita.classList.remove("escondido");
}

function abrirFormularioNovaReceita() {
  receitaEditando = null;
  formReceita.reset();

  document.querySelector("#modalFormulario h2").textContent = "Nova Receita";
  formReceita.querySelector("button").textContent = "Salvar Receita";

  modalFormulario.classList.remove("escondido");
}

function abrirFormularioEdicao(id) {
  const receita = receitas.find(r => r.ID === id);

  if (!receita) {
    alert("Receita não encontrada.");
    return;
  }

  receitaEditando = receita;

  document.getElementById("titulo").value = receita.Título || "";
  document.getElementById("categorias").value = receita.Categorias || "";
  document.getElementById("tempoMedio").value = receita["Tempo Medio"] || "";
  document.getElementById("rendimento").value = receita.Rendimento || "";
  document.getElementById("ingredientes").value = receita.Ingredientes || "";
  document.getElementById("modoPreparo").value = receita["Modo de Preparo"] || "";
  document.getElementById("foto").value = "";
  document.getElementById("origemAutor").value = receita["Origem/Autor"] || "";
  document.getElementById("favorita").value = receita.Favorita || "Não";
  document.getElementById("avaliacao").value = receita.Avaliação || "";
  document.getElementById("observacoes").value = receita.Observações || "";

  document.querySelector("#modalFormulario h2").textContent = "Editar Receita";
  formReceita.querySelector("button").textContent = "Salvar Alterações";

  modalReceita.classList.add("escondido");
  modalFormulario.classList.remove("escondido");
}

function formatarTexto(texto) {
  if (!texto) return "";
  return String(texto).replace(/\n/g, "<br>");
}

function converterImagemParaBase64(arquivo) {
  return new Promise((resolve, reject) => {
    if (!arquivo) {
      resolve("");
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject("Erro ao ler imagem");

    leitor.readAsDataURL(arquivo);
  });
}

btnFiltros.addEventListener("click", () => {
  painelFiltros.classList.toggle("escondido");
});

btnVerTodasFavoritas.addEventListener("click", () => {
  mostrandoTodasFavoritas = !mostrandoTodasFavoritas;
  mostrarFavoritas();
});

busca.addEventListener("input", aplicarFiltros);
filtroFavorita.addEventListener("change", aplicarFiltros);
filtroAvaliacao.addEventListener("change", aplicarFiltros);

btnNovaReceita.addEventListener("click", abrirFormularioNovaReceita);

fecharFormulario.addEventListener("click", () => {
  modalFormulario.classList.add("escondido");
  receitaEditando = null;
  formReceita.reset();
});

fecharModal.addEventListener("click", () => {
  modalReceita.classList.add("escondido");
});

modalReceita.addEventListener("click", (e) => {
  if (e.target === modalReceita) {
    modalReceita.classList.add("escondido");
  }
});

modalFormulario.addEventListener("click", (e) => {
  if (e.target === modalFormulario) {
    modalFormulario.classList.add("escondido");
    receitaEditando = null;
    formReceita.reset();
  }
});

formReceita.addEventListener("submit", async (e) => {
  e.preventDefault();

  const arquivoFoto = document.getElementById("foto").files[0];
  const fotoBase64 = await converterImagemParaBase64(arquivoFoto);

  const dadosReceita = {
    action: receitaEditando ? "editar" : "salvar",
    id: receitaEditando ? receitaEditando.ID : "",
    titulo: document.getElementById("titulo").value,
    categorias: document.getElementById("categorias").value,
    tempoMedio: document.getElementById("tempoMedio").value,
    rendimento: document.getElementById("rendimento").value,
    ingredientes: document.getElementById("ingredientes").value,
    modoPreparo: document.getElementById("modoPreparo").value,
    foto: fotoBase64,
    favorita: document.getElementById("favorita").value,
    origemAutor: document.getElementById("origemAutor").value,
    avaliacao: document.getElementById("avaliacao").value,
    observacoes: document.getElementById("observacoes").value
  };

  try {
    const botao = formReceita.querySelector("button");
    botao.disabled = true;
    botao.textContent = receitaEditando ? "Salvando alterações..." : "Salvando...";

    const resposta = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(dadosReceita)
    });

    const dados = await resposta.json();

    if (dados.status === "ok") {
      alert(receitaEditando ? "Receita editada com sucesso!" : "Receita salva com sucesso!");

      formReceita.reset();
      modalFormulario.classList.add("escondido");
      receitaEditando = null;

      await carregarReceitas();
    } else {
      alert("Erro: " + dados.mensagem);
    }

    botao.disabled = false;
    botao.textContent = "Salvar Receita";
  } catch (erro) {
    console.error(erro);
    alert("Erro ao conectar com a planilha.");

    const botao = formReceita.querySelector("button");
    botao.disabled = false;
    botao.textContent = "Salvar Receita";
  }
});

carregarReceitas();