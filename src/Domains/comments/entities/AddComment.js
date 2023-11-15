class AddComment {
  constructor(payload, threadId, owner) {
    this._verifyPayload(payload, threadId, owner);
    const {content} = payload;

    this.content = content;
    this.threadId = threadId;
    this.owner = owner;
  }

  _verifyPayload({content}, threadId, owner) {
    if (!content || !threadId || !owner) {
      throw Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof threadId !== 'string' || typeof owner !== 'string') {
      throw Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddComment;
