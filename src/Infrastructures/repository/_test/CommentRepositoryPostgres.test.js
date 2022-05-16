const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  it('should be instance of ThreadRepository domain', () => {
    const commentRepositoryPostgres = new CommentRepositoryPostgres({}, {}); // Dummy dependency

    expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepositoryPostgres);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addComment function', () => {
      it('should persist new comment and return added comment correctly', async () => {
        await UsersTableTestHelper.addUser({ id: 'user-1234567', username: 'zaenurr' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-h_123', body: 'sebuah thread', owner: 'user-1234567' });

        const newComment = new AddComment({
          content: 'sebuah komentar',
          thread: 'thread-h_123',
          owner: 'user-1234567',
        });

        const fakeIdGenerator = () => '123456789abcdef';
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

        const addedComment = await commentRepositoryPostgres.addComment(newComment);

        const comment = await CommentsTableTestHelper.findCommentsById('comment-_pby2_123456789abcdef');
        expect(addedComment).toStrictEqual(new AddedComment({
          id: 'comment-_pby2_123456789abcdef',
          content: 'sebuah komentar',
          owner: 'user-1234567',
        }));
        expect(comment).toHaveLength(1);
      });
    });

    describe('checkAvailabilityComment function', () => {
      it('should throw NotFoundError if comment not available', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        const comment = 'xxx';

        // Action & Assert
        await expect(commentRepositoryPostgres.checkAvailabilityComment(comment))
          .rejects.toThrow(NotFoundError);
      });

      it('should not throw NotFoundError if comment available', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: 'user-123456799', username: 'zaenurr01' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-h_123456', body: 'sebuah thread', owner: 'user-123456799' });
        await CommentsTableTestHelper.addComment({
          id: 'comment-_pby2-123456', content: 'sebuah komentar', thread: 'thread-h_123456', owner: 'user-123456799',
        });

        // Action & Assert
        await expect(commentRepositoryPostgres.checkAvailabilityComment('comment-_pby2-123456'))
          .resolves.not.toThrow(NotFoundError);
      });
    });

    describe('verifyCommentOwner function', () => {
      it('should throw AuthorizationError if comment not belong to owner', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: 'user-123456999', username: 'zaenurr02' });
        await UsersTableTestHelper.addUser({ id: 'user-123459999', username: 'zaenurr03' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-h_1234567', body: 'sebuah thread', owner: 'user-123456999' });
        await CommentsTableTestHelper.addComment({
          id: 'comment-_pby2-1234567', content: 'sebuah komentar', thread: 'thread-h_1234567', owner: 'user-123456999',
        });
        const comment = 'comment-_pby2-1234567';
        const owner = 'user-123459999';

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyCommentOwner(comment, owner))
          .rejects.toThrow(AuthorizationError);
      });

      it('should not throw AuthorizationError if comment is belongs to owner', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: 'user-123499999', username: 'zaenurr04' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-h_12345678', body: 'sebuah thread', owner: 'user-123499999' });
        await CommentsTableTestHelper.addComment({
          id: 'comment-_pby2-123456789', content: 'sebuah komentar', thread: 'thread-h_12345678', owner: 'user-123499999',
        });

        // Action & Assert
        await expect(commentRepositoryPostgres.verifyCommentOwner('comment-_pby2-123456789', 'user-123499999'))
          .resolves.not.toThrow(AuthorizationError);
      });
    });

    describe('deleteComment', () => {
      it('should delete comment from database', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: 'user-123999999', username: 'zaenurr11' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-h_123456789', body: 'sebuah thread', owner: 'user-123999999' });
        await CommentsTableTestHelper.addComment({
          id: 'comment-_pby2-1234567810', content: 'sebuah komentar', thread: 'thread-h_123456789', owner: 'user-123999999',
        });

        // Action
        await commentRepositoryPostgres.deleteComment('comment-_pby2-1234567810');

        // Assert
        const comment = await CommentsTableTestHelper.checkIsDeletedCommentsById('comment-_pby2-1234567810');
        expect(comment).toEqual(true);
      });
    });

    describe('getCommentsThread', () => {
      it('should get comments of thread', async () => {
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        const userPayload = { id: 'user-12345678910', username: 'zaenurr07' };
        const threadPayload = {
          id: 'thread-h_12345678X1',
          title: 'sebuah judul thread',
          body: 'sebuah thread',
          owner: 'user-12345678910',
        };
        const commentPayload = {
          id: 'comment-_pby2-1234567811',
          content: 'sebuah komentar',
          thread: threadPayload.id,
          owner: userPayload.id,
        };

        await UsersTableTestHelper.addUser(userPayload);
        await ThreadsTableTestHelper.addThread(threadPayload);
        await CommentsTableTestHelper.addComment(commentPayload);

        const comments = await commentRepositoryPostgres.getCommentsThread(threadPayload.id);

        expect(Array.isArray(comments)).toBe(true);
        expect(comments[0].id).toEqual(commentPayload.id);
        expect(comments[0].username).toEqual(userPayload.username);
        expect(comments[0].content).toEqual('sebuah komentar');
        expect(comments[0].date).toBeDefined();
      });
    });
  });
});
