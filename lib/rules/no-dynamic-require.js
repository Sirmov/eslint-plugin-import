'use strict';var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

function isRequire(node) {
  return node &&
  node.callee &&
  node.callee.type === 'Identifier' &&
  node.callee.name === 'require' &&
  node.arguments.length >= 1;
}

function isDynamicImport(node) {
  return node &&
  node.callee &&
  node.callee.type === 'Import';
}

function isStaticValue(arg) {
  return arg.type === 'Literal' ||
  arg.type === 'TemplateLiteral' && arg.expressions.length === 0;
}

var dynamicImportErrorMessage = 'Calls to import() should use string literals';

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Static analysis',
      description: 'Forbid `require()` calls with expressions.',
      url: (0, _docsUrl2['default'])('no-dynamic-require') },

    schema: [
    {
      type: 'object',
      properties: {
        esmodule: {
          type: 'boolean' } },


      additionalProperties: false }] },




  create: function () {function create(context) {
      var options = context.options[0] || {};

      return {
        CallExpression: function () {function CallExpression(node) {
            if (!node.arguments[0] || isStaticValue(node.arguments[0])) {
              return;
            }
            if (isRequire(node)) {
              return context.report({
                node: node,
                message: 'Calls to require() should use string literals' });

            }
            if (options.esmodule && isDynamicImport(node)) {
              return context.report({
                node: node,
                message: dynamicImportErrorMessage });

            }
          }return CallExpression;}(),
        ImportExpression: function () {function ImportExpression(node) {
            if (!options.esmodule || isStaticValue(node.source)) {
              return;
            }
            return context.report({
              node: node,
              message: dynamicImportErrorMessage });

          }return ImportExpression;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1keW5hbWljLXJlcXVpcmUuanMiXSwibmFtZXMiOlsiaXNSZXF1aXJlIiwibm9kZSIsImNhbGxlZSIsInR5cGUiLCJuYW1lIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiaXNEeW5hbWljSW1wb3J0IiwiaXNTdGF0aWNWYWx1ZSIsImFyZyIsImV4cHJlc3Npb25zIiwiZHluYW1pY0ltcG9ydEVycm9yTWVzc2FnZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJ1cmwiLCJzY2hlbWEiLCJwcm9wZXJ0aWVzIiwiZXNtb2R1bGUiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsImNyZWF0ZSIsImNvbnRleHQiLCJvcHRpb25zIiwiQ2FsbEV4cHJlc3Npb24iLCJyZXBvcnQiLCJtZXNzYWdlIiwiSW1wb3J0RXhwcmVzc2lvbiIsInNvdXJjZSJdLCJtYXBwaW5ncyI6ImFBQUEscUM7O0FBRUEsU0FBU0EsU0FBVCxDQUFtQkMsSUFBbkIsRUFBeUI7QUFDdkIsU0FBT0E7QUFDTEEsT0FBS0MsTUFEQTtBQUVMRCxPQUFLQyxNQUFMLENBQVlDLElBQVosS0FBcUIsWUFGaEI7QUFHTEYsT0FBS0MsTUFBTCxDQUFZRSxJQUFaLEtBQXFCLFNBSGhCO0FBSUxILE9BQUtJLFNBQUwsQ0FBZUMsTUFBZixJQUF5QixDQUozQjtBQUtEOztBQUVELFNBQVNDLGVBQVQsQ0FBeUJOLElBQXpCLEVBQStCO0FBQzdCLFNBQU9BO0FBQ0xBLE9BQUtDLE1BREE7QUFFTEQsT0FBS0MsTUFBTCxDQUFZQyxJQUFaLEtBQXFCLFFBRnZCO0FBR0Q7O0FBRUQsU0FBU0ssYUFBVCxDQUF1QkMsR0FBdkIsRUFBNEI7QUFDMUIsU0FBT0EsSUFBSU4sSUFBSixLQUFhLFNBQWI7QUFDSk0sTUFBSU4sSUFBSixLQUFhLGlCQUFiLElBQWtDTSxJQUFJQyxXQUFKLENBQWdCSixNQUFoQixLQUEyQixDQURoRTtBQUVEOztBQUVELElBQU1LLDRCQUE0Qiw4Q0FBbEM7O0FBRUFDLE9BQU9DLE9BQVAsR0FBaUI7QUFDZkMsUUFBTTtBQUNKWCxVQUFNLFlBREY7QUFFSlksVUFBTTtBQUNKQyxnQkFBVSxpQkFETjtBQUVKQyxtQkFBYSw0Q0FGVDtBQUdKQyxXQUFLLDBCQUFRLG9CQUFSLENBSEQsRUFGRjs7QUFPSkMsWUFBUTtBQUNOO0FBQ0VoQixZQUFNLFFBRFI7QUFFRWlCLGtCQUFZO0FBQ1ZDLGtCQUFVO0FBQ1JsQixnQkFBTSxTQURFLEVBREEsRUFGZDs7O0FBT0VtQiw0QkFBc0IsS0FQeEIsRUFETSxDQVBKLEVBRFM7Ozs7O0FBcUJmQyxRQXJCZSwrQkFxQlJDLE9BckJRLEVBcUJDO0FBQ2QsVUFBTUMsVUFBVUQsUUFBUUMsT0FBUixDQUFnQixDQUFoQixLQUFzQixFQUF0Qzs7QUFFQSxhQUFPO0FBQ0xDLHNCQURLLHVDQUNVekIsSUFEVixFQUNnQjtBQUNuQixnQkFBSSxDQUFDQSxLQUFLSSxTQUFMLENBQWUsQ0FBZixDQUFELElBQXNCRyxjQUFjUCxLQUFLSSxTQUFMLENBQWUsQ0FBZixDQUFkLENBQTFCLEVBQTREO0FBQzFEO0FBQ0Q7QUFDRCxnQkFBSUwsVUFBVUMsSUFBVixDQUFKLEVBQXFCO0FBQ25CLHFCQUFPdUIsUUFBUUcsTUFBUixDQUFlO0FBQ3BCMUIsMEJBRG9CO0FBRXBCMkIseUJBQVMsK0NBRlcsRUFBZixDQUFQOztBQUlEO0FBQ0QsZ0JBQUlILFFBQVFKLFFBQVIsSUFBb0JkLGdCQUFnQk4sSUFBaEIsQ0FBeEIsRUFBK0M7QUFDN0MscUJBQU91QixRQUFRRyxNQUFSLENBQWU7QUFDcEIxQiwwQkFEb0I7QUFFcEIyQix5QkFBU2pCLHlCQUZXLEVBQWYsQ0FBUDs7QUFJRDtBQUNGLFdBakJJO0FBa0JMa0Isd0JBbEJLLHlDQWtCWTVCLElBbEJaLEVBa0JrQjtBQUNyQixnQkFBSSxDQUFDd0IsUUFBUUosUUFBVCxJQUFxQmIsY0FBY1AsS0FBSzZCLE1BQW5CLENBQXpCLEVBQXFEO0FBQ25EO0FBQ0Q7QUFDRCxtQkFBT04sUUFBUUcsTUFBUixDQUFlO0FBQ3BCMUIsd0JBRG9CO0FBRXBCMkIsdUJBQVNqQix5QkFGVyxFQUFmLENBQVA7O0FBSUQsV0ExQkksNkJBQVA7O0FBNEJELEtBcERjLG1CQUFqQiIsImZpbGUiOiJuby1keW5hbWljLXJlcXVpcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJztcclxuXHJcbmZ1bmN0aW9uIGlzUmVxdWlyZShub2RlKSB7XHJcbiAgcmV0dXJuIG5vZGUgJiZcclxuICAgIG5vZGUuY2FsbGVlICYmXHJcbiAgICBub2RlLmNhbGxlZS50eXBlID09PSAnSWRlbnRpZmllcicgJiZcclxuICAgIG5vZGUuY2FsbGVlLm5hbWUgPT09ICdyZXF1aXJlJyAmJlxyXG4gICAgbm9kZS5hcmd1bWVudHMubGVuZ3RoID49IDE7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzRHluYW1pY0ltcG9ydChub2RlKSB7XHJcbiAgcmV0dXJuIG5vZGUgJiZcclxuICAgIG5vZGUuY2FsbGVlICYmXHJcbiAgICBub2RlLmNhbGxlZS50eXBlID09PSAnSW1wb3J0JztcclxufVxyXG5cclxuZnVuY3Rpb24gaXNTdGF0aWNWYWx1ZShhcmcpIHtcclxuICByZXR1cm4gYXJnLnR5cGUgPT09ICdMaXRlcmFsJyB8fFxyXG4gICAgKGFyZy50eXBlID09PSAnVGVtcGxhdGVMaXRlcmFsJyAmJiBhcmcuZXhwcmVzc2lvbnMubGVuZ3RoID09PSAwKTtcclxufVxyXG5cclxuY29uc3QgZHluYW1pY0ltcG9ydEVycm9yTWVzc2FnZSA9ICdDYWxscyB0byBpbXBvcnQoKSBzaG91bGQgdXNlIHN0cmluZyBsaXRlcmFscyc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnU3RhdGljIGFuYWx5c2lzJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdGb3JiaWQgYHJlcXVpcmUoKWAgY2FsbHMgd2l0aCBleHByZXNzaW9ucy4nLFxyXG4gICAgICB1cmw6IGRvY3NVcmwoJ25vLWR5bmFtaWMtcmVxdWlyZScpLFxyXG4gICAgfSxcclxuICAgIHNjaGVtYTogW1xyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgZXNtb2R1bGU6IHtcclxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlKGNvbnRleHQpIHtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBjb250ZXh0Lm9wdGlvbnNbMF0gfHwge307XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgQ2FsbEV4cHJlc3Npb24obm9kZSkge1xyXG4gICAgICAgIGlmICghbm9kZS5hcmd1bWVudHNbMF0gfHwgaXNTdGF0aWNWYWx1ZShub2RlLmFyZ3VtZW50c1swXSkpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzUmVxdWlyZShub2RlKSkge1xyXG4gICAgICAgICAgcmV0dXJuIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogJ0NhbGxzIHRvIHJlcXVpcmUoKSBzaG91bGQgdXNlIHN0cmluZyBsaXRlcmFscycsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuZXNtb2R1bGUgJiYgaXNEeW5hbWljSW1wb3J0KG5vZGUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiBkeW5hbWljSW1wb3J0RXJyb3JNZXNzYWdlLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBJbXBvcnRFeHByZXNzaW9uKG5vZGUpIHtcclxuICAgICAgICBpZiAoIW9wdGlvbnMuZXNtb2R1bGUgfHwgaXNTdGF0aWNWYWx1ZShub2RlLnNvdXJjZSkpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICBtZXNzYWdlOiBkeW5hbWljSW1wb3J0RXJyb3JNZXNzYWdlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgfTtcclxuICB9LFxyXG59O1xyXG4iXX0=