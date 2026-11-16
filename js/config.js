/* ==========================================================
   E-Factory — configuração editorial do site
   Tudo aqui começa VAZIO de propósito: sem dado confirmado,
   a faixa correspondente simplesmente não aparece.
   ========================================================== */
window.SITE_CONFIG = {
  // Faixa "Mais vendidos" na home.
  //  modo: "oculto"    → faixa não aparece (padrão enquanto não houver ranking)
  //        "ranking"   → título "Mais vendidos" (usar só com ranking real de vendas)
  //        "editorial" → título "Seleção da equipe" (seleção editorial, não é dado de vendas)
  //  ids: ids dos produtos na ordem de exibição (preço sempre lido da fonte)
  maisVendidos: { modo: "oculto", ids: [] },

  // Prova social. Só preencher com dado verificável/autorizado.
  provaSocial: {
    reputacaoMercadoLivre: null, // ex.: "MercadoLíder Platinum" (texto exatamente como aparece no ML)
    vendasMercadoLivre: null,    // ex.: "+5 mil vendas" (como aparece no perfil)
    depoimentos: [],             // [{ texto: "...", autor: "Nome, Loja X" }] — só com autorização
  },

  // Canais oficiais. Sem URL verificada, o logo/link não aparece.
  canais: {
    mercadoLivre: null, // ex.: "https://www.mercadolivre.com.br/perfil/..."
    shopee: null,
    tiktokShop: null,
  },
};
