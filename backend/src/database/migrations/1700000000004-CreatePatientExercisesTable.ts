// src/database/migrations/1700000000004-CreatePatientExercisesTable.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePatientExercisesTable1700000000004 implements MigrationInterface {
  name = 'CreatePatientExercisesTable1700000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "public"."patient_exercises_status_enum" AS ENUM(
        'assigned', 'in-progress', 'completed', 'overdue', 'cancelled'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."patient_exercises_priority_enum" AS ENUM(
        'low', 'medium', 'high'
      )
    `);

    // Create patient_exercises table
    await queryRunner.query(`
      CREATE TABLE "patient_exercises" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patientId" uuid NOT NULL,
        "exerciseId" uuid NOT NULL,
        "assignedBy" uuid NOT NULL,
        "assignedDate" TIMESTAMP NOT NULL,
        "dueDate" TIMESTAMP,
        "completedDate" TIMESTAMP,
        "status" "public"."patient_exercises_status_enum" NOT NULL DEFAULT 'assigned',
        "priority" "public"."patient_exercises_priority_enum" NOT NULL DEFAULT 'medium',
        "notes" text,
        "performance" jsonb,
        "progressLogs" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_patient_exercises_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_patient_exercises_patient" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_patient_exercises_exercise" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_patient_exercises_assigner" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_patient_exercises_patient_exercise" ON "patient_exercises" ("patientId", "exerciseId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_patient_exercises_status_dueDate" ON "patient_exercises" ("status", "dueDate")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "patient_exercises"`);
    await queryRunner.query(`DROP TYPE "public"."patient_exercises_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."patient_exercises_status_enum"`);
  }
}