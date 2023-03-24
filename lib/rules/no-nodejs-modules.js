'use strict';var _importType = require('../core/importType');var _importType2 = _interopRequireDefault(_importType);
var _moduleVisitor = require('eslint-module-utils/moduleVisitor');var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

function reportIfMissing(context, node, allowed, name) {
  if (allowed.indexOf(name) === -1 && (0, _importType2['default'])(name, context) === 'builtin') {
    context.report(node, 'Do not import Node.js builtin module "' + name + '"');
  }
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Module systems',
      description: 'Forbid Node.js builtin modules.',
      url: (0, _docsUrl2['default'])('no-nodejs-modules') },

    schema: [
    {
      type: 'object',
      properties: {
        allow: {
          type: 'array',
          uniqueItems: true,
          items: {
            type: 'string' } } },



      additionalProperties: false }] },




  create: function () {function create(context) {
      var options = context.options[0] || {};
      var allowed = options.allow || [];

      return (0, _moduleVisitor2['default'])(function (source, node) {
        reportIfMissing(context, node, allowed, source.value);
      }, { commonjs: true });
    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1ub2RlanMtbW9kdWxlcy5qcyJdLCJuYW1lcyI6WyJyZXBvcnRJZk1pc3NpbmciLCJjb250ZXh0Iiwibm9kZSIsImFsbG93ZWQiLCJuYW1lIiwiaW5kZXhPZiIsInJlcG9ydCIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwic2NoZW1hIiwicHJvcGVydGllcyIsImFsbG93IiwidW5pcXVlSXRlbXMiLCJpdGVtcyIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwiY3JlYXRlIiwib3B0aW9ucyIsInNvdXJjZSIsInZhbHVlIiwiY29tbW9uanMiXSwibWFwcGluZ3MiOiJhQUFBLGdEO0FBQ0Esa0U7QUFDQSxxQzs7QUFFQSxTQUFTQSxlQUFULENBQXlCQyxPQUF6QixFQUFrQ0MsSUFBbEMsRUFBd0NDLE9BQXhDLEVBQWlEQyxJQUFqRCxFQUF1RDtBQUNyRCxNQUFJRCxRQUFRRSxPQUFSLENBQWdCRCxJQUFoQixNQUEwQixDQUFDLENBQTNCLElBQWdDLDZCQUFXQSxJQUFYLEVBQWlCSCxPQUFqQixNQUE4QixTQUFsRSxFQUE2RTtBQUMzRUEsWUFBUUssTUFBUixDQUFlSixJQUFmLEVBQXFCLDJDQUEyQ0UsSUFBM0MsR0FBa0QsR0FBdkU7QUFDRDtBQUNGOztBQUVERyxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSkMsVUFBTSxZQURGO0FBRUpDLFVBQU07QUFDSkMsZ0JBQVUsZ0JBRE47QUFFSkMsbUJBQWEsaUNBRlQ7QUFHSkMsV0FBSywwQkFBUSxtQkFBUixDQUhELEVBRkY7O0FBT0pDLFlBQVE7QUFDTjtBQUNFTCxZQUFNLFFBRFI7QUFFRU0sa0JBQVk7QUFDVkMsZUFBTztBQUNMUCxnQkFBTSxPQUREO0FBRUxRLHVCQUFhLElBRlI7QUFHTEMsaUJBQU87QUFDTFQsa0JBQU0sUUFERCxFQUhGLEVBREcsRUFGZDs7OztBQVdFVSw0QkFBc0IsS0FYeEIsRUFETSxDQVBKLEVBRFM7Ozs7O0FBeUJmQyxRQXpCZSwrQkF5QlJwQixPQXpCUSxFQXlCQztBQUNkLFVBQU1xQixVQUFVckIsUUFBUXFCLE9BQVIsQ0FBZ0IsQ0FBaEIsS0FBc0IsRUFBdEM7QUFDQSxVQUFNbkIsVUFBVW1CLFFBQVFMLEtBQVIsSUFBaUIsRUFBakM7O0FBRUEsYUFBTyxnQ0FBYyxVQUFDTSxNQUFELEVBQVNyQixJQUFULEVBQWtCO0FBQ3JDRix3QkFBZ0JDLE9BQWhCLEVBQXlCQyxJQUF6QixFQUErQkMsT0FBL0IsRUFBd0NvQixPQUFPQyxLQUEvQztBQUNELE9BRk0sRUFFSixFQUFFQyxVQUFVLElBQVosRUFGSSxDQUFQO0FBR0QsS0FoQ2MsbUJBQWpCIiwiZmlsZSI6Im5vLW5vZGVqcy1tb2R1bGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGltcG9ydFR5cGUgZnJvbSAnLi4vY29yZS9pbXBvcnRUeXBlJztcclxuaW1wb3J0IG1vZHVsZVZpc2l0b3IgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9tb2R1bGVWaXNpdG9yJztcclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XHJcblxyXG5mdW5jdGlvbiByZXBvcnRJZk1pc3NpbmcoY29udGV4dCwgbm9kZSwgYWxsb3dlZCwgbmFtZSkge1xyXG4gIGlmIChhbGxvd2VkLmluZGV4T2YobmFtZSkgPT09IC0xICYmIGltcG9ydFR5cGUobmFtZSwgY29udGV4dCkgPT09ICdidWlsdGluJykge1xyXG4gICAgY29udGV4dC5yZXBvcnQobm9kZSwgJ0RvIG5vdCBpbXBvcnQgTm9kZS5qcyBidWlsdGluIG1vZHVsZSBcIicgKyBuYW1lICsgJ1wiJyk7XHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnTW9kdWxlIHN5c3RlbXMnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0ZvcmJpZCBOb2RlLmpzIGJ1aWx0aW4gbW9kdWxlcy4nLFxyXG4gICAgICB1cmw6IGRvY3NVcmwoJ25vLW5vZGVqcy1tb2R1bGVzJyksXHJcbiAgICB9LFxyXG4gICAgc2NoZW1hOiBbXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICBhbGxvdzoge1xyXG4gICAgICAgICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICAgICAgICB1bmlxdWVJdGVtczogdHJ1ZSxcclxuICAgICAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZShjb250ZXh0KSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0gY29udGV4dC5vcHRpb25zWzBdIHx8IHt9O1xyXG4gICAgY29uc3QgYWxsb3dlZCA9IG9wdGlvbnMuYWxsb3cgfHwgW107XHJcblxyXG4gICAgcmV0dXJuIG1vZHVsZVZpc2l0b3IoKHNvdXJjZSwgbm9kZSkgPT4ge1xyXG4gICAgICByZXBvcnRJZk1pc3NpbmcoY29udGV4dCwgbm9kZSwgYWxsb3dlZCwgc291cmNlLnZhbHVlKTtcclxuICAgIH0sIHsgY29tbW9uanM6IHRydWUgfSk7XHJcbiAgfSxcclxufTtcclxuIl19