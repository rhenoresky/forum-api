const ResultAddThread = require('../ResultAddThread');

describe('a ResultAddThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'Gaming Setup',
    };

    expect(() => new ResultAddThread(payload)).toThrowError('RESULT_ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 321,
      title: 'Gaming Setup',
      owner: true,
    };

    expect(() => new ResultAddThread(payload)).toThrowError('RESULT_ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create resultAddThread object correctly', () => {
    const payload = {
      id: 'thread-321',
      title: 'Gaming Setup',
      owner: 'owner-231',
    };

    const {id, title, owner} = new ResultAddThread(payload);

    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(owner).toEqual(payload.owner);
  });
});
