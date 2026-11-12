/* E-Factory: conteúdo da página inicial que vem do ERP (aba "Site").
   Lê a função pública site_conteudo() (banner ativo, categorias, vitrine) e
   listar_produtos_loja() (produtos visíveis, fotos, faixas). Se o banco não
   responder, a página fica como está no HTML (imagens padrão). */
(function () {
  const SUPABASE_URL = 'https://jrkuzyhobgzhjjyblmed.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_hTVzu8qbEYSmUeDZvFA9XQ_s4ARn1_9';
  const FOTO_PADRAO = { caixas: 'img/linha-detail-caixa.webp', etiquetas: 'img/linha-detail-rolo.webp', sacos: 'img/sacos.webp', fitas: 'img/fita.webp' };

  const rpc = (nome) => fetch(`${SUPABASE_URL}/rest/v1/rpc/${nome}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    body: '{}',
  }).then(r => { if (!r.ok) throw new Error(nome + ' ' + r.status); return r.json(); });

  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const brl = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const menorPreco = (p) => Math.min(Number(p.promocao_ativa && p.promocao_preco ? p.promocao_preco : p.preco_venda), ...(p.faixas || []).map(f => Number(f.preco_unitario)));

  function aplicarBanner(b) {
    if (!b || !b.imagem_url) return;
    const stage = document.querySelector('.hero__stage');
    if (stage) {
      stage.innerHTML = `<picture>${b.imagem_mobile_url ? `<source media="(max-width: 639px)" srcset="${esc(b.imagem_mobile_url)}">` : ''}<img src="${esc(b.imagem_url)}" alt="${esc(b.titulo || 'Embalagens E-Factory')}" fetchpriority="high"></picture>`;
      stage.classList.add('hero__stage--foto');
    }
    if (b.titulo) document.getElementById('hero-h').textContent = b.titulo;
    if (b.frase) { const l = document.querySelector('.hero__lead'); if (l) l.textContent = b.frase; }
    const btn = document.querySelector('.hero .btn--primary');
    if (btn) {
      if (b.botao_link) btn.setAttribute('href', b.botao_link);
      if (b.botao_texto && btn.firstChild && btn.firstChild.nodeType === 3) btn.firstChild.textContent = b.botao_texto;
    }
  }

  function aplicarCategorias(cats, produtos) {
    const grid = document.getElementById('categorias-grid');
    if (!grid || !cats || !cats.length) return;
    const span = cats.length === 4 ? 'span-3' : 'span-4';
    grid.innerHTML = cats.map(c => {
      const daCat = produtos.filter(p => p.categoria === c.slug);
      const desde = daCat.length ? Math.min(...daCat.map(menorPreco)) : null;
      return `<a class="tile tile--portrait ${span}" href="loja.html#${c.slug}">
        <div class="tile__media"><img src="${esc(c.imagem_url || FOTO_PADRAO[c.slug])}" alt="${esc(c.nome)}" loading="lazy" class="${c.imagem_url ? 'is-foto' : ''}"></div>
        <div class="tile__head"><h3>${esc(c.nome)}</h3></div>
        <p class="tile__facts">${desde != null && isFinite(desde) ? 'A partir de ' + brl(desde) + ' · ' : ''}${esc(c.frase || '')}</p>
      </a>`;
    }).join('');
  }

  function aplicarVitrine(ids, produtos) {
    const sec = document.getElementById('vitrine');
    if (!sec) return;
    const porId = Object.fromEntries(produtos.map(p => [p.id, p]));
    const lista = (ids || []).map(id => porId[id]).filter(Boolean);
    if (!lista.length) { sec.hidden = true; return; }
    document.getElementById('vitrine-grid').innerHTML = lista.slice(0, 8).map(p => {
      const foto = (p.fotos && p.fotos[0] && p.fotos[0].url) || FOTO_PADRAO[p.categoria] || FOTO_PADRAO.caixas;
      return `<a class="tile span-3" href="loja.html#p-${p.id}">
        <div class="tile__media"><img src="${esc(foto)}" alt="${esc(p.nome)}" loading="lazy" class="${p.fotos && p.fotos[0] ? 'is-foto' : ''}"></div>
        <div class="tile__head"><h3>${esc(p.nome)}</h3></div>
        <p class="tile__facts">A partir de ${brl(menorPreco(p))}</p>
      </a>`;
    }).join('');
    sec.hidden = false;
  }

  Promise.all([rpc('site_conteudo'), rpc('listar_produtos_loja').catch(() => [])])
    .then(([conteudo, produtos]) => {
      aplicarBanner(conteudo.banner);
      aplicarCategorias(conteudo.categorias, produtos || []);
      aplicarVitrine(conteudo.vitrine, produtos || []);
    })
    .catch(err => console.warn('Conteúdo do ERP indisponível, usando o padrão:', err));
})();
