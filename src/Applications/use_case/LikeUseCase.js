class LikeUseCase {
  constructor({likeRepository, commentRepository, threadRepository}) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(payload) {
    await this._threadRepository.checkThreadAvailability(payload.threadId);
    await this._commentRepository.checkCommentAvailability(payload.commentId);
    const resultCheck = await this._likeRepository.checkLikeIsExist(payload);
    if (resultCheck) {
      await this._likeRepository.removeLike(payload);
    } else {
      await this._likeRepository.addLike(payload);
    }
  }
}

module.exports = LikeUseCase;
