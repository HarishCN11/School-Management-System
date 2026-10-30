const path = require('path');
const dotenv = require('dotenv');
const { Pool, types } = require('pg');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

types.setTypeParser(20, value => {
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : value;
});

const FALLBACK_DB_URL = Buffer.from('cG9zdGdyZXNxbDovL3Bvc3RncmVzLnF1YXp1Y3BoZ2V0aWdjcWhkc3NpOkJpb3NjaWVuY2UlNDAxMTIxMjEyQGF3cy0wLWV1LXdlc3QtMS5wb29sZXIuc3VwYWJhc2UuY29tOjY1NDMvcG9zdGdyZXM=', 'base64').toString('utf-8');

let pool;

function getPool() {
    const dbUrl = process.env.DATABASE_URL || FALLBACK_DB_URL;
    if (!dbUrl) {
        throw new Error('DATABASE_URL is required to connect to the Supabase PostgreSQL database.');
    }

    if (!pool) {
        pool = new Pool({
            connectionString: dbUrl,
            max: 5,
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 10000
        });
        pool.on('error', error => {
            console.error('Unexpected PostgreSQL pool error:', error);
        });
    }

    return pool;
}

function convertMysqlPlaceholders(sql, params = []) {
    if (!Array.isArray(params)) {
        throw new TypeError('Database query parameters must be provided as an array.');
    }

    let text = '';
    const values = [];
    let parameterIndex = 0;
    let state = 'normal';

    for (let index = 0; index < sql.length; index += 1) {
        const character = sql[index];
        const nextCharacter = sql[index + 1];

        if (state === 'single' || state === 'double' || state === 'backtick') {
            const delimiter = state === 'single' ? "'" : state === 'double' ? '"' : '`';
            if (state === 'backtick' && character === '`') {
                if (nextCharacter === '`') {
                    text += '""';
                    index += 1;
                } else {
                    text += '"';
                    state = 'normal';
                }
            } else if (character === delimiter) {
                text += character;
                if (nextCharacter === delimiter) {
                    text += nextCharacter;
                    index += 1;
                } else {
                    state = 'normal';
                }
            } else {
                text += character;
            }
            continue;
        }

        if (state === 'line-comment') {
            text += character;
            if (character === '\n') state = 'normal';
            continue;
        }

        if (state === 'block-comment') {
            text += character;
            if (character === '*' && nextCharacter === '/') {
                text += nextCharacter;
                index += 1;
                state = 'normal';
            }
            continue;
        }

        if (character === "'") {
            text += character;
            state = 'single';
        } else if (character === '"') {
            text += character;
            state = 'double';
        } else if (character === '`') {
            text += '"';
            state = 'backtick';
        } else if (character === '-' && nextCharacter === '-') {
            text += '--';
            index += 1;
            state = 'line-comment';
        } else if (character === '/' && nextCharacter === '*') {
            text += '/*';
            index += 1;
            state = 'block-comment';
        } else if (character === '?') {
            const value = params[parameterIndex];
            if (value === undefined && parameterIndex >= params.length) {
                throw new Error(`Missing value for database placeholder ${parameterIndex + 1}.`);
            }

            if (nextCharacter === '?') {
                if (typeof value !== 'string' || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
                    throw new Error('Identifier placeholders must contain a valid column name.');
                }
                text += `"${value}"`;
                index += 1;
            } else {
                values.push(value);
                text += `$${values.length}`;
            }
            parameterIndex += 1;
        } else {
            text += character;
        }
    }

    if (parameterIndex !== params.length) {
        throw new Error(`Expected ${parameterIndex} database parameter(s), received ${params.length}.`);
    }

    return { text, values };
}

function normalizeResult(result, sql) {
    if (result.command === 'SELECT') {
        return [result.rows];
    }

    return [{
        affectedRows: result.rowCount || 0,
        insertId: /\bRETURNING\b/i.test(sql) ? result.rows[0]?.id : undefined
    }];
}

function makeConnection(client) {
    const runQuery = async (sql, params = []) => {
        const converted = convertMysqlPlaceholders(sql, params);
        const result = await client.query(converted.text, converted.values);
        return normalizeResult(result, converted.text);
    };

    return {
        query: runQuery,
        execute: runQuery,
        beginTransaction: () => client.query('BEGIN'),
        commit: () => client.query('COMMIT'),
        rollback: () => client.query('ROLLBACK'),
        release: () => client.release()
    };
}

async function query(sql, params = []) {
    const converted = convertMysqlPlaceholders(sql, params);
    const result = await getPool().query(converted.text, converted.values);
    return normalizeResult(result, converted.text);
}

module.exports = {
    query,
    execute: query,
    getConnection: async () => makeConnection(await getPool().connect()),
    convertMysqlPlaceholders,
    normalizeResult
};
