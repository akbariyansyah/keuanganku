import { pool } from '@/lib/db';
import { sendSuccess, sendError } from '@/lib/api-response';

export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, description FROM investment_categories ORDER BY id ASC',
    );
    return sendSuccess(rows);
  } catch (err) {
    console.error('investment categories error:', err);
    return sendError('Failed to fetch categories', 500);
  }
}
