const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../Domains/comments/entities/DetailComment');

class DetailThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { thread } = new DetailThread(useCasePayload);
    await this._threadRepository.checkAvailabilityThread(thread);
    const detailThread = await this._threadRepository.getDetailThread(thread);
    const getCommentsThread = await this._commentRepository.getCommentsThread(thread);
    const payloadComment = {
      comments: getCommentsThread,
    };
    const commentsResult = new DetailComment(payloadComment);
    detailThread.comments = commentsResult.comments;
    const result = { thread: detailThread };
    return result;
  }
}

module.exports = DetailThreadUseCase;
