document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '1';

    // Detectar dispositivo móvil para optimizaciones específicas
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

    // Calcular altura del header pegajoso y aplicar como variable CSS
    const calculateHeaderHeight = () => {
        const stickyHeader = document.querySelector('.sticky');
        if (stickyHeader) {
            const headerHeight = stickyHeader.offsetHeight;
            document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        }
    };
    
    // Calcular altura inicial usando requestAnimationFrame para optimizar rendimiento
    requestAnimationFrame(calculateHeaderHeight);
    
    // Resize optimizado - solo recalcular cuando sea necesario
    let resizeTimeout;
    const debouncedResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(calculateHeaderHeight, 150);
    };
    
    window.addEventListener('resize', debouncedResize, { passive: true });

    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const allPopupTriggers = document.querySelectorAll('.open-chat-popup');
    const chatPopup = document.getElementById('chat-popup');
    const closePopupBtn = document.getElementById('close-popup');

    const openPopup = () => { if (chatPopup) { chatPopup.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none'); } };
    const closePopup = () => { if (chatPopup) { chatPopup.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none'); } };
    const closeMenu = () => { if (mobileMenu) { mobileMenu.classList.add('opacity-0', 'scale-95', 'invisible'); } };
    const openMenu = () => { closePopup(); if (mobileMenu) { mobileMenu.classList.remove('opacity-0', 'scale-95', 'invisible'); } };

    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isMenuOpen = !mobileMenu.classList.contains('invisible');
            if (isMenuOpen) { closeMenu(); } else { openMenu(); }
        });
    }

    if (allPopupTriggers.length > 0) {
        allPopupTriggers.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const isPopupOpen = chatPopup && !chatPopup.classList.contains('opacity-0');
                
                if (button.id === 'cta-flotante' && isPopupOpen) {
                    closePopup();
                } else {
                    if (mobileMenu && !mobileMenu.classList.contains('invisible')) { closeMenu(); }
                    openPopup();
                    attachAutoCloseListeners();
                }
            });
        });
    }

    if (closePopupBtn) { 
        closePopupBtn.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            closePopup(); 
        }); 
    }

    document.addEventListener('click', (e) => {
        if (mobileMenu && !mobileMenu.classList.contains('invisible') && !mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) { closeMenu(); }
        if (chatPopup && !chatPopup.classList.contains('opacity-0') && !chatPopup.contains(e.target) && !e.target.closest('.open-chat-popup')) { closePopup(); }
    });

    // Cierre auto del pop-up solo en dispositivos no táctiles (mantener dinámica móvil)
    const isTouchDevice = () => (
        'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
    );
    const interactionCloseHandler = () => {
        if (chatPopup && !chatPopup.classList.contains('opacity-0')) {
            closePopup();
        }
        window.removeEventListener('scroll', interactionCloseHandler, { passive: true });
        document.removeEventListener('pointerdown', interactionCloseHandler, true);
        document.removeEventListener('keydown', interactionCloseHandler, true);
    };
    const attachAutoCloseListeners = () => {
        // En todos los dispositivos, cerrar al hacer scroll
        window.addEventListener('scroll', interactionCloseHandler, { passive: true });
        // En no táctiles, también cerrar por clic/tecla
        if (!isTouchDevice()) {
            document.addEventListener('pointerdown', interactionCloseHandler, true);
            document.addEventListener('keydown', interactionCloseHandler, true);
        }
    };

    // Smooth scroll simplificado y optimizado
    const handleSmoothScroll = (targetId, e) => {
        const path = window.location.pathname;
        const isIndexPage = path.endsWith('/') || path.endsWith('index.html');
        
        // Cerrar menú móvil si está abierto
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && !mobileMenu.classList.contains('invisible')) {
            mobileMenu.classList.add('opacity-0', 'scale-95', 'invisible');
        }

        if (!targetId || targetId.length <= 1) return;

        const target = document.querySelector(targetId);
        if (!target) {
            if (!isIndexPage) {
                e.preventDefault();
                window.location.href = 'index.html' + targetId;
            }
            return;
        }

        e.preventDefault();
        
        // Scroll simplificado - una sola llamada
        const headerHeight = document.querySelector('.sticky')?.offsetHeight || 0;
        const offsetPosition = Math.max(0, target.offsetTop - headerHeight);
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    };

    // Event listeners optimizados
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            handleSmoothScroll(targetId, e);
        });
    });

    // Enlaces a index.html simplificados
    document.querySelectorAll('a[href^="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const path = window.location.pathname;
            const isIndexPage = path.endsWith('/') || path.endsWith('index.html');
            
            if (!isIndexPage) {
                e.preventDefault();
                // Cerrar menú móvil
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('invisible')) {
                    mobileMenu.classList.add('opacity-0', 'scale-95', 'invisible');
                }
                window.location.href = this.getAttribute('href');
            }
        });
    });

    const mobileServicesToggle = document.getElementById('mobile-services-toggle');
    if (mobileServicesToggle) {
        mobileServicesToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const submenu = document.getElementById('mobile-services-submenu');
            const icon = mobileServicesToggle.querySelector('svg');
            const isActive = submenu.style.maxHeight && submenu.style.maxHeight !== '0px';
            submenu.style.maxHeight = isActive ? '0px' : submenu.scrollHeight + 'px';
            if (icon) icon.style.transform = isActive ? '' : 'rotate(180deg)';
        });
    }

    const rotatingPhrases = ["¿Esa mancha de vino no quiere salir?", "¿Te estás cambiando de casa?, se vería linda con todo limpio.", "¿Harás una fiesta en tu casa?", "No me digas... ¿la fiesta ya fue?", "¿Vienen los suegros de visita?", "¿Tus alergias no te dejan en paz?", "¿Te pidieron cuidar al perrihijo de un amigo?", "¿Le sacaste los pañales a tu pequeño?"];
    let currentPhraseIndex = 0;
    const phraseContainer = document.getElementById('rotating-text-container');

    if (phraseContainer) {
        const showNextPhrase = () => {
            const currentElement = phraseContainer.querySelector('span');
            if (currentElement) { currentElement.classList.add('slide-out'); }
            setTimeout(() => {
                if (currentElement) { phraseContainer.innerHTML = ''; }
                currentPhraseIndex = (currentPhraseIndex + 1) % rotatingPhrases.length;
                const newElement = document.createElement('span');
                newElement.textContent = `“ ${rotatingPhrases[currentPhraseIndex]} ”`;
                newElement.className = 'text-white text-base md:text-lg font-semibold absolute slide-in';
                phraseContainer.appendChild(newElement);
            }, 500);
        };
        const initialElement = document.createElement('span');
        initialElement.textContent = `“ ${rotatingPhrases[0]} ”`;
        initialElement.className = 'text-white text-base md:text-lg font-semibold absolute slide-in';
        phraseContainer.appendChild(initialElement);
        setInterval(showNextPhrase, 4000);
    }

    // Nota: El script de index.html tiene dos funciones extra (FAQ y YouTube)
    // Para simplificar, las incluiremos en el main.js para todas las páginas.
    // No afecta el rendimiento ya que solo se ejecutan si encuentran los elementos.

    const faqToggles = document.querySelectorAll('.accordion-toggle');
    faqToggles.forEach(button => {
        button.addEventListener('click', () => {
            const accordionContent = button.nextElementSibling;
            const icon = button.querySelector('svg');
            const isActive = accordionContent.style.maxHeight && accordionContent.style.maxHeight !== '0px';

            // En móviles: cerrar cualquier otra abierta
            const isMobileView = window.innerWidth <= 767;
            if (isMobileView && !isActive) {
                document.querySelectorAll('.accordion-content').forEach(content => {
                    if (content !== accordionContent && content.style.maxHeight && content.style.maxHeight !== '0px') {
                        content.style.maxHeight = '0px';
                        const parentButton = content.previousElementSibling;
                        const parentIcon = parentButton ? parentButton.querySelector('svg') : null;
                        if (parentIcon) parentIcon.style.transform = '';
                    }
                });
            }

            accordionContent.style.maxHeight = isActive ? '0px' : accordionContent.scrollHeight + 'px';
            if (icon) { icon.style.transform = isActive ? '' : 'rotate(180deg)'; }
        });
    });

    function initYouTubeFacades() {
        const facades = document.querySelectorAll('.youtube-fachada');
        facades.forEach(facade => {
            facade.addEventListener('click', (e) => {
                const videoId = facade.dataset.videoid;
                if (!videoId) return;
                
                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                iframe.frameBorder = '0';
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;
                iframe.title = 'Reproductor de video de YouTube';
                
                facade.innerHTML = '';
                facade.appendChild(iframe);
                facade.classList.add('video-loaded');
            }, { once: true });
        });
    }
    initYouTubeFacades();

    // Manejo de hash simplificado
    const handleHashScroll = () => {
        const path = window.location.pathname;
        const isIndexPage = path.endsWith('/') || path.endsWith('index.html');
        
        if (isIndexPage && window.location.hash) {
            const target = document.querySelector(window.location.hash);
            if (target) {
                const headerHeight = document.querySelector('.sticky')?.offsetHeight || 0;
                const offsetPosition = Math.max(0, target.offsetTop - headerHeight);
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    };

    // Scroll inicial con hash
    if (window.location.hash) {
        setTimeout(handleHashScroll, 100);
    }

    // Cambios de hash
    window.addEventListener('hashchange', handleHashScroll);
});
