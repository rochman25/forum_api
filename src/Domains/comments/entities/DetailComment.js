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
    const results = [];
    comments.forEach((a) => {
      const comment = {
        id: a.id,
        username: a.username,
        date: a.date,
        content: a.content,
      };
      if (a.is_deleted > 0) {
        comment.content = '**komentar telah dihapus**';
      }
      results.push(comment);
    });
    return results;
  }
}

module.exports = DetailComment;
