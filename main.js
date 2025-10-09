document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '1';

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
    
    // Debounce para resize para reducir trabajo del hilo principal
    let resizeTimeout;
    const debouncedResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            requestAnimationFrame(calculateHeaderHeight);
        }, 100);
    };
    
    window.addEventListener('resize', debouncedResize);

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
                if (button.id === 'cta-flotante') {
                    if (isPopupOpen) { closePopup(); }
                    else {
                        if (mobileMenu && !mobileMenu.classList.contains('invisible')) { closeMenu(); }
                        openPopup();
                        attachAutoCloseListeners();
                    }
                } else {
                    if (mobileMenu && !mobileMenu.classList.contains('invisible')) { closeMenu(); }
                    openPopup();
                    attachAutoCloseListeners();
                }
            });
        });
    }

    if (closePopupBtn) { closePopupBtn.addEventListener('click', (e) => { e.stopPropagation(); closePopup(); }); }

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

    // Enlaces internos: clics simples, el navegador maneja el smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const path = window.location.pathname;
            const isIndexPage = path.endsWith('/') || path.endsWith('index.html');
            const targetId = this.getAttribute('href');

            // Cierra el menú móvil si está abierto, sin importar la página
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && !mobileMenu.classList.contains('invisible')) {
                mobileMenu.classList.add('opacity-0', 'scale-95', 'invisible');
            }

            if (targetId && targetId.length > 1) {
                if (isIndexPage) {
                    // En index.html: dejar que el navegador maneje el scroll suave
                    // El CSS con scroll-margin-top se encarga del offset
                    const target = document.querySelector(targetId);
                    if (target) {
                        e.preventDefault();
                        // Función para verificar que la página esté completamente cargada
                        const waitForPageLoad = (callback, maxAttempts = 10) => {
                            let attempts = 0;
                            const checkLoad = () => {
                                attempts++;
                                // Verificar que el documento esté completamente cargado
                                if (document.readyState === 'complete' && 
                                    document.querySelector('.sticky')?.offsetHeight > 0 &&
                                    target.offsetTop > 0) {
                                    callback();
                                } else if (attempts < maxAttempts) {
                                    setTimeout(checkLoad, 50);
                                } else {
                                    // Fallback si no se puede verificar completamente
                                    callback();
                                }
                            };
                            checkLoad();
                        };

                        // Esperar a que la página esté completamente cargada
                        waitForPageLoad(() => {
                            // Función optimizada de scroll usando requestAnimationFrame
                            const smoothScrollTo = (targetPosition) => {
                                requestAnimationFrame(() => {
                                    window.scrollTo({
                                        top: Math.max(0, targetPosition),
                                        behavior: 'smooth'
                                    });
                                });
                            };
                            
                            // Forzar el scroll con el offset correcto
                            const headerHeight = document.querySelector('.sticky')?.offsetHeight || 0;
                            const offsetPosition = target.offsetTop - headerHeight;
                            smoothScrollTo(offsetPosition);
                            
                            // Scroll adicional para corregir el problema de la primera carga
                            setTimeout(() => {
                                smoothScrollTo(offsetPosition);
                            }, 300);
                            
                            // Scroll final sutil para asegurar posición correcta
                            setTimeout(() => {
                                const currentScroll = window.pageYOffset;
                                const targetScroll = Math.max(0, offsetPosition);
                                // Solo hacer scroll si hay una diferencia significativa
                                if (Math.abs(currentScroll - targetScroll) > 50) {
                                    smoothScrollTo(targetScroll);
                                }
                            }, 300);
                        });
                    }
                } else {
                    // En subpáginas: manejar enlaces locales o redirigir a index
                    const target = document.querySelector(targetId);
                    if (target) {
                        // Si el elemento existe en la página actual, hacer scroll local
                        e.preventDefault();
                        const headerHeight = document.querySelector('.sticky')?.offsetHeight || 0;
                        const offsetPosition = target.offsetTop - headerHeight;
                        window.scrollTo({
                            top: Math.max(0, offsetPosition),
                            behavior: 'smooth'
                        });
                    } else {
                        // Si el elemento no existe, redirigir a index.html
                        e.preventDefault();
                        window.location.href = 'index.html' + targetId;
                    }
                }
            }
        });
    });

    // Enlaces a index.html con secciones específicas (solo en páginas de servicio)
    document.querySelectorAll('a[href^="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const path = window.location.pathname;
            const isIndexPage = path.endsWith('/') || path.endsWith('index.html');
            
            // Solo manejar en páginas de servicio, no en index.html
            if (!isIndexPage) {
                e.preventDefault();
                const href = this.getAttribute('href');
                const targetId = href.split('#')[1]; // Extraer la parte después de #
                
                
                // Cerrar menú móvil si está abierto
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('invisible')) {
                    mobileMenu.classList.add('opacity-0', 'scale-95', 'invisible');
                }
                
                // Cargar index.html con el hash para que el navegador maneje el scroll
                window.location.href = href;
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

            // En móviles: cerrar cualquier otra abierta antes de abrir la nueva
            const shouldEnforceSingleOpen = window.matchMedia('(max-width: 767px)').matches;
            if (shouldEnforceSingleOpen && !isActive) {
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
            facade.addEventListener('click', () => {
                const videoId = facade.dataset.videoid;
                if (!videoId) return;
                const iframe = document.createElement('iframe');
                iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                iframe.setAttribute('allowfullscreen', '');
                iframe.setAttribute('title', 'Reproductor de video de YouTube');
                facade.innerHTML = '';
                facade.appendChild(iframe);
                facade.classList.add('video-loaded');
            }, { once: true });
        });
    }
    initYouTubeFacades();

    // Manejar hash en la URL al cargar index.html (para navegación desde páginas de servicio)
    const path = window.location.pathname;
    const isIndexPage = path.endsWith('/') || path.endsWith('index.html');
    
    if (isIndexPage && window.location.hash) {
        // Función para hacer scroll a la sección
        const scrollToSection = () => {
            const targetId = window.location.hash;
            const target = document.querySelector(targetId);
            if (target) {
                const headerHeight = document.querySelector('.sticky')?.offsetHeight || 0;
                const offsetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: Math.max(0, offsetPosition),
                    behavior: 'smooth'
                });
                return true;
            }
            return false;
        };

        // Múltiples intentos para asegurar que funcione en móviles
        const attemptScroll = (attempts = 0) => {
            if (attempts < 5) {
                setTimeout(() => {
                    if (!scrollToSection()) {
                        attemptScroll(attempts + 1);
                    }
                }, 200 + (attempts * 100)); // Delay progresivo: 200ms, 300ms, 400ms, etc.
            }
        };

        // Iniciar los intentos de scroll
        attemptScroll();
    }

    // Manejador adicional para cambios de hash (útil en móviles)
    window.addEventListener('hashchange', function() {
        const path = window.location.pathname;
        const isIndexPage = path.endsWith('/') || path.endsWith('index.html');
        
        if (isIndexPage && window.location.hash) {
            setTimeout(() => {
                const targetId = window.location.hash;
                const target = document.querySelector(targetId);
                if (target) {
                    const headerHeight = document.querySelector('.sticky')?.offsetHeight || 0;
                    const offsetPosition = target.offsetTop - headerHeight;
                    window.scrollTo({
                        top: Math.max(0, offsetPosition),
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    });
});
