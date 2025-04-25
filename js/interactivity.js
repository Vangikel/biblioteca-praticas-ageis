// Funcionalidades interativas para a Biblioteca de Práticas Ágeis

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todas as funcionalidades
    initAnimations();
    initTooltips();
    initSearch();
    initFavorites();
    initDiagramZoom();
    initDarkMode();
    initReadingProgress();
    initTabs();
    initAccordion();
    initNotifications();
    initFilters();
    initShareButtons();
});

// Animações de entrada
function initAnimations() {
    const cards = document.querySelectorAll('.practice-card, .property-card');
    
    // Adicionar classe para animação com pequeno delay para cada card
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });
    
    // Animar seções ao entrar na viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('slide-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.section-title, .diagram, .case-study').forEach(section => {
        observer.observe(section);
    });
}

// Tooltips
function initTooltips() {
    // Os tooltips são gerenciados via CSS com atributo data-tooltip
    // Esta função adiciona tooltips dinamicamente a elementos que precisam
    document.querySelectorAll('.btn, .floating-action').forEach(element => {
        if (!element.getAttribute('data-tooltip') && element.getAttribute('title')) {
            element.setAttribute('data-tooltip', element.getAttribute('title'));
            element.removeAttribute('title');
        }
    });
}

// Busca
function initSearch() {
    const searchInput = document.querySelector('.search-bar input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        // Buscar em cards de práticas
        document.querySelectorAll('.practice-card').forEach(card => {
            const title = card.querySelector('.practice-card-header').textContent.toLowerCase();
            const content = card.querySelector('.practice-card-body').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || content.includes(searchTerm)) {
                card.style.display = '';
                // Destacar o termo buscado
                highlightSearchTerm(card, searchTerm);
            } else {
                card.style.display = 'none';
            }
        });
        
        // Atualizar contadores e mensagens de resultado
        updateSearchResults(searchTerm);
    });
    
    // Botão de limpar busca
    const searchButton = document.querySelector('.search-bar button');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            searchInput.value = '';
            // Disparar evento de input para limpar resultados
            searchInput.dispatchEvent(new Event('input'));
        });
    }
}

// Função auxiliar para destacar termos de busca
function highlightSearchTerm(element, term) {
    if (!term) return;
    
    // Restaurar conteúdo original antes de destacar novamente
    if (element.originalContent) {
        element.innerHTML = element.originalContent;
    } else {
        element.originalContent = element.innerHTML;
    }
    
    // Não destacar se o termo for muito curto
    if (term.length < 3) return;
    
    const regex = new RegExp(`(${term})`, 'gi');
    element.querySelectorAll('p, li, h3, h4').forEach(textElement => {
        const originalText = textElement.innerHTML;
        textElement.innerHTML = originalText.replace(regex, '<mark>$1</mark>');
    });
}

// Atualizar resultados de busca
function updateSearchResults(term) {
    const visibleCards = document.querySelectorAll('.practice-card[style=""]').length;
    const resultsContainer = document.querySelector('.search-results');
    
    if (!resultsContainer) return;
    
    if (term) {
        resultsContainer.textContent = `${visibleCards} resultado(s) encontrado(s) para "${term}"`;
        resultsContainer.style.display = 'block';
    } else {
        resultsContainer.style.display = 'none';
    }
}

// Sistema de favoritos
function initFavorites() {
    // Carregar favoritos do localStorage
    let favorites = JSON.parse(localStorage.getItem('agile-library-favorites')) || [];
    
    // Adicionar botões de favorito a todos os cards
    document.querySelectorAll('.practice-card').forEach(card => {
        const cardId = card.getAttribute('data-id');
        if (!cardId) return;
        
        const cardHeader = card.querySelector('.practice-card-header');
        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'favorite-button';
        favoriteBtn.innerHTML = '★';
        favoriteBtn.setAttribute('data-tooltip', 'Adicionar aos favoritos');
        
        // Verificar se já é favorito
        if (favorites.includes(cardId)) {
            favoriteBtn.classList.add('active');
            favoriteBtn.setAttribute('data-tooltip', 'Remover dos favoritos');
        }
        
        favoriteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (favorites.includes(cardId)) {
                // Remover dos favoritos
                favorites = favorites.filter(id => id !== cardId);
                favoriteBtn.classList.remove('active');
                favoriteBtn.setAttribute('data-tooltip', 'Adicionar aos favoritos');
                showNotification('Prática removida dos favoritos');
            } else {
                // Adicionar aos favoritos
                favorites.push(cardId);
                favoriteBtn.classList.add('active');
                favoriteBtn.setAttribute('data-tooltip', 'Remover dos favoritos');
                showNotification('Prática adicionada aos favoritos');
            }
            
            // Salvar no localStorage
            localStorage.setItem('agile-library-favorites', JSON.stringify(favorites));
            
            // Atualizar contador de favoritos
            updateFavoritesCounter();
        });
        
        cardHeader.appendChild(favoriteBtn);
    });
    
    // Adicionar botão de favoritos ao menu
    const favoritesCounter = document.createElement('span');
    favoritesCounter.className = 'favorites-counter';
    favoritesCounter.textContent = favorites.length;
    
    const favoritesLink = document.querySelector('.sidebar-menu a[href="favoritos.html"]');
    if (favoritesLink) {
        favoritesLink.appendChild(favoritesCounter);
    }
    
    // Função para atualizar contador
    function updateFavoritesCounter() {
        const counter = document.querySelector('.favorites-counter');
        if (counter) {
            counter.textContent = favorites.length;
        }
    }
}

// Zoom em diagramas
function initDiagramZoom() {
    document.querySelectorAll('.diagram-image').forEach(diagram => {
        diagram.addEventListener('click', function() {
            // Criar modal para zoom
            const modal = document.createElement('div');
            modal.className = 'diagram-modal';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'diagram-modal-content';
            
            // Clonar a imagem para o modal
            const img = this.querySelector('img, svg').cloneNode(true);
            modalContent.appendChild(img);
            
            // Adicionar título se existir
            const diagramTitle = this.closest('.diagram').querySelector('h3');
            if (diagramTitle) {
                const title = document.createElement('div');
                title.className = 'diagram-modal-title';
                title.textContent = diagramTitle.textContent;
                modalContent.appendChild(title);
            }
            
            // Botão de fechar
            const closeBtn = document.createElement('button');
            closeBtn.className = 'diagram-modal-close';
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.appendChild(closeBtn);
            modal.appendChild(modalContent);
            
            // Fechar ao clicar fora da imagem
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
            
            document.body.appendChild(modal);
            
            // Animar entrada
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
        });
    });
}

// Modo escuro
function initDarkMode() {
    // Verificar preferência salva
    const darkModeEnabled = localStorage.getItem('dark-mode') === 'true';
    
    // Aplicar modo escuro se estiver ativado
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    }
    
    // Criar botão de alternar modo
    const darkModeToggle = document.createElement('button');
    darkModeToggle.className = 'floating-action dark-mode-toggle';
    darkModeToggle.innerHTML = darkModeEnabled ? '☀️' : '🌙';
    darkModeToggle.setAttribute('data-tooltip', darkModeEnabled ? 'Modo claro' : 'Modo escuro');
    
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        // Atualizar ícone e tooltip
        this.innerHTML = isDarkMode ? '☀️' : '🌙';
        this.setAttribute('data-tooltip', isDarkMode ? 'Modo claro' : 'Modo escuro');
        
        // Salvar preferência
        localStorage.setItem('dark-mode', isDarkMode);
        
        // Mostrar notificação
        showNotification(isDarkMode ? 'Modo escuro ativado' : 'Modo claro ativado');
    });
    
    // Adicionar à página
    const floatingActions = document.querySelector('.floating-actions');
    if (floatingActions) {
        floatingActions.appendChild(darkModeToggle);
    } else {
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'floating-actions';
        actionsContainer.appendChild(darkModeToggle);
        document.body.appendChild(actionsContainer);
    }
}

// Indicador de progresso de leitura
function initReadingProgress() {
    // Criar elementos para o indicador
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);
    
    // Atualizar progresso ao rolar
    window.addEventListener('scroll', function() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.scrollY;
        
        const progress = (scrollTop / documentHeight) * 100;
        progressBar.style.width = progress + '%';
    });
}

// Inicializar tabs
function initTabs() {
    document.querySelectorAll('.tabs-container').forEach(tabContainer => {
        const tabItems = tabContainer.querySelectorAll('.tab-item');
        const tabPanels = tabContainer.querySelectorAll('.tab-panel');
        
        tabItems.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Remover classe ativa de todas as tabs
                tabItems.forEach(item => item.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                // Adicionar classe ativa à tab clicada e painel correspondente
                this.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
    });
}

// Inicializar accordion
function initAccordion() {
    document.querySelectorAll('.accordion-item').forEach(item => {
        const header = item.querySelector('.accordion-header');
        
        header.addEventListener('click', function() {
            // Toggle classe ativa
            item.classList.toggle('active');
            
            // Fechar outros itens se necessário
            if (item.classList.contains('active') && item.closest('.accordion-single')) {
                item.closest('.accordion-single').querySelectorAll('.accordion-item').forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
            }
        });
    });
}

// Sistema de notificações
function showNotification(message, title = 'Notificação', type = 'info') {
    // Criar container de notificações se não existir
    let notificationCenter = document.querySelector('.notification-center');
    if (!notificationCenter) {
        notificationCenter = document.createElement('div');
        notificationCenter.className = 'notification-center';
        document.body.appendChild(notificationCenter);
    }
    
    // Criar notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Ícone baseado no tipo
    let icon = '📢';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Adicionar ao container
    notificationCenter.appendChild(notification);
    
    // Botão de fechar
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notificationCenter.removeChild(notification);
    });
    
    // Remover automaticamente após 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notificationCenter.removeChild(notification);
        }
    }, 3000);
}

// Inicializar filtros
function initFilters() {
    document.querySelectorAll('.filter-option').forEach(filter => {
        filter.addEventListener('click', function() {
            const category = this.getAttribute('data-filter');
            const isActive = this.classList.contains('active');
            
            // Toggle classe ativa
            this.classList.toggle('active');
            
            // Filtrar cards
            document.querySelectorAll('.practice-card').forEach(card => {
                const cardCategories = card.getAttribute('data-categories');
                
                if (!cardCategories) return;
                
                if (category === 'all') {
                    card.style.display = '';
                } else if (isActive) {
                    // Remover filtro
                    card.style.display = '';
                } else {
                    // Aplicar filtro
                    if (cardCategories.includes(category)) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
}

// Botões de compartilhamento
function initShareButtons() {
    document.querySelectorAll('.share-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const platform = this.getAttribute('data-platform');
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            
            let shareUrl = '';
            
            switch (platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
                    break;
                case 'email':
                    shareUrl = `mailto:?subject=${title}&body=${url}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
    
    // Botão de compartilhar na barra flutuante
    const shareBtn = document.createElement('button');
    shareBtn.className = 'floating-action share-toggle';
    shareBtn.innerHTML = '📤';
    shareBtn.setAttribute('data-tooltip', 'Compartilhar');
    
    shareBtn.addEventListener('click', function() {
        // Verificar se o navegador suporta a API de compartilhamento
        if (navigator.share) {
            navigator.share({
                title: document.title,
                url: window.location.href
            })
            .catch(error => console.log('Erro ao compartilhar:', error));
        } else {
            // Alternativa para navegadores que não suportam a API
            const shareMenu = document.querySelector('.share-menu');
            if (shareMenu) {
                shareMenu.classList.toggle('active');
            } else {
                showNotification('Compartilhe copiando o link da página', 'Compartilhar', 'info');
                
                // Copiar URL para a área de transferência
                const tempInput = document.createElement('input');
                tempInput.value = window.location.href;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                showNotification('Link copiado para a área de transferência', 'Sucesso', 'success');
            }
        }
    });
    
    // Adicionar à barra flutuante
    const floatingActions = document.querySelector('.floating-actions');
    if (floatingActions) {
        floatingActions.appendChild(shareBtn);
    }
}

// Histórico de navegação
function trackPageView() {
    // Obter histórico atual
    let history = JSON.parse(localStorage.getItem('agile-library-history')) || [];
    
    // Adicionar página atual
    const currentPage = {
        title: document.title,
        url: window.location.pathname,
        timestamp: new Date().toISOString()
    };
    
    // Verificar se já existe esta página no histórico
    const existingIndex = history.findIndex(page => page.url === currentPage.url);
    if (existingIndex !== -1) {
        // Remover entrada anterior
        history.splice(existingIndex, 1);
    }
    
    // Adicionar ao início do array
    history.unshift(currentPage);
    
    // Limitar a 20 entradas
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    // Salvar histórico atualizado
    localStorage.setItem('agile-library-history', JSON.stringify(history));
}

// Executar ao carregar a página
trackPageView();

// Feedback
function initFeedback() {
    // Criar botão de feedback
    const feedbackBtn = document.createElement('button');
    feedbackBtn.className = 'floating-action feedback-button';
    feedbackBtn.innerHTML = '💬';
    feedbackBtn.setAttribute('data-tooltip', 'Enviar feedback');
    
    feedbackBtn.addEventListener('click', function() {
        // Criar modal de feedback
        const modal = document.createElement('div');
        modal.className = 'feedback-modal';
        
        modal.innerHTML = `
            <div class="feedback-modal-content">
                <h3>Enviar Feedback</h3>
                <p>Ajude-nos a melhorar a Biblioteca de Práticas Ágeis</p>
                <form id="feedback-form">
                    <div class="form-group">
                        <label for="feedback-type">Tipo de feedback</label>
                        <select id="feedback-type" required>
                            <option value="">Selecione...</option>
                            <option value="suggestion">Sugestão</option>
                            <option value="bug">Problema técnico</option>
                            <option value="content">Conteúdo</option>
                            <option value="other">Outro</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="feedback-message">Mensagem</label>
                        <textarea id="feedback-message" rows="5" required></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel">Cancelar</button>
                        <button type="submit" class="btn">Enviar</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animar entrada
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Fechar modal
        modal.querySelector('.btn-cancel').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
        
        // Enviar feedback
        modal.querySelector('#feedback-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const type = this.querySelector('#feedback-type').value;
            const message = this.querySelector('#feedback-message').value;
            
            // Aqui você pode implementar o envio do feedback para um servidor
            // Por enquanto, apenas simularemos o envio
            
            showNotification('Feedback enviado com sucesso! Obrigado pela sua contribuição.', 'Sucesso', 'success');
            
            // Fechar modal
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
            
            // Registrar feedback no localStorage para demonstração
            const feedbacks = JSON.parse(localStorage.getItem('agile-library-feedbacks')) || [];
            feedbacks.push({
                type,
                message,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('agile-library-feedbacks', JSON.stringify(feedbacks));
        });
    });
    
    // Adicionar à barra flutuante
    const floatingActions = document.querySelector('.floating-actions');
    if (floatingActions) {
        floatingActions.appendChild(feedbackBtn);
    } else {
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'floating-actions';
        actionsContainer.appendChild(feedbackBtn);
        document.body.appendChild(actionsContainer);
    }
}

// Inicializar feedback
initFeedback();
