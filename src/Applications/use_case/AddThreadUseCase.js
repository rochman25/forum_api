const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newThread = new AddThread(useCasePayload);
    await this._threadRepository.verifyAvailableThread(newThread.title);
    return this._threadRepository.addThread(newThread);
  }
}

module.exports = AddThreadUseCase;
