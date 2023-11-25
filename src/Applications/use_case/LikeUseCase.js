class LikeUseCase {
  constructor({likeRepository, commentRepository}) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
  }

  async execute(payload) {
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
