const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const newComment = new AddComment(useCasePayload);
    return this._commentRepository.addComment(newComment);
  }
}

module.exports = AddCommentUseCase;
