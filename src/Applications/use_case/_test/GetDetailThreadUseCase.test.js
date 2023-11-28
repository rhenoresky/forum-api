const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/reply/ReplyRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrating get detail thread action correctly', async () => {
    const threadId = 'thread-123';

    const resultGetThread = {
      id: 'thread-h_2FkLZhtgBKY2kh4CC02',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const resultGetComment = [
      {
        id: 'comment-_pby2_tmXV6bcvcdev8xk',
        username: 'johndoe',
        created_at: '2021-08-08T07:22:33.555Z',
        content: 'comment johndoe',
        is_delete: false,
      },
      {
        id: 'comment-yksuCoxM2s4MMrZJO-qVD',
        username: 'dicoding',
        created_at: '2021-08-08T07:26:21.338Z',
        content: 'comment dicoding',
        is_delete: true,
      },
    ];

    const resultGetReplies = [
      {
        id: 'reply-123',
        username: 'kipli',
        created_at: '2021-08-09',
        content: 'reply kipli',
        is_delete: false,
        comment_id: 'comment-yksuCoxM2s4MMrZJO-qVD',
      },
      {
        id: 'reply-456',
        username: 'wanda',
        created_at: '2021-08-10',
        content: 'reply wanda',
        is_delete: true,
        comment_id: 'comment-_pby2_tmXV6bcvcdev8xk',
      },
    ];

    const expectedResults = {
      id: resultGetThread.id,
      title: resultGetThread.title,
      body: resultGetThread.body,
      date: resultGetThread.date,
      username: resultGetThread.username,
      comments: [
        {
          id: resultGetComment[0].id,
          username: resultGetComment[0].username,
          date: resultGetComment[0].created_at,
          content: resultGetComment[0].content,
          replies: [
            {
              id: resultGetReplies[1].id,
              username: resultGetReplies[1].username,
              date: resultGetReplies[1].created_at,
              content: '**balasan telah dihapus**',
            },
          ],
          likeCount: 8,
        },
        {
          id: resultGetComment[1].id,
          username: resultGetComment[1].username,
          date: resultGetComment[1].created_at,
          content: '**komentar telah dihapus**',
          replies: [
            {
              id: resultGetReplies[0].id,
              username: resultGetReplies[0].username,
              date: resultGetReplies[0].created_at,
              content: resultGetReplies[0].content,
            },
          ],
          likeCount: 0,
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository({});
    const mockCommentRepository = new CommentRepository({});
    const mockReplyRepository = new ReplyRepository({});
    const mockLikeRepository = new LikeRepository({});

    mockThreadRepository.checkThreadAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(resultGetThread));
    mockCommentRepository.getCommentByThreadId = jest.fn().mockImplementation(() => Promise.resolve(resultGetComment));
    mockReplyRepository.getReplyByThreadId = jest.fn().mockImplementation(() => Promise.resolve(resultGetReplies));
    mockLikeRepository.getLikeCountByCommentId = jest.fn().mockImplementation((commentId) => Promise.resolve(commentId === 'comment-_pby2_tmXV6bcvcdev8xk' ? 8 : 0));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({threadRepository: mockThreadRepository, commentRepository: mockCommentRepository, replyRepository: mockReplyRepository, likeRepository: mockLikeRepository});

    const result = await getDetailThreadUseCase.execute(threadId);

    expect(result).toEqual(expectedResults);
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getReplyByThreadId).toBeCalledWith(threadId);
    expect(mockLikeRepository.getLikeCountByCommentId).toBeCalledTimes(2);
  });
});
