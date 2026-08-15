// src/database/migrations/1700000000008-CreateRecordingsTable.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecordingsTable1700000000008 implements MigrationInterface {
  name = 'CreateRecordingsTable1700000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if enum exists before creating
    const enumCheck = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'recordings_status_enum'
      )
    `);

    if (!enumCheck[0].exists) {
      await queryRunner.query(`
        CREATE TYPE "public"."recordings_status_enum" AS ENUM(
          'pending', 'reviewed', 'needs-improvement', 'great'
        )
      `);
    }

    // Check if table exists before creating
    const tableCheck = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'recordings'
      )
    `);

    if (!tableCheck[0].exists) {
      await queryRunner.query(`
        CREATE TABLE "recordings" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "patientExerciseId" uuid NOT NULL,
          "recordingUrl" text NOT NULL,
          "recordingKey" text NOT NULL,
          "duration" double precision NOT NULL DEFAULT 0,
          "notes" text,
          "status" "public"."recordings_status_enum" NOT NULL DEFAULT 'pending',
          "feedback" text,
          "reviewedAt" TIMESTAMP,
          "reviewedBy" uuid,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_recordings_id" PRIMARY KEY ("id"),
          CONSTRAINT "FK_recordings_patient_exercise" FOREIGN KEY ("patientExerciseId") REFERENCES "patient_exercises"("id") ON DELETE CASCADE
        )
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_recordings_patient_exercise_createdAt" ON "recordings" ("patientExerciseId", "createdAt")
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "recordings" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."recordings_status_enum" CASCADE`);
  }
}