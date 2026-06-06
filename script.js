const API_URL = "https://script.google.com/macros/s/AKfycbweuT445Xa1D77iz_DPaf4eMDQpKoc2I8t20inQMm5y5Gp7Le2zpHVnqB6DuTY1QfP8gQ/exec";

let receitas = [];
let receitaEditando = null;

const listaReceitas = document.getElementById("listaReceitas");
const busca = document.getElementById("busca");

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
    listaReceitas.innerHTML = "<p>Carregando receitas...</p>";

    const resposta = await fetch(`${API_URL}?action=listar`);
    const dados = await resposta.json();

    receitas = dados.receitas || [];
    aplicarFiltros();
  } catch (erro) {
    console.error(erro);
    listaReceitas.innerHTML = "<p>Erro ao carregar receitas.</p>";
  }
}

function aplicarFiltros() {
  const termo = busca.value.toLowerCase();
  const favoritaSelecionada = filtroFavorita.value;
  const avaliacaoSelecionada = Number(filtroAvaliacao.value || 0);

  const filtradas = receitas.filter((receita) => {
    const titulo = String(receita.Título || "").toLowerCase();
    const categorias = String(receita.Categorias || "").toLowerCase();

    const passaBusca =
      titulo.includes(termo) ||
      categorias.includes(termo);

    const passaFavorita =
      !favoritaSelecionada ||
      receita.Favorita === favoritaSelecionada;

    const avaliacaoReceita = Number(receita.Avaliação || 0);

    const passaAvaliacao =
      !avaliacaoSelecionada ||
      avaliacaoReceita >= avaliacaoSelecionada;

    return passaBusca && passaFavorita && passaAvaliacao;
  });

  mostrarReceitas(filtradas);
}

function mostrarReceitas(lista) {
  if (lista.length === 0) {
    listaReceitas.innerHTML = "<p>Nenhuma receita encontrada.</p>";
    return;
  }

  listaReceitas.innerHTML = "";

  lista.forEach((receita) => {
    const card = document.createElement("article");
    card.className = "receita-card";

    card.innerHTML = `
      ${
        receita.Foto
          ? `<img src="${receita.Foto}" alt="${receita.Título || "Receita"}">`
          : `<div class="sem-foto">🍽️</div>`
      }

      <div class="receita-info">
        <h3>${receita.Título || "Sem título"}</h3>
        <p>${receita.Favorita === "Sim" ? "⭐ Favorita" : ""}</p>
        <p>⏱️ ${receita["Tempo Medio"] || "Tempo não informado"}</p>
        <p>🍽️ ${receita.Rendimento || "Rendimento não informado"}</p>
        <p>${"⭐".repeat(Number(receita.Avaliação) || 0)}</p>
        <span class="tag">${receita.Categorias || "Sem categoria"}</span>
      </div>
    `;

    card.addEventListener("click", () => abrirReceita(receita));
    listaReceitas.appendChild(card);
  });
}

function abrirReceita(receita) {
  detalhesReceita.innerHTML = `
    <div class="receita-detalhe">
      ${
        receita.Foto
          ? `<img src="${receita.Foto}" alt="${receita.Título || "Receita"}">`
          : ""
      }

      <h2>${receita.Título || "Sem título"}</h2>

      <p class="favorita">${receita.Favorita === "Sim" ? "⭐ Receita favorita" : ""}</p>

      <p><strong>⏱️ Tempo:</strong> ${receita["Tempo Medio"] || "Não informado"}</p>
      <p><strong>🍽️ Rendimento:</strong> ${receita.Rendimento || "Não informado"}</p>
      <p><strong>🏷️ Categorias:</strong> ${receita.Categorias || "Sem categoria"}</p>
      <p><strong>✍️ Origem/Autor:</strong> ${receita["Origem/Autor"] || "Não informado"}</p>
      <p><strong>⭐ Avaliação:</strong> ${"⭐".repeat(Number(receita.Avaliação) || 0)}</p>

      <h3>Ingredientes</h3>
      <p>${formatarTexto(receita.Ingredientes)}</p>

      <h3>Modo de Preparo</h3>
      <p>${formatarTexto(receita["Modo de Preparo"])}</p>

      <h3>Observações</h3>
      <p>${formatarTexto(receita.Observações || "Sem observações")}</p>

      <button class="btn-editar" onclick="abrirFormularioEdicao('${receita.ID}')">
        ✏️ Editar Receita
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