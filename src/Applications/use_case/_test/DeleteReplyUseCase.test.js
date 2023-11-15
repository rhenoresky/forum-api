const ReplyRepository = require('../../../Domains/reply/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    const params = {
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    const owner = 'user-789';

    const mockReplyRepository = new ReplyRepository({});
    mockReplyRepository.checkReplyAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn().mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({replyRepository: mockReplyRepository});

    await deleteReplyUseCase.execute(params, owner);

    expect(mockReplyRepository.checkReplyAvailability).toBeCalledWith(params);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(params.replyId, owner);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(params.replyId);
  });
});
