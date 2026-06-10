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

const btnLerReceitaIA = document.getElementById("btnLerReceitaIA");
const fotoReceitaIA = document.getElementById("fotoReceitaIA");

const tipoFormaReceita = document.getElementById("tipoFormaReceita");
const camposFormaReceita = document.getElementById("camposFormaReceita");

const btnCalculadora = document.getElementById("btnCalculadora");
const modalCalculadora = document.getElementById("modalCalculadora");
const fecharCalculadora = document.getElementById("fecharCalculadora");
const selectReceitaCalculadora = document.getElementById("selectReceitaCalculadora");
const rendimentoOriginalInfo = document.getElementById("rendimentoOriginalInfo");
const rendimentoNovoCalc = document.getElementById("rendimentoNovoCalc");
const btnCalcularRendimento = document.getElementById("btnCalcularRendimento");
const btnCalcularForma = document.getElementById("btnCalcularForma");
const resultadoCalculadora = document.getElementById("resultadoCalculadora");
const calcRendimento = document.getElementById("calcRendimento");
const calcForma = document.getElementById("calcForma");
const tipoFormaNova = document.getElementById("tipoFormaNova");
const camposFormaNova = document.getElementById("camposFormaNova");
const formaOriginalInfo = document.getElementById("formaOriginalInfo");

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

  const temFiltroAtivo = termo || favoritaSelecionada || avaliacaoSelecionada;

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

  const receita = receitas.find(r => String(r.ID) === String(id));

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

      ${gerarResumoFormaReceitaHTML(receita)}

      <p><strong>Categorias:</strong> ${receita.Categorias || "Sem categoria"}</p>

      <h3>Ingredientes</h3>
      <p>${formatarTexto(receita.Ingredientes)}</p>

      <h3>Modo de Preparo</h3>
      <p>${formatarTexto(receita["Modo de Preparo"])}</p>

      <h3>Observações</h3>
      <p>${formatarTexto(receita.Observações || "Sem observações")}</p>

      <div class="acoes-receita">
        <button class="btn-editar" onclick="baixarReceitaPDF('${receita.ID}')">
          📄 Baixar PDF
        </button>

        <button class="btn-editar" onclick="abrirFormularioEdicao('${receita.ID}')">
          Editar Receita
        </button>
      </div>
    </div>
  `;

  modalReceita.classList.remove("escondido");
}

function abrirFormularioNovaReceita() {
  receitaEditando = null;
  formReceita.reset();
  desenharCamposFormaReceita();

  document.querySelector("#modalFormulario h2").textContent = "Nova Receita";
  formReceita.querySelector('button[type="submit"]').textContent = "Salvar Receita";

  modalFormulario.classList.remove("escondido");
}

function abrirFormularioEdicao(id) {
  const receita = receitas.find(r => String(r.ID) === String(id));

  if (!receita) {
    alert("Receita não encontrada.");
    return;
  }

  receitaEditando = receita;

  document.getElementById("titulo").value = receita.Título || "";
  document.getElementById("categorias").value = receita.Categorias || "";
  document.getElementById("tempoMedio").value = receita["Tempo Medio"] || "";
  document.getElementById("rendimento").value = receita.Rendimento || "";
  preencherCamposFormaReceita(receita);
  document.getElementById("ingredientes").value = receita.Ingredientes || "";
  document.getElementById("modoPreparo").value = receita["Modo de Preparo"] || "";
  document.getElementById("foto").value = "";
  document.getElementById("origemAutor").value = receita["Origem/Autor"] || "";
  document.getElementById("favorita").value = receita.Favorita || "Não";
  document.getElementById("avaliacao").value = receita.Avaliação || "";
  document.getElementById("observacoes").value = receita.Observações || "";

  document.querySelector("#modalFormulario h2").textContent = "Editar Receita";
  formReceita.querySelector('button[type="submit"]').textContent = "Salvar Alterações";

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

function escaparHTML(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatarListaPDF(texto) {
  if (!texto) return "";

  return String(texto)
    .split(/\n+/)
    .map(linha => linha.trim())
    .filter(Boolean)
    .map(linha => `<p>• ${escaparHTML(linha)}</p>`)
    .join("");
}

function formatarPreparoPDF(texto) {
  if (!texto) return "";

  return String(texto)
    .split(/\n+/)
    .map(linha => linha.trim())
    .filter(Boolean)
    .map((linha, index) =>
      `<p><strong>${index + 1}.</strong> ${escaparHTML(linha)}</p>`
    )
    .join("");
}

async function baixarReceitaPDF(id) {
  const receita = receitas.find(r => String(r.ID) === String(id));

  if (!receita) {
    alert("Receita não encontrada.");
    return;
  }

  const nomeArquivo = String(receita.Título || "receita")
    .replace(/[\\/:*?"<>|]/g, "")
    .trim() || "receita";

  const folha = document.createElement("div");

  folha.style.width = "297mm";
  folha.style.height = "210mm";
  folha.style.background = "white";
  folha.style.position = "fixed";
  folha.style.left = "0";
  folha.style.top = "0";
  folha.style.zIndex = "-1";

  folha.innerHTML = `
    <div class="pdf-a4-receita">
      <div class="pdf-pagina pdf-pagina-dados">
        <div class="pdf-titulo-receita">${escaparHTML(receita.Título || "")}</div>

        <div class="pdf-tempo">${escaparHTML(receita["Tempo Medio"] || "—")}</div>

        <div class="pdf-rendimento">${escaparHTML(receita.Rendimento || "—")}</div>

        ${
          receita.Foto
            ? `<img class="pdf-foto" src="${receita.Foto}">`
            : `<div class="pdf-sem-foto">Sem foto</div>`
        }

        <div class="pdf-bloco-ingredientes">
          ${formatarListaPDF(receita.Ingredientes || "")}
        </div>
      </div>

      <div class="pdf-pagina pdf-pagina-preparo">
        <div class="pdf-bloco-preparo">
          ${formatarPreparoPDF(receita["Modo de Preparo"] || "")}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(folha);

  const canvas = await html2canvas(folha, {
    scale: 3,
    backgroundColor: "#ffffff",
    useCORS: true,
    allowTaint: true,
    scrollX: 0,
    scrollY: 0
  });

  const imgData = canvas.toDataURL("image/jpeg", 1);

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);
  pdf.save(`${nomeArquivo}.pdf`);

  folha.remove();
}


function pegarCampoReceita(receita, nomes) {
  for (const nome of nomes) {
    if (receita[nome] !== undefined && receita[nome] !== null && receita[nome] !== "") {
      return receita[nome];
    }
  }
  return "";
}

function numeroCampoReceita(receita, nomes) {
  const valor = pegarCampoReceita(receita, nomes);
  if (typeof valor === "number") return valor;
  const texto = String(valor || "").replace(",", ".");
  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : 0;
}

function obterFormaReceita(receita) {
  const tipo = String(pegarCampoReceita(receita, ["Tipo Forma", "TipoForma", "tipoForma", "Forma Tipo", "Forma"])).toLowerCase();

  if (!tipo) return null;

  const altura = numeroCampoReceita(receita, ["Forma Altura", "Altura Forma", "formaAltura", "Altura"]);

  if (tipo.includes("redonda")) {
    const diametro = numeroCampoReceita(receita, ["Forma Diametro", "Forma Diâmetro", "Diametro Forma", "Diâmetro Forma", "formaDiametro", "Diametro", "Diâmetro"]);
    if (!diametro || !altura) return null;
    return { tipo: "redonda", diametro, altura };
  }

  if (tipo.includes("retangular") || tipo.includes("quadrada")) {
    const comprimento = numeroCampoReceita(receita, ["Forma Comprimento", "Comprimento Forma", "formaComprimento", "Comprimento"]);
    const largura = numeroCampoReceita(receita, ["Forma Largura", "Largura Forma", "formaLargura", "Largura"]);
    if (!comprimento || !largura || !altura) return null;
    return { tipo: "retangular", comprimento, largura, altura };
  }

  return null;
}

function calcularVolumeFormaObjeto(forma) {
  if (!forma) return 0;

  if (forma.tipo === "redonda") {
    const raio = forma.diametro / 2;
    return Math.PI * raio * raio * forma.altura;
  }

  return forma.comprimento * forma.largura * forma.altura;
}

function descreverForma(forma) {
  if (!forma) return "Forma não cadastrada";

  if (forma.tipo === "redonda") {
    return `Redonda: ${formatarNumeroCalculadora(forma.diametro)} cm de diâmetro × ${formatarNumeroCalculadora(forma.altura)} cm de altura`;
  }

  return `Retangular/quadrada: ${formatarNumeroCalculadora(forma.comprimento)} × ${formatarNumeroCalculadora(forma.largura)} × ${formatarNumeroCalculadora(forma.altura)} cm`;
}

function gerarResumoFormaReceitaHTML(receita) {
  const forma = obterFormaReceita(receita);
  if (!forma) return "";

  return `<p><strong>Forma:</strong> ${escaparHTML(descreverForma(forma))}</p>`;
}

function desenharCamposFormaReceita() {
  const tipo = tipoFormaReceita.value;

  if (!tipo) {
    camposFormaReceita.classList.add("escondido");
    camposFormaReceita.innerHTML = "";
    return;
  }

  camposFormaReceita.classList.remove("escondido");

  if (tipo === "redonda") {
    camposFormaReceita.innerHTML = `
      <label>Diâmetro em cm<input type="number" id="formaDiametro" min="0" step="0.1" placeholder="Ex: 22"></label>
      <label>Altura em cm<input type="number" id="formaAltura" min="0" step="0.1" placeholder="Ex: 6"></label>
    `;
    return;
  }

  camposFormaReceita.innerHTML = `
    <label>Comprimento em cm<input type="number" id="formaComprimento" min="0" step="0.1" placeholder="Ex: 30"></label>
    <label>Largura em cm<input type="number" id="formaLargura" min="0" step="0.1" placeholder="Ex: 20"></label>
    <label>Altura em cm<input type="number" id="formaAltura" min="0" step="0.1" placeholder="Ex: 5"></label>
  `;
}

function preencherCamposFormaReceita(receita) {
  const forma = obterFormaReceita(receita);

  if (!forma) {
    tipoFormaReceita.value = "";
    desenharCamposFormaReceita();
    return;
  }

  tipoFormaReceita.value = forma.tipo;
  desenharCamposFormaReceita();

  if (forma.tipo === "redonda") {
    document.getElementById("formaDiametro").value = forma.diametro;
    document.getElementById("formaAltura").value = forma.altura;
    return;
  }

  document.getElementById("formaComprimento").value = forma.comprimento;
  document.getElementById("formaLargura").value = forma.largura;
  document.getElementById("formaAltura").value = forma.altura;
}

function abrirCalculadora() {
  preencherReceitasCalculadora();
  rendimentoNovoCalc.value = "";
  desenharCamposFormaNova();
  atualizarInfoCalculadora();
  modalCalculadora.classList.remove("escondido");
}

function preencherReceitasCalculadora() {
  const valorAtual = selectReceitaCalculadora.value;
  selectReceitaCalculadora.innerHTML = `<option value="">Selecione uma receita...</option>`;

  receitas
    .map((receita, index) => ({ receita, index }))
    .sort((a, b) => String(a.receita.Título || "").localeCompare(String(b.receita.Título || "")))
    .forEach(({ receita, index }) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = receita.Título || "Sem título";
      selectReceitaCalculadora.appendChild(option);
    });

  if (valorAtual && [...selectReceitaCalculadora.options].some(opcao => opcao.value === valorAtual)) {
    selectReceitaCalculadora.value = valorAtual;
  }
}

function obterReceitaCalculadoraSelecionada() {
  const index = Number(selectReceitaCalculadora.value);
  if (!Number.isInteger(index) || index < 0) return null;
  return receitas[index] || null;
}

function atualizarInfoCalculadora() {
  const receita = obterReceitaCalculadoraSelecionada();
  resultadoCalculadora.classList.add("escondido");
  resultadoCalculadora.innerHTML = "";

  if (!receita) {
    rendimentoOriginalInfo.innerHTML = `
      <span>Rendimento original</span>
      <strong>Selecione uma receita</strong>
    `;
    formaOriginalInfo.innerHTML = "Selecione uma receita para ver a forma cadastrada.";
    return;
  }

  rendimentoOriginalInfo.innerHTML = `
    <span>Rendimento original cadastrado</span>
    <strong>${escaparHTML(receita.Rendimento || "Não informado")}</strong>
  `;

  const forma = obterFormaReceita(receita);

  if (!forma) {
    formaOriginalInfo.innerHTML = `
      <strong>Essa receita ainda não tem forma cadastrada.</strong><br>
      Edite a receita e preencha a forma original para usar este cálculo.
    `;
    return;
  }

  formaOriginalInfo.innerHTML = `
    <strong>${escaparHTML(descreverForma(forma))}</strong><br>
    Volume: ${formatarNumeroCalculadora(calcularVolumeFormaObjeto(forma))} cm³
  `;
}

function trocarModoCalculadora(modo) {
  document.querySelectorAll(".calc-opcao").forEach(botao => {
    botao.classList.toggle("ativa", botao.dataset.modo === modo);
  });

  calcRendimento.classList.toggle("escondido", modo !== "rendimento");
  calcForma.classList.toggle("escondido", modo !== "forma");
  resultadoCalculadora.classList.add("escondido");
  resultadoCalculadora.innerHTML = "";
}

function extrairPrimeiroNumero(texto) {
  const match = String(texto || "").match(/\d+(?:[,.]\d+)?/);
  if (!match) return 0;
  return Number(match[0].replace(",", "."));
}

function formatarNumeroCalculadora(numero) {
  if (!Number.isFinite(numero)) return "";
  const arredondado = Math.round(numero * 100) / 100;
  if (Number.isInteger(arredondado)) return String(arredondado);
  return String(arredondado).replace(".", ",");
}

function normalizarFracaoCalculadora(valor) {
  const texto = String(valor || "").trim();
  const fracoes = {
    "½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25, "¾": 0.75,
    "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875
  };
  if (fracoes[texto]) return fracoes[texto];
  if (/^\d+\/\d+$/.test(texto)) {
    const [num, den] = texto.split("/").map(Number);
    return den ? num / den : NaN;
  }
  return Number(texto.replace(",", "."));
}

function ajustarLinhaIngrediente(linha, fator) {
  const texto = String(linha || "").trim();
  if (!texto) return null;

  const match = texto.match(/^(\d+(?:[,.]\d+)?|\d+\/\d+|[½⅓⅔¼¾⅛⅜⅝⅞])\s*([a-zA-ZçÇáàâãéèêíïóôõöúüÁÀÂÃÉÈÊÍÏÓÔÕÖÚÜ]+)?\s*(.*)$/);

  if (!match) {
    return { original: texto, ajustado: texto, observacao: "sem alteração automática" };
  }

  const quantidadeOriginal = normalizarFracaoCalculadora(match[1]);
  if (!Number.isFinite(quantidadeOriginal)) {
    return { original: texto, ajustado: texto, observacao: "sem alteração automática" };
  }

  const unidade = match[2] || "";
  const restante = match[3] || "";
  const quantidadeNova = quantidadeOriginal * fator;
  const unidadeNormalizada = unidade.toLowerCase();
  const unidadesInteiras = ["ovo", "ovos", "un", "unidade", "unidades"];

  if (unidadesInteiras.includes(unidadeNormalizada)) {
    const arredondado = Math.max(1, Math.round(quantidadeNova));
    return {
      original: texto,
      ajustado: `${arredondado} ${unidade} ${restante}`.trim(),
      observacao: `aprox. ${formatarNumeroCalculadora(quantidadeNova)}`
    };
  }

  return {
    original: texto,
    ajustado: `${formatarNumeroCalculadora(quantidadeNova)} ${unidade} ${restante}`.trim(),
    observacao: ""
  };
}

function gerarIngredientesAjustados(receita, fator) {
  const linhas = String(receita.Ingredientes || "")
    .split(/\n+/)
    .map(linha => linha.trim())
    .filter(Boolean);

  return linhas.map(linha => ajustarLinhaIngrediente(linha, fator)).filter(Boolean);
}

function mostrarResultadoAjuste({ receita, fator, resumo }) {
  const ingredientesAjustados = gerarIngredientesAjustados(receita, fator);

  resultadoCalculadora.innerHTML = `
    <h3>Resultado</h3>
    <p><strong>Receita:</strong> ${escaparHTML(receita.Título || "Sem título")}</p>
    ${resumo}
    <p><strong>Fator aplicado:</strong> ×${formatarNumeroCalculadora(fator)}</p>

    <div class="tabela-calculadora">
      <div class="linha-tabela cabecalho-tabela">
        <span>Original</span>
        <span>Ajustado</span>
      </div>

      ${ingredientesAjustados.map(item => `
        <div class="linha-tabela">
          <span>${escaparHTML(item.original)}</span>
          <span>
            ${escaparHTML(item.ajustado)}
            ${item.observacao ? `<small>${escaparHTML(item.observacao)}</small>` : ""}
          </span>
        </div>
      `).join("")}
    </div>
  `;

  resultadoCalculadora.classList.remove("escondido");
}

function calcularAjusteRendimento() {
  const receita = obterReceitaCalculadoraSelecionada();
  if (!receita) {
    alert("Escolha uma receita primeiro.");
    return;
  }

  const rendimentoOriginal = extrairPrimeiroNumero(receita.Rendimento);
  const rendimentoNovo = Number(rendimentoNovoCalc.value);

  if (!rendimentoOriginal) {
    alert("Essa receita não tem um número no rendimento cadastrado. Exemplo: 450 g ou 8 porções.");
    return;
  }

  if (!rendimentoNovo) {
    alert("Preencha o novo rendimento.");
    return;
  }

  const fator = rendimentoNovo / rendimentoOriginal;
  mostrarResultadoAjuste({
    receita,
    fator,
    resumo: `
      <p><strong>Rendimento original:</strong> ${escaparHTML(receita.Rendimento || "Não informado")}</p>
      <p><strong>Novo rendimento:</strong> ${formatarNumeroCalculadora(rendimentoNovo)}</p>
    `
  });
}

function desenharCamposFormaNova() {
  const tipo = tipoFormaNova.value;

  if (tipo === "redonda") {
    camposFormaNova.innerHTML = `
      <label>Diâmetro em cm<input type="number" id="diametro-nova" min="0" step="0.1" placeholder="Ex: 22"></label>
      <label>Altura em cm<input type="number" id="altura-nova" min="0" step="0.1" placeholder="Ex: 6"></label>
    `;
    return;
  }

  camposFormaNova.innerHTML = `
    <label>Comprimento em cm<input type="number" id="comprimento-nova" min="0" step="0.1" placeholder="Ex: 30"></label>
    <label>Largura em cm<input type="number" id="largura-nova" min="0" step="0.1" placeholder="Ex: 20"></label>
    <label>Altura em cm<input type="number" id="altura-nova" min="0" step="0.1" placeholder="Ex: 5"></label>
  `;
}

function obterValorInputForma(id) {
  const elemento = document.getElementById(id);
  return Number(elemento?.value || 0);
}

function obterFormaNovaDigitada() {
  const tipo = tipoFormaNova.value;

  if (tipo === "redonda") {
    const diametro = obterValorInputForma("diametro-nova");
    const altura = obterValorInputForma("altura-nova");
    if (!diametro || !altura) return null;
    return { tipo: "redonda", diametro, altura };
  }

  const comprimento = obterValorInputForma("comprimento-nova");
  const largura = obterValorInputForma("largura-nova");
  const altura = obterValorInputForma("altura-nova");
  if (!comprimento || !largura || !altura) return null;
  return { tipo: "retangular", comprimento, largura, altura };
}

function calcularAjusteForma() {
  const receita = obterReceitaCalculadoraSelecionada();
  if (!receita) {
    alert("Escolha uma receita primeiro.");
    return;
  }

  const formaOriginal = obterFormaReceita(receita);
  if (!formaOriginal) {
    alert("Essa receita ainda não tem forma cadastrada. Edite a receita e preencha a forma original.");
    return;
  }

  const formaNova = obterFormaNovaDigitada();
  if (!formaNova) {
    alert("Preencha todas as medidas da forma nova.");
    return;
  }

  const volumeOriginal = calcularVolumeFormaObjeto(formaOriginal);
  const volumeNovo = calcularVolumeFormaObjeto(formaNova);
  const fator = volumeNovo / volumeOriginal;

  mostrarResultadoAjuste({
    receita,
    fator,
    resumo: `
      <p><strong>Forma original:</strong> ${escaparHTML(descreverForma(formaOriginal))}</p>
      <p><strong>Forma nova:</strong> ${escaparHTML(descreverForma(formaNova))}</p>
      <p><strong>Volume original:</strong> ${formatarNumeroCalculadora(volumeOriginal)} cm³</p>
      <p><strong>Volume novo:</strong> ${formatarNumeroCalculadora(volumeNovo)} cm³</p>
    `
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

btnLerReceitaIA.addEventListener("click", async () => {
  try {
    const arquivos = Array.from(fotoReceitaIA.files);

    if (arquivos.length === 0) {
      alert("Escolha pelo menos uma foto da receita primeiro.");
      return;
    }

    btnLerReceitaIA.disabled = true;
    btnLerReceitaIA.textContent = "🧠 Lendo receita...";

    const imagensBase64 = await Promise.all(
      arquivos.map(arquivo => converterImagemParaBase64(arquivo))
    );

    const resposta = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "lerReceitaIA",
        imagens: imagensBase64
      })
    });

    const dados = await resposta.json();

    if (dados.status !== "ok") {
      throw new Error(dados.mensagem);
    }

    const receita = dados.receita;

    document.getElementById("titulo").value =
      receita.titulo || "";

    document.getElementById("categorias").value =
      receita.categorias || "";

    document.getElementById("tempoMedio").value =
      receita.tempoPreparo || "";

    document.getElementById("rendimento").value =
      receita.rendimento || "";

    document.getElementById("ingredientes").value =
      receita.ingredientes || "";

    document.getElementById("modoPreparo").value =
      receita.modoPreparo || "";

    document.getElementById("observacoes").value =
      receita.observacoes || "";

    alert("✨ Receita preenchida automaticamente!");

  } catch (erro) {
    console.error(erro);

    alert(
      "Erro ao ler receita com IA:\n\n" +
      erro.message
    );
  }

  btnLerReceitaIA.disabled = false;
  btnLerReceitaIA.textContent =
    "✨ Ler receita com IA";
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
    tipoForma: tipoFormaReceita.value,
    comprimento: document.getElementById("formaComprimento")?.value || "",
    largura: document.getElementById("formaLargura")?.value || "",
    diametro: document.getElementById("formaDiametro")?.value || "",
    alturaForma: document.getElementById("formaAltura")?.value || "",
    ingredientes: document.getElementById("ingredientes").value,
    modoPreparo: document.getElementById("modoPreparo").value,
    foto: fotoBase64,
    favorita: document.getElementById("favorita").value,
    origemAutor: document.getElementById("origemAutor").value,
    avaliacao: document.getElementById("avaliacao").value,
    observacoes: document.getElementById("observacoes").value
  };

  try {
    const botao =
      formReceita.querySelector('button[type="submit"]');
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

    const botao =
      formReceita.querySelector('button[type="submit"]');
    botao.disabled = false;
    botao.textContent = "Salvar Receita";
  }
});

tipoFormaReceita.addEventListener("change", desenharCamposFormaReceita);

btnCalculadora.addEventListener("click", abrirCalculadora);

fecharCalculadora.addEventListener("click", () => {
  modalCalculadora.classList.add("escondido");
});

modalCalculadora.addEventListener("click", (e) => {
  if (e.target === modalCalculadora) {
    modalCalculadora.classList.add("escondido");
  }
});

selectReceitaCalculadora.addEventListener("change", atualizarInfoCalculadora);
btnCalcularRendimento.addEventListener("click", calcularAjusteRendimento);
btnCalcularForma.addEventListener("click", calcularAjusteForma);
tipoFormaNova.addEventListener("change", desenharCamposFormaNova);

document.querySelectorAll(".calc-opcao").forEach(botao => {
  botao.addEventListener("click", () => trocarModoCalculadora(botao.dataset.modo));
});

desenharCamposFormaReceita();
desenharCamposFormaNova();

carregarReceitas();