import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import db from '.';

async function main() {
    await migrate(db, { migrationsFolder: './drizzle' });
}

main()

