'use strict';var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Style guide',
      description: 'Forbid named default exports.',
      url: (0, _docsUrl2['default'])('no-named-default') },

    schema: [] },


  create: function () {function create(context) {
      return {
        'ImportDeclaration': function () {function ImportDeclaration(node) {
            node.specifiers.forEach(function (im) {
              if (im.importKind === 'type' || im.importKind === 'typeof') {
                return;
              }

              if (im.type === 'ImportSpecifier' && (im.imported.name || im.imported.value) === 'default') {
                context.report({
                  node: im.local,
                  message: 'Use default import syntax to import \'' + String(im.local.name) + '\'.' });
              }
            });
          }return ImportDeclaration;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1uYW1lZC1kZWZhdWx0LmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwic2NoZW1hIiwiY3JlYXRlIiwiY29udGV4dCIsIm5vZGUiLCJzcGVjaWZpZXJzIiwiZm9yRWFjaCIsImltIiwiaW1wb3J0S2luZCIsImltcG9ydGVkIiwibmFtZSIsInZhbHVlIiwicmVwb3J0IiwibG9jYWwiLCJtZXNzYWdlIl0sIm1hcHBpbmdzIjoiYUFBQSxxQzs7QUFFQUEsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0pDLFVBQU0sWUFERjtBQUVKQyxVQUFNO0FBQ0pDLGdCQUFVLGFBRE47QUFFSkMsbUJBQWEsK0JBRlQ7QUFHSkMsV0FBSywwQkFBUSxrQkFBUixDQUhELEVBRkY7O0FBT0pDLFlBQVEsRUFQSixFQURTOzs7QUFXZkMsUUFYZSwrQkFXUkMsT0FYUSxFQVdDO0FBQ2QsYUFBTztBQUNMLDBDQUFxQiwyQkFBVUMsSUFBVixFQUFnQjtBQUNuQ0EsaUJBQUtDLFVBQUwsQ0FBZ0JDLE9BQWhCLENBQXdCLFVBQVVDLEVBQVYsRUFBYztBQUNwQyxrQkFBSUEsR0FBR0MsVUFBSCxLQUFrQixNQUFsQixJQUE0QkQsR0FBR0MsVUFBSCxLQUFrQixRQUFsRCxFQUE0RDtBQUMxRDtBQUNEOztBQUVELGtCQUFJRCxHQUFHWCxJQUFILEtBQVksaUJBQVosSUFBaUMsQ0FBQ1csR0FBR0UsUUFBSCxDQUFZQyxJQUFaLElBQW9CSCxHQUFHRSxRQUFILENBQVlFLEtBQWpDLE1BQTRDLFNBQWpGLEVBQTRGO0FBQzFGUix3QkFBUVMsTUFBUixDQUFlO0FBQ2JSLHdCQUFNRyxHQUFHTSxLQURJO0FBRWJDLDZFQUFpRFAsR0FBR00sS0FBSCxDQUFTSCxJQUExRCxTQUZhLEVBQWY7QUFHRDtBQUNGLGFBVkQ7QUFXRCxXQVpELDRCQURLLEVBQVA7O0FBZUQsS0EzQmMsbUJBQWpCIiwiZmlsZSI6Im5vLW5hbWVkLWRlZmF1bHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdzdWdnZXN0aW9uJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgY2F0ZWdvcnk6ICdTdHlsZSBndWlkZScsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnRm9yYmlkIG5hbWVkIGRlZmF1bHQgZXhwb3J0cy4nLFxyXG4gICAgICB1cmw6IGRvY3NVcmwoJ25vLW5hbWVkLWRlZmF1bHQnKSxcclxuICAgIH0sXHJcbiAgICBzY2hlbWE6IFtdLFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZShjb250ZXh0KSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAnSW1wb3J0RGVjbGFyYXRpb24nOiBmdW5jdGlvbiAobm9kZSkge1xyXG4gICAgICAgIG5vZGUuc3BlY2lmaWVycy5mb3JFYWNoKGZ1bmN0aW9uIChpbSkge1xyXG4gICAgICAgICAgaWYgKGltLmltcG9ydEtpbmQgPT09ICd0eXBlJyB8fCBpbS5pbXBvcnRLaW5kID09PSAndHlwZW9mJykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGltLnR5cGUgPT09ICdJbXBvcnRTcGVjaWZpZXInICYmIChpbS5pbXBvcnRlZC5uYW1lIHx8IGltLmltcG9ydGVkLnZhbHVlKSA9PT0gJ2RlZmF1bHQnKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgICBub2RlOiBpbS5sb2NhbCxcclxuICAgICAgICAgICAgICBtZXNzYWdlOiBgVXNlIGRlZmF1bHQgaW1wb3J0IHN5bnRheCB0byBpbXBvcnQgJyR7aW0ubG9jYWwubmFtZX0nLmAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sXHJcbiAgICB9O1xyXG4gIH0sXHJcbn07XHJcbiJdfQ==