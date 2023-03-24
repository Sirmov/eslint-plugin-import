'use strict';




var _resolve = require('eslint-module-utils/resolve');var _resolve2 = _interopRequireDefault(_resolve);
var _moduleVisitor = require('eslint-module-utils/moduleVisitor');var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

function isImportingSelf(context, node, requireName) {
  var filePath = context.getPhysicalFilename ? context.getPhysicalFilename() : context.getFilename();

  // If the input is from stdin, this test can't fail
  if (filePath !== '<text>' && filePath === (0, _resolve2['default'])(requireName, context)) {
    context.report({
      node: node,
      message: 'Module imports itself.' });

  }
} /**
   * @fileOverview Forbids a module from importing itself
   * @author Gio d'Amelio
   */module.exports = { meta: {
    type: 'problem',
    docs: {
      category: 'Static analysis',
      description: 'Forbid a module from importing itself.',
      recommended: true,
      url: (0, _docsUrl2['default'])('no-self-import') },


    schema: [] },

  create: function () {function create(context) {
      return (0, _moduleVisitor2['default'])(function (source, node) {
        isImportingSelf(context, node, source.value);
      }, { commonjs: true });
    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1zZWxmLWltcG9ydC5qcyJdLCJuYW1lcyI6WyJpc0ltcG9ydGluZ1NlbGYiLCJjb250ZXh0Iiwibm9kZSIsInJlcXVpcmVOYW1lIiwiZmlsZVBhdGgiLCJnZXRQaHlzaWNhbEZpbGVuYW1lIiwiZ2V0RmlsZW5hbWUiLCJyZXBvcnQiLCJtZXNzYWdlIiwibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJyZWNvbW1lbmRlZCIsInVybCIsInNjaGVtYSIsImNyZWF0ZSIsInNvdXJjZSIsInZhbHVlIiwiY29tbW9uanMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBS0Esc0Q7QUFDQSxrRTtBQUNBLHFDOztBQUVBLFNBQVNBLGVBQVQsQ0FBeUJDLE9BQXpCLEVBQWtDQyxJQUFsQyxFQUF3Q0MsV0FBeEMsRUFBcUQ7QUFDbkQsTUFBTUMsV0FBV0gsUUFBUUksbUJBQVIsR0FBOEJKLFFBQVFJLG1CQUFSLEVBQTlCLEdBQThESixRQUFRSyxXQUFSLEVBQS9FOztBQUVBO0FBQ0EsTUFBSUYsYUFBYSxRQUFiLElBQXlCQSxhQUFhLDBCQUFRRCxXQUFSLEVBQXFCRixPQUFyQixDQUExQyxFQUF5RTtBQUN2RUEsWUFBUU0sTUFBUixDQUFlO0FBQ2JMLGdCQURhO0FBRWJNLGVBQVMsd0JBRkksRUFBZjs7QUFJRDtBQUNGLEMsQ0FuQkQ7OztLQXFCQUMsT0FBT0MsT0FBUCxHQUFpQixFQUNmQyxNQUFNO0FBQ0pDLFVBQU0sU0FERjtBQUVKQyxVQUFNO0FBQ0pDLGdCQUFVLGlCQUROO0FBRUpDLG1CQUFhLHdDQUZUO0FBR0pDLG1CQUFhLElBSFQ7QUFJSkMsV0FBSywwQkFBUSxnQkFBUixDQUpELEVBRkY7OztBQVNKQyxZQUFRLEVBVEosRUFEUzs7QUFZZkMsUUFaZSwrQkFZUmxCLE9BWlEsRUFZQztBQUNkLGFBQU8sZ0NBQWMsVUFBQ21CLE1BQUQsRUFBU2xCLElBQVQsRUFBa0I7QUFDckNGLHdCQUFnQkMsT0FBaEIsRUFBeUJDLElBQXpCLEVBQStCa0IsT0FBT0MsS0FBdEM7QUFDRCxPQUZNLEVBRUosRUFBRUMsVUFBVSxJQUFaLEVBRkksQ0FBUDtBQUdELEtBaEJjLG1CQUFqQiIsImZpbGUiOiJuby1zZWxmLWltcG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAZmlsZU92ZXJ2aWV3IEZvcmJpZHMgYSBtb2R1bGUgZnJvbSBpbXBvcnRpbmcgaXRzZWxmXHJcbiAqIEBhdXRob3IgR2lvIGQnQW1lbGlvXHJcbiAqL1xyXG5cclxuaW1wb3J0IHJlc29sdmUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJztcclxuaW1wb3J0IG1vZHVsZVZpc2l0b3IgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9tb2R1bGVWaXNpdG9yJztcclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XHJcblxyXG5mdW5jdGlvbiBpc0ltcG9ydGluZ1NlbGYoY29udGV4dCwgbm9kZSwgcmVxdWlyZU5hbWUpIHtcclxuICBjb25zdCBmaWxlUGF0aCA9IGNvbnRleHQuZ2V0UGh5c2ljYWxGaWxlbmFtZSA/IGNvbnRleHQuZ2V0UGh5c2ljYWxGaWxlbmFtZSgpIDogY29udGV4dC5nZXRGaWxlbmFtZSgpO1xyXG5cclxuICAvLyBJZiB0aGUgaW5wdXQgaXMgZnJvbSBzdGRpbiwgdGhpcyB0ZXN0IGNhbid0IGZhaWxcclxuICBpZiAoZmlsZVBhdGggIT09ICc8dGV4dD4nICYmIGZpbGVQYXRoID09PSByZXNvbHZlKHJlcXVpcmVOYW1lLCBjb250ZXh0KSkge1xyXG4gICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICBub2RlLFxyXG4gICAgICBtZXNzYWdlOiAnTW9kdWxlIGltcG9ydHMgaXRzZWxmLicsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdwcm9ibGVtJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgY2F0ZWdvcnk6ICdTdGF0aWMgYW5hbHlzaXMnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0ZvcmJpZCBhIG1vZHVsZSBmcm9tIGltcG9ydGluZyBpdHNlbGYuJyxcclxuICAgICAgcmVjb21tZW5kZWQ6IHRydWUsXHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8tc2VsZi1pbXBvcnQnKSxcclxuICAgIH0sXHJcblxyXG4gICAgc2NoZW1hOiBbXSxcclxuICB9LFxyXG4gIGNyZWF0ZShjb250ZXh0KSB7XHJcbiAgICByZXR1cm4gbW9kdWxlVmlzaXRvcigoc291cmNlLCBub2RlKSA9PiB7XHJcbiAgICAgIGlzSW1wb3J0aW5nU2VsZihjb250ZXh0LCBub2RlLCBzb3VyY2UudmFsdWUpO1xyXG4gICAgfSwgeyBjb21tb25qczogdHJ1ZSB9KTtcclxuICB9LFxyXG59O1xyXG4iXX0=