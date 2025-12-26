import { getOutputs } from '../../core/manifest.js';
import Database from 'better-sqlite3';
import { getManifestPath } from '../../core/paths.js';

export async function statusCommand(args: string[]): Promise<void> {
  let model: string | null = null;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--model' && i + 1 < args.length) {
      model = args[i + 1];
      i++;
    }
  }

  const db = new Database(getManifestPath());

  try {
    if (model) {
      // Show status for specific model
      const stmt = db.prepare('SELECT * FROM files WHERE model = ? ORDER BY last_processed_at DESC');
      const files = stmt.all(model) as Array<{
        id: number;
        source_path: string;
        source_hash: string;
        source_mtime: number;
        model: string;
        last_processed_at: number;
        status: string;
      }>;

      console.log(`\nModel: ${model}`);
      console.log(`Files processed: ${files.length}\n`);

      for (const file of files) {
        const outputs = getOutputs(file.id);
        console.log(`File: ${file.source_path}`);
        console.log(`  Status: ${file.status}`);
        console.log(`  Last processed: ${new Date(file.last_processed_at).toISOString()}`);
        console.log(`  Outputs: ${outputs.length}`);
        for (const output of outputs) {
          console.log(`    - ${output.social}/${output.type}: ${output.output_path}`);
        }
        console.log();
      }
    } else {
      // Show summary for all models
      const stmt = db.prepare(`
        SELECT model, COUNT(*) as file_count, 
               SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
               SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error_count
        FROM files
        GROUP BY model
      `);
      const stats = stmt.all() as Array<{
        model: string;
        file_count: number;
        success_count: number;
        error_count: number;
      }>;

      console.log('\nStatus Summary:\n');
      for (const stat of stats) {
        console.log(`Model: ${stat.model}`);
        console.log(`  Files: ${stat.file_count}`);
        console.log(`  Success: ${stat.success_count}`);
        console.log(`  Errors: ${stat.error_count}`);
        console.log();
      }
    }
  } finally {
    db.close();
  }
}

