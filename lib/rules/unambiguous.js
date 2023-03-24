'use strict';




var _unambiguous = require('eslint-module-utils/unambiguous');
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };} /**
                                                                                                                                                                                       * @fileOverview Report modules that could parse incorrectly as scripts.
                                                                                                                                                                                       * @author Ben Mosher
                                                                                                                                                                                       */module.exports = { meta: {
    type: 'suggestion',
    docs: {
      category: 'Module systems',
      description: 'Forbid potentially ambiguous parse goal (`script` vs. `module`).',
      url: (0, _docsUrl2['default'])('unambiguous') },

    schema: [] },


  create: function () {function create(context) {
      // ignore non-modules
      if (context.parserOptions.sourceType !== 'module') {
        return {};
      }

      return {
        Program: function () {function Program(ast) {
            if (!(0, _unambiguous.isModule)(ast)) {
              context.report({
                node: ast,
                message: 'This module could be parsed as a valid script.' });

            }
          }return Program;}() };


    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy91bmFtYmlndW91cy5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwiY2F0ZWdvcnkiLCJkZXNjcmlwdGlvbiIsInVybCIsInNjaGVtYSIsImNyZWF0ZSIsImNvbnRleHQiLCJwYXJzZXJPcHRpb25zIiwic291cmNlVHlwZSIsIlByb2dyYW0iLCJhc3QiLCJyZXBvcnQiLCJub2RlIiwibWVzc2FnZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFLQTtBQUNBLHFDLGlKQU5BOzs7eUxBUUFBLE9BQU9DLE9BQVAsR0FBaUIsRUFDZkMsTUFBTTtBQUNKQyxVQUFNLFlBREY7QUFFSkMsVUFBTTtBQUNKQyxnQkFBVSxnQkFETjtBQUVKQyxtQkFBYSxrRUFGVDtBQUdKQyxXQUFLLDBCQUFRLGFBQVIsQ0FIRCxFQUZGOztBQU9KQyxZQUFRLEVBUEosRUFEUzs7O0FBV2ZDLFFBWGUsK0JBV1JDLE9BWFEsRUFXQztBQUNkO0FBQ0EsVUFBSUEsUUFBUUMsYUFBUixDQUFzQkMsVUFBdEIsS0FBcUMsUUFBekMsRUFBbUQ7QUFDakQsZUFBTyxFQUFQO0FBQ0Q7O0FBRUQsYUFBTztBQUNMQyxlQURLLGdDQUNHQyxHQURILEVBQ1E7QUFDWCxnQkFBSSxDQUFDLDJCQUFTQSxHQUFULENBQUwsRUFBb0I7QUFDbEJKLHNCQUFRSyxNQUFSLENBQWU7QUFDYkMsc0JBQU1GLEdBRE87QUFFYkcseUJBQVMsZ0RBRkksRUFBZjs7QUFJRDtBQUNGLFdBUkksb0JBQVA7OztBQVdELEtBNUJjLG1CQUFqQiIsImZpbGUiOiJ1bmFtYmlndW91cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAZmlsZU92ZXJ2aWV3IFJlcG9ydCBtb2R1bGVzIHRoYXQgY291bGQgcGFyc2UgaW5jb3JyZWN0bHkgYXMgc2NyaXB0cy5cclxuICogQGF1dGhvciBCZW4gTW9zaGVyXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgaXNNb2R1bGUgfSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL3VuYW1iaWd1b3VzJztcclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnTW9kdWxlIHN5c3RlbXMnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0ZvcmJpZCBwb3RlbnRpYWxseSBhbWJpZ3VvdXMgcGFyc2UgZ29hbCAoYHNjcmlwdGAgdnMuIGBtb2R1bGVgKS4nLFxyXG4gICAgICB1cmw6IGRvY3NVcmwoJ3VuYW1iaWd1b3VzJyksXHJcbiAgICB9LFxyXG4gICAgc2NoZW1hOiBbXSxcclxuICB9LFxyXG5cclxuICBjcmVhdGUoY29udGV4dCkge1xyXG4gICAgLy8gaWdub3JlIG5vbi1tb2R1bGVzXHJcbiAgICBpZiAoY29udGV4dC5wYXJzZXJPcHRpb25zLnNvdXJjZVR5cGUgIT09ICdtb2R1bGUnKSB7XHJcbiAgICAgIHJldHVybiB7fTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBQcm9ncmFtKGFzdCkge1xyXG4gICAgICAgIGlmICghaXNNb2R1bGUoYXN0KSkge1xyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICBub2RlOiBhc3QsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGlzIG1vZHVsZSBjb3VsZCBiZSBwYXJzZWQgYXMgYSB2YWxpZCBzY3JpcHQuJyxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH07XHJcblxyXG4gIH0sXHJcbn07XHJcbiJdfQ==