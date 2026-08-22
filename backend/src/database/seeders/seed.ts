import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../modules/users/interfaces/user-roles.enum';
import { Patient } from '../../modules/patients/entities/patient.entity';
import { PatientStatus, Gender } from '../../modules/patients/interfaces/patient-status.enum';
import { Exercise } from '../../modules/exercises/entities/exercise.entity';
import { ExerciseCategory, ExerciseDifficulty } from '../../modules/exercises/interfaces/exercise-category.enum';
import { PatientExercise } from '../../modules/patient-exercises/entities/patient-exercise.entity';
import { PatientExerciseStatus, PriorityLevel } from '../../modules/patient-exercises/interfaces/patient-exercise-status.enum';
import { Progress } from '../../modules/progress/entities/progress.entity';
import { ProgressType } from '../../modules/progress/interfaces/progress-type.enum';
import { Appointment } from '../../modules/appointments/entities/appointment.entity';
import { AppointmentType, AppointmentStatus } from '../../modules/appointments/interfaces/appointment-status.enum';
import { Notification } from '../../modules/notifications/entities/notification.entity';
import { NotificationType } from '../../modules/notifications/interfaces/notification-type.enum';
import * as bcrypt from 'bcrypt';
import { dataSourceOptions } from '../../config/data-source';

/**
 * SCRIPT DE PEUPLEMENT DE LA BASE DE DONNÉES
 * 
 * Ce script remplit la base de données avec des données de test initiales.
 * Il vérifie si les données existent déjà avant de les créer pour éviter les doublons.
 * 
 * POURQUOI CETTE APPROCHE ?
 * - Idempotent : Peut être exécuté plusieurs fois sans causer d'erreurs
 * - Sécurisé : Vérifie l'existence des données avant l'insertion
 * - Complet : Crée des utilisateurs, patients, exercices, assignations,
 *   enregistrements de progrès, rendez-vous ET notifications
 * 
 * LE FLUX :
 * 1. Connexion à la base de données
 * 2. Vérification de l'existence des utilisateurs → création si nécessaire
 * 3. Vérification de l'existence des patients → création si nécessaire
 * 4. Vérification de l'existence des exercices → création si nécessaire
 * 5. Vérification de l'existence des assignations → création si nécessaire
 * 6. Vérification de l'existence des enregistrements de progrès → création si nécessaire
 * 7. Vérification de l'existence des rendez-vous → création si nécessaire
 * 8. Vérification de l'existence des notifications → création si nécessaire
 * 9. Affichage des identifiants de test pour les développeurs
 */
async function seed() {
  console.log('🚀 Démarrage du peuplement de la base de données...');
  
  // 1. Établir la connexion à la base de données
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();
  console.log('✅ Base de données connectée');

  // 2. Obtenir les repositories pour nos entités
  const userRepository = dataSource.getRepository(User);
  const patientRepository = dataSource.getRepository(Patient);
  const exerciseRepository = dataSource.getRepository(Exercise);
  const patientExerciseRepository = dataSource.getRepository(PatientExercise);
  const progressRepository = dataSource.getRepository(Progress);
  const appointmentRepository = dataSource.getRepository(Appointment);
  const notificationRepository = dataSource.getRepository(Notification);

  // 3. Vérifier les données existantes
  const userCount = await userRepository.count();
  const patientCount = await patientRepository.count();
  const exerciseCount = await exerciseRepository.count();
  const assignmentCount = await patientExerciseRepository.count();
  const progressCount = await progressRepository.count();
  const appointmentCount = await appointmentRepository.count();
  const notificationCount = await notificationRepository.count();
  
  console.log(`📊 État actuel : ${userCount} utilisateurs, ${patientCount} patients, ${exerciseCount} exercices, ${assignmentCount} assignations, ${progressCount} enregistrements de progrès, ${appointmentCount} rendez-vous, ${notificationCount} notifications`);

  // 4. Variables pour stocker nos utilisateurs (nécessaires pour la création des patients et exercices)
  let orthophoniste: User | null = null;
  let parent1: User | null = null;
  let parent2: User | null = null;

  // 5. CRÉER LES UTILISATEURS (uniquement s'ils n'existent pas)
  if (userCount === 0) {
    console.log('👤 Création des utilisateurs...');
    
    // Hasher le mot de passe une fois et le réutiliser
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Créer les instances d'utilisateurs (non sauvegardées encore)
    orthophoniste = userRepository.create({
      email: 'dr.sarah@ortho.fr',
      password: hashedPassword,
      name: 'Dr. Sarah',
      role: UserRole.ORTHOPHONISTE,
      isActive: true,
      specialization: 'Orthophonie Pédiatrique',
      licenseNumber: '12345',
    });

    parent1 = userRepository.create({
      email: 'david.martin@email.com',
      password: hashedPassword,
      name: 'David Martin',
      role: UserRole.PARENT,
      isActive: true,
      childName: 'Emma Martin',
      childId: 'patient_1',
    });

    parent2 = userRepository.create({
      email: 'sophie.dupont@email.com',
      password: hashedPassword,
      name: 'Sophie Dupont',
      role: UserRole.PARENT,
      isActive: true,
      childName: 'Noah Dupont',
      childId: 'patient_2',
    });

    // Sauvegarder tous les utilisateurs dans la base de données
    await userRepository.save([orthophoniste, parent1, parent2]);
    console.log('✅ Utilisateurs créés avec succès !');
    
  } else {
    // Les utilisateurs existent déjà - les récupérer de la base de données
    console.log('👤 Les utilisateurs existent déjà. Récupération des utilisateurs existants...');
    const users = await userRepository.find();
    
    orthophoniste = users.find(u => u.role === UserRole.ORTHOPHONISTE) || null;
    parent1 = users.find(u => u.email === 'david.martin@email.com') || null;
    parent2 = users.find(u => u.email === 'sophie.dupont@email.com') || null;
    
    // Vérifier que tous les utilisateurs requis existent
    if (!orthophoniste || !parent1 || !parent2) {
      console.error('❌ Utilisateurs requis non trouvés dans la base de données !');
      console.log('💡 Astuce : Exécutez DELETE FROM users; dans psql et relancez ce script');
      await dataSource.destroy();
      return;
    }
    console.log('✅ Utilisateurs récupérés avec succès !');
  }

  // 6. CRÉER LES PATIENTS (uniquement s'ils n'existent pas)
  if (patientCount === 0 && orthophoniste && parent1 && parent2) {
    console.log('👶 Création des patients...');

    // Patient 1 : Emma (enfant de David)
    const patient1 = patientRepository.create({
      firstName: 'Emma',
      lastName: 'Martin',
      dateOfBirth: new Date('2018-05-15'),
      gender: Gender.FEMALE,
      parentId: parent1.id,
      orthophonisteId: orthophoniste.id,
      diagnosis: 'Retard de langage',
      medicalHistory: 'Pas d\'antécédents médicaux significatifs',
      allergies: ['Cacahuètes'],
      medications: [],
      therapyGoals: ['Améliorer la prononciation', 'Élargir le vocabulaire'],
      therapyFrequency: '2 fois par semaine',
      therapyDuration: 6,
      emergencyContact: {
        name: 'David Martin',
        relationship: 'Père',
        phone: '+1234567890',
      },
      status: PatientStatus.ACTIVE,
      notes: 'L\'évaluation initiale montre des progrès prometteurs. Séances régulières recommandées.',
    });

    // Patient 2 : Noah (enfant de Sophie)
    const patient2 = patientRepository.create({
      firstName: 'Noah',
      lastName: 'Dupont',
      dateOfBirth: new Date('2019-08-22'),
      gender: Gender.MALE,
      parentId: parent2.id,
      orthophonisteId: orthophoniste.id,
      diagnosis: 'Trouble de l\'articulation',
      medicalHistory: 'Infections de l\'oreille fréquentes dans la petite enfance',
      allergies: [],
      medications: [],
      therapyGoals: ['Améliorer l\'articulation', 'Clarté de la parole'],
      therapyFrequency: '3 fois par semaine',
      therapyDuration: 4,
      emergencyContact: {
        name: 'Sophie Dupont',
        relationship: 'Mère',
        phone: '+9876543210',
      },
      status: PatientStatus.ACTIVE,
      notes: 'Problèmes d\'articulation avec les sons /r/ et /s/. Progrès encourageants.',
    });

    // Sauvegarder les patients dans la base de données
    await patientRepository.save([patient1, patient2]);
    console.log('✅ Patients créés avec succès !');
    
  } else if (patientCount > 0) {
    console.log('👶 Les patients existent déjà. Création des patients ignorée.');
  } else {
    console.log('⚠️ Impossible de créer les patients - utilisateurs non trouvés');
  }

  // 7. CRÉER LES EXERCICES (uniquement s'ils n'existent pas ET que l'orthophoniste existe)
  if (exerciseCount === 0 && orthophoniste) {
    console.log('📚 Création des exercices...');

    // Exercice 1 : Pratique de la prononciation
    const exercise1 = exerciseRepository.create({
      title: 'Pratique de la prononciation - Son /r/',
      description: 'Pratiquez le son /r/ avec ces virelangues et exercices',
      category: ExerciseCategory.PRONUNCIATION,
      difficulty: ExerciseDifficulty.INTERMEDIATE,
      instructions: 'Répétez chaque mot 5 fois : rouge, rire, rond, route, rocher. Puis essayez le virelangue : "Dans la rue, le rat regarde la robe rouge."',
      materials: ['Flashcards', 'Dispositif d\'enregistrement audio'],
      duration: 15,
      tags: ['prononciation', 'son-r', 'virelangues'],
      isActive: true,
      createdBy: orthophoniste.id,
    });

    // Exercice 2 : Construction du vocabulaire
    const exercise2 = exerciseRepository.create({
      title: 'Construction du vocabulaire - Mots de la nourriture',
      description: 'Apprenez et pratiquez le vocabulaire lié à la nourriture',
      category: ExerciseCategory.VOCABULARY,
      difficulty: ExerciseDifficulty.BEGINNER,
      instructions: 'Regardez chaque image et dites le mot. Puis utilisez-le dans une phrase : "J\'aime [aliment]."',
      materials: ['Flashcards illustrés', 'Tableau blanc'],
      duration: 20,
      tags: ['vocabulaire', 'nourriture', 'débutants'],
      isActive: true,
      createdBy: orthophoniste.id,
    });

    // Exercice 3 : Pratique de la grammaire
    const exercise3 = exerciseRepository.create({
      title: 'Grammaire - Pratique du passé composé',
      description: 'Pratiquez l\'utilisation du passé composé dans les phrases',
      category: ExerciseCategory.GRAMMAR,
      difficulty: ExerciseDifficulty.INTERMEDIATE,
      instructions: 'Transformez ces phrases au présent en passé composé : "Je mange une pomme" → "J\'ai mangé une pomme"',
      materials: ['Fiches d\'exercices', 'Outils d\'écriture'],
      duration: 25,
      tags: ['grammaire', 'passé-composé', 'verbes'],
      isActive: true,
      createdBy: orthophoniste.id,
    });

    // Exercice 4 : Pratique de la compréhension
    const exercise4 = exerciseRepository.create({
      title: 'Compréhension écrite - Petites histoires',
      description: 'Pratiquez la compréhension de lecture avec de courtes histoires',
      category: ExerciseCategory.COMPREHENSION,
      difficulty: ExerciseDifficulty.BEGINNER,
      instructions: 'Lisez la petite histoire et répondez aux questions qui suivent.',
      materials: ['Cartes d\'histoires', 'Feuilles de questions'],
      duration: 20,
      tags: ['compréhension', 'lecture', 'histoires'],
      isActive: true,
      createdBy: orthophoniste.id,
    });

    // Exercice 5 : Pratique de l'articulation
    const exercise5 = exerciseRepository.create({
      title: 'Articulation - Pratique du son /s/',
      description: 'Pratiquez le son /s/ avec des paires minimales',
      category: ExerciseCategory.ARTICULATION,
      difficulty: ExerciseDifficulty.INTERMEDIATE,
      instructions: 'Pratiquez ces paires minimales : "si" vs "zi", "sable" vs "zèbre"',
      materials: ['Cartes de paires minimales', 'Miroir'],
      duration: 15,
      tags: ['articulation', 'son-s', 'paires-minimales'],
      isActive: true,
      createdBy: orthophoniste.id,
    });

    // Sauvegarder tous les exercices dans la base de données
    await exerciseRepository.save([exercise1, exercise2, exercise3, exercise4, exercise5]);
    console.log('✅ Exercices créés avec succès !');
    
  } else if (exerciseCount > 0) {
    console.log('📚 Les exercices existent déjà. Création des exercices ignorée.');
  } else {
    console.log('⚠️ Impossible de créer les exercices - orthophoniste non trouvé');
  }

  // 8. CRÉER LES ASSIGNATIONS PATIENT-EXERCICE (uniquement si elles n'existent pas)
  if (assignmentCount === 0 && orthophoniste) {
    console.log('📝 Assignation des exercices aux patients...');

    // Récupérer les patients
    const patients = await patientRepository.find({ relations: { parent: true } });
    const emma = patients.find(p => p.firstName === 'Emma');
    const noah = patients.find(p => p.firstName === 'Noah');

    // Récupérer les exercices
    const exercises = await exerciseRepository.find();
    const pronunciationExercise = exercises.find(e => e.category === 'pronunciation');
    const vocabularyExercise = exercises.find(e => e.category === 'vocabulary');
    const grammarExercise = exercises.find(e => e.category === 'grammar');

    if (emma && noah && orthophoniste && pronunciationExercise && vocabularyExercise && grammarExercise) {
      // Assigner des exercices à Emma
      const assignment1 = patientExerciseRepository.create({
        patientId: emma.id,
        exerciseId: pronunciationExercise.id,
        assignedBy: orthophoniste.id,
        assignedDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours à partir de maintenant
        priority: PriorityLevel.HIGH,
        status: PatientExerciseStatus.ASSIGNED,
        notes: 'Se concentrer sur la prononciation du son /r/',
        progressLogs: [
          {
            date: new Date(),
            status: 'assigned',
            notes: 'Exercice assigné par Dr. Sarah',
          },
        ],
      });

      const assignment2 = patientExerciseRepository.create({
        patientId: emma.id,
        exerciseId: vocabularyExercise.id,
        assignedBy: orthophoniste.id,
        assignedDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours à partir de maintenant
        priority: PriorityLevel.MEDIUM,
        status: PatientExerciseStatus.IN_PROGRESS,
        notes: 'Pratiquer le vocabulaire de la nourriture quotidiennement',
        performance: {
          score: 75,
          attempts: 2,
        },
        progressLogs: [
          {
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            status: 'in-progress',
            notes: 'Premier essai : 70% de précision',
            score: 70,
          },
          {
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            status: 'in-progress',
            notes: 'Deuxième essai : 80% de précision, progression !',
            score: 80,
          },
        ],
      });

      // Assigner des exercices à Noah
      const assignment3 = patientExerciseRepository.create({
        patientId: noah.id,
        exerciseId: grammarExercise.id,
        assignedBy: orthophoniste.id,
        assignedDate: new Date(),
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 jours à partir de maintenant
        priority: PriorityLevel.HIGH,
        status: PatientExerciseStatus.ASSIGNED,
        notes: 'Se concentrer sur la conjugaison du passé composé',
        progressLogs: [
          {
            date: new Date(),
            status: 'assigned',
            notes: 'Exercice assigné par Dr. Sarah',
          },
        ],
      });

      await patientExerciseRepository.save([assignment1, assignment2, assignment3]);
      console.log('✅ Exercices assignés aux patients avec succès !');
    } else {
      console.log('⚠️ Impossible d\'assigner les exercices - patients ou exercices manquants');
    }
  } else if (assignmentCount > 0) {
    console.log('📝 Les assignations patient-exercice existent déjà. Création des assignations ignorée.');
  }

  // ==========================================
  // 9. CRÉER LES ENREGISTREMENTS DE PROGRÈS (uniquement s'ils n'existent pas)
  // ==========================================
  if (orthophoniste) {
    console.log('📊 Création des enregistrements de progrès...');

    const patients = await patientRepository.find({ relations: { parent: true } });
    const emma = patients.find(p => p.firstName === 'Emma');
    const noah = patients.find(p => p.firstName === 'Noah');

    if (emma && noah) {
      const progressCountCheck = await progressRepository.count();
      
      if (progressCountCheck === 0) {
        // Enregistrements de progrès pour Emma
        const emmaProgress1 = progressRepository.create({
          patientId: emma.id,
          recordedBy: orthophoniste.id,
          recordDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          type: ProgressType.OVERALL,
          scores: {
            pronunciationScore: 60,
            vocabularyScore: 70,
            grammarScore: 55,
            comprehensionScore: 65,
            fluencyScore: 50,
            overallScore: 60,
          },
          notes: 'Évaluation initiale. La patiente montre du potentiel mais a besoin de travailler sur la fluidité.',
          strengths: ['Bonne base de vocabulaire', 'Motivée à apprendre'],
          areasForImprovement: ['Fluidité', 'Grammaire', 'Prononciation du son /r/'],
          nextGoals: [
            {
              description: 'Améliorer la prononciation du son /r/',
              status: 'in-progress',
              targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            },
            {
              description: 'Améliorer la fluidité en conversation',
              status: 'not-started',
              targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            },
          ],
          therapyPlanAdjustments: 'Commencer avec 2 séances par semaine',
          recommendedFrequency: '2 fois par semaine',
          therapyDuration: 6,
        });

        const emmaProgress2 = progressRepository.create({
          patientId: emma.id,
          recordedBy: orthophoniste.id,
          recordDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          type: ProgressType.OVERALL,
          scores: {
            pronunciationScore: 75,
            vocabularyScore: 80,
            grammarScore: 65,
            comprehensionScore: 75,
            fluencyScore: 60,
            overallScore: 71,
          },
          notes: 'Bonne amélioration de la prononciation. Le son /r/ devient plus clair.',
          strengths: ['Prononciation améliorée', 'Meilleure compréhension'],
          areasForImprovement: ['Fluidité à travailler', 'Grammaire'],
          nextGoals: [
            {
              description: 'Améliorer la prononciation du son /r/',
              status: 'in-progress',
              targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            },
            {
              description: 'Maîtriser les verbes au passé composé',
              status: 'in-progress',
              targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          ],
          therapyPlanAdjustments: 'Augmenter à 3 séances par semaine',
          recommendedFrequency: '3 fois par semaine',
          therapyDuration: 6,
        });

        const emmaProgress3 = progressRepository.create({
          patientId: emma.id,
          recordedBy: orthophoniste.id,
          recordDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          type: ProgressType.OVERALL,
          scores: {
            pronunciationScore: 85,
            vocabularyScore: 85,
            grammarScore: 75,
            comprehensionScore: 80,
            fluencyScore: 70,
            overallScore: 79,
          },
          notes: 'Progrès excellents ! La prononciation s\'est considérablement améliorée.',
          strengths: ['Excellente prononciation', 'Bon vocabulaire', 'Fluidité améliorée'],
          areasForImprovement: ['Grammaire', 'Phrases complexes'],
          nextGoals: [
            {
              description: 'Maîtriser les verbes au passé composé',
              status: 'in-progress',
              targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            },
            {
              description: 'Améliorer la structure des phrases complexes',
              status: 'not-started',
              targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            },
          ],
          therapyPlanAdjustments: 'Continuer 3 séances par semaine, se concentrer sur la grammaire',
          recommendedFrequency: '3 fois par semaine',
          therapyDuration: 4,
        });

        // Enregistrements de progrès pour Noah
        const noahProgress1 = progressRepository.create({
          patientId: noah.id,
          recordedBy: orthophoniste.id,
          recordDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          type: ProgressType.OVERALL,
          scores: {
            pronunciationScore: 50,
            vocabularyScore: 60,
            grammarScore: 45,
            comprehensionScore: 55,
            fluencyScore: 40,
            overallScore: 50,
          },
          notes: 'Évaluation initiale. Problèmes d\'articulation avec les sons /s/ et /r/.',
          strengths: ['Bonne compréhension', 'Coopératif'],
          areasForImprovement: ['Articulation', 'Fluidité', 'Prononciation'],
          nextGoals: [
            {
              description: 'Améliorer l\'articulation du son /s/',
              status: 'in-progress',
              targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            },
            {
              description: 'Améliorer l\'articulation du son /r/',
              status: 'not-started',
              targetDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
            },
          ],
          therapyPlanAdjustments: 'Commencer avec 2 séances par semaine',
          recommendedFrequency: '2 fois par semaine',
          therapyDuration: 8,
        });

        const noahProgress2 = progressRepository.create({
          patientId: noah.id,
          recordedBy: orthophoniste.id,
          recordDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          type: ProgressType.OVERALL,
          scores: {
            pronunciationScore: 65,
            vocabularyScore: 70,
            grammarScore: 55,
            comprehensionScore: 65,
            fluencyScore: 50,
            overallScore: 61,
          },
          notes: 'Amélioration du son /s/. Début du travail sur le son /r/.',
          strengths: ['Articulation améliorée', 'Meilleure fluidité'],
          areasForImprovement: ['Son /r/', 'Grammaire'],
          nextGoals: [
            {
              description: 'Améliorer l\'articulation du son /s/',
              status: 'achieved',
              targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
              achievedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            },
            {
              description: 'Améliorer l\'articulation du son /r/',
              status: 'in-progress',
              targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            },
          ],
          therapyPlanAdjustments: 'Augmenter à 3 séances par semaine pour le son /r/',
          recommendedFrequency: '3 fois par semaine',
          therapyDuration: 6,
        });

        await progressRepository.save([
          emmaProgress1,
          emmaProgress2,
          emmaProgress3,
          noahProgress1,
          noahProgress2,
        ]);
        console.log('✅ Enregistrements de progrès créés avec succès !');
      } else {
        console.log('📊 Les enregistrements de progrès existent déjà. Création des progrès ignorée.');
      }
    } else {
      console.log('⚠️ Impossible de créer les enregistrements de progrès - patients non trouvés');
    }
  }

  // ==========================================
  // 10. CRÉER LES RENDEZ-VOUS (uniquement s'ils n'existent pas)
  // ==========================================
  if (orthophoniste) {
    console.log('📅 Création des rendez-vous...');

    const patients = await patientRepository.find({ relations: { parent: true } });
    const emma = patients.find(p => p.firstName === 'Emma');
    const noah = patients.find(p => p.firstName === 'Noah');

    if (emma && noah) {
      const appointmentCountCheck = await appointmentRepository.count();
      
      if (appointmentCountCheck === 0) {
        // Rendez-vous pour Emma
        const emmaAppointment1 = appointmentRepository.create({
          patientId: emma.id,
          orthophonisteId: orthophoniste.id,
          dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 jours à partir de maintenant
          duration: 30,
          type: AppointmentType.THERAPY_SESSION,
          status: AppointmentStatus.SCHEDULED,
          location: 'Cabinet - Salle 101',
          isVirtual: false,
          notes: 'Se concentrer sur la prononciation du son /r/',
        });

        const emmaAppointment2 = appointmentRepository.create({
          patientId: emma.id,
          orthophonisteId: orthophoniste.id,
          dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 jours à partir de maintenant
          duration: 30,
          type: AppointmentType.THERAPY_SESSION,
          status: AppointmentStatus.SCHEDULED,
          location: 'Cabinet - Salle 101',
          isVirtual: false,
          notes: 'Continuer le travail de prononciation, introduire le vocabulaire',
        });

        const emmaAppointment3 = appointmentRepository.create({
          patientId: emma.id,
          orthophonisteId: orthophoniste.id,
          dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 jours avant
          duration: 45,
          type: AppointmentType.INITIAL_ASSESSMENT,
          status: AppointmentStatus.COMPLETED,
          location: 'Cabinet - Salle 101',
          isVirtual: false,
          notes: 'Évaluation initiale terminée. Diagnostic : Retard de langage',
          sessionNotes: [
            {
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              notes: 'Évaluation initiale terminée. La patiente montre un bon potentiel.',
              duration: 45,
              topics: ['Évaluation', 'Antécédents du patient'],
              progress: 'Base de référence établie',
              nextSteps: 'Démarrer les séances de thérapie régulières',
            },
          ],
        });

        // Rendez-vous pour Noah
        const noahAppointment1 = appointmentRepository.create({
          patientId: noah.id,
          orthophonisteId: orthophoniste.id,
          dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 jours à partir de maintenant
          duration: 30,
          type: AppointmentType.THERAPY_SESSION,
          status: AppointmentStatus.SCHEDULED,
          location: 'Visioconférence',
          isVirtual: true,
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          notes: 'Séance en visio axée sur l\'articulation',
        });

        const noahAppointment2 = appointmentRepository.create({
          patientId: noah.id,
          orthophonisteId: orthophoniste.id,
          dateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 jour avant
          duration: 30,
          type: AppointmentType.FOLLOW_UP,
          status: AppointmentStatus.COMPLETED,
          location: 'Visioconférence',
          isVirtual: true,
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          sessionNotes: [
            {
              date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              notes: 'Bon progrès sur le son /s/. Début du travail sur le son /r/.',
              duration: 30,
              topics: ['Articulation', 'Pratique du son /s/'],
              progress: 'Le patient peut maintenant produire le son /s/ correctement',
              nextSteps: 'Continuer la pratique du son /r/',
            },
          ],
        });

        await appointmentRepository.save([
          emmaAppointment1,
          emmaAppointment2,
          emmaAppointment3,
          noahAppointment1,
          noahAppointment2,
        ]);
        console.log('✅ Rendez-vous créés avec succès !');
      } else {
        console.log('📅 Les rendez-vous existent déjà. Création des rendez-vous ignorée.');
      }
    } else {
      console.log('⚠️ Impossible de créer les rendez-vous - patients non trouvés');
    }
  }

  // ==========================================
  // 11. CRÉER LES NOTIFICATIONS (uniquement si elles n'existent pas)
  // ==========================================
  if (orthophoniste && parent1 && parent2) {
    console.log('🔔 Création des notifications...');

    const notificationCountCheck = await notificationRepository.count();
    
    if (notificationCountCheck === 0) {
      // Notifications pour l'Orthophoniste
      const orthoNotifications = [
        {
          userId: orthophoniste.id,
          type: NotificationType.SYSTEM,
          title: 'Bienvenue sur Orthovoix !',
          message: 'Bienvenue Dr. Sarah ! Vous êtes maintenant prêt à gérer vos patients et exercices.',
          actionUrl: '/dashboard',
          read: false,
        },
        {
          userId: orthophoniste.id,
          type: NotificationType.PATIENT,
          title: 'Nouveaux patients assignés',
          message: '2 nouveaux patients vous ont été assignés : Emma Martin et Noah Dupont.',
          actionUrl: '/patients',
          read: false,
        },
        {
          userId: orthophoniste.id,
          type: NotificationType.APPOINTMENT,
          title: 'Rendez-vous à venir',
          message: 'Vous avez 3 rendez-vous cette semaine. Consultez votre emploi du temps.',
          actionUrl: '/appointments',
          read: false,
        },
        {
          userId: orthophoniste.id,
          type: NotificationType.EXERCISE,
          title: 'Exercices prêts',
          message: 'Vous avez 5 exercices prêts à être assignés à vos patients.',
          actionUrl: '/exercises',
          read: false,
        },
      ];

      // Notifications pour le Parent 1 (David)
      const parent1Notifications = [
        {
          userId: parent1.id,
          type: NotificationType.SYSTEM,
          title: 'Bienvenue sur Orthovoix !',
          message: 'Bienvenue David ! Vous pouvez maintenant suivre les progrès de votre enfant Emma.',
          actionUrl: '/dashboard',
          read: false,
        },
        {
          userId: parent1.id,
          type: NotificationType.APPOINTMENT,
          title: 'Rendez-vous planifié',
          message: 'Emma a un rendez-vous planifié dans 3 jours au Cabinet - Salle 101.',
          actionUrl: '/appointments',
          read: false,
        },
        {
          userId: parent1.id,
          type: NotificationType.EXERCISE_ASSIGNED,
          title: 'Nouvel exercice assigné',
          message: 'Un nouvel exercice "Pratique de la prononciation - Son /r/" a été assigné à Emma.',
          actionUrl: '/patient-exercises',
          read: false,
        },
        {
          userId: parent1.id,
          type: NotificationType.PROGRESS_UPDATED,
          title: 'Mise à jour des progrès',
          message: 'Les progrès d\'Emma ont été mis à jour. Score global actuel : 79%.',
          actionUrl: '/progress/patient',
          read: false,
        },
      ];

      // Notifications pour le Parent 2 (Sophie)
      const parent2Notifications = [
        {
          userId: parent2.id,
          type: NotificationType.SYSTEM,
          title: 'Bienvenue sur Orthovoix !',
          message: 'Bienvenue Sophie ! Vous pouvez maintenant suivre les progrès de votre enfant Noah.',
          actionUrl: '/dashboard',
          read: false,
        },
        {
          userId: parent2.id,
          type: NotificationType.APPOINTMENT,
          title: 'Rendez-vous en visio planifié',
          message: 'Noah a un rendez-vous en visioconférence planifié dans 5 jours.',
          actionUrl: '/appointments',
          read: false,
        },
        {
          userId: parent2.id,
          type: NotificationType.EXERCISE_ASSIGNED,
          title: 'Nouvel exercice assigné',
          message: 'Un nouvel exercice "Grammaire - Pratique du passé composé" a été assigné à Noah.',
          actionUrl: '/patient-exercises',
          read: false,
        },
        {
          userId: parent2.id,
          type: NotificationType.REMINDER,
          title: 'Exercice bientôt dû',
          message: 'L\'exercice de grammaire de Noah est dû dans 10 jours. Aidez-le à pratiquer.',
          actionUrl: '/patient-exercises',
          read: false,
        },
      ];

      // Créer toutes les notifications
      const allNotifications = [
        ...orthoNotifications,
        ...parent1Notifications,
        ...parent2Notifications,
      ];

      for (const notif of allNotifications) {
        const notification = notificationRepository.create(notif);
        await notificationRepository.save(notification);
      }

      console.log('✅ Notifications créées avec succès !');
    } else {
      console.log('🔔 Les notifications existent déjà. Création des notifications ignorée.');
    }
  }

  // 12. AFFICHER LES RÉSULTATS
  console.log('\n' + '='.repeat(60));
  console.log('✅ PEUPLEMENT TERMINÉ AVEC SUCCÈS !');
  console.log('='.repeat(60));
  
  console.log('\n📋 IDENTIFIANTS DE TEST :');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('🔵 Orthophoniste (Admin) :');
  console.log('   Email : dr.sarah@ortho.fr');
  console.log('   Mot de passe : Password123!');
  console.log('');
  console.log('🟢 Parent 1 :');
  console.log('   Email : david.martin@email.com');
  console.log('   Mot de passe : Password123!');
  console.log('   Enfant : Emma Martin');
  console.log('');
  console.log('🟢 Parent 2 :');
  console.log('   Email : sophie.dupont@email.com');
  console.log('   Mot de passe : Password123!');
  console.log('   Enfant : Noah Dupont');
  console.log('─────────────────────────────────────────────────────────────');

  // 13. Afficher ce qui a été créé
  if (patientCount === 0 && orthophoniste && parent1 && parent2) {
    const patients = await patientRepository.find({
      relations: {
        parent: true,
        orthophoniste: true,
      },
    });
    
    if (patients.length > 0) {
      console.log('\n👶 PATIENTS CRÉÉS :');
      patients.forEach(p => {
        console.log(`   - ${p.firstName} ${p.lastName}`);
        console.log(`     Parent : ${p.parent?.name || 'Inconnu'}`);
        console.log(`     Thérapeute : ${p.orthophoniste?.name || 'Inconnu'}`);
        console.log(`     Statut : ${p.status}`);
        console.log('');
      });
    }
  }

  // 14. Afficher les exercices créés
  if (exerciseCount === 0 && orthophoniste) {
    const exercises = await exerciseRepository.find({
      relations: {
        creator: true,
      },
    });
    
    if (exercises.length > 0) {
      console.log('\n📚 EXERCICES CRÉÉS :');
      exercises.forEach(e => {
        console.log(`   - ${e.title} (${e.category} - ${e.difficulty})`);
        console.log(`     Créé par : ${e.creator?.name || 'Inconnu'}`);
        console.log('');
      });
    }
  }

  // 15. Afficher les assignations créées
  if (assignmentCount === 0) {
    const assignments = await patientExerciseRepository.find({
      relations: {
        patient: true,
        exercise: true,
        assigner: true,
      },
    });
    
    if (assignments.length > 0) {
      console.log('\n📝 ASSIGNATIONS CRÉÉES :');
      assignments.forEach(a => {
        console.log(`   - ${a.exercise?.title || 'Inconnu'} → ${a.patient?.firstName || 'Inconnu'} ${a.patient?.lastName || ''}`);
        console.log(`     Statut : ${a.status} | Priorité : ${a.priority}`);
        console.log(`     Assigné par : ${a.assigner?.name || 'Inconnu'}`);
        console.log('');
      });
    }
  }

  // 16. Afficher les enregistrements de progrès créés
  if (progressCount === 0 && orthophoniste) {
    const progressRecords = await progressRepository.find({
      relations: {
        patient: true,
        recorder: true,
      },
    });
    
    if (progressRecords.length > 0) {
      console.log('\n📊 ENREGISTREMENTS DE PROGRÈS CRÉÉS :');
      progressRecords.forEach(p => {
        console.log(`   - ${p.patient?.firstName || 'Inconnu'} ${p.patient?.lastName || ''} (${p.type})`);
        console.log(`     Score global : ${p.scores?.overallScore || 'N/A'}`);
        console.log(`     Enregistré par : ${p.recorder?.name || 'Inconnu'}`);
        console.log(`     Date : ${new Date(p.recordDate).toLocaleDateString()}`);
        console.log('');
      });
    }
  }

  // 17. Afficher les rendez-vous créés
  if (appointmentCount === 0 && orthophoniste) {
    const appointments = await appointmentRepository.find({
      relations: {
        patient: true,
        orthophoniste: true,
      },
    });
    
    if (appointments.length > 0) {
      console.log('\n📅 RENDEZ-VOUS CRÉÉS :');
      appointments.forEach(a => {
        console.log(`   - ${a.patient?.firstName || 'Inconnu'} ${a.patient?.lastName || ''} (${a.type})`);
        console.log(`     Date : ${new Date(a.dateTime).toLocaleString()}`);
        console.log(`     Statut : ${a.status}`);
        console.log(`     Lieu : ${a.location || 'Visioconférence'}`);
        console.log('');
      });
    }
  }

  // 18. Afficher les notifications créées
  if (notificationCount === 0) {
    const notifications = await notificationRepository.find({
      relations: {
        user: true,
      },
    });
    
    if (notifications.length > 0) {
      console.log('\n🔔 NOTIFICATIONS CRÉÉES :');
      notifications.forEach(n => {
        console.log(`   - ${n.title}`);
        console.log(`     Pour : ${n.user?.name || 'Inconnu'}`);
        console.log(`     Type : ${n.type}`);
        console.log(`     Lu : ${n.read ? 'Oui' : 'Non'}`);
        console.log('');
      });
    }
  }

  // 19. Fermer la connexion
  await dataSource.destroy();
  console.log('🔌 Connexion à la base de données fermée');
  console.log('\n🎉 Prêt à commencer les tests !');
}

// Exécuter le script avec gestion des erreurs
seed().catch((error) => {
  console.error('❌ PEUPLEMENT ÉCHOUÉ :', error);
  process.exit(1);
});