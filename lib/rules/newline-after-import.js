'use strict';




var _staticRequire = require('../core/staticRequire');var _staticRequire2 = _interopRequireDefault(_staticRequire);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);

var _debug = require('debug');var _debug2 = _interopRequireDefault(_debug);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}
var log = (0, _debug2['default'])('eslint-plugin-import:rules:newline-after-import');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
/**
 * @fileoverview Rule to enforce new line after import not followed by another import.
 * @author Radek Benkel
 */function containsNodeOrEqual(outerNode, innerNode) {return outerNode.range[0] <= innerNode.range[0] && outerNode.range[1] >= innerNode.range[1];}

function getScopeBody(scope) {
  if (scope.block.type === 'SwitchStatement') {
    log('SwitchStatement scopes not supported');
    return null;
  }var

  body = scope.block.body;
  if (body && body.type === 'BlockStatement') {
    return body.body;
  }

  return body;
}

function findNodeIndexInScopeBody(body, nodeToFind) {
  return body.findIndex(function (node) {return containsNodeOrEqual(node, nodeToFind);});
}

function getLineDifference(node, nextNode) {
  return nextNode.loc.start.line - node.loc.end.line;
}

function isClassWithDecorator(node) {
  return node.type === 'ClassDeclaration' && node.decorators && node.decorators.length;
}

function isExportDefaultClass(node) {
  return node.type === 'ExportDefaultDeclaration' && node.declaration.type === 'ClassDeclaration';
}

function isExportNameClass(node) {

  return node.type === 'ExportNamedDeclaration' && node.declaration && node.declaration.type === 'ClassDeclaration';
}

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      category: 'Style guide',
      description: 'Enforce a newline after import statements.',
      url: (0, _docsUrl2['default'])('newline-after-import') },

    fixable: 'whitespace',
    schema: [
    {
      'type': 'object',
      'properties': {
        'count': {
          'type': 'integer',
          'minimum': 1 },

        'considerComments': { 'type': 'boolean' } },

      'additionalProperties': false }] },



  create: function () {function create(context) {
      var level = 0;
      var requireCalls = [];
      var options = Object.assign({ count: 1, considerComments: false }, context.options[0]);

      function checkForNewLine(node, nextNode, type) {
        if (isExportDefaultClass(nextNode) || isExportNameClass(nextNode)) {
          var classNode = nextNode.declaration;

          if (isClassWithDecorator(classNode)) {
            nextNode = classNode.decorators[0];
          }
        } else if (isClassWithDecorator(nextNode)) {
          nextNode = nextNode.decorators[0];
        }

        var lineDifference = getLineDifference(node, nextNode);
        var EXPECTED_LINE_DIFFERENCE = options.count + 1;

        if (lineDifference < EXPECTED_LINE_DIFFERENCE) {
          var column = node.loc.start.column;

          if (node.loc.start.line !== node.loc.end.line) {
            column = 0;
          }

          context.report({
            loc: {
              line: node.loc.end.line,
              column: column },

            message: 'Expected ' + String(options.count) + ' empty line' + (options.count > 1 ? 's' : '') + ' after ' + String(type) + ' statement not followed by another ' + String(type) + '.',
            fix: function () {function fix(fixer) {return fixer.insertTextAfter(
                node,
                '\n'.repeat(EXPECTED_LINE_DIFFERENCE - lineDifference));}return fix;}() });


        }
      }

      function commentAfterImport(node, nextComment) {
        var lineDifference = getLineDifference(node, nextComment);
        var EXPECTED_LINE_DIFFERENCE = options.count + 1;

        if (lineDifference < EXPECTED_LINE_DIFFERENCE) {
          var column = node.loc.start.column;

          if (node.loc.start.line !== node.loc.end.line) {
            column = 0;
          }

          context.report({
            loc: {
              line: node.loc.end.line,
              column: column },

            message: 'Expected ' + String(options.count) + ' empty line' + (options.count > 1 ? 's' : '') + ' after import statement not followed by another import.',
            fix: function () {function fix(fixer) {return fixer.insertTextAfter(
                node,
                '\n'.repeat(EXPECTED_LINE_DIFFERENCE - lineDifference));}return fix;}() });


        }
      }

      function incrementLevel() {
        level++;
      }
      function decrementLevel() {
        level--;
      }

      function checkImport(node) {var
        parent = node.parent;
        var nodePosition = parent.body.indexOf(node);
        var nextNode = parent.body[nodePosition + 1];
        var endLine = node.loc.end.line;
        var nextComment = void 0;

        if (typeof parent.comments !== 'undefined' && options.considerComments) {
          nextComment = parent.comments.find(function (o) {return o.loc.start.line === endLine + 1;});
        }


        // skip "export import"s
        if (node.type === 'TSImportEqualsDeclaration' && node.isExport) {
          return;
        }

        if (nextComment && typeof nextComment !== 'undefined') {
          commentAfterImport(node, nextComment);
        } else if (nextNode && nextNode.type !== 'ImportDeclaration' && (nextNode.type !== 'TSImportEqualsDeclaration' || nextNode.isExport)) {
          checkForNewLine(node, nextNode, 'import');
        }
      }

      return {
        ImportDeclaration: checkImport,
        TSImportEqualsDeclaration: checkImport,
        CallExpression: function () {function CallExpression(node) {
            if ((0, _staticRequire2['default'])(node) && level === 0) {
              requireCalls.push(node);
            }
          }return CallExpression;}(),
        'Program:exit': function () {function ProgramExit() {
            log('exit processing for', context.getPhysicalFilename ? context.getPhysicalFilename() : context.getFilename());
            var scopeBody = getScopeBody(context.getScope());
            log('got scope:', scopeBody);

            requireCalls.forEach(function (node, index) {
              var nodePosition = findNodeIndexInScopeBody(scopeBody, node);
              log('node position in scope:', nodePosition);

              var statementWithRequireCall = scopeBody[nodePosition];
              var nextStatement = scopeBody[nodePosition + 1];
              var nextRequireCall = requireCalls[index + 1];

              if (nextRequireCall && containsNodeOrEqual(statementWithRequireCall, nextRequireCall)) {
                return;
              }

              if (nextStatement && (
              !nextRequireCall || !containsNodeOrEqual(nextStatement, nextRequireCall))) {

                checkForNewLine(statementWithRequireCall, nextStatement, 'require');
              }
            });
          }return ProgramExit;}(),
        FunctionDeclaration: incrementLevel,
        FunctionExpression: incrementLevel,
        ArrowFunctionExpression: incrementLevel,
        BlockStatement: incrementLevel,
        ObjectExpression: incrementLevel,
        Decorator: incrementLevel,
        'FunctionDeclaration:exit': decrementLevel,
        'FunctionExpression:exit': decrementLevel,
        'ArrowFunctionExpression:exit': decrementLevel,
        'BlockStatement:exit': decrementLevel,
        'ObjectExpression:exit': decrementLevel,
        'Decorator:exit': decrementLevel };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uZXdsaW5lLWFmdGVyLWltcG9ydC5qcyJdLCJuYW1lcyI6WyJsb2ciLCJjb250YWluc05vZGVPckVxdWFsIiwib3V0ZXJOb2RlIiwiaW5uZXJOb2RlIiwicmFuZ2UiLCJnZXRTY29wZUJvZHkiLCJzY29wZSIsImJsb2NrIiwidHlwZSIsImJvZHkiLCJmaW5kTm9kZUluZGV4SW5TY29wZUJvZHkiLCJub2RlVG9GaW5kIiwiZmluZEluZGV4Iiwibm9kZSIsImdldExpbmVEaWZmZXJlbmNlIiwibmV4dE5vZGUiLCJsb2MiLCJzdGFydCIsImxpbmUiLCJlbmQiLCJpc0NsYXNzV2l0aERlY29yYXRvciIsImRlY29yYXRvcnMiLCJsZW5ndGgiLCJpc0V4cG9ydERlZmF1bHRDbGFzcyIsImRlY2xhcmF0aW9uIiwiaXNFeHBvcnROYW1lQ2xhc3MiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwiZml4YWJsZSIsInNjaGVtYSIsImNyZWF0ZSIsImNvbnRleHQiLCJsZXZlbCIsInJlcXVpcmVDYWxscyIsIm9wdGlvbnMiLCJPYmplY3QiLCJhc3NpZ24iLCJjb3VudCIsImNvbnNpZGVyQ29tbWVudHMiLCJjaGVja0Zvck5ld0xpbmUiLCJjbGFzc05vZGUiLCJsaW5lRGlmZmVyZW5jZSIsIkVYUEVDVEVEX0xJTkVfRElGRkVSRU5DRSIsImNvbHVtbiIsInJlcG9ydCIsIm1lc3NhZ2UiLCJmaXgiLCJmaXhlciIsImluc2VydFRleHRBZnRlciIsInJlcGVhdCIsImNvbW1lbnRBZnRlckltcG9ydCIsIm5leHRDb21tZW50IiwiaW5jcmVtZW50TGV2ZWwiLCJkZWNyZW1lbnRMZXZlbCIsImNoZWNrSW1wb3J0IiwicGFyZW50Iiwibm9kZVBvc2l0aW9uIiwiaW5kZXhPZiIsImVuZExpbmUiLCJjb21tZW50cyIsImZpbmQiLCJvIiwiaXNFeHBvcnQiLCJJbXBvcnREZWNsYXJhdGlvbiIsIlRTSW1wb3J0RXF1YWxzRGVjbGFyYXRpb24iLCJDYWxsRXhwcmVzc2lvbiIsInB1c2giLCJnZXRQaHlzaWNhbEZpbGVuYW1lIiwiZ2V0RmlsZW5hbWUiLCJzY29wZUJvZHkiLCJnZXRTY29wZSIsImZvckVhY2giLCJpbmRleCIsInN0YXRlbWVudFdpdGhSZXF1aXJlQ2FsbCIsIm5leHRTdGF0ZW1lbnQiLCJuZXh0UmVxdWlyZUNhbGwiLCJGdW5jdGlvbkRlY2xhcmF0aW9uIiwiRnVuY3Rpb25FeHByZXNzaW9uIiwiQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24iLCJCbG9ja1N0YXRlbWVudCIsIk9iamVjdEV4cHJlc3Npb24iLCJEZWNvcmF0b3IiXSwibWFwcGluZ3MiOiI7Ozs7O0FBS0Esc0Q7QUFDQSxxQzs7QUFFQSw4QjtBQUNBLElBQU1BLE1BQU0sd0JBQU0saURBQU4sQ0FBWjs7QUFFQTtBQUNBO0FBQ0E7QUFiQTs7O0dBZUEsU0FBU0MsbUJBQVQsQ0FBNkJDLFNBQTdCLEVBQXdDQyxTQUF4QyxFQUFtRCxDQUNqRCxPQUFPRCxVQUFVRSxLQUFWLENBQWdCLENBQWhCLEtBQXNCRCxVQUFVQyxLQUFWLENBQWdCLENBQWhCLENBQXRCLElBQTRDRixVQUFVRSxLQUFWLENBQWdCLENBQWhCLEtBQXNCRCxVQUFVQyxLQUFWLENBQWdCLENBQWhCLENBQXpFLENBQ0Q7O0FBRUQsU0FBU0MsWUFBVCxDQUFzQkMsS0FBdEIsRUFBNkI7QUFDM0IsTUFBSUEsTUFBTUMsS0FBTixDQUFZQyxJQUFaLEtBQXFCLGlCQUF6QixFQUE0QztBQUMxQ1IsUUFBSSxzQ0FBSjtBQUNBLFdBQU8sSUFBUDtBQUNELEdBSjBCOztBQU1uQlMsTUFObUIsR0FNVkgsTUFBTUMsS0FOSSxDQU1uQkUsSUFObUI7QUFPM0IsTUFBSUEsUUFBUUEsS0FBS0QsSUFBTCxLQUFjLGdCQUExQixFQUE0QztBQUMxQyxXQUFPQyxLQUFLQSxJQUFaO0FBQ0Q7O0FBRUQsU0FBT0EsSUFBUDtBQUNEOztBQUVELFNBQVNDLHdCQUFULENBQWtDRCxJ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U0FBekQ7QUFDRDtBQUNGLGFBakJEO0FBa0JELFdBdkJELHNCQVJLO0FBZ0NMRSw2QkFBcUJ4QixjQWhDaEI7QUFpQ0x5Qiw0QkFBb0J6QixjQWpDZjtBQWtDTDBCLGlDQUF5QjFCLGNBbENwQjtBQW1DTDJCLHdCQUFnQjNCLGNBbkNYO0FBb0NMNEIsMEJBQWtCNUIsY0FwQ2I7QUFxQ0w2QixtQkFBVzdCLGNBckNOO0FBc0NMLG9DQUE0QkMsY0F0Q3ZCO0FBdUNMLG1DQUEyQkEsY0F2Q3RCO0FBd0NMLHdDQUFnQ0EsY0F4QzNCO0FBeUNMLCtCQUF1QkEsY0F6Q2xCO0FBMENMLGlDQUF5QkEsY0ExQ3BCO0FBMkNMLDBCQUFrQkEsY0EzQ2IsRUFBUDs7QUE2Q0QsS0FwS2MsbUJBQWpCIiwiZmlsZSI6Im5ld2xpbmUtYWZ0ZXItaW1wb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgUnVsZSB0byBlbmZvcmNlIG5ldyBsaW5lIGFmdGVyIGltcG9ydCBub3QgZm9sbG93ZWQgYnkgYW5vdGhlciBpbXBvcnQuXHJcbiAqIEBhdXRob3IgUmFkZWsgQmVua2VsXHJcbiAqL1xyXG5cclxuaW1wb3J0IGlzU3RhdGljUmVxdWlyZSBmcm9tICcuLi9jb3JlL3N0YXRpY1JlcXVpcmUnO1xyXG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJztcclxuXHJcbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XHJcbmNvbnN0IGxvZyA9IGRlYnVnKCdlc2xpbnQtcGx1Z2luLWltcG9ydDpydWxlczpuZXdsaW5lLWFmdGVyLWltcG9ydCcpO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gUnVsZSBEZWZpbml0aW9uXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5mdW5jdGlvbiBjb250YWluc05vZGVPckVxdWFsKG91dGVyTm9kZSwgaW5uZXJOb2RlKSB7XHJcbiAgcmV0dXJuIG91dGVyTm9kZS5yYW5nZVswXSA8PSBpbm5lck5vZGUucmFuZ2VbMF0gJiYgb3V0ZXJOb2RlLnJhbmdlWzFdID49IGlubmVyTm9kZS5yYW5nZVsxXTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U2NvcGVCb2R5KHNjb3BlKSB7XHJcbiAgaWYgKHNjb3BlLmJsb2NrLnR5cGUgPT09ICdTd2l0Y2hTdGF0ZW1lbnQnKSB7XHJcbiAgICBsb2coJ1N3aXRjaFN0YXRlbWVudCBzY29wZXMgbm90IHN1cHBvcnRlZCcpO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICBjb25zdCB7IGJvZHkgfSA9IHNjb3BlLmJsb2NrO1xyXG4gIGlmIChib2R5ICYmIGJvZHkudHlwZSA9PT0gJ0Jsb2NrU3RhdGVtZW50Jykge1xyXG4gICAgcmV0dXJuIGJvZHkuYm9keTtcclxuICB9XHJcblxyXG4gIHJldHVybiBib2R5O1xyXG59XHJcblxyXG5mdW5jdGlvbiBmaW5kTm9kZUluZGV4SW5TY29wZUJvZHkoYm9keSwgbm9kZVRvRmluZCkge1xyXG4gIHJldHVybiBib2R5LmZpbmRJbmRleCgobm9kZSkgPT4gY29udGFpbnNOb2RlT3JFcXVhbChub2RlLCBub2RlVG9GaW5kKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldExpbmVEaWZmZXJlbmNlKG5vZGUsIG5leHROb2RlKSB7XHJcbiAgcmV0dXJuIG5leHROb2RlLmxvYy5zdGFydC5saW5lIC0gbm9kZS5sb2MuZW5kLmxpbmU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzQ2xhc3NXaXRoRGVjb3JhdG9yKG5vZGUpIHtcclxuICByZXR1cm4gbm9kZS50eXBlID09PSAnQ2xhc3NEZWNsYXJhdGlvbicgJiYgbm9kZS5kZWNvcmF0b3JzICYmIG5vZGUuZGVjb3JhdG9ycy5sZW5ndGg7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzRXhwb3J0RGVmYXVsdENsYXNzKG5vZGUpIHtcclxuICByZXR1cm4gbm9kZS50eXBlID09PSAnRXhwb3J0RGVmYXVsdERlY2xhcmF0aW9uJyAmJiBub2RlLmRlY2xhcmF0aW9uLnR5cGUgPT09ICdDbGFzc0RlY2xhcmF0aW9uJztcclxufVxyXG5cclxuZnVuY3Rpb24gaXNFeHBvcnROYW1lQ2xhc3Mobm9kZSkge1xyXG5cclxuICByZXR1cm4gbm9kZS50eXBlID09PSAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbicgJiYgbm9kZS5kZWNsYXJhdGlvbiAmJiBub2RlLmRlY2xhcmF0aW9uLnR5cGUgPT09ICdDbGFzc0RlY2xhcmF0aW9uJztcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ2xheW91dCcsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnU3R5bGUgZ3VpZGUnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0VuZm9yY2UgYSBuZXdsaW5lIGFmdGVyIGltcG9ydCBzdGF0ZW1lbnRzLicsXHJcbiAgICAgIHVybDogZG9jc1VybCgnbmV3bGluZS1hZnRlci1pbXBvcnQnKSxcclxuICAgIH0sXHJcbiAgICBmaXhhYmxlOiAnd2hpdGVzcGFjZScsXHJcbiAgICBzY2hlbWE6IFtcclxuICAgICAge1xyXG4gICAgICAgICd0eXBlJzogJ29iamVjdCcsXHJcbiAgICAgICAgJ3Byb3BlcnRpZXMnOiB7XHJcbiAgICAgICAgICAnY291bnQnOiB7XHJcbiAgICAgICAgICAgICd0eXBlJzogJ2ludGVnZXInLFxyXG4gICAgICAgICAgICAnbWluaW11bSc6IDEsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgJ2NvbnNpZGVyQ29tbWVudHMnOiB7ICd0eXBlJzogJ2Jvb2xlYW4nIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnYWRkaXRpb25hbFByb3BlcnRpZXMnOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgfSxcclxuICBjcmVhdGUoY29udGV4dCkge1xyXG4gICAgbGV0IGxldmVsID0gMDtcclxuICAgIGNvbnN0IHJlcXVpcmVDYWxscyA9IFtdO1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oeyBjb3VudDogMSwgY29uc2lkZXJDb21tZW50czogZmFsc2UgfSwgY29udGV4dC5vcHRpb25zWzBdKTtcclxuXHJcbiAgICBmdW5jdGlvbiBjaGVja0Zvck5ld0xpbmUobm9kZSwgbmV4dE5vZGUsIHR5cGUpIHtcclxuICAgICAgaWYgKGlzRXhwb3J0RGVmYXVsdENsYXNzKG5leHROb2RlKSB8fCBpc0V4cG9ydE5hbWVDbGFzcyhuZXh0Tm9kZSkpIHtcclxuICAgICAgICBjb25zdCBjbGFzc05vZGUgPSBuZXh0Tm9kZS5kZWNsYXJhdGlvbjtcclxuXHJcbiAgICAgICAgaWYgKGlzQ2xhc3NXaXRoRGVjb3JhdG9yKGNsYXNzTm9kZSkpIHtcclxuICAgICAgICAgIG5leHROb2RlID0gY2xhc3NOb2RlLmRlY29yYXRvcnNbMF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKGlzQ2xhc3NXaXRoRGVjb3JhdG9yKG5leHROb2RlKSkge1xyXG4gICAgICAgIG5leHROb2RlID0gbmV4dE5vZGUuZGVjb3JhdG9yc1swXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgbGluZURpZmZlcmVuY2UgPSBnZXRMaW5lRGlmZmVyZW5jZShub2RlLCBuZXh0Tm9kZSk7XHJcbiAgICAgIGNvbnN0IEVYUEVDVEVEX0xJTkVfRElGRkVSRU5DRSA9IG9wdGlvbnMuY291bnQgKyAxO1xyXG5cclxuICAgICAgaWYgKGxpbmVEaWZmZXJlbmNlIDwgRVhQRUNURURfTElORV9ESUZGRVJFTkNFKSB7XHJcbiAgICAgICAgbGV0IGNvbHVtbiA9IG5vZGUubG9jLnN0YXJ0LmNvbHVtbjtcclxuXHJcbiAgICAgICAgaWYgKG5vZGUubG9jLnN0YXJ0LmxpbmUgIT09IG5vZGUubG9jLmVuZC5saW5lKSB7XHJcbiAgICAgICAgICBjb2x1bW4gPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgbG9jOiB7XHJcbiAgICAgICAgICAgIGxpbmU6IG5vZGUubG9jLmVuZC5saW5lLFxyXG4gICAgICAgICAgICBjb2x1bW4sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgbWVzc2FnZTogYEV4cGVjdGVkICR7b3B0aW9ucy5jb3VudH0gZW1wdHkgbGluZSR7b3B0aW9ucy5jb3VudCA+IDEgPyAncycgOiAnJ30gYWZ0ZXIgJHt0eXBlfSBzdGF0ZW1lbnQgbm90IGZvbGxvd2VkIGJ5IGFub3RoZXIgJHt0eXBlfS5gLFxyXG4gICAgICAgICAgZml4OiBmaXhlciA9PiBmaXhlci5pbnNlcnRUZXh0QWZ0ZXIoXHJcbiAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgICdcXG4nLnJlcGVhdChFWFBFQ1RFRF9MSU5FX0RJRkZFUkVOQ0UgLSBsaW5lRGlmZmVyZW5jZSksXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY29tbWVudEFmdGVySW1wb3J0KG5vZGUsIG5leHRDb21tZW50KSB7XHJcbiAgICAgIGNvbnN0IGxpbmVEaWZmZXJlbmNlID0gZ2V0TGluZURpZmZlcmVuY2Uobm9kZSwgbmV4dENvbW1lbnQpO1xyXG4gICAgICBjb25zdCBFWFBFQ1RFRF9MSU5FX0RJRkZFUkVOQ0UgPSBvcHRpb25zLmNvdW50ICsgMTtcclxuXHJcbiAgICAgIGlmIChsaW5lRGlmZmVyZW5jZSA8IEVYUEVDVEVEX0xJTkVfRElGRkVSRU5DRSkge1xyXG4gICAgICAgIGxldCBjb2x1bW4gPSBub2RlLmxvYy5zdGFydC5jb2x1bW47XHJcblxyXG4gICAgICAgIGlmIChub2RlLmxvYy5zdGFydC5saW5lICE9PSBub2RlLmxvYy5lbmQubGluZSkge1xyXG4gICAgICAgICAgY29sdW1uID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgIGxvYzoge1xyXG4gICAgICAgICAgICBsaW5lOiBub2RlLmxvYy5lbmQubGluZSxcclxuICAgICAgICAgICAgY29sdW1uLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG1lc3NhZ2U6IGBFeHBlY3RlZCAke29wdGlvbnMuY291bnR9IGVtcHR5IGxpbmUke29wdGlvbnMuY291bnQgPiAxID8gJ3MnIDogJyd9IGFmdGVyIGltcG9ydCBzdGF0ZW1lbnQgbm90IGZvbGxvd2VkIGJ5IGFub3RoZXIgaW1wb3J0LmAsXHJcbiAgICAgICAgICBmaXg6IGZpeGVyID0+IGZpeGVyLmluc2VydFRleHRBZnRlcihcclxuICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgJ1xcbicucmVwZWF0KEVYUEVDVEVEX0xJTkVfRElGRkVSRU5DRSAtIGxpbmVEaWZmZXJlbmNlKSxcclxuICAgICAgICAgICksXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbmNyZW1lbnRMZXZlbCgpIHtcclxuICAgICAgbGV2ZWwrKztcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGRlY3JlbWVudExldmVsKCkge1xyXG4gICAgICBsZXZlbC0tO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNoZWNrSW1wb3J0KG5vZGUpIHtcclxuICAgICAgY29uc3QgeyBwYXJlbnQgfSA9IG5vZGU7XHJcbiAgICAgIGNvbnN0IG5vZGVQb3NpdGlvbiA9IHBhcmVudC5ib2R5LmluZGV4T2Yobm9kZSk7XHJcbiAgICAgIGNvbnN0IG5leHROb2RlID0gcGFyZW50LmJvZHlbbm9kZVBvc2l0aW9uICsgMV07XHJcbiAgICAgIGNvbnN0IGVuZExpbmUgPSBub2RlLmxvYy5lbmQubGluZTtcclxuICAgICAgbGV0IG5leHRDb21tZW50O1xyXG5cclxuICAgICAgaWYgKHR5cGVvZiBwYXJlbnQuY29tbWVudHMgIT09ICd1bmRlZmluZWQnICYmIG9wdGlvbnMuY29uc2lkZXJDb21tZW50cykge1xyXG4gICAgICAgIG5leHRDb21tZW50ID0gcGFyZW50LmNvbW1lbnRzLmZpbmQobyA9PiBvLmxvYy5zdGFydC5saW5lID09PSBlbmRMaW5lICsgMSk7XHJcbiAgICAgIH1cclxuXHJcblxyXG4gICAgICAvLyBza2lwIFwiZXhwb3J0IGltcG9ydFwic1xyXG4gICAgICBpZiAobm9kZS50eXBlID09PSAnVFNJbXBvcnRFcXVhbHNEZWNsYXJhdGlvbicgJiYgbm9kZS5pc0V4cG9ydCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG5leHRDb21tZW50ICYmIHR5cGVvZiBuZXh0Q29tbWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICBjb21tZW50QWZ0ZXJJbXBvcnQobm9kZSwgbmV4dENvbW1lbnQpO1xyXG4gICAgICB9IGVsc2UgaWYgKG5leHROb2RlICYmIG5leHROb2RlLnR5cGUgIT09ICdJbXBvcnREZWNsYXJhdGlvbicgJiYgKG5leHROb2RlLnR5cGUgIT09ICdUU0ltcG9ydEVxdWFsc0RlY2xhcmF0aW9uJyB8fCBuZXh0Tm9kZS5pc0V4cG9ydCkpIHtcclxuICAgICAgICBjaGVja0Zvck5ld0xpbmUobm9kZSwgbmV4dE5vZGUsICdpbXBvcnQnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIEltcG9ydERlY2xhcmF0aW9uOiBjaGVja0ltcG9ydCxcclxuICAgICAgVFNJbXBvcnRFcXVhbHNEZWNsYXJhdGlvbjogY2hlY2tJbXBvcnQsXHJcbiAgICAgIENhbGxFeHByZXNzaW9uKG5vZGUpIHtcclxuICAgICAgICBpZiAoaXNTdGF0aWNSZXF1aXJlKG5vZGUpICYmIGxldmVsID09PSAwKSB7XHJcbiAgICAgICAgICByZXF1aXJlQ2FsbHMucHVzaChub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgICdQcm9ncmFtOmV4aXQnOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgbG9nKCdleGl0IHByb2Nlc3NpbmcgZm9yJywgY29udGV4dC5nZXRQaHlzaWNhbEZpbGVuYW1lID8gY29udGV4dC5nZXRQaHlzaWNhbEZpbGVuYW1lKCkgOiBjb250ZXh0LmdldEZpbGVuYW1lKCkpO1xyXG4gICAgICAgIGNvbnN0IHNjb3BlQm9keSA9IGdldFNjb3BlQm9keShjb250ZXh0LmdldFNjb3BlKCkpO1xyXG4gICAgICAgIGxvZygnZ290IHNjb3BlOicsIHNjb3BlQm9keSk7XHJcblxyXG4gICAgICAgIHJlcXVpcmVDYWxscy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlLCBpbmRleCkge1xyXG4gICAgICAgICAgY29uc3Qgbm9kZVBvc2l0aW9uID0gZmluZE5vZGVJbmRleEluU2NvcGVCb2R5KHNjb3BlQm9keSwgbm9kZSk7XHJcbiAgICAgICAgICBsb2coJ25vZGUgcG9zaXRpb24gaW4gc2NvcGU6Jywgbm9kZVBvc2l0aW9uKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBzdGF0ZW1lbnRXaXRoUmVxdWlyZUNhbGwgPSBzY29wZUJvZHlbbm9kZVBvc2l0aW9uXTtcclxuICAgICAgICAgIGNvbnN0IG5leHRTdGF0ZW1lbnQgPSBzY29wZUJvZHlbbm9kZVBvc2l0aW9uICsgMV07XHJcbiAgICAgICAgICBjb25zdCBuZXh0UmVxdWlyZUNhbGwgPSByZXF1aXJlQ2FsbHNbaW5kZXggKyAxXTtcclxuXHJcbiAgICAgICAgICBpZiAobmV4dFJlcXVpcmVDYWxsICYmIGNvbnRhaW5zTm9kZU9yRXF1YWwoc3RhdGVtZW50V2l0aFJlcXVpcmVDYWxsLCBuZXh0UmVxdWlyZUNhbGwpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAobmV4dFN0YXRlbWVudCAmJlxyXG4gICAgICAgICAgICAgKCFuZXh0UmVxdWlyZUNhbGwgfHwgIWNvbnRhaW5zTm9kZU9yRXF1YWwobmV4dFN0YXRlbWVudCwgbmV4dFJlcXVpcmVDYWxsKSkpIHtcclxuXHJcbiAgICAgICAgICAgIGNoZWNrRm9yTmV3TGluZShzdGF0ZW1lbnRXaXRoUmVxdWlyZUNhbGwsIG5leHRTdGF0ZW1lbnQsICdyZXF1aXJlJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sXHJcbiAgICAgIEZ1bmN0aW9uRGVjbGFyYXRpb246IGluY3JlbWVudExldmVsLFxyXG4gICAgICBGdW5jdGlvbkV4cHJlc3Npb246IGluY3JlbWVudExldmVsLFxyXG4gICAgICBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbjogaW5jcmVtZW50TGV2ZWwsXHJcbiAgICAgIEJsb2NrU3RhdGVtZW50OiBpbmNyZW1lbnRMZXZlbCxcclxuICAgICAgT2JqZWN0RXhwcmVzc2lvbjogaW5jcmVtZW50TGV2ZWwsXHJcbiAgICAgIERlY29yYXRvcjogaW5jcmVtZW50TGV2ZWwsXHJcbiAgICAgICdGdW5jdGlvbkRlY2xhcmF0aW9uOmV4aXQnOiBkZWNyZW1lbnRMZXZlbCxcclxuICAgICAgJ0Z1bmN0aW9uRXhwcmVzc2lvbjpleGl0JzogZGVjcmVtZW50TGV2ZWwsXHJcbiAgICAgICdBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbjpleGl0JzogZGVjcmVtZW50TGV2ZWwsXHJcbiAgICAgICdCbG9ja1N0YXRlbWVudDpleGl0JzogZGVjcmVtZW50TGV2ZWwsXHJcbiAgICAgICdPYmplY3RFeHByZXNzaW9uOmV4aXQnOiBkZWNyZW1lbnRMZXZlbCxcclxuICAgICAgJ0RlY29yYXRvcjpleGl0JzogZGVjcmVtZW50TGV2ZWwsXHJcbiAgICB9O1xyXG4gIH0sXHJcbn07XHJcbiJdfQ==