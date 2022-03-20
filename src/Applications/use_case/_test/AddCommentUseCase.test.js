const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');
const AddComment = require('../../../Domains/comments/entities/AddComment');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = {
      thread: 'thread-h_123',
      content: 'sebuah komentar',
      owner: 'user-123',
    };

    const expectedAddedComment = new AddedComment({
      id: 'comment-_pby2_123',
      content: 'sebuah komentar',
      owner: 'user-123',
    });

    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedComment));

    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    const addedComment = await getCommentUseCase.execute(useCasePayload);

    expect(addedComment).toStrictEqual((expectedAddedComment));
    expect(mockCommentRepository.addComment).toBeCalledWith(new AddComment({
      thread: useCasePayload.thread,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));
  });
});
