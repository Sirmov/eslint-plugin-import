'use strict';




var _resolve = require('eslint-module-utils/resolve');var _resolve2 = _interopRequireDefault(_resolve);
var _ModuleCache = require('eslint-module-utils/ModuleCache');var _ModuleCache2 = _interopRequireDefault(_ModuleCache);
var _moduleVisitor = require('eslint-module-utils/moduleVisitor');var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };} /**
                                                                                                                                                                                       * @fileOverview Ensures that an imported path exists, given resolution rules.
                                                                                                                                                                                       * @author Ben Mosher
                                                                                                                                                                                       */module.exports = { meta: {
    type: 'problem',
    docs: {
      category: 'Static analysis',
      description: 'Ensure imports point to a file/module that can be resolved.',
      url: (0, _docsUrl2['default'])('no-unresolved') },


    schema: [
    (0, _moduleVisitor.makeOptionsSchema)({
      caseSensitive: { type: 'boolean', 'default': true },
      caseSensitiveStrict: { type: 'boolean', 'default': false } })] },




  create: function () {function create(context) {
      var options = context.options[0] || {};

      function checkSourceValue(source, node) {
        // ignore type-only imports and exports
        if (node.importKind === 'type' || node.exportKind === 'type') {
          return;
        }

        var caseSensitive = !_resolve.CASE_SENSITIVE_FS && options.caseSensitive !== false;
        var caseSensitiveStrict = !_resolve.CASE_SENSITIVE_FS && options.caseSensitiveStrict;

        var resolvedPath = (0, _resolve2['default'])(source.value, context);

        if (resolvedPath === undefined) {
          context.report(
          source, 'Unable to resolve path to module \'' + String(
          source.value) + '\'.');

        } else if (caseSensitive || caseSensitiveStrict) {
          var cacheSettings = _ModuleCache2['default'].getSettings(context.settings);
          if (!(0, _resolve.fileExistsWithCaseSync)(resolvedPath, cacheSettings, caseSensitiveStrict)) {
            context.report(
            source, 'Casing of ' + String(
            source.value) + ' does not match the underlying filesystem.');

          }
        }
      }

      return (0, _moduleVisitor2['default'])(checkSourceValue, options);
    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby11bnJlc29sdmVkLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwic2NoZW1hIiwiY2FzZVNlbnNpdGl2ZSIsImNhc2VTZW5zaXRpdmVTdHJpY3QiLCJjcmVhdGUiLCJjb250ZXh0Iiwib3B0aW9ucyIsImNoZWNrU291cmNlVmFsdWUiLCJzb3VyY2UiLCJub2RlIiwiaW1wb3J0S2luZCIsImV4cG9ydEtpbmQiLCJDQVNFX1NFTlNJVElWRV9GUyIsInJlc29sdmVkUGF0aCIsInZhbHVlIiwidW5kZWZpbmVkIiwicmVwb3J0IiwiY2FjaGVTZXR0aW5ncyIsIk1vZHVsZUNhY2hlIiwiZ2V0U2V0dGluZ3MiLCJzZXR0aW5ncyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFLQSxzRDtBQUNBLDhEO0FBQ0Esa0U7QUFDQSxxQyxpSkFSQTs7O3lMQVVBQSxPQUFPQyxPQUFQLEdBQWlCLEVBQ2ZDLE1BQU07QUFDSkMsVUFBTSxTQURGO0FBRUpDLFVBQU07QUFDSkMsZ0JBQVUsaUJBRE47QUFFSkMsbUJBQWEsNkRBRlQ7QUFHSkMsV0FBSywwQkFBUSxlQUFSLENBSEQsRUFGRjs7O0FBUUpDLFlBQVE7QUFDTiwwQ0FBa0I7QUFDaEJDLHFCQUFlLEVBQUVOLE1BQU0sU0FBUixFQUFtQixXQUFTLElBQTVCLEVBREM7QUFFaEJPLDJCQUFxQixFQUFFUCxNQUFNLFNBQVIsRUFBbUIsV0FBUyxLQUE1QixFQUZMLEVBQWxCLENBRE0sQ0FSSixFQURTOzs7OztBQWlCZlEsUUFqQmUsK0JBaUJSQyxPQWpCUSxFQWlCQztBQUNkLFVBQU1DLFVBQVVELFFBQVFDLE9BQVIsQ0FBZ0IsQ0FBaEIsS0FBc0IsRUFBdEM7O0FBRUEsZUFBU0MsZ0JBQVQsQ0FBMEJDLE1BQTFCLEVBQWtDQyxJQUFsQyxFQUF3QztBQUN0QztBQUNBLFlBQUlBLEtBQUtDLFVBQUwsS0FBb0IsTUFBcEIsSUFBOEJELEtBQUtFLFVBQUwsS0FBb0IsTUFBdEQsRUFBOEQ7QUFDNUQ7QUFDRDs7QUFFRCxZQUFNVCxnQkFBZ0IsQ0FBQ1UsMEJBQUQsSUFBc0JOLFFBQVFKLGFBQVIsS0FBMEIsS0FBdEU7QUFDQSxZQUFNQyxzQkFBc0IsQ0FBQ1MsMEJBQUQsSUFBc0JOLFFBQVFILG1CQUExRDs7QUFFQSxZQUFNVSxlQUFlLDBCQUFRTCxPQUFPTSxLQUFmLEVBQXNCVCxPQUF0QixDQUFyQjs7QUFFQSxZQUFJUSxpQkFBaUJFLFNBQXJCLEVBQWdDO0FBQzlCVixrQkFBUVcsTUFBUjtBQUNFUixnQkFERjtBQUV1Q0EsaUJBQU9NLEtBRjlDOztBQUlELFNBTEQsTUFLTyxJQUFJWixpQkFBaUJDLG1CQUFyQixFQUEwQztBQUMvQyxjQUFNYyxnQkFBZ0JDLHlCQUFZQyxXQUFaLENBQXdCZCxRQUFRZSxRQUFoQyxDQUF0QjtBQUNBLGNBQUksQ0FBQyxxQ0FBdUJQLFlBQXZCLEVBQXFDSSxhQUFyQyxFQUFvRGQsbUJBQXBELENBQUwsRUFBK0U7QUFDN0VFLG9CQUFRVyxNQUFSO0FBQ0VSLGtCQURGO0FBRWVBLG1CQUFPTSxLQUZ0Qjs7QUFJRDtBQUNGO0FBQ0Y7O0FBRUQsYUFBTyxnQ0FBY1AsZ0JBQWQsRUFBZ0NELE9BQWhDLENBQVA7QUFDRCxLQWhEYyxtQkFBakIiLCJmaWxlIjoibm8tdW5yZXNvbHZlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAZmlsZU92ZXJ2aWV3IEVuc3VyZXMgdGhhdCBhbiBpbXBvcnRlZCBwYXRoIGV4aXN0cywgZ2l2ZW4gcmVzb2x1dGlvbiBydWxlcy5cclxuICogQGF1dGhvciBCZW4gTW9zaGVyXHJcbiAqL1xyXG5cclxuaW1wb3J0IHJlc29sdmUsIHsgQ0FTRV9TRU5TSVRJVkVfRlMsIGZpbGVFeGlzdHNXaXRoQ2FzZVN5bmMgfSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL3Jlc29sdmUnO1xyXG5pbXBvcnQgTW9kdWxlQ2FjaGUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9Nb2R1bGVDYWNoZSc7XHJcbmltcG9ydCBtb2R1bGVWaXNpdG9yLCB7IG1ha2VPcHRpb25zU2NoZW1hIH0gZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9tb2R1bGVWaXNpdG9yJztcclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAncHJvYmxlbScsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnU3RhdGljIGFuYWx5c2lzJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdFbnN1cmUgaW1wb3J0cyBwb2ludCB0byBhIGZpbGUvbW9kdWxlIHRoYXQgY2FuIGJlIHJlc29sdmVkLicsXHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8tdW5yZXNvbHZlZCcpLFxyXG4gICAgfSxcclxuXHJcbiAgICBzY2hlbWE6IFtcclxuICAgICAgbWFrZU9wdGlvbnNTY2hlbWEoe1xyXG4gICAgICAgIGNhc2VTZW5zaXRpdmU6IHsgdHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OiB0cnVlIH0sXHJcbiAgICAgICAgY2FzZVNlbnNpdGl2ZVN0cmljdDogeyB0eXBlOiAnYm9vbGVhbicsIGRlZmF1bHQ6IGZhbHNlIH0sXHJcbiAgICAgIH0pLFxyXG4gICAgXSxcclxuICB9LFxyXG5cclxuICBjcmVhdGUoY29udGV4dCkge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IGNvbnRleHQub3B0aW9uc1swXSB8fCB7fTtcclxuXHJcbiAgICBmdW5jdGlvbiBjaGVja1NvdXJjZVZhbHVlKHNvdXJjZSwgbm9kZSkge1xyXG4gICAgICAvLyBpZ25vcmUgdHlwZS1vbmx5IGltcG9ydHMgYW5kIGV4cG9ydHNcclxuICAgICAgaWYgKG5vZGUuaW1wb3J0S2luZCA9PT0gJ3R5cGUnIHx8IG5vZGUuZXhwb3J0S2luZCA9PT0gJ3R5cGUnKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBjYXNlU2Vuc2l0aXZlID0gIUNBU0VfU0VOU0lUSVZFX0ZTICYmIG9wdGlvbnMuY2FzZVNlbnNpdGl2ZSAhPT0gZmFsc2U7XHJcbiAgICAgIGNvbnN0IGNhc2VTZW5zaXRpdmVTdHJpY3QgPSAhQ0FTRV9TRU5TSVRJVkVfRlMgJiYgb3B0aW9ucy5jYXNlU2Vuc2l0aXZlU3RyaWN0O1xyXG5cclxuICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gcmVzb2x2ZShzb3VyY2UudmFsdWUsIGNvbnRleHQpO1xyXG5cclxuICAgICAgaWYgKHJlc29sdmVkUGF0aCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY29udGV4dC5yZXBvcnQoXHJcbiAgICAgICAgICBzb3VyY2UsXHJcbiAgICAgICAgICBgVW5hYmxlIHRvIHJlc29sdmUgcGF0aCB0byBtb2R1bGUgJyR7c291cmNlLnZhbHVlfScuYCxcclxuICAgICAgICApO1xyXG4gICAgICB9IGVsc2UgaWYgKGNhc2VTZW5zaXRpdmUgfHwgY2FzZVNlbnNpdGl2ZVN0cmljdCkge1xyXG4gICAgICAgIGNvbnN0IGNhY2hlU2V0dGluZ3MgPSBNb2R1bGVDYWNoZS5nZXRTZXR0aW5ncyhjb250ZXh0LnNldHRpbmdzKTtcclxuICAgICAgICBpZiAoIWZpbGVFeGlzdHNXaXRoQ2FzZVN5bmMocmVzb2x2ZWRQYXRoLCBjYWNoZVNldHRpbmdzLCBjYXNlU2Vuc2l0aXZlU3RyaWN0KSkge1xyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoXHJcbiAgICAgICAgICAgIHNvdXJjZSxcclxuICAgICAgICAgICAgYENhc2luZyBvZiAke3NvdXJjZS52YWx1ZX0gZG9lcyBub3QgbWF0Y2ggdGhlIHVuZGVybHlpbmcgZmlsZXN5c3RlbS5gLFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbW9kdWxlVmlzaXRvcihjaGVja1NvdXJjZVZhbHVlLCBvcHRpb25zKTtcclxuICB9LFxyXG59O1xyXG4iXX0=