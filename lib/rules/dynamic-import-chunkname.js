'use strict';var _vm = require('vm');var _vm2 = _interopRequireDefault(_vm);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Style guide',
      description: 'Enforce a leading comment with the webpackChunkName for dynamic imports.',
      url: (0, _docsUrl2['default'])('dynamic-import-chunkname') },

    schema: [{
      type: 'object',
      properties: {
        importFunctions: {
          type: 'array',
          uniqueItems: true,
          items: {
            type: 'string' } },


        webpackChunknameFormat: {
          type: 'string' } } }] },





  create: function () {function create(context) {
      var config = context.options[0];var _ref =
      config || {},_ref$importFunctions = _ref.importFunctions,importFunctions = _ref$importFunctions === undefined ? [] : _ref$importFunctions;var _ref2 =
      config || {},_ref2$webpackChunknam = _ref2.webpackChunknameFormat,webpackChunknameFormat = _ref2$webpackChunknam === undefined ? '([0-9a-zA-Z-_/.]|\\[(request|index)\\])+' : _ref2$webpackChunknam;

      var paddedCommentRegex = /^ (\S[\s\S]+\S) $/;
      var commentStyleRegex = /^( ((webpackChunkName: .+)|((webpackPrefetch|webpackPreload): (true|false|-?[0-9]+))|(webpackIgnore: (true|false))|((webpackInclude|webpackExclude): \/.*\/)|(webpackMode: ["'](lazy|lazy-once|eager|weak)["'])|(webpackExports: (['"]\w+['"]|\[(['"]\w+['"], *)+(['"]\w+['"]*)\]))),?)+ $/;
      var chunkSubstrFormat = ' webpackChunkName: ["\']' + String(webpackChunknameFormat) + '["\'],? ';
      var chunkSubstrRegex = new RegExp(chunkSubstrFormat);

      function run(node, arg) {
        var sourceCode = context.getSourceCode();
        var leadingComments = sourceCode.getCommentsBefore ?
        sourceCode.getCommentsBefore(arg) // This method is available in ESLint >= 4.
        : sourceCode.getComments(arg).leading; // This method is deprecated in ESLint 7.

        if (!leadingComments || leadingComments.length === 0) {
          context.report({
            node: node,
            message: 'dynamic imports require a leading comment with the webpack chunkname' });

          return;
        }

        var isChunknamePresent = false;var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {

          for (var _iterator = leadingComments[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var comment = _step.value;
            if (comment.type !== 'Block') {
              context.report({
                node: node,
                message: 'dynamic imports require a /* foo */ style comment, not a // foo comment' });

              return;
            }

            if (!paddedCommentRegex.test(comment.value)) {
              context.report({
                node: node,
                message: 'dynamic imports require a block comment padded with spaces - /* foo */' });

              return;
            }

            try {
              // just like webpack itself does
              _vm2['default'].runInNewContext('(function() {return {' + String(comment.value) + '}})()');
            }
            catch (error) {
              context.report({
                node: node,
                message: 'dynamic imports require a "webpack" comment with valid syntax' });

              return;
            }

            if (!commentStyleRegex.test(comment.value)) {
              context.report({
                node: node,
                message: 'dynamic imports require a "webpack" comment with valid syntax' });


              return;
            }

            if (chunkSubstrRegex.test(comment.value)) {
              isChunknamePresent = true;
            }
          }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}

        if (!isChunknamePresent) {
          context.report({
            node: node,
            message: 'dynamic imports require a leading comment in the form /*' +
            chunkSubstrFormat + '*/' });

        }
      }

      return {
        ImportExpression: function () {function ImportExpression(node) {
            run(node, node.source);
          }return ImportExpression;}(),

        CallExpression: function () {function CallExpression(node) {
            if (node.callee.type !== 'Import' && importFunctions.indexOf(node.callee.name) < 0) {
              return;
            }

            run(node, node.arguments[0]);
          }return CallExpression;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9keW5hbWljLWltcG9ydC1jaHVua25hbWUuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJ1cmwiLCJzY2hlbWEiLCJwcm9wZXJ0aWVzIiwiaW1wb3J0RnVuY3Rpb25zIiwidW5pcXVlSXRlbXMiLCJpdGVtcyIsIndlYnBhY2tDaHVua25hbWVGb3JtYXQiLCJjcmVhdGUiLCJjb250ZXh0IiwiY29uZmlnIiwib3B0aW9ucyIsInBhZGRlZENvbW1lbnRSZWdleCIsImNvbW1lbnRTdHlsZVJlZ2V4IiwiY2h1bmtTdWJzdHJGb3JtYXQiLCJjaHVua1N1YnN0clJlZ2V4IiwiUmVnRXhwIiwicnVuIiwibm9kZSIsImFyZyIsInNvdXJjZUNvZGUiLCJnZXRTb3VyY2VDb2RlIiwibGVhZGluZ0NvbW1lbnRzIiwiZ2V0Q29tbWVudHNCZWZvcmUiLCJnZXRDb21tZW50cyIsImxlYWRpbmciLCJsZW5ndGgiLCJyZXBvcnQiLCJtZXNzYWdlIiwiaXNDaHVua25hbWVQcmVzZW50IiwiY29tbWVudCIsInRlc3QiLCJ2YWx1ZSIsInZtIiwicnVuSW5OZXdDb250ZXh0IiwiZXJyb3IiLCJJbXBvcnRFeHByZXNzaW9uIiwic291cmNlIiwiQ2FsbEV4cHJlc3Npb24iLCJjYWxsZWUiLCJpbmRleE9mIiwibmFtZSIsImFyZ3VtZW50cyJdLCJtYXBwaW5ncyI6ImFBQUEsd0I7QUFDQSxxQzs7QUFFQUEsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0pDLFVBQU0sWUFERjtBQUVKQyxVQUFNO0FBQ0pDLGdCQUFVLGFBRE47QUFFSkMsbUJBQWEsMEVBRlQ7QUFHSkMsV0FBSywwQkFBUSwwQkFBUixDQUhELEVBRkY7O0FBT0pDLFlBQVEsQ0FBQztBQUNQTCxZQUFNLFFBREM7QUFFUE0sa0JBQVk7QUFDVkMseUJBQWlCO0FBQ2ZQLGdCQUFNLE9BRFM7QUFF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QUFMLENBQVlFLElBQXBDLElBQTRDLENBQWpGLEVBQW9GO0FBQ2xGO0FBQ0Q7O0FBRUR4QixnQkFBSUMsSUFBSixFQUFVQSxLQUFLd0IsU0FBTCxDQUFlLENBQWYsQ0FBVjtBQUNELFdBWEksMkJBQVA7O0FBYUQsS0FwSGMsbUJBQWpCIiwiZmlsZSI6ImR5bmFtaWMtaW1wb3J0LWNodW5rbmFtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB2bSBmcm9tICd2bSc7XHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3N1Z2dlc3Rpb24nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICBjYXRlZ29yeTogJ1N0eWxlIGd1aWRlJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdFbmZvcmNlIGEgbGVhZGluZyBjb21tZW50IHdpdGggdGhlIHdlYnBhY2tDaHVua05hbWUgZm9yIGR5bmFtaWMgaW1wb3J0cy4nLFxyXG4gICAgICB1cmw6IGRvY3NVcmwoJ2R5bmFtaWMtaW1wb3J0LWNodW5rbmFtZScpLFxyXG4gICAgfSxcclxuICAgIHNjaGVtYTogW3tcclxuICAgICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICBpbXBvcnRGdW5jdGlvbnM6IHtcclxuICAgICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgICB1bmlxdWVJdGVtczogdHJ1ZSxcclxuICAgICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHdlYnBhY2tDaHVua25hbWVGb3JtYXQ6IHtcclxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9XSxcclxuICB9LFxyXG5cclxuICBjcmVhdGUoY29udGV4dCkge1xyXG4gICAgY29uc3QgY29uZmlnID0gY29udGV4dC5vcHRpb25zWzBdO1xyXG4gICAgY29uc3QgeyBpbXBvcnRGdW5jdGlvbnMgPSBbXSB9ID0gY29uZmlnIHx8IHt9O1xyXG4gICAgY29uc3QgeyB3ZWJwYWNrQ2h1bmtuYW1lRm9ybWF0ID0gJyhbMC05YS16QS1aLV8vLl18XFxcXFsocmVxdWVzdHxpbmRleClcXFxcXSkrJyB9ID0gY29uZmlnIHx8IHt9O1xyXG5cclxuICAgIGNvbnN0IHBhZGRlZENvbW1lbnRSZWdleCA9IC9eIChcXFNbXFxzXFxTXStcXFMpICQvO1xyXG4gICAgY29uc3QgY29tbWVudFN0eWxlUmVnZXggPSAvXiggKCh3ZWJwYWNrQ2h1bmtOYW1lOiAuKyl8KCh3ZWJwYWNrUHJlZmV0Y2h8d2VicGFja1ByZWxvYWQpOiAodHJ1ZXxmYWxzZXwtP1swLTldKykpfCh3ZWJwYWNrSWdub3JlOiAodHJ1ZXxmYWxzZSkpfCgod2VicGFja0luY2x1ZGV8d2VicGFja0V4Y2x1ZGUpOiBcXC8uKlxcLyl8KHdlYnBhY2tNb2RlOiBbXCInXShsYXp5fGxhenktb25jZXxlYWdlcnx3ZWFrKVtcIiddKXwod2VicGFja0V4cG9ydHM6IChbJ1wiXVxcdytbJ1wiXXxcXFsoWydcIl1cXHcrWydcIl0sICopKyhbJ1wiXVxcdytbJ1wiXSopXFxdKSkpLD8pKyAkLztcclxuICAgIGNvbnN0IGNodW5rU3Vic3RyRm9ybWF0ID0gYCB3ZWJwYWNrQ2h1bmtOYW1lOiBbXCInXSR7d2VicGFja0NodW5rbmFtZUZvcm1hdH1bXCInXSw/IGA7XHJcbiAgICBjb25zdCBjaHVua1N1YnN0clJlZ2V4ID0gbmV3IFJlZ0V4cChjaHVua1N1YnN0ckZvcm1hdCk7XHJcblxyXG4gICAgZnVuY3Rpb24gcnVuKG5vZGUsIGFyZykge1xyXG4gICAgICBjb25zdCBzb3VyY2VDb2RlID0gY29udGV4dC5nZXRTb3VyY2VDb2RlKCk7XHJcbiAgICAgIGNvbnN0IGxlYWRpbmdDb21tZW50cyA9IHNvdXJjZUNvZGUuZ2V0Q29tbWVudHNCZWZvcmVcclxuICAgICAgICA/IHNvdXJjZUNvZGUuZ2V0Q29tbWVudHNCZWZvcmUoYXJnKSAvLyBUaGlzIG1ldGhvZCBpcyBhdmFpbGFibGUgaW4gRVNMaW50ID49IDQuXHJcbiAgICAgICAgOiBzb3VyY2VDb2RlLmdldENvbW1lbnRzKGFyZykubGVhZGluZzsgLy8gVGhpcyBtZXRob2QgaXMgZGVwcmVjYXRlZCBpbiBFU0xpbnQgNy5cclxuXHJcbiAgICAgIGlmICghbGVhZGluZ0NvbW1lbnRzIHx8IGxlYWRpbmdDb21tZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgbWVzc2FnZTogJ2R5bmFtaWMgaW1wb3J0cyByZXF1aXJlIGEgbGVhZGluZyBjb21tZW50IHdpdGggdGhlIHdlYnBhY2sgY2h1bmtuYW1lJyxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBpc0NodW5rbmFtZVByZXNlbnQgPSBmYWxzZTtcclxuXHJcbiAgICAgIGZvciAoY29uc3QgY29tbWVudCBvZiBsZWFkaW5nQ29tbWVudHMpIHtcclxuICAgICAgICBpZiAoY29tbWVudC50eXBlICE9PSAnQmxvY2snKSB7XHJcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdkeW5hbWljIGltcG9ydHMgcmVxdWlyZSBhIC8qIGZvbyAqLyBzdHlsZSBjb21tZW50LCBub3QgYSAvLyBmb28gY29tbWVudCcsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcGFkZGVkQ29tbWVudFJlZ2V4LnRlc3QoY29tbWVudC52YWx1ZSkpIHtcclxuICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogYGR5bmFtaWMgaW1wb3J0cyByZXF1aXJlIGEgYmxvY2sgY29tbWVudCBwYWRkZWQgd2l0aCBzcGFjZXMgLSAvKiBmb28gKi9gLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgLy8ganVzdCBsaWtlIHdlYnBhY2sgaXRzZWxmIGRvZXNcclxuICAgICAgICAgIHZtLnJ1bkluTmV3Q29udGV4dChgKGZ1bmN0aW9uKCkge3JldHVybiB7JHtjb21tZW50LnZhbHVlfX19KSgpYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiBgZHluYW1pYyBpbXBvcnRzIHJlcXVpcmUgYSBcIndlYnBhY2tcIiBjb21tZW50IHdpdGggdmFsaWQgc3ludGF4YCxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFjb21tZW50U3R5bGVSZWdleC50ZXN0KGNvbW1lbnQudmFsdWUpKSB7XHJcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6XHJcbiAgICAgICAgICAgICAgYGR5bmFtaWMgaW1wb3J0cyByZXF1aXJlIGEgXCJ3ZWJwYWNrXCIgY29tbWVudCB3aXRoIHZhbGlkIHN5bnRheGAsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjaHVua1N1YnN0clJlZ2V4LnRlc3QoY29tbWVudC52YWx1ZSkpIHtcclxuICAgICAgICAgIGlzQ2h1bmtuYW1lUHJlc2VudCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIWlzQ2h1bmtuYW1lUHJlc2VudCkge1xyXG4gICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICBtZXNzYWdlOlxyXG4gICAgICAgICAgICBgZHluYW1pYyBpbXBvcnRzIHJlcXVpcmUgYSBsZWFkaW5nIGNvbW1lbnQgaW4gdGhlIGZvcm0gLyoke2NodW5rU3Vic3RyRm9ybWF0fSovYCxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIEltcG9ydEV4cHJlc3Npb24obm9kZSkge1xyXG4gICAgICAgIHJ1bihub2RlLCBub2RlLnNvdXJjZSk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBDYWxsRXhwcmVzc2lvbihub2RlKSB7XHJcbiAgICAgICAgaWYgKG5vZGUuY2FsbGVlLnR5cGUgIT09ICdJbXBvcnQnICYmIGltcG9ydEZ1bmN0aW9ucy5pbmRleE9mKG5vZGUuY2FsbGVlLm5hbWUpIDwgMCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcnVuKG5vZGUsIG5vZGUuYXJndW1lbnRzWzBdKTtcclxuICAgICAgfSxcclxuICAgIH07XHJcbiAgfSxcclxufTtcclxuIl19