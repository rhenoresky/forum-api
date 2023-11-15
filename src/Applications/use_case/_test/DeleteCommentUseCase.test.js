const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    const useCasePayload = {
      id: 'comment-123',
      userId: 'user-456',
      threadId: 'thread-123',
    };

    const mockCommentRepository = new CommentRepository({});
    const mockThreadRepository = new ThreadRepository({});
    mockThreadRepository.checkThreadAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkCommentAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn().mockImplementation(() => Promise.resolve());
    const deleteCommentUseCase = new DeleteCommentUseCase({threadRepository: mockThreadRepository, commentRepository: mockCommentRepository});

    await deleteCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith(useCasePayload.id);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(useCasePayload.id, useCasePayload.userId);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(useCasePayload);
  });
});
