const CommentHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'comments',
  retister: async (server, { container }) => {
    const commentHandler = new CommentHandler(container);
    server.route(routes(commentHandler));
  },
};
