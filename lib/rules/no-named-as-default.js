'use strict';var _ExportMap = require('../ExportMap');var _ExportMap2 = _interopRequireDefault(_ExportMap);
var _importDeclaration = require('../importDeclaration');var _importDeclaration2 = _interopRequireDefault(_importDeclaration);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      category: 'Helpful warnings',
      description: 'Forbid use of exported name as identifier of default export.',
      url: (0, _docsUrl2['default'])('no-named-as-default') },

    schema: [] },


  create: function () {function create(context) {
      function checkDefault(nameKey, defaultSpecifier) {
        // #566: default is a valid specifier
        if (defaultSpecifier[nameKey].name === 'default') return;

        var declaration = (0, _importDeclaration2['default'])(context);

        var imports = _ExportMap2['default'].get(declaration.source.value, context);
        if (imports == null) return;

        if (imports.errors.length) {
          imports.reportErrors(context, declaration);
          return;
        }

        if (imports.has('default') &&
        imports.has(defaultSpecifier[nameKey].name)) {

          context.report(defaultSpecifier,
          'Using exported name \'' + defaultSpecifier[nameKey].name +
          '\' as identifier for default export.');

        }
      }
      return {
        'ImportDefaultSpecifier': checkDefault.bind(null, 'local'),
        'ExportDefaultSpecifier': checkDefault.bind(null, 'exported') };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1uYW1lZC1hcy1kZWZhdWx0LmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwic2NoZW1hIiwiY3JlYXRlIiwiY29udGV4dCIsImNoZWNrRGVmYXVsdCIsIm5hbWVLZXkiLCJkZWZhdWx0U3BlY2lmaWVyIiwibmFtZSIsImRlY2xhcmF0aW9uIiwiaW1wb3J0cyIsIkV4cG9ydHMiLCJnZXQiLCJzb3VyY2UiLCJ2YWx1ZSIsImVycm9ycyIsImxlbmd0aCIsInJlcG9ydEVycm9ycyIsImhhcyIsInJlcG9ydCIsImJpbmQiXSwibWFwcGluZ3MiOiJhQUFBLHlDO0FBQ0EseUQ7QUFDQSxxQzs7QUFFQUEsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0pDLFVBQU0sU0FERjtBQUVKQyxVQUFNO0FBQ0pDLGdCQUFVLGtCQUROO0FBRUpDLG1CQUFhLDhEQUZUO0FBR0pDLFdBQUssMEJBQVEscUJBQVIsQ0FIRCxFQUZGOztBQU9KQyxZQUFRLEVBUEosRUFEUzs7O0FBV2ZDLFFBWGUsK0JBV1JDLE9BWFEsRUFXQztBQUNkLGVBQVNDLFlBQVQsQ0FBc0JDLE9BQXRCLEVBQStCQyxnQkFBL0IsRUFBaUQ7QUFDL0M7QUFDQSxZQUFJQSxpQkFBaUJELE9BQWpCLEVBQTBCRSxJQUExQixLQUFtQyxTQUF2QyxFQUFrRDs7QUFFbEQsWUFBTUMsY0FBYyxvQ0FBa0JMLE9BQWxCLENBQXBCOztBQUVBLFlBQU1NLFVBQVVDLHVCQUFRQyxHQUFSLENBQVlILFlBQVlJLE1BQVosQ0FBbUJDLEtBQS9CLEVBQXNDVixPQUF0QyxDQUFoQjtBQUNBLFlBQUlNLFdBQVcsSUFBZixFQUFxQjs7QUFFckIsWUFBSUEsUUFBUUssTUFBUixDQUFlQyxNQUFuQixFQUEyQjtBQUN6Qk4sa0JBQVFPLFlBQVIsQ0FBcUJiLE9BQXJCLEVBQThCSyxXQUE5QjtBQUNBO0FBQ0Q7O0FBRUQsWUFBSUMsUUFBUVEsR0FBUixDQUFZLFNBQVo7QUFDQVIsZ0JBQVFRLEdBQVIsQ0FBWVgsaUJBQWlCRCxPQUFqQixFQUEwQkUsSUFBdEMsQ0FESixFQUNpRDs7QUFFL0NKLGtCQUFRZSxNQUFSLENBQWVaLGdCQUFmO0FBQ0UscUNBQTJCQSxpQkFBaUJELE9BQWpCLEVBQTBCRSxJQUFyRDtBQUNBLGdEQUZGOztBQUlEO0FBQ0Y7QUFDRCxhQUFPO0FBQ0wsa0NBQTBCSCxhQUFhZSxJQUFiLENBQWtCLElBQWxCLEVBQXdCLE9BQXhCLENBRHJCO0FBRUwsa0NBQTBCZixhQUFhZSxJQUFiLENBQWtCLElBQWxCLEVBQXdCLFVBQXhCLENBRnJCLEVBQVA7O0FBSUQsS0F2Q2MsbUJBQWpCIiwiZmlsZSI6Im5vLW5hbWVkLWFzLWRlZmF1bHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXhwb3J0cyBmcm9tICcuLi9FeHBvcnRNYXAnO1xyXG5pbXBvcnQgaW1wb3J0RGVjbGFyYXRpb24gZnJvbSAnLi4vaW1wb3J0RGVjbGFyYXRpb24nO1xyXG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdwcm9ibGVtJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgY2F0ZWdvcnk6ICdIZWxwZnVsIHdhcm5pbmdzJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdGb3JiaWQgdXNlIG9mIGV4cG9ydGVkIG5hbWUgYXMgaWRlbnRpZmllciBvZiBkZWZhdWx0IGV4cG9ydC4nLFxyXG4gICAgICB1cmw6IGRvY3NVcmwoJ25vLW5hbWVkLWFzLWRlZmF1bHQnKSxcclxuICAgIH0sXHJcbiAgICBzY2hlbWE6IFtdLFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZShjb250ZXh0KSB7XHJcbiAgICBmdW5jdGlvbiBjaGVja0RlZmF1bHQobmFtZUtleSwgZGVmYXVsdFNwZWNpZmllcikge1xyXG4gICAgICAvLyAjNTY2OiBkZWZhdWx0IGlzIGEgdmFsaWQgc3BlY2lmaWVyXHJcbiAgICAgIGlmIChkZWZhdWx0U3BlY2lmaWVyW25hbWVLZXldLm5hbWUgPT09ICdkZWZhdWx0JykgcmV0dXJuO1xyXG5cclxuICAgICAgY29uc3QgZGVjbGFyYXRpb24gPSBpbXBvcnREZWNsYXJhdGlvbihjb250ZXh0KTtcclxuXHJcbiAgICAgIGNvbnN0IGltcG9ydHMgPSBFeHBvcnRzLmdldChkZWNsYXJhdGlvbi5zb3VyY2UudmFsdWUsIGNvbnRleHQpO1xyXG4gICAgICBpZiAoaW1wb3J0cyA9PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgICBpZiAoaW1wb3J0cy5lcnJvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgaW1wb3J0cy5yZXBvcnRFcnJvcnMoY29udGV4dCwgZGVjbGFyYXRpb24pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGltcG9ydHMuaGFzKCdkZWZhdWx0JykgJiZcclxuICAgICAgICAgIGltcG9ydHMuaGFzKGRlZmF1bHRTcGVjaWZpZXJbbmFtZUtleV0ubmFtZSkpIHtcclxuXHJcbiAgICAgICAgY29udGV4dC5yZXBvcnQoZGVmYXVsdFNwZWNpZmllcixcclxuICAgICAgICAgICdVc2luZyBleHBvcnRlZCBuYW1lIFxcJycgKyBkZWZhdWx0U3BlY2lmaWVyW25hbWVLZXldLm5hbWUgK1xyXG4gICAgICAgICAgJ1xcJyBhcyBpZGVudGlmaWVyIGZvciBkZWZhdWx0IGV4cG9ydC4nKTtcclxuXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB7XHJcbiAgICAgICdJbXBvcnREZWZhdWx0U3BlY2lmaWVyJzogY2hlY2tEZWZhdWx0LmJpbmQobnVsbCwgJ2xvY2FsJyksXHJcbiAgICAgICdFeHBvcnREZWZhdWx0U3BlY2lmaWVyJzogY2hlY2tEZWZhdWx0LmJpbmQobnVsbCwgJ2V4cG9ydGVkJyksXHJcbiAgICB9O1xyXG4gIH0sXHJcbn07XHJcbiJdfQ==