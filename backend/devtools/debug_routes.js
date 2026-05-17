const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');

// Mock dependencies
require('dotenv').config();

// Mount like index.js
app.use('/api/auth', authRoutes);

function printRoutes(stack, basePath = '') {
    stack.forEach(layer => {
        if (layer.route) {
            console.log(`${Object.keys(layer.route.methods).join(',').toUpperCase()} ${basePath}${layer.route.path}`);
        } else if (layer.name === 'router' && layer.handle.stack) {
            let newPath = '';
            // Parse regex for path
            if (layer.regexp) {
                const str = layer.regexp.toString();
                // Simple parser for Express regex to find base path
                // This is a naive approximation for debugging
                if (str.includes('/api/auth')) newPath = '/api/auth';
            }
            printRoutes(layer.handle.stack, newPath);
        }
    });
}

console.log("Registered Routes:");
// Try to inspect the router stack
// This is tricky with plain inspection but we can try just checking if the path registers
authRoutes.stack.forEach(r => {
    if (r.route) {
        console.log(`- ${Object.keys(r.route.methods).join(',').toUpperCase()} /api/auth${r.route.path}`);
    }
});
