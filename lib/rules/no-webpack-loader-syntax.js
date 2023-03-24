'use strict';var _moduleVisitor = require('eslint-module-utils/moduleVisitor');var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

function reportIfNonStandard(context, node, name) {
  if (name && name.indexOf('!') !== -1) {
    context.report(node, 'Unexpected \'!\' in \'' + String(name) + '\'. ' +
    'Do not use import syntax to configure webpack loaders.');

  }
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      category: 'Static analysis',
      description: 'Forbid webpack loader syntax in imports.',
      url: (0, _docsUrl2['default'])('no-webpack-loader-syntax') },

    schema: [] },


  create: function () {function create(context) {
      return (0, _moduleVisitor2['default'])(function (source, node) {
        reportIfNonStandard(context, node, source.value);
      }, { commonjs: true });
    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby13ZWJwYWNrLWxvYWRlci1zeW50YXguanMiXSwibmFtZXMiOlsicmVwb3J0SWZOb25TdGFuZGFyZCIsImNvbnRleHQiLCJub2RlIiwibmFtZSIsImluZGV4T2YiLCJyZXBvcnQiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwiY2F0ZWdvcnkiLCJkZXNjcmlwdGlvbiIsInVybCIsInNjaGVtYSIsImNyZWF0ZSIsInNvdXJjZSIsInZhbHVlIiwiY29tbW9uanMiXSwibWFwcGluZ3MiOiJhQUFBLGtFO0FBQ0EscUM7O0FBRUEsU0FBU0EsbUJBQVQsQ0FBNkJDLE9BQTdCLEVBQXNDQyxJQUF0QyxFQUE0Q0MsSUFBNUMsRUFBa0Q7QUFDaEQsTUFBSUEsUUFBUUEsS0FBS0MsT0FBTCxDQUFhLEdBQWIsTUFBc0IsQ0FBQyxDQUFuQyxFQUFzQztBQUNwQ0gsWUFBUUksTUFBUixDQUFlSCxJQUFmLEVBQXFCLGtDQUFzQkMsSUFBdEI7QUFDbkIsNERBREY7O0FBR0Q7QUFDRjs7QUFFREcsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0pDLFVBQU0sU0FERjtBQUVKQyxVQUFNO0FBQ0pDLGdCQUFVLGlCQUROO0FBRUpDLG1CQUFhLDBDQUZUO0FBR0pDLFdBQUssMEJBQVEsMEJBQVIsQ0FIRCxFQUZGOztBQU9KQyxZQUFRLEVBUEosRUFEUzs7O0FBV2ZDLFFBWGUsK0JBV1JkLE9BWFEsRUFXQztBQUNkLGFBQU8sZ0NBQWMsVUFBQ2UsTUFBRCxFQUFTZCxJQUFULEVBQWtCO0FBQ3JDRiw0QkFBb0JDLE9BQXBCLEVBQTZCQyxJQUE3QixFQUFtQ2MsT0FBT0MsS0FBMUM7QUFDRCxPQUZNLEVBRUosRUFBRUMsVUFBVSxJQUFaLEVBRkksQ0FBUDtBQUdELEtBZmMsbUJBQWpCIiwiZmlsZSI6Im5vLXdlYnBhY2stbG9hZGVyLXN5bnRheC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb2R1bGVWaXNpdG9yIGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvbW9kdWxlVmlzaXRvcic7XHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnO1xyXG5cclxuZnVuY3Rpb24gcmVwb3J0SWZOb25TdGFuZGFyZChjb250ZXh0LCBub2RlLCBuYW1lKSB7XHJcbiAgaWYgKG5hbWUgJiYgbmFtZS5pbmRleE9mKCchJykgIT09IC0xKSB7XHJcbiAgICBjb250ZXh0LnJlcG9ydChub2RlLCBgVW5leHBlY3RlZCAnIScgaW4gJyR7bmFtZX0nLiBgICtcclxuICAgICAgJ0RvIG5vdCB1c2UgaW1wb3J0IHN5bnRheCB0byBjb25maWd1cmUgd2VicGFjayBsb2FkZXJzLicsXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3Byb2JsZW0nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICBjYXRlZ29yeTogJ1N0YXRpYyBhbmFseXNpcycsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnRm9yYmlkIHdlYnBhY2sgbG9hZGVyIHN5bnRheCBpbiBpbXBvcnRzLicsXHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8td2VicGFjay1sb2FkZXItc3ludGF4JyksXHJcbiAgICB9LFxyXG4gICAgc2NoZW1hOiBbXSxcclxuICB9LFxyXG5cclxuICBjcmVhdGUoY29udGV4dCkge1xyXG4gICAgcmV0dXJuIG1vZHVsZVZpc2l0b3IoKHNvdXJjZSwgbm9kZSkgPT4ge1xyXG4gICAgICByZXBvcnRJZk5vblN0YW5kYXJkKGNvbnRleHQsIG5vZGUsIHNvdXJjZS52YWx1ZSk7XHJcbiAgICB9LCB7IGNvbW1vbmpzOiB0cnVlIH0pO1xyXG4gIH0sXHJcbn07XHJcbiJdfQ==