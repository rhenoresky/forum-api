const ReplyRepository = require('../../Domains/reply/ReplyRepository');
const ResultAddReply = require('../../Domains/reply/entities/ResultAddReply');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async submitReply(replyValue) {
    const {content, commentId, owner} = replyValue;
    const id = `reply-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, commentId, owner, createdAt],
    };

    const {rows} = await this._pool.query(query);
    return new ResultAddReply(rows[0]);
  }

  async getReplyByThreadId(threadId) {
    const query = {
      text: 'SELECT r.id, r.content, r.created_at, r.is_delete, r.comment_id, u.username FROM replies as r INNER JOIN users as u ON r.owner = u.id INNER JOIN comments as c ON r.comment_id = c.id WHERE c.thread_id = $1 ORDER BY created_at ASC',
      values: [threadId],
    };

    const {rows} = await this._pool.query(query);
    return rows;
  }

  async checkReplyAvailability({replyId, commentId, threadId}) {
    const query = {
      text: 'SELECT r.id FROM replies as r INNER JOIN comments as c ON r.comment_id = c.id WHERE r.id = $1 AND r.comment_id = $2 AND r.is_delete = false AND c.thread_id = $3',
      values: [replyId, commentId, threadId],
    };

    const {rowCount} = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Reply tidak ditemukan');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1 AND owner = $2',
      values: [replyId, owner],
    };

    const {rowCount} = await this._pool.query(query);

    if (!rowCount) {
      throw new AuthorizationError('Anda bukan pemilik reply');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1 RETURNING id',
      values: [replyId],
    };

    const {rows} = await this._pool.query(query);

    return rows[0].id;
  }
}

module.exports = ReplyRepositoryPostgres;
