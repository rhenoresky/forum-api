const ResultAddReply = require('../ResultAddReply');

describe('a ResultAddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'comment-123',
      owner: 'user-123',
    };

    expect(() => new ResultAddReply(payload)).toThrowError('RESULT_ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      content: ['sebuah konten'],
      owner: 'user-123',
    };

    expect(() => new ResultAddReply(payload)).toThrowError('RESULT_ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create resultAddReply object correctly', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah konten',
      owner: 'user-123',
    };

    const {id, title, owner} = new ResultAddReply(payload);

    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(owner).toEqual(payload.owner);
  });
});
