const AddThread = require('../../../Domains/threads/entities/AddThread');
const ResultAddThread = require('../../../Domains/threads/entities/ResultAddThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const useCasePayload = {
      title: 'Title Sebuah Thread',
      body: 'Body Dari Sebuah Thread',
    };

    const idUser = 'user-123';

    const mockResultAddThread = new ResultAddThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: idUser,
    });

    const mockThreadRepository = new ThreadRepository({});

    mockThreadRepository.submitThread = jest.fn().mockImplementation(() => Promise.resolve(mockResultAddThread));

    const addThreadUseCase = new AddThreadUseCase({threadRepository: mockThreadRepository});

    const resultAddThread = await addThreadUseCase.execute(useCasePayload, idUser);

    expect(resultAddThread).toStrictEqual(new ResultAddThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: idUser,
    }));
    expect(mockThreadRepository.submitThread).toBeCalledWith(new AddThread({title: useCasePayload.title, body: useCasePayload.body}, owner = idUser));
  });
});
