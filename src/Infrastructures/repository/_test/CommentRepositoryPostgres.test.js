const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const ResultAddComment = require('../../../Domains/comments/entities/ResultAddComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');


describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('submitComment function', () => {
    it('should persist add comment', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});

      const addComment = new AddComment({content: 'sebuah konten'}, threadId = 'thread-123', userId = 'user-456');
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.submitComment(addComment);

      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
    });
    it('should return add comment correctly', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      const addComment = new AddComment({content: 'sebuah konten'}, threadId = 'thread-123', userId = 'user-456');

      const fakeIdGenerator = () => '123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const resultAddComment = await commentRepositoryPostgres.submitComment(addComment);

      expect(resultAddComment).toStrictEqual(new ResultAddComment({
        id: 'comment-123',
        content: 'sebuah konten',
        owner: 'user-456',
      }));
    });
  });

  describe('checkCommentAvailability function', () => {
    it('should throw a NotFoundError when comment id is not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkCommentAvailability('comment-123')).rejects.toThrowError(NotFoundError);
    });
    it('should not throw a NotFoundError when comment id is found', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkCommentAvailability('comment-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw an AuthorizationError when a non-owner of comment submits a request', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});
      await UsersTableTestHelper.addUser({id: 'user-789', username: 'Steve'});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-789')).rejects.toThrowError(AuthorizationError);
    });
    it('should throw an AuthorizationError when a non-owner of comment submits a request', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-456')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteComment function', () => {
    it('should persist delete comment', async () => {
      const useCasePayload = {
        id: 'comment-123',
        userId: 'user-456',
        threadId: 'thread-123',
      };

      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: useCasePayload.userId, username: 'Robert'});
      await CommentsTableTestHelper.addComment({});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const result = await commentRepositoryPostgres.deleteComment(useCasePayload);

      const resultfind = await CommentsTableTestHelper.findCommentById(useCasePayload.id);

      expect(result).toEqual(useCasePayload.id);
      expect(resultfind[0].is_delete).toEqual(true);
    });
  });

  describe('getCommentByThreadId function', () => {
    it('must return comments data correctly', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      const createdRobert = new Date().toISOString();
      await CommentsTableTestHelper.addComment({createdAt: createdRobert});
      await UsersTableTestHelper.addUser({id: 'user-789', username: 'Kipli'});
      const createdKipli = new Date().toISOString();
      await CommentsTableTestHelper.addComment({id: 'comment-456', content: 'comment kipli', userId: 'user-789', createdAt: createdKipli, isDelete: true});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const result = await commentRepositoryPostgres.getCommentByThreadId('thread-123');

      expect(result).toEqual([
        {
          id: 'comment-123',
          username: 'Robert',
          created_at: createdRobert,
          content: 'sebuah konten',
          is_delete: false,
        },
        {
          id: 'comment-456',
          username: 'Kipli',
          created_at: createdKipli,
          content: 'comment kipli',
          is_delete: true,
        },
      ]);
    });
  });

  describe('checkCommentBelongsToThread function', () => {
    it('should throw a NotFoundError when the comment does not belong to a thread', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});
      await UsersTableTestHelper.addUser({id: 'user-789', username: 'Kipli'});
      await ThreadsTableTestHelper.addThread({id: 'thread-456', userId: 'user-789'});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkCommentBelongsToThread({threadId: 'thread-456', commentId: 'comment-123'})).rejects.toThrowError(NotFoundError);
    });
    it('should not throw a NotFoundError when the comment belong to a thread', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkCommentBelongsToThread({threadId: 'thread-123', commentId: 'comment-123'})).resolves.not.toThrowError(NotFoundError);
    });
  });
});
