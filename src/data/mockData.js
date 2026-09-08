// Données de démonstration — utilisées uniquement quand VITE_USE_MOCK_DATA=true.
// Elles reproduisent la forme des ressources attendues des microservices Laravel
// (Property Service, Rental Service, Contract Service, Finance Service, Admin Service).

export const QUARTIERS = [
  'Andrainjato', 'Tsianolondroa', 'Ambalapaiso', 'Ampasambazaha',
  'Isotry', 'Ankofafa', 'Antarandolo', 'Andrefan\'Isotry',
]

export const EQUIPEMENTS = [
  { id: 'eq1', nom: 'Eau courante' },
  { id: 'eq2', nom: 'Électricité (JIRAMA)' },
  { id: 'eq3', nom: 'Cuisine équipée' },
  { id: 'eq4', nom: 'Parking' },
  { id: 'eq5', nom: 'Sécurité / gardiennage' },
  { id: 'eq6', nom: 'Connexion internet' },
  { id: 'eq7', nom: 'Meublé' },
  { id: 'eq8', nom: 'Jardin / cour' },
]

export const mockProperties = [
  {
    id: 'log-001',
    titre: 'Villa 3 chambres avec jardin',
    quartier: 'Andrainjato',
    type: 'Villa',
    prix: 650000,
    pieces: 4,
    surface: 120,
    statut: 'DISPONIBLE',
    photoPrincipale: null,
    equipements: ['eq1', 'eq2', 'eq3', 'eq4', 'eq8'],
    description: "Belle villa familiale au calme, à deux pas du centre-ville, avec jardin clos et parking privé.",
    proprietaireId: 'prop-01',
    proprietaireNom: 'Rakoto Andriamalala',
    dateAjout: '2026-07-02',
  },
  {
    id: 'log-002',
    titre: 'Appartement moderne T2',
    quartier: 'Tsianolondroa',
    type: 'Appartement',
    prix: 320000,
    pieces: 2,
    surface: 55,
    statut: 'DISPONIBLE',
    photoPrincipale: null,
    equipements: ['eq1', 'eq2', 'eq6', 'eq7'],
    description: "Appartement lumineux entièrement meublé, idéal pour un jeune couple ou un étudiant.",
    proprietaireId: 'prop-01',
    proprietaireNom: 'Rakoto Andriamalala',
    dateAjout: '2026-07-10',
  },
  {
    id: 'log-003',
    titre: 'Studio proche université',
    quartier: 'Ambalapaiso',
    type: 'Studio',
    prix: 150000,
    pieces: 1,
    surface: 25,
    statut: 'RESERVE',
    photoPrincipale: null,
    equipements: ['eq1', 'eq2', 'eq6'],
    description: "Studio pratique et économique, à 5 minutes à pied de l'université.",
    proprietaireId: 'prop-02',
    proprietaireNom: 'Hanta Razanadrakoto',
    dateAjout: '2026-06-28',
  },
  {
    id: 'log-004',
    titre: 'Maison traditionnelle rénovée',
    quartier: 'Isotry',
    type: 'Maison',
    prix: 480000,
    pieces: 3,
    surface: 90,
    statut: 'LOUE',
    photoPrincipale: null,
    equipements: ['eq1', 'eq2', 'eq5', 'eq8'],
    description: "Maison en pierre rénovée avec goût, quartier calme et sécurisé.",
    proprietaireId: 'prop-02',
    proprietaireNom: 'Hanta Razanadrakoto',
    dateAjout: '2026-05-18',
  },
  {
    id: 'log-005',
    titre: 'Duplex avec vue sur la ville',
    quartier: 'Antarandolo',
    type: 'Duplex',
    prix: 720000,
    pieces: 5,
    surface: 140,
    statut: 'DISPONIBLE',
    photoPrincipale: null,
    equipements: ['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6'],
    description: "Duplex haut standing offrant une vue dégagée sur la ville haute.",
    proprietaireId: 'prop-01',
    proprietaireNom: 'Rakoto Andriamalala',
    dateAjout: '2026-08-01',
  },
  {
    id: 'log-006',
    titre: 'Chambre indépendante meublée',
    quartier: 'Ankofafa',
    type: 'Chambre',
    prix: 90000,
    pieces: 1,
    surface: 16,
    statut: 'INDISPONIBLE',
    photoPrincipale: null,
    equipements: ['eq1', 'eq7'],
    description: "Chambre indépendante avec entrée privée, en réfection jusqu'à fin du mois.",
    proprietaireId: 'prop-03',
    proprietaireNom: 'Fidy Rasoanaivo',
    dateAjout: '2026-08-15',
  },
]

export const mockDemandes = [
  {
    id: 'dem-001',
    logementId: 'log-001',
    logementTitre: 'Villa 3 chambres avec jardin',
    locataireId: 'loc-01',
    locataireNom: 'Nirina Andriamampianina',
    message: "Bonjour, je suis très intéressé par ce logement pour une installation début septembre.",
    statut: 'EN_ATTENTE',
    dateEnvoi: '2026-08-20',
  },
  {
    id: 'dem-002',
    logementId: 'log-003',
    logementTitre: 'Studio proche université',
    locataireId: 'loc-01',
    locataireNom: 'Nirina Andriamampianina',
    message: "Le studio correspond parfaitement à mes besoins d'étudiant, disponible pour visite rapidement.",
    statut: 'ACCEPTEE',
    dateEnvoi: '2026-08-05',
  },
  {
    id: 'dem-003',
    logementId: 'log-005',
    logementTitre: 'Duplex avec vue sur la ville',
    locataireId: 'loc-02',
    locataireNom: 'Tiana Rakotobe',
    message: "Souhaite louer pour ma famille, disponible immédiatement.",
    statut: 'REFUSEE',
    dateEnvoi: '2026-08-12',
  },
]

export const mockVisites = [
  {
    id: 'vis-001',
    logementTitre: 'Villa 3 chambres avec jardin',
    demandeId: 'dem-001',
    dateProposee: '2026-09-08T10:00:00',
    statut: 'PROPOSEE',
  },
  {
    id: 'vis-002',
    logementTitre: 'Studio proche université',
    demandeId: 'dem-002',
    dateProposee: '2026-08-07T14:30:00',
    statut: 'CONFIRMEE',
    resultat: 'CONCLUANTE',
  },
]

export const mockLocation = {
  id: 'loc-active-01',
  logementTitre: 'Studio proche université',
  quartier: 'Ambalapaiso',
  dateDebut: '2026-08-15',
  statut: 'EN_COURS',
  contrat: {
    id: 'ctr-01',
    dateDebut: '2026-08-15',
    dateFin: '2027-08-14',
    loyerMensuel: 150000,
    caution: 300000,
    conditionsParticulieres: "Charges d'eau et d'électricité non comprises.",
    pdfUrl: '#',
  },
  factures: [
    { id: 'fac-01', periode: 'Août 2026', montant: 150000, echeance: '2026-08-05', statut: 'PAYEE' },
    { id: 'fac-02', periode: 'Septembre 2026', montant: 150000, echeance: '2026-09-05', statut: 'EN_ATTENTE' },
  ],
  paiements: [
    {
      id: 'pai-01', factureId: 'fac-01', montant: 150000, mode: 'Mobile Money',
      reference: 'MVOLA-88213', statut: 'VALIDE', datePaiement: '2026-08-04', quittanceUrl: '#',
    },
  ],
}

export const mockNotifications = [
  { id: 'not-01', titre: 'Demande acceptée', message: 'Votre demande pour "Studio proche université" a été acceptée.', lu: false, date: '2026-08-06T09:12:00' },
  { id: 'not-02', titre: 'Facture disponible', message: 'La facture de septembre 2026 est disponible.', lu: false, date: '2026-08-25T08:00:00' },
  { id: 'not-03', titre: 'Visite confirmée', message: 'Votre visite du 07/08 a été confirmée par le propriétaire.', lu: true, date: '2026-08-05T16:40:00' },
]

export const mockUsers = [
  { id: 'loc-01', nom: 'Nirina Andriamampianina', email: 'nirina@example.mg', role: 'LOCATAIRE', statut: 'ACTIF', dateInscription: '2026-06-01' },
  { id: 'loc-02', nom: 'Tiana Rakotobe', email: 'tiana@example.mg', role: 'LOCATAIRE', statut: 'ACTIF', dateInscription: '2026-06-15' },
  { id: 'prop-01', nom: 'Rakoto Andriamalala', email: 'rakoto@example.mg', role: 'PROPRIETAIRE', statut: 'ACTIF', dateInscription: '2026-05-20' },
  { id: 'prop-02', nom: 'Hanta Razanadrakoto', email: 'hanta@example.mg', role: 'PROPRIETAIRE', statut: 'ACTIF', dateInscription: '2026-05-22' },
  { id: 'prop-03', nom: 'Fidy Rasoanaivo', email: 'fidy@example.mg', role: 'PROPRIETAIRE', statut: 'SUSPENDU', dateInscription: '2026-04-10' },
]

export const mockStats = {
  totalLogements: 6,
  logementsDisponibles: 3,
  totalLocations: 12,
  demandesEnAttente: 4,
  paiementsEnAttenteVerification: 2,
  revenusDuMois: 1490000,
  evolutionDemandes: [
    { mois: 'Avr', valeur: 8 }, { mois: 'Mai', valeur: 11 }, { mois: 'Juin', valeur: 9 },
    { mois: 'Juil', valeur: 14 }, { mois: 'Août', valeur: 17 },
  ],
}
