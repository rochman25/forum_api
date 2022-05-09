class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);
    const comments = this._remappingPayload(payload);
    this.comments = comments;
  }

  _verifyPayload({ comments }) {
    if (!comments) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (!Array.isArray(comments)) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _remappingPayload({ comments }) {
    return comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
    }));
  }
}

module.exports = DetailComment;
