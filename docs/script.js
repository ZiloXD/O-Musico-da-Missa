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

const tonsSelecionados = {};

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
              <option value="${musica.titulo}" data-tom="${musica.tom}">
                ${musica.titulo}
              </option>
            `).join("")}
          </select>
        </div>

        <div class="controle-tom">
          <button type="button" class="btn-tom" onclick="alterarTom(${index}, -1)">−</button>
          <span class="tom-atual" id="tom-${index}">-</span>
          <button type="button" class="btn-tom" onclick="alterarTom(${index}, 1)">+</button>
        </div>
      </div>
    `;

    lista.appendChild(div);
  });
}

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

  if (posicao < 0) posicao = notas.length - 1;
  if (posicao >= notas.length) posicao = 0;

  tonsSelecionados[index] = notas[posicao];
  document.getElementById(`tom-${index}`).innerText = notas[posicao];
}

function transporNota(nota, diferenca) {
  const indice = notas.indexOf(nota);

  if (indice === -1) return nota;

  const novoIndice = (indice + diferenca + 12) % 12;
  return notas[novoIndice];
}

function transporAcorde(acorde, diferenca) {
  const partes = acorde.match(/^([A-G](?:#|b)?)(.*?)(?:\/([A-G](?:#|b)?))?$/);

  if (!partes) return acorde;

  const notaPrincipal = partes[1];
  const complemento = partes[2] || "";
  const notaBaixo = partes[3];

  const novaNotaPrincipal = transporNota(notaPrincipal, diferenca);

  if (notaBaixo) {
    const novaNotaBaixo = transporNota(notaBaixo, diferenca);
    return `${novaNotaPrincipal}${complemento}/${novaNotaBaixo}`;
  }

  return `${novaNotaPrincipal}${complemento}`;
}

function ehAcorde(token) {
  return /^[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add|º|°)?(?:\d+)?(?:M|m)?(?:\(\d+\))?(?:\/[A-G](?:#|b)?)?$/.test(token);
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
    /(^|[\s(])([A-G](?:#|b)?[^\s]*)/g,
    (match, antes, possivelAcorde) => {
      if (ehAcorde(possivelAcorde)) {
        return antes + transporAcorde(possivelAcorde, diferenca);
      }

      return match;
    }
  );
}

function destacarAcordes(texto) {
  return texto.replace(
    /(^|[\s(])([A-G](?:#|b)?[^\s]*)/g,
    (match, antes, possivelAcorde) => {
      if (ehAcorde(possivelAcorde)) {
        return `${antes}<span class="acorde">${possivelAcorde}</span>`;
      }

      return match;
    }
  );
}

function dividirCifraEmPaginas(cifra, linhasPorPagina = 64) {
  const linhas = cifra.split("\n");
  const paginas = [];

  for (let i = 0; i < linhas.length; i += linhasPorPagina) {
    paginas.push(linhas.slice(i, i + linhasPorPagina).join("\n"));
  }

  return paginas;
}

function montarRepertorio() {
  const data = document.getElementById("dataMissa").value;
  const celebracao = document.getElementById("celebracao").value;
  const resultado = document.getElementById("resultado");

  let html = `
  <section class="capa-repertorio">
    <div>
      <h1>Repertório da Missa</h1>
      <h2>${celebracao || "Celebração não informada"}</h2>
      <p>${data || "Data não informada"}</p>
    </div>
  </section>
`;

  momentos.forEach((momento, index) => {
    const tituloSelecionado = document.getElementById(`momento-${index}`).value;
    const novoTom = tonsSelecionados[index];

    if (tituloSelecionado) {
      const musica = musicas.find(m => m.titulo === tituloSelecionado);
      const tomFinal = novoTom ? novoTom : musica.tom;
      const cifraFinal = transporCifra(musica.cifra, musica.tom, tomFinal);
      const cifraFormatada = destacarAcordes(cifraFinal);

      const paginasDaCifra = dividirCifraEmPaginas(cifraFinal, 64);

     paginasDaCifra.forEach((parteDaCifra, paginaIndex) => {
      const cifraFormatada = destacarAcordes(parteDaCifra);
     const tituloMomento = paginaIndex === 0 ? momento : `${momento} - continuação`;

  html += `
    <section class="pagina-musica">
      <h3>${tituloMomento}</h3>
      <p><strong>${musica.titulo}</strong> - Tom ${tomFinal}</p>

      <div class="cifra-duas-colunas">
        <pre>${cifraFormatada}</pre>
      </div>
    </section>
  `;
});
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