(() => {
  /* ============ CONFIGURACIÓN (pega aquí tus datos de Supabase) ============ */
  const SUPABASE_URL = 'https://rdngpcxhbrvnqpelceqm.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkbmdwY3hoYnJ2bnFwZWxjZXFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMzUxOTEsImV4cCI6MjEwODgxMTE5MX0.Oif1UtOuw3-YRVIiIfG-34Bi5dqShgE03S5CNpoqOd8';
  /* ========================================================================= */

  const form = document.querySelector('[data-review-form]');
  const wall = document.querySelector('.reviews__wall');
  const status = document.querySelector('[data-review-status]');
  if (!form || !wall || !status) return;

  const configured = !SUPABASE_URL.includes('TU-PROYECTO') && !SUPABASE_ANON_KEY.includes('TU-CLAVE');
  const endpoint = `${SUPABASE_URL}/rest/v1/reviews`;
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  };
  const COOLDOWN_MS = 60000; // 1 reseña por minuto por navegador
  const cooldownKey = 'yamile-review-last';

  // Campo trampa para bots (los humanos no lo ven)
  const trap = document.createElement('input');
  trap.type = 'text';
  trap.name = 'website';
  trap.tabIndex = -1;
  trap.autocomplete = 'off';
  trap.setAttribute('aria-hidden', 'true');
  trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
  form.append(trap);

  const showMessage = (title, text) => {
    wall.replaceChildren();
    const box = document.createElement('div');
    box.className = 'reviews__empty';
    const stars = document.createElement('span');
    stars.className = 'reviews__stars';
    stars.setAttribute('aria-hidden', 'true');
    stars.textContent = '★★★★★';
    const h = document.createElement('h3');
    h.textContent = title;
    const p = document.createElement('p');
    p.textContent = text;
    box.append(stars, h, p);
    wall.append(box);
  };

  const renderReviews = (reviews) => {
    if (!reviews.length) {
      showMessage('Aún no hay reseñas', 'Cuando haya comentarios reales, aparecerán aquí.');
      return;
    }
    wall.replaceChildren();
    reviews.forEach((review) => {
      const rating = Math.min(5, Math.max(1, Number(review.rating) || 5));
      const card = document.createElement('article');
      card.className = 'review-card';
      const stars = document.createElement('span');
      stars.className = 'review-card__stars';
      stars.setAttribute('aria-label', `${rating} de 5 estrellas`);
      stars.textContent = `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;
      const comment = document.createElement('blockquote');
      comment.textContent = review.comment;
      const meta = document.createElement('div');
      meta.className = 'review-card__meta';
      const author = document.createElement('strong');
      author.textContent = review.name;
      meta.append(author);
      if (review.project) {
        const project = document.createElement('span');
        project.textContent = review.project;
        meta.append(project);
      }
      card.append(stars, comment, meta);
      wall.append(card);
    });
  };

  const loadReviews = async () => {
    if (!configured) {
      showMessage('Reseñas sin conectar', 'Falta configurar la conexión con la base de datos.');
      return;
    }
    try {
      const response = await fetch(`${endpoint}?select=name,project,rating,comment,created_at&order=created_at.desc&limit=60`, { headers });
      if (!response.ok) throw new Error(response.status);
      renderReviews(await response.json());
    } catch {
      showMessage('No pude cargar las reseñas', 'Revisa tu conexión e inténtalo de nuevo en un momento.');
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!configured) {
      status.textContent = 'Las reseñas aún no están conectadas a la base de datos.';
      return;
    }
    const fields = new FormData(form);
    if (fields.get('website')) return; // bot

    try {
      const last = Number(window.localStorage.getItem(cooldownKey) || 0);
      if (Date.now() - last < COOLDOWN_MS) {
        status.textContent = 'Espera un momento antes de enviar otra reseña.';
        return;
      }
    } catch { /* sin localStorage: se omite el límite local */ }

    const review = {
      name: String(fields.get('name') || '').trim().slice(0, 80),
      project: String(fields.get('project') || '').trim().slice(0, 100) || null,
      rating: Number(fields.get('rating')),
      comment: String(fields.get('comment') || '').trim().slice(0, 1200)
    };
    const submit = form.querySelector('[type="submit"], button:not([type])');
    if (submit) submit.disabled = true;
    status.textContent = 'Enviando tu reseña...';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify(review)
      });
      if (!response.ok) throw new Error(response.status);
      try { window.localStorage.setItem(cooldownKey, String(Date.now())); } catch { /* ignorar */ }
      form.reset();
      status.textContent = 'Gracias por tu reseña. Ya aparece en la pared.';
      await loadReviews();
    } catch {
      status.textContent = 'No se pudo enviar la reseña. Inténtalo de nuevo en un momento.';
    } finally {
      if (submit) submit.disabled = false;
    }
  });

  loadReviews();
})();
