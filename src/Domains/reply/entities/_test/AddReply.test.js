const AddReply = require('../AddReply');

describe('a AddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'Sebuah konten',
    };
    const commentId = 'comment-123';

    expect(() => new AddReply(payload, commentId)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: ['Sebuah konten'],
    };
    const commentId = 123;
    const userId = 'user-123';

    expect(() => new AddReply(payload, commentId, userId)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddReply object correctly', () => {
    const payload = {
      content: 'Sebuah konten',
    };
    const reqCommentId = 'thread-123';
    const userId = 'user-123';

    const {content, commentId, owner} = new AddReply(payload, reqCommentId, userId);
    expect(content).toEqual(payload.content);
    expect(commentId).toEqual(reqCommentId);
    expect(owner).toEqual(userId);
  });
});
