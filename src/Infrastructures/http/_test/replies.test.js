const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');
const TokenHelper = require('../../../../tests/TokenHelper');
const container = require('../../container');
const createServer = require('../../http/createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ReplyTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});

      const requestPayload = {
        content: 'sebuah konten reply',
      };

      const token = await TokenHelper.createAccessToken(username = 'robin', id = 'user-789');
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/replies',
        method: 'POST',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should return with 400 when payload has missing requirements', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});

      const requestPayload = {};

      const token = await TokenHelper.createAccessToken(username = 'robin', id = 'user-789');
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/replies',
        method: 'POST',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should return with 400 when payload wrong data type', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});

      const requestPayload = {
        content: ['sebuah konten reply'],
      };

      const token = await TokenHelper.createAccessToken(username = 'robin', id = 'user-789');
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/replies',
        method: 'POST',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should be returned with a 404 when comment does not belong to thread', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});
      await UsersTableTestHelper.addUser({id: 'user-789', username: 'Kipli'});
      await ThreadsTableTestHelper.addThread({id: 'thread-456', userId: 'user-789'});

      const requestPayload = {
        content: 'sebuah konten reply',
      };

      const token = await TokenHelper.createAccessToken(username = 'robin', id = 'user-1020');
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-456/comments/comment-123/replies',
        method: 'POST',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('Should respond 403 if not the reply owner who sent request', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});
      await UsersTableTestHelper.addUser({id: 'user-789', username: 'Kipli'});
      await ReplyTableTestHelper.addReply({});
      const token = await TokenHelper.createAccessToken('Sandi', 'user-1020');

      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should respond 404 if reply is not found', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});
      const token = await TokenHelper.createAccessToken('Kipli', 'user-789');
      await ReplyTableTestHelper.addReply({});

      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/replies/reply-456',
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should delete the reply and respond correctly', async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});
      await UsersTableTestHelper.addUser({id: 'user-456', username: 'Robert'});
      await CommentsTableTestHelper.addComment({});
      const token = await TokenHelper.createAccessToken('Kipli', 'user-789');
      await ReplyTableTestHelper.addReply({});

      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
