const AddComment = require('../AddComment');

describe('a AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'Sebuah konten',
    };
    const threadId = 'thread-123';

    expect(() => new AddComment(payload, threadId)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: ['Sebuah konten'],
    };
    const threadId = 123;
    const userId = 'user-123';

    expect(() => new AddComment(payload, threadId, userId)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddComment object correctly', () => {
    const payload = {
      content: 'Sebuah konten',
    };
    const reqThreadId = 'thread-123';
    const userId = 'user-123';

    const {content, threadId, owner} = new AddComment(payload, reqThreadId, userId);
    expect(content).toEqual(payload.content);
    expect(threadId).toEqual(reqThreadId);
    expect(owner).toEqual(userId);
  });
});

