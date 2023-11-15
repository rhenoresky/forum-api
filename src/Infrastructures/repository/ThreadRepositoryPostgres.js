const ResultAddThread = require('../../Domains/threads/entities/ResultAddThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async submitThread(threadValue) {
    const {title, body, owner} = threadValue;
    const id = `thread-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, owner, createdAt],
    };

    const result = await this._pool.query(query);

    return new ResultAddThread(result.rows[0]);
  }

  async checkThreadAvailability(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
  }

  async getThreadById(threadId) {
    const query = {
      text: 'SELECT t.id, t.title, t.body, t.created_at as date, u.username FROM threads as t INNER JOIN users as u ON t.owner = u.id WHERE t.id = $1',
      values: [threadId],
    };

    const {rows} = await this._pool.query(query);

    return rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
