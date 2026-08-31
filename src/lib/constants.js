export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL || 'http://localhost:8000/storage';

export const USER_ROLES = {
  ADMIN: 'admin',
  PROPRIETAIRE: 'proprietaire',
  LOCATAIRE: 'locataire',
};

export const LOGEMENT_STATUS = {
  DISPONIBLE: 'disponible',
  OCCUPE: 'occupe',
  EN_ATTENTE: 'en_attente',
  DESACTIVE: 'desactive',
};

export const DEMANDE_STATUS = {
  EN_ATTENTE: 'en_attente',
  ACCEPTEE: 'acceptee',
  REFUSEE: 'refusee',
  ANNULEE: 'annulee',
};

export const VISITE_STATUS = {
  EN_ATTENTE: 'en_attente',
  CONFIRMEE: 'confirmee',
  EFFECTUEE: 'effectuee',
  ANNULEE: 'annulee',
};

export const PAYMENT_METHODS = {
  MVOLA: 'mvola',
  AIRTEL_MONEY: 'airtel_money',
  ORANGE_MONEY: 'orange_money',
  ESPECES: 'especes',
  VIREMENT: 'virement',
};

export const PAYMENT_STATUS = {
  EN_ATTENTE: 'en_attente',
  VALIDE: 'valide',
  REJETE: 'rejete',
};

// Quartiers malaza ao Fianarantsoa
export const FIANARANTSOA_QUARTIERS = [
  'Ampasambazaha',
  'Ambalapaiso',
  'Ambalavato',
  'Ankofafa',
  'Tambohobe',
  'Ivory',
  'Tsianolondroa',
  'Talatamaty',
  'Mahamanina',
  'Isaha',
  'Andrainjato',
  'Tanambao',
  'Antranobiriky',
  'Ambozontany',
];
