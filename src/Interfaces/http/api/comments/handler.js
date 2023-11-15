const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const {id: threadId} = request.params;
    const {id: userId} = request.auth.credentials;
    const addedComment = await addCommentUseCase.execute(request.payload, threadId, userId);
    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }
  async deleteCommentHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    const {threadId, commentId: id} = request.params;
    const {id: userId} = request.auth.credentials;
    await deleteCommentUseCase.execute({id, userId, threadId});
    return {
      status: 'success',
    };
  }
}

module.exports = CommentHandler;
