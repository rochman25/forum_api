const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 401 if payload not access token', async () => {
      // Arrange
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments',
        payload: {},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 if payload not contain needed property', async () => {
      // Arrange
      const loginPayload = {
        username: 'zaenur09',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'zaenur09',
          password: 'secret',
          fullname: 'Zaenurrochman',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'lorem ipsum dolorr sit amet',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const threadResponse = JSON.parse(thread.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {},
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 if payload not meet data type specification', async () => {
      const loginPayload = {
        username: 'zaenur09',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'zaenur09',
          password: 'secret',
          fullname: 'Zaenurrochman',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'lorem ipsum dolorr sit amet',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const threadResponse = JSON.parse(thread.payload);
      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {
          content: 123,
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
    });

    it('should response 404 if thread id not valid', async () => {
      const loginPayload = {
        username: 'zaenur09',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'zaenur09',
          password: 'secret',
          fullname: 'Zaenurrochman',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments',
        payload: {
          content: 'sebuah komentar',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan di database');
    });

    it('should response 201 and return addedComment', async () => {
      const loginPayload = {
        username: 'zaenur09',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'zaenur09',
          password: 'secret',
          fullname: 'Zaenurrochman',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'lorem ipsum dolorr sit amet',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const threadResponse = JSON.parse(thread.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {
          content: 'sebuah komentar',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment.content).toEqual('sebuah komentar');
    });
  });

  describe('when DELETE /threads/{threadId}/comments', () => {
    it('should response 403 if another user delete the comment', async () => {
      const loginPayload = {
        username: 'zaenur09',
        password: 'secret',
      };

      const loginPayload2 = {
        username: 'zaenur10',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'zaenur09',
          password: 'secret',
          fullname: 'Zaenurrochman',
        },
      });

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'zaenur10',
          password: 'secret',
          fullname: 'Zaenurrochman',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'lorem ipsum dolorr sit amet',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const threadResponse = JSON.parse(thread.payload);

      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {
          content: 'sebuah komentar',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const commentResponse = JSON.parse(comment.payload);

      const authentication2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload2,
      });

      const responseAuth2 = JSON.parse(authentication2.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}`,
        headers: { Authorization: `Bearer ${responseAuth2.data.accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak bisa menghapus komentar orang lain.');
    });

    it('should response 404 if token not found', async () => {
      const loginPayload = {
        username: 'zaenur09',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'zaenur09',
          password: 'secret',
          fullname: 'Zaenurrochman',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/xxx/comments/xxx',
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan di database');
    });

    it('should response 404 if comment not found', async () => {
      const loginPayload = {
        username: 'zaenur09',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'zaenur09',
          password: 'secret',
          fullname: 'Zaenurrochman',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'lorem ipsum dolorr sit amet',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const threadResponse = JSON.parse(thread.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadResponse.data.addedThread.id}/comments/xxx`,
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan di database');
    });

    it('should response 200 and return success', async () => {
      const loginPayload = {
        username: 'zaenur09',
        password: 'secret',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'zaenur09',
          password: 'secret',
          fullname: 'Zaenurrochman',
        },
      });

      const authentication = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const responseAuth = JSON.parse(authentication.payload);

      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'lorem ipsum dolorr sit amet',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const threadResponse = JSON.parse(thread.payload);

      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {
          content: 'sebuah komentar',
        },
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const commentResponse = JSON.parse(comment.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}`,
        headers: { Authorization: `Bearer ${responseAuth.data.accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
