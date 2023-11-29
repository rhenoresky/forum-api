const pool = require('../../database/postgres/pool');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const TokenHelper = require('../../../../tests/TokenHelper');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      const requestPayload = {
        title: 'title thread',
        body: 'body dari sebuah thread',
      };

      const token = await TokenHelper.createAccessToken(username = 'dicoding', id = 'user-123');
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads',
        method: 'POST',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {
        body: 'body dari sebuah thread',
      };

      const token = await TokenHelper.createAccessToken(username = 'dicoding', id = 'user-123');
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads',
        method: 'POST',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        title: 'title sebuah thread',
        body: {body: 'body sebuah thread'},
      };

      const token = await TokenHelper.createAccessToken(username = 'dicoding', id = 'user-123');
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads',
        method: 'POST',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 401 when missing authentication', async () => {
      const requestPayload = {
        title: 'title sebuah thread',
        body: 'body sebuah thread',
      };

      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads',
        method: 'POST',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should respond 404 when the thread is not found', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-456',
        method: 'GET',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should respond 200 when successfully requesting thread details', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});
      await UsersTableTestHelper.addUser({id: 'user-789', username: 'Kipli'});
      await CommentsTableTestHelper.addComment({id: 'comment-456', content: 'comment kipli', userId: 'user-789', isDelete: true});
      await LikesTableTestHelper.addLike({owner: 'user-789'});
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123',
        method: 'GET',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
    });
  });
});
