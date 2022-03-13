const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

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
