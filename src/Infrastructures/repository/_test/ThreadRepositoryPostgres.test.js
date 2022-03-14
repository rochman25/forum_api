const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('ThreadRepositoryPostgres', () => {
  it('should be instance of ThreadRepository domain', () => {
    const threadRepositoryPostgres = new ThreadRepositoryPostgres({}, {}); // Dummy dependency

    expect(threadRepositoryPostgres).toBeInstanceOf(ThreadRepository);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('verifyAvailableThread function', () => {
      it('should throw InvariantError when thread not available', async () => {
        await UsersTableTestHelper.addUser({ id: 'user-1234567', username: 'zaen' });
        await ThreadsTableTestHelper.addThread({ title: 'a thread', owner: 'user-1234567' });
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyAvailableThread('a thread')).rejects.toThrowError(InvariantError);
      });

      it('should not throw InvariantError when thread available', async () => {
        // Arrange
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        // Action & Assert
        await expect(threadRepositoryPostgres.verifyAvailableThread('a thread')).resolves.not.toThrowError(InvariantError);
      });
    });

    describe('addThread function', () => {
      it('should persist new thread and return added thread correctly', async () => {
        await UsersTableTestHelper.addUser({ id: 'user-123456', username: 'zaenur' });

        const newThread = new AddThread({
          title: 'a thread',
          body: 'lorem ipsum dolor sit amet',
          owner: 'user-123456',
        });

        const fakeIdGenerator = () => '123456789abcdef';
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

        const addedThread = await threadRepositoryPostgres.addThread(newThread);

        const thread = await ThreadsTableTestHelper.findThreadsById('thread-h_123456789abcdef');
        expect(addedThread).toStrictEqual(new AddedThread({
          id: 'thread-h_123456789abcdef',
          title: 'a thread',
          owner: 'user-123456',
        }));
        expect(thread).toHaveLength(1);
      });
    });
  });
});
