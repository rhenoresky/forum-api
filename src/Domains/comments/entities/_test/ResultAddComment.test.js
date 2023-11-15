const ResultAddComment = require('../ResultAddComment');

describe('a ResultAddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'comment-123',
      owner: 'user-123',
    };

    expect(() => new ResultAddComment(payload)).toThrowError('RESULT_ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      content: ['sebuah konten'],
      owner: 'user-123',
    };

    expect(() => new ResultAddComment(payload)).toThrowError('RESULT_ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create resultAddComment object correctly', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah konten',
      owner: 'user-123',
    };

    const {id, title, owner} = new ResultAddComment(payload);

    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(owner).toEqual(payload.owner);
  });
});
