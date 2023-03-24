'use strict';




var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Module systems',
      description: 'Forbid AMD `require` and `define` calls.',
      url: (0, _docsUrl2['default'])('no-amd') },

    schema: [] },


  create: function () {function create(context) {
      return {
        'CallExpression': function () {function CallExpression(node) {
            if (context.getScope().type !== 'module') return;

            if (node.callee.type !== 'Identifier') return;
            if (node.callee.name !== 'require' &&
            node.callee.name !== 'define') return;

            // todo: capture define((require, module, exports) => {}) form?
            if (node.arguments.length !== 2) return;

            var modules = node.arguments[0];
            if (modules.type !== 'ArrayExpression') return;

            // todo: check second arg type? (identifier or callback)

            context.report(node, 'Expected imports instead of AMD ' + String(node.callee.name) + '().');
          }return CallExpression;}() };


    }return create;}() }; /**
                           * @fileoverview Rule to prefer imports to AMD
                           * @author Jamund Ferguson
                           */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1hbWQuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJ1cmwiLCJzY2hlbWEiLCJjcmVhdGUiLCJjb250ZXh0Iiwibm9kZSIsImdldFNjb3BlIiwiY2FsbGVlIiwibmFtZSIsImFyZ3VtZW50cyIsImxlbmd0aCIsIm1vZHVsZXMiLCJyZXBvcnQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBS0EscUM7O0FBRUE7QUFDQTtBQUNBOztBQUVBQSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSkMsVUFBTSxZQURGO0FBRUpDLFVBQU07QUFDSkMsZ0JBQVUsZ0JBRE47QUFFSkMsbUJBQWEsMENBRlQ7QUFHSkMsV0FBSywwQkFBUSxRQUFSLENBSEQsRUFGRjs7QUFPSkMsWUFBUSxFQVBKLEVBRFM7OztBQVdmQyxRQVhlLCtCQVdSQyxPQVhRLEVBV0M7QUFDZCxhQUFPO0FBQ0wsdUNBQWtCLHdCQUFVQyxJQUFWLEVBQWdCO0FBQ2hDLGdCQUFJRCxRQUFRRSxRQUFSLEdBQW1CVCxJQUFuQixLQUE0QixRQUFoQyxFQUEwQzs7QUFFMUMsZ0JBQUlRLEtBQUtFLE1BQUwsQ0FBWVYsSUFBWixLQUFxQixZQUF6QixFQUF1QztBQUN2QyxnQkFBSVEsS0FBS0UsTUFBTCxDQUFZQyxJQUFaLEtBQXFCLFNBQXJCO0FBQ0FILGlCQUFLRSxNQUFMLENBQVlDLElBQVosS0FBcUIsUUFEekIsRUFDbUM7O0FBRW5DO0FBQ0EsZ0JBQUlILEtBQUtJLFNBQUwsQ0FBZUMsTUFBZixLQUEwQixDQUE5QixFQUFpQzs7QUFFakMsZ0JBQU1DLFVBQVVOLEtBQUtJLFNBQUwsQ0FBZSxDQUFmLENBQWhCO0FBQ0EsZ0JBQUlFLFFBQVFkLElBQVIsS0FBaUIsaUJBQXJCLEVBQXdDOztBQUV4Qzs7QUFFQU8sb0JBQVFRLE1BQVIsQ0FBZVAsSUFBZiw4Q0FBd0RBLEtBQUtFLE1BQUwsQ0FBWUMsSUFBcEU7QUFDRCxXQWhCRCx5QkFESyxFQUFQOzs7QUFvQkQsS0FoQ2MsbUJBQWpCLEMsQ0FYQSIsImZpbGUiOiJuby1hbWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGZpbGVvdmVydmlldyBSdWxlIHRvIHByZWZlciBpbXBvcnRzIHRvIEFNRFxyXG4gKiBAYXV0aG9yIEphbXVuZCBGZXJndXNvblxyXG4gKi9cclxuXHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gUnVsZSBEZWZpbml0aW9uXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnTW9kdWxlIHN5c3RlbXMnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0ZvcmJpZCBBTUQgYHJlcXVpcmVgIGFuZCBgZGVmaW5lYCBjYWxscy4nLFxyXG4gICAgICB1cmw6IGRvY3NVcmwoJ25vLWFtZCcpLFxyXG4gICAgfSxcclxuICAgIHNjaGVtYTogW10sXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlKGNvbnRleHQpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICdDYWxsRXhwcmVzc2lvbic6IGZ1bmN0aW9uIChub2RlKSB7XHJcbiAgICAgICAgaWYgKGNvbnRleHQuZ2V0U2NvcGUoKS50eXBlICE9PSAnbW9kdWxlJykgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiAobm9kZS5jYWxsZWUudHlwZSAhPT0gJ0lkZW50aWZpZXInKSByZXR1cm47XHJcbiAgICAgICAgaWYgKG5vZGUuY2FsbGVlLm5hbWUgIT09ICdyZXF1aXJlJyAmJlxyXG4gICAgICAgICAgICBub2RlLmNhbGxlZS5uYW1lICE9PSAnZGVmaW5lJykgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyB0b2RvOiBjYXB0dXJlIGRlZmluZSgocmVxdWlyZSwgbW9kdWxlLCBleHBvcnRzKSA9PiB7fSkgZm9ybT9cclxuICAgICAgICBpZiAobm9kZS5hcmd1bWVudHMubGVuZ3RoICE9PSAyKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IG1vZHVsZXMgPSBub2RlLmFyZ3VtZW50c1swXTtcclxuICAgICAgICBpZiAobW9kdWxlcy50eXBlICE9PSAnQXJyYXlFeHByZXNzaW9uJykgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyB0b2RvOiBjaGVjayBzZWNvbmQgYXJnIHR5cGU/IChpZGVudGlmaWVyIG9yIGNhbGxiYWNrKVxyXG5cclxuICAgICAgICBjb250ZXh0LnJlcG9ydChub2RlLCBgRXhwZWN0ZWQgaW1wb3J0cyBpbnN0ZWFkIG9mIEFNRCAke25vZGUuY2FsbGVlLm5hbWV9KCkuYCk7XHJcbiAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICB9LFxyXG59O1xyXG4iXX0=