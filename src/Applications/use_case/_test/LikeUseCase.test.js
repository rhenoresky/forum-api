const LikeRepository = require('../../../Domains/likes/LikeRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeUseCase = require('../LikeUseCase');

describe('LikeUseCase', () => {
  it('should orchestrating the likes action correctly', async () => {
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockLikeRepository = new LikeRepository;
    const mockCommentRepository = new CommentRepository;
    const mockThreadRepository = new ThreadRepository;

    mockCommentRepository.checkCommentAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkLikeIsExist = jest.fn().mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn().mockImplementation(() => Promise.resolve());
    mockThreadRepository.checkThreadAvailability = jest.fn().mockImplementation(() => Promise.resolve());

    const likeUseCase = new LikeUseCase({likeRepository: mockLikeRepository, commentRepository: mockCommentRepository, threadRepository: mockThreadRepository});

    await likeUseCase.execute(payload);

    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith(payload.threadId);
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith(payload.commentId);
    expect(mockLikeRepository.checkLikeIsExist).toBeCalledWith(payload);
    expect(mockLikeRepository.addLike).toBeCalledWith(payload);
  });
});
