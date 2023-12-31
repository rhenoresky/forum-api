const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist add likes', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});

      const payload = {
        commentId: 'comment-123',
        owner: 'user-456',
      };

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      const addLike = await likeRepositoryPostgres.addLike(payload);

      const like = await LikesTableTestHelper.getLikeByCommentIdAndOwner(payload);

      expect(addLike).toEqual({id: 'like-123'});
      expect(like).toEqual(1);
    });
  });

  describe('deleteLike function', () => {
    it('should persist delete likes', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});
      await LikesTableTestHelper.addLike({owner: 'user-456'});

      const payload = {
        commentId: 'comment-123',
        owner: 'user-456',
      };

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      await likeRepositoryPostgres.removeLike(payload);

      const result = await LikesTableTestHelper.getLikeByCommentIdAndOwner(payload);
      expect(result).toEqual(0);
    });
  });

  describe('checkLikeIsExist function', () => {
    it('checkLikeExists should return true if like exists', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});
      await LikesTableTestHelper.addLike({owner: 'user-456'});

      const payload = {
        commentId: 'comment-123',
        owner: 'user-456',
      };

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      const resultCheck = await likeRepositoryPostgres.checkLikeIsExist(payload);

      expect(resultCheck).toEqual(1);
    });

    it('checkLikeExists should return false if like exists', async () => {
      const payload = {
        commentId: 'comment-123',
        owner: 'user-456',
      };

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      const resultCheck = await likeRepositoryPostgres.checkLikeIsExist(payload);

      expect(resultCheck).toEqual(0);
    });
  });

  describe('getLikeCountByCommentId', () => {
    it('must return the correct number of likes', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});
      await LikesTableTestHelper.addLike({owner: 'user-456'});

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      const result = await likeRepositoryPostgres.getLikeCountByCommentId('comment-123');

      expect(result).toEqual(1);
    });
  });
});
