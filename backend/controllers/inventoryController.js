const pool = require('../config/db');

// Auto-calculate status based on quantity
const getStatusFromQuantity = (quantity) => {
    const qty = parseInt(quantity) || 0;
    if (qty <= 0) return 'out_of_stock';
    return 'available';
};

// Get all inventory items
exports.getAllInventory = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM inventory ORDER BY last_updated DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create inventory item
exports.createInventory = async (req, res) => {
    const { item_name, category, quantity, description } = req.body;
    const autoStatus = getStatusFromQuantity(quantity);
    try {
        const [result] = await pool.query(
            'INSERT INTO inventory (item_name, category, quantity, status, description) VALUES (?, ?, ?, ?, ?) RETURNING id',
            [item_name, category, quantity, autoStatus, description]
        );
        res.status(201).json({ id: result.insertId, message: 'Item created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update inventory item
exports.updateInventory = async (req, res) => {
    const { id } = req.params;
    const { item_name, category, quantity, description } = req.body;
    const autoStatus = getStatusFromQuantity(quantity);
    try {
        await pool.query(
            'UPDATE inventory SET item_name = ?, category = ?, quantity = ?, status = ?, description = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
            [item_name, category, quantity, autoStatus, description, id]
        );
        res.json({ message: 'Item updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete inventory item
exports.deleteInventory = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM inventory WHERE id = ?', [id]);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Allocation Logic
exports.getAllocations = async (req, res) => {
    try {
        const query = `
            SELECT a.id, i.item_name, c.name as class_name, a.quantity, a.reason, a.allocated_at 
            FROM inventory_allocations a
            JOIN inventory i ON a.inventory_id = i.id
            JOIN classes c ON a.class_id = c.id
            ORDER BY a.allocated_at DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.allocateToClass = async (req, res) => {
    const { inventory_id, class_id, quantity, reason } = req.body;
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. Check if enough stock exists
        const [items] = await connection.query('SELECT quantity, item_name FROM inventory WHERE id = ? FOR UPDATE', [inventory_id]);
        if (items.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        const item = items[0];
        if (item.quantity < quantity) {
            await connection.rollback();
            return res.status(400).json({ message: `Insufficient stock for ${item.item_name}. Available: ${item.quantity}` });
        }

        // 2. Create allocation record
        await connection.query(
            'INSERT INTO inventory_allocations (inventory_id, class_id, quantity, reason) VALUES (?, ?, ?, ?)',
            [inventory_id, class_id, quantity, reason]
        );

        // 3. Deduct from total stock
        await connection.query('UPDATE inventory SET quantity = quantity - ? WHERE id = ?', [quantity, inventory_id]);

        await connection.commit();
        res.status(201).json({ message: 'Inventory allocated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Inventory Allocation Error:', error);
        res.status(500).json({ message: 'System error during allocation process' });
    } finally {
        connection.release();
    }
};

exports.getClassInventory = async (req, res) => {
    const { classId } = req.params;
    try {
        const query = `
            SELECT a.id, i.item_name, a.quantity, a.reason, a.allocated_at 
            FROM inventory_allocations a
            JOIN inventory i ON a.inventory_id = i.id
            WHERE a.class_id = ?
            ORDER BY a.allocated_at DESC
        `;
        const [rows] = await pool.query(query, [classId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
