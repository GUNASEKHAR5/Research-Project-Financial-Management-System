const pool = require("../config/db");

/**
 * Write a row to audit_logs.
 *
 * @param {object} params
 * @param {string} params.userId      - UUID of the acting user
 * @param {string} params.projectId   - UUID of related project (nullable)
 * @param {string} params.action      - e.g. "approved_expense"
 * @param {string} params.entityType  - audit_entity enum value
 * @param {string} params.entityId    - UUID of affected row
 * @param {object} params.metadata    - optional JSON context
 */
const logAudit = async ({ userId, projectId = null, action, entityType, entityId, metadata = null }) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, project_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, projectId, action, entityType, entityId, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (err) {
    // Audit log failure must never break the main request
    console.error("Audit log failed:", err.message);
  }
};

module.exports = { logAudit };
