'use strict';var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

function getEmptyBlockRange(tokens, index) {
  var token = tokens[index];
  var nextToken = tokens[index + 1];
  var prevToken = tokens[index - 1];
  var start = token.range[0];
  var end = nextToken.range[1];

  // Remove block tokens and the previous comma
  if (prevToken.value === ',' || prevToken.value === 'type' || prevToken.value === 'typeof') {
    start = prevToken.range[0];
  }

  return [start, end];
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Helpful warnings',
      description: 'Forbid empty named import blocks.',
      url: (0, _docsUrl2['default'])('no-empty-named-blocks') },

    fixable: 'code',
    schema: [],
    hasSuggestions: true },


  create: function () {function create(context) {
      var importsWithoutNameds = [];

      return {
        ImportDeclaration: function () {function ImportDeclaration(node) {
            if (!node.specifiers.some(function (x) {return x.type === 'ImportSpecifier';})) {
              importsWithoutNameds.push(node);
            }
          }return ImportDeclaration;}(),

        'Program:exit': function () {function ProgramExit(program) {
            var importsTokens = importsWithoutNameds.map(function (node) {
              return [node, program.tokens.filter(function (x) {return x.range[0] >= node.range[0] && x.range[1] <= node.range[1];})];
            });

            importsTokens.forEach(function (_ref) {var _ref2 = _slicedToArray(_ref, 2),node = _ref2[0],tokens = _ref2[1];
              tokens.forEach(function (token) {
                var idx = program.tokens.indexOf(token);
                var nextToken = program.tokens[idx + 1];

                if (nextToken && token.value === '{' && nextToken.value === '}') {
                  var hasOtherIdentifiers = tokens.some(function (token) {return (
                      token.type === 'Identifier' &&
                      token.value !== 'from' &&
                      token.value !== 'type' &&
                      token.value !== 'typeof');});


                  // If it has no other identifiers it's the only thing in the import, so we can either remove the import
                  // completely or transform it in a side-effects only import
                  if (!hasOtherIdentifiers) {
                    context.report({
                      node: node,
                      message: 'Unexpected empty named import block',
                      suggest: [
                      {
                        desc: 'Remove unused import',
                        fix: function () {function fix(fixer) {
                            // Remove the whole import
                            return fixer.remove(node);
                          }return fix;}() },

                      {
                        desc: 'Remove empty import block',
                        fix: function () {function fix(fixer) {
                            // Remove the empty block and the 'from' token, leaving the import only for its side
                            // effects, e.g. `import 'mod'`
                            var sourceCode = context.getSourceCode();
                            var fromToken = program.tokens.find(function (t) {return t.value === 'from';});
                            var importToken = program.tokens.find(function (t) {return t.value === 'import';});
                            var hasSpaceAfterFrom = sourceCode.isSpaceBetween(fromToken, sourceCode.getTokenAfter(fromToken));
                            var hasSpaceAfterImport = sourceCode.isSpaceBetween(importToken, sourceCode.getTokenAfter(fromToken));var _getEmptyBlockRange =

                            getEmptyBlockRange(program.tokens, idx),_getEmptyBlockRange2 = _slicedToArray(_getEmptyBlockRange, 1),start = _getEmptyBlockRange2[0];var _fromToken$range = _slicedToArray(
                            fromToken.range, 2),end = _fromToken$range[1];
                            var range = [start, hasSpaceAfterFrom ? end + 1 : end];

                            return fixer.replaceTextRange(range, hasSpaceAfterImport ? '' : ' ');
                          }return fix;}() }] });



                  } else {
                    context.report({
                      node: node,
                      message: 'Unexpected empty named import block',
                      fix: function () {function fix(fixer) {
                          return fixer.removeRange(getEmptyBlockRange(program.tokens, idx));
                        }return fix;}() });

                  }
                }
              });
            });
          }return ProgramExit;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1lbXB0eS1uYW1lZC1ibG9ja3MuanMiXSwibmFtZXMiOlsiZ2V0RW1wdHlCbG9ja1JhbmdlIiwidG9rZW5zIiwiaW5kZXgiLCJ0b2tlbiIsIm5leHRUb2tlbiIsInByZXZUb2tlbiIsInN0YXJ0IiwicmFuZ2UiLCJlbmQiLCJ2YWx1ZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwiZml4YWJsZSIsInNjaGVtYSIsImhhc1N1Z2dlc3Rpb25zIiwiY3JlYXRlIiwiY29udGV4dCIsImltcG9ydHNXaXRob3V0TmFtZWRzIiwiSW1wb3J0RGVjbGFyYXRpb24iLCJub2RlIiwic3BlY2lmaWVycyIsInNvbWUiLCJ4IiwicHVzaCIsInByb2dyYW0iLCJpbXBvcnRzVG9rZW5zIiwibWFwIiwiZmlsdGVyIiwiZm9yRWFjaCIsImlkeCIsImluZGV4T2YiLCJoYXNPdGhlcklkZW50aWZpZXJzIiwicmVwb3J0IiwibWVzc2FnZSIsInN1Z2dlc3QiLCJkZXNjIiwiZml4IiwiZml4ZXIiLCJyZW1vdmUiLCJzb3VyY2VDb2RlIiwiZ2V0U291cmNlQ29kZSIsImZyb21Ub2tlbiIsImZpbmQiLCJ0IiwiaW1wb3J0VG9rZW4iLCJoYXNTcGFjZUFmdGVyRnJvbSIsImlzU3BhY2VCZXR3ZWVuIiwiZ2V0VG9rZW5BZnRlciIsImhhc1NwYWNlQWZ0ZXJJbXBvcnQiLCJyZXBsYWNlVGV4dFJhbmdlIiwicmVtb3ZlUmFuZ2UiXSwibWFwcGluZ3MiOiJxb0JBQUEscUM7O0FBRUEsU0FBU0Esa0JBQVQsQ0FBNEJDLE1BQTVCLEVBQW9DQyxLQUFwQyxFQUEyQztBQUN6QyxNQUFNQyxRQUFRRixPQUFPQyxLQUFQLENBQWQ7QUFDQSxNQUFNRSxZQUFZSCxPQUFPQyxRQUFRLENBQWYsQ0FBbEI7QUFDQSxNQUFNRyxZQUFZSixPQUFPQyxRQUFRLENBQWYsQ0FBbEI7QUFDQSxNQUFJ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LEVBQVA7O0FBeUVELEtBekZjLG1CQUFqQiIsImZpbGUiOiJuby1lbXB0eS1uYW1lZC1ibG9ja3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJztcclxuXHJcbmZ1bmN0aW9uIGdldEVtcHR5QmxvY2tSYW5nZSh0b2tlbnMsIGluZGV4KSB7XHJcbiAgY29uc3QgdG9rZW4gPSB0b2tlbnNbaW5kZXhdO1xyXG4gIGNvbnN0IG5leHRUb2tlbiA9IHRva2Vuc1tpbmRleCArIDFdO1xyXG4gIGNvbnN0IHByZXZUb2tlbiA9IHRva2Vuc1tpbmRleCAtIDFdO1xyXG4gIGxldCBzdGFydCA9IHRva2VuLnJhbmdlWzBdO1xyXG4gIGNvbnN0IGVuZCA9IG5leHRUb2tlbi5yYW5nZVsxXTtcclxuXHJcbiAgLy8gUmVtb3ZlIGJsb2NrIHRva2VucyBhbmQgdGhlIHByZXZpb3VzIGNvbW1hXHJcbiAgaWYgKHByZXZUb2tlbi52YWx1ZSA9PT0gJywnfHwgcHJldlRva2VuLnZhbHVlID09PSAndHlwZScgfHwgcHJldlRva2VuLnZhbHVlID09PSAndHlwZW9mJykge1xyXG4gICAgc3RhcnQgPSBwcmV2VG9rZW4ucmFuZ2VbMF07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gW3N0YXJ0LCBlbmRdO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnSGVscGZ1bCB3YXJuaW5ncycsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnRm9yYmlkIGVtcHR5IG5hbWVkIGltcG9ydCBibG9ja3MuJyxcclxuICAgICAgdXJsOiBkb2NzVXJsKCduby1lbXB0eS1uYW1lZC1ibG9ja3MnKSxcclxuICAgIH0sXHJcbiAgICBmaXhhYmxlOiAnY29kZScsXHJcbiAgICBzY2hlbWE6IFtdLFxyXG4gICAgaGFzU3VnZ2VzdGlvbnM6IHRydWUsXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlKGNvbnRleHQpIHtcclxuICAgIGNvbnN0IGltcG9ydHNXaXRob3V0TmFtZWRzID0gW107XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgSW1wb3J0RGVjbGFyYXRpb24obm9kZSkge1xyXG4gICAgICAgIGlmICghbm9kZS5zcGVjaWZpZXJzLnNvbWUoeCA9PiB4LnR5cGUgPT09ICdJbXBvcnRTcGVjaWZpZXInKSkge1xyXG4gICAgICAgICAgaW1wb3J0c1dpdGhvdXROYW1lZHMucHVzaChub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAnUHJvZ3JhbTpleGl0JzogZnVuY3Rpb24gKHByb2dyYW0pIHtcclxuICAgICAgICBjb25zdCBpbXBvcnRzVG9rZW5zID0gaW1wb3J0c1dpdGhvdXROYW1lZHMubWFwKChub2RlKSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gW25vZGUsIHByb2dyYW0udG9rZW5zLmZpbHRlcih4ID0+IHgucmFuZ2VbMF0gPj0gbm9kZS5yYW5nZVswXSAmJiB4LnJhbmdlWzFdIDw9IG5vZGUucmFuZ2VbMV0pXTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaW1wb3J0c1Rva2Vucy5mb3JFYWNoKChbbm9kZSwgdG9rZW5zXSkgPT4ge1xyXG4gICAgICAgICAgdG9rZW5zLmZvckVhY2goKHRva2VuKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkeCA9IHByb2dyYW0udG9rZW5zLmluZGV4T2YodG9rZW4pO1xyXG4gICAgICAgICAgICBjb25zdCBuZXh0VG9rZW4gPSBwcm9ncmFtLnRva2Vuc1tpZHggKyAxXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChuZXh0VG9rZW4gJiYgdG9rZW4udmFsdWUgPT09ICd7JyAmJiBuZXh0VG9rZW4udmFsdWUgPT09ICd9Jykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGhhc090aGVySWRlbnRpZmllcnMgPSB0b2tlbnMuc29tZSgodG9rZW4pID0+IChcclxuICAgICAgICAgICAgICAgIHRva2VuLnR5cGUgPT09ICdJZGVudGlmaWVyJ1xyXG4gICAgICAgICAgICAgICAgICAmJiB0b2tlbi52YWx1ZSAhPT0gJ2Zyb20nXHJcbiAgICAgICAgICAgICAgICAgICYmIHRva2VuLnZhbHVlICE9PSAndHlwZSdcclxuICAgICAgICAgICAgICAgICAgJiYgdG9rZW4udmFsdWUgIT09ICd0eXBlb2YnXHJcbiAgICAgICAgICAgICAgKSk7XHJcblxyXG4gICAgICAgICAgICAgIC8vIElmIGl0IGhhcyBubyBvdGhlciBpZGVudGlmaWVycyBpdCdzIHRoZSBvbmx5IHRoaW5nIGluIHRoZSBpbXBvcnQsIHNvIHdlIGNhbiBlaXRoZXIgcmVtb3ZlIHRoZSBpbXBvcnRcclxuICAgICAgICAgICAgICAvLyBjb21wbGV0ZWx5IG9yIHRyYW5zZm9ybSBpdCBpbiBhIHNpZGUtZWZmZWN0cyBvbmx5IGltcG9ydFxyXG4gICAgICAgICAgICAgIGlmICghaGFzT3RoZXJJZGVudGlmaWVycykge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnVW5leHBlY3RlZCBlbXB0eSBuYW1lZCBpbXBvcnQgYmxvY2snLFxyXG4gICAgICAgICAgICAgICAgICBzdWdnZXN0OiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgZGVzYzogJ1JlbW92ZSB1bnVzZWQgaW1wb3J0JyxcclxuICAgICAgICAgICAgICAgICAgICAgIGZpeChmaXhlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdGhlIHdob2xlIGltcG9ydFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZml4ZXIucmVtb3ZlKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGRlc2M6ICdSZW1vdmUgZW1wdHkgaW1wb3J0IGJsb2NrJyxcclxuICAgICAgICAgICAgICAgICAgICAgIGZpeChmaXhlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdGhlIGVtcHR5IGJsb2NrIGFuZCB0aGUgJ2Zyb20nIHRva2VuLCBsZWF2aW5nIHRoZSBpbXBvcnQgb25seSBmb3IgaXRzIHNpZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZWZmZWN0cywgZS5nLiBgaW1wb3J0ICdtb2QnYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VDb2RlID0gY29udGV4dC5nZXRTb3VyY2VDb2RlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZyb21Ub2tlbiA9IHByb2dyYW0udG9rZW5zLmZpbmQodCA9PiB0LnZhbHVlID09PSAnZnJvbScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbXBvcnRUb2tlbiA9IHByb2dyYW0udG9rZW5zLmZpbmQodCA9PiB0LnZhbHVlID09PSAnaW1wb3J0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc1NwYWNlQWZ0ZXJGcm9tID0gc291cmNlQ29kZS5pc1NwYWNlQmV0d2Vlbihmcm9tVG9rZW4sIHNvdXJjZUNvZGUuZ2V0VG9rZW5BZnRlcihmcm9tVG9rZW4pKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaGFzU3BhY2VBZnRlckltcG9ydCA9IHNvdXJjZUNvZGUuaXNTcGFjZUJldHdlZW4oaW1wb3J0VG9rZW4sIHNvdXJjZUNvZGUuZ2V0VG9rZW5BZnRlcihmcm9tVG9rZW4pKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IFtzdGFydF0gPSBnZXRFbXB0eUJsb2NrUmFuZ2UocHJvZ3JhbS50b2tlbnMsIGlkeCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IFssIGVuZF0gPSBmcm9tVG9rZW4ucmFuZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhbmdlID0gW3N0YXJ0LCBoYXNTcGFjZUFmdGVyRnJvbSA/IGVuZCArIDEgOiBlbmRdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpeGVyLnJlcGxhY2VUZXh0UmFuZ2UocmFuZ2UsIGhhc1NwYWNlQWZ0ZXJJbXBvcnQgPyAnJyA6ICcgJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnVW5leHBlY3RlZCBlbXB0eSBuYW1lZCBpbXBvcnQgYmxvY2snLFxyXG4gICAgICAgICAgICAgICAgICBmaXgoZml4ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZml4ZXIucmVtb3ZlUmFuZ2UoZ2V0RW1wdHlCbG9ja1JhbmdlKHByb2dyYW0udG9rZW5zLCBpZHgpKTtcclxuICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sXHJcbiAgICB9O1xyXG4gIH0sXHJcbn07XHJcbiJdfQ==