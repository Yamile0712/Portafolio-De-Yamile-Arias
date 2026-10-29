/* SECCIÓN 1 · Cabezote: el video solo se reproduce mientras se ve. Sin efectos sobre el video. */
function initHero() {
  gsap.registerPlugin(ScrollTrigger);
  const hero  = document.getElementById('hero');
  const video = hero && hero.querySelector('video');
  if (!video) return () => {};

  const mm = gsap.matchMedia();
  mm.add({ reduce: '(prefers-reduced-motion: reduce)', ok: '(prefers-reduced-motion: no-preference)' }, (ctx) => {
    if (ctx.conditions.reduce) { video.pause(); video.currentTime = 0; return; }   // solo el poster
    ScrollTrigger.create({
      trigger: hero, start: 'top bottom', end: 'bottom top',
      onToggle: (s) => s.isActive ? video.play().catch(() => {}) : video.pause(),
    });
    gsap.from(video, { opacity: 0, duration: 1.4, ease: 'power2.out' });   // entrada suave
  });
  return () => mm.revert();
}

/* Rastro de líneas degradadas que acompaña el movimiento del cursor. */
function initCursorTrail() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(pointer: coarse)').matches) return () => {};
  const trail = document.createElement('canvas');
  trail.className = 'cursor-gradient-trail';
  trail.setAttribute('aria-hidden', 'true');
  document.body.appendChild(trail);
  const ctx = trail.getContext('2d');
  const segments = [];
  const whiteRunway = document.querySelector('.flight-runway');
  const lifetime = 720;
  let previous = null;
  let frame = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    trail.width = Math.round(window.innerWidth * ratio);
    trail.height = Math.round(window.innerHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  const drawFrame = (now) => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    while (segments.length && now - segments[0].time >= lifetime) segments.shift();
    if (segments.length) {
      const first = segments[0];
      const last = segments[segments.length - 1];
      const fade = 1 - (now - last.time) / lifetime;
      const gradient = ctx.createLinearGradient(first.x1, first.y1, last.x2, last.y2);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(.28, `rgba(0,0,0,${0.16 * fade})`);
      gradient.addColorStop(.68, `rgba(0,0,0,${0.58 * fade})`);
      gradient.addColorStop(1, `rgba(0,0,0,${0.92 * fade})`);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 4.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(first.x1, first.y1);
      segments.forEach((segment) => ctx.lineTo(segment.x2, segment.y2));
      ctx.stroke();
    }
    if (segments.length) frame = requestAnimationFrame(drawFrame);
    else frame = 0;
  };
  const onPointerMove = (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    const runwayRect = whiteRunway?.getBoundingClientRect();
    const overWhiteRunway = runwayRect && event.clientX >= runwayRect.left && event.clientX <= runwayRect.right && event.clientY >= runwayRect.top && event.clientY <= runwayRect.bottom;
    const onWhiteSection = (event.target instanceof Element && event.target.closest('.ink, .next, .tools')) || overWhiteRunway;
    if (!onWhiteSection) {
      segments.length = 0;
      previous = null;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      return;
    }
    if (previous) {
      segments.push({ x1: previous.x, y1: previous.y, x2: event.clientX, y2: event.clientY, time: performance.now() });
      if (segments.length > 140) segments.splice(0, segments.length - 140);
      if (!frame) frame = requestAnimationFrame(drawFrame);
    }
    previous = { x: event.clientX, y: event.clientY };
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('pointermove', onPointerMove, { passive: true });
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    document.removeEventListener('pointermove', onPointerMove);
    trail.remove();
  };
}

/* Lienzo para dibujar junto al video de especialización. */
function initDrawingPanel() {
  const panel = document.querySelector('[data-drawing-panel]');
  const canvas = panel && panel.querySelector('[data-drawing-canvas]');
  const context = canvas && canvas.getContext('2d');
  if (!panel || !canvas || !context) return () => {};

  const colorButtons = Array.from(panel.querySelectorAll('[data-drawing-color]'));
  const eraserButton = panel.querySelector('[data-drawing-eraser]');
  const clearButton = panel.querySelector('[data-drawing-clear]');
  let color = '#101820';
  let erasing = false;
  let drawing = false;

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const previous = document.createElement('canvas');
    previous.width = canvas.width;
    previous.height = canvas.height;
    if (previous.width && previous.height) previous.getContext('2d').drawImage(canvas, 0, 0);

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (previous.width && previous.height) {
      context.drawImage(previous, 0, 0, previous.width, previous.height, 0, 0, rect.width, rect.height);
    }
    context.lineCap = 'round';
    context.lineJoin = 'round';
  };

  const pointFromEvent = (event) => {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const startDrawing = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    drawing = true;
    canvas.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
    context.strokeStyle = color;
    context.lineWidth = erasing ? 24 : 3.5;
    panel.classList.add('has-drawing');
    event.preventDefault();
  };
  const draw = (event) => {
    if (!drawing) return;
    const point = pointFromEvent(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    event.preventDefault();
  };
  const stopDrawing = () => {
    drawing = false;
    context.closePath();
  };
  const selectColor = (event) => {
    color = event.currentTarget.dataset.drawingColor;
    erasing = false;
    eraserButton?.setAttribute('aria-pressed', 'false');
    eraserButton?.classList.remove('is-active');
    colorButtons.forEach((button) => {
      const active = button === event.currentTarget;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };
  const toggleEraser = () => {
    erasing = !erasing;
    eraserButton.setAttribute('aria-pressed', String(erasing));
    eraserButton.classList.toggle('is-active', erasing);
  };
  const clearDrawing = () => {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
    panel.classList.remove('has-drawing');
  };

  canvas.addEventListener('pointerdown', startDrawing);
  canvas.addEventListener('pointermove', draw);
  canvas.addEventListener('pointerup', stopDrawing);
  canvas.addEventListener('pointercancel', stopDrawing);
  colorButtons.forEach((button) => button.addEventListener('click', selectColor));
  eraserButton?.addEventListener('click', toggleEraser);
  clearButton?.addEventListener('click', clearDrawing);
  const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resizeCanvas) : null;
  resizeObserver?.observe(canvas);
  if (!resizeObserver) window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  let revealObserver = null;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    panel.classList.add('is-visible');
    panel.classList.add('is-scroll-visible');
  } else {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          panel.classList.add('is-visible', 'is-scroll-visible');
        } else {
          panel.classList.remove('is-scroll-visible');
        }
      });
    }, { threshold: 0.12 });
    revealObserver.observe(panel);
  }

  return () => {
    canvas.removeEventListener('pointerdown', startDrawing);
    canvas.removeEventListener('pointermove', draw);
    canvas.removeEventListener('pointerup', stopDrawing);
    canvas.removeEventListener('pointercancel', stopDrawing);
    colorButtons.forEach((button) => button.removeEventListener('click', selectColor));
    eraserButton?.removeEventListener('click', toggleEraser);
    clearButton?.removeEventListener('click', clearDrawing);
    resizeObserver?.disconnect();
    revealObserver?.disconnect();
    panel.classList.remove('is-scroll-visible');
    if (!resizeObserver) window.removeEventListener('resize', resizeCanvas);
  };
}
