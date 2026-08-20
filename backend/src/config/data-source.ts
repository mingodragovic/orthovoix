import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Patient } from '../modules/patients/entities/patient.entity';
import * as dotenv from 'dotenv';
import { Exercise } from '../modules/exercises/entities/exercise.entity';
import { PatientExercise } from '../modules/patient-exercises/entities/patient-exercise.entity';
import { Progress } from '../modules/progress/entities/progress.entity';
import { Appointment } from '../modules/appointments/entities/appointment.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { Recording } from '../modules/recordings/entities/recording.entity';
import { Submission } from '../modules/submissions/entities/submission.entity';
import { join } from 'path';  // ✅ ADD THIS

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'orthovoix_db',
  entities: [User, Patient, Exercise, PatientExercise, Progress, Appointment, Notification, Recording, Submission],
  migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],  // ✅ FIXED
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;