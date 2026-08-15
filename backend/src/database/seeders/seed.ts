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
 * SEED SCRIPT EXPLANATION:
 * 
 * This script populates the database with initial test data.
 * It checks if data already exists before creating it to avoid duplicates.
 * 
 * WHY THIS APPROACH?
 * - Idempotent: Can be run multiple times without causing errors
 * - Safe: Checks for existing data before inserting
 * - Complete: Creates users, patients, exercises, patient-exercise assignments, 
 *   progress records, appointments, AND notifications
 * 
 * THE FLOW:
 * 1. Connect to database
 * 2. Check if users exist → create if not
 * 3. Check if patients exist → create if not
 * 4. Check if exercises exist → create if not
 * 5. Check if patient-exercise assignments exist → create if not
 * 6. Check if progress records exist → create if not
 * 7. Check if appointments exist → create if not
 * 8. Check if notifications exist → create if not
 * 9. Display test credentials for developers
 */
async function seed() {
  console.log('🚀 Starting database seed...');
  
  // 1. Establish database connection
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();
  console.log('✅ Database connected');

  // 2. Get repositories for our entities
  const userRepository = dataSource.getRepository(User);
  const patientRepository = dataSource.getRepository(Patient);
  const exerciseRepository = dataSource.getRepository(Exercise);
  const patientExerciseRepository = dataSource.getRepository(PatientExercise);
  const progressRepository = dataSource.getRepository(Progress);
  const appointmentRepository = dataSource.getRepository(Appointment);
  const notificationRepository = dataSource.getRepository(Notification);

  // 3. Check what data already exists
  const userCount = await userRepository.count();
  const patientCount = await patientRepository.count();
  const exerciseCount = await exerciseRepository.count();
  const assignmentCount = await patientExerciseRepository.count();
  const progressCount = await progressRepository.count();
  const appointmentCount = await appointmentRepository.count();
  const notificationCount = await notificationRepository.count();
  
  console.log(`📊 Current state: ${userCount} users, ${patientCount} patients, ${exerciseCount} exercises, ${assignmentCount} assignments, ${progressCount} progress records, ${appointmentCount} appointments, ${notificationCount} notifications`);

  // 4. Variables to store our users (needed for patient and exercise creation)
  let orthophoniste: User | null = null;
  let parent1: User | null = null;
  let parent2: User | null = null;

  // 5. CREATE USERS (only if they don't exist)
  if (userCount === 0) {
    console.log('👤 Creating users...');
    
    // Hash the password once and reuse it
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Create user instances (not saved yet)
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

    // Save all users to database
    await userRepository.save([orthophoniste, parent1, parent2]);
    console.log('✅ Users created successfully!');
    
  } else {
    // Users already exist - fetch them from database
    console.log('👤 Users already exist. Fetching existing users...');
    const users = await userRepository.find();
    
    orthophoniste = users.find(u => u.role === UserRole.ORTHOPHONISTE) || null;
    parent1 = users.find(u => u.email === 'david.martin@email.com') || null;
    parent2 = users.find(u => u.email === 'sophie.dupont@email.com') || null;
    
    // Verify all required users exist
    if (!orthophoniste || !parent1 || !parent2) {
      console.error('❌ Required users not found in database!');
      console.log('💡 Tip: Run DELETE FROM users; in psql and re-run this seed');
      await dataSource.destroy();
      return;
    }
    console.log('✅ Users fetched successfully!');
  }

  // 6. CREATE PATIENTS (only if they don't exist)
  if (patientCount === 0 && orthophoniste && parent1 && parent2) {
    console.log('👶 Creating patients...');

    // Patient 1: Emma (David's child)
    const patient1 = patientRepository.create({
      firstName: 'Emma',
      lastName: 'Martin',
      dateOfBirth: new Date('2018-05-15'),
      gender: Gender.FEMALE,
      parentId: parent1.id,
      orthophonisteId: orthophoniste.id,
      diagnosis: 'Speech delay',
      medicalHistory: 'No significant medical history',
      allergies: ['Peanuts'],
      medications: [],
      therapyGoals: ['Improve pronunciation', 'Expand vocabulary'],
      therapyFrequency: '2x per week',
      therapyDuration: 6,
      emergencyContact: {
        name: 'David Martin',
        relationship: 'Father',
        phone: '+1234567890',
      },
      status: PatientStatus.ACTIVE,
      notes: 'Initial assessment shows promise. Regular sessions recommended.',
    });

    // Patient 2: Noah (Sophie's child)
    const patient2 = patientRepository.create({
      firstName: 'Noah',
      lastName: 'Dupont',
      dateOfBirth: new Date('2019-08-22'),
      gender: Gender.MALE,
      parentId: parent2.id,
      orthophonisteId: orthophoniste.id,
      diagnosis: 'Articulation disorder',
      medicalHistory: 'Frequent ear infections in early childhood',
      allergies: [],
      medications: [],
      therapyGoals: ['Improve articulation', 'Speech clarity'],
      therapyFrequency: '3x per week',
      therapyDuration: 4,
      emergencyContact: {
        name: 'Sophie Dupont',
        relationship: 'Mother',
        phone: '+9876543210',
      },
      status: PatientStatus.ACTIVE,
      notes: 'Articulation issues with /r/ and /s/ sounds. Making good progress.',
    });

    // Save patients to database
    await patientRepository.save([patient1, patient2]);
    console.log('✅ Patients created successfully!');
    
  } else if (patientCount > 0) {
    console.log('👶 Patients already exist. Skipping patient creation.');
  } else {
    console.log('⚠️ Could not create patients - users not found');
  }

  // 7. CREATE EXERCISES (only if they don't exist AND orthophoniste exists)
  if (exerciseCount === 0 && orthophoniste) {
    console.log('📚 Creating exercises...');

    // Exercise 1: Pronunciation Practice
    const exercise1 = exerciseRepository.create({
      title: 'Pronunciation Practice - /r/ Sound',
      description: 'Practice the /r/ sound with these tongue twisters and exercises',
      category: ExerciseCategory.PRONUNCIATION,
      difficulty: ExerciseDifficulty.INTERMEDIATE,
      instructions: 'Repeat each word 5 times: red, run, rest, round, right. Then try the tongue twister: "Round the rugged rock the ragged rascal ran."',
      materials: ['Flashcards', 'Audio recording device'],
      duration: 15,
      tags: ['pronunciation', 'r-sound', 'tongue-twisters'],
      isActive: true,
      createdBy: orthophoniste.id,
    });

    // Exercise 2: Vocabulary Building
    const exercise2 = exerciseRepository.create({
      title: 'Vocabulary Building - Food Words',
      description: 'Learn and practice food-related vocabulary',
      category: ExerciseCategory.VOCABULARY,
      difficulty: ExerciseDifficulty.BEGINNER,
      instructions: 'Look at each picture and say the word. Then use it in a sentence: "I like [food]."',
      materials: ['Picture flashcards', 'Whiteboard'],
      duration: 20,
      tags: ['vocabulary', 'food', 'beginners'],
      isActive: true,
      createdBy: orthophoniste.id,
    });

    // Exercise 3: Grammar Practice
    const exercise3 = exerciseRepository.create({
      title: 'Grammar - Past Tense Practice',
      description: 'Practice using past tense verbs in sentences',
      category: ExerciseCategory.GRAMMAR,
      difficulty: ExerciseDifficulty.INTERMEDIATE,
      instructions: 'Change these present tense sentences to past tense: "I walk to school" → "I walked to school"',
      materials: ['Worksheets', 'Writing tools'],
      duration: 25,
      tags: ['grammar', 'past-tense', 'verbs'],
      isActive: true,
      createdBy: orthophoniste.id,
    });

    // Exercise 4: Comprehension Practice
    const exercise4 = exerciseRepository.create({
      title: 'Reading Comprehension - Short Stories',
      description: 'Practice reading comprehension with short stories',
      category: ExerciseCategory.COMPREHENSION,
      difficulty: ExerciseDifficulty.BEGINNER,
      instructions: 'Read the short story and answer the questions that follow.',
      materials: ['Story cards', 'Question sheets'],
      duration: 20,
      tags: ['comprehension', 'reading', 'stories'],
      isActive: true,
      createdBy: orthophoniste.id,
    });

    // Exercise 5: Articulation Practice
    const exercise5 = exerciseRepository.create({
      title: 'Articulation - /s/ Sound Practice',
      description: 'Practice the /s/ sound with minimal pairs',
      category: ExerciseCategory.ARTICULATION,
      difficulty: ExerciseDifficulty.INTERMEDIATE,
      instructions: 'Practice these minimal pairs: "sip" vs "zip", "sink" vs "zink"',
      materials: ['Minimal pair cards', 'Mirror'],
      duration: 15,
      tags: ['articulation', 's-sound', 'minimal-pairs'],
      isActive: true,
      createdBy: orthophoniste.id,
    });

    // Save all exercises to database
    await exerciseRepository.save([exercise1, exercise2, exercise3, exercise4, exercise5]);
    console.log('✅ Exercises created successfully!');
    
  } else if (exerciseCount > 0) {
    console.log('📚 Exercises already exist. Skipping exercise creation.');
  } else {
    console.log('⚠️ Could not create exercises - orthophoniste not found');
  }

  // 8. CREATE PATIENT-EXERCISE ASSIGNMENTS (only if they don't exist)
  if (assignmentCount === 0 && orthophoniste) {
    console.log('📝 Assigning exercises to patients...');

    // Get patients
    const patients = await patientRepository.find({ relations: { parent: true } });
    const emma = patients.find(p => p.firstName === 'Emma');
    const noah = patients.find(p => p.firstName === 'Noah');

    // Get exercises
    const exercises = await exerciseRepository.find();
    const pronunciationExercise = exercises.find(e => e.category === 'pronunciation');
    const vocabularyExercise = exercises.find(e => e.category === 'vocabulary');
    const grammarExercise = exercises.find(e => e.category === 'grammar');

    if (emma && noah && orthophoniste && pronunciationExercise && vocabularyExercise && grammarExercise) {
      // Assign exercises to Emma
      const assignment1 = patientExerciseRepository.create({
        patientId: emma.id,
        exerciseId: pronunciationExercise.id,
        assignedBy: orthophoniste.id,
        assignedDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: PriorityLevel.HIGH,
        status: PatientExerciseStatus.ASSIGNED,
        notes: 'Focus on /r/ sound pronunciation',
        progressLogs: [
          {
            date: new Date(),
            status: 'assigned',
            notes: 'Exercise assigned by Dr. Sarah',
          },
        ],
      });

      const assignment2 = patientExerciseRepository.create({
        patientId: emma.id,
        exerciseId: vocabularyExercise.id,
        assignedBy: orthophoniste.id,
        assignedDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        priority: PriorityLevel.MEDIUM,
        status: PatientExerciseStatus.IN_PROGRESS,
        notes: 'Practice food vocabulary daily',
        performance: {
          score: 75,
          attempts: 2,
        },
        progressLogs: [
          {
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            status: 'in-progress',
            notes: 'First attempt: 70% accuracy',
            score: 70,
          },
          {
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            status: 'in-progress',
            notes: 'Second attempt: 80% accuracy, improving!',
            score: 80,
          },
        ],
      });

      // Assign exercises to Noah
      const assignment3 = patientExerciseRepository.create({
        patientId: noah.id,
        exerciseId: grammarExercise.id,
        assignedBy: orthophoniste.id,
        assignedDate: new Date(),
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        priority: PriorityLevel.HIGH,
        status: PatientExerciseStatus.ASSIGNED,
        notes: 'Focus on past tense verb conjugation',
        progressLogs: [
          {
            date: new Date(),
            status: 'assigned',
            notes: 'Exercise assigned by Dr. Sarah',
          },
        ],
      });

      await patientExerciseRepository.save([assignment1, assignment2, assignment3]);
      console.log('✅ Patient exercises assigned successfully!');
    } else {
      console.log('⚠️ Could not assign exercises - missing patients or exercises');
    }
  } else if (assignmentCount > 0) {
    console.log('📝 Patient-exercise assignments already exist. Skipping assignment creation.');
  }

  // ==========================================
  // 9. CREATE PROGRESS RECORDS (only if they don't exist)
  // ==========================================
  if (orthophoniste) {
    console.log('📊 Creating progress records...');

    const patients = await patientRepository.find({ relations: { parent: true } });
    const emma = patients.find(p => p.firstName === 'Emma');
    const noah = patients.find(p => p.firstName === 'Noah');

    if (emma && noah) {
      const progressCountCheck = await progressRepository.count();
      
      if (progressCountCheck === 0) {
        // Progress records for Emma
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
          notes: 'Initial assessment. Patient shows potential but needs work on fluency.',
          strengths: ['Good vocabulary base', 'Eager to learn'],
          areasForImprovement: ['Fluency', 'Grammar', 'Pronunciation of /r/ sound'],
          nextGoals: [
            {
              description: 'Improve pronunciation of /r/ sound',
              status: 'in-progress',
              targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            },
            {
              description: 'Increase fluency in conversation',
              status: 'not-started',
              targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            },
          ],
          therapyPlanAdjustments: 'Start with 2x per week sessions',
          recommendedFrequency: '2x per week',
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
          notes: 'Good improvement in pronunciation. The /r/ sound is getting better.',
          strengths: ['Improved pronunciation', 'Better comprehension'],
          areasForImprovement: ['Fluency still needs work', 'Grammar'],
          nextGoals: [
            {
              description: 'Improve pronunciation of /r/ sound',
              status: 'in-progress',
              targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            },
            {
              description: 'Master past tense verbs',
              status: 'in-progress',
              targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          ],
          therapyPlanAdjustments: 'Increase to 3x per week',
          recommendedFrequency: '3x per week',
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
          notes: 'Excellent progress! Pronunciation has improved significantly.',
          strengths: ['Great pronunciation', 'Good vocabulary', 'Improved fluency'],
          areasForImprovement: ['Grammar', 'Complex sentences'],
          nextGoals: [
            {
              description: 'Master past tense verbs',
              status: 'in-progress',
              targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            },
            {
              description: 'Improve complex sentence structure',
              status: 'not-started',
              targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            },
          ],
          therapyPlanAdjustments: 'Continue 3x per week, focus on grammar',
          recommendedFrequency: '3x per week',
          therapyDuration: 4,
        });

        // Progress records for Noah
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
          notes: 'Initial assessment. Articulation issues with /s/ and /r/ sounds.',
          strengths: ['Good understanding', 'Cooperative'],
          areasForImprovement: ['Articulation', 'Fluency', 'Pronunciation'],
          nextGoals: [
            {
              description: 'Improve articulation of /s/ sound',
              status: 'in-progress',
              targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            },
            {
              description: 'Improve articulation of /r/ sound',
              status: 'not-started',
              targetDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
            },
          ],
          therapyPlanAdjustments: 'Start with 2x per week sessions',
          recommendedFrequency: '2x per week',
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
          notes: 'Improvement in /s/ sound. Starting to work on /r/ sound.',
          strengths: ['Improved articulation', 'Better fluency'],
          areasForImprovement: ['/r/ sound', 'Grammar'],
          nextGoals: [
            {
              description: 'Improve articulation of /s/ sound',
              status: 'achieved',
              targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
              achievedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            },
            {
              description: 'Improve articulation of /r/ sound',
              status: 'in-progress',
              targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            },
          ],
          therapyPlanAdjustments: 'Increase to 3x per week for /r/ sound practice',
          recommendedFrequency: '3x per week',
          therapyDuration: 6,
        });

        await progressRepository.save([
          emmaProgress1,
          emmaProgress2,
          emmaProgress3,
          noahProgress1,
          noahProgress2,
        ]);
        console.log('✅ Progress records created successfully!');
      } else {
        console.log('📊 Progress records already exist. Skipping progress creation.');
      }
    } else {
      console.log('⚠️ Could not create progress records - patients not found');
    }
  }

  // ==========================================
  // 10. CREATE APPOINTMENTS (only if they don't exist)
  // ==========================================
  if (orthophoniste) {
    console.log('📅 Creating appointments...');

    const patients = await patientRepository.find({ relations: { parent: true } });
    const emma = patients.find(p => p.firstName === 'Emma');
    const noah = patients.find(p => p.firstName === 'Noah');

    if (emma && noah) {
      const appointmentCountCheck = await appointmentRepository.count();
      
      if (appointmentCountCheck === 0) {
        // Appointments for Emma
        const emmaAppointment1 = appointmentRepository.create({
          patientId: emma.id,
          orthophonisteId: orthophoniste.id,
          dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          duration: 30,
          type: AppointmentType.THERAPY_SESSION,
          status: AppointmentStatus.SCHEDULED,
          location: 'Clinic Room 101',
          isVirtual: false,
          notes: 'Focus on pronunciation of /r/ sound',
        });

        const emmaAppointment2 = appointmentRepository.create({
          patientId: emma.id,
          orthophonisteId: orthophoniste.id,
          dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          duration: 30,
          type: AppointmentType.THERAPY_SESSION,
          status: AppointmentStatus.SCHEDULED,
          location: 'Clinic Room 101',
          isVirtual: false,
          notes: 'Continue pronunciation work, introduce vocabulary',
        });

        const emmaAppointment3 = appointmentRepository.create({
          patientId: emma.id,
          orthophonisteId: orthophoniste.id,
          dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          duration: 45,
          type: AppointmentType.INITIAL_ASSESSMENT,
          status: AppointmentStatus.COMPLETED,
          location: 'Clinic Room 101',
          isVirtual: false,
          notes: 'Initial assessment completed. Diagnosis: Speech delay',
          sessionNotes: [
            {
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              notes: 'Completed initial assessment. Patient shows good potential.',
              duration: 45,
              topics: ['Assessment', 'Patient history'],
              progress: 'Baseline established',
              nextSteps: 'Start regular therapy sessions',
            },
          ],
        });

        // Appointments for Noah
        const noahAppointment1 = appointmentRepository.create({
          patientId: noah.id,
          orthophonisteId: orthophoniste.id,
          dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          duration: 30,
          type: AppointmentType.THERAPY_SESSION,
          status: AppointmentStatus.SCHEDULED,
          location: 'Virtual',
          isVirtual: true,
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          notes: 'Virtual session focusing on articulation',
        });

        const noahAppointment2 = appointmentRepository.create({
          patientId: noah.id,
          orthophonisteId: orthophoniste.id,
          dateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          duration: 30,
          type: AppointmentType.FOLLOW_UP,
          status: AppointmentStatus.COMPLETED,
          location: 'Virtual',
          isVirtual: true,
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          sessionNotes: [
            {
              date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              notes: 'Good progress on /s/ sound. Started working on /r/ sound.',
              duration: 30,
              topics: ['Articulation', '/s/ sound practice'],
              progress: 'Patient can now produce /s/ sound correctly',
              nextSteps: 'Continue /r/ sound practice',
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
        console.log('✅ Appointments created successfully!');
      } else {
        console.log('📅 Appointments already exist. Skipping appointment creation.');
      }
    } else {
      console.log('⚠️ Could not create appointments - patients not found');
    }
  }

  // ==========================================
  // 11. CREATE NOTIFICATIONS (only if they don't exist)
  // ==========================================
  if (orthophoniste && parent1 && parent2) {
    console.log('🔔 Creating notifications...');

    const notificationCountCheck = await notificationRepository.count();
    
    if (notificationCountCheck === 0) {
      // Notifications for Orthophoniste
      const orthoNotifications = [
        {
          userId: orthophoniste.id,
          type: NotificationType.SYSTEM,
          title: 'Welcome to Orthovoix!',
          message: 'Welcome Dr. Sarah! You are now ready to manage your patients and exercises.',
          actionUrl: '/dashboard',
          read: false,
        },
        {
          userId: orthophoniste.id,
          type: NotificationType.PATIENT,
          title: 'New Patients Assigned',
          message: 'You have been assigned 2 new patients: Emma Martin and Noah Dupont.',
          actionUrl: '/patients',
          read: false,
        },
        {
          userId: orthophoniste.id,
          type: NotificationType.APPOINTMENT,
          title: 'Upcoming Appointments',
          message: 'You have 3 upcoming appointments this week. Check your schedule.',
          actionUrl: '/appointments',
          read: false,
        },
        {
          userId: orthophoniste.id,
          type: NotificationType.EXERCISE,
          title: 'Exercises Ready',
          message: 'You have 5 exercises ready to assign to your patients.',
          actionUrl: '/exercises',
          read: false,
        },
      ];

      // Notifications for Parent 1 (David)
      const parent1Notifications = [
        {
          userId: parent1.id,
          type: NotificationType.SYSTEM,
          title: 'Welcome to Orthovoix!',
          message: 'Welcome David! You can now track your child Emma\'s progress.',
          actionUrl: '/dashboard',
          read: false,
        },
        {
          userId: parent1.id,
          type: NotificationType.APPOINTMENT,
          title: 'Appointment Scheduled',
          message: 'Emma has an appointment scheduled for 3 days from now at Clinic Room 101.',
          actionUrl: '/appointments',
          read: false,
        },
        {
          userId: parent1.id,
          type: NotificationType.EXERCISE_ASSIGNED,
          title: 'New Exercise Assigned',
          message: 'A new exercise "Pronunciation Practice - /r/ Sound" has been assigned to Emma.',
          actionUrl: '/patient-exercises',
          read: false,
        },
        {
          userId: parent1.id,
          type: NotificationType.PROGRESS_UPDATED,
          title: 'Progress Update',
          message: 'Emma\'s progress has been updated. Current overall score: 79%.',
          actionUrl: '/progress/patient',
          read: false,
        },
      ];

      // Notifications for Parent 2 (Sophie)
      const parent2Notifications = [
        {
          userId: parent2.id,
          type: NotificationType.SYSTEM,
          title: 'Welcome to Orthovoix!',
          message: 'Welcome Sophie! You can now track your child Noah\'s progress.',
          actionUrl: '/dashboard',
          read: false,
        },
        {
          userId: parent2.id,
          type: NotificationType.APPOINTMENT,
          title: 'Virtual Appointment Scheduled',
          message: 'Noah has a virtual appointment scheduled for 5 days from now.',
          actionUrl: '/appointments',
          read: false,
        },
        {
          userId: parent2.id,
          type: NotificationType.EXERCISE_ASSIGNED,
          title: 'New Exercise Assigned',
          message: 'A new exercise "Grammar - Past Tense Practice" has been assigned to Noah.',
          actionUrl: '/patient-exercises',
          read: false,
        },
        {
          userId: parent2.id,
          type: NotificationType.REMINDER,
          title: 'Exercise Due Soon',
          message: 'Noah\'s grammar exercise is due in 10 days. Please help him practice.',
          actionUrl: '/patient-exercises',
          read: false,
        },
      ];

      // Create all notifications
      const allNotifications = [
        ...orthoNotifications,
        ...parent1Notifications,
        ...parent2Notifications,
      ];

      for (const notif of allNotifications) {
        const notification = notificationRepository.create(notif);
        await notificationRepository.save(notification);
      }

      console.log('✅ Notifications created successfully!');
    } else {
      console.log('🔔 Notifications already exist. Skipping notification creation.');
    }
  }

  // 12. DISPLAY RESULTS
  console.log('\n' + '='.repeat(60));
  console.log('✅ SEED COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  
  console.log('\n📋 TEST CREDENTIALS:');
  console.log('─────────────────────────────────────');
  console.log('🔵 Orthophoniste (Admin):');
  console.log('   Email: dr.sarah@ortho.fr');
  console.log('   Password: Password123!');
  console.log('');
  console.log('🟢 Parent 1:');
  console.log('   Email: david.martin@email.com');
  console.log('   Password: Password123!');
  console.log('   Child: Emma Martin');
  console.log('');
  console.log('🟢 Parent 2:');
  console.log('   Email: sophie.dupont@email.com');
  console.log('   Password: Password123!');
  console.log('   Child: Noah Dupont');
  console.log('─────────────────────────────────────');

  // 13. Show what was created
  if (patientCount === 0 && orthophoniste && parent1 && parent2) {
    const patients = await patientRepository.find({
      relations: {
        parent: true,
        orthophoniste: true,
      },
    });
    
    if (patients.length > 0) {
      console.log('\n👶 CREATED PATIENTS:');
      patients.forEach(p => {
        console.log(`   - ${p.firstName} ${p.lastName}`);
        console.log(`     Parent: ${p.parent?.name || 'Unknown'}`);
        console.log(`     Therapist: ${p.orthophoniste?.name || 'Unknown'}`);
        console.log(`     Status: ${p.status}`);
        console.log('');
      });
    }
  }

  // 14. Show created exercises
  if (exerciseCount === 0 && orthophoniste) {
    const exercises = await exerciseRepository.find({
      relations: {
        creator: true,
      },
    });
    
    if (exercises.length > 0) {
      console.log('\n📚 CREATED EXERCISES:');
      exercises.forEach(e => {
        console.log(`   - ${e.title} (${e.category} - ${e.difficulty})`);
        console.log(`     Created by: ${e.creator?.name || 'Unknown'}`);
        console.log('');
      });
    }
  }

  // 15. Show created assignments
  if (assignmentCount === 0) {
    const assignments = await patientExerciseRepository.find({
      relations: {
        patient: true,
        exercise: true,
        assigner: true,
      },
    });
    
    if (assignments.length > 0) {
      console.log('\n📝 CREATED ASSIGNMENTS:');
      assignments.forEach(a => {
        console.log(`   - ${a.exercise?.title || 'Unknown'} → ${a.patient?.firstName || 'Unknown'} ${a.patient?.lastName || ''}`);
        console.log(`     Status: ${a.status} | Priority: ${a.priority}`);
        console.log(`     Assigned by: ${a.assigner?.name || 'Unknown'}`);
        console.log('');
      });
    }
  }

  // 16. Show created progress records
  if (progressCount === 0 && orthophoniste) {
    const progressRecords = await progressRepository.find({
      relations: {
        patient: true,
        recorder: true,
      },
    });
    
    if (progressRecords.length > 0) {
      console.log('\n📊 CREATED PROGRESS RECORDS:');
      progressRecords.forEach(p => {
        console.log(`   - ${p.patient?.firstName || 'Unknown'} ${p.patient?.lastName || ''} (${p.type})`);
        console.log(`     Overall Score: ${p.scores?.overallScore || 'N/A'}`);
        console.log(`     Recorded by: ${p.recorder?.name || 'Unknown'}`);
        console.log(`     Date: ${new Date(p.recordDate).toLocaleDateString()}`);
        console.log('');
      });
    }
  }

  // 17. Show created appointments
  if (appointmentCount === 0 && orthophoniste) {
    const appointments = await appointmentRepository.find({
      relations: {
        patient: true,
        orthophoniste: true,
      },
    });
    
    if (appointments.length > 0) {
      console.log('\n📅 CREATED APPOINTMENTS:');
      appointments.forEach(a => {
        console.log(`   - ${a.patient?.firstName || 'Unknown'} ${a.patient?.lastName || ''} (${a.type})`);
        console.log(`     Date: ${new Date(a.dateTime).toLocaleString()}`);
        console.log(`     Status: ${a.status}`);
        console.log(`     Location: ${a.location || 'Virtual'}`);
        console.log('');
      });
    }
  }

  // 18. Show created notifications
  if (notificationCount === 0) {
    const notifications = await notificationRepository.find({
      relations: {
        user: true,
      },
    });
    
    if (notifications.length > 0) {
      console.log('\n🔔 CREATED NOTIFICATIONS:');
      notifications.forEach(n => {
        console.log(`   - ${n.title}`);
        console.log(`     For: ${n.user?.name || 'Unknown'}`);
        console.log(`     Type: ${n.type}`);
        console.log(`     Read: ${n.read ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
  }

  // 19. Close connection
  await dataSource.destroy();
  console.log('🔌 Database connection closed');
  console.log('\n🎉 Ready to start testing!');
}

// Run the seed with error handling
seed().catch((error) => {
  console.error('❌ SEED FAILED:', error);
  process.exit(1);
});