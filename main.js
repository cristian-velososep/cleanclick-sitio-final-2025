document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '1';

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
                    }
                } else {
                    if (mobileMenu && !mobileMenu.classList.contains('invisible')) { closeMenu(); }
                    openPopup();
                }
            });
        });
    }

    if (closePopupBtn) { closePopupBtn.addEventListener('click', (e) => { e.stopPropagation(); closePopup(); }); }

    document.addEventListener('click', (e) => {
        if (mobileMenu && !mobileMenu.classList.contains('invisible') && !mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) { closeMenu(); }
        if (chatPopup && !chatPopup.classList.contains('opacity-0') && !chatPopup.contains(e.target) && !e.target.closest('.open-chat-popup')) { closePopup(); }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href').length > 1) {
                const targetId = this.getAttribute('href');
                // For service pages, we redirect to index.html with the hash
                window.location.href = 'index.html' + targetId;
            }
            if (mobileMenu && !mobileMenu.classList.contains('invisible')) { closeMenu(); }
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
    setTimeout(() => {
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
    }, 2500); // <-- Retrasamos la ejecución 2.5 segundos
    // Nota: El script de index.html tiene dos funciones extra (FAQ y YouTube)
    // Para simplificar, las incluiremos en el main.js para todas las páginas.
    // No afecta el rendimiento ya que solo se ejecutan si encuentran los elementos.

    const faqToggles = document.querySelectorAll('.accordion-toggle');
    faqToggles.forEach(button => {
        button.addEventListener('click', () => {
            const accordionContent = button.nextElementSibling;
            const icon = button.querySelector('svg');
            const isActive = accordionContent.style.maxHeight && accordionContent.style.maxHeight !== '0px';
            accordionContent.style.maxHeight = isActive ? '0px' : accordionContent.scrollHeight + 'px';
            if (icon) { icon.style.transform = isActive ? '' : 'rotate(180deg)'; }
        });
    });

    function initYouTubeFacades() {
        const facades = document.querySelectorAll('.youtube-fachada');
        facades.forEach(facade => {
            facade.addEventListener('click', () => {
                const videoId = facade.dataset.videoid;
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
});
