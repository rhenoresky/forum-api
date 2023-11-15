const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddReply = require('../../../Domains/reply/entities/AddReply');
const ResultAddReply = require('../../../Domains/reply/entities/ResultAddReply');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ReplyTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('submitReply function', () => {
    it('should persist add reply', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});
      await UsersTableTestHelper.addUser({id: 'user-789', username: 'Kipli'});

      const addReply = new AddReply({content: 'sebuah konten reply'}, commentId = 'comment-123', userId = 'user-789');
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await replyRepositoryPostgres.submitReply(addReply);

      const reply = await ReplyTableTestHelper.findReplyById('reply-123');
      expect(reply).toHaveLength(1);
    });
    it('should return add reply correctly', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});
      await UsersTableTestHelper.addUser({id: 'user-789', username: 'Kipli'});

      const addReply = new AddReply({content: 'sebuah konten reply'}, commentId = 'comment-123', userId = 'user-789');
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const resultAddReply = await replyRepositoryPostgres.submitReply(addReply);
      expect(resultAddReply).toStrictEqual(new ResultAddReply({
        id: 'reply-123',
        content: 'sebuah konten reply',
        owner: 'user-789',
      }));
    });
  });

  describe('getReplyByThreadId function', () => {
    it('must return reply data correctly', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      const createdRobert = new Date().toISOString();
      await CommentsTableTestHelper.addComment({createdAt: createdRobert});

      await UsersTableTestHelper.addUser({id: 'user-789', username: 'Kipli'});
      const createdKipli = new Date().toISOString();
      await CommentsTableTestHelper.addComment({id: 'comment-456', content: 'comment kipli', userId: 'user-789', createdAt: createdKipli, isDelete: true});

      await UsersTableTestHelper.addUser({id: 'user-1020', username: 'Sandi'});
      const createdSandi = new Date().toISOString();
      await ReplyTableTestHelper.addReply({owner: 'user-1020', content: 'reply Sandi', createdAt: createdSandi});

      await UsersTableTestHelper.addUser({id: 'user-2030', username: 'Wawan'});
      const createdWawan = new Date().toISOString();
      await ReplyTableTestHelper.addReply({id: 'reply-456', commentId: 'comment-456', owner: 'user-2030', content: 'reply Wawan', createdAt: createdWawan, isDeleted: true});

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      const result = await replyRepositoryPostgres.getReplyByThreadId('thread-123');
      expect(result).toEqual([
        {
          id: 'reply-123',
          username: 'Sandi',
          created_at: createdSandi,
          content: 'reply Sandi',
          is_delete: false,
          comment_id: 'comment-123',
        },
        {
          id: 'reply-456',
          username: 'Wawan',
          created_at: createdWawan,
          content: 'reply Wawan',
          is_delete: true,
          comment_id: 'comment-456',
        },
      ]);
    });
  });

  describe('checkReplyAvailability function', () => {
    it('should throw a NotFoundError when reply id is not found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.checkReplyAvailability({replyId: 'reply-123', commentId: 'comment-123', threadId: 'thread-123'})).rejects.toThrowError(NotFoundError);
    });
    it('should not throw a NotFoundError when reply id is found', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});
      await UsersTableTestHelper.addUser({id: 'user-789', username: 'Kipli'});
      await ReplyTableTestHelper.addReply({});

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.checkReplyAvailability({replyId: 'reply-123', commentId: 'comment-123', threadId: 'thread-123'})).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw an AuthorizationError when a non-owner of reply submits a request', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-789')).rejects.toThrowError(AuthorizationError);
    });
    it('should throw an AuthorizationError when a non-owner of reply submits a request', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});
      await UsersTableTestHelper.addUser({id: 'user-789', username: 'Kipli'});
      await ReplyTableTestHelper.addReply({});

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-789')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply function', () => {
    it('should persist delete reply', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});
      await UsersTableTestHelper.addUser({id: 'user-789', username: 'Kipli'});
      await ReplyTableTestHelper.addReply({});

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      const result = await replyRepositoryPostgres.deleteReply('reply-123');

      const resultfind = await ReplyTableTestHelper.findReplyById('reply-123');

      expect(result).toEqual('reply-123');
      expect(resultfind[0].is_delete).toEqual(true);
    });
  });
});
