const AddComment = require('../AddComment');

describe('a AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      thread: 'thread-h_123',
      owner: 'user-123',
    };

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      thread: 'thread-h_123',
      owner: 'user-123',
      content: true,
    };

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create new comment object correctly', () => {
    const payload = {
      thread: 'thread-h_123',
      owner: 'user-123',
      content: 'ini komentar',
    };

    const { content, thread, owner } = new AddComment(payload);

    expect(content).toEqual(payload.content);
    expect(thread).toEqual(payload.thread);
    expect(owner).toEqual(payload.owner);
  });
});
