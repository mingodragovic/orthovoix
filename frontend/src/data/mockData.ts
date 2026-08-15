// src/data/mockData.ts
import { Patient, Exercise } from "../types";

export const patients: Patient[] = [
  { id: 1, nom: "Emma Martin", age: 6, statut: "Actif", progression: 4, total: 10, avatar: "EM" },
  { id: 2, nom: "Noah Dupont", age: 7, statut: "Actif", progression: 2, total: 8, avatar: "ND" },
  { id: 3, nom: "Léa Bernard", age: 5, statut: "Actif", progression: 7, total: 10, avatar: "LB" },
  { id: 4, nom: "Lucas Moreau", age: 8, statut: "Archivé", progression: 10, total: 10, avatar: "LM" },
  { id: 5, nom: "Chloé Petit", age: 6, statut: "Actif", progression: 1, total: 6, avatar: "CP" },
];

export const exercisesOrtho: Exercise[] = [
  { id: 1, titre: "Son SH - Niveau 1", statut: "terminé", dateAssignation: "10 juil.", dateRealisation: "15 juil.", instructions: "Répéter 'chat', 'chapeau', 'cheval'" },
  { id: 2, titre: "Son R - Répétition", statut: "assigné", dateAssignation: "12 juil.", instructions: "Pratiquer le son R devant un miroir" },
  { id: 3, titre: "Son P - Souffle", statut: "assigné", dateAssignation: "14 juil.", instructions: "Souffler une bougie, répéter 'papa'" },
  { id: 4, titre: "Voyelles longues", statut: "terminé", dateAssignation: "5 juil.", dateRealisation: "8 juil.", instructions: "Étirer les sons A, E, I, O, U" },
  { id: 5, titre: "Son S - Sifflement", statut: "assigné", dateAssignation: "16 juil.", instructions: "Répéter 'soleil', 'sapin', 'sac'" },
  { id: 6, titre: "Son L - Langue", statut: "non-assigné", dateAssignation: "-", instructions: "Exercices de langue contre palais" },
];

export const exercisesParent: Exercise[] = [
  { id: 1, titre: "Son SH", statut: "terminé", dateAssignation: "10 juil.", dateRealisation: "15 juil.", instructions: "Répétez 'chat', 'chapeau', 'cheval' avec votre enfant 5 fois.", image: "https://images.unsplash.com/photo-1555009393-f20bdb245c4d?w=300&h=200&fit=crop&auto=format" },
  { id: 2, titre: "Son R - Répétition", statut: "assigné", dateAssignation: "12 juil.", instructions: "Demandez à Emma de pratiquer le son R devant un miroir 3 fois par jour.", image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&h=200&fit=crop&auto=format" },
  { id: 3, titre: "Son P - Souffle", statut: "assigné", dateAssignation: "14 juil.", instructions: "Souffler une bougie à distance, répéter 'papa', 'pomme', 'pont'.", image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=300&h=200&fit=crop&auto=format" },
];