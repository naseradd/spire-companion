// Rend le BBCode Godot des descriptions ([gold]...[/gold], retours ligne) en HTML sûr.
// Les nombres sont déjà résolus dans `description` (pas de placeholders {Damage} ici).

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** [gold]X[/gold] -> <em class="kw">X</em> ; autres [tag]Y[/tag] -> span tag ; \n -> <br>. */
export function renderBBCode(raw: string | null | undefined): string {
  if (!raw) return '';
  let s = escapeHtml(raw);
  // [gold]..[/gold] = mots-clés/valeurs mis en avant
  s = s.replace(/\[gold\]([\s\S]*?)\[\/gold\]/g, '<em class="kw">$1</em>');
  // tout autre [tag]..[/tag] générique -> span avec data-tag (couleur via CSS si voulu)
  s = s.replace(/\[([a-z0-9_:]+)\]([\s\S]*?)\[\/[a-z0-9_:]+\]/gi, '<span class="bb" data-tag="$1">$2</span>');
  // tags orphelins éventuels
  s = s.replace(/\[\/?[a-z0-9_:]+\]/gi, '');
  s = s.replace(/\n/g, '<br>');
  return s;
}

/** Version texte brut (sans balises) pour recherche / aria. */
export function plainText(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw.replace(/\[\/?[a-z0-9_:]+\]/gi, '').replace(/\n/g, ' ').trim();
}
