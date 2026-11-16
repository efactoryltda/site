/* E-Factory — home e catálogo: preço real no hero, "a partir de" das categorias, faixas por configuração */
(function () {

  // Preço real do produto exibido no hero, lido da fonte na renderização.
  // Usa a melhor faixa DESTE produto com a quantidade mínima DELE.
  const alvo = document.getElementById("hero-preco");
  if (alvo && window.EFonte) {
    EFonte.listarProdutos().then((produtos) => {
      const p = produtos.find((x) => x.id === alvo.dataset.produtoId);
      const el = alvo.querySelector("[data-hero-valor]");
      if (!p || !el) return;
      const f = EFonte.melhorFaixa(p);
      el.textContent = f ? EFonte.textoAPartirDe(f) : `${EFonte.fmtMoeda(p.preco_venda)}/un.`;
      el.hidden = false;
    }).catch(() => { /* sem fonte: mantém só o nome do produto, nunca um preço digitado */ });
  }

  // "A partir de" das categorias: menor faixa de atacado da categoria + quantidade mínima.
  // Categoria sem faixa (fitas, avulsas): menor preço unitário + "atacado sob consulta".
  const alvosCat = document.querySelectorAll("[data-cat-preco]");
  if (alvosCat.length && window.EFonte) {
    EFonte.listarProdutos().then((produtos) => {
      alvosCat.forEach((el) => {
        const cat = el.dataset.catPreco;
        const melhor = EFonte.melhorFaixaCategoria(produtos, cat);
        if (melhor) { el.textContent = EFonte.textoAPartirDe(melhor.faixa); return; }
        const daCat = produtos.filter((p) => p.categoria === cat);
        if (!daCat.length) return;
        const menor = Math.min(...daCat.map((p) => EFonte.precoParaQuantidade(p, 1)));
        el.textContent = `a partir de ${EFonte.fmtMoeda(menor)}/un. (avulsas; atacado sob consulta)`;
      });
    }).catch(() => {});
  }

  // Faixas dirigidas por configuração (js/config.js). Sem dado → faixa fica oculta.
  const CFG = window.SITE_CONFIG || {};
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const mv = CFG.maisVendidos || {};
  const secDest = document.getElementById("faixa-destaques");
  if (secDest && (mv.modo === "ranking" || mv.modo === "editorial") && (mv.ids || []).length && window.EFonte) {
    EFonte.listarProdutos().then((produtos) => {
      const itens = mv.ids.map((id) => produtos.find((p) => p.id === id)).filter(Boolean);
      if (!itens.length) return;
      document.getElementById("h-destaques").textContent = mv.modo === "ranking" ? "Mais vendidos" : "Seleção da equipe";
      secDest.querySelector("[data-destaques-nota]").hidden = mv.modo !== "editorial";
      secDest.querySelector("[data-destaques-lista]").innerHTML = itens.map((p) => {
        const f = EFonte.melhorFaixa(p);
        const preco = f ? EFonte.textoAPartirDe(f) : `${EFonte.fmtMoeda(EFonte.precoParaQuantidade(p, 1))}/un.`;
        const foto = p.fotos && p.fotos[0] ? `<img src="${esc(p.fotos[0].url)}" alt="" loading="lazy" width="400" height="400">` : "";
        return `<a class="destaque" href="loja.html?q=${encodeURIComponent(p.nome)}">${foto}<strong>${esc(p.nome)}</strong><span>${esc(preco)}</span></a>`;
      }).join("");
      secDest.hidden = false;
    }).catch(() => {});
  }

  const ps = CFG.provaSocial || {};
  const canais = CFG.canais || {};
  const secConf = document.getElementById("faixa-confianca");
  if (secConf) {
    const itens = [ps.reputacaoMercadoLivre, ps.vendasMercadoLivre].filter(Boolean);
    const deps = (ps.depoimentos || []).filter((d) => d && d.texto && d.autor);
    const nomes = { mercadoLivre: "Mercado Livre", shopee: "Shopee", tiktokShop: "TikTok Shop" };
    const links = Object.keys(nomes).filter((k) => canais[k] && /^https:\/\//.test(canais[k]));
    secConf.querySelector("[data-confianca-itens]").innerHTML = itens.map((t) => `<li>${esc(t)}</li>`).join("");
    secConf.querySelector("[data-depoimentos]").innerHTML = deps.map((d) => `<blockquote><p>${esc(d.texto)}</p><footer>${esc(d.autor)}</footer></blockquote>`).join("");
    secConf.querySelector("[data-canais]").innerHTML = links.map((k) => `<li><a href="${esc(canais[k])}" rel="noopener noreferrer" target="_blank">${nomes[k]}</a></li>`).join("");
    secConf.hidden = !(itens.length || deps.length || links.length);
  }
})();
