export const CATEGORIES = ['REMISE_EN_FORME', 'INSTRUMENTS_MASSAGE', 'PRODUITS_AMAIGRISSANTS', 'JOUETS_ADULTES'];

export const CAT_LABELS = {
  fr: { REMISE_EN_FORME: 'Remise en forme', INSTRUMENTS_MASSAGE: 'Instruments de massage', PRODUITS_AMAIGRISSANTS: 'Produits amaigrissants', JOUETS_ADULTES: 'Jouets pour adultes' },
};

export const CATEGORY_ICONS = {
  REMISE_EN_FORME: '💪',
  INSTRUMENTS_MASSAGE: '💆',
  PRODUITS_AMAIGRISSANTS: '⚖️',
  JOUETS_ADULTES: '🔞',
};

export function getCategoryLabel(lang, category) {
  return (CAT_LABELS[lang] || CAT_LABELS.fr)[category] || category;
}
