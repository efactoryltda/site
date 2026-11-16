/* ==========================================================
   E-Factory — fonte única de produtos e preços (home + loja)
   Lê ao vivo a RPC listar_produtos_loja do ERP (Supabase).
   Preço NUNCA é digitado no HTML: tudo sai daqui.
   ========================================================== */
(function () {
  const SUPABASE_URL = "https://jrkuzyhobgzhjjyblmed.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_hTVzu8qbEYSmUeDZvFA9XQ_s4ARn1_9"; // chave anon pública (mesma do ERP)

  let cache = null;
  function listarProdutos() {
    if (!cache) {
      cache = fetch(`${SUPABASE_URL}/rest/v1/rpc/listar_produtos_loja`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: "{}",
      }).then((r) => {
        if (!r.ok) throw new Error("RPC " + r.status);
        return r.json();
      }).catch((e) => { cache = null; throw e; });
    }
    return cache;
  }

  function fmtMoeda(n) {
    return "R$ " + Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function fmtQtd(n) {
    return Number(n || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  }
  function faixasOrdenadas(p) {
    return (p.faixas || []).slice().sort((a, b) => a.quantidade_minima - b.quantidade_minima);
  }
  // Mesma lógica da função calcular_preco_loja no banco (só exibição).
  function precoParaQuantidade(p, quantidade) {
    let preco = p.preco_venda;
    faixasOrdenadas(p).forEach((f) => { if (quantidade >= f.quantidade_minima) preco = f.preco_unitario; });
    if (p.promocao_ativa && p.promocao_preco != null && p.promocao_preco < preco) preco = p.promocao_preco;
    return preco;
  }
  // Menor preço de atacado do produto, com a quantidade mínima daquela faixa.
  function melhorFaixa(p) {
    const fx = faixasOrdenadas(p);
    if (!fx.length) return null;
    return fx.reduce((m, f) => (f.preco_unitario < m.preco_unitario ? f : m), fx[0]);
  }
  // Menor faixa da categoria (proposta 1): { produto, faixa } ou null se ninguém tem faixa.
  function melhorFaixaCategoria(produtos, categoria) {
    let best = null;
    produtos.filter((p) => p.categoria === categoria).forEach((p) => {
      const f = melhorFaixa(p);
      if (f && (!best || f.preco_unitario < best.faixa.preco_unitario ||
        (f.preco_unitario === best.faixa.preco_unitario && f.quantidade_minima < best.faixa.quantidade_minima))) {
        best = { produto: p, faixa: f };
      }
    });
    return best;
  }
  // Texto no formato da proposta 1: "a partir de R$ 1,00/un. (a partir de 1.000 un.)"
  function textoAPartirDe(faixa) {
    return `a partir de ${fmtMoeda(faixa.preco_unitario)}/un. (a partir de ${fmtQtd(faixa.quantidade_minima)} un.)`;
  }

  window.EFonte = { listarProdutos, fmtMoeda, fmtQtd, faixasOrdenadas, precoParaQuantidade, melhorFaixa, melhorFaixaCategoria, textoAPartirDe, SUPABASE_URL, SUPABASE_ANON_KEY };
})();
