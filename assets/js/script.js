document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("lista-imoveis");
    container.innerHTML = "";
    const modal = document.getElementById("modal");
    const carouselImages = document.getElementById("carousel-images");
    const closeBtn = document.querySelector(".close");

    // Função para abrir o modal com informações do imóvel
    function abrirModal(imovel) {
        carouselImages.innerHTML = "";

        imovel.imagem.forEach((imgSrc, imgIndex) => {
            const activeClass = imgIndex === 0 ? "active" : "";
            const carouselItem = `
                <div class="carousel-item ${activeClass}">
                    <img src="${imgSrc}" class="d-block w-100" alt="Imagem ${imgIndex + 1}">
                </div>
            `;
            carouselImages.innerHTML += carouselItem;
        });

        const modalDescriptionText = document.getElementById("modal-description-text");
        const modalLegendText = document.getElementById("modal-legend-text");
        modalDescriptionText.textContent = imovel.descricao;
        modalLegendText.innerHTML = imovel.legenda.replace(/\n/g, "<br>");

        const ctaButton = document.getElementById("cta-button");
        const whatsappMessage = `Olá, gostaria de mais informações sobre o imóvel: ${imovel.titulo}`;
        ctaButton.href = `https://wa.me/5581999999999?text=${encodeURIComponent(whatsappMessage)}`;

        modal.style.display = "flex";
        modal.querySelector(".modal-content").scrollTop = 0;
        document.body.classList.add('modal-open'); // Bloqueia a rolagem da página
    }

    // Buscar os dados dos imóveis
    fetch('imoveis/imoveis.json')
        .then(response => response.json())
        .then(data => {
            data.forEach((imovel) => {
                if (imovel.ativo) {
                    const div = document.createElement("div");
                    div.classList.add("card");
                    div.innerHTML = `
                        <img src="${imovel.imagem[0]}" alt="${imovel.titulo}" class="img-expandir" loading="lazy">
                        <h2>${imovel.titulo}</h2>
                        <p>${imovel.descricao}</p>
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

    // Bloquear botão direito sobre imagens
    document.addEventListener("contextmenu", (event) => {
        if (event.target.tagName === "IMG") {
            event.preventDefault();
        }
    });

    // Bloquear arrastar imagens
    document.addEventListener("dragstart", (event) => {
        if (event.target.tagName === "IMG") {
            event.preventDefault();
        }
    });

    // Bloquear atalhos para inspecionar elemento
    document.addEventListener("keydown", (event) => {
        if (
            event.key === "F12" ||
            (event.ctrlKey && event.shiftKey && event.key === "I") ||
            (event.ctrlKey && event.key === "U")
        ) {
            event.preventDefault();
        }
    });

    // Fechar menu mobile ao clicar em um link
    document.querySelectorAll('.navbar-nav .nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            const navbarCollapse = document.getElementById('navbarNav');
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
            if (bsCollapse) {
                bsCollapse.hide();
            }
        });
    });

    // Fechar o modal
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
        document.body.classList.remove('modal-open'); // Libera a rolagem da página
    });

    // Fechar o modal ao clicar fora dele
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
            document.body.classList.remove('modal-open'); // Libera a rolagem da página
        }
    });

    // Adiciona suporte a rolagem suave no mobile para a lista de sugestões
    const sugestoesLista = document.getElementById('sugestoes');

    sugestoesLista.addEventListener('touchstart', function (e) {
        e.stopPropagation();
    }, { passive: true });

    sugestoesLista.addEventListener('touchmove', function (e) {
        e.stopPropagation();
    }, { passive: false });

    // Fechar o modal
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });
});
