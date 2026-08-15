// src/types/index.ts
export type Role = "orthophoniste" | "parent";

// Explicitly define Screen as a union of string literals
export type Screen =
  | "login"
  | "ortho-dashboard"
  | "patients"
  | "patient-detail"
  | "exercise-create"
  | "ortho-progress"
  | "parent-dashboard"
  | "parent-progress"
  | "exercise-practice";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  childName?: string;
  childId?: string;
  specialization?: string;
  licenseNumber?: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Patient {
  id: number;
  nom: string;
  age: number;
  statut: "Actif" | "Archivé";
  progression: number;
  total: number;
  avatar: string;
  parentEmail?: string;
  parentName?: string;
}

export interface Exercise {
  id: number;
  titre: string;
  statut: "terminé" | "assigné" | "non-assigné";
  dateAssignation: string;
  dateRealisation?: string;
  image?: string;
  instructions: string;
  audioUrl?: string;
  difficulty?: "Facile" | "Moyen" | "Difficile";
  category?: string;
  targetSound?: string;
}

export interface PracticeSession {
  id: number;
  exerciseId: number;
  patientId: number;
  date: string;
  duration: number;
  score: number;
  attempts: number;
  completed: boolean;
}