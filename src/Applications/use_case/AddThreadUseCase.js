const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({threadRepository}) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, idUser) {
    const addThread = new AddThread(useCasePayload, idUser);
    return this._threadRepository.submitThread(addThread);
  }
}

module.exports = AddThreadUseCase;
