const fs = require('fs');
const db = require('./config/db');
require('dotenv').config();

async function inspectSchema() {
    try {
        let report = "# 🗄️ LIVE DATABASE SCHEMA REPORT\n\n";
        report += `**Database Name:** ${process.env.DB_NAME}\n\n`;

        // 1. Get all tables
        const [tables] = await db.query("SHOW TABLES");
        const tableNames = tables.map(t => Object.values(t)[0]);

        for (const tableName of tableNames) {
            report += `## 📋 Table: \`${tableName}\`\n`;

            // 2. Get Columns
            const [columns] = await db.query(`DESCRIBE ${tableName}`);
            report += "\n### Columns\n";
            report += "| Field | Type | Null | Key | Default | Extra |\n";
            report += "|---|---|---|---|---|---|\n";
            columns.forEach(col => {
                report += `| **${col.Field}** | ${col.Type} | ${col.Null} | ${col.Key} | ${col.Default || 'NULL'} | ${col.Extra} |\n`;
            });

            // 3. Get Foreign Keys (Relationships)
            const [fks] = await db.query(`
                SELECT 
                    COLUMN_NAME, 
                    REFERENCED_TABLE_NAME, 
                    REFERENCED_COLUMN_NAME 
                FROM 
                    INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE 
                    TABLE_SCHEMA = ? AND 
                    TABLE_NAME = ? AND 
                    REFERENCED_TABLE_NAME IS NOT NULL;
            `, [process.env.DB_NAME, tableName]);

            if (fks.length > 0) {
                report += "\n### 🔗 Relationships\n";
                fks.forEach(fk => {
                    report += `- **${fk.COLUMN_NAME}** ➡️ links to \`${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}\`\n`;
                });
            } else {
                report += "\n*(No foreign keys detected)*\n";
            }
            report += "\n---\n\n";
        }

        fs.writeFileSync('schema_report.md', report);
        console.log("Report generated: schema_report.md");

    } catch (e) {
        console.error("Schema Inspection Error:", e);
    }
    process.exit(0);
}

inspectSchema();
