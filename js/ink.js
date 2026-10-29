/* =====================================================================
   SECCIÓN 2 · Tinta en capas con parallax (GSAP + ScrollTrigger)
   Cada capa es un PNG transparente con una parte distinta de la ilustración.
   y/x = recorrido (px) durante el scroll; signo negativo = dirección contraria.
   idle = flotación ambiental (px) y su duración (s).
   ===================================================================== */
function initInk() {
  gsap.registerPlugin(ScrollTrigger);

  const INTENSITY = 2.15; // recorrido amplio para que el parallax se note claramente

  const LAYERS = {
    //        recorrido vertical/horizontal · flotación continua · entrada gradual
    a:     { y:  18, x:   0, idle: 0,  dur: 0,  fade: false },
    b:     { y:  72, x: -24, idle: 8,  dur: 7,  fade: false },
    c:     { y: -95, x:  30, idle: 12, dur: 8,  fade: false },
    d:     { y: 180, x: -74, idle: 22, dur: 6,  fade: true  },
    e1:    { y:-260, x: 110, idle: 30, dur: 5,  fade: true  },
    e2:    { y: 340, x:-145, idle: 38, dur: 4.5,fade: true  },
    echo1: { y:-390, x: 175, idle: 42, dur: 4.2,fade: true, baseX: -48 },
    echo2: { y: 440, x:-205, idle: 48, dur: 3.8,fade: true, baseX: 55 },
    echo3: { y:-310, x: 225, idle: 36, dur: 4.8,fade: true, baseX: 105 },
  };

  const root = document.getElementById('ink');
  if (!root) return () => {};
  const mm = gsap.matchMedia();
  let cleanupProjects = () => {};

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.utils.toArray('.next__heading, .tools__heading').forEach((heading) => {
      gsap.fromTo(heading,
        { autoAlpha: 0, y: 34, filter: 'blur(5px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', ease: 'none',
          scrollTrigger: {
            trigger: heading,
            start: 'top 88%', end: 'top 54%',
            scrub: 0.55, invalidateOnRefresh: true
          }
        }
      );
    });
    gsap.fromTo('.next__dates',
      { autoAlpha: 0, y: 110 },
      { autoAlpha: 1, y: 0, ease: 'none',
        scrollTrigger: { trigger: root, start: 'bottom 85%', end: 'bottom 30%', scrub: 0.6 } });

    const cards = gsap.utils.toArray('.next__card');
    if (cards.length) {
      gsap.set(cards, { autoAlpha: 0, x: 100, y: 70, rotation: 5 });
      gsap.fromTo(cards[0],
        { autoAlpha: 0, x: 100, y: 70, rotation: 5 },
        { autoAlpha: 1, x: 0, y: 0, rotation: -2, ease: 'none',
          scrollTrigger: { trigger: root, start: 'bottom 85%', end: 'bottom 30%', scrub: 0.6 } });

      const deck = gsap.timeline({
        scrollTrigger: {
          trigger: '.next__dates', start: 'top 15%', end: () => `+=${window.innerHeight * (cards.length - 1)}`,
          pin: true, scrub: 0.6, invalidateOnRefresh: true
        }
      });

      cards.slice(1).forEach((card, index) => {
        deck.to(card, {
          autoAlpha: 1, x: 0, y: 0, rotation: index === 0 ? 1 : -1,
          duration: 1, ease: 'none'
        });
      });
    }

    const paperPlane = document.querySelector('.paper-plane');
    const cardsSection = document.querySelector('.next__dates');
    const toolsSection = document.querySelector('.tools');
    if (paperPlane && cardsSection && toolsSection) {
      const flight = gsap.timeline({
        scrollTrigger: {
          trigger: cardsSection, start: 'top bottom',
          endTrigger: toolsSection, end: 'bottom top',
          scrub: 0.7, invalidateOnRefresh: true
        }
      });
      const planeSize = () => paperPlane.getBoundingClientRect();
      const loopRadius = () => Math.min(68, Math.max(32, window.innerWidth * 0.055));
      const loopCenterX = () => window.innerWidth * 0.52;
      const loopCenterY = () => window.innerHeight * 0.49;
      const loopPoint = (angle) => {
        const size = planeSize();
        const radius = loopRadius();
        return {
          x: loopCenterX() + Math.cos(angle) * radius - size.width / 2,
          y: loopCenterY() + Math.sin(angle) * radius - size.height / 2
        };
      };
      const entry = () => loopPoint(-Math.PI / 2);
      const loopFlight = { progress: 0 };

      flight.fromTo(paperPlane, {
        x: () => -planeSize().width - 24,
        y: () => window.innerHeight + 70,
        rotation: -25, autoAlpha: 0
      }, {
        x: () => entry().x,
        y: () => entry().y,
        rotation: 20, autoAlpha: 1, duration: 0.42, ease: 'none'
      }, 0).to(loopFlight, {
        progress: 1, duration: 0.24, ease: 'none',
        onUpdate: () => {
          const angle = -Math.PI / 2 + loopFlight.progress * Math.PI * 2;
          const point = loopPoint(angle);
          gsap.set(paperPlane, {
            x: point.x, y: point.y,
            rotation: 20 + loopFlight.progress * 360
          });
        }
      }, 0.42).to(paperPlane, {
        x: () => window.innerWidth + 90,
        y: () => -planeSize().height - 30,
        rotation: '-=40', autoAlpha: 0, duration: 0.34, ease: 'none'
      }, 0.66);
    }
    const returnPlane = document.querySelector('.paper-plane--return');
    const runway = document.querySelector('.flight-runway');
    if (returnPlane && runway) {
      const returnSize = () => returnPlane.getBoundingClientRect();
      const radius = () => Math.min(68, Math.max(32, window.innerWidth * 0.055));
      const centerX = () => window.innerWidth * 0.48;
      const centerY = () => window.innerHeight * 0.51;
      const circlePoint = (angle) => {
        const size = returnSize();
        return {
          x: centerX() + Math.cos(angle) * radius() - size.width / 2,
          y: centerY() + Math.sin(angle) * radius() - size.height / 2
        };
      };
      const returnEntry = () => circlePoint(-Math.PI / 2);
      const returnLoop = { progress: 0 };
      const returnFlight = gsap.timeline({
        scrollTrigger: {
          trigger: runway, start: 'top bottom', end: () => '+=' + Math.round(window.innerHeight * 1.5),
          scrub: 0.7, invalidateOnRefresh: true
        }
      });
      returnFlight.fromTo(returnPlane, {
        x: () => window.innerWidth + 30,
        y: () => -returnSize().height - 70,
        rotation: 155, autoAlpha: 0
      }, {
        x: () => returnEntry().x,
        y: () => returnEntry().y,
        rotation: 200, autoAlpha: 1, duration: 0.42, ease: 'none'
      }, 0).to(returnLoop, {
        progress: 1, duration: 0.24, ease: 'none',
        onUpdate: () => {
          const angle = -Math.PI / 2 - returnLoop.progress * Math.PI * 2;
          const point = circlePoint(angle);
          gsap.set(returnPlane, {
            x: point.x, y: point.y,
            rotation: 200 - returnLoop.progress * 360
          });
        }
      }, 0.42).to(returnPlane, {
        x: () => -returnSize().width - 90,
        y: () => window.innerHeight + 80,
        rotation: '-=50', autoAlpha: 0, duration: 0.34, ease: 'none'
      }, 0.66);
    }
    const projectsCarousel = document.querySelector('.projects__carousel');
    const projectCards = projectsCarousel ? Array.from(projectsCarousel.querySelectorAll('[data-project-card]')) : [];
    const projectSelector = projectsCarousel?.querySelector('.projects__selector');
    const projectCounter = projectsCarousel?.querySelector('.projects__counter');
    let activeProject = 0;
    const detailTitle = projectsCarousel?.querySelector('.projects__detail-title');
    const detailDescription = projectsCarousel?.querySelector('.projects__detail-description');
    const detailImage = projectsCarousel?.querySelector('.projects__detail-image');
    const detailPanel = projectsCarousel?.querySelector('.projects__detail');
    let projectRotation;
    const pauseProjectRotation = () => window.clearInterval(projectRotation);
    const startProjectRotation = () => {
      pauseProjectRotation();
      if (projectCards.length > 1) projectRotation = window.setInterval(() => {
        moveProjectCards();
      }, 1250);
    };
    const moveProjectCards = () => {
      if (!projectSelector || projectSelector.children.length < 2) return;
      const cardsInOrder = Array.from(projectSelector.children);
      const firstCard = cardsInOrder[0];
      const step = cardsInOrder[1].offsetLeft - firstCard.offsetLeft;
      cardsInOrder.forEach((card) => card.classList.add('is-reordering'));
      gsap.to(cardsInOrder, {
        x: -step, duration: 1.1, ease: 'power2.inOut',
        onComplete: () => {
          projectSelector.append(firstCard);
          gsap.set(cardsInOrder, { clearProps: 'transform' });
          cardsInOrder.forEach((card) => card.classList.remove('is-reordering'));
        }
      });
    };
    const replaySelectionMotion = (element, className) => {
      if (!element) return;
      element.classList.remove(className);
      void element.offsetWidth;
      element.classList.add(className);
      element.addEventListener('animationend', (event) => {
        if (event.target === element) element.classList.remove(className);
      }, { once: true });
    };
    const selectProject = (index, animateCard = true) => {
      if (!projectCards.length) return;
      activeProject = (index + projectCards.length) % projectCards.length;
      const card = projectCards[activeProject];
      projectCards.forEach((item, cardIndex) => {
        const selected = cardIndex === activeProject;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      if (detailTitle) detailTitle.textContent = card.dataset.title || card.querySelector('.project-card__label')?.textContent || '';
      if (detailDescription) {
        const descriptionTemplate = card.dataset.descriptionTemplate
          ? document.getElementById(card.dataset.descriptionTemplate)
          : null;
        if (descriptionTemplate) detailDescription.replaceChildren(descriptionTemplate.content.cloneNode(true));
        else detailDescription.textContent = card.dataset.description || '';
      }
      if (detailImage) {
        if (card.dataset.detailVideo) {
          detailImage.classList.add('has-full-art');
          detailImage.classList.add('has-video-art');
          detailImage.classList.toggle('has-raised-video', card.dataset.detailRaise === 'true');
          detailImage.classList.toggle('has-wide-art', card.dataset.detailWide === 'true');
          const fullVideo = document.createElement('video');
          fullVideo.src = card.dataset.detailVideo;
          fullVideo.autoplay = true;
          fullVideo.muted = true;
          fullVideo.loop = true;
          fullVideo.playsInline = true;
          fullVideo.preload = 'metadata';
          fullVideo.className = 'projects__full-video';
          fullVideo.setAttribute('aria-label', `${card.dataset.title || 'Proyecto seleccionado'} — video`);
          fullVideo.play().catch(() => {});
          detailImage.replaceChildren(fullVideo);
        } else if (card.dataset.detailImage) {
          detailImage.classList.add('has-full-art');
          detailImage.classList.remove('has-video-art');
          detailImage.classList.remove('has-raised-video');
          detailImage.classList.toggle('has-wide-art', card.dataset.detailWide === 'true');
          const fullImage = document.createElement('img');
          fullImage.src = card.dataset.detailImage;
          fullImage.alt = `${card.dataset.title || 'Proyecto seleccionado'} — imagen completa`;
          fullImage.className = 'projects__full-art';
          fullImage.draggable = false;
          detailImage.replaceChildren(fullImage);
        } else {
          detailImage.classList.remove('has-full-art', 'has-wide-art', 'has-video-art', 'has-raised-video');
          const cardImage = card.querySelector('.project-card__image');
          if (cardImage) detailImage.replaceChildren(...Array.from(cardImage.childNodes, (node) => node.cloneNode(true)));
        }
      }
      const projectIndex = String(activeProject + 1).padStart(2, '0');
      const indexLabel = projectsCarousel.querySelector('.projects__detail-copy .project__index');
      if (indexLabel) indexLabel.textContent = `PROYECTO ${projectIndex}`;
      if (projectCounter) projectCounter.textContent = `${projectIndex} / ${String(projectCards.length).padStart(2, '0')}`;
      if (animateCard) replaySelectionMotion(card, 'is-selecting');
      replaySelectionMotion(detailPanel, 'is-changing');
    };
    const previousProject = projectsCarousel?.querySelector('.projects__arrow--prev');
    const nextProject = projectsCarousel?.querySelector('.projects__arrow--next');
    const handlePreviousProject = () => selectProject(activeProject - 1);
    const handleNextProject = () => selectProject(activeProject + 1);
    previousProject?.addEventListener('click', handlePreviousProject);
    nextProject?.addEventListener('click', handleNextProject);
    const handleProjectCard = (event) => {
      const card = event.target.closest('[data-project-card]');
      if (card) selectProject(projectCards.indexOf(card));
    };
    const handleProjectDescriptionToggle = (event) => {
      const button = event.target.closest('.project-description-toggle');
      if (!button || !detailDescription?.contains(button)) return;
      const extra = detailDescription.querySelector('.project-description-extra');
      if (!extra) return;
      const expanded = button.getAttribute('aria-expanded') === 'true';
      extra.hidden = expanded;
      button.setAttribute('aria-expanded', String(!expanded));
      button.textContent = expanded ? 'Leer más' : 'Leer menos';
    };
    projectsCarousel?.addEventListener('click', handleProjectCard);
    detailDescription?.addEventListener('click', handleProjectDescriptionToggle);
    cleanupProjects = () => {
      pauseProjectRotation();
      previousProject?.removeEventListener('click', handlePreviousProject);
      nextProject?.removeEventListener('click', handleNextProject);
      projectsCarousel?.removeEventListener('click', handleProjectCard);
      detailDescription?.removeEventListener('click', handleProjectDescriptionToggle);
    };
    selectProject(0);
    startProjectRotation();
    if (toolsSection) {
      const toolIcons = gsap.utils.toArray('.tools__item img');
      const columns = window.innerWidth <= 700 ? 4 : 5;
      toolIcons.forEach((icon, index) => {
        const row = Math.floor(index / columns);
        const rowStart = row * columns;
        const rowLength = Math.min(columns, toolIcons.length - rowStart);
        const column = index - rowStart + (columns - rowLength) / 2;
        const direction = Math.sign(column - (columns - 1) / 2);
        const distance = window.innerWidth <= 700 ? 24 : 40;
        gsap.fromTo(icon,
          { x: direction * distance, y: row === 0 ? -105 : 105, scale: 0.45, rotation: direction * 30, autoAlpha: 0.08 },
          { x: 0, y: 0, scale: 1, rotation: 0, autoAlpha: 1, ease: 'none',
            scrollTrigger: {
              trigger: icon, start: 'top 92%', end: 'top 58%',
              scrub: 0.45, invalidateOnRefresh: true
            }
          }
        );
      });
    }
    gsap.utils.toArray('.tools__meter i').forEach((bar) => {
      gsap.fromTo(bar, { scaleX: 0, transformOrigin: 'left center' }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: {
          trigger: bar, start: 'top 92%', end: 'clamp(top 56%)', scrub: 0.35, invalidateOnRefresh: true
        }
      });
    });
    const phrase = root.querySelector('.ink__phrase');
    if (phrase) {
      const text = phrase.textContent;
      phrase.setAttribute('aria-label', text);
      phrase.textContent = '';
      const letters = Array.from(text, (character) => {
        const letter = document.createElement('span');
        letter.setAttribute('aria-hidden', 'true');
        letter.textContent = character === ' ' ? '\u00a0' : character;
        phrase.appendChild(letter);
        return letter;
      });

      gsap.fromTo(letters, { opacity: 0 }, {
        opacity: 1, ease: 'none', stagger: 0.07,
        scrollTrigger: { trigger: root, start: 'top 95%', end: 'top 45%', scrub: 0.4 }
      });
    }
    Object.entries(LAYERS).forEach(([name, c]) => {
      const layer = root.querySelector(`[data-layer="${name}"]`);
      if (!layer) return;
      const drift = layer.querySelector('.ink__drift');
      const img   = layer.querySelector('img');
      if (!drift || !img) return;
      const k = INTENSITY;

      // 1. Parallax ligado al scroll mientras la sección cruza la pantalla
      gsap.fromTo(layer,
        { y: -c.y * k, x: (c.baseX || 0) - c.x * k },
        { y:  c.y * k, x: (c.baseX || 0) + c.x * k, ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.3 } });

      // 2. Flotación lenta ambiental, independiente por capa
      if (c.idle && k > 0) {
        gsap.to(drift, { y: c.idle * k, x: (c.idle / 2) * k * (c.x < 0 ? -1 : 1),
          duration: c.dur, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      }

      // 3. Entrada sutil: los fragmentos aparecen al llegar a la sección
      if (c.fade) {
        gsap.fromTo(img, { opacity: 0 }, { opacity: 1, ease: 'none',
          scrollTrigger: { trigger: root, start: 'top 95%', end: 'top 15%', scrub: true } });
      }
    });

    const reverseRoot = document.getElementById('ink-reverse');
    if (reverseRoot) {
      Object.entries(LAYERS).forEach(([name, c]) => {
        const layer = reverseRoot.querySelector(`[data-layer="${name}"]`);
        if (!layer) return;
        const drift = layer.querySelector('.ink__drift');
        const img = layer.querySelector('img');
        if (!drift || !img) return;
        const k = INTENSITY;
        gsap.fromTo(layer,
          { y: c.y * k, x: (c.baseX || 0) + c.x * k },
          { y: -c.y * k, x: (c.baseX || 0) - c.x * k, ease: 'none',
            scrollTrigger: { trigger: reverseRoot, start: 'top bottom', end: 'bottom top', scrub: 0.3 } });
        if (c.idle && k > 0) {
          gsap.to(drift, { y: -c.idle * k, x: -(c.idle / 2) * k * (c.x < 0 ? -1 : 1),
            duration: c.dur, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        }
        if (c.fade) {
          gsap.fromTo(img, { opacity: 0 }, { opacity: 1, ease: 'none',
            scrollTrigger: { trigger: reverseRoot, start: 'top 95%', end: 'top 15%', scrub: true } });
        }
      });
    }
  });

  return () => {
    mm.revert();
    cleanupProjects();
  };   // limpia animaciones y ScrollTriggers
}

























