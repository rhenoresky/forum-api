const DetailThread = require('../DetailThread');

describe('a DetailThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'thread-123',
      title: 'Sebuah thread',
    };

    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: 'Sebuah thread',
      body: ['Sebuah body thread'],
      date: '12-20-1999',
      username: 'kipli',
    };

    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'Sebuah thread',
      body: 'Sebuah body thread',
      date: '12-20-1999',
      username: 'kipli',
    };

    const {id, title, body, date, username} = new DetailThread(payload);

    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
  });
});
