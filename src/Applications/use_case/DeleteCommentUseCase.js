class DeleteCommentUseCase {
  constructor({threadRepository, commentRepository}) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.checkThreadAvailability(useCasePayload.threadId);
    await this._commentRepository.checkCommentAvailability(useCasePayload.id);
    await this._commentRepository.verifyCommentOwner(useCasePayload.id, useCasePayload.userId);
    await this._commentRepository.deleteComment(useCasePayload);
  }
}

module.exports = DeleteCommentUseCase;
