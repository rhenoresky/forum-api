const AddComment = require('../../../Domains/comments/entities/AddComment');
const ResultAddComment = require('../../../Domains/comments/entities/ResultAddComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = {
      content: 'sebuah konten',
    };
    const threadId = 'thread-123';
    const userId = 'user-123';

    const mockResultAddComment = new ResultAddComment({
      id: 'comment-123',
      content: 'sebuah konten',
      owner: 'user-123',
    });

    const mockCommentRepository = new CommentRepository({});
    const mockThreadRepository = new ThreadRepository({});

    mockThreadRepository.checkThreadAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.submitComment = jest.fn().mockImplementation(() => Promise.resolve(mockResultAddComment));

    const addCommentUseCase = new AddCommentUseCase({threadRepository: mockThreadRepository, commentRepository: mockCommentRepository});

    const resultAddComment = await addCommentUseCase.execute(useCasePayload, threadId, userId);

    expect(resultAddComment).toStrictEqual(new ResultAddComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: userId,
    }));

    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith(threadId);
    expect(mockCommentRepository.submitComment).toBeCalledWith(new AddComment({content: useCasePayload.content}, threadId, userId));
  });
});

