const AddReply = require('../../../Domains/reply/entities/AddReply');
const ResultAddReply = require('../../../Domains/reply/entities/ResultAddReply');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/reply/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    const useCasePayload = {
      content: 'sebuah content reply',
    };

    const params = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const userId = 'user-123';

    const mockResultAddReply = new ResultAddReply({
      id: 'reply-123',
      content: 'sebuah content reply',
      owner: 'user-123',
    });

    const mockCommentRepository = new CommentRepository;
    const mockReplyRepository = new ReplyRepository;

    mockCommentRepository.checkCommentBelongsToThread = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.submitReply = jest.fn().mockImplementation(() => Promise.resolve(mockResultAddReply));

    const addReplyUseCase = new AddReplyUseCase({commentRepository: mockCommentRepository, replyRepository: mockReplyRepository});

    const resultAddReply = await addReplyUseCase.execute(useCasePayload, params, userId);

    expect(resultAddReply).toStrictEqual(new ResultAddReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: userId,
    }));

    expect(mockCommentRepository.checkCommentBelongsToThread).toBeCalledWith(params);
    expect(mockReplyRepository.submitReply).toBeCalledWith(new AddReply({content: useCasePayload.content}, params.commentId, userId));
  });
});
