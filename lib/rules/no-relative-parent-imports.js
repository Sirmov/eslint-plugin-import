'use strict';var _moduleVisitor = require('eslint-module-utils/moduleVisitor');var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);
var _path = require('path');
var _resolve = require('eslint-module-utils/resolve');var _resolve2 = _interopRequireDefault(_resolve);

var _importType = require('../core/importType');var _importType2 = _interopRequireDefault(_importType);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Static analysis',
      description: 'Forbid importing modules from parent directories.',
      url: (0, _docsUrl2['default'])('no-relative-parent-imports') },

    schema: [(0, _moduleVisitor.makeOptionsSchema)()] },


  create: function () {function noRelativePackages(context) {
      var myPath = context.getPhysicalFilename ? context.getPhysicalFilename() : context.getFilename();
      if (myPath === '<text>') return {}; // can't check a non-file

      function checkSourceValue(sourceNode) {
        var depPath = sourceNode.value;

        if ((0, _importType2['default'])(depPath, context) === 'external') {// ignore packages
          return;
        }

        var absDepPath = (0, _resolve2['default'])(depPath, context);

        if (!absDepPath) {// unable to resolve path
          return;
        }

        var relDepPath = (0, _path.relative)((0, _path.dirname)(myPath), absDepPath);

        if ((0, _importType2['default'])(relDepPath, context) === 'parent') {
          context.report({
            node: sourceNode,
            message: 'Relative imports from parent directories are not allowed. ' + 'Please either pass what you\'re importing through at runtime ' + ('(dependency injection), move `' + String(

            (0, _path.basename)(myPath)) + '` to same ') + ('directory as `' + String(
            depPath) + '` or consider making `' + String(depPath) + '` a package.') });

        }
      }

      return (0, _moduleVisitor2['default'])(checkSourceValue, context.options[0]);
    }return noRelativePackages;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1yZWxhdGl2ZS1wYXJlbnQtaW1wb3J0cy5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwiY2F0ZWdvcnkiLCJkZXNjcmlwdGlvbiIsInVybCIsInNjaGVtYSIsImNyZWF0ZSIsIm5vUmVsYXRpdmVQYWNrYWdlcyIsImNvbnRleHQiLCJteVBhdGgiLCJnZXRQaHlzaWNhbEZpbGVuYW1lIiwiZ2V0RmlsZW5hbWUiLCJjaGVja1NvdXJjZVZhbHVlIiwic291cmNlTm9kZSIsImRlcFBhdGgiLCJ2YWx1ZSIsImFic0RlcFBhdGgiLCJyZWxEZXBQYXRoIiwicmVwb3J0Iiwibm9kZSIsIm1lc3NhZ2UiLCJvcHRpb25zIl0sIm1hcHBpbmdzIjoiYUFBQSxrRTtBQUNBLHFDO0FBQ0E7QUFDQSxzRDs7QUFFQSxnRDs7QUFFQUEsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0pDLFVBQU0sWUFERjtBQUVKQyxVQUFNO0FBQ0pDLGdCQUFVLGlCQUROO0FBRUpDLG1CQUFhLG1EQUZUO0FBR0pDLFdBQUssMEJBQVEsNEJBQVIsQ0FIRCxFQUZGOztBQU9KQyxZQUFRLENBQUMsdUNBQUQsQ0FQSixFQURTOzs7QUFXZkMsdUJBQVEsU0FBU0Msa0JBQVQsQ0FBNEJDLE9BQTVCLEVBQXFDO0FBQzNDLFVBQU1DLFNBQVNELFFBQVFFLG1CQUFSLEdBQThCRixRQUFRRSxtQkFBUixFQUE5QixHQUE4REYsUUFBUUcsV0FBUixFQUE3RTtBQUNBLFVBQUlGLFdBQVcsUUFBZixFQUF5QixPQUFPLEVBQVAsQ0FGa0IsQ0FFUDs7QUFFcEMsZUFBU0csZ0JBQVQsQ0FBMEJDLFVBQTFCLEVBQXNDO0FBQ3BDLFlBQU1DLFVBQVVELFdBQVdFLEtBQTNCOztBQUVBLFlBQUksNkJBQVdELE9BQVgsRUFBb0JOLE9BQXBCLE1BQWlDLFVBQXJDLEVBQWlELENBQUU7QUFDakQ7QUFDRDs7QUFFRCxZQUFNUSxhQUFhLDBCQUFRRixPQUFSLEVBQWlCTixPQUFqQixDQUFuQjs7QUFFQSxZQUFJLENBQUNRLFVBQUwsRUFBaUIsQ0FBRTtBQUNqQjtBQUNEOztBQUVELFlBQU1DLGFBQWEsb0JBQVMsbUJBQVFSLE1BQVIsQ0FBVCxFQUEwQk8sVUFBMUIsQ0FBbkI7O0FBRUEsWUFBSSw2QkFBV0MsVUFBWCxFQUF1QlQsT0FBdkIsTUFBb0MsUUFBeEMsRUFBa0Q7QUFDaERBLGtCQUFRVSxNQUFSLENBQWU7QUFDYkMsa0JBQU1OLFVBRE87QUFFYk8scUJBQVM7O0FBRTJCLGdDQUFTWCxNQUFULENBRjNCO0FBR1dLLG1CQUhYLHNDQUc2Q0EsT0FIN0MsbUJBRkksRUFBZjs7QUFPRDtBQUNGOztBQUVELGFBQU8sZ0NBQWNGLGdCQUFkLEVBQWdDSixRQUFRYSxPQUFSLENBQWdCLENBQWhCLENBQWhDLENBQVA7QUFDRCxLQS9CRCxPQUFpQmQsa0JBQWpCLElBWGUsRUFBakIiLCJmaWxlIjoibm8tcmVsYXRpdmUtcGFyZW50LWltcG9ydHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbW9kdWxlVmlzaXRvciwgeyBtYWtlT3B0aW9uc1NjaGVtYSB9IGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvbW9kdWxlVmlzaXRvcic7XHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnO1xyXG5pbXBvcnQgeyBiYXNlbmFtZSwgZGlybmFtZSwgcmVsYXRpdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHJlc29sdmUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJztcclxuXHJcbmltcG9ydCBpbXBvcnRUeXBlIGZyb20gJy4uL2NvcmUvaW1wb3J0VHlwZSc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnU3RhdGljIGFuYWx5c2lzJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdGb3JiaWQgaW1wb3J0aW5nIG1vZHVsZXMgZnJvbSBwYXJlbnQgZGlyZWN0b3JpZXMuJyxcclxuICAgICAgdXJsOiBkb2NzVXJsKCduby1yZWxhdGl2ZS1wYXJlbnQtaW1wb3J0cycpLFxyXG4gICAgfSxcclxuICAgIHNjaGVtYTogW21ha2VPcHRpb25zU2NoZW1hKCldLFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZTogZnVuY3Rpb24gbm9SZWxhdGl2ZVBhY2thZ2VzKGNvbnRleHQpIHtcclxuICAgIGNvbnN0IG15UGF0aCA9IGNvbnRleHQuZ2V0UGh5c2ljYWxGaWxlbmFtZSA/IGNvbnRleHQuZ2V0UGh5c2ljYWxGaWxlbmFtZSgpIDogY29udGV4dC5nZXRGaWxlbmFtZSgpO1xyXG4gICAgaWYgKG15UGF0aCA9PT0gJzx0ZXh0PicpIHJldHVybiB7fTsgLy8gY2FuJ3QgY2hlY2sgYSBub24tZmlsZVxyXG5cclxuICAgIGZ1bmN0aW9uIGNoZWNrU291cmNlVmFsdWUoc291cmNlTm9kZSkge1xyXG4gICAgICBjb25zdCBkZXBQYXRoID0gc291cmNlTm9kZS52YWx1ZTtcclxuXHJcbiAgICAgIGlmIChpbXBvcnRUeXBlKGRlcFBhdGgsIGNvbnRleHQpID09PSAnZXh0ZXJuYWwnKSB7IC8vIGlnbm9yZSBwYWNrYWdlc1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYWJzRGVwUGF0aCA9IHJlc29sdmUoZGVwUGF0aCwgY29udGV4dCk7XHJcblxyXG4gICAgICBpZiAoIWFic0RlcFBhdGgpIHsgLy8gdW5hYmxlIHRvIHJlc29sdmUgcGF0aFxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgcmVsRGVwUGF0aCA9IHJlbGF0aXZlKGRpcm5hbWUobXlQYXRoKSwgYWJzRGVwUGF0aCk7XHJcblxyXG4gICAgICBpZiAoaW1wb3J0VHlwZShyZWxEZXBQYXRoLCBjb250ZXh0KSA9PT0gJ3BhcmVudCcpIHtcclxuICAgICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgICBub2RlOiBzb3VyY2VOb2RlLFxyXG4gICAgICAgICAgbWVzc2FnZTogJ1JlbGF0aXZlIGltcG9ydHMgZnJvbSBwYXJlbnQgZGlyZWN0b3JpZXMgYXJlIG5vdCBhbGxvd2VkLiAnICtcclxuICAgICAgICAgICAgYFBsZWFzZSBlaXRoZXIgcGFzcyB3aGF0IHlvdSdyZSBpbXBvcnRpbmcgdGhyb3VnaCBhdCBydW50aW1lIGAgK1xyXG4gICAgICAgICAgICBgKGRlcGVuZGVuY3kgaW5qZWN0aW9uKSwgbW92ZSBcXGAke2Jhc2VuYW1lKG15UGF0aCl9XFxgIHRvIHNhbWUgYCArXHJcbiAgICAgICAgICAgIGBkaXJlY3RvcnkgYXMgXFxgJHtkZXBQYXRofVxcYCBvciBjb25zaWRlciBtYWtpbmcgXFxgJHtkZXBQYXRofVxcYCBhIHBhY2thZ2UuYCxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBtb2R1bGVWaXNpdG9yKGNoZWNrU291cmNlVmFsdWUsIGNvbnRleHQub3B0aW9uc1swXSk7XHJcbiAgfSxcclxufTtcclxuIl19