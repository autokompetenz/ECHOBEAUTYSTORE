// Catalogue Echo Beauty Store — 4 catégories × 28 produits (source unique pour les seeds)
// Categories: REMISE_EN_FORME, INSTRUMENTS_MASSAGE, PRODUITS_AMAIGRISSANTS, JOUETS_ADULTES

const CATALOG = [
  // ═══ REMISE EN FORME ═══
  // ── Haltères & poids ──
  { name: "Kit Haltères Réglables 2 × 10 kg", price: 28500, stock: 8, category: "REMISE_EN_FORME", subcategory: "Haltères & poids", featured: true, description: "Kit d'haltères réglables 2 × 10 kg avec plaques verrouillables pour un entraînement complet à la maison." },
  { name: "Haltère Hexagonale 5 kg", price: 9500, stock: 15, category: "REMISE_EN_FORME", subcategory: "Haltères & poids", featured: false, description: "Haltère hexagonale 5 kg antidérapante, idéale pour le renforcement musculaire." },
  { name: "Kettlebell Fonte 8 kg", price: 18000, stock: 10, category: "REMISE_EN_FORME", subcategory: "Haltères & poids", featured: false, description: "Kettlebell en fonte 8 kg pour le travail cardiovasculaire et la puissance." },
  { name: "Barre de Musculation 20 kg + Disques", price: 65000, stock: 5, category: "REMISE_EN_FORME", subcategory: "Haltères & poids", featured: true, description: "Barre de musculation 20 kg livrée avec disques pour un entraînement complet." },

  // ── Tapis & cardio ──
  { name: "Tapis de Fitness Anti-Dérapant 6 mm", price: 12000, stock: 20, category: "REMISE_EN_FORME", subcategory: "Tapis & cardio", featured: false, description: "Tapis de fitness 6 mm antidérapant pour vos séances au sol." },
  { name: "Tapis de Yoga Épais 8 mm", price: 15000, stock: 18, category: "REMISE_EN_FORME", subcategory: "Tapis & cardio", featured: true, description: "Tapis de yoga épais 8 mm, confortable et facile à rouler." },
  { name: "Corde à Sauter Ajustable avec Compteur", price: 4500, stock: 30, category: "REMISE_EN_FORME", subcategory: "Tapis & cardio", featured: false, description: "Corde à sauter ajustable avec compteur de sauts pour le cardio." },
  { name: "Stepper Mini avec Poignées", price: 35000, stock: 8, category: "REMISE_EN_FORME", subcategory: "Tapis & cardio", featured: false, description: "Stepper compact avec poignées pour tonifier les jambes et les fessiers." },

  // ── Accessoires fitness ──
  { name: "Élastiques de Musculation Lot de 5", price: 8000, stock: 25, category: "REMISE_EN_FORME", subcategory: "Accessoires fitness", featured: false, description: "Lot de 5 élastiques de musculation de résistances progressives." },
  { name: "Poignées de Poussée (Push-up)", price: 6500, stock: 20, category: "REMISE_EN_FORME", subcategory: "Accessoires fitness", featured: false, description: "Poignées de push-up antidérapantes pour protéger les poignets." },
  { name: "Gants de Sport avec Poignets", price: 9000, stock: 18, category: "REMISE_EN_FORME", subcategory: "Accessoires fitness", featured: false, description: "Gants de musculation avec renfort poignets et paumes ventilées." },
  { name: "Bande de Résistance Boucle", price: 3500, stock: 40, category: "REMISE_EN_FORME", subcategory: "Accessoires fitness", featured: false, description: "Bande de résistance en boucle pour le renforcement et l'échauffement." },

  // ── Massage & récupération ──
  { name: "Foam Roller Haute Densité", price: 12000, stock: 15, category: "REMISE_EN_FORME", subcategory: "Massage & récupération", featured: false, description: "Foam roller haute densité pour détendre les muscles après l'effort." },
  { name: "Rouleau de Massage à Pointes", price: 11000, stock: 15, category: "REMISE_EN_FORME", subcategory: "Massage & récupération", featured: false, description: "Rouleau à pointes pour un massage profond et la libération des tensions." },
  { name: "Ballon de Massage Fascia", price: 5800, stock: 20, category: "REMISE_EN_FORME", subcategory: "Massage & récupération", featured: false, description: "Ballon de massage fascia pour cibler les points de tension." },
  { name: "Rouleau de Récupération Musculaire", price: 13500, stock: 12, category: "REMISE_EN_FORME", subcategory: "Massage & récupération", featured: false, description: "Rouleau de récupération pour améliorer la circulation et accélérer la récupération." },

  // ── Compléments alimentaires ──
  { name: "Protéine Whey Nature Vanille 1 kg", price: 28000, stock: 10, category: "REMISE_EN_FORME", subcategory: "Compléments alimentaires", featured: true, description: "Whey protéine saveur vanille 1 kg pour soutenir le développement musculaire." },
  { name: "BCAA 2:1:1 Comprimés 300", price: 22000, stock: 12, category: "REMISE_EN_FORME", subcategory: "Compléments alimentaires", featured: false, description: "BCAA 2:1:1 pour favoriser la récupération musculaire pendant l'entraînement." },
  { name: "Créatine Monohydrate 300 g", price: 18000, stock: 12, category: "REMISE_EN_FORME", subcategory: "Compléments alimentaires", featured: false, description: "Créatine monohydrate pure 300 g pour la force et la performance." },
  { name: "Pré-Workout Énergie 250 g", price: 24000, stock: 10, category: "REMISE_EN_FORME", subcategory: "Compléments alimentaires", featured: false, description: "Pré-workout énergie 250 g pour booster votre séance d'entraînement." },

  // ── Équipement de sport ──
  { name: "Corde à Sauter Vitesse Professionnelle", price: 6500, stock: 25, category: "REMISE_EN_FORME", subcategory: "Équipement de sport", featured: false, description: "Corde à sauter de vitesse professionnelle à roulements à billes." },
  { name: "Médecine Ball 4 kg", price: 15000, stock: 10, category: "REMISE_EN_FORME", subcategory: "Équipement de sport", featured: false, description: "Médecine ball 4 kg pour le travail du tronc et la coordination." },
  { name: "Planche Abdominale (Ab Wheel)", price: 7800, stock: 18, category: "REMISE_EN_FORME", subcategory: "Équipement de sport", featured: false, description: "Roue abdominale pour renforcer la sangle abdominale en douceur." },
  { name: "Gilet de Musculation 10 kg Réglable", price: 42000, stock: 6, category: "REMISE_EN_FORME", subcategory: "Équipement de sport", featured: false, description: "Gilet lesté réglable 10 kg pour intensifier vos exercices au poids du corps." },

  // ── Suivi & balance ──
  { name: "Balance Connectée Impédancemètre", price: 16000, stock: 12, category: "REMISE_EN_FORME", subcategory: "Suivi & balance", featured: true, description: "Balance connectée qui mesure poids, masse grasse et masse musculaire." },
  { name: "Mètre Ruban Mesure Corps", price: 2500, stock: 40, category: "REMISE_EN_FORME", subcategory: "Suivi & balance", featured: false, description: "Mètre ruban souple pour suivre vos mensurations et progrès." },
  { name: "Poignée de Force Dynamomètre", price: 9000, stock: 15, category: "REMISE_EN_FORME", subcategory: "Suivi & balance", featured: false, description: "Poignée de force avec compteur pour muscler la préhension." },
  { name: "Bracelet Activité Connecté", price: 22000, stock: 10, category: "REMISE_EN_FORME", subcategory: "Suivi & balance", featured: false, description: "Bracelet d'activité : pas, calories, fréquence cardiaque et sommeil." },

  // ═══ INSTRUMENTS DE MASSAGE ═══
  // ── Massage électrique ──
  { name: "Masseur à Percussion sans Fil", price: 45000, stock: 8, category: "INSTRUMENTS_MASSAGE", subcategory: "Massage électrique", featured: true, description: "Pistolet de massage à percussion sans fil avec plusieurs embouts." },
  { name: "Pistolet de Massage Pro 5 Têtes", price: 38000, stock: 10, category: "INSTRUMENTS_MASSAGE", subcategory: "Massage électrique", featured: false, description: "Pistolet de massage professionnel 5 embouts, 6 vitesses." },
  { name: "Masseur Électrique Cervical", price: 22000, stock: 12, category: "INSTRUMENTS_MASSAGE", subcategory: "Massage électrique", featured: false, description: "Masseur électrique de nuque et épaules avec chaleur infrarouge." },
  { name: "Appareil de Massage Multi-Zones", price: 32000, stock: 8, category: "INSTRUMENTS_MASSAGE", subcategory: "Massage électrique", featured: false, description: "Appareil de massage polyvalent pour dos, jambes, bras et cou." },

  // ── Appareils de massage ──
  { name: "Coussin Massant Dos & Cou avec Chaleur", price: 28000, stock: 10, category: "INSTRUMENTS_MASSAGE", subcategory: "Appareils de massage", featured: true, description: "Coussin de massage shiatsu pour dos et nuque avec fonction chaleur." },
  { name: "Fauteuil de Massage Compact", price: 185000, stock: 3, category: "INSTRUMENTS_MASSAGE", subcategory: "Appareils de massage", featured: false, description: "Fauteuil de massage compact à détente complète avec commande." },
  { name: "Masseur de Pieds Électrique", price: 26000, stock: 10, category: "INSTRUMENTS_MASSAGE", subcategory: "Appareils de massage", featured: false, description: "Masseur de pieds électrique chauffant à stimulation réflexe." },
  { name: "Rouleau Massant Ionique", price: 20000, stock: 12, category: "INSTRUMENTS_MASSAGE", subcategory: "Appareils de massage", featured: false, description: "Rouleau massant ionique pour lisser et tonifier la silhouette." },

  // ── Accessoires de massage ──
  { name: "Huile de Massage Relaxante 250 ml", price: 6500, stock: 25, category: "INSTRUMENTS_MASSAGE", subcategory: "Accessoires de massage", featured: false, description: "Huile de massage relaxante 250 ml, pénétration rapide." },
  { name: "Bougies de Massage Parfumées Lot de 3", price: 9800, stock: 18, category: "INSTRUMENTS_MASSAGE", subcategory: "Accessoires de massage", featured: false, description: "Bougies de massage parfumées qui fondent en huile tiède, lot de 3." },
  { name: "Pierres Chaudes de Massage (Set de 8)", price: 12000, stock: 10, category: "INSTRUMENTS_MASSAGE", subcategory: "Accessoires de massage", featured: false, description: "Set de 8 pierres volcaniques pour le massage aux pierres chaudes." },
  { name: "Sac de Massage Chinois (Gua Sha)", price: 8500, stock: 15, category: "INSTRUMENTS_MASSAGE", subcategory: "Accessoires de massage", featured: false, description: "Sac gua sha traditionnel pour les massages de drainage." },

  // ── Massage thérapeutique ──
  { name: "Bâton de Massage Pro (Muscle)", price: 7800, stock: 20, category: "INSTRUMENTS_MASSAGE", subcategory: "Massage thérapeutique", featured: false, description: "Bâton de massage avec rouleaux pour détendre les muscles profonds." },
  { name: "Rouleau Fascia pour Mollets", price: 11000, stock: 15, category: "INSTRUMENTS_MASSAGE", subcategory: "Massage thérapeutique", featured: false, description: "Rouleau fascia spécial mollets pour soulager les jambes lourdes." },
  { name: "Masseur Vibration pour Tendon d'Achille", price: 15000, stock: 12, category: "INSTRUMENTS_MASSAGE", subcategory: "Massage thérapeutique", featured: false, description: "Masseur à vibration ciblé pour les mollets et le tendon d'Achille." },
  { name: "Coussin Vibrant Chauffant", price: 18000, stock: 12, category: "INSTRUMENTS_MASSAGE", subcategory: "Massage thérapeutique", featured: false, description: "Coussin vibrant chauffant pour soulager les tensions musculaires." },

  // ── Massage du visage ──
  { name: "Masseur Visage Micro-Courant", price: 35000, stock: 8, category: "INSTRUMENTS_MASSAGE", subcategory: "Massage du visage", featured: true, description: "Masseur visage micro-courant pour tonifier et raffermir la peau." },
  { name: "Roller de Jade 7 Pierres", price: 9000, stock: 20, category: "INSTRUMENTS_MASSAGE", subcategory: "Massage du visage", featured: false, description: "Roller de jade pour drainer et sculpter le visage." },
  { name: "Appareil Lumineux LED Visage", price: 45000, stock: 6, category: "INSTRUMENTS_MASSAGE", subcategory: "Massage du visage", featured: false, description: "Appareil de luminothérapie LED pour un teint éclatant." },
  { name: "Gua Sha en Pierre Naturelle", price: 5800, stock: 25, category: "INSTRUMENTS_MASSAGE", subcategory: "Massage du visage", featured: false, description: "Pierre gua sha naturelle pour le lissage et le drainage du visage." },

  // ── Bien-être & relaxation ──
  { name: "Bouillotte Lavande Réutilisable", price: 7500, stock: 20, category: "INSTRUMENTS_MASSAGE", subcategory: "Bien-être & relaxation", featured: false, description: "Bouillotte réutilisable à la lavande, chaude ou froide selon l'usage." },
  { name: "Masque de Nuit en Soie", price: 6500, stock: 25, category: "INSTRUMENTS_MASSAGE", subcategory: "Bien-être & relaxation", featured: false, description: "Masque de nuit en soie pour un sommeil profond et reposant." },
  { name: "Diffuseur d'Huiles Essentielles", price: 18000, stock: 12, category: "INSTRUMENTS_MASSAGE", subcategory: "Bien-être & relaxation", featured: false, description: "Diffuseur d'huiles essentielles à ultrasons pour l'ambiance." },
  { name: "Oreiller Cervical Mémoire de Forme", price: 15000, stock: 15, category: "INSTRUMENTS_MASSAGE", subcategory: "Bien-être & relaxation", featured: false, description: "Oreiller cervical en mémoire de forme pour un bon maintien de la nuque." },

  // ── Massage du dos ──
  { name: "Masseur Dos à 8 Nœuds Shiatsu", price: 30000, stock: 10, category: "INSTRUMENTS_MASSAGE", subcategory: "Massage du dos", featured: true, description: "Masseur de dos shiatsu 8 nœuds avec fonction chaleur et rotation." },
  { name: "Coussin de Massage de Conduite", price: 22000, stock: 10, category: "INSTRUMENTS_MASSAGE", subcategory: "Massage du dos", featured: false, description: "Coussin de massage à brancher sur allume-cigare pour les trajets." },
  { name: "Rouleau Postural (Correction Dos)", price: 13000, stock: 15, category: "INSTRUMENTS_MASSAGE", subcategory: "Massage du dos", featured: false, description: "Rouleau postural pour corriger la posture et soulager le dos." },
  { name: "Bande Magnétique Anti-Douleur Dos", price: 5500, stock: 25, category: "INSTRUMENTS_MASSAGE", subcategory: "Massage du dos", featured: false, description: "Bande magnétique à porter pour soulager les douleurs lombaires." },

  // ═══ PRODUITS AMAIGRISSANTS ═══
  // ── Brûleurs de graisse ──
  { name: "Brûleur de Graisse Extra Fort 60 gélules", price: 25000, stock: 12, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Brûleurs de graisse", featured: true, description: "Brûleur de graisse extra fort, 60 gélules pour accélérer le métabolisme." },
  { name: "Complément Thermogénique 90 gélules", price: 28000, stock: 10, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Brûleurs de graisse", featured: false, description: "Complément thermogénique 90 gélules pour favoriser la dépense calorique." },
  { name: "Fat Burner Café Vert 60 gélules", price: 22000, stock: 12, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Brûleurs de graisse", featured: false, description: "Brûleur de graisse au café vert, 60 gélules naturelles." },
  { name: "Brûleur Gummies au Vinaigre de Cidre", price: 15000, stock: 20, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Brûleurs de graisse", featured: false, description: "Gummies au vinaigre de cidre pour aider à brûler les graisses." },

  // ── Ceintures amincissantes ──
  { name: "Ceinture Abdominale Vibrante", price: 18000, stock: 15, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Ceintures amincissantes", featured: false, description: "Ceinture abdominale vibrante pour tonifier les abdominaux." },
  { name: "Ceinture Thermique Néoprène", price: 8000, stock: 25, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Ceintures amincissantes", featured: false, description: "Ceinture néoprène pour activer la sudation au niveau du ventre." },
  { name: "Ceinture à Ultrasons Anti-Cellulite", price: 35000, stock: 8, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Ceintures amincissantes", featured: false, description: "Ceinture à ultrasons pour le lissage de la silhouette." },
  { name: "Ceinture Électrostimulation (EMS)", price: 40000, stock: 8, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Ceintures amincissantes", featured: true, description: "Ceinture EMS à électrostimulation pour muscler et tonifier." },

  // ── Crèmes minceur ──
  { name: "Crème Amincissante Ventre Plat 200 ml", price: 12000, stock: 18, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Crèmes minceur", featured: false, description: "Crème amincissante ventre plat, application ciblée 200 ml." },
  { name: "Gel Minceur Anti-Cellulite Caféine 250 ml", price: 14000, stock: 15, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Crèmes minceur", featured: true, description: "Gel minceur à la caféine 250 ml pour lutter contre la cellulite." },
  { name: "Crème Affinante Cuisses & Hanches", price: 13000, stock: 15, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Crèmes minceur", featured: false, description: "Crème affinante pour cuisses et hanches, effet lissant." },
  { name: "Sérum Thermo-Actif Localisé 150 ml", price: 16000, stock: 12, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Crèmes minceur", featured: false, description: "Sérum thermo-actif pour stimuler les zones localisées." },

  // ── Compléments détox ──
  { name: "Detox Total 7 Jours", price: 18000, stock: 15, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Compléments détox", featured: false, description: "Cure détox totale de 7 jours pour purifier l'organisme." },
  { name: "Colon Cleanse 60 gélules", price: 15000, stock: 18, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Compléments détox", featured: false, description: "Complément colon cleanse 60 gélules pour le transit." },
  { name: "Charbon Actif Détox 60 gélules", price: 12000, stock: 20, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Compléments détox", featured: false, description: "Charbon actif végétal 60 gélules pour une détox profonde." },
  { name: "Draineur Puissant 90 gélules", price: 20000, stock: 12, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Compléments détox", featured: false, description: "Draineur puissant 90 gélules pour éliminer l'eau et les toxines." },

  // ── Tisanes & thés minceur ──
  { name: "Tisane Ventre Plat 30 sachets", price: 6500, stock: 25, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Tisanes & thés minceur", featured: false, description: "Tisane ventre plat, 30 sachets infusables pour un ventre léger." },
  { name: "Thé Vert Matcha Détox 100 g", price: 11000, stock: 18, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Tisanes & thés minceur", featured: false, description: "Thé vert matcha 100 g riche en antioxydants." },
  { name: "Tisane Brûle-Graisse à la Menthe", price: 7500, stock: 20, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Tisanes & thés minceur", featured: false, description: "Tisane brûle-graisse à la menthe, 30 sachets." },
  { name: "Tisane Drainante 30 sachets", price: 7000, stock: 20, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Tisanes & thés minceur", featured: false, description: "Tisane drainante, 30 sachets pour accompagner vos cures." },

  // ── Anti-cellulite ──
  { name: "Huile Anti-Cellulite Tonic 200 ml", price: 10000, stock: 18, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Anti-cellulite", featured: false, description: "Huile tonique anti-cellulite 200 ml, massage circulaire." },
  { name: "Masque Corps Exfoliant Café", price: 9500, stock: 15, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Anti-cellulite", featured: false, description: "Masque exfoliant au café pour lisser la peau." },
  { name: "Spray Raffermissant Froid/Chaud", price: 13000, stock: 15, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Anti-cellulite", featured: false, description: "Spray raffermissant à effet froid/chaud pour le corps." },
  { name: "Contour & Drainage Gel Concentré", price: 17000, stock: 12, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Anti-cellulite", featured: false, description: "Gel concentré contour et drainage pour un effet remodelant." },

  // ── Gainage & affinement ──
  { name: "Hula Hoop Massant Aimanté", price: 9000, stock: 20, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Gainage & affinement", featured: false, description: "Hula hoop massant aimanté pour affiner la taille." },
  { name: "Disque Rotatif d'Équilibre", price: 7500, stock: 20, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Gainage & affinement", featured: false, description: "Disque rotatif d'équilibre pour tonifier les abdominaux." },
  { name: "Ballon de Gainage 55 cm avec Pompe", price: 12000, stock: 15, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Gainage & affinement", featured: false, description: "Ballon de gainage 55 cm livré avec pompe." },
  { name: "Plateau Vibrant Home Trainer", price: 55000, stock: 6, category: "PRODUITS_AMAIGRISSANTS", subcategory: "Gainage & affinement", featured: true, description: "Plateau vibrant home trainer pour muscler et raffermir." },

  // ═══ JOUETS ADULTES (18+) ═══
  // ── Vibromasseurs ──
  { name: "Vibromasseur Classique Silencieux", price: 22000, stock: 10, category: "JOUETS_ADULTES", subcategory: "Vibromasseurs", featured: true, description: "Vibromasseur classique silencieux, design discret et confortable." },
  { name: "Vibro Mini Bullet Discret", price: 9800, stock: 15, category: "JOUETS_ADULTES", subcategory: "Vibromasseurs", featured: false, description: "Mini vibro bullet discret pour un plaisir ciblé." },
  { name: "Vibromasseur à Billes Relaxant", price: 16000, stock: 12, category: "JOUETS_ADULTES", subcategory: "Vibromasseurs", featured: false, description: "Vibromasseur à billes pour une sensation relaxante." },
  { name: "Vibro Forme Ondulée", price: 28000, stock: 8, category: "JOUETS_ADULTES", subcategory: "Vibromasseurs", featured: false, description: "Vibromasseur à forme ondulée, intensités multiples." },

  // ── Accessoires érotiques ──
  { name: "Kit Menottes Douces avec Plume", price: 12000, stock: 15, category: "JOUETS_ADULTES", subcategory: "Accessoires érotiques", featured: false, description: "Kit menottes douces avec plume de massage, réservé aux adultes." },
  { name: "Masque de Jeu en Tulle", price: 6500, stock: 20, category: "JOUETS_ADULTES", subcategory: "Accessoires érotiques", featured: false, description: "Masque de jeu léger en tulle pour pimenter vos soirées." },
  { name: "Fouet de Massage en Plume", price: 8500, stock: 18, category: "JOUETS_ADULTES", subcategory: "Accessoires érotiques", featured: false, description: "Fouet de massage en plumes douces, réservé aux adultes." },
  { name: "Collier de Contention Réglable", price: 11000, stock: 15, category: "JOUETS_ADULTES", subcategory: "Accessoires érotiques", featured: false, description: "Collier de contention réglable, confort et sécurité." },

  // ── Lubrifiants & gels ──
  { name: "Lubrifiant À Base d'Eau 100 ml", price: 4500, stock: 30, category: "JOUETS_ADULTES", subcategory: "Lubrifiants & gels", featured: false, description: "Lubrifiant à base d'eau 100 ml, compatible avec tous les jouets." },
  { name: "Gel Retardant Pour Hommes", price: 9800, stock: 20, category: "JOUETS_ADULTES", subcategory: "Lubrifiants & gels", featured: false, description: "Gel retardant masculin pour prolonger le plaisir." },
  { name: "Huile de Massage Sensuelle Chauffante", price: 7500, stock: 20, category: "JOUETS_ADULTES", subcategory: "Lubrifiants & gels", featured: false, description: "Huile de massage chauffante au contact de la peau." },
  { name: "Lubrifiant Gelée 250 ml", price: 6500, stock: 25, category: "JOUETS_ADULTES", subcategory: "Lubrifiants & gels", featured: false, description: "Lubrifiant gelée 250 ml, longue durée." },

  // ── Bien-être intime ──
  { name: "Gel Stimulant Féminin 30 ml", price: 9500, stock: 18, category: "JOUETS_ADULTES", subcategory: "Bien-être intime", featured: false, description: "Gel stimulant féminin 30 ml pour une meilleure sensibilité." },
  { name: "Sérum Points Sensibles", price: 8500, stock: 18, category: "JOUETS_ADULTES", subcategory: "Bien-être intime", featured: false, description: "Sérum pour stimuler les points sensibles." },
  { name: "Kit Émotionnel Aphrodisiaque", price: 13000, stock: 15, category: "JOUETS_ADULTES", subcategory: "Bien-être intime", featured: false, description: "Kit aphrodisiaque pour des moments intenses." },
  { name: "Crème Chauffante Intime", price: 7500, stock: 20, category: "JOUETS_ADULTES", subcategory: "Bien-être intime", featured: false, description: "Crème chauffante intime, application externe." },

  // ── Plaisir masculin ──
  { name: "Accessoire de Plaisir Masculin Maniable", price: 15000, stock: 15, category: "JOUETS_ADULTES", subcategory: "Plaisir masculin", featured: false, description: "Accessoire de plaisir masculin compact et facile d'entretien." },
  { name: "Sleeve Souple Texturé", price: 12000, stock: 18, category: "JOUETS_ADULTES", subcategory: "Plaisir masculin", featured: false, description: "Sleeve souple texturé en matériau agréable." },
  { name: "Anneau de Maintien en Silicone", price: 6500, stock: 20, category: "JOUETS_ADULTES", subcategory: "Plaisir masculin", featured: false, description: "Anneau de maintien en silicone souple et réglable." },
  { name: "Masseur Prostatique Doux", price: 18000, stock: 10, category: "JOUETS_ADULTES", subcategory: "Plaisir masculin", featured: false, description: "Masseur prostatique doux, courbe anatomique." },

  // ── Kits & coffrets ──
  { name: "Coffret Découverte Enchantée", price: 45000, stock: 6, category: "JOUETS_ADULTES", subcategory: "Kits & coffrets", featured: true, description: "Coffret découverte avec plusieurs accessoires pour débuter." },
  { name: "Kit Sensuel Champagne", price: 25000, stock: 8, category: "JOUETS_ADULTES", subcategory: "Kits & coffrets", featured: false, description: "Kit sensuel thématique champagne pour les soirées." },
  { name: "Coffret Massage & Éveil", price: 32000, stock: 8, category: "JOUETS_ADULTES", subcategory: "Kits & coffrets", featured: false, description: "Coffret massage et éveil avec huile, bougie et accessoires." },
  { name: "Kit de Jeu Doux Débutant", price: 20000, stock: 10, category: "JOUETS_ADULTES", subcategory: "Kits & coffrets", featured: false, description: "Kit de jeu doux pour commencer en toute simplicité." },

  // ── Spécial couples ──
  { name: "Vibrant pour Deux", price: 26000, stock: 8, category: "JOUETS_ADULTES", subcategory: "Spécial couples", featured: true, description: "Accessoire vibrant à utiliser à deux, commande simple." },
  { name: "Jeu de Cartes Intimiste", price: 5800, stock: 25, category: "JOUETS_ADULTES", subcategory: "Spécial couples", featured: false, description: "Jeu de cartes intimiste pour pimenter le couple." },
  { name: "Dés Sensuels avec Pansements", price: 6500, stock: 20, category: "JOUETS_ADULTES", subcategory: "Spécial couples", featured: false, description: "Dés sensuels avec pansements pour des défis ludiques." },
  { name: "Set Massage en Duo", price: 16000, stock: 12, category: "JOUETS_ADULTES", subcategory: "Spécial couples", featured: false, description: "Set de massage en duo avec huile et accessoires." },
];

module.exports = CATALOG;
