'use strict';var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

function isComma(token) {
  return token.type === 'Punctuator' && token.value === ',';
}

function removeSpecifiers(fixes, fixer, sourceCode, specifiers) {var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
    for (var _iterator = specifiers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var specifier = _step.value;
      // remove the trailing comma
      var comma = sourceCode.getTokenAfter(specifier, isComma);
      if (comma) {
        fixes.push(fixer.remove(comma));
      }
      fixes.push(fixer.remove(specifier));
    }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
}

function getImportText(
node,
sourceCode,
specifiers,
kind)
{
  var sourceString = sourceCode.getText(node.source);
  if (specifiers.length === 0) {
    return '';
  }

  var names = specifiers.map(function (s) {
    if (s.imported.name === s.local.name) {
      return s.imported.name;
    }
    return String(s.imported.name) + ' as ' + String(s.local.name);
  });
  // insert a fresh top-level import
  return 'import ' + String(kind) + ' {' + String(names.join(', ')) + '} from ' + String(sourceString) + ';';
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Style guide',
      description: 'Enforce or ban the use of inline type-only markers for named imports.',
      url: (0, _docsUrl2['default'])('consistent-type-specifier-style') },

    fixable: 'code',
    schema: [
    {
      type: 'string',
      'enum': ['prefer-inline', 'prefer-top-level'],
      'default': 'prefer-inline' }] },




  create: function () {function create(context) {
      var sourceCode = context.getSourceCode();

      if (context.options[0] === 'prefer-inline') {
        return {
          ImportDeclaration: function () {function ImportDeclaration(node) {
              if (node.importKind === 'value' || node.importKind == null) {
                // top-level value / unknown is valid
                return;
              }

              if (
              // no specifiers (import type {} from '') have no specifiers to mark as inline
              node.specifiers.length === 0 ||
              node.specifiers.length === 1 && (
              // default imports are both "inline" and "top-level"
              node.specifiers[0].type === 'ImportDefaultSpecifier' ||
              // namespace imports are both "inline" and "top-level"
              node.specifiers[0].type === 'ImportNamespaceSpecifier'))
              {
                return;
              }

              context.report({
                node: node,
                message: 'Prefer using inline {{kind}} specifiers instead of a top-level {{kind}}-only import.',
                data: {
                  kind: node.importKind },

                fix: function () {function fix(fixer) {
                    var kindToken = sourceCode.getFirstToken(node, { skip: 1 });

                    return [].concat(
                    kindToken ? fixer.remove(kindToken) : [],
                    node.specifiers.map(function (specifier) {return fixer.insertTextBefore(specifier, String(node.importKind) + ' ');}));

                  }return fix;}() });

            }return ImportDeclaration;}() };

      }

      // prefer-top-level
      return {
        ImportDeclaration: function () {function ImportDeclaration(node) {
            if (
            // already top-level is valid
            node.importKind === 'type' ||
            node.importKind === 'typeof' ||
            // no specifiers (import {} from '') cannot have inline - so is valid
            node.specifiers.length === 0 ||
            node.specifiers.length === 1 && (
            // default imports are both "inline" and "top-level"
            node.specifiers[0].type === 'ImportDefaultSpecifier' ||
            // namespace imports are both "inline" and "top-level"
            node.specifiers[0].type === 'ImportNamespaceSpecifier'))
            {
              return;
            }

            var typeSpecifiers = [];
            var typeofSpecifiers = [];
            var valueSpecifiers = [];
            var defaultSpecifier = null;var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {
              for (var _iterator2 = node.specifiers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var specifier = _step2.value;
                if (specifier.type === 'ImportDefaultSpecifier') {
                  defaultSpecifier = specifier;
                  continue;
                }

                if (specifier.importKind === 'type') {
                  typeSpecifiers.push(specifier);
                } else if (specifier.importKind === 'typeof') {
                  typeofSpecifiers.push(specifier);
                } else if (specifier.importKind === 'value' || specifier.importKind == null) {
                  valueSpecifiers.push(specifier);
                }
              }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2['return']) {_iterator2['return']();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}

            var typeImport = getImportText(node, sourceCode, typeSpecifiers, 'type');
            var typeofImport = getImportText(node, sourceCode, typeofSpecifiers, 'typeof');
            var newImports = (String(typeImport) + '\n' + String(typeofImport)).trim();

            if (typeSpecifiers.length + typeofSpecifiers.length === node.specifiers.length) {
              // all specifiers have inline specifiers - so we replace the entire import
              var kind = [].concat(
              typeSpecifiers.length > 0 ? 'type' : [],
              typeofSpecifiers.length > 0 ? 'typeof' : []);


              context.report({
                node: node,
                message: 'Prefer using a top-level {{kind}}-only import instead of inline {{kind}} specifiers.',
                data: {
                  kind: kind.join('/') },

                fix: function () {function fix(fixer) {
                    return fixer.replaceText(node, newImports);
                  }return fix;}() });

            } else {
              // remove specific specifiers and insert new imports for them
              var _iteratorNormalCompletion3 = true;var _didIteratorError3 = false;var _iteratorError3 = undefined;try {for (var _iterator3 = typeSpecifiers.concat(typeofSpecifiers)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {var _specifier = _step3.value;
                  context.report({
                    node: _specifier,
                    message: 'Prefer using a top-level {{kind}}-only import instead of inline {{kind}} specifiers.',
                    data: {
                      kind: _specifier.importKind },

                    fix: function () {function fix(fixer) {
                        var fixes = [];

                        // if there are no value specifiers, then the other report fixer will be called, not this one

                        if (valueSpecifiers.length > 0) {
                          // import { Value, type Type } from 'mod';

                          // we can just remove the type specifiers
                          removeSpecifiers(fixes, fixer, sourceCode, typeSpecifiers);
                          removeSpecifiers(fixes, fixer, sourceCode, typeofSpecifiers);

                          // make the import nicely formatted by also removing the trailing comma after the last value import
                          // eg
                          // import { Value, type Type } from 'mod';
                          // to
                          // import { Value  } from 'mod';
                          // not
                          // import { Value,  } from 'mod';
                          var maybeComma = sourceCode.getTokenAfter(valueSpecifiers[valueSpecifiers.length - 1]);
                          if (isComma(maybeComma)) {
                            fixes.push(fixer.remove(maybeComma));
                          }
                        } else if (defaultSpecifier) {
                          // import Default, { type Type } from 'mod';

                          // remove the entire curly block so we don't leave an empty one behind
                          // NOTE - the default specifier *must* be the first specifier always!
                          //        so a comma exists that we also have to clean up or else it's bad syntax
                          var comma = sourceCode.getTokenAfter(defaultSpecifier, isComma);
                          var closingBrace = sourceCode.getTokenAfter(
                          node.specifiers[node.specifiers.length - 1],
                          function (token) {return token.type === 'Punctuator' && token.value === '}';});

                          fixes.push(fixer.removeRange([
                          comma.range[0],
                          closingBrace.range[1]]));

                        }

                        return fixes.concat(
                        // insert the new imports after the old declaration
                        fixer.insertTextAfter(node, '\n' + String(newImports)));

                      }return fix;}() });

                }} catch (err) {_didIteratorError3 = true;_iteratorError3 = err;} finally {try {if (!_iteratorNormalCompletion3 && _iterator3['return']) {_iterator3['return']();}} finally {if (_didIteratorError3) {throw _iteratorError3;}}}
            }
          }return ImportDeclaration;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9jb25zaXN0ZW50LXR5cGUtc3BlY2lmaWVyLXN0eWxlLmpzIl0sIm5hbWVzIjpbImlzQ29tbWEiLCJ0b2tlbiIsInR5cGUiLCJ2YWx1ZSIsInJlbW92ZVNwZWNpZmllcnMiLCJmaXhlcyIsImZpeGVyIiwic291cmNlQ29kZSIsInNwZWNpZmllcnMiLCJzcGVjaWZpZXIiLCJjb21tYSIsImdldFRva2VuQWZ0ZXIiLCJwdXNoIiwicmVtb3ZlIiwiZ2V0SW1wb3J0VGV4dCIsIm5vZGUiLCJraW5kIiwic291cmNlU3RyaW5nIiwiZ2V0VGV4dCIsInNvdXJjZSIsImxlbmd0aCIsIm5hbWVzIiwibWFwIiwicyIsImltcG9ydGVkIiwibmFtZSIsImxvY2FsIiwiam9pbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJ1cmwiLCJmaXhhYmxlIiwic2NoZW1hIiwiY3JlYXRlIiwiY29udGV4dCIsImdldFNvdXJjZUNvZGUiLCJvcHRpb25zIiwiSW1wb3J0RGVjbGFyYXRpb24iLCJpbXBvcnRLaW5kIiwicmVwb3J0IiwibWVzc2FnZSIsImRhdGEiLCJmaXgiLCJraW5kVG9rZW4iLCJnZXRGaXJzdFRva2VuIiwic2tpcCIsImNvbmNhdCIsImluc2VydFRleHRCZWZvcmUiLCJ0eXBlU3BlY2lmaWVycyIsInR5cGVvZlNwZWNpZmllcnMiLCJ2YWx1ZVNwZWNpZmllcnMiLCJkZWZhdWx0U3BlY2lmaWVyIiwidHlwZUltcG9ydCIsInR5cGVvZkltcG9ydCIsIm5ld0ltcG9ydHMiLCJ0cmltIiwicmVwbGFjZVRleHQiLCJtYXliZUNvbW1hIiwiY2xvc2luZ0JyYWNlIiwicmVtb3ZlUmFuZ2UiLCJyYW5nZSIsImluc2VydFRleHRBZnRlciJdLCJtYXBwaW5ncyI6ImFBQUEscUM7O0FBRUEsU0FBU0EsT0FBVCxDQUFpQkMsS0FBakIsRUFBd0I7QUFDdEIsU0FBT0EsTUFBTUMsSUFBTixLQUFlLFlBQWYsSUFBK0JELE1BQU1FLEtBQU4sS0FBZ0IsR0FBdEQ7QUFDRDs7QUFFRCxTQUFTQyxnQkFBVCxDQUEwQkMsS0FBMUIsRUFBaUNDLEtBQWpDLEVBQXdDQyxVQUF4QyxFQUFvREMsVUFBcEQsRUFBZ0U7QUFDOUQseUJBQXdCQSxVQUF4Qiw4SEFBb0MsS0FBekJDLFNBQXlCO0FBQ2xDO0FBQ0EsVUFBTUMsUUFBUUgsV0FBV0ksYUFBWCxDQUF5QkYsU0FBekIsRUFBb0NULE9BQXBDLENBQWQ7QUFDQSxVQUFJVSxLQUFKLEVBQVc7QUFDVEwsY0FBTU8sSUFBTixDQUFXTixNQUFNTyxNQUFOLENBQWFILEtBQWIsQ0FBWDtBQUNEO0FBQ0RMLFlBQU1PLElBQU4sQ0FBV04sTUFBTU8sTUFBTixDQUFhSixTQUFiLENBQVg7QUFDRCxLQVI2RDtBQVMvRDs7QUFFRCxTQUFTSyxhQUFUO0FBQ0VDLElBREY7QUFFRVIsVUFGRjtBQUdFQyxVQUhGO0FBSUVRLElBSkY7QUFLRTtBQUNBLE1BQU1DLGVBQWVWLFdBQVdXLE9BQVgsQ0FBbUJILEtBQUtJLE1BQXhCLENBQXJCO0FBQ0EsTUFBSVgsV0FBV1ksTUFBWCxLQUFzQixDQUExQixFQUE2QjtBQUMzQixXQUFPLEVBQVA7QUFDRDs7QUFFRCxNQUFNQyxRQUFRYixXQUFXYyxHQUFYLENBQWUsYUFBSztBQUNoQyxRQUFJQyxFQUFFQyxRQUFGLENBQVdDLElBQVgsS0FBb0JGLEVBQUVHLEtBQUYsQ0FBUUQsSUFBaEMsRUFBc0M7QUFDcEMsYUFBT0YsRUFBRUMsUUFBRixDQUFXQyxJQUFsQjtBQUNEO0FBQ0Qsa0JBQVVGLEVBQUVDLFFBQUYsQ0FBV0MsSUFBckIsb0JBQWdDRixFQUFFRyxLQUFGLENBQVFELElBQXhDO0FBQ0QsR0FMYSxDQUFkO0FBTUE7QUFDQSw0QkFBaUJULElBQWpCLGtCQUEwQkssTUFBTU0sSUFBTixDQUFXLElBQVgsQ0FBMUIsdUJBQW9EVixZQUFwRDtBQUNEOztBQUVEVyxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSjVCLFVBQU0sWUFERjtBQUVKNkIsVUFBTTtBQUNKQyxnQkFBVSxhQUROO0FBRUpDLG1CQUFhLHVFQUZUO0FBR0pDLFdBQUssMEJBQVEsaUNBQVIsQ0FIRCxFQUZGOztBQU9KQyxhQUFTLE1BUEw7QUFRSkMsWUFBUTtBQUNOO0FBQ0VsQyxZQUFNLFFBRFI7QUFFRSxjQUFNLENBQUMsZUFBRCxFQUFrQixrQkFBbEIsQ0FGUjtBQUdFLGlCQUFTLGVBSFgsRUFETSxDQVJKLEVBRFM7Ozs7O0FBa0JmbUMsUUFsQmUsK0JBa0JSQyxPQWxCUSxFQWtCQztBQUNkLFVBQU0vQixhQUFhK0IsUUFBUUMsYUFBUixFQUFuQjs7QUFFQSxVQUFJRCxRQUFRRSxPQUFSLENBQWdCLENBQWhCLE1BQXVCLGVBQTNCLEVBQTRDO0FBQzFDLGVBQU87QUFDTEMsMkJBREssMENBQ2ExQixJQURiLEVBQ21CO0FBQ3RCLGtCQUFJQSxLQUFLMkIsVUFBTCxLQUFvQixPQUFwQixJQUErQjNCLEtBQUsyQixVQUFMLElBQW1CLElBQXRELEVBQTREO0FBQzFEO0FBQ0E7QUFDRDs7QUFFRDtBQUNFO0FBQ0EzQixtQkFBS1AsVUFBTCxDQUFnQlksTUFBaEIsS0FBMkIsQ0FBM0I7QUFDQ0wsbUJBQUtQLFVBQUwsQ0FBZ0JZLE1BQWhCLEtBQTJCLENBQTNCO0FBQ0M7QUFDQ0wsbUJBQUtQLFVBQUwsQ0FBZ0IsQ0FBaEIsRUFBbUJOLElBQW5CLEtBQTRCLHdCQUE1QjtBQUNDO0FBQ0FhLG1CQUFLUCxVQUFMLENBQWdCLENBQWhCLEVBQW1CTixJQUFuQixLQUE0QiwwQkFKL0IsQ0FISDtBQVFFO0FBQ0E7QUFDRDs7QUFFRG9DLHNCQUFRSyxNQUFSLENBQWU7QUFDYjVCLDBCQURhO0FBRWI2Qix5QkFBUyxzRkFGSTtBQUdiQyxzQkFBTTtBQUNKN0Isd0JBQU1ELEtBQUsyQixVQURQLEVBSE87O0FBTWJJLG1CQU5hLDRCQU1UeEMsS0FOUyxFQU1GO0FBQ1Qsd0JBQU15QyxZQUFZeEMsV0FBV3lDLGFBQVgsQ0FBeUJqQyxJQUF6QixFQUErQixFQUFFa0MsTUFBTSxDQUFSLEVBQS9CLENBQWxCOztBQUVBLDJCQUFPLEdBQUdDLE1BQUg7QUFDTEgsZ0NBQVl6QyxNQUFNTyxNQUFOLENBQWFrQyxTQUFiLENBQVosR0FBc0MsRUFEakM7QUFFTGhDLHlCQUFLUCxVQUFMLENBQWdCYyxHQUFoQixDQUFvQixVQUFDYixTQUFELFVBQWVILE1BQU02QyxnQkFBTixDQUF1QjFDLFNBQXZCLFNBQXFDTSxLQUFLMkIsVUFBMUMsUUFBZixFQUFwQixDQUZLLENBQVA7O0FBSUQsbUJBYlksZ0JBQWY7O0FBZUQsYUFsQ0ksOEJBQVA7O0FBb0NEOztBQUVEO0FBQ0EsYUFBTztBQUNMRCx5QkFESywwQ0FDYTFCLElBRGIsRUFDbUI7QUFDdEI7QUFDRTtBQUNBQSxpQkFBSzJCLFVBQUwsS0FBb0IsTUFBcEI7QUFDQTNCLGlCQUFLMkIsVUFBTCxLQUFvQixRQURwQjtBQUVBO0FBQ0EzQixpQkFBS1AsVUFBTCxDQUFnQlksTUFBaEIsS0FBMkIsQ0FIM0I7QUFJQ0wsaUJBQUtQLFVBQUwsQ0FBZ0JZLE1BQWhCLEtBQTJCLENBQTNCO0FBQ0M7QUFDQ0wsaUJBQUtQLFVBQUwsQ0FBZ0IsQ0FBaEIsRUFBbUJOLElBQW5CLEtBQTRCLHdCQUE1QjtBQUNDO0FBQ0FhLGlCQUFLUCxVQUFMLENBQWdCLENBQWhCLEVBQW1CTixJQUFuQixLQUE0QiwwQkFKL0IsQ0FOSDtBQVdFO0FBQ0E7QUFDRDs7QUFFRCxnQkFBTWtELGlCQUFpQixFQUF2QjtBQUNBLGdCQUFNQyxtQkFBbUIsRUFBekI7QUFDQSxnQkFBTUMsa0JBQWtCLEVBQXhCO0FBQ0EsZ0JBQUlDLG1CQUFtQixJQUF2QixDQW5Cc0I7QUFvQnRCLG9DQUF3QnhDLEtBQUtQLFVBQTdCLG1JQUF5QyxLQUE5QkMsU0FBOEI7QUFDdkMsb0JBQUlBLFVBQVVQLElBQVYsS0FBbUIsd0JBQXZCLEVBQWlEO0FBQy9DcUQscUNBQW1COUMsU0FBbkI7QUFDQTtBQUNEOztBQUVELG9CQUFJQSxVQUFVaUMsVUFBVixLQUF5QixNQUE3QixFQUFxQztBQUNuQ1UsaUNBQWV4QyxJQUFmLENBQW9CSCxTQUFwQjtBQUNELGlCQUZELE1BRU8sSUFBSUEsVUFBVWlDLFVBQVYsS0FBeUIsUUFBN0IsRUFBdUM7QUFDNUNXLG1DQUFpQnpDLElBQWpCLENBQXNCSCxTQUF0QjtBQUNELGlCQUZNLE1BRUEsSUFBSUEsVUFBVWlDLFVBQVYsS0FBeUIsT0FBekIsSUFBb0NqQyxVQUFVaUMsVUFBVixJQUF3QixJQUFoRSxFQUFzRTtBQUMzRVksa0NBQWdCMUMsSUFBaEIsQ0FBcUJILFNBQXJCO0FBQ0Q7QUFDRixlQWpDcUI7O0FBbUN0QixnQkFBTStDLGFBQWExQyxjQUFjQyxJQUFkLEVBQW9CUixVQUFwQixFQUFnQzZDLGNBQWhDLEVBQWdELE1BQWhELENBQW5CO0FBQ0EsZ0JBQU1LLGVBQWUzQyxjQUFjQyxJQUFkLEVBQW9CUixVQUFwQixFQUFnQzhDLGdCQUFoQyxFQUFrRCxRQUFsRCxDQUFyQjtBQUNBLGdCQUFNSyxhQUFhLFFBQUdGLFVBQUgsa0JBQWtCQyxZQUFsQixHQUFpQ0UsSUFBakMsRUFBbkI7O0FBRUEsZ0JBQUlQLGVBQWVoQyxNQUFmLEdBQXdCaUMsaUJBQWlCakMsTUFBekMsS0FBb0RMLEtBQUtQLFVBQUwsQ0FBZ0JZLE1BQXhFLEVBQWdGO0FBQzlFO0FBQ0Esa0JBQU1KLE9BQU8sR0FBR2tDLE1BQUg7QUFDWEUsNkJBQWVoQyxNQUFmLEdBQXdCLENBQXhCLEdBQTRCLE1BQTVCLEdBQXFDLEVBRDFCO0FBRVhpQywrQkFBaUJqQyxNQUFqQixHQUEwQixDQUExQixHQUE4QixRQUE5QixHQUF5QyxFQUY5QixDQUFiOzs7QUFLQWtCLHNCQUFRSyxNQUFSLENBQWU7QUFDYjVCLDBCQURhO0FBRWI2Qix5QkFBUyxzRkFGSTtBQUdiQyxzQkFBTTtBQUNKN0Isd0JBQU1BLEtBQUtXLElBQUwsQ0FBVSxHQUFWLENBREYsRUFITzs7QUFNYm1CLG1CQU5hLDRCQU1UeEMsS0FOUyxFQU1GO0FBQ1QsMkJBQU9BLE1BQU1zRCxXQUFOLENBQWtCN0MsSUFBbEIsRUFBd0IyQyxVQUF4QixDQUFQO0FBQ0QsbUJBUlksZ0JBQWY7O0FBVUQsYUFqQkQsTUFpQk87QUFDTDtBQURLLHdIQUVMLHNCQUF3Qk4sZUFBZUYsTUFBZixDQUFzQkcsZ0JBQXRCLENBQXhCLG1JQUFpRSxLQUF0RDVDLFVBQXNEO0FBQy9ENkIsMEJBQVFLLE1BQVIsQ0FBZTtBQUNiNUIsMEJBQU1OLFVBRE87QUFFYm1DLDZCQUFTLHNGQUZJO0FBR2JDLDBCQUFNO0FBQ0o3Qiw0QkFBTVAsV0FBVWlDLFVBRFosRUFITzs7QUFNYkksdUJBTmEsNEJBTVR4QyxLQU5TLEVBTUY7QUFDVCw0QkFBTUQsUUFBUSxFQUFkOztBQUVBOztBQUVBLDRCQUFJaUQsZ0JBQWdCbEMsTUFBaEIsR0FBeUIsQ0FBN0IsRUFBZ0M7QUFDOUI7O0FBRUE7QUFDQWhCLDJDQUFpQkMsS0FBakIsRUFBd0JDLEtBQXhCLEVBQStCQyxVQUEvQixFQUEyQzZDLGNBQTNDO0FBQ0FoRCwyQ0FBaUJDLEtBQWpCLEVBQXdCQyxLQUF4QixFQUErQkMsVUFBL0IsRUFBMkM4QyxnQkFBM0M7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBTVEsYUFBYXRELFdBQVdJLGFBQVgsQ0FBeUIyQyxnQkFBZ0JBLGdCQUFnQmxDLE1BQWhCLEdBQXlCLENBQXpDLENBQXpCLENBQW5CO0FBQ0EsOEJBQUlwQixRQUFRNkQsVUFBUixDQUFKLEVBQXlCO0FBQ3ZCeEQsa0NBQU1PLElBQU4sQ0FBV04sTUFBTU8sTUFBTixDQUFhZ0QsVUFBYixDQUFYO0FBQ0Q7QUFDRix5QkFsQkQsTUFrQk8sSUFBSU4sZ0JBQUosRUFBc0I7QUFDM0I7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsOEJBQU03QyxRQUFRSCxXQUFXSSxhQUFYLENBQXlCNEMsZ0JBQXpCLEVBQTJDdkQsT0FBM0MsQ0FBZDtBQUNBLDhCQUFNOEQsZUFBZXZELFdBQVdJLGFBQVg7QUFDbkJJLCtCQUFLUCxVQUFMLENBQWdCTyxLQUFLUCxVQUFMLENBQWdCWSxNQUFoQixHQUF5QixDQUF6QyxDQURtQjtBQUVuQixtREFBU25CLE1BQU1DLElBQU4sS0FBZSxZQUFmLElBQStCRCxNQUFNRSxLQUFOLEtBQWdCLEdBQXhELEVBRm1CLENBQXJCOztBQUlBRSxnQ0FBTU8sSUFBTixDQUFXTixNQUFNeUQsV0FBTixDQUFrQjtBQUMzQnJELGdDQUFNc0QsS0FBTixDQUFZLENBQVosQ0FEMkI7QUFFM0JGLHVDQUFhRSxLQUFiLENBQW1CLENBQW5CLENBRjJCLENBQWxCLENBQVg7O0FBSUQ7O0FBRUQsK0JBQU8zRCxNQUFNNkMsTUFBTjtBQUNMO0FBQ0E1Qyw4QkFBTTJELGVBQU4sQ0FBc0JsRCxJQUF0QixnQkFBaUMyQyxVQUFqQyxFQUZLLENBQVA7O0FBSUQsdUJBbERZLGdCQUFmOztBQW9ERCxpQkF2REk7QUF3RE47QUFDRixXQWxISSw4QkFBUDs7QUFvSEQsS0FqTGMsbUJBQWpCIiwiZmlsZSI6ImNvbnNpc3RlbnQtdHlwZS1zcGVjaWZpZXItc3R5bGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJztcclxuXHJcbmZ1bmN0aW9uIGlzQ29tbWEodG9rZW4pIHtcclxuICByZXR1cm4gdG9rZW4udHlwZSA9PT0gJ1B1bmN0dWF0b3InICYmIHRva2VuLnZhbHVlID09PSAnLCc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZVNwZWNpZmllcnMoZml4ZXMsIGZpeGVyLCBzb3VyY2VDb2RlLCBzcGVjaWZpZXJzKSB7XHJcbiAgZm9yIChjb25zdCBzcGVjaWZpZXIgb2Ygc3BlY2lmaWVycykge1xyXG4gICAgLy8gcmVtb3ZlIHRoZSB0cmFpbGluZyBjb21tYVxyXG4gICAgY29uc3QgY29tbWEgPSBzb3VyY2VDb2RlLmdldFRva2VuQWZ0ZXIoc3BlY2lmaWVyLCBpc0NvbW1hKTtcclxuICAgIGlmIChjb21tYSkge1xyXG4gICAgICBmaXhlcy5wdXNoKGZpeGVyLnJlbW92ZShjb21tYSkpO1xyXG4gICAgfVxyXG4gICAgZml4ZXMucHVzaChmaXhlci5yZW1vdmUoc3BlY2lmaWVyKSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRJbXBvcnRUZXh0KFxyXG4gIG5vZGUsXHJcbiAgc291cmNlQ29kZSxcclxuICBzcGVjaWZpZXJzLFxyXG4gIGtpbmQsXHJcbikge1xyXG4gIGNvbnN0IHNvdXJjZVN0cmluZyA9IHNvdXJjZUNvZGUuZ2V0VGV4dChub2RlLnNvdXJjZSk7XHJcbiAgaWYgKHNwZWNpZmllcnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICByZXR1cm4gJyc7XHJcbiAgfVxyXG5cclxuICBjb25zdCBuYW1lcyA9IHNwZWNpZmllcnMubWFwKHMgPT4ge1xyXG4gICAgaWYgKHMuaW1wb3J0ZWQubmFtZSA9PT0gcy5sb2NhbC5uYW1lKSB7XHJcbiAgICAgIHJldHVybiBzLmltcG9ydGVkLm5hbWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYCR7cy5pbXBvcnRlZC5uYW1lfSBhcyAke3MubG9jYWwubmFtZX1gO1xyXG4gIH0pO1xyXG4gIC8vIGluc2VydCBhIGZyZXNoIHRvcC1sZXZlbCBpbXBvcnRcclxuICByZXR1cm4gYGltcG9ydCAke2tpbmR9IHske25hbWVzLmpvaW4oJywgJyl9fSBmcm9tICR7c291cmNlU3RyaW5nfTtgO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnU3R5bGUgZ3VpZGUnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0VuZm9yY2Ugb3IgYmFuIHRoZSB1c2Ugb2YgaW5saW5lIHR5cGUtb25seSBtYXJrZXJzIGZvciBuYW1lZCBpbXBvcnRzLicsXHJcbiAgICAgIHVybDogZG9jc1VybCgnY29uc2lzdGVudC10eXBlLXNwZWNpZmllci1zdHlsZScpLFxyXG4gICAgfSxcclxuICAgIGZpeGFibGU6ICdjb2RlJyxcclxuICAgIHNjaGVtYTogW1xyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgZW51bTogWydwcmVmZXItaW5saW5lJywgJ3ByZWZlci10b3AtbGV2ZWwnXSxcclxuICAgICAgICBkZWZhdWx0OiAncHJlZmVyLWlubGluZScsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZShjb250ZXh0KSB7XHJcbiAgICBjb25zdCBzb3VyY2VDb2RlID0gY29udGV4dC5nZXRTb3VyY2VDb2RlKCk7XHJcblxyXG4gICAgaWYgKGNvbnRleHQub3B0aW9uc1swXSA9PT0gJ3ByZWZlci1pbmxpbmUnKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgSW1wb3J0RGVjbGFyYXRpb24obm9kZSkge1xyXG4gICAgICAgICAgaWYgKG5vZGUuaW1wb3J0S2luZCA9PT0gJ3ZhbHVlJyB8fCBub2RlLmltcG9ydEtpbmQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAvLyB0b3AtbGV2ZWwgdmFsdWUgLyB1bmtub3duIGlzIHZhbGlkXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIC8vIG5vIHNwZWNpZmllcnMgKGltcG9ydCB0eXBlIHt9IGZyb20gJycpIGhhdmUgbm8gc3BlY2lmaWVycyB0byBtYXJrIGFzIGlubGluZVxyXG4gICAgICAgICAgICBub2RlLnNwZWNpZmllcnMubGVuZ3RoID09PSAwIHx8XHJcbiAgICAgICAgICAgIChub2RlLnNwZWNpZmllcnMubGVuZ3RoID09PSAxICYmXHJcbiAgICAgICAgICAgICAgLy8gZGVmYXVsdCBpbXBvcnRzIGFyZSBib3RoIFwiaW5saW5lXCIgYW5kIFwidG9wLWxldmVsXCJcclxuICAgICAgICAgICAgICAobm9kZS5zcGVjaWZpZXJzWzBdLnR5cGUgPT09ICdJbXBvcnREZWZhdWx0U3BlY2lmaWVyJyB8fFxyXG4gICAgICAgICAgICAgICAgLy8gbmFtZXNwYWNlIGltcG9ydHMgYXJlIGJvdGggXCJpbmxpbmVcIiBhbmQgXCJ0b3AtbGV2ZWxcIlxyXG4gICAgICAgICAgICAgICAgbm9kZS5zcGVjaWZpZXJzWzBdLnR5cGUgPT09ICdJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXInKSlcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnUHJlZmVyIHVzaW5nIGlubGluZSB7e2tpbmR9fSBzcGVjaWZpZXJzIGluc3RlYWQgb2YgYSB0b3AtbGV2ZWwge3traW5kfX0tb25seSBpbXBvcnQuJyxcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgIGtpbmQ6IG5vZGUuaW1wb3J0S2luZCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZml4KGZpeGVyKSB7XHJcbiAgICAgICAgICAgICAgY29uc3Qga2luZFRva2VuID0gc291cmNlQ29kZS5nZXRGaXJzdFRva2VuKG5vZGUsIHsgc2tpcDogMSB9KTtcclxuXHJcbiAgICAgICAgICAgICAgcmV0dXJuIFtdLmNvbmNhdChcclxuICAgICAgICAgICAgICAgIGtpbmRUb2tlbiA/IGZpeGVyLnJlbW92ZShraW5kVG9rZW4pIDogW10sXHJcbiAgICAgICAgICAgICAgICBub2RlLnNwZWNpZmllcnMubWFwKChzcGVjaWZpZXIpID0+IGZpeGVyLmluc2VydFRleHRCZWZvcmUoc3BlY2lmaWVyLCBgJHtub2RlLmltcG9ydEtpbmR9IGApKSxcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBwcmVmZXItdG9wLWxldmVsXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBJbXBvcnREZWNsYXJhdGlvbihub2RlKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgLy8gYWxyZWFkeSB0b3AtbGV2ZWwgaXMgdmFsaWRcclxuICAgICAgICAgIG5vZGUuaW1wb3J0S2luZCA9PT0gJ3R5cGUnIHx8XHJcbiAgICAgICAgICBub2RlLmltcG9ydEtpbmQgPT09ICd0eXBlb2YnIHx8XHJcbiAgICAgICAgICAvLyBubyBzcGVjaWZpZXJzIChpbXBvcnQge30gZnJvbSAnJykgY2Fubm90IGhhdmUgaW5saW5lIC0gc28gaXMgdmFsaWRcclxuICAgICAgICAgIG5vZGUuc3BlY2lmaWVycy5sZW5ndGggPT09IDAgfHxcclxuICAgICAgICAgIChub2RlLnNwZWNpZmllcnMubGVuZ3RoID09PSAxICYmXHJcbiAgICAgICAgICAgIC8vIGRlZmF1bHQgaW1wb3J0cyBhcmUgYm90aCBcImlubGluZVwiIGFuZCBcInRvcC1sZXZlbFwiXHJcbiAgICAgICAgICAgIChub2RlLnNwZWNpZmllcnNbMF0udHlwZSA9PT0gJ0ltcG9ydERlZmF1bHRTcGVjaWZpZXInIHx8XHJcbiAgICAgICAgICAgICAgLy8gbmFtZXNwYWNlIGltcG9ydHMgYXJlIGJvdGggXCJpbmxpbmVcIiBhbmQgXCJ0b3AtbGV2ZWxcIlxyXG4gICAgICAgICAgICAgIG5vZGUuc3BlY2lmaWVyc1swXS50eXBlID09PSAnSW1wb3J0TmFtZXNwYWNlU3BlY2lmaWVyJykpXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB0eXBlU3BlY2lmaWVycyA9IFtdO1xyXG4gICAgICAgIGNvbnN0IHR5cGVvZlNwZWNpZmllcnMgPSBbXTtcclxuICAgICAgICBjb25zdCB2YWx1ZVNwZWNpZmllcnMgPSBbXTtcclxuICAgICAgICBsZXQgZGVmYXVsdFNwZWNpZmllciA9IG51bGw7XHJcbiAgICAgICAgZm9yIChjb25zdCBzcGVjaWZpZXIgb2Ygbm9kZS5zcGVjaWZpZXJzKSB7XHJcbiAgICAgICAgICBpZiAoc3BlY2lmaWVyLnR5cGUgPT09ICdJbXBvcnREZWZhdWx0U3BlY2lmaWVyJykge1xyXG4gICAgICAgICAgICBkZWZhdWx0U3BlY2lmaWVyID0gc3BlY2lmaWVyO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoc3BlY2lmaWVyLmltcG9ydEtpbmQgPT09ICd0eXBlJykge1xyXG4gICAgICAgICAgICB0eXBlU3BlY2lmaWVycy5wdXNoKHNwZWNpZmllcik7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKHNwZWNpZmllci5pbXBvcnRLaW5kID09PSAndHlwZW9mJykge1xyXG4gICAgICAgICAgICB0eXBlb2ZTcGVjaWZpZXJzLnB1c2goc3BlY2lmaWVyKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoc3BlY2lmaWVyLmltcG9ydEtpbmQgPT09ICd2YWx1ZScgfHwgc3BlY2lmaWVyLmltcG9ydEtpbmQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB2YWx1ZVNwZWNpZmllcnMucHVzaChzcGVjaWZpZXIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdHlwZUltcG9ydCA9IGdldEltcG9ydFRleHQobm9kZSwgc291cmNlQ29kZSwgdHlwZVNwZWNpZmllcnMsICd0eXBlJyk7XHJcbiAgICAgICAgY29uc3QgdHlwZW9mSW1wb3J0ID0gZ2V0SW1wb3J0VGV4dChub2RlLCBzb3VyY2VDb2RlLCB0eXBlb2ZTcGVjaWZpZXJzLCAndHlwZW9mJyk7XHJcbiAgICAgICAgY29uc3QgbmV3SW1wb3J0cyA9IGAke3R5cGVJbXBvcnR9XFxuJHt0eXBlb2ZJbXBvcnR9YC50cmltKCk7XHJcblxyXG4gICAgICAgIGlmICh0eXBlU3BlY2lmaWVycy5sZW5ndGggKyB0eXBlb2ZTcGVjaWZpZXJzLmxlbmd0aCA9PT0gbm9kZS5zcGVjaWZpZXJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgLy8gYWxsIHNwZWNpZmllcnMgaGF2ZSBpbmxpbmUgc3BlY2lmaWVycyAtIHNvIHdlIHJlcGxhY2UgdGhlIGVudGlyZSBpbXBvcnRcclxuICAgICAgICAgIGNvbnN0IGtpbmQgPSBbXS5jb25jYXQoXHJcbiAgICAgICAgICAgIHR5cGVTcGVjaWZpZXJzLmxlbmd0aCA+IDAgPyAndHlwZScgOiBbXSxcclxuICAgICAgICAgICAgdHlwZW9mU3BlY2lmaWVycy5sZW5ndGggPiAwID8gJ3R5cGVvZicgOiBbXSxcclxuICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnUHJlZmVyIHVzaW5nIGEgdG9wLWxldmVsIHt7a2luZH19LW9ubHkgaW1wb3J0IGluc3RlYWQgb2YgaW5saW5lIHt7a2luZH19IHNwZWNpZmllcnMuJyxcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgIGtpbmQ6IGtpbmQuam9pbignLycpLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmaXgoZml4ZXIpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gZml4ZXIucmVwbGFjZVRleHQobm9kZSwgbmV3SW1wb3J0cyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gcmVtb3ZlIHNwZWNpZmljIHNwZWNpZmllcnMgYW5kIGluc2VydCBuZXcgaW1wb3J0cyBmb3IgdGhlbVxyXG4gICAgICAgICAgZm9yIChjb25zdCBzcGVjaWZpZXIgb2YgdHlwZVNwZWNpZmllcnMuY29uY2F0KHR5cGVvZlNwZWNpZmllcnMpKSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgICBub2RlOiBzcGVjaWZpZXIsXHJcbiAgICAgICAgICAgICAgbWVzc2FnZTogJ1ByZWZlciB1c2luZyBhIHRvcC1sZXZlbCB7e2tpbmR9fS1vbmx5IGltcG9ydCBpbnN0ZWFkIG9mIGlubGluZSB7e2tpbmR9fSBzcGVjaWZpZXJzLicsXHJcbiAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAga2luZDogc3BlY2lmaWVyLmltcG9ydEtpbmQsXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBmaXgoZml4ZXIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZpeGVzID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIG5vIHZhbHVlIHNwZWNpZmllcnMsIHRoZW4gdGhlIG90aGVyIHJlcG9ydCBmaXhlciB3aWxsIGJlIGNhbGxlZCwgbm90IHRoaXMgb25lXHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlU3BlY2lmaWVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgIC8vIGltcG9ydCB7IFZhbHVlLCB0eXBlIFR5cGUgfSBmcm9tICdtb2QnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgLy8gd2UgY2FuIGp1c3QgcmVtb3ZlIHRoZSB0eXBlIHNwZWNpZmllcnNcclxuICAgICAgICAgICAgICAgICAgcmVtb3ZlU3BlY2lmaWVycyhmaXhlcywgZml4ZXIsIHNvdXJjZUNvZGUsIHR5cGVTcGVjaWZpZXJzKTtcclxuICAgICAgICAgICAgICAgICAgcmVtb3ZlU3BlY2lmaWVycyhmaXhlcywgZml4ZXIsIHNvdXJjZUNvZGUsIHR5cGVvZlNwZWNpZmllcnMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgLy8gbWFrZSB0aGUgaW1wb3J0IG5pY2VseSBmb3JtYXR0ZWQgYnkgYWxzbyByZW1vdmluZyB0aGUgdHJhaWxpbmcgY29tbWEgYWZ0ZXIgdGhlIGxhc3QgdmFsdWUgaW1wb3J0XHJcbiAgICAgICAgICAgICAgICAgIC8vIGVnXHJcbiAgICAgICAgICAgICAgICAgIC8vIGltcG9ydCB7IFZhbHVlLCB0eXBlIFR5cGUgfSBmcm9tICdtb2QnO1xyXG4gICAgICAgICAgICAgICAgICAvLyB0b1xyXG4gICAgICAgICAgICAgICAgICAvLyBpbXBvcnQgeyBWYWx1ZSAgfSBmcm9tICdtb2QnO1xyXG4gICAgICAgICAgICAgICAgICAvLyBub3RcclxuICAgICAgICAgICAgICAgICAgLy8gaW1wb3J0IHsgVmFsdWUsICB9IGZyb20gJ21vZCc7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG1heWJlQ29tbWEgPSBzb3VyY2VDb2RlLmdldFRva2VuQWZ0ZXIodmFsdWVTcGVjaWZpZXJzW3ZhbHVlU3BlY2lmaWVycy5sZW5ndGggLSAxXSk7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChpc0NvbW1hKG1heWJlQ29tbWEpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZml4ZXMucHVzaChmaXhlci5yZW1vdmUobWF5YmVDb21tYSkpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRlZmF1bHRTcGVjaWZpZXIpIHtcclxuICAgICAgICAgICAgICAgICAgLy8gaW1wb3J0IERlZmF1bHQsIHsgdHlwZSBUeXBlIH0gZnJvbSAnbW9kJztcclxuXHJcbiAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgZW50aXJlIGN1cmx5IGJsb2NrIHNvIHdlIGRvbid0IGxlYXZlIGFuIGVtcHR5IG9uZSBiZWhpbmRcclxuICAgICAgICAgICAgICAgICAgLy8gTk9URSAtIHRoZSBkZWZhdWx0IHNwZWNpZmllciAqbXVzdCogYmUgdGhlIGZpcnN0IHNwZWNpZmllciBhbHdheXMhXHJcbiAgICAgICAgICAgICAgICAgIC8vICAgICAgICBzbyBhIGNvbW1hIGV4aXN0cyB0aGF0IHdlIGFsc28gaGF2ZSB0byBjbGVhbiB1cCBvciBlbHNlIGl0J3MgYmFkIHN5bnRheFxyXG4gICAgICAgICAgICAgICAgICBjb25zdCBjb21tYSA9IHNvdXJjZUNvZGUuZ2V0VG9rZW5BZnRlcihkZWZhdWx0U3BlY2lmaWVyLCBpc0NvbW1hKTtcclxuICAgICAgICAgICAgICAgICAgY29uc3QgY2xvc2luZ0JyYWNlID0gc291cmNlQ29kZS5nZXRUb2tlbkFmdGVyKFxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuc3BlY2lmaWVyc1tub2RlLnNwZWNpZmllcnMubGVuZ3RoIC0gMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4gPT4gdG9rZW4udHlwZSA9PT0gJ1B1bmN0dWF0b3InICYmIHRva2VuLnZhbHVlID09PSAnfScsXHJcbiAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgIGZpeGVzLnB1c2goZml4ZXIucmVtb3ZlUmFuZ2UoW1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbW1hLnJhbmdlWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsb3NpbmdCcmFjZS5yYW5nZVsxXSxcclxuICAgICAgICAgICAgICAgICAgXSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBmaXhlcy5jb25jYXQoXHJcbiAgICAgICAgICAgICAgICAgIC8vIGluc2VydCB0aGUgbmV3IGltcG9ydHMgYWZ0ZXIgdGhlIG9sZCBkZWNsYXJhdGlvblxyXG4gICAgICAgICAgICAgICAgICBmaXhlci5pbnNlcnRUZXh0QWZ0ZXIobm9kZSwgYFxcbiR7bmV3SW1wb3J0c31gKSxcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfTtcclxuICB9LFxyXG59O1xyXG4iXX0=