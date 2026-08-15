// src/database/migrations/1700000000007-CreateNotificationsTable.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTable1700000000007 implements MigrationInterface {
  name = 'CreateNotificationsTable1700000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "public"."notifications_type_enum" AS ENUM(
        'appointment', 'appointment-reminder', 'exercise', 'exercise-assigned',
        'exercise-due-soon', 'exercise-overdue', 'progress', 'progress-updated',
        'system', 'reminder', 'patient', 'report'
      )
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "type" "public"."notifications_type_enum" NOT NULL DEFAULT 'system',
        "title" character varying NOT NULL,
        "message" text NOT NULL,
        "read" boolean NOT NULL DEFAULT false,
        "readAt" TIMESTAMP,
        "actionUrl" character varying,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_user_read" ON "notifications" ("userId", "read")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_user_createdAt" ON "notifications" ("userId", "createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
  }
}