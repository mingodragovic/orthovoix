// src/database/migrations/1700000000003-CreateExercisesTable.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateExercisesTable1700000000003 implements MigrationInterface {
    name = 'CreateExercisesTable1700000000003';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types
        await queryRunner.query(`
            CREATE TYPE "public"."exercises_category_enum" AS ENUM(
                'pronunciation', 'vocabulary', 'grammar', 'comprehension', 
                'fluency', 'articulation', 'phonology', 'language', 
                'social_communication', 'other'
            )
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."exercises_difficulty_enum" AS ENUM(
                'beginner', 'intermediate', 'advanced'
            )
        `);

        // Create exercises table
        await queryRunner.query(`
            CREATE TABLE "exercises" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "category" "public"."exercises_category_enum" NOT NULL DEFAULT 'other',
                "difficulty" "public"."exercises_difficulty_enum" NOT NULL DEFAULT 'beginner',
                "instructions" text NOT NULL,
                "materials" jsonb,
                "duration" integer,
                "audioUrl" character varying,
                "videoUrl" character varying,
                "imageUrl" character varying,
                "tags" jsonb,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdBy" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_exercises_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_exercises_creator" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        // Create indexes
        await queryRunner.query(`
            CREATE INDEX "IDX_exercises_category_difficulty" ON "exercises" ("category", "difficulty")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_exercises_isActive_createdBy" ON "exercises" ("isActive", "createdBy")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "exercises"`);
        await queryRunner.query(`DROP TYPE "public"."exercises_difficulty_enum"`);
        await queryRunner.query(`DROP TYPE "public"."exercises_category_enum"`);
    }
}