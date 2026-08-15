// src/database/migrations/1700000000011-AddCoverImageToExercises.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoverImageToExercises1700000000011 implements MigrationInterface {
  name = 'AddCoverImageToExercises1700000000011';

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

    // Check if the coverImageKey column already exists
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exercises' AND column_name = 'coverImageKey'
      )
    `);

    if (columnExists[0].exists) {
      console.log('⚠️ coverImageKey column already exists, skipping migration');
      return;
    }

    // Add coverImageKey column
    await queryRunner.query(`
      ALTER TABLE "exercises" 
      ADD COLUMN "coverImageKey" character varying
    `);

    console.log('✅ Added coverImageKey column to exercises table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exercises' AND column_name = 'coverImageKey'
      )
    `);

    if (columnExists[0].exists) {
      await queryRunner.query(`
        ALTER TABLE "exercises" DROP COLUMN "coverImageKey"
      `);
      console.log('✅ Removed coverImageKey column from exercises table');
    }
  }
}