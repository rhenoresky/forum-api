const AddThread = require('../AddThread');

describe('a AddThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'Gaming Setup',
    };
    const idUser = 'user-123';

    expect(() => new AddThread(payload, idUser)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 234,
      body: true,
    };

    const idUser = 'user-123';
    expect(() => new AddThread(payload, idUser)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddThread object correctly', () => {
    const payload = {
      title: 'Gaming Setup',
      body: 'Lorem ipsum dolor amet smith',
    };

    const idUser = 'user-123';

    const {title, body, owner} = new AddThread(payload, idUser);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(idUser);
  });
});
