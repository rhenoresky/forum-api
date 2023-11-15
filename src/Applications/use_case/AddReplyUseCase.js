const AddReply = require('../../Domains/reply/entities/AddReply');

class AddReplyUseCase {
  constructor({commentRepository, replyRepository}) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(payload, params, owner) {
    await this._commentRepository.checkCommentBelongsToThread(params);
    const {commentId} = params;
    const addReply = new AddReply(payload, commentId, owner);
    return this._replyRepository.submitReply(addReply);
  }
}

module.exports = AddReplyUseCase;
