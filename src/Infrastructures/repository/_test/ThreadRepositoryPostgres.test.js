const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  it('should be instance of ThreadRepository domain', () => {
    const threadRepositoryPostgres = new ThreadRepositoryPostgres({}, {}); // Dummy dependency

    expect(threadRepositoryPostgres).toBeInstanceOf(ThreadRepository);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
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

    describe('checkAvailabilityThread function', () => {
      it('should throw NotFoundError if thread not available', async () => {
        // Arrange
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
        const threadId = 'xxx';

        // Action & Assert
        await expect(threadRepositoryPostgres.checkAvailabilityThread(threadId))
          .rejects.toThrow(NotFoundError);
      });

      it('should not throw NotFoundError if thread available', async () => {
        // Arrange
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: 'user-123456789', username: 'zaenurr05' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-h_123', body: 'sebuah thread', owner: 'user-123456789' });

        // Action & Assert
        await expect(threadRepositoryPostgres.checkAvailabilityThread('thread-h_123'))
          .resolves.not.toThrow(NotFoundError);
      });
    });

    describe('getDetailThread function', () => {
      it('should get detail thread', async () => {
        const threadRepository = new ThreadRepositoryPostgres(pool, {});
        const userPayload = { id: 'user-12345678910', username: 'zaenurr07' };
        const threadPayload = {
          id: 'thread-h_12345678X1',
          title: 'sebuah judul thread',
          body: 'sebuah thread',
          owner: 'user-12345678910',
        };
        await UsersTableTestHelper.addUser(userPayload);
        await ThreadsTableTestHelper.addThread(threadPayload);

        const detailThread = await threadRepository.getDetailThread(threadPayload.id);

        expect(detailThread.id).toEqual(threadPayload.id);
        expect(detailThread.title).toEqual(threadPayload.title);
        expect(detailThread.body).toEqual(threadPayload.body);
        expect(detailThread.username).toEqual(userPayload.username);
      });
    });
  });
});
