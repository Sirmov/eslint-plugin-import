'use strict';




var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);
var _has = require('has');var _has2 = _interopRequireDefault(_has);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };} /**
                                                                                                                                                                    * @fileoverview Rule to disallow anonymous default exports.
                                                                                                                                                                    * @author Duncan Beevers
                                                                                                                                                                    */var defs = { ArrayExpression: {
    option: 'allowArray',
    description: 'If `false`, will report default export of an array',
    message: 'Assign array to a variable before exporting as module default' },

  ArrowFunctionExpression: {
    option: 'allowArrowFunction',
    description: 'If `false`, will report default export of an arrow function',
    message: 'Assign arrow function to a variable before exporting as module default' },

  CallExpression: {
    option: 'allowCallExpression',
    description: 'If `false`, will report default export of a function call',
    message: 'Assign call result to a variable before exporting as module default',
    'default': true },

  ClassDeclaration: {
    option: 'allowAnonymousClass',
    description: 'If `false`, will report default export of an anonymous class',
    message: 'Unexpected default export of anonymous class',
    forbid: function () {function forbid(node) {return !node.declaration.id;}return forbid;}() },

  FunctionDeclaration: {
    option: 'allowAnonymousFunction',
    description: 'If `false`, will report default export of an anonymous function',
    message: 'Unexpected default export of anonymous function',
    forbid: function () {function forbid(node) {return !node.declaration.id;}return forbid;}() },

  Literal: {
    option: 'allowLiteral',
    description: 'If `false`, will report default export of a literal',
    message: 'Assign literal to a variable before exporting as module default' },

  ObjectExpression: {
    option: 'allowObject',
    description: 'If `false`, will report default export of an object expression',
    message: 'Assign object to a variable before exporting as module default' },

  TemplateLiteral: {
    option: 'allowLiteral',
    description: 'If `false`, will report default export of a literal',
    message: 'Assign literal to a variable before exporting as module default' },

  NewExpression: {
    option: 'allowNew',
    description: 'If `false`, will report default export of a class instantiation',
    message: 'Assign instance to a variable before exporting as module default' } };



var schemaProperties = Object.keys(defs).
map(function (key) {return defs[key];}).
reduce(function (acc, def) {
  acc[def.option] = {
    description: def.description,
    type: 'boolean' };


  return acc;
}, {});

var defaults = Object.keys(defs).
map(function (key) {return defs[key];}).
reduce(function (acc, def) {
  acc[def.option] = (0, _has2['default'])(def, 'default') ? def['default'] : false;
  return acc;
}, {});

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Style guide',
      description: 'Forbid anonymous values as default exports.',
      url: (0, _docsUrl2['default'])('no-anonymous-default-export') },


    schema: [
    {
      type: 'object',
      properties: schemaProperties,
      'additionalProperties': false }] },




  create: function () {function create(context) {
      var options = Object.assign({}, defaults, context.options[0]);

      return {
        'ExportDefaultDeclaration': function () {function ExportDefaultDeclaration(node) {
            var def = defs[node.declaration.type];

            // Recognized node type and allowed by configuration,
            //   and has no forbid check, or forbid check return value is truthy
            if (def && !options[def.option] && (!def.forbid || def.forbid(node))) {
              context.report({ node: node, message: def.message });
            }
          }return ExportDefaultDeclaration;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1hbm9ueW1vdXMtZGVmYXVsdC1leHBvcnQuanMiXSwibmFtZXMiOlsiZGVmcyIsIkFycmF5RXhwcmVzc2lvbiIsIm9wdGlvbiIsImRlc2NyaXB0aW9uIiwibWVzc2FnZSIsIkFycm93RnVuY3Rpb25FeHByZXNzaW9uIiwiQ2FsbEV4cHJlc3Npb24iLCJDbGFzc0RlY2xhcmF0aW9uIiwiZm9yYmlkIiwibm9kZSIsImRlY2xhcmF0aW9uIiwiaWQiLCJGdW5jdGlvbkRlY2xhcmF0aW9uIiwiTGl0ZXJhbCIsIk9iamVjdEV4cHJlc3Npb24iLCJUZW1wbGF0ZUxpdGVyYWwiLCJOZXdFeHByZXNzaW9uIiwic2NoZW1hUHJvcGVydGllcyIsIk9iamVjdCIsImtleXMiLCJtYXAiLCJrZXkiLCJyZWR1Y2UiLCJhY2MiLCJkZWYiLCJ0eXBlIiwiZGVmYXVsdHMiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsImRvY3MiLCJjYXRlZ29yeSIsInVybCIsInNjaGVtYSIsInByb3BlcnRpZXMiLCJjcmVhdGUiLCJjb250ZXh0Iiwib3B0aW9ucyIsImFzc2lnbiIsInJlcG9ydCJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFLQSxxQztBQUNBLDBCLHlJQU5BOzs7c0tBUUEsSUFBTUEsT0FBTyxFQUNYQyxpQkFBaUI7QUFDZkMsWUFBUSxZQURPO0FBRWZDLGlCQUFhLG9EQUZFO0FBR2ZDLGFBQVMsK0RBSE0sRUFETjs7QUFNWEMsMkJBQXlCO0FBQ3ZCSCxZQUFRLG9CQURlO0FBRXZCQyxpQkFBYSw2REFGVTtBQUd2QkMsYUFBUyx3RUFIYyxFQU5kOztBQVdYRSxrQkFBZ0I7QUFDZEosWUFBUSxxQkFETTtBQUVkQyxpQkFBYSwyREFGQztBQUdkQyxhQUFTLHFFQUhLO0FBSWQsZUFBUyxJQUpLLEVBWEw7O0FBaUJYRyxvQkFBa0I7QUFDaEJMLFlBQVEscUJBRFE7QUFFaEJDLGlCQUFhLDhEQUZHO0FBR2hCQyxhQUFTLDhDQUhPO0FBSWhCSSx5QkFBUSxn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KlxyXG4gKiBAZmlsZW92ZXJ2aWV3IFJ1bGUgdG8gZGlzYWxsb3cgYW5vbnltb3VzIGRlZmF1bHQgZXhwb3J0cy5cclxuICogQGF1dGhvciBEdW5jYW4gQmVldmVyc1xyXG4gKi9cclxuXHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnO1xyXG5pbXBvcnQgaGFzIGZyb20gJ2hhcyc7XHJcblxyXG5jb25zdCBkZWZzID0ge1xyXG4gIEFycmF5RXhwcmVzc2lvbjoge1xyXG4gICAgb3B0aW9uOiAnYWxsb3dBcnJheScsXHJcbiAgICBkZXNjcmlwdGlvbjogJ0lmIGBmYWxzZWAsIHdpbGwgcmVwb3J0IGRlZmF1bHQgZXhwb3J0IG9mIGFuIGFycmF5JyxcclxuICAgIG1lc3NhZ2U6ICdBc3NpZ24gYXJyYXkgdG8gYSB2YXJpYWJsZSBiZWZvcmUgZXhwb3J0aW5nIGFzIG1vZHVsZSBkZWZhdWx0JyxcclxuICB9LFxyXG4gIEFycm93RnVuY3Rpb25FeHByZXNzaW9uOiB7XHJcbiAgICBvcHRpb246ICdhbGxvd0Fycm93RnVuY3Rpb24nLFxyXG4gICAgZGVzY3JpcHRpb246ICdJZiBgZmFsc2VgLCB3aWxsIHJlcG9ydCBkZWZhdWx0IGV4cG9ydCBvZiBhbiBhcnJvdyBmdW5jdGlvbicsXHJcbiAgICBtZXNzYWdlOiAnQXNzaWduIGFycm93IGZ1bmN0aW9uIHRvIGEgdmFyaWFibGUgYmVmb3JlIGV4cG9ydGluZyBhcyBtb2R1bGUgZGVmYXVsdCcsXHJcbiAgfSxcclxuICBDYWxsRXhwcmVzc2lvbjoge1xyXG4gICAgb3B0aW9uOiAnYWxsb3dDYWxsRXhwcmVzc2lvbicsXHJcbiAgICBkZXNjcmlwdGlvbjogJ0lmIGBmYWxzZWAsIHdpbGwgcmVwb3J0IGRlZmF1bHQgZXhwb3J0IG9mIGEgZnVuY3Rpb24gY2FsbCcsXHJcbiAgICBtZXNzYWdlOiAnQXNzaWduIGNhbGwgcmVzdWx0IHRvIGEgdmFyaWFibGUgYmVmb3JlIGV4cG9ydGluZyBhcyBtb2R1bGUgZGVmYXVsdCcsXHJcbiAgICBkZWZhdWx0OiB0cnVlLFxyXG4gIH0sXHJcbiAgQ2xhc3NEZWNsYXJhdGlvbjoge1xyXG4gICAgb3B0aW9uOiAnYWxsb3dBbm9ueW1vdXNDbGFzcycsXHJcbiAgICBkZXNjcmlwdGlvbjogJ0lmIGBmYWxzZWAsIHdpbGwgcmVwb3J0IGRlZmF1bHQgZXhwb3J0IG9mIGFuIGFub255bW91cyBjbGFzcycsXHJcbiAgICBtZXNzYWdlOiAnVW5leHBlY3RlZCBkZWZhdWx0IGV4cG9ydCBvZiBhbm9ueW1vdXMgY2xhc3MnLFxyXG4gICAgZm9yYmlkOiAobm9kZSkgPT4gIW5vZGUuZGVjbGFyYXRpb24uaWQsXHJcbiAgfSxcclxuICBGdW5jdGlvbkRlY2xhcmF0aW9uOiB7XHJcbiAgICBvcHRpb246ICdhbGxvd0Fub255bW91c0Z1bmN0aW9uJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnSWYgYGZhbHNlYCwgd2lsbCByZXBvcnQgZGVmYXVsdCBleHBvcnQgb2YgYW4gYW5vbnltb3VzIGZ1bmN0aW9uJyxcclxuICAgIG1lc3NhZ2U6ICdVbmV4cGVjdGVkIGRlZmF1bHQgZXhwb3J0IG9mIGFub255bW91cyBmdW5jdGlvbicsXHJcbiAgICBmb3JiaWQ6IChub2RlKSA9PiAhbm9kZS5kZWNsYXJhdGlvbi5pZCxcclxuICB9LFxyXG4gIExpdGVyYWw6IHtcclxuICAgIG9wdGlvbjogJ2FsbG93TGl0ZXJhbCcsXHJcbiAgICBkZXNjcmlwdGlvbjogJ0lmIGBmYWxzZWAsIHdpbGwgcmVwb3J0IGRlZmF1bHQgZXhwb3J0IG9mIGEgbGl0ZXJhbCcsXHJcbiAgICBtZXNzYWdlOiAnQXNzaWduIGxpdGVyYWwgdG8gYSB2YXJpYWJsZSBiZWZvcmUgZXhwb3J0aW5nIGFzIG1vZHVsZSBkZWZhdWx0JyxcclxuICB9LFxyXG4gIE9iamVjdEV4cHJlc3Npb246IHtcclxuICAgIG9wdGlvbjogJ2FsbG93T2JqZWN0JyxcclxuICAgIGRlc2NyaXB0aW9uOiAnSWYgYGZhbHNlYCwgd2lsbCByZXBvcnQgZGVmYXVsdCBleHBvcnQgb2YgYW4gb2JqZWN0IGV4cHJlc3Npb24nLFxyXG4gICAgbWVzc2FnZTogJ0Fzc2lnbiBvYmplY3QgdG8gYSB2YXJpYWJsZSBiZWZvcmUgZXhwb3J0aW5nIGFzIG1vZHVsZSBkZWZhdWx0JyxcclxuICB9LFxyXG4gIFRlbXBsYXRlTGl0ZXJhbDoge1xyXG4gICAgb3B0aW9uOiAnYWxsb3dMaXRlcmFsJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnSWYgYGZhbHNlYCwgd2lsbCByZXBvcnQgZGVmYXVsdCBleHBvcnQgb2YgYSBsaXRlcmFsJyxcclxuICAgIG1lc3NhZ2U6ICdBc3NpZ24gbGl0ZXJhbCB0byBhIHZhcmlhYmxlIGJlZm9yZSBleHBvcnRpbmcgYXMgbW9kdWxlIGRlZmF1bHQnLFxyXG4gIH0sXHJcbiAgTmV3RXhwcmVzc2lvbjoge1xyXG4gICAgb3B0aW9uOiAnYWxsb3dOZXcnLFxyXG4gICAgZGVzY3JpcHRpb246ICdJZiBgZmFsc2VgLCB3aWxsIHJlcG9ydCBkZWZhdWx0IGV4cG9ydCBvZiBhIGNsYXNzIGluc3RhbnRpYXRpb24nLFxyXG4gICAgbWVzc2FnZTogJ0Fzc2lnbiBpbnN0YW5jZSB0byBhIHZhcmlhYmxlIGJlZm9yZSBleHBvcnRpbmcgYXMgbW9kdWxlIGRlZmF1bHQnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5jb25zdCBzY2hlbWFQcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMoZGVmcylcclxuICAubWFwKChrZXkpID0+IGRlZnNba2V5XSlcclxuICAucmVkdWNlKChhY2MsIGRlZikgPT4ge1xyXG4gICAgYWNjW2RlZi5vcHRpb25dID0ge1xyXG4gICAgICBkZXNjcmlwdGlvbjogZGVmLmRlc2NyaXB0aW9uLFxyXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBhY2M7XHJcbiAgfSwge30pO1xyXG5cclxuY29uc3QgZGVmYXVsdHMgPSBPYmplY3Qua2V5cyhkZWZzKVxyXG4gIC5tYXAoKGtleSkgPT4gZGVmc1trZXldKVxyXG4gIC5yZWR1Y2UoKGFjYywgZGVmKSA9PiB7XHJcbiAgICBhY2NbZGVmLm9wdGlvbl0gPSBoYXMoZGVmLCAnZGVmYXVsdCcpID8gZGVmLmRlZmF1bHQgOiBmYWxzZTtcclxuICAgIHJldHVybiBhY2M7XHJcbiAgfSwge30pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3N1Z2dlc3Rpb24nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICBjYXRlZ29yeTogJ1N0eWxlIGd1aWRlJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdGb3JiaWQgYW5vbnltb3VzIHZhbHVlcyBhcyBkZWZhdWx0IGV4cG9ydHMuJyxcclxuICAgICAgdXJsOiBkb2NzVXJsKCduby1hbm9ueW1vdXMtZGVmYXVsdC1leHBvcnQnKSxcclxuICAgIH0sXHJcblxyXG4gICAgc2NoZW1hOiBbXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgICAgICBwcm9wZXJ0aWVzOiBzY2hlbWFQcm9wZXJ0aWVzLFxyXG4gICAgICAgICdhZGRpdGlvbmFsUHJvcGVydGllcyc6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICB9LFxyXG5cclxuICBjcmVhdGUoY29udGV4dCkge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBjb250ZXh0Lm9wdGlvbnNbMF0pO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICdFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24nOiAobm9kZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRlZiA9IGRlZnNbbm9kZS5kZWNsYXJhdGlvbi50eXBlXTtcclxuXHJcbiAgICAgICAgLy8gUmVjb2duaXplZCBub2RlIHR5cGUgYW5kIGFsbG93ZWQgYnkgY29uZmlndXJhdGlvbixcclxuICAgICAgICAvLyAgIGFuZCBoYXMgbm8gZm9yYmlkIGNoZWNrLCBvciBmb3JiaWQgY2hlY2sgcmV0dXJuIHZhbHVlIGlzIHRydXRoeVxyXG4gICAgICAgIGlmIChkZWYgJiYgIW9wdGlvbnNbZGVmLm9wdGlvbl0gJiYgKCFkZWYuZm9yYmlkIHx8IGRlZi5mb3JiaWQobm9kZSkpKSB7XHJcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7IG5vZGUsIG1lc3NhZ2U6IGRlZi5tZXNzYWdlIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH07XHJcbiAgfSxcclxufTtcclxuIl19