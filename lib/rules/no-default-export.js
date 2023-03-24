'use strict';var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Style guide',
      description: 'Forbid default exports.',
      url: (0, _docsUrl2['default'])('no-default-export') },

    schema: [] },


  create: function () {function create(context) {
      // ignore non-modules
      if (context.parserOptions.sourceType !== 'module') {
        return {};
      }

      var preferNamed = 'Prefer named exports.';
      var noAliasDefault = function () {function noAliasDefault(_ref) {var local = _ref.local;return 'Do not alias `' + String(local.name) + '` as `default`. Just export `' + String(local.name) + '` itself instead.';}return noAliasDefault;}();

      return {
        ExportDefaultDeclaration: function () {function ExportDefaultDeclaration(node) {var _ref2 =
            context.getSourceCode().getFirstTokens(node)[1] || {},loc = _ref2.loc;
            context.report({ node: node, message: preferNamed, loc: loc });
          }return ExportDefaultDeclaration;}(),

        ExportNamedDeclaration: function () {function ExportNamedDeclaration(node) {
            node.specifiers.filter(function (specifier) {return (specifier.exported.name || specifier.exported.value) === 'default';}).forEach(function (specifier) {var _ref3 =
              context.getSourceCode().getFirstTokens(node)[1] || {},loc = _ref3.loc;
              if (specifier.type === 'ExportDefaultSpecifier') {
                context.report({ node: node, message: preferNamed, loc: loc });
              } else if (specifier.type === 'ExportSpecifier') {
                context.report({ node: node, message: noAliasDefault(specifier), loc: loc });
              }
            });
          }return ExportNamedDeclaration;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1kZWZhdWx0LWV4cG9ydC5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwiY2F0ZWdvcnkiLCJkZXNjcmlwdGlvbiIsInVybCIsInNjaGVtYSIsImNyZWF0ZSIsImNvbnRleHQiLCJwYXJzZXJPcHRpb25zIiwic291cmNlVHlwZSIsInByZWZlck5hbWVkIiwibm9BbGlhc0RlZmF1bHQiLCJsb2NhbCIsIm5hbWUiLCJFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24iLCJub2RlIiwiZ2V0U291cmNlQ29kZSIsImdldEZpcnN0VG9rZW5zIiwibG9jIiwicmVwb3J0IiwibWVzc2FnZSIsIkV4cG9ydE5hbWVkRGVjbGFyYXRpb24iLCJzcGVjaWZpZXJzIiwiZmlsdGVyIiwic3BlY2lmaWVyIiwiZXhwb3J0ZWQiLCJ2YWx1ZSIsImZvckVhY2giXSwibWFwcGluZ3MiOiJhQUFBLHFDOztBQUVBQSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSkMsVUFBTSxZQURGO0FBRUpDLFVBQU07QUFDSkMsZ0JBQVUsYUFETjtBQUVKQyxtQkFBYSx5QkFGVDtBQUdKQyxXQUFLLDBCQUFRLG1CQUFSLENBSEQsRUFGRjs7QUFPSkMsWUFBUSxFQVBKLEVBRFM7OztBQVdmQyxRQVhlLCtCQVdSQyxPQVhRLEVBV0M7QUFDZDtBQUNBLFVBQUlBLFFBQVFDLGFBQVIsQ0FBc0JDLFVBQXRCLEtBQXFDLFFBQXpDLEVBQW1EO0FBQ2pELGVBQU8sRUFBUDtBQUNEOztBQUVELFVBQU1DLGNBQWMsdUJBQXBCO0FBQ0EsVUFBTUMsOEJBQWlCLFNBQWpCQSxjQUFpQixZQUFHQyxLQUFILFFBQUdBLEtBQUgsa0NBQWlDQSxNQUFNQyxJQUF2Qyw2Q0FBK0VELE1BQU1DLElBQXJGLHlCQUFqQix5QkFBTjs7QUFFQSxhQUFPO0FBQ0xDLGdDQURLLGlEQUNvQkMsSUFEcEIsRUFDMEI7QUFDYlIsb0JBQVFTLGFBQVIsR0FBd0JDLGNBQXhCLENBQXVDRixJQUF2QyxFQUE2QyxDQUE3QyxLQUFtRCxFQUR0QyxDQUNyQkcsR0FEcUIsU0FDckJBLEdBRHFCO0FBRTdCWCxvQkFBUVksTUFBUixDQUFlLEVBQUVKLFVBQUYsRUFBUUssU0FBU1YsV0FBakIsRUFBOEJRLFFBQTlCLEVBQWY7QUFDRCxXQUpJOztBQU1MRyw4QkFOSywrQ0FNa0JOLElBTmxCLEVBTXdCO0FBQzNCQSxpQkFBS08sVUFBTCxDQUFnQkMsTUFBaEIsQ0FBdUIsNkJBQWEsQ0FBQ0MsVUFBVUMsUUFBVixDQUFtQlosSUFBbkIsSUFBMkJXLFVBQVVDLFFBQVYsQ0FBbUJDLEtBQS9DLE1BQTBELFNBQXZFLEVBQXZCLEVBQXlHQyxPQUF6RyxDQUFpSCxxQkFBYTtBQUM1R3BCLHNCQUFRUyxhQUFSLEdBQXdCQyxjQUF4QixDQUF1Q0YsSUFBdkMsRUFBNkMsQ0FBN0MsS0FBbUQsRUFEeUQsQ0FDcEhHLEdBRG9ILFNBQ3BIQSxHQURvSDtBQUU1SCxrQkFBSU0sVUFBVXhCLElBQVYsS0FBbUIsd0JBQXZCLEVBQWlEO0FBQy9DTyx3QkFBUVksTUFBUixDQUFlLEVBQUVKLFVBQUYsRUFBUUssU0FBU1YsV0FBakIsRUFBOEJRLFFBQTlCLEVBQWY7QUFDRCxlQUZELE1BRU8sSUFBSU0sVUFBVXhCLElBQVYsS0FBbUIsaUJBQXZCLEVBQTBDO0FBQy9DTyx3QkFBUVksTUFBUixDQUFlLEVBQUVKLFVBQUYsRUFBUUssU0FBU1QsZUFBZWEsU0FBZixDQUFqQixFQUE0Q04sUUFBNUMsRUFBZjtBQUNEO0FBQ0YsYUFQRDtBQVFELFdBZkksbUNBQVA7O0FBaUJELEtBckNjLG1CQUFqQiIsImZpbGUiOiJuby1kZWZhdWx0LWV4cG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3N1Z2dlc3Rpb24nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICBjYXRlZ29yeTogJ1N0eWxlIGd1aWRlJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdGb3JiaWQgZGVmYXVsdCBleHBvcnRzLicsXHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8tZGVmYXVsdC1leHBvcnQnKSxcclxuICAgIH0sXHJcbiAgICBzY2hlbWE6IFtdLFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZShjb250ZXh0KSB7XHJcbiAgICAvLyBpZ25vcmUgbm9uLW1vZHVsZXNcclxuICAgIGlmIChjb250ZXh0LnBhcnNlck9wdGlvbnMuc291cmNlVHlwZSAhPT0gJ21vZHVsZScpIHtcclxuICAgICAgcmV0dXJuIHt9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHByZWZlck5hbWVkID0gJ1ByZWZlciBuYW1lZCBleHBvcnRzLic7XHJcbiAgICBjb25zdCBub0FsaWFzRGVmYXVsdCA9ICh7IGxvY2FsIH0pID0+IGBEbyBub3QgYWxpYXMgXFxgJHtsb2NhbC5uYW1lfVxcYCBhcyBcXGBkZWZhdWx0XFxgLiBKdXN0IGV4cG9ydCBcXGAke2xvY2FsLm5hbWV9XFxgIGl0c2VsZiBpbnN0ZWFkLmA7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgRXhwb3J0RGVmYXVsdERlY2xhcmF0aW9uKG5vZGUpIHtcclxuICAgICAgICBjb25zdCB7IGxvYyB9ID0gY29udGV4dC5nZXRTb3VyY2VDb2RlKCkuZ2V0Rmlyc3RUb2tlbnMobm9kZSlbMV0gfHwge307XHJcbiAgICAgICAgY29udGV4dC5yZXBvcnQoeyBub2RlLCBtZXNzYWdlOiBwcmVmZXJOYW1lZCwgbG9jIH0pO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgRXhwb3J0TmFtZWREZWNsYXJhdGlvbihub2RlKSB7XHJcbiAgICAgICAgbm9kZS5zcGVjaWZpZXJzLmZpbHRlcihzcGVjaWZpZXIgPT4gKHNwZWNpZmllci5leHBvcnRlZC5uYW1lIHx8IHNwZWNpZmllci5leHBvcnRlZC52YWx1ZSkgPT09ICdkZWZhdWx0JykuZm9yRWFjaChzcGVjaWZpZXIgPT4ge1xyXG4gICAgICAgICAgY29uc3QgeyBsb2MgfSA9IGNvbnRleHQuZ2V0U291cmNlQ29kZSgpLmdldEZpcnN0VG9rZW5zKG5vZGUpWzFdIHx8IHt9O1xyXG4gICAgICAgICAgaWYgKHNwZWNpZmllci50eXBlID09PSAnRXhwb3J0RGVmYXVsdFNwZWNpZmllcicpIHtcclxuICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoeyBub2RlLCBtZXNzYWdlOiBwcmVmZXJOYW1lZCwgbG9jIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChzcGVjaWZpZXIudHlwZSA9PT0gJ0V4cG9ydFNwZWNpZmllcicpIHtcclxuICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoeyBub2RlLCBtZXNzYWdlOiBub0FsaWFzRGVmYXVsdChzcGVjaWZpZXIpLCBsb2MgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgfTtcclxuICB9LFxyXG59O1xyXG4iXX0=