'use strict';var _path = require('path');var _path2 = _interopRequireDefault(_path);
var _minimatch = require('minimatch');var _minimatch2 = _interopRequireDefault(_minimatch);

var _staticRequire = require('../core/staticRequire');var _staticRequire2 = _interopRequireDefault(_staticRequire);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

function report(context, node) {
  context.report({
    node: node,
    message: 'Imported module should be assigned' });

}

function testIsAllow(globs, filename, source) {
  if (!Array.isArray(globs)) {
    return false; // default doesn't allow any patterns
  }

  var filePath = void 0;

  if (source[0] !== '.' && source[0] !== '/') {// a node module
    filePath = source;
  } else {
    filePath = _path2['default'].resolve(_path2['default'].dirname(filename), source); // get source absolute path
  }

  return globs.find(function (glob) {return (
      (0, _minimatch2['default'])(filePath, glob) ||
      (0, _minimatch2['default'])(filePath, _path2['default'].join(process.cwd(), glob)));}) !==
  undefined;
}

function create(context) {
  var options = context.options[0] || {};
  var filename = context.getPhysicalFilename ? context.getPhysicalFilename() : context.getFilename();
  var isAllow = function isAllow(source) {return testIsAllow(options.allow, filename, source);};

  return {
    ImportDeclaration: function () {function ImportDeclaration(node) {
        if (node.specifiers.length === 0 && !isAllow(node.source.value)) {
          report(context, node);
        }
      }return ImportDeclaration;}(),
    ExpressionStatement: function () {function ExpressionStatement(node) {
        if (node.expression.type === 'CallExpression' &&
        (0, _staticRequire2['default'])(node.expression) &&
        !isAllow(node.expression.arguments[0].value)) {
          report(context, node.expression);
        }
      }return ExpressionStatement;}() };

}

module.exports = {
  create: create,
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Style guide',
      description: 'Forbid unassigned imports',
      url: (0, _docsUrl2['default'])('no-unassigned-import') },

    schema: [
    {
      'type': 'object',
      'properties': {
        'devDependencies': { 'type': ['boolean', 'array'] },
        'optionalDependencies': { 'type': ['boolean', 'array'] },
        'peerDependencies': { 'type': ['boolean', 'array'] },
        'allow': {
          'type': 'array',
          'items': {
            'type': 'string' } } },



      'additionalProperties': false }] } };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby11bmFzc2lnbmVkLWltcG9ydC5qcyJdLCJuYW1lcyI6WyJyZXBvcnQiLCJjb250ZXh0Iiwibm9kZSIsIm1lc3NhZ2UiLCJ0ZXN0SXNBbGxvdyIsImdsb2JzIiwiZmlsZW5hbWUiLCJzb3VyY2UiLCJBcnJheSIsImlzQXJyYXkiLCJmaWxlUGF0aCIsInBhdGgiLCJyZXNvbHZlIiwiZGlybmFtZSIsImZpbmQiLCJnbG9iIiwiam9pbiIsInByb2Nlc3MiLCJjd2QiLCJ1bmRlZmluZWQiLCJjcmVhdGUiLCJvcHRpb25zIiwiZ2V0UGh5c2ljYWxGaWxlbmFtZSIsImdldEZpbGVuYW1lIiwiaXNBbGxvdyIsImFsbG93IiwiSW1wb3J0RGVjbGFyYXRpb24iLCJzcGVjaWZpZXJzIiwibGVuZ3RoIiwidmFsdWUiLCJFeHByZXNzaW9uU3RhdGVtZW50IiwiZXhwcmVzc2lvbiIsInR5cGUiLCJhcmd1bWVudHMiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwic2NoZW1hIl0sIm1hcHBpbmdzIjoiYUFBQSw0QjtBQUNBLHNDOztBQUVBLHNEO0FBQ0EscUM7O0FBRUEsU0FBU0EsTUFBVCxDQUFnQkMsT0FBaEIsRUFBeUJDLElBQXpCLEVBQStCO0FBQzdCRCxVQUFRRCxNQUFSLENBQWU7QUFDYkUsY0FEYTtBQUViQyxhQUFTLG9DQUZJLEVBQWY7O0FBSUQ7O0FBRUQsU0FBU0MsV0FBVCxDQUFxQkMsS0FBckIsRUFBNEJDLFFBQTVCLEVBQXNDQyxNQUF0QyxFQUE4QztBQUM1QyxNQUFJLENBQUNDLE1BQU1DLE9BQU4sQ0FBY0osS0FBZCxDQUFMLEVBQTJCO0FBQ3pCLFdBQU8sS0FBUCxDQUR5QixDQUNYO0FBQ2Y7O0FBRUQsTUFBSUssaUJBQUo7O0FBRUEsTUFBSUgsT0FBTyxDQUFQLE1BQWMsR0FBZCxJQUFxQkEsT0FBTyxDQUFQLE1BQWMsR0FBdkMsRUFBNEMsQ0FBRTtBQUM1Q0csZUFBV0gsTUFBWDtBQUNELEdBRkQsTUFFTztBQUNMRyxlQUFXQyxrQkFBS0MsT0FBTCxDQUFhRCxrQkFBS0UsT0FBTCxDQUFhUCxRQUFiLENBQWIsRUFBcUNDLE1BQXJDLENBQVgsQ0FESyxDQUNvRDtBQUMxRDs7QUFFRCxTQUFPRixNQUFNUyxJQUFOLENBQVc7QUFDaEIsa0NBQVVKLFFBQVYsRUFBb0JLLElBQXBCO0FBQ0Esa0NBQVVMLFFBQVYsRUFBb0JDLGtCQUFLSyxJQUFMLENBQVVDLFFBQVFDLEdBQVIsRUFBVixFQUF5QkgsSUFBekIsQ0FBcEIsQ0FGZ0IsR0FBWDtBQUdBSSxXQUhQO0FBSUQ7O0FBRUQsU0FBU0MsTUFBVCxDQUFnQm5CLE9BQWhCLEVBQXlCO0FBQ3ZCLE1BQU1vQixVQUFVcEIsUUFBUW9CLE9BQVIsQ0FBZ0IsQ0FBaEIsS0FBc0IsRUFBdEM7QUFDQSxNQUFNZixXQUFXTCxRQUFRcUIsbUJBQVIsR0FBOEJyQixRQUFRcUIsbUJBQVIsRUFBOUIsR0FBOERyQixRQUFRc0IsV0FBUixFQUEvRTtBQUNBLE1BQU1DLFVBQVUsU0FBVkEsT0FBVSxpQkFBVXBCLFlBQVlpQixRQUFRSSxLQUFwQixFQUEyQm5CLFFBQTNCLEVBQXFDQyxNQUFyQyxDQUFWLEVBQWhCOztBQUVBLFNBQU87QUFDTG1CLHFCQURLLDBDQUNheEIsSUFEYixFQUNtQjtBQUN0QixZQUFJQSxLQUFLeUIsVUFBTCxDQUFnQkMsTUFBaEIsS0FBMkIsQ0FBM0IsSUFBZ0MsQ0FBQ0osUUFBUXRCLEtBQUtLLE1BQUwsQ0FBWXNCLEtBQXBCLENBQXJDLEVBQWlFO0FBQy9EN0IsaUJBQU9DLE9BQVAsRUFBZ0JDLElBQWhCO0FBQ0Q7QUFDRixPQUxJO0FBTUw0Qix1QkFOSyw0Q0FNZTVCLElBTmYsRUFNcUI7QUFDeEIsWUFBSUEsS0FBSzZCLFVBQUwsQ0FBZ0JDLElBQWhCLEtBQXlCLGdCQUF6QjtBQUNGLHdDQUFnQjlCLEtBQUs2QixVQUFyQixDQURFO0FBRUYsU0FBQ1AsUUFBUXRCLEtBQUs2QixVQUFMLENBQWdCRSxTQUFoQixDQUEwQixDQUExQixFQUE2QkosS0FBckMsQ0FGSCxFQUVnRDtBQUM5QzdCLGlCQUFPQyxPQUFQLEVBQWdCQyxLQUFLNkIsVUFBckI7QUFDRDtBQUNGLE9BWkksZ0NBQVA7O0FBY0Q7O0FBRURHLE9BQU9DLE9BQVAsR0FBaUI7QUFDZmYsZ0JBRGU7QUFFZmdCLFFBQU07QUFDSkosVUFBTSxZQURGO0FBRUpLLFVBQU07QUFDSkMsZ0JBQVUsYUFETjtBQUVKQyxtQkFBYSwyQkFGVDtBQUdKQyxXQUFLLDBCQUFRLHNCQUFSLENBSEQsRUFGRjs7QUFPSkMsWUFBUTtBQUNOO0FBQ0UsY0FBUSxRQURWO0FBRUUsb0JBQWM7QUFDWiwyQkFBbUIsRUFBRSxRQUFRLENBQUMsU0FBRCxFQUFZLE9BQVosQ0FBVixFQURQO0FBRVosZ0NBQXdCLEVBQUUsUUFBUSxDQUFDLFNBQUQsRUFBWSxPQUFaLENBQVYsRUFGWjtBQUdaLDRCQUFvQixFQUFFLFFBQVEsQ0FBQyxTQUFELEVBQVksT0FBWixDQUFWLEVBSFI7QUFJWixpQkFBUztBQUNQLGtCQUFRLE9BREQ7QUFFUCxtQkFBUztBQUNQLG9CQUFRLFFBREQsRUFGRixFQUpHLEVBRmhCOzs7O0FBYUUsOEJBQXdCLEtBYjFCLEVBRE0sQ0FQSixFQUZTLEVBQWpCIiwiZmlsZSI6Im5vLXVuYXNzaWduZWQtaW1wb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCBtaW5pbWF0Y2ggZnJvbSAnbWluaW1hdGNoJztcclxuXHJcbmltcG9ydCBpc1N0YXRpY1JlcXVpcmUgZnJvbSAnLi4vY29yZS9zdGF0aWNSZXF1aXJlJztcclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XHJcblxyXG5mdW5jdGlvbiByZXBvcnQoY29udGV4dCwgbm9kZSkge1xyXG4gIGNvbnRleHQucmVwb3J0KHtcclxuICAgIG5vZGUsXHJcbiAgICBtZXNzYWdlOiAnSW1wb3J0ZWQgbW9kdWxlIHNob3VsZCBiZSBhc3NpZ25lZCcsXHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRlc3RJc0FsbG93KGdsb2JzLCBmaWxlbmFtZSwgc291cmNlKSB7XHJcbiAgaWYgKCFBcnJheS5pc0FycmF5KGdsb2JzKSkge1xyXG4gICAgcmV0dXJuIGZhbHNlOyAvLyBkZWZhdWx0IGRvZXNuJ3QgYWxsb3cgYW55IHBhdHRlcm5zXHJcbiAgfVxyXG5cclxuICBsZXQgZmlsZVBhdGg7XHJcblxyXG4gIGlmIChzb3VyY2VbMF0gIT09ICcuJyAmJiBzb3VyY2VbMF0gIT09ICcvJykgeyAvLyBhIG5vZGUgbW9kdWxlXHJcbiAgICBmaWxlUGF0aCA9IHNvdXJjZTtcclxuICB9IGVsc2Uge1xyXG4gICAgZmlsZVBhdGggPSBwYXRoLnJlc29sdmUocGF0aC5kaXJuYW1lKGZpbGVuYW1lKSwgc291cmNlKTsgLy8gZ2V0IHNvdXJjZSBhYnNvbHV0ZSBwYXRoXHJcbiAgfVxyXG5cclxuICByZXR1cm4gZ2xvYnMuZmluZChnbG9iID0+IChcclxuICAgIG1pbmltYXRjaChmaWxlUGF0aCwgZ2xvYikgfHxcclxuICAgIG1pbmltYXRjaChmaWxlUGF0aCwgcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIGdsb2IpKVxyXG4gICkpICE9PSB1bmRlZmluZWQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZShjb250ZXh0KSB7XHJcbiAgY29uc3Qgb3B0aW9ucyA9IGNvbnRleHQub3B0aW9uc1swXSB8fCB7fTtcclxuICBjb25zdCBmaWxlbmFtZSA9IGNvbnRleHQuZ2V0UGh5c2ljYWxGaWxlbmFtZSA/IGNvbnRleHQuZ2V0UGh5c2ljYWxGaWxlbmFtZSgpIDogY29udGV4dC5nZXRGaWxlbmFtZSgpO1xyXG4gIGNvbnN0IGlzQWxsb3cgPSBzb3VyY2UgPT4gdGVzdElzQWxsb3cob3B0aW9ucy5hbGxvdywgZmlsZW5hbWUsIHNvdXJjZSk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBJbXBvcnREZWNsYXJhdGlvbihub2RlKSB7XHJcbiAgICAgIGlmIChub2RlLnNwZWNpZmllcnMubGVuZ3RoID09PSAwICYmICFpc0FsbG93KG5vZGUuc291cmNlLnZhbHVlKSkge1xyXG4gICAgICAgIHJlcG9ydChjb250ZXh0LCBub2RlKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIEV4cHJlc3Npb25TdGF0ZW1lbnQobm9kZSkge1xyXG4gICAgICBpZiAobm9kZS5leHByZXNzaW9uLnR5cGUgPT09ICdDYWxsRXhwcmVzc2lvbicgJiZcclxuICAgICAgICBpc1N0YXRpY1JlcXVpcmUobm9kZS5leHByZXNzaW9uKSAmJlxyXG4gICAgICAgICFpc0FsbG93KG5vZGUuZXhwcmVzc2lvbi5hcmd1bWVudHNbMF0udmFsdWUpKSB7XHJcbiAgICAgICAgcmVwb3J0KGNvbnRleHQsIG5vZGUuZXhwcmVzc2lvbik7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgY3JlYXRlLFxyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdzdWdnZXN0aW9uJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgY2F0ZWdvcnk6ICdTdHlsZSBndWlkZScsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnRm9yYmlkIHVuYXNzaWduZWQgaW1wb3J0cycsXHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8tdW5hc3NpZ25lZC1pbXBvcnQnKSxcclxuICAgIH0sXHJcbiAgICBzY2hlbWE6IFtcclxuICAgICAge1xyXG4gICAgICAgICd0eXBlJzogJ29iamVjdCcsXHJcbiAgICAgICAgJ3Byb3BlcnRpZXMnOiB7XHJcbiAgICAgICAgICAnZGV2RGVwZW5kZW5jaWVzJzogeyAndHlwZSc6IFsnYm9vbGVhbicsICdhcnJheSddIH0sXHJcbiAgICAgICAgICAnb3B0aW9uYWxEZXBlbmRlbmNpZXMnOiB7ICd0eXBlJzogWydib29sZWFuJywgJ2FycmF5J10gfSxcclxuICAgICAgICAgICdwZWVyRGVwZW5kZW5jaWVzJzogeyAndHlwZSc6IFsnYm9vbGVhbicsICdhcnJheSddIH0sXHJcbiAgICAgICAgICAnYWxsb3cnOiB7XHJcbiAgICAgICAgICAgICd0eXBlJzogJ2FycmF5JyxcclxuICAgICAgICAgICAgJ2l0ZW1zJzoge1xyXG4gICAgICAgICAgICAgICd0eXBlJzogJ3N0cmluZycsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJzogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIH0sXHJcbn07XHJcbiJdfQ==