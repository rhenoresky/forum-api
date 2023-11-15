const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const TokenHelper = require('../../../../tests/TokenHelper');
const container = require('../../container');
const createServer = require('../../http/createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      const requestPayload = {
        content: 'sebuah konten',
      };

      const token = await TokenHelper.createAccessToken(username = 'robin', id = 'user-456');
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments',
        method: 'POST',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should respond to 404 when the thread is not found', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      const requestPayload = {
        content: 'sebuah konten',
      };

      const token = await TokenHelper.createAccessToken(username = 'robin', id = 'user-456');
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-789/comments',
        method: 'POST',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      const requestPayload = {};
      const token = await TokenHelper.createAccessToken(username = 'robin', id = 'user-456');
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments',
        method: 'POST',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan comment karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      const requestPayload = {
        content: ['sebuah konten'],
      };
      const token = await TokenHelper.createAccessToken(username = 'robin', id = 'user-456');
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments',
        method: 'POST',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan comment karena tipe data tidak sesuai');
    });

    it('should response 401 when missing authentication', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      const requestPayload = {
        content: 'sebuah konten',
      };

      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments',
        method: 'POST',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should delete the comment and respond correctly', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      const token = await TokenHelper.createAccessToken(username = 'Roberts', id = 'user-456');
      await CommentsTableTestHelper.addComment({});

      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123',
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('Should respond 403 if not the comment owner who sent request', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Roberts'});
      const token = await TokenHelper.createAccessToken(username = 'Kipli', id = 'user-789');
      await CommentsTableTestHelper.addComment({});

      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123',
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda bukan pemilik comment ini');
    });

    it('should respond 404 if thread is not found', async () => {
      const token = await TokenHelper.createAccessToken(username = 'Roberts', id = 'user-456');

      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123',
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
    it('should respond 404 if comment is not found', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      const token = await TokenHelper.createAccessToken(username = 'Roberts', id = 'user-456');

      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123',
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment tidak ditemukan');
    });
  });
});
