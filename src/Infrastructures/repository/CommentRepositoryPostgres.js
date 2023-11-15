const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const ResultAddComment = require('../../Domains/comments/entities/ResultAddComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async submitComment(commentValue) {
    const {content, threadId, owner} = commentValue;
    const id = `comment-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, threadId, owner, createdAt],
    };

    const {rows} = await this._pool.query(query);
    return new ResultAddComment({...rows[0]});
  }

  async checkCommentAvailability(id) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [id],
    };

    const {rowCount} = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Comment tidak ditemukan');
    }
  }

  async verifyCommentOwner(id, userId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND owner = $2',
      values: [id, userId],
    };

    const {rowCount} = await this._pool.query(query);
    if (!rowCount) {
      throw new AuthorizationError('Anda bukan pemilik comment ini');
    }
  }

  async deleteComment({id, userId, threadId}) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1 AND owner = $2 AND thread_id = $3 RETURNING id',
      values: [id, userId, threadId],
    };

    const {rows} = await this._pool.query(query);
    return rows[0].id;
  }

  async getCommentByThreadId(threadId) {
    const query = {
      text: 'SELECT c.id, c.created_at, c.content, c.is_delete, u.username FROM comments as c INNER JOIN users as u ON c.owner = u.id WHERE c.thread_id = $1',
      values: [threadId],
    };

    const {rows} = await this._pool.query(query);
    return rows;
  }

  async checkCommentBelongsToThread({threadId, commentId}) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const {rowCount} = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Tidak dapat menambah balasan karena komentar tidak ditemukan');
    }
  }
}

module.exports = CommentRepositoryPostgres;
