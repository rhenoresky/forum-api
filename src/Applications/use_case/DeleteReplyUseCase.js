class DeleteReplyUseCase {
  constructor({replyRepository}) {
    this._replyRepository = replyRepository;
  }

  async execute(params, owner) {
    await this._replyRepository.checkReplyAvailability(params);
    await this._replyRepository.verifyReplyOwner(params.replyId, owner);
    await this._replyRepository.deleteReply(params.replyId);
  }
}

module.exports = DeleteReplyUseCase;
