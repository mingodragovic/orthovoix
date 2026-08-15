// src/database/migrations/1700000000006-CreateAppointmentsTable.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppointmentsTable1700000000006 implements MigrationInterface {
  name = 'CreateAppointmentsTable1700000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "public"."appointments_status_enum" AS ENUM(
        'scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."appointments_type_enum" AS ENUM(
        'initial-assessment', 'follow-up', 'therapy-session', 'progress-review', 'other'
      )
    `);

    // Create appointments table
    await queryRunner.query(`
      CREATE TABLE "appointments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patientId" uuid NOT NULL,
        "orthophonisteId" uuid NOT NULL,
        "dateTime" TIMESTAMP NOT NULL,
        "duration" integer NOT NULL,
        "type" "public"."appointments_type_enum" NOT NULL DEFAULT 'therapy-session',
        "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'scheduled',
        "notes" text,
        "sessionNotes" jsonb,
        "cancellationReason" character varying,
        "location" character varying,
        "meetingLink" character varying,
        "isVirtual" boolean,
        "reminderSentAt" TIMESTAMP,
        "reminderSent" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_appointments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_appointments_patient" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_appointments_orthophoniste" FOREIGN KEY ("orthophonisteId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_appointments_patient_datetime" ON "appointments" ("patientId", "dateTime")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_appointments_orthophoniste_datetime" ON "appointments" ("orthophonisteId", "dateTime")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_appointments_status_datetime" ON "appointments" ("status", "dateTime")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "appointments"`);
    await queryRunner.query(`DROP TYPE "public"."appointments_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
  }
}