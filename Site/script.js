const momentos = [
  "Entrada",
  "Ato Penitencial",
  "Glória",
  "Refrão Orante",
  "Salmo",
  "Aclamação",
  "Ofertório",
  "Santo",
  "Cordeiro",
  "Comunhão",
  "Pós Comunhão",
  "Final"
];

const notas = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

const musicas = [
  {
    titulo: "Senhor, Quem Entrará",
    momento: "Entrada",
    tom: "D",
    cifra: `D        A
Senhor, quem entrará
Bm       G
No santuário pra te louvar`
  },
  {
    titulo: "Glória a Deus nas Alturas",
    momento: "Glória",
    tom: "G",
    cifra: `G        D
Glória a Deus nas alturas
Em       C
E paz na terra aos homens`
  },
  {
    titulo: "Santo",
    momento: "Santo",
    tom: "D",
    cifra: `D        A
Santo, Santo, Santo
Bm       G
Senhor Deus do universo`
  },
  {
    titulo: "Cordeiro de Deus",
    momento: "Cordeiro",
    tom: "C",
    cifra: `C        G
Cordeiro de Deus
Am       F
Que tirais o pecado do mundo`
  },
  {
    titulo: "Pão da Vida",
    momento: "Comunhão",
    tom: "G",
    cifra: `G        D
Eu sou o pão da vida
Em       C
O que vem a mim não terá fome`
  }
];

function carregarMomentos() {
  const lista = document.getElementById("listaMomentos");

  momentos.forEach((momento, index) => {
    const musicasDoMomento = musicas.filter(
      musica => musica.momento === momento
    );

    const div = document.createElement("div");
    div.className = "momento";

    div.innerHTML = `
      <label>${index + 1}. ${momento}</label>

      <div class="linha-musica">

        <div class="campo-musica">
          <select id="momento-${index}" onchange="atualizarTomOriginal(${index})">
            <option value="">Selecione uma música</option>

            ${musicasDoMomento.map(musica => `
              <option
                value="${musica.titulo}"
                data-tom="${musica.tom}">
                ${musica.titulo}
              </option>
            `).join("")}

          </select>
        </div>

        <div class="controle-tom">
          <button
            type="button"
            class="btn-tom"
            onclick="alterarTom(${index}, -1)">
            −
          </button>

          <span
            class="tom-atual"
            id="tom-${index}">
            -
          </span>

          <button
            type="button"
            class="btn-tom"
            onclick="alterarTom(${index}, 1)">
            +
          </button>
        </div>

      </div>
    `;

    lista.appendChild(div);
  });
}

const tonsSelecionados = {};

function atualizarTomOriginal(index) {

  const select = document.getElementById(`momento-${index}`);
  const option = select.options[select.selectedIndex];

  const tomOriginal = option.getAttribute("data-tom");

  if (tomOriginal) {
    tonsSelecionados[index] = tomOriginal;
    document.getElementById(`tom-${index}`).innerText = tomOriginal;
  } else {
    tonsSelecionados[index] = null;
    document.getElementById(`tom-${index}`).innerText = "-";
  }
}

function alterarTom(index, direcao) {

  let tomAtual = tonsSelecionados[index];

  if (!tomAtual) return;

  let posicao = notas.indexOf(tomAtual);

  posicao += direcao;

  if (posicao < 0) {
    posicao = notas.length - 1;
  }

  if (posicao >= notas.length) {
    posicao = 0;
  }

  tonsSelecionados[index] = notas[posicao];

  document.getElementById(`tom-${index}`).innerText =
    notas[posicao];
}

function transporNota(nota, diferenca) {
  const indice = notas.indexOf(nota);

  if (indice === -1) {
    return nota;
  }

  const novoIndice = (indice + diferenca + 12) % 12;
  return notas[novoIndice];
}

function transporAcorde(acorde, diferenca) {
  return acorde.replace(/[A-G](#|b)?/g, nota => {
    return transporNota(nota, diferenca);
  });
}

function transporCifra(cifra, tomOrigem, tomDestino) {
  if (!tomDestino || tomOrigem === tomDestino) {
    return cifra;
  }

  const origem = notas.indexOf(tomOrigem);
  const destino = notas.indexOf(tomDestino);

  if (origem === -1 || destino === -1) {
    return cifra;
  }

  const diferenca = destino - origem;

  return cifra.replace(
    /\b[A-G](#|b)?(m|maj|maj7|m7|7|9|11|13|sus|sus4|dim|aug|°)?(\/[A-G](#|b)?)?\b/g,
    acorde => transporAcorde(acorde, diferenca)
  );
}

function montarRepertorio() {
  const data = document.getElementById("dataMissa").value;
  const celebracao = document.getElementById("celebracao").value;
  const resultado = document.getElementById("resultado");

  let html = `
    <p><strong>Data:</strong> ${data || "Não informada"}</p>
    <p><strong>Celebração:</strong> ${celebracao || "Não informada"}</p>
  `;

  momentos.forEach((momento, index) => {
    const tituloSelecionado = document.getElementById(`momento-${index}`).value;
    const novoTom = tonsSelecionados[index];
    
    if (tituloSelecionado) {
      const musica = musicas.find(m => m.titulo === tituloSelecionado);
      const tomFinal = novoTom ? novoTom : musica.tom;
      const cifraFinal = transporCifra(musica.cifra, musica.tom, tomFinal);

      html += `
        <div class="musica-final">
          <h3>${momento}</h3>
          <p><strong>${musica.titulo}</strong> - Tom ${tomFinal}</p>
          <pre>${cifraFinal}</pre>
        </div>
      `;
    }
  });

  resultado.innerHTML = html;
  document.getElementById("resultadoCard").style.display = "block";
}

function copiarRepertorio() {
  const texto = document.getElementById("resultado").innerText;

  navigator.clipboard.writeText(texto).then(() => {
    alert("Repertório copiado!");
  });
}

carregarMomentos();