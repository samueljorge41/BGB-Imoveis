let bairrosDisponiveis = [];

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("lista-imoveis");
    const modal = document.getElementById("modal");
    const carouselImages = document.getElementById("carousel-images");
    const closeBtn = document.querySelector(".close");

    // Função para abrir o modal com informações do imóvel
    window.abrirModal = function(imovel) {
        const carouselIndicators = document.querySelector(".carousel-indicators");
        carouselImages.innerHTML = "";
        carouselIndicators.innerHTML = "";

        imovel.imagem.forEach((imgSrc, imgIndex) => {
            const activeClass = imgIndex === 0 ? "active" : "";

            // Adiciona a imagem ao carrossel
            const carouselItem = `
                <div class="carousel-item ${activeClass}">
                    <img src="${imgSrc}" class="d-block w-100" alt="Imagem ${imgIndex + 1}">
                </div>
            `;
            carouselImages.innerHTML += carouselItem;

            // Adiciona a bolinha ao indicador
            const indicator = `
                <li data-bs-target="#carouselExample" data-bs-slide-to="${imgIndex}" class="${activeClass}"></li>
            `;
            carouselIndicators.innerHTML += indicator;
        });

        document.getElementById("modal-description-text").textContent = imovel.descricao;
        document.getElementById("modal-legend-text").innerHTML = imovel.legenda.replace(/\n/g, "<br>");
        document.getElementById("cta-button").href = `https://wa.me/5538998705327?text=${encodeURIComponent(`Olá, gostaria de mais informações sobre o imóvel:\n\n*${imovel.titulo}*\n\n> (Código: ${imovel.id})`)}`;

        modal.style.display = "flex";
        modal.querySelector(".modal-content").scrollTop = 0;
        document.body.classList.add('modal-open');
    };

    // Carregar imóveis na página
    fetch('imoveis/imoveis.json')
        .then(response => response.json())
        .then(data => {
            // Preenche tipos de imóvel
            const tipos = [...new Set(data.map(imovel => imovel.tipo?.toLowerCase()).filter(Boolean))];
            const selectTipo = document.getElementById('tipo-imovel');
            if (selectTipo) {
                tipos.forEach(tipo => {
                    const option = document.createElement('option');
                    option.value = tipo;
                    option.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
                    selectTipo.appendChild(option);
                });
            }

            // Preenche bairros
            bairrosDisponiveis = [...new Set(data.map(imovel => imovel.bairro))];

            // Preenche imóveis ativos na listagem inicial
            container.innerHTML = "";
            data.forEach(imovel => {
                if (imovel.ativo) {
                    const div = document.createElement("div");
                    div.classList.add("card");
                    div.innerHTML = `
                        <img src="${imovel.imagem[0]}" alt="${imovel.titulo}" class="img-expandir">
                        <h2 style="font-weight: bold;">${imovel.titulo}</h2>
                        <p>${imovel.descricao}</p>
                        <p class="ref-id">Ref.: ${imovel.id}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <p style="margin: 0;">${imovel.preco}</p>
                            <button class="btn-detalhes">Mais detalhes</button>
                        </div>
                    `;

                    container.appendChild(div);

                    // Clicar em qualquer parte do card abre o modal
                    div.addEventListener("click", () => {
                        abrirModal(imovel);
                    });

                    // Remover eventos específicos de clique em imagem ou botão
                    div.querySelector(".img-expandir").style.pointerEvents = "none";
                    div.querySelector(".btn-detalhes").style.pointerEvents = "none";
                }
            });
        })
        .catch(error => console.error("Erro ao carregar imóveis:", error));

    // Sugestões de localização
    function mostrarSugestoes(exibirTodas = false) {
        const input = document.getElementById('localizacao');
        const sugestoesDiv = document.getElementById('sugestoes');
        const filtro = input.value.toLowerCase();

        const sugestoesFiltradas = exibirTodas || !filtro
            ? bairrosDisponiveis
            : bairrosDisponiveis.filter(bairro => bairro.toLowerCase().includes(filtro));

        sugestoesDiv.innerHTML = '';

        if (sugestoesFiltradas.length > 0) {
            sugestoesFiltradas.forEach(bairro => {
                const div = document.createElement('div');
                div.textContent = bairro;
                div.onclick = () => {
                    input.value = bairro;
                    sugestoesDiv.style.display = 'none';
                };
                sugestoesDiv.appendChild(div);
            });
            sugestoesDiv.style.display = 'block';
        } else {
            sugestoesDiv.style.display = 'none';
        }
    }
    window.mostrarSugestoes = mostrarSugestoes;

    // Filtro de imóveis
    window.filtrarImoveis = function() {
        const tipo = document.getElementById('tipo-imovel').value.toLowerCase();
        const precoMaximo = parseInt(document.getElementById('preco-maximo').value.replace(/\D/g, ''));
        const localizacao = document.getElementById('localizacao').value.toLowerCase();

        fetch('imoveis/imoveis.json')
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById("lista-imoveis");
                const titulo = document.getElementById("titulo-imoveis");
                container.innerHTML = "";
                if (titulo) container.appendChild(titulo);

                const filtrados = data.filter(imovel => {
                    if (!imovel.ativo) return false;

                    const tipoOK = !tipo || imovel.tipo?.toLowerCase() === tipo;
                    const precoOK = !precoMaximo || parseFloat(imovel.preco.replace(/\D/g, '')) <= precoMaximo;
                    const localizacaoOK = !localizacao ||
                        imovel.localizacao?.toLowerCase().includes(localizacao) ||
                        imovel.bairro?.toLowerCase().includes(localizacao) ||
                        imovel.id === localizacao;

                    return tipoOK && precoOK && localizacaoOK;
                });

                filtrados.sort((a, b) => parseInt(b.preco.replace(/\D/g, '')) - parseInt(a.preco.replace(/\D/g, '')));

                if (filtrados.length === 0) {
                    container.innerHTML += "<p>Nenhum imóvel encontrado com os filtros selecionados.</p>";
                    return;
                }

                filtrados.forEach(imovel => {
                    const div = document.createElement("div");
                    div.classList.add("card");
                    div.innerHTML = `
                        <img src="${imovel.imagem[0]}" alt="${imovel.titulo}" class="img-expandir">
                        <h2 style="font-weight: bold;">${imovel.titulo}</h2>
                        <p>${imovel.descricao}</p>
                        <p class="ref-id">Ref.: ${imovel.id}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <p style="margin: 0;">${imovel.preco}</p>
                            <button class="btn-detalhes">Mais detalhes</button>
                        </div>
                    `;
                    container.appendChild(div);

                    // Clicar em qualquer parte do card abre o modal
                    div.addEventListener("click", () => {
                        abrirModal(imovel);
                    });

                    // Remover eventos específicos de clique em imagem ou botão
                    div.querySelector(".img-expandir").style.pointerEvents = "none";
                    div.querySelector(".btn-detalhes").style.pointerEvents = "none";
                });

                document.getElementById("secao-imoveis").scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => console.error("Erro ao filtrar imóveis:", error));
    };

    // Interações com sugestões
    document.addEventListener('click', (event) => {
        const sugestoesDiv = document.getElementById('sugestoes');
        const input = document.getElementById('localizacao');
        if (!sugestoesDiv.contains(event.target) && event.target !== input) {
            sugestoesDiv.style.display = 'none';
        }
    });

    document.getElementById('sugestoes').addEventListener('touchstart', (event) => {
        event.stopPropagation();
    });
    document.getElementById('sugestoes').addEventListener('touchmove', (event) => {
        event.stopPropagation();
    });

    // Fechar modal
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
        document.body.classList.remove('modal-open');
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
            document.body.classList.remove('modal-open');
        }
    });

    // Bloquear botão direito e arrastar imagem
    document.addEventListener("contextmenu", (e) => {
        if (e.target.tagName === "IMG") e.preventDefault();
    });
    document.addEventListener("dragstart", (e) => {
        if (e.target.tagName === "IMG") e.preventDefault();
    });

    // Bloquear atalhos de inspeção
    document.addEventListener("keydown", (e) => {
        if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I") || (e.ctrlKey && e.key === "U")) {
            e.preventDefault();
        }
    });

    // Fechar menu mobile ao clicar em links
    document.querySelectorAll('.navbar-nav .nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            const navbarCollapse = document.getElementById('navbarNav');
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
            if (bsCollapse) bsCollapse.hide();
        });
    });
});
