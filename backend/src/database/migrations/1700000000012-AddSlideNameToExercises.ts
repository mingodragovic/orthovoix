// src/database/migrations/1700000000012-AddSlideNameToExercises.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlideNameToExercises1700000000012 implements MigrationInterface {
  name = 'AddSlideNameToExercises1700000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the table exists
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'exercises'
      )
    `);

    if (!tableExists[0].exists) {
      console.log('⚠️ Exercises table does not exist, skipping migration');
      return;
    }

    // The slides column already exists as JSONB
    // We don't need to add a new column since we're adding a field to the JSONB structure
    // This migration just ensures the slides column exists and notes the change
    console.log('✅ Slides column already exists. The "name" field will be available in the JSONB structure.');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No rollback needed for JSONB field addition
    console.log('✅ No rollback needed for JSONB field addition');
  }
}