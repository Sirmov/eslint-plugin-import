'use strict';




var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

var EXPORT_MESSAGE = 'Expected "export" or "export default"'; /**
                                                               * @fileoverview Rule to prefer ES6 to CJS
                                                               * @author Jamund Ferguson
                                                               */var IMPORT_MESSAGE = 'Expected "import" instead of "require()"';function normalizeLegacyOptions(options) {
  if (options.indexOf('allow-primitive-modules') >= 0) {
    return { allowPrimitiveModules: true };
  }
  return options[0] || {};
}

function allowPrimitive(node, options) {
  if (!options.allowPrimitiveModules) return false;
  if (node.parent.type !== 'AssignmentExpression') return false;
  return node.parent.right.type !== 'ObjectExpression';
}

function allowRequire(node, options) {
  return options.allowRequire;
}

function allowConditionalRequire(node, options) {
  return options.allowConditionalRequire !== false;
}

function validateScope(scope) {
  return scope.variableScope.type === 'module';
}

// https://github.com/estree/estree/blob/HEAD/es5.md
function isConditional(node) {
  if (
  node.type === 'IfStatement' ||
  node.type === 'TryStatement' ||
  node.type === 'LogicalExpression' ||
  node.type === 'ConditionalExpression')
  return true;
  if (node.parent) return isConditional(node.parent);
  return false;
}

function isLiteralString(node) {
  return node.type === 'Literal' && typeof node.value === 'string' ||
  node.type === 'TemplateLiteral' && node.expressions.length === 0;
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

var schemaString = { 'enum': ['allow-primitive-modules'] };
var schemaObject = {
  type: 'object',
  properties: {
    allowPrimitiveModules: { 'type': 'boolean' },
    allowRequire: { 'type': 'boolean' },
    allowConditionalRequire: { 'type': 'boolean' } },

  additionalProperties: false };


module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Module systems',
      description: 'Forbid CommonJS `require` calls and `module.exports` or `exports.*`.',
      url: (0, _docsUrl2['default'])('no-commonjs') },


    schema: {
      anyOf: [
      {
        type: 'array',
        items: [schemaString],
        additionalItems: false },

      {
        type: 'array',
        items: [schemaObject],
        additionalItems: false }] } },





  create: function () {function create(context) {
      var options = normalizeLegacyOptions(context.options);

      return {

        'MemberExpression': function () {function MemberExpression(node) {

            // module.exports
            if (node.object.name === 'module' && node.property.name === 'exports') {
              if (allowPrimitive(node, options)) return;
              context.report({ node: node, message: EXPORT_MESSAGE });
            }

            // exports.
            if (node.object.name === 'exports') {
              var isInScope = context.getScope().
              variables.
              some(function (variable) {return variable.name === 'exports';});
              if (!isInScope) {
                context.report({ node: node, message: EXPORT_MESSAGE });
              }
            }

          }return MemberExpression;}(),
        'CallExpression': function () {function CallExpression(call) {
            if (!validateScope(context.getScope())) return;

            if (call.callee.type !== 'Identifier') return;
            if (call.callee.name !== 'require') return;

            if (call.arguments.length !== 1) return;
            if (!isLiteralString(call.arguments[0])) return;

            if (allowRequire(call, options)) return;

            if (allowConditionalRequire(call, options) && isConditional(call.parent)) return;

            // keeping it simple: all 1-string-arg `require` calls are reported
            context.report({
              node: call.callee,
              message: IMPORT_MESSAGE });

          }return CallExpression;}() };


    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1jb21tb25qcy5qcyJdLCJuYW1lcyI6WyJFWFBPUlRfTUVTU0FHRSIsIklNUE9SVF9NRVNTQUdFIiwibm9ybWFsaXplTGVnYWN5T3B0aW9ucyIsIm9wdGlvbnMiLCJpbmRleE9mIiwiYWxsb3dQcmltaXRpdmVNb2R1bGVzIiwiYWxsb3dQcmltaXRpdmUiLCJub2RlIiwicGFyZW50IiwidHlwZSIsInJpZ2h0IiwiYWxsb3dSZXF1aXJlIiwiYWxsb3dDb25kaXRpb25hbFJlcXVpcmUiLCJ2YWxpZGF0ZVNjb3BlIiwic2NvcGUiLCJ2YXJpYWJsZVNjb3BlIiwiaXNDb25kaXRpb25hbCIsImlzTGl0ZXJhbFN0cmluZyIsInZhbHVlIiwiZXhwcmVzc2lvbnMiLCJsZW5ndGgiLCJzY2hlbWFTdHJpbmciLCJzY2hlbWFPYmplY3QiLCJwcm9wZXJ0aWVzIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwic2NoZW1hIiwiYW55T2YiLCJpdGVtcyIsImFkZGl0aW9uYWxJdGVtcyIsImNyZWF0ZSIsImNvbnRleHQiLCJvYmplY3QiLCJuYW1lIiwicHJvcGVydHkiLCJyZXBvcnQiLCJtZXNzYWdlIiwiaXNJblNjb3BlIiwiZ2V0U2NvcGUiLCJ2YXJpYWJsZXMiLCJzb21lIiwidmFyaWFibGUiLCJjYWxsIiwiY2FsbGVlIiwiYXJndW1lbnRzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUtBLHFDOztBQUVBLElBQU1BLGlCQUFpQix1Q0FBdkIsQyxDQVBBOzs7aUVBUUEsSUFBTUMsaUJBQWlCLDBDQUF2QixDQUVBLFNBQVNDLHNCQUFULENBQWdDQyxPQUFoQyxFQUF5QztBQUN2QyxNQUFJQSxRQUFRQyxPQUFSLENBQWdCLHlCQUFoQixLQUE4QyxDQUFsRCxFQUFxRDtBQUNuRCxXQUFPLEVBQUVDLHVCQUF1QixJQUF6QixFQUFQO0FBQ0Q7QUFDRCxTQUFPRixRQUFRLENBQVIsS0FBYyxFQUFyQjtBQUNEOztBQUVELFNBQVNHLGNBQVQsQ0FBd0JDLElBQXhCLEVBQThCSixPQUE5QixFQUF1QztBQUNyQyxNQUFJLENBQUNBLFFBQVFFLHFCQUFiLEVBQW9DLE9BQU8sS0FBUDtBQUNwQyxNQUFJRSxLQUFLQyxNQUFMLENBQVlDLElBQVosS0FBcUIsc0JBQXpCLEVBQWlELE9BQU8sS0FBUDtBQUNqRCxTQUFRRixLQUFLQyxNQUFMLENBQVlFLEtBQVosQ0FBa0JELElBQWxCLEtBQTJCLGtCQUFuQztBQUNEOztBQUVELFNBQVNFLFlBQVQsQ0FBc0JKLElBQXRCLEVBQTRCSixPQUE1QixFQUFxQztBQUNuQyxTQUFPQSxRQUFRUSxZQUFmO0FBQ0Q7O0FBRUQsU0FBU0MsdUJBQVQsQ0FBaUNMLElBQWpDLEVBQXVDSixPQUF2QyxFQUFnRDtBQUM5QyxTQUFPQSxRQUFRUyx1QkFBUixLQUFvQyxLQUEzQztBQUNEOztBQUVELFNBQVNDLGFBQVQsQ0FBdUJDLEtBQXZCLEVBQThCO0FBQzVCLFNBQU9BLE1BQU1DLGFBQU4sQ0FBb0JOLElBQXBCLEtBQTZCLFFBQXBDO0FBQ0Q7O0FBRUQ7QUFDQSxTQUFTTyxhQUFULENBQXVCVCxJQUF2QixFQUE2QjtBQUMzQjtBQUNFQSxPQUFLRSxJQUFMLEtBQWMsYUFBZDtBQUNHRixPQUFLRSxJQUFMLEtBQWMsY0FEakI7QUFFR0YsT0FBS0UsSUFBTCxLQUFjLG1CQUZqQjtBQUdHRixPQUFLRSxJQUFMLEtBQWMsdUJBSm5CO0FBS0UsU0FBTyxJQUFQO0FBQ0YsTUFBSUYsS0FBS0MsTUFBVCxFQUFpQixPQUFPUSxjQUFjVCxLQUFLQyxNQUFuQixDQUFQO0FBQ2pCLFNBQU8sS0FBUDtBQUNEOztBQUVELFNBQVNTLGVBQVQsQ0FBeUJWLElBQXpCLEVBQStCO0FBQzdCLFNBQVFBLEtBQUtFLElBQUwsS0FBYyxTQUFkLElBQTJCLE9BQU9GLEtBQUtXLEtBQVosS0FBc0IsUUFBbEQ7QUFDSlgsT0FBS0UsSUFBTCxLQUFjLGlCQUFkLElBQW1DRixLQUFLWSxXQUFMLENBQWlCQyxNQUFqQixLQUE0QixDQURsRTtBQUVEOztBQUVEO0FBQ0E7QUFDQTs7QUFFQSxJQUFNQyxlQUFlLEVBQUUsUUFBTSxDQUFDLHlCQUFELENBQVIsRUFBckI7QUFDQSxJQUFNQyxlQUFlO0FBQ25CYixRQUFNLFFBRGE7QUFFbkJjLGNBQVk7QUFDVmxCLDJCQUF1QixFQUFFLFFBQVEsU0FBVixFQURiO0FBRVZNLGtCQUFjLEVBQUUsUUFBUSxTQUFWLEVBRko7QUFHVkMsNkJBQXlCLEVBQUUsUUFBUSxTQUFWLEVBSGYsRUFGTzs7QUFPbkJZLHdCQUFzQixLQVBILEVBQXJCOzs7QUFVQUMsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0psQixVQUFNLFlBREY7QUFFSm1CLFVBQU07QUFDSkMsZ0JBQVUsZ0JBRE47QUFFSkMsbUJBQWEsc0VBRlQ7QUFHSkMsV0FBSywwQkFBUSxhQUFSLENBSEQsRUFGRjs7O0FBUUpDLFlBQVE7QUFDTkMsYUFBTztBQUNMO0FBQ0V4QixjQUFNLE9BRFI7QUFFRXlCLGVBQU8sQ0FBQ2IsWUFBRCxDQUZUO0FBR0VjLHlCQUFpQixLQUhuQixFQURLOztBQU1MO0FBQ0UxQixjQUFNLE9BRFI7QUFFRXlCLGVBQU8sQ0FBQ1osWUFBRCxDQUZUO0FBR0VhLHlCQUFpQixLQUhuQixFQU5LLENBREQsRUFSSixFQURTOzs7Ozs7QUF5QmZDLFFBekJlLCtCQXlCUkMsT0F6QlEsRUF5QkM7QUFDZCxVQUFNbEMsVUFBVUQsdUJBQXVCbUMsUUFBUWxDLE9BQS9CLENBQWhCOztBQUVBLGFBQU87O0FBRUwseUNBQW9CLDBCQUFVSSxJQUFWLEVBQWdCOztBQUVsQztBQUNBLGdCQUFJQSxLQUFLK0IsTUFBTCxDQUFZQyxJQUFaLEtBQXFCLFFBQXJCLElBQWlDaEMsS0FBS2lDLFFBQUwsQ0FBY0QsSUFBZCxLQUF1QixTQUE1RCxFQUF1RTtBQUNyRSxrQkFBSWpDLGVBQWVDLElBQWYsRUFBcUJKLE9BQXJCLENBQUosRUFBbUM7QUFDbkNrQyxzQkFBUUksTUFBUixDQUFlLEVBQUVsQyxVQUFGLEVBQVFtQyxTQUFTMUMsY0FBakIsRUFBZjtBQUNEOztBQUVEO0FBQ0EsZ0JBQUlPLEtBQUsrQixNQUFMLENBQVlDLElBQVosS0FBcUIsU0FBekIsRUFBb0M7QUFDbEMsa0JBQU1JLFlBQVlOLFFBQVFPLFFBQVI7QUFDZkMsdUJBRGU7QUFFZkMsa0JBRmUsQ0FFViw0QkFBWUMsU0FBU1IsSUFBVCxLQUFrQixTQUE5QixFQUZVLENBQWxCO0FBR0Esa0JBQUksQ0FBRUksU0FBTixFQUFpQjtBQUNmTix3QkFBUUksTUFBUixDQUFlLEVBQUVsQyxVQUFGLEVBQVFtQyxTQUFTMUMsY0FBakIsRUFBZjtBQUNEO0FBQ0Y7O0FBRUYsV0FsQkQsMkJBRks7QUFxQkwsdUNBQWtCLHdCQUFVZ0QsSUFBVixFQUFnQjtBQUNoQyxnQkFBSSxDQUFDbkMsY0FBY3dCLFFBQVFPLFFBQVIsRUFBZCxDQUFMLEVBQXdDOztBQUV4QyxnQkFBSUksS0FBS0MsTUFBTCxDQUFZeEMsSUFBWixLQUFxQixZQUF6QixFQUF1QztBQUN2QyxnQkFBSXVDLEtBQUtDLE1BQUwsQ0FBWVYsSUFBWixLQUFxQixTQUF6QixFQUFvQzs7QUFFcEMsZ0JBQUlTLEtBQUtFLFNBQUwsQ0FBZTlCLE1BQWYsS0FBMEIsQ0FBOUIsRUFBaUM7QUFDakMsZ0JBQUksQ0FBQ0gsZ0JBQWdCK0IsS0FBS0UsU0FBTCxDQUFlLENBQWYsQ0FBaEIsQ0FBTCxFQUF5Qzs7QUFFekMsZ0JBQUl2QyxhQUFhcUMsSUFBYixFQUFtQjdDLE9BQW5CLENBQUosRUFBaUM7O0FBRWpDLGdCQUFJUyx3QkFBd0JvQyxJQUF4QixFQUE4QjdDLE9BQTlCLEtBQTBDYSxjQUFjZ0MsS0FBS3hDLE1BQW5CLENBQTlDLEVBQTBFOztBQUUxRTtBQUNBNkIsb0JBQVFJLE1BQVIsQ0FBZTtBQUNibEMsb0JBQU15QyxLQUFLQyxNQURFO0FBRWJQLHVCQUFTekMsY0FGSSxFQUFmOztBQUlELFdBbEJELHlCQXJCSyxFQUFQOzs7QUEwQ0QsS0F0RWMsbUJBQWpCIiwiZmlsZSI6Im5vLWNvbW1vbmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgUnVsZSB0byBwcmVmZXIgRVM2IHRvIENKU1xyXG4gKiBAYXV0aG9yIEphbXVuZCBGZXJndXNvblxyXG4gKi9cclxuXHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnO1xyXG5cclxuY29uc3QgRVhQT1JUX01FU1NBR0UgPSAnRXhwZWN0ZWQgXCJleHBvcnRcIiBvciBcImV4cG9ydCBkZWZhdWx0XCInO1xyXG5jb25zdCBJTVBPUlRfTUVTU0FHRSA9ICdFeHBlY3RlZCBcImltcG9ydFwiIGluc3RlYWQgb2YgXCJyZXF1aXJlKClcIic7XHJcblxyXG5mdW5jdGlvbiBub3JtYWxpemVMZWdhY3lPcHRpb25zKG9wdGlvbnMpIHtcclxuICBpZiAob3B0aW9ucy5pbmRleE9mKCdhbGxvdy1wcmltaXRpdmUtbW9kdWxlcycpID49IDApIHtcclxuICAgIHJldHVybiB7IGFsbG93UHJpbWl0aXZlTW9kdWxlczogdHJ1ZSB9O1xyXG4gIH1cclxuICByZXR1cm4gb3B0aW9uc1swXSB8fCB7fTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWxsb3dQcmltaXRpdmUobm9kZSwgb3B0aW9ucykge1xyXG4gIGlmICghb3B0aW9ucy5hbGxvd1ByaW1pdGl2ZU1vZHVsZXMpIHJldHVybiBmYWxzZTtcclxuICBpZiAobm9kZS5wYXJlbnQudHlwZSAhPT0gJ0Fzc2lnbm1lbnRFeHByZXNzaW9uJykgcmV0dXJuIGZhbHNlO1xyXG4gIHJldHVybiAobm9kZS5wYXJlbnQucmlnaHQudHlwZSAhPT0gJ09iamVjdEV4cHJlc3Npb24nKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWxsb3dSZXF1aXJlKG5vZGUsIG9wdGlvbnMpIHtcclxuICByZXR1cm4gb3B0aW9ucy5hbGxvd1JlcXVpcmU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFsbG93Q29uZGl0aW9uYWxSZXF1aXJlKG5vZGUsIG9wdGlvbnMpIHtcclxuICByZXR1cm4gb3B0aW9ucy5hbGxvd0NvbmRpdGlvbmFsUmVxdWlyZSAhPT0gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHZhbGlkYXRlU2NvcGUoc2NvcGUpIHtcclxuICByZXR1cm4gc2NvcGUudmFyaWFibGVTY29wZS50eXBlID09PSAnbW9kdWxlJztcclxufVxyXG5cclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2VzdHJlZS9lc3RyZWUvYmxvYi9IRUFEL2VzNS5tZFxyXG5mdW5jdGlvbiBpc0NvbmRpdGlvbmFsKG5vZGUpIHtcclxuICBpZiAoXHJcbiAgICBub2RlLnR5cGUgPT09ICdJZlN0YXRlbWVudCdcclxuICAgIHx8IG5vZGUudHlwZSA9PT0gJ1RyeVN0YXRlbWVudCdcclxuICAgIHx8IG5vZGUudHlwZSA9PT0gJ0xvZ2ljYWxFeHByZXNzaW9uJ1xyXG4gICAgfHwgbm9kZS50eXBlID09PSAnQ29uZGl0aW9uYWxFeHByZXNzaW9uJ1xyXG4gICkgcmV0dXJuIHRydWU7XHJcbiAgaWYgKG5vZGUucGFyZW50KSByZXR1cm4gaXNDb25kaXRpb25hbChub2RlLnBhcmVudCk7XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0xpdGVyYWxTdHJpbmcobm9kZSkge1xyXG4gIHJldHVybiAobm9kZS50eXBlID09PSAnTGl0ZXJhbCcgJiYgdHlwZW9mIG5vZGUudmFsdWUgPT09ICdzdHJpbmcnKSB8fFxyXG4gICAgKG5vZGUudHlwZSA9PT0gJ1RlbXBsYXRlTGl0ZXJhbCcgJiYgbm9kZS5leHByZXNzaW9ucy5sZW5ndGggPT09IDApO1xyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBSdWxlIERlZmluaXRpb25cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmNvbnN0IHNjaGVtYVN0cmluZyA9IHsgZW51bTogWydhbGxvdy1wcmltaXRpdmUtbW9kdWxlcyddIH07XHJcbmNvbnN0IHNjaGVtYU9iamVjdCA9IHtcclxuICB0eXBlOiAnb2JqZWN0JyxcclxuICBwcm9wZXJ0aWVzOiB7XHJcbiAgICBhbGxvd1ByaW1pdGl2ZU1vZHVsZXM6IHsgJ3R5cGUnOiAnYm9vbGVhbicgfSxcclxuICAgIGFsbG93UmVxdWlyZTogeyAndHlwZSc6ICdib29sZWFuJyB9LFxyXG4gICAgYWxsb3dDb25kaXRpb25hbFJlcXVpcmU6IHsgJ3R5cGUnOiAnYm9vbGVhbicgfSxcclxuICB9LFxyXG4gIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdzdWdnZXN0aW9uJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgY2F0ZWdvcnk6ICdNb2R1bGUgc3lzdGVtcycsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnRm9yYmlkIENvbW1vbkpTIGByZXF1aXJlYCBjYWxscyBhbmQgYG1vZHVsZS5leHBvcnRzYCBvciBgZXhwb3J0cy4qYC4nLFxyXG4gICAgICB1cmw6IGRvY3NVcmwoJ25vLWNvbW1vbmpzJyksXHJcbiAgICB9LFxyXG5cclxuICAgIHNjaGVtYToge1xyXG4gICAgICBhbnlPZjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgICBpdGVtczogW3NjaGVtYVN0cmluZ10sXHJcbiAgICAgICAgICBhZGRpdGlvbmFsSXRlbXM6IGZhbHNlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICAgIGl0ZW1zOiBbc2NoZW1hT2JqZWN0XSxcclxuICAgICAgICAgIGFkZGl0aW9uYWxJdGVtczogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlKGNvbnRleHQpIHtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBub3JtYWxpemVMZWdhY3lPcHRpb25zKGNvbnRleHQub3B0aW9ucyk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICdNZW1iZXJFeHByZXNzaW9uJzogZnVuY3Rpb24gKG5vZGUpIHtcclxuXHJcbiAgICAgICAgLy8gbW9kdWxlLmV4cG9ydHNcclxuICAgICAgICBpZiAobm9kZS5vYmplY3QubmFtZSA9PT0gJ21vZHVsZScgJiYgbm9kZS5wcm9wZXJ0eS5uYW1lID09PSAnZXhwb3J0cycpIHtcclxuICAgICAgICAgIGlmIChhbGxvd1ByaW1pdGl2ZShub2RlLCBvcHRpb25zKSkgcmV0dXJuO1xyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoeyBub2RlLCBtZXNzYWdlOiBFWFBPUlRfTUVTU0FHRSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGV4cG9ydHMuXHJcbiAgICAgICAgaWYgKG5vZGUub2JqZWN0Lm5hbWUgPT09ICdleHBvcnRzJykge1xyXG4gICAgICAgICAgY29uc3QgaXNJblNjb3BlID0gY29udGV4dC5nZXRTY29wZSgpXHJcbiAgICAgICAgICAgIC52YXJpYWJsZXNcclxuICAgICAgICAgICAgLnNvbWUodmFyaWFibGUgPT4gdmFyaWFibGUubmFtZSA9PT0gJ2V4cG9ydHMnKTtcclxuICAgICAgICAgIGlmICghIGlzSW5TY29wZSkge1xyXG4gICAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7IG5vZGUsIG1lc3NhZ2U6IEVYUE9SVF9NRVNTQUdFIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0sXHJcbiAgICAgICdDYWxsRXhwcmVzc2lvbic6IGZ1bmN0aW9uIChjYWxsKSB7XHJcbiAgICAgICAgaWYgKCF2YWxpZGF0ZVNjb3BlKGNvbnRleHQuZ2V0U2NvcGUoKSkpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYgKGNhbGwuY2FsbGVlLnR5cGUgIT09ICdJZGVudGlmaWVyJykgcmV0dXJuO1xyXG4gICAgICAgIGlmIChjYWxsLmNhbGxlZS5uYW1lICE9PSAncmVxdWlyZScpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYgKGNhbGwuYXJndW1lbnRzLmxlbmd0aCAhPT0gMSkgcmV0dXJuO1xyXG4gICAgICAgIGlmICghaXNMaXRlcmFsU3RyaW5nKGNhbGwuYXJndW1lbnRzWzBdKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiAoYWxsb3dSZXF1aXJlKGNhbGwsIG9wdGlvbnMpKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmIChhbGxvd0NvbmRpdGlvbmFsUmVxdWlyZShjYWxsLCBvcHRpb25zKSAmJiBpc0NvbmRpdGlvbmFsKGNhbGwucGFyZW50KSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBrZWVwaW5nIGl0IHNpbXBsZTogYWxsIDEtc3RyaW5nLWFyZyBgcmVxdWlyZWAgY2FsbHMgYXJlIHJlcG9ydGVkXHJcbiAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgbm9kZTogY2FsbC5jYWxsZWUsXHJcbiAgICAgICAgICBtZXNzYWdlOiBJTVBPUlRfTUVTU0FHRSxcclxuICAgICAgICB9KTtcclxuICAgICAgfSxcclxuICAgIH07XHJcblxyXG4gIH0sXHJcbn07XHJcbiJdfQ==