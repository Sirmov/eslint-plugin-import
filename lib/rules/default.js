'use strict';var _ExportMap = require('../ExportMap');var _ExportMap2 = _interopRequireDefault(_ExportMap);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      category: 'Static analysis',
      description: 'Ensure a default export is present, given a default import.',
      url: (0, _docsUrl2['default'])('default') },

    schema: [] },


  create: function () {function create(context) {

      function checkDefault(specifierType, node) {

        var defaultSpecifier = node.specifiers.find(
        function (specifier) {return specifier.type === specifierType;});


        if (!defaultSpecifier) return;
        var imports = _ExportMap2['default'].get(node.source.value, context);
        if (imports == null) return;

        if (imports.errors.length) {
          imports.reportErrors(context, node);
        } else if (imports.get('default') === undefined) {
          context.report({
            node: defaultSpecifier,
            message: 'No default export found in imported module "' + String(node.source.value) + '".' });

        }
      }

      return {
        'ImportDeclaration': checkDefault.bind(null, 'ImportDefaultSpecifier'),
        'ExportNamedDeclaration': checkDefault.bind(null, 'ExportDefaultSpecifier') };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9kZWZhdWx0LmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwic2NoZW1hIiwiY3JlYXRlIiwiY29udGV4dCIsImNoZWNrRGVmYXVsdCIsInNwZWNpZmllclR5cGUiLCJub2RlIiwiZGVmYXVsdFNwZWNpZmllciIsInNwZWNpZmllcnMiLCJmaW5kIiwic3BlY2lmaWVyIiwiaW1wb3J0cyIsIkV4cG9ydHMiLCJnZXQiLCJzb3VyY2UiLCJ2YWx1ZSIsImVycm9ycyIsImxlbmd0aCIsInJlcG9ydEVycm9ycyIsInVuZGVmaW5lZCIsInJlcG9ydCIsIm1lc3NhZ2UiLCJiaW5kIl0sIm1hcHBpbmdzIjoiYUFBQSx5QztBQUNBLHFDOztBQUVBQSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSkMsVUFBTSxTQURGO0FBRUpDLFVBQU07QUFDSkMsZ0JBQVUsaUJBRE47QUFFSkMsbUJBQWEsNkRBRlQ7QUFHSkMsV0FBSywwQkFBUSxTQUFSLENBSEQsRUFGRjs7QUFPSkMsWUFBUSxFQVBKLEVBRFM7OztBQVdmQyxRQVhlLCtCQVdSQyxPQVhRLEVBV0M7O0FBRWQsZUFBU0MsWUFBVCxDQUFzQkMsYUFBdEIsRUFBcUNDLElBQXJDLEVBQTJDOztBQUV6QyxZQUFNQyxtQkFBbUJELEtBQUtFLFVBQUwsQ0FBZ0JDLElBQWhCO0FBQ3ZCLHFDQUFhQyxVQUFVZCxJQUFWLEtBQW1CUyxhQUFoQyxFQUR1QixDQUF6Qjs7O0FBSUEsWUFBSSxDQUFDRSxnQkFBTCxFQUF1QjtBQUN2QixZQUFNSSxVQUFVQyx1QkFBUUMsR0FBUixDQUFZUCxLQUFLUSxNQUFMLENBQVlDLEtBQXhCLEVBQStCWixPQUEvQixDQUFoQjtBQUNBLFlBQUlRLFdBQVcsSUFBZixFQUFxQjs7QUFFckIsWUFBSUEsUUFBUUssTUFBUixDQUFlQyxNQUFuQixFQUEyQjtBQUN6Qk4sa0JBQVFPLFlBQVIsQ0FBcUJmLE9BQXJCLEVBQThCRyxJQUE5QjtBQUNELFNBRkQsTUFFTyxJQUFJSyxRQUFRRSxHQUFSLENBQVksU0FBWixNQUEyQk0sU0FBL0IsRUFBMEM7QUFDL0NoQixrQkFBUWlCLE1BQVIsQ0FBZTtBQUNiZCxrQkFBTUMsZ0JBRE87QUFFYmMsNkVBQXdEZixLQUFLUSxNQUFMLENBQVlDLEtBQXBFLFFBRmEsRUFBZjs7QUFJRDtBQUNGOztBQUVELGFBQU87QUFDTCw2QkFBcUJYLGFBQWFrQixJQUFiLENBQWtCLElBQWxCLEVBQXdCLHdCQUF4QixDQURoQjtBQUVMLGtDQUEwQmxCLGFBQWFrQixJQUFiLENBQWtCLElBQWxCLEVBQXdCLHdCQUF4QixDQUZyQixFQUFQOztBQUlELEtBckNjLG1CQUFqQiIsImZpbGUiOiJkZWZhdWx0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV4cG9ydHMgZnJvbSAnLi4vRXhwb3J0TWFwJztcclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAncHJvYmxlbScsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnU3RhdGljIGFuYWx5c2lzJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdFbnN1cmUgYSBkZWZhdWx0IGV4cG9ydCBpcyBwcmVzZW50LCBnaXZlbiBhIGRlZmF1bHQgaW1wb3J0LicsXHJcbiAgICAgIHVybDogZG9jc1VybCgnZGVmYXVsdCcpLFxyXG4gICAgfSxcclxuICAgIHNjaGVtYTogW10sXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlKGNvbnRleHQpIHtcclxuXHJcbiAgICBmdW5jdGlvbiBjaGVja0RlZmF1bHQoc3BlY2lmaWVyVHlwZSwgbm9kZSkge1xyXG5cclxuICAgICAgY29uc3QgZGVmYXVsdFNwZWNpZmllciA9IG5vZGUuc3BlY2lmaWVycy5maW5kKFxyXG4gICAgICAgIHNwZWNpZmllciA9PiBzcGVjaWZpZXIudHlwZSA9PT0gc3BlY2lmaWVyVHlwZSxcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGlmICghZGVmYXVsdFNwZWNpZmllcikgcmV0dXJuO1xyXG4gICAgICBjb25zdCBpbXBvcnRzID0gRXhwb3J0cy5nZXQobm9kZS5zb3VyY2UudmFsdWUsIGNvbnRleHQpO1xyXG4gICAgICBpZiAoaW1wb3J0cyA9PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgICBpZiAoaW1wb3J0cy5lcnJvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgaW1wb3J0cy5yZXBvcnRFcnJvcnMoY29udGV4dCwgbm9kZSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoaW1wb3J0cy5nZXQoJ2RlZmF1bHQnKSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgbm9kZTogZGVmYXVsdFNwZWNpZmllcixcclxuICAgICAgICAgIG1lc3NhZ2U6IGBObyBkZWZhdWx0IGV4cG9ydCBmb3VuZCBpbiBpbXBvcnRlZCBtb2R1bGUgXCIke25vZGUuc291cmNlLnZhbHVlfVwiLmAsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAnSW1wb3J0RGVjbGFyYXRpb24nOiBjaGVja0RlZmF1bHQuYmluZChudWxsLCAnSW1wb3J0RGVmYXVsdFNwZWNpZmllcicpLFxyXG4gICAgICAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbic6IGNoZWNrRGVmYXVsdC5iaW5kKG51bGwsICdFeHBvcnREZWZhdWx0U3BlY2lmaWVyJyksXHJcbiAgICB9O1xyXG4gIH0sXHJcbn07XHJcbiJdfQ==