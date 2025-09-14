import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function cleanupAuthTables() {
    try {
        console.log('Cleaning up betterAuth tables...');

        // Drop auth tables if they exist
        await sql`DROP TABLE IF EXISTS "verification" CASCADE`;
        await sql`DROP TABLE IF EXISTS "account" CASCADE`;
        await sql`DROP TABLE IF EXISTS "session" CASCADE`;
        await sql`DROP TABLE IF EXISTS "user" CASCADE`;

        console.log('✅ Auth tables cleaned up successfully!');
        console.log('Your original schema with users, profiles, links, themes, and analytics tables is preserved.');
    } catch (error) {
        console.error('❌ Error cleaning up tables:', error);
    } finally {
        await sql.end();
    }
}

cleanupAuthTables();