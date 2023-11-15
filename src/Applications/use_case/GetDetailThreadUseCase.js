class GetDetailThreadUseCase {
  constructor({threadRepository, commentRepository, replyRepository}) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    await this._threadRepository.checkThreadAvailability(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentByThreadId(threadId);
    const reply = await this._replyRepository.getReplyByThreadId(threadId);
    thread.comments = this._filterComments(comments);
    thread.comments = this._filterReply(thread.comments, reply);
    return thread;
  }

  _filterComments(comments) {
    return comments.map((comment) => {
      comment.content = comment.is_delete ? '**komentar telah dihapus**' : comment.content;
      comment.date = comment.created_at;
      delete comment.is_delete;
      delete comment.created_at;
      return comment;
    });
  }

  _filterReply(comments, reply) {
    return comments.map((comment) => {
      comment.replies = reply.filter((data) => data.comment_id === comment.id).map((item) => {
        item.content = item.is_delete ? '**balasan telah dihapus**' : item.content;
        item.date = item.created_at;
        delete item.created_at;
        delete item.is_delete;
        delete item.comment_id;
        return item;
      });
      return comment;
    });
  }
}

module.exports = GetDetailThreadUseCase;
