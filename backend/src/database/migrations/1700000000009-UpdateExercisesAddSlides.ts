// src/database/migrations/1700000000009-UpdateExercisesAddSlides.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateExercisesAddSlides1700000000009 implements MigrationInterface {
  name = 'UpdateExercisesAddSlides1700000000009';

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

    // Check if the slides column already exists
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exercises' AND column_name = 'slides'
      )
    `);

    if (columnExists[0].exists) {
      console.log('⚠️ Slides column already exists, skipping migration');
      return;
    }

    // Add slides column as JSONB
    await queryRunner.query(`
      ALTER TABLE "exercises" 
      ADD COLUMN "slides" jsonb
    `);

    // Note: The old columns (audioUrl, imageUrl, audioKey, imageKey) should be 
    // removed if they exist. We'll check and drop them.
    const columnsToCheck = ['audioUrl', 'videoUrl', 'imageUrl', 'audioKey', 'imageKey'];

    for (const columnName of columnsToCheck) {
      const colExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'exercises' AND column_name = '${columnName}'
        )
      `);

      if (colExists[0].exists) {
        // Check if column has any data before dropping
        const hasData = await queryRunner.query(`
          SELECT COUNT(*) FROM "exercises" WHERE "${columnName}" IS NOT NULL
        `);

        if (parseInt(hasData[0].count, 10) > 0) {
          console.log(`⚠️ Column ${columnName} has data. Please handle data migration manually.`);
          // We'll keep the column but mark it as deprecated
          await queryRunner.query(`
            COMMENT ON COLUMN "exercises"."${columnName}" IS 'DEPRECATED: Use slides column instead'
          `);
        } else {
          // Safe to drop empty column
          await queryRunner.query(`
            ALTER TABLE "exercises" DROP COLUMN "${columnName}"
          `);
          console.log(`✅ Dropped empty column: ${columnName}`);
        }
      }
    }

    console.log('✅ Migration completed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the migration - drop slides column
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exercises' AND column_name = 'slides'
      )
    `);

    if (columnExists[0].exists) {
      await queryRunner.query(`
        ALTER TABLE "exercises" DROP COLUMN "slides"
      `);
    }

    // Re-add the old columns (if they were dropped)
    // We won't re-add them automatically as it's a complex migration
    console.log('⚠️ Reverted migration. Old columns may need to be re-added manually.');
  }
}