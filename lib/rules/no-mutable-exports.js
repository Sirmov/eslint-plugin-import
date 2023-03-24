'use strict';var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Helpful warnings',
      description: 'Forbid the use of mutable exports with `var` or `let`.',
      url: (0, _docsUrl2['default'])('no-mutable-exports') },

    schema: [] },


  create: function () {function create(context) {
      function checkDeclaration(node) {var
        kind = node.kind;
        if (kind === 'var' || kind === 'let') {
          context.report(node, 'Exporting mutable \'' + String(kind) + '\' binding, use \'const\' instead.');
        }
      }

      function checkDeclarationsInScope(_ref, name) {var variables = _ref.variables;var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
          for (var _iterator = variables[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var variable = _step.value;
            if (variable.name === name) {var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {
                for (var _iterator2 = variable.defs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var def = _step2.value;
                  if (def.type === 'Variable' && def.parent) {
                    checkDeclaration(def.parent);
                  }
                }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2['return']) {_iterator2['return']();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}
            }
          }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
      }

      function handleExportDefault(node) {
        var scope = context.getScope();

        if (node.declaration.name) {
          checkDeclarationsInScope(scope, node.declaration.name);
        }
      }

      function handleExportNamed(node) {
        var scope = context.getScope();

        if (node.declaration) {
          checkDeclaration(node.declaration);
        } else if (!node.source) {var _iteratorNormalCompletion3 = true;var _didIteratorError3 = false;var _iteratorError3 = undefined;try {
            for (var _iterator3 = node.specifiers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {var specifier = _step3.value;
              checkDeclarationsInScope(scope, specifier.local.name);
            }} catch (err) {_didIteratorError3 = true;_iteratorError3 = err;} finally {try {if (!_iteratorNormalCompletion3 && _iterator3['return']) {_iterator3['return']();}} finally {if (_didIteratorError3) {throw _iteratorError3;}}}
        }
      }

      return {
        'ExportDefaultDeclaration': handleExportDefault,
        'ExportNamedDeclaration': handleExportNamed };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1tdXRhYmxlLWV4cG9ydHMuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJ1cmwiLCJzY2hlbWEiLCJjcmVhdGUiLCJjb250ZXh0IiwiY2hlY2tEZWNsYXJhdGlvbiIsIm5vZGUiLCJraW5kIiwicmVwb3J0IiwiY2hlY2tEZWNsYXJhdGlvbnNJblNjb3BlIiwibmFtZSIsInZhcmlhYmxlcyIsInZhcmlhYmxlIiwiZGVmcyIsImRlZiIsInBhcmVudCIsImhhbmRsZUV4cG9ydERlZmF1bHQiLCJzY29wZSIsImdldFNjb3BlIiwiZGVjbGFyYXRpb24iLCJoYW5kbGVFeHBvcnROYW1lZCIsInNvdXJjZSIsInNwZWNpZmllcnMiLCJzcGVjaWZpZXIiLCJsb2NhbCJdLCJtYXBwaW5ncyI6ImFBQUEscUM7O0FBRUFBLE9BQU9DLE9BQVAsR0FBaUI7QUFDZkMsUUFBTTtBQUNKQyxVQUFNLFlBREY7QUFFSkMsVUFBTTtBQUNKQyxnQkFBVSxrQkFETjtBQUVKQyxtQkFBYSx3REFGVDtBQUdKQyxXQUFLLDBCQUFRLG9CQUFSLENBSEQsRUFGRjs7QUFPSkMsWUFBUSxFQVBKLEVBRFM7OztBQVdmQyxRQVhlLCtCQVdSQyxPQVhRLEVBV0M7QUFDZCxlQUFTQyxnQkFBVCxDQUEwQkMsSUFBMUIsRUFBZ0M7QUFDdEJDLFlBRHNCLEdBQ2JELElBRGEsQ0FDdEJDLElBRHNCO0FBRTlCLFlBQUlBLFNBQVMsS0FBVCxJQUFrQkEsU0FBUyxLQUEvQixFQUFzQztBQUNwQ0gsa0JBQVFJLE1BQVIsQ0FBZUYsSUFBZixrQ0FBMkNDLElBQTNDO0FBQ0Q7QUFDRjs7QUFFRCxlQUFTRSx3QkFBVCxPQUFpREMsSUFBakQsRUFBdUQsS0FBbkJDLFNBQW1CLFFBQW5CQSxTQUFtQjtBQUNyRCwrQkFBdUJBLFNBQXZCLDhIQUFrQyxLQUF2QkMsUUFBdUI7QUFDaEMsZ0JBQUlBLFNBQVNGLElBQVQsS0FBa0JBLElBQXRCLEVBQTRCO0FBQzFCLHNDQUFrQkUsU0FBU0MsSUFBM0IsbUlBQWlDLEtBQXRCQyxHQUFzQjtBQUMvQixzQkFBSUEsSUFBSWpCLElBQUosS0FBYSxVQUFiLElBQTJCaUIsSUFBSUMsTUFBbkMsRUFBMkM7QUFDekNWLHFDQUFpQlMsSUFBSUMsTUFBckI7QUFDRDtBQUNGLGlCQUx5QjtBQU0zQjtBQUNGLFdBVG9EO0FBVXREOztBQUVELGVBQVNDLG1CQUFULENBQTZCVixJQUE3QixFQUFtQztBQUNqQyxZQUFNVyxRQUFRYixRQUFRYyxRQUFSLEVBQWQ7O0FBRUEsWUFBSVosS0FBS2EsV0FBTCxDQUFpQlQsSUFBckIsRUFBMkI7QUFDekJELG1DQUF5QlEsS0FBekIsRUFBZ0NYLEtBQUthLFdBQUwsQ0FBaUJULElBQWpEO0FBQ0Q7QUFDRjs7QUFFRCxlQUFTVSxpQkFBVCxDQUEyQmQsSUFBM0IsRUFBaUM7QUFDL0IsWUFBTVcsUUFBUWIsUUFBUWMsUUFBUixFQUFkOztBQUVBLFlBQUlaLEtBQUthLFdBQVQsRUFBdUI7QUFDckJkLDJCQUFpQkMsS0FBS2EsV0FBdEI7QUFDRCxTQUZELE1BRU8sSUFBSSxDQUFDYixLQUFLZSxNQUFWLEVBQWtCO0FBQ3ZCLGtDQUF3QmYsS0FBS2dCLFVBQTdCLG1JQUF5QyxLQUE5QkMsU0FBOEI7QUFDdkNkLHVDQUF5QlEsS0FBekIsRUFBZ0NNLFVBQVVDLEtBQVYsQ0FBZ0JkLElBQWhEO0FBQ0QsYUFIc0I7QUFJeEI7QUFDRjs7QUFFRCxhQUFPO0FBQ0wsb0NBQTRCTSxtQkFEdkI7QUFFTCxrQ0FBMEJJLGlCQUZyQixFQUFQOztBQUlELEtBdkRjLG1CQUFqQiIsImZpbGUiOiJuby1tdXRhYmxlLWV4cG9ydHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdzdWdnZXN0aW9uJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgY2F0ZWdvcnk6ICdIZWxwZnVsIHdhcm5pbmdzJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdGb3JiaWQgdGhlIHVzZSBvZiBtdXRhYmxlIGV4cG9ydHMgd2l0aCBgdmFyYCBvciBgbGV0YC4nLFxyXG4gICAgICB1cmw6IGRvY3NVcmwoJ25vLW11dGFibGUtZXhwb3J0cycpLFxyXG4gICAgfSxcclxuICAgIHNjaGVtYTogW10sXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlKGNvbnRleHQpIHtcclxuICAgIGZ1bmN0aW9uIGNoZWNrRGVjbGFyYXRpb24obm9kZSkge1xyXG4gICAgICBjb25zdCB7IGtpbmQgfSA9IG5vZGU7XHJcbiAgICAgIGlmIChraW5kID09PSAndmFyJyB8fCBraW5kID09PSAnbGV0Jykge1xyXG4gICAgICAgIGNvbnRleHQucmVwb3J0KG5vZGUsIGBFeHBvcnRpbmcgbXV0YWJsZSAnJHtraW5kfScgYmluZGluZywgdXNlICdjb25zdCcgaW5zdGVhZC5gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNoZWNrRGVjbGFyYXRpb25zSW5TY29wZSh7IHZhcmlhYmxlcyB9LCBuYW1lKSB7XHJcbiAgICAgIGZvciAoY29uc3QgdmFyaWFibGUgb2YgdmFyaWFibGVzKSB7XHJcbiAgICAgICAgaWYgKHZhcmlhYmxlLm5hbWUgPT09IG5hbWUpIHtcclxuICAgICAgICAgIGZvciAoY29uc3QgZGVmIG9mIHZhcmlhYmxlLmRlZnMpIHtcclxuICAgICAgICAgICAgaWYgKGRlZi50eXBlID09PSAnVmFyaWFibGUnICYmIGRlZi5wYXJlbnQpIHtcclxuICAgICAgICAgICAgICBjaGVja0RlY2xhcmF0aW9uKGRlZi5wYXJlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaGFuZGxlRXhwb3J0RGVmYXVsdChub2RlKSB7XHJcbiAgICAgIGNvbnN0IHNjb3BlID0gY29udGV4dC5nZXRTY29wZSgpO1xyXG5cclxuICAgICAgaWYgKG5vZGUuZGVjbGFyYXRpb24ubmFtZSkge1xyXG4gICAgICAgIGNoZWNrRGVjbGFyYXRpb25zSW5TY29wZShzY29wZSwgbm9kZS5kZWNsYXJhdGlvbi5uYW1lKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZUV4cG9ydE5hbWVkKG5vZGUpIHtcclxuICAgICAgY29uc3Qgc2NvcGUgPSBjb250ZXh0LmdldFNjb3BlKCk7XHJcblxyXG4gICAgICBpZiAobm9kZS5kZWNsYXJhdGlvbikgIHtcclxuICAgICAgICBjaGVja0RlY2xhcmF0aW9uKG5vZGUuZGVjbGFyYXRpb24pO1xyXG4gICAgICB9IGVsc2UgaWYgKCFub2RlLnNvdXJjZSkge1xyXG4gICAgICAgIGZvciAoY29uc3Qgc3BlY2lmaWVyIG9mIG5vZGUuc3BlY2lmaWVycykge1xyXG4gICAgICAgICAgY2hlY2tEZWNsYXJhdGlvbnNJblNjb3BlKHNjb3BlLCBzcGVjaWZpZXIubG9jYWwubmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgJ0V4cG9ydERlZmF1bHREZWNsYXJhdGlvbic6IGhhbmRsZUV4cG9ydERlZmF1bHQsXHJcbiAgICAgICdFeHBvcnROYW1lZERlY2xhcmF0aW9uJzogaGFuZGxlRXhwb3J0TmFtZWQsXHJcbiAgICB9O1xyXG4gIH0sXHJcbn07XHJcbiJdfQ==