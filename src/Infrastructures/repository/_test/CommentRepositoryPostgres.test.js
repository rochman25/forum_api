const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('CommentRepositoryPostgres', () => {
  it('should be instance of ThreadRepository domain', () => {
    const commentRepositoryPostgres = new CommentRepositoryPostgres({}, {}); // Dummy dependency

    expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepositoryPostgres);
  });

  describe('behavior test', () => {
    afterEach(async () => {
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
  });
});
