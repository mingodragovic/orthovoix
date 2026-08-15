// src/database/migrations/1700000000010-CreateSubmissionsTable.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubmissionsTable1700000000010 implements MigrationInterface {
  name = 'CreateSubmissionsTable1700000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if submissions table already exists
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'submissions'
      )
    `);

    if (tableExists[0].exists) {
      console.log('⚠️ Submissions table already exists, skipping migration');
      return;
    }

    // Create enum type for submission status
    await queryRunner.query(`
      CREATE TYPE "public"."submissions_status_enum" AS ENUM(
        'pending', 'reviewed', 'needs-improvement', 'approved', 'rejected'
      )
    `);

    // Create submissions table
    await queryRunner.query(`
      CREATE TABLE "submissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patientExerciseId" uuid NOT NULL,
        "patientId" uuid NOT NULL,
        "exerciseId" uuid NOT NULL,
        "submittedBy" uuid NOT NULL,
        "answers" jsonb,
        "metadata" jsonb,
        "status" "public"."submissions_status_enum" NOT NULL DEFAULT 'pending',
        "notes" text,
        "submittedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "reviewedAt" TIMESTAMP,
        "reviewedBy" uuid,
        "reviewNotes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_submissions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_submissions_patient_exercise" FOREIGN KEY ("patientExerciseId") REFERENCES "patient_exercises"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_submissions_patient" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_submissions_exercise" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_submissions_submitter" FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_submissions_reviewer" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_submissions_patient_exercise" ON "submissions" ("patientId", "exerciseId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_submissions_patient_exercise_id" ON "submissions" ("patientExerciseId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_submissions_status_submittedAt" ON "submissions" ("status", "submittedAt")
    `);

    console.log('✅ Submissions table created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "submissions"`);
    await queryRunner.query(`DROP TYPE "public"."submissions_status_enum"`);
    console.log('✅ Submissions table dropped successfully');
  }
}