const test = require('node:test');
const assert = require('node:assert/strict');
const { convertMysqlPlaceholders, normalizeResult } = require('../config/db');
const authorizeRoles = require('../middleware/authorizeRoles');

function authorize(role) {
    let statusCode;
    let responseBody;
    let nextCalled = false;
    const middleware = authorizeRoles('admin');
    middleware(
        { user: role ? { role } : undefined },
        {
            status(code) {
                statusCode = code;
                return this;
            },
            json(body) {
                responseBody = body;
                return this;
            }
        },
        () => {
            nextCalled = true;
        }
    );

    return { statusCode, responseBody, nextCalled };
}

test('converts value and identifier placeholders without changing quoted text', () => {
    const converted = convertMysqlPlaceholders(
        'SELECT ?? FROM `users` WHERE email = ? AND note = \'?\' -- ?\nAND id = ?',
        ['term_1_marks', 'person@example.test', 42]
    );

    assert.deepEqual(converted, {
        text: 'SELECT "term_1_marks" FROM "users" WHERE email = $1 AND note = \'?\' -- ?\nAND id = $2',
        values: ['person@example.test', 42]
    });
});

test('rejects missing and extra parameters', () => {
    assert.throws(() => convertMysqlPlaceholders('SELECT ?', []), /Missing value/);
    assert.throws(() => convertMysqlPlaceholders('SELECT 1', [1]), /Expected 0/);
    assert.throws(
        () => convertMysqlPlaceholders('SELECT ??', ['id DESC']),
        /valid column name/
    );
});

test('preserves the mysql2 result shape for SELECT and mutation queries', () => {
    assert.deepEqual(normalizeResult({
        command: 'SELECT',
        rowCount: 1,
        rows: [{ id: 7 }]
    }, 'SELECT id FROM users'), [[{ id: 7 }]]);

    assert.deepEqual(normalizeResult({
        command: 'INSERT',
        rowCount: 1,
        rows: [{ id: 9 }]
    }, 'INSERT INTO users (name) VALUES ($1) RETURNING id'), [{
        affectedRows: 1,
        insertId: 9
    }]);

    assert.deepEqual(normalizeResult({
        command: 'UPDATE',
        rowCount: 0,
        rows: []
    }, 'UPDATE users SET name = $1 WHERE id = $2'), [{
        affectedRows: 0,
        insertId: undefined
    }]);
});

test('authorizes using the server-verified role and rejects other roles', () => {
    assert.deepEqual(authorize('Admin'), {
        statusCode: undefined,
        responseBody: undefined,
        nextCalled: true
    });
    assert.deepEqual(authorize('student'), {
        statusCode: 403,
        responseBody: { message: 'Forbidden' },
        nextCalled: false
    });
    assert.deepEqual(authorize(undefined), {
        statusCode: 403,
        responseBody: { message: 'Forbidden' },
        nextCalled: false
    });
});
