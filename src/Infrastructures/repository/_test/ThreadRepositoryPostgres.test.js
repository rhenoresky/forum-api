const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const ResultAddThread = require('../../../Domains/threads/entities/ResultAddThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('submitThread function', () => {
    it('should persist add thread', async () => {
      await UsersTableTestHelper.addUser({});
      const threadValue = new AddThread({title: 'judul thread', body: 'body dari sebuah thread'}, owner = 'user-123');

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await threadRepositoryPostgres.submitThread(threadValue);

      const thread = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(thread).toHaveLength(1);
    });

    it('should return add thread correctly', async () => {
      await UsersTableTestHelper.addUser({});
      const threadValue = new AddThread({title: 'judul thread', body: 'body dari sebuah thread'}, owner = 'user-123');

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const resultAddThread = await threadRepositoryPostgres.submitThread(threadValue);

      expect(resultAddThread).toStrictEqual(new ResultAddThread({
        id: 'thread-123',
        title: 'judul thread',
        owner: 'user-123',
      }));
    });
  });

  describe('checkThreadAvailability function', () => {
    it('should throw a NotFoundError when thread id is not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.checkThreadAvailability('thread-123')).rejects.toThrowError(NotFoundError);
    });
    it('should not throw a NotFoundError when thread id is found', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.checkThreadAvailability('thread-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should return the thread details correctly', async () => {
      const created = new Date().toISOString();
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({createdAt: created});

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const result = await threadRepositoryPostgres.getThreadById('thread-123');

      expect(result).toEqual({
        id: 'thread-123',
        title: 'sebuah title',
        body: 'sebuah body',
        date: created,
        username: 'dicoding',
      });
    });
  });
});
