class AddReply {
  constructor(payload, commentId, owner) {
    this._verifyPayload(payload, commentId, owner);
    const {content} = payload;

    this.content = content;
    this.commentId = commentId;
    this.owner = owner;
  }

  _verifyPayload({content}, commentId, owner) {
    if (!content || !commentId || !owner) {
      throw Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof commentId !== 'string' || typeof owner !== 'string') {
      throw Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddReply;
