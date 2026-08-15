// src/database/migrations/1700000000005-CreateProgressTable.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProgressTable1700000000005 implements MigrationInterface {
  name = 'CreateProgressTable1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "public"."progress_type_enum" AS ENUM(
        'pronunciation', 'vocabulary', 'grammar', 'comprehension',
        'fluency', 'articulation', 'phonology', 'language',
        'social_communication', 'overall'
      )
    `);

    // Create progress_records table
    await queryRunner.query(`
      CREATE TABLE "progress_records" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patientId" uuid NOT NULL,
        "recordedBy" uuid NOT NULL,
        "recordDate" TIMESTAMP NOT NULL,
        "type" "public"."progress_type_enum" NOT NULL DEFAULT 'overall',
        "scores" jsonb,
        "notes" text,
        "strengths" jsonb,
        "areasForImprovement" jsonb,
        "nextGoals" jsonb,
        "therapyPlanAdjustments" text,
        "recommendedFrequency" character varying,
        "therapyDuration" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_progress_records_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_progress_records_patient" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_progress_records_recorder" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_progress_patient_recordDate" ON "progress_records" ("patientId", "recordDate")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_progress_patient_type" ON "progress_records" ("patientId", "type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "progress_records"`);
    await queryRunner.query(`DROP TYPE "public"."progress_type_enum"`);
  }
}