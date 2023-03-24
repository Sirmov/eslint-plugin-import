'use strict';var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

function getImportValue(node) {
  return node.type === 'ImportDeclaration' ?
  node.source.value :
  node.moduleReference.expression.value;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Style guide',
      description: 'Ensure all imports appear before other statements.',
      url: (0, _docsUrl2['default'])('first') },

    fixable: 'code',
    schema: [
    {
      type: 'string',
      'enum': ['absolute-first', 'disable-absolute-first'] }] },




  create: function () {function create(context) {
      function isPossibleDirective(node) {
        return node.type === 'ExpressionStatement' &&
        node.expression.type === 'Literal' &&
        typeof node.expression.value === 'string';
      }

      return {
        'Program': function () {function Program(n) {
            var body = n.body;
            if (!body) {
              return;
            }
            var absoluteFirst = context.options[0] === 'absolute-first';
            var message = 'Import in body of module; reorder to top.';
            var sourceCode = context.getSourceCode();
            var originSourceCode = sourceCode.getText();
            var nonImportCount = 0;
            var anyExpressions = false;
            var anyRelative = false;
            var lastLegalImp = null;
            var errorInfos = [];
            var shouldSort = true;
            var lastSortNodesIndex = 0;
            body.forEach(function (node, index) {
              if (!anyExpressions && isPossibleDirective(node)) {
                return;
              }

              anyExpressions = true;

              if (node.type === 'ImportDeclaration' || node.type === 'TSImportEqualsDeclaration') {
                if (absoluteFirst) {
                  if (/^\./.test(getImportValue(node))) {
                    anyRelative = true;
                  } else if (anyRelative) {
                    context.report({
                      node: node.type === 'ImportDeclaration' ? node.source : node.moduleReference,
                      message: 'Absolute imports should come before relative imports.' });

                  }
                }
                if (nonImportCount > 0) {var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
                    for (var _iterator = context.getDeclaredVariables(node)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var variable = _step.value;
                      if (!shouldSort) break;
                      var references = variable.references;
                      if (references.length) {var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {
                          for (var _iterator2 = references[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var reference = _step2.value;
                            if (reference.identifier.range[0] < node.range[1]) {
                              shouldSort = false;
                              break;
                            }
                          }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2['return']) {_iterator2['return']();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}
                      }
                    }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
                  shouldSort && (lastSortNodesIndex = errorInfos.length);
                  errorInfos.push({
                    node: node,
                    range: [body[index - 1].range[1], node.range[1]] });

                } else {
                  lastLegalImp = node;
                }
              } else {
                nonImportCount++;
              }
            });
            if (!errorInfos.length) return;
            errorInfos.forEach(function (errorInfo, index) {
              var node = errorInfo.node;
              var infos = {
                node: node,
                message: message };

              if (index < lastSortNodesIndex) {
                infos.fix = function (fixer) {
                  return fixer.insertTextAfter(node, '');
                };
              } else if (index === lastSortNodesIndex) {
                var sortNodes = errorInfos.slice(0, lastSortNodesIndex + 1);
                infos.fix = function (fixer) {
                  var removeFixers = sortNodes.map(function (_errorInfo) {
                    return fixer.removeRange(_errorInfo.range);
                  });
                  var range = [0, removeFixers[removeFixers.length - 1].range[1]];
                  var insertSourceCode = sortNodes.map(function (_errorInfo) {
                    var nodeSourceCode = String.prototype.slice.apply(
                    originSourceCode, _errorInfo.range);

                    if (/\S/.test(nodeSourceCode[0])) {
                      return '\n' + nodeSourceCode;
                    }
                    return nodeSourceCode;
                  }).join('');
                  var insertFixer = null;
                  var replaceSourceCode = '';
                  if (!lastLegalImp) {
                    insertSourceCode =
                    insertSourceCode.trim() + insertSourceCode.match(/^(\s+)/)[0];
                  }
                  insertFixer = lastLegalImp ?
                  fixer.insertTextAfter(lastLegalImp, insertSourceCode) :
                  fixer.insertTextBefore(body[0], insertSourceCode);
                  var fixers = [insertFixer].concat(removeFixers);
                  fixers.forEach(function (computedFixer, i) {
                    replaceSourceCode += originSourceCode.slice(
                    fixers[i - 1] ? fixers[i - 1].range[1] : 0, computedFixer.range[0]) +
                    computedFixer.text;
                  });
                  return fixer.replaceTextRange(range, replaceSourceCode);
                };
              }
              context.report(infos);
            });
          }return Program;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9maXJzdC5qcyJdLCJuYW1lcyI6WyJnZXRJbXBvcnRWYWx1ZSIsIm5vZGUiLCJ0eXBlIiwic291cmNlIiwidmFsdWUiLCJtb2R1bGVSZWZlcmVuY2UiLCJleHByZXNzaW9uIiwibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJkb2NzIiwiY2F0ZWdvcnkiLCJkZXNjcmlwdGlvbiIsInVybCIsImZpeGFibGUiLCJzY2hlbWEiLCJjcmVhdGUiLCJjb250ZXh0IiwiaXNQb3NzaWJsZURpcmVjdGl2ZSIsIm4iLCJib2R5IiwiYWJzb2x1dGVGaXJzdCIsIm9wdGlvbnMiLCJtZXNzYWdlIiwic291cmNlQ29kZSIsImdldFNvdXJjZUNvZGUiLCJvcmlnaW5Tb3VyY2VDb2RlIiwiZ2V0VGV4dCIsIm5vbkltcG9ydENvdW50IiwiYW55RXhwcmVzc2lvbnMiLCJhbnlSZWxhdGl2ZSIsImxhc3RMZWdhbEltcCIsImVycm9ySW5mb3MiLCJzaG91bGRTb3J0IiwibGFzdFNvcnROb2Rlc0luZGV4IiwiZm9yRWFjaCIsImluZGV4IiwidGVzdCIsInJlcG9ydCIsImdldERlY2xhcmVkVmFyaWFibGVzIiwidmFyaWFibGUiLCJyZWZlcmVuY2VzIiwibGVuZ3RoIiwicmVmZXJlbmNlIiwiaWRlbnRpZmllciIsInJhbmdlIiwicHVzaCIsImVycm9ySW5mbyIsImluZm9zIiwiZml4IiwiZml4ZXIiLCJpbnNlcnRUZXh0QWZ0ZXIiLCJzb3J0Tm9kZXMiLCJzbGljZSIsInJlbW92ZUZpeGVycyIsIm1hcCIsIl9lcnJvckluZm8iLCJyZW1vdmVSYW5nZSIsImluc2VydFNvdXJjZUNvZGUiLCJub2RlU291cmNlQ29kZSIsIlN0cmluZyIsInByb3RvdHlwZSIsImFwcGx5Iiwiam9pbiIsImluc2VydEZpeGVyIiwicmVwbGFjZVNvdXJjZUNvZGUiLCJ0cmltIiwibWF0Y2giLCJpbnNlcnRUZXh0QmVmb3JlIiwiZml4ZXJzIiwiY29uY2F0IiwiY29tcHV0ZWRGaXhl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QmdCLDJCQUFPRyxJQUFJLENBQVgsSUFBZ0JILE9BQU9HLElBQUksQ0FBWCxFQUFjM0IsS0FBZCxDQUFvQixDQUFwQixDQUFoQixHQUF5QyxDQURyQixFQUN3QjBCLGNBQWMxQixLQUFkLENBQW9CLENBQXBCLENBRHhCO0FBRWxCMEIsa0NBQWNFLElBRmxCO0FBR0QsbUJBSkQ7QUFLQSx5QkFBT3ZCLE1BQU13QixnQkFBTixDQUF1QjdCLEtBQXZCLEVBQThCb0IsaUJBQTlCLENBQVA7QUFDRCxpQkE5QkQ7QUErQkQ7QUFDRGhELHNCQUFRcUIsTUFBUixDQUFlVSxLQUFmO0FBQ0QsYUE3Q0Q7QUE4Q0QsV0ExR0Qsa0JBREssRUFBUDs7QUE2R0QsS0FySWMsbUJBQWpCIiwiZmlsZSI6ImZpcnN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XHJcblxyXG5mdW5jdGlvbiBnZXRJbXBvcnRWYWx1ZShub2RlKSB7XHJcbiAgcmV0dXJuIG5vZGUudHlwZSA9PT0gJ0ltcG9ydERlY2xhcmF0aW9uJ1xyXG4gICAgPyBub2RlLnNvdXJjZS52YWx1ZVxyXG4gICAgOiBub2RlLm1vZHVsZVJlZmVyZW5jZS5leHByZXNzaW9uLnZhbHVlO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnU3R5bGUgZ3VpZGUnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0Vuc3VyZSBhbGwgaW1wb3J0cyBhcHBlYXIgYmVmb3JlIG90aGVyIHN0YXRlbWVudHMuJyxcclxuICAgICAgdXJsOiBkb2NzVXJsKCdmaXJzdCcpLFxyXG4gICAgfSxcclxuICAgIGZpeGFibGU6ICdjb2RlJyxcclxuICAgIHNjaGVtYTogW1xyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgZW51bTogWydhYnNvbHV0ZS1maXJzdCcsICdkaXNhYmxlLWFic29sdXRlLWZpcnN0J10sXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZShjb250ZXh0KSB7XHJcbiAgICBmdW5jdGlvbiBpc1Bvc3NpYmxlRGlyZWN0aXZlKG5vZGUpIHtcclxuICAgICAgcmV0dXJuIG5vZGUudHlwZSA9PT0gJ0V4cHJlc3Npb25TdGF0ZW1lbnQnICYmXHJcbiAgICAgICAgbm9kZS5leHByZXNzaW9uLnR5cGUgPT09ICdMaXRlcmFsJyAmJlxyXG4gICAgICAgIHR5cGVvZiBub2RlLmV4cHJlc3Npb24udmFsdWUgPT09ICdzdHJpbmcnO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICdQcm9ncmFtJzogZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICBjb25zdCBib2R5ID0gbi5ib2R5O1xyXG4gICAgICAgIGlmICghYm9keSkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBhYnNvbHV0ZUZpcnN0ID0gY29udGV4dC5vcHRpb25zWzBdID09PSAnYWJzb2x1dGUtZmlyc3QnO1xyXG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnSW1wb3J0IGluIGJvZHkgb2YgbW9kdWxlOyByZW9yZGVyIHRvIHRvcC4nO1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZUNvZGUgPSBjb250ZXh0LmdldFNvdXJjZUNvZGUoKTtcclxuICAgICAgICBjb25zdCBvcmlnaW5Tb3VyY2VDb2RlID0gc291cmNlQ29kZS5nZXRUZXh0KCk7XHJcbiAgICAgICAgbGV0IG5vbkltcG9ydENvdW50ID0gMDtcclxuICAgICAgICBsZXQgYW55RXhwcmVzc2lvbnMgPSBmYWxzZTtcclxuICAgICAgICBsZXQgYW55UmVsYXRpdmUgPSBmYWxzZTtcclxuICAgICAgICBsZXQgbGFzdExlZ2FsSW1wID0gbnVsbDtcclxuICAgICAgICBjb25zdCBlcnJvckluZm9zID0gW107XHJcbiAgICAgICAgbGV0IHNob3VsZFNvcnQgPSB0cnVlO1xyXG4gICAgICAgIGxldCBsYXN0U29ydE5vZGVzSW5kZXggPSAwO1xyXG4gICAgICAgIGJvZHkuZm9yRWFjaChmdW5jdGlvbiAobm9kZSwgaW5kZXgpIHtcclxuICAgICAgICAgIGlmICghYW55RXhwcmVzc2lvbnMgJiYgaXNQb3NzaWJsZURpcmVjdGl2ZShub2RlKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgYW55RXhwcmVzc2lvbnMgPSB0cnVlO1xyXG5cclxuICAgICAgICAgIGlmIChub2RlLnR5cGUgPT09ICdJbXBvcnREZWNsYXJhdGlvbicgfHwgbm9kZS50eXBlID09PSAnVFNJbXBvcnRFcXVhbHNEZWNsYXJhdGlvbicpIHtcclxuICAgICAgICAgICAgaWYgKGFic29sdXRlRmlyc3QpIHtcclxuICAgICAgICAgICAgICBpZiAoL15cXC4vLnRlc3QoZ2V0SW1wb3J0VmFsdWUobm9kZSkpKSB7XHJcbiAgICAgICAgICAgICAgICBhbnlSZWxhdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChhbnlSZWxhdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICAgICAgICBub2RlOiBub2RlLnR5cGUgPT09ICdJbXBvcnREZWNsYXJhdGlvbicgPyBub2RlLnNvdXJjZSA6IG5vZGUubW9kdWxlUmVmZXJlbmNlLFxyXG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnQWJzb2x1dGUgaW1wb3J0cyBzaG91bGQgY29tZSBiZWZvcmUgcmVsYXRpdmUgaW1wb3J0cy4nLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChub25JbXBvcnRDb3VudCA+IDApIHtcclxuICAgICAgICAgICAgICBmb3IgKGNvbnN0IHZhcmlhYmxlIG9mIGNvbnRleHQuZ2V0RGVjbGFyZWRWYXJpYWJsZXMobm9kZSkpIHtcclxuICAgICAgICAgICAgICAgIGlmICghc2hvdWxkU29ydCkgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZWZlcmVuY2VzID0gdmFyaWFibGUucmVmZXJlbmNlcztcclxuICAgICAgICAgICAgICAgIGlmIChyZWZlcmVuY2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHJlZmVyZW5jZSBvZiByZWZlcmVuY2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlZmVyZW5jZS5pZGVudGlmaWVyLnJhbmdlWzBdIDwgbm9kZS5yYW5nZVsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgc2hvdWxkU29ydCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHNob3VsZFNvcnQgJiYgKGxhc3RTb3J0Tm9kZXNJbmRleCA9IGVycm9ySW5mb3MubGVuZ3RoKTtcclxuICAgICAgICAgICAgICBlcnJvckluZm9zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgICAgIHJhbmdlOiBbYm9keVtpbmRleCAtIDFdLnJhbmdlWzFdLCBub2RlLnJhbmdlWzFdXSxcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBsYXN0TGVnYWxJbXAgPSBub2RlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBub25JbXBvcnRDb3VudCsrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICghZXJyb3JJbmZvcy5sZW5ndGgpIHJldHVybjtcclxuICAgICAgICBlcnJvckluZm9zLmZvckVhY2goZnVuY3Rpb24gKGVycm9ySW5mbywgaW5kZXgpIHtcclxuICAgICAgICAgIGNvbnN0IG5vZGUgPSBlcnJvckluZm8ubm9kZTtcclxuICAgICAgICAgIGNvbnN0IGluZm9zID0ge1xyXG4gICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICBtZXNzYWdlLFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIGlmIChpbmRleCA8IGxhc3RTb3J0Tm9kZXNJbmRleCkge1xyXG4gICAgICAgICAgICBpbmZvcy5maXggPSBmdW5jdGlvbiAoZml4ZXIpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gZml4ZXIuaW5zZXJ0VGV4dEFmdGVyKG5vZGUsICcnKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IGxhc3RTb3J0Tm9kZXNJbmRleCkge1xyXG4gICAgICAgICAgICBjb25zdCBzb3J0Tm9kZXMgPSBlcnJvckluZm9zLnNsaWNlKDAsIGxhc3RTb3J0Tm9kZXNJbmRleCArIDEpO1xyXG4gICAgICAgICAgICBpbmZvcy5maXggPSBmdW5jdGlvbiAoZml4ZXIpIHtcclxuICAgICAgICAgICAgICBjb25zdCByZW1vdmVGaXhlcnMgPSBzb3J0Tm9kZXMubWFwKGZ1bmN0aW9uIChfZXJyb3JJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZml4ZXIucmVtb3ZlUmFuZ2UoX2Vycm9ySW5mby5yYW5nZSk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSBbMCwgcmVtb3ZlRml4ZXJzW3JlbW92ZUZpeGVycy5sZW5ndGggLSAxXS5yYW5nZVsxXV07XHJcbiAgICAgICAgICAgICAgbGV0IGluc2VydFNvdXJjZUNvZGUgPSBzb3J0Tm9kZXMubWFwKGZ1bmN0aW9uIChfZXJyb3JJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlU291cmNlQ29kZSA9IFN0cmluZy5wcm90b3R5cGUuc2xpY2UuYXBwbHkoXHJcbiAgICAgICAgICAgICAgICAgIG9yaWdpblNvdXJjZUNvZGUsIF9lcnJvckluZm8ucmFuZ2UsXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgaWYgKC9cXFMvLnRlc3Qobm9kZVNvdXJjZUNvZGVbMF0pKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiAnXFxuJyArIG5vZGVTb3VyY2VDb2RlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVTb3VyY2VDb2RlO1xyXG4gICAgICAgICAgICAgIH0pLmpvaW4oJycpO1xyXG4gICAgICAgICAgICAgIGxldCBpbnNlcnRGaXhlciA9IG51bGw7XHJcbiAgICAgICAgICAgICAgbGV0IHJlcGxhY2VTb3VyY2VDb2RlID0gJyc7XHJcbiAgICAgICAgICAgICAgaWYgKCFsYXN0TGVnYWxJbXApIHtcclxuICAgICAgICAgICAgICAgIGluc2VydFNvdXJjZUNvZGUgPVxyXG4gICAgICAgICAgICAgICAgICAgIGluc2VydFNvdXJjZUNvZGUudHJpbSgpICsgaW5zZXJ0U291cmNlQ29kZS5tYXRjaCgvXihcXHMrKS8pWzBdO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpbnNlcnRGaXhlciA9IGxhc3RMZWdhbEltcCA/XHJcbiAgICAgICAgICAgICAgICBmaXhlci5pbnNlcnRUZXh0QWZ0ZXIobGFzdExlZ2FsSW1wLCBpbnNlcnRTb3VyY2VDb2RlKSA6XHJcbiAgICAgICAgICAgICAgICBmaXhlci5pbnNlcnRUZXh0QmVmb3JlKGJvZHlbMF0sIGluc2VydFNvdXJjZUNvZGUpO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGZpeGVycyA9IFtpbnNlcnRGaXhlcl0uY29uY2F0KHJlbW92ZUZpeGVycyk7XHJcbiAgICAgICAgICAgICAgZml4ZXJzLmZvckVhY2goZnVuY3Rpb24gKGNvbXB1dGVkRml4ZXIsIGkpIHtcclxuICAgICAgICAgICAgICAgIHJlcGxhY2VTb3VyY2VDb2RlICs9IChvcmlnaW5Tb3VyY2VDb2RlLnNsaWNlKFxyXG4gICAgICAgICAgICAgICAgICBmaXhlcnNbaSAtIDFdID8gZml4ZXJzW2kgLSAxXS5yYW5nZVsxXSA6IDAsIGNvbXB1dGVkRml4ZXIucmFuZ2VbMF0sXHJcbiAgICAgICAgICAgICAgICApICsgY29tcHV0ZWRGaXhlci50ZXh0KTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICByZXR1cm4gZml4ZXIucmVwbGFjZVRleHRSYW5nZShyYW5nZSwgcmVwbGFjZVNvdXJjZUNvZGUpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoaW5mb3MpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgfTtcclxuICB9LFxyXG59O1xyXG4iXX0=