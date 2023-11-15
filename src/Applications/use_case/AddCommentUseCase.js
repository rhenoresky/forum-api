const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({threadRepository, commentRepository}) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, threadId, userId) {
    const addComment = new AddComment(useCasePayload, threadId, userId);
    await this._threadRepository.checkThreadAvailability(addComment.threadId);
    return this._commentRepository.submitComment(addComment);
  }
};

module.exports = AddCommentUseCase;
