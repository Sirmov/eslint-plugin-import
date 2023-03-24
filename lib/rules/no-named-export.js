'use strict';var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Style guide',
      description: 'Forbid named exports.',
      url: (0, _docsUrl2['default'])('no-named-export') },

    schema: [] },


  create: function () {function create(context) {
      // ignore non-modules
      if (context.parserOptions.sourceType !== 'module') {
        return {};
      }

      var message = 'Named exports are not allowed.';

      return {
        ExportAllDeclaration: function () {function ExportAllDeclaration(node) {
            context.report({ node: node, message: message });
          }return ExportAllDeclaration;}(),

        ExportNamedDeclaration: function () {function ExportNamedDeclaration(node) {
            if (node.specifiers.length === 0) {
              return context.report({ node: node, message: message });
            }

            var someNamed = node.specifiers.some(function (specifier) {return (specifier.exported.name || specifier.exported.value) !== 'default';});
            if (someNamed) {
              context.report({ node: node, message: message });
            }
          }return ExportNamedDeclaration;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1uYW1lZC1leHBvcnQuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJ1cmwiLCJzY2hlbWEiLCJjcmVhdGUiLCJjb250ZXh0IiwicGFyc2VyT3B0aW9ucyIsInNvdXJjZVR5cGUiLCJtZXNzYWdlIiwiRXhwb3J0QWxsRGVjbGFyYXRpb24iLCJub2RlIiwicmVwb3J0IiwiRXhwb3J0TmFtZWREZWNsYXJhdGlvbiIsInNwZWNpZmllcnMiLCJsZW5ndGgiLCJzb21lTmFtZWQiLCJzb21lIiwic3BlY2lmaWVyIiwiZXhwb3J0ZWQiLCJuYW1lIiwidmFsdWUiXSwibWFwcGluZ3MiOiJhQUFBLHFDOztBQUVBQSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSkMsVUFBTSxZQURGO0FBRUpDLFVBQU07QUFDSkMsZ0JBQVUsYUFETjtBQUVKQyxtQkFBYSx1QkFGVDtBQUdKQyxXQUFLLDBCQUFRLGlCQUFSLENBSEQsRUFGRjs7QUFPSkMsWUFBUSxFQVBKLEVBRFM7OztBQVdmQyxRQVhlLCtCQVdSQyxPQVhRLEVBV0M7QUFDZDtBQUNBLFVBQUlBLFFBQVFDLGFBQVIsQ0FBc0JDLFVBQXRCLEtBQXFDLFFBQXpDLEVBQW1EO0FBQ2pELGVBQU8sRUFBUDtBQUNEOztBQUVELFVBQU1DLFVBQVUsZ0NBQWhCOztBQUVBLGFBQU87QUFDTEMsNEJBREssNkNBQ2dCQyxJQURoQixFQUNzQjtBQUN6Qkwsb0JBQVFNLE1BQVIsQ0FBZSxFQUFFRCxVQUFGLEVBQVFGLGdCQUFSLEVBQWY7QUFDRCxXQUhJOztBQUtMSSw4QkFMSywrQ0FLa0JGLElBTGxCLEVBS3dCO0FBQzNCLGdCQUFJQSxLQUFLRyxVQUFMLENBQWdCQyxNQUFoQixLQUEyQixDQUEvQixFQUFrQztBQUNoQyxxQkFBT1QsUUFBUU0sTUFBUixDQUFlLEVBQUVELFVBQUYsRUFBUUYsZ0JBQVIsRUFBZixDQUFQO0FBQ0Q7O0FBRUQsZ0JBQU1PLFlBQVlMLEtBQUtHLFVBQUwsQ0FBZ0JHLElBQWhCLENBQXFCLDZCQUFhLENBQUNDLFVBQVVDLFFBQVYsQ0FBbUJDLElBQW5CLElBQTJCRixVQUFVQyxRQUFWLENBQW1CRSxLQUEvQyxNQUEwRCxTQUF2RSxFQUFyQixDQUFsQjtBQUNBLGdCQUFJTCxTQUFKLEVBQWU7QUFDYlYsc0JBQVFNLE1BQVIsQ0FBZSxFQUFFRCxVQUFGLEVBQVFGLGdCQUFSLEVBQWY7QUFDRDtBQUNGLFdBZEksbUNBQVA7O0FBZ0JELEtBbkNjLG1CQUFqQiIsImZpbGUiOiJuby1uYW1lZC1leHBvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdzdWdnZXN0aW9uJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgY2F0ZWdvcnk6ICdTdHlsZSBndWlkZScsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnRm9yYmlkIG5hbWVkIGV4cG9ydHMuJyxcclxuICAgICAgdXJsOiBkb2NzVXJsKCduby1uYW1lZC1leHBvcnQnKSxcclxuICAgIH0sXHJcbiAgICBzY2hlbWE6IFtdLFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZShjb250ZXh0KSB7XHJcbiAgICAvLyBpZ25vcmUgbm9uLW1vZHVsZXNcclxuICAgIGlmIChjb250ZXh0LnBhcnNlck9wdGlvbnMuc291cmNlVHlwZSAhPT0gJ21vZHVsZScpIHtcclxuICAgICAgcmV0dXJuIHt9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG1lc3NhZ2UgPSAnTmFtZWQgZXhwb3J0cyBhcmUgbm90IGFsbG93ZWQuJztcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBFeHBvcnRBbGxEZWNsYXJhdGlvbihub2RlKSB7XHJcbiAgICAgICAgY29udGV4dC5yZXBvcnQoeyBub2RlLCBtZXNzYWdlIH0pO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgRXhwb3J0TmFtZWREZWNsYXJhdGlvbihub2RlKSB7XHJcbiAgICAgICAgaWYgKG5vZGUuc3BlY2lmaWVycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIHJldHVybiBjb250ZXh0LnJlcG9ydCh7IG5vZGUsIG1lc3NhZ2UgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzb21lTmFtZWQgPSBub2RlLnNwZWNpZmllcnMuc29tZShzcGVjaWZpZXIgPT4gKHNwZWNpZmllci5leHBvcnRlZC5uYW1lIHx8IHNwZWNpZmllci5leHBvcnRlZC52YWx1ZSkgIT09ICdkZWZhdWx0Jyk7XHJcbiAgICAgICAgaWYgKHNvbWVOYW1lZCkge1xyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoeyBub2RlLCBtZXNzYWdlIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH07XHJcbiAgfSxcclxufTtcclxuIl19