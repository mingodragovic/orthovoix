import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePatientsTable1700000000002 implements MigrationInterface {
    name = 'CreatePatientsTable1700000000002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."patients_gender_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."patients_status_enum" AS ENUM('active', 'inactive', 'discharged')`);
        await queryRunner.query(`
            CREATE TABLE "patients" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "dateOfBirth" date NOT NULL,
                "gender" "public"."patients_gender_enum" NOT NULL DEFAULT 'other',
                "parentId" uuid NOT NULL,
                "orthophonisteId" uuid NOT NULL,
                "diagnosis" character varying,
                "medicalHistory" text,
                "allergies" jsonb,
                "medications" jsonb,
                "therapyGoals" jsonb,
                "therapyFrequency" character varying,
                "therapyDuration" integer,
                "emergencyContact" jsonb,
                "status" "public"."patients_status_enum" NOT NULL DEFAULT 'active',
                "notes" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_patients_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_patients_parent" FOREIGN KEY ("parentId") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_patients_orthophoniste" FOREIGN KEY ("orthophonisteId") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_patients_parentId" ON "patients" ("parentId")`);
        await queryRunner.query(`CREATE INDEX "IDX_patients_orthophonisteId" ON "patients" ("orthophonisteId")`);
        await queryRunner.query(`CREATE INDEX "IDX_patients_parentId_orthophonisteId" ON "patients" ("parentId", "orthophonisteId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "patients"`);
        await queryRunner.query(`DROP TYPE "public"."patients_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."patients_gender_enum"`);
    }
}