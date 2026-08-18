import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../modules/users/interfaces/user-roles.enum';
import { Patient } from '../../modules/patients/entities/patient.entity';
import { PatientStatus, Gender } from '../../modules/patients/interfaces/patient-status.enum';
import { Appointment } from '../../modules/appointments/entities/appointment.entity';
import { AppointmentType, AppointmentStatus } from '../../modules/appointments/interfaces/appointment-status.enum';
import { Notification } from '../../modules/notifications/entities/notification.entity';
import { NotificationType } from '../../modules/notifications/interfaces/notification-type.enum';
import * as bcrypt from 'bcrypt';
import { dataSourceOptions } from '../../config/data-source';

/**
 * SEED SCRIPT - Creates test data for development and testing
 * Note: Exercises must be created manually via the admin dashboard
 *       because they require media files (images, audio, video)
 */
async function seed() {
  console.log('🚀 Starting database seed...');
  
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();
  console.log('✅ Database connected');

  const userRepository = dataSource.getRepository(User);
  const patientRepository = dataSource.getRepository(Patient);
  const appointmentRepository = dataSource.getRepository(Appointment);
  const notificationRepository = dataSource.getRepository(Notification);

  const userCount = await userRepository.count();
  const patientCount = await patientRepository.count();
  const appointmentCount = await appointmentRepository.count();
  const notificationCount = await notificationRepository.count();
  
  console.log(`📊 Current state: ${userCount} users, ${patientCount} patients, ${appointmentCount} appointments, ${notificationCount} notifications`);

  let orthophoniste: User | null = null;
  let parent1: User | null = null;
  let parent2: User | null = null;

  // 1. CREATE USERS (only if they don't exist)
  if (userCount === 0) {
    console.log('👤 Creating users...');
    
    const hashedPassword = await bcrypt.hash('Password123!', 10);

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

    await userRepository.save([orthophoniste, parent1, parent2]);
    console.log('✅ Users created successfully!');
    
  } else {
    console.log('👤 Users already exist. Fetching existing users...');
    const users = await userRepository.find();
    
    orthophoniste = users.find(u => u.role === UserRole.ORTHOPHONISTE) || null;
    parent1 = users.find(u => u.email === 'david.martin@email.com') || null;
    parent2 = users.find(u => u.email === 'sophie.dupont@email.com') || null;
    
    if (!orthophoniste || !parent1 || !parent2) {
      console.error('❌ Required users not found in database!');
      console.log('💡 Tip: Run DELETE FROM users; in psql and re-run this seed');
      await dataSource.destroy();
      return;
    }
    console.log('✅ Users fetched successfully!');
  }

  // 2. CREATE PATIENTS (only if they don't exist)
  if (patientCount === 0 && orthophoniste && parent1 && parent2) {
    console.log('👶 Creating patients...');

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

    await patientRepository.save([patient1, patient2]);
    console.log('✅ Patients created successfully!');
    
  } else if (patientCount > 0) {
    console.log('👶 Patients already exist. Skipping patient creation.');
  } else {
    console.log('⚠️ Could not create patients - users not found');
  }

  // 3. CREATE APPOINTMENTS (only if they don't exist)
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
          dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
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
          dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
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
          dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
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
          dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
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
          dateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
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

  // 4. CREATE NOTIFICATIONS (only if they don't exist)
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
      ];

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

  // 5. DISPLAY RESULTS
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

  await dataSource.destroy();
  console.log('🔌 Database connection closed');
  console.log('\n🎉 Ready to start testing!');
}

seed().catch((error) => {
  console.error('❌ SEED FAILED:', error);
  process.exit(1);
});