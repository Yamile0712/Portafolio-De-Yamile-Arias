(() => {
  const dialog = document.getElementById('documents-screen');
  const openButton = document.querySelector('[data-open-documents]');
  const closeButton = dialog?.querySelector('[data-close-documents]');
  const list = dialog?.querySelector('[data-docs-list]');
  const count = dialog?.querySelector('[data-docs-count]');
  if (!dialog || !openButton || !list) return;

  const documents = [{
    name: 'Manual de marca — Vamos Pal Monte.pdf',
    extension: 'PDF',
    description: 'Manual de identidad visual · PDF',
    url: 'docs/manual-de-marca-vamos-pal-monte.pdf',
    socialUrl: 'https://www.instagram.com/vamospalmontecaminatas?xtok=MXcyazBkd2ZsM2U0bw==',
    socialLabel: 'Instagram · Vamos Pal Monte'
  }, {
    name: 'Manual de marca — Vertecx Sistemas PC.pdf',
    extension: 'PDF',
    description: 'Manual de identidad visual · PDF',
    url: 'docs/manual-de-marca-vertecx-sistemas-pc.pdf',
    socialUrl: 'https://www.instagram.com/sistemas.pc?vrfl=MTh0MWFqZ3d2ZXdmNQ==',
    socialLabel: 'Instagram · Sistemas PC'
  }, {
    name: 'Informe de trabajo — La Manada.pdf',
    extension: 'PDF',
    description: 'Informe de trabajo · PDF',
    url: 'docs/informe-de-trabajo-la-manada.pdf',
    socialUrl: 'https://www.instagram.com/la_manada512?obrf=c2lmdzRsb3c2ZjY=',
    socialLabel: 'Instagram · La Manada'
  }];

  const renderDocuments = () => {
    list.replaceChildren();
    if (count) count.textContent = `${documents.length} ${documents.length === 1 ? 'documento' : 'documentos'}`;
    if (!documents.length) {
      const empty = document.createElement('p');
      empty.className = 'docs-list__empty';
      empty.textContent = 'Aún no hay documentos en esta sección. Envíamelos por aquí y los agregaré al portafolio.';
      list.append(empty);
      return;
    }
    documents.forEach((documentInfo) => {
      const item = document.createElement('article');
      item.className = 'docs-file';
      const badge = document.createElement('span');
      badge.className = 'docs-file__badge';
      badge.textContent = documentInfo.extension;
      const meta = document.createElement('span');
      meta.className = 'docs-file__meta';
      const name = document.createElement('span');
      name.className = 'docs-file__name';
      name.title = documentInfo.name;
      name.textContent = documentInfo.name;
      const description = document.createElement('span');
      description.className = 'docs-file__size';
      description.textContent = documentInfo.description;
      meta.append(name, description);
      const actions = document.createElement('span');
      actions.className = 'docs-file__actions';
      const view = document.createElement('a');
      view.href = documentInfo.url;
      view.target = '_blank';
      view.rel = 'noopener noreferrer';
      view.textContent = 'Ver PDF';
      view.setAttribute('aria-label', `Abrir ${documentInfo.name}`);
      actions.append(view);
      item.append(badge, meta, actions);
      if (documentInfo.socialUrl) {
        const social = document.createElement('a');
        social.className = 'docs-file__social';
        social.href = documentInfo.socialUrl;
        social.target = '_blank';
        social.rel = 'noopener noreferrer';
        social.setAttribute('aria-label', 'Visitar ' + documentInfo.socialLabel);

        social.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" class="docs-file__social-dot"/></svg><span></span><span aria-hidden="true">↗</span>';
        social.querySelector('span').textContent = documentInfo.socialLabel;
        item.append(social);
      }
      list.append(item);
    });
  };

  openButton.addEventListener('click', () => {
    if (!dialog.open) dialog.showModal();
    renderDocuments();
  });
  closeButton?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
