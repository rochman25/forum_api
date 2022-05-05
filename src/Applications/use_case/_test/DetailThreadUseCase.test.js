const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThreadUseCase = require('../DetailThreadUseCase');

describe('DetailThreadUseCase', () => {
  it('should get return detail thread correctly', async () => {
    const useCasePayload = {
      thread: 'thread-h_123',
    };

    const expectedThread = {
      id: 'thread-h_123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08 14.00',
      username: 'dicoding',
    };

    const expectedComment = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08 14.00',
        content: 'sebuah comment',
        is_deleted: 0,
      },
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08 14.00',
        content: 'sebuah comment',
        is_deleted: 1,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve());
    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentsThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComment));

    const detailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const detailThread = await detailThreadUseCase.execute(useCasePayload);

    expect(mockThreadRepository.getDetailThread)
      .toHaveBeenCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.getCommentsThread)
      .toHaveBeenCalledWith(useCasePayload.thread);
    expect(detailThread).toStrictEqual({
      thread: {
        id: 'thread-h_123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08 14.00',
        username: 'dicoding',
        comments: [
          {
            id: 'comment-123',
            username: 'dicoding',
            date: '2021-08-08 14.00',
            content: 'sebuah comment',
          },
          {
            id: 'comment-123',
            username: 'dicoding',
            date: '2021-08-08 14.00',
            content: '**komentar telah dihapus**',
          },
        ],
      },
    });
  });
});
