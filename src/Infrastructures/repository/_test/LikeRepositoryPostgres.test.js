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

      expect(addLike).toEqual('like-123');
      expect(like).toHaveLength(1);
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

      await likeRepositoryPostgres.deleteLike(payload);

      const like = LikesTableTestHelper.getLikeByCommentIdAndOwner(payload);
      expect(like).toHaveLength(0);
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

      expect(resultCheck).toEqual(true);
    });

    it('checkLikeExists should return false if like exists', async () => {
      const payload = {
        commentId: 'comment-123',
        owner: 'user-456',
      };

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      const resultCheck = await likeRepositoryPostgres.checkLikeIsExist(payload);

      expect(resultCheck).toEqual(false);
    });
  });
});
