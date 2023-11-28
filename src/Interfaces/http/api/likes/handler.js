const LikeUseCase = require('../../../../Applications/use_case/LikeUseCase');

class LikeHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request, h) {
    const likeUseCase = this._container.getInstance(LikeUseCase.name);
    const {commentId, threadId} = request.params;
    const {id: owner} = request.auth.credentials;

    await likeUseCase.execute({threadId, commentId, owner});
    return {
      status: 'success',
    };
  }
}

module.exports = LikeHandler;
