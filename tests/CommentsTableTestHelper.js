/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-_pby2-123', content = 'sebuah komentar', thread = 'thread-123', owner = 'user-123', isDeleted = 0,
  }) {
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6, $7)',
      values: [id, thread, content, owner, isDeleted, createdAt, updatedAt],
    };

    await pool.query(query);
  },

  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async checkIsDeletedCommentsById(id) {
    const query = {
      text: 'SELECT is_deleted FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    const isDeleted = result.rows[0].is_deleted;
    return isDeleted;
  },

  async deleteComment(id) {
    const query = {
      text: 'UPDATE comments SET is_deleted = 1 WHERE id = $1',
      values: [id],
    };
    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
