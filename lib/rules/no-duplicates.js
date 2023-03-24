'use strict';var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _resolve = require('eslint-module-utils/resolve');var _resolve2 = _interopRequireDefault(_resolve);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);
var _semver = require('semver');var _semver2 = _interopRequireDefault(_semver);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}function _toArray(arr) {return Array.isArray(arr) ? arr : Array.from(arr);}

var typescriptPkg = void 0;
try {
  typescriptPkg = require('typescript/package.json'); // eslint-disable-line import/no-extraneous-dependencies
} catch (e) {/**/}

function checkImports(imported, context) {var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
    for (var _iterator = imported.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var _ref = _step.value;var _ref2 = _slicedToArray(_ref, 2);var _module = _ref2[0];var nodes = _ref2[1];
      if (nodes.length > 1) {
        var message = '\'' + String(_module) + '\' imported multiple times.';var _nodes = _toArray(
        nodes),first = _nodes[0],rest = _nodes.slice(1);
        var sourceCode = context.getSourceCode();
        var fix = getFix(first, rest, sourceCode, context);

        context.report({
          node: first.source,
          message: message,
          fix: fix // Attach the autofix (if any) to the first import.
        });var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {

          for (var _iterator2 = rest[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var node = _step2.value;
            context.report({
              node: node.source,
              message: message });

          }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2['return']) {_iterator2['return']();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}
      }
    }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
}

function getFix(first, rest, sourceCode, context) {
  // Sorry ESLint <= 3 users, no autofix for you. Autofixing duplicate imports
  // requires multiple `fixer.whatever()` calls in the `fix`: We both need to
  // update the first one, and remove the rest. Support for multiple
  // `fixer.whatever()` in a single `fix` was added in ESLint 4.1.
  // `sourceCode.getCommentsBefore` was added in 4.0, so that's an easy thing to
  // check for.
  if (typeof sourceCode.getCommentsBefore !== 'function') {
    return undefined;
  }

  // Adjusting the first import might make it multiline, which could break
  // `eslint-disable-next-line` comments and similar, so bail if the first
  // import has comments. Also, if the first import is `import * as ns from
  // './foo'` there's nothing we can do.
  if (hasProblematicComments(first, sourceCode) || hasNamespace(first)) {
    return undefined;
  }

  var defaultImportNames = new Set(
  [first].concat(_toConsumableArray(rest)).map(getDefaultImportName).filter(Boolean));


  // Bail if there are multiple different default import names – it's up to the
  // user to choose which one to keep.
  if (defaultImportNames.size > 1) {
    return undefined;
  }

  // Leave it to the user to handle comments. Also skip `import * as ns from
  // './foo'` imports, since they cannot be merged into another import.
  var restWithoutComments = rest.filter(function (node) {return !(
    hasProblematicComments(node, sourceCode) ||
    hasNamespace(node));});


  var specifiers = restWithoutComments.
  map(function (node) {
    var tokens = sourceCode.getTokens(node);
    var openBrace = tokens.find(function (token) {return isPunctuator(token, '{');});
    var closeBrace = tokens.find(function (token) {return isPunctuator(token, '}');});

    if (openBrace == null || closeBrace == null) {
      return undefined;
    }

    return {
      importNode: node,
      identifiers: sourceCode.text.slice(openBrace.range[1], closeBrace.range[0]).split(','), // Split the text into separate identifiers (retaining any whitespace before or after)
      isEmpty: !hasSpecifiers(node) };

  }).
  filter(Boolean);

  var unnecessaryImports = restWithoutComments.filter(function (node) {return (
      !hasSpecifiers(node) &&
      !hasNamespace(node) &&
      !specifiers.some(function (specifier) {return specifier.importNode === node;}));});


  var shouldAddDefault = getDefaultImportName(first) == null && defaultImportNames.size === 1;
  var shouldAddSpecifiers = specifiers.length > 0;
  var shouldRemoveUnnecessary = unnecessaryImports.length > 0;

  if (!(shouldAddDefault || shouldAddSpecifiers || shouldRemoveUnnecessary)) {
    return undefined;
  }

  return function (fixer) {
    var tokens = sourceCode.getTokens(first);
    var openBrace = tokens.find(function (token) {return isPunctuator(token, '{');});
    var closeBrace = tokens.find(function (token) {return isPunctuator(token, '}');});
    var firstToken = sourceCode.getFirstToken(first);var _defaultImportNames = _slicedToArray(
    defaultImportNames, 1),defaultImportName = _defaultImportNames[0];

    var firstHasTrailingComma =
    closeBrace != null &&
    isPunctuator(sourceCode.getTokenBefore(closeBrace), ',');
    var firstIsEmpty = !hasSpecifiers(first);
    var firstExistingIdentifiers = firstIsEmpty ?
    new Set() :
    new Set(sourceCode.text.slice(openBrace.range[1], closeBrace.range[0]).
    split(',').
    map(function (x) {return x.trim();}));var _specifiers$reduce =


    specifiers.reduce(
    function (_ref3, specifier) {var _ref4 = _slicedToArray(_ref3, 3),result = _ref4[0],needsComma = _ref4[1],existingIdentifiers = _ref4[2];
      var isTypeSpecifier = specifier.importNode.importKind === 'type';

      var preferInline = context.options[0] && context.options[0]['prefer-inline'];
      // a user might set prefer-inline but not have a supporting TypeScript version.  Flow does not support inline types so this should fail in that case as well.
      if (preferInline && (!typescriptPkg || !_semver2['default'].satisfies(typescriptPkg.version, '>= 4.5'))) {
        throw new Error('Your version of TypeScript does not support inline type imports.');
      }

      // Add *only* the new identifiers that don't already exist, and track any new identifiers so we don't add them again in the next loop
      var _specifier$identifier = specifier.identifiers.reduce(function (_ref5, cur) {var _ref6 = _slicedToArray(_ref5, 2),text = _ref6[0],set = _ref6[1];
        var trimmed = cur.trim(); // Trim whitespace before/after to compare to our set of existing identifiers
        var curWithType = trimmed.length > 0 && preferInline && isTypeSpecifier ? 'type ' + String(cur) : cur;
        if (existingIdentifiers.has(trimmed)) {
          return [text, set];
        }
        return [text.length > 0 ? String(text) + ',' + String(curWithType) : curWithType, set.add(trimmed)];
      }, ['', existingIdentifiers]),_specifier$identifier2 = _slicedToArray(_specifier$identifier, 2),specifierText = _specifier$identifier2[0],updatedExistingIdentifiers = _specifier$identifier2[1];

      return [
      needsComma && !specifier.isEmpty && specifierText.length > 0 ? String(
      result) + ',' + String(specifierText) : '' + String(
      result) + String(specifierText),
      specifier.isEmpty ? needsComma : true,
      updatedExistingIdentifiers];

    },
    ['', !firstHasTrailingComma && !firstIsEmpty, firstExistingIdentifiers]),_specifiers$reduce2 = _slicedToArray(_specifiers$reduce, 1),specifiersText = _specifiers$reduce2[0];


    var fixes = [];

    if (shouldAddDefault && openBrace == null && shouldAddSpecifiers) {
      // `import './foo'` → `import def, {...} from './foo'`
      fixes.push(
      fixer.insertTextAfter(firstToken, ' ' + String(defaultImportName) + ', {' + String(specifiersText) + '} from'));

    } else if (shouldAddDefault && openBrace == null && !shouldAddSpecifiers) {
      // `import './foo'` → `import def from './foo'`
      fixes.push(fixer.insertTextAfter(firstToken, ' ' + String(defaultImportName) + ' from'));
    } else if (shouldAddDefault && openBrace != null && closeBrace != null) {
      // `import {...} from './foo'` → `import def, {...} from './foo'`
      fixes.push(fixer.insertTextAfter(firstToken, ' ' + String(defaultImportName) + ','));
      if (shouldAddSpecifiers) {
        // `import def, {...} from './foo'` → `import def, {..., ...} from './foo'`
        fixes.push(fixer.insertTextBefore(closeBrace, specifiersText));
      }
    } else if (!shouldAddDefault && openBrace == null && shouldAddSpecifiers) {
      if (first.specifiers.length === 0) {
        // `import './foo'` → `import {...} from './foo'`
        fixes.push(fixer.insertTextAfter(firstToken, ' {' + String(specifiersText) + '} from'));
      } else {
        // `import def from './foo'` → `import def, {...} from './foo'`
        fixes.push(fixer.insertTextAfter(first.specifiers[0], ', {' + String(specifiersText) + '}'));
      }
    } else if (!shouldAddDefault && openBrace != null && closeBrace != null) {
      // `import {...} './foo'` → `import {..., ...} from './foo'`
      fixes.push(fixer.insertTextBefore(closeBrace, specifiersText));
    }

    // Remove imports whose specifiers have been moved into the first import.
    var _iteratorNormalCompletion3 = true;var _didIteratorError3 = false;var _iteratorError3 = undefined;try {for (var _iterator3 = specifiers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {var specifier = _step3.value;
        var importNode = specifier.importNode;
        fixes.push(fixer.remove(importNode));

        var charAfterImportRange = [importNode.range[1], importNode.range[1] + 1];
        var charAfterImport = sourceCode.text.substring(charAfterImportRange[0], charAfterImportRange[1]);
        if (charAfterImport === '\n') {
          fixes.push(fixer.removeRange(charAfterImportRange));
        }
      }

      // Remove imports whose default import has been moved to the first import,
      // and side-effect-only imports that are unnecessary due to the first
      // import.
    } catch (err) {_didIteratorError3 = true;_iteratorError3 = err;} finally {try {if (!_iteratorNormalCompletion3 && _iterator3['return']) {_iterator3['return']();}} finally {if (_didIteratorError3) {throw _iteratorError3;}}}var _iteratorNormalCompletion4 = true;var _didIteratorError4 = false;var _iteratorError4 = undefined;try {for (var _iterator4 = unnecessaryImports[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {var node = _step4.value;
        fixes.push(fixer.remove(node));

        var charAfterImportRange = [node.range[1], node.range[1] + 1];
        var charAfterImport = sourceCode.text.substring(charAfterImportRange[0], charAfterImportRange[1]);
        if (charAfterImport === '\n') {
          fixes.push(fixer.removeRange(charAfterImportRange));
        }
      }} catch (err) {_didIteratorError4 = true;_iteratorError4 = err;} finally {try {if (!_iteratorNormalCompletion4 && _iterator4['return']) {_iterator4['return']();}} finally {if (_didIteratorError4) {throw _iteratorError4;}}}

    return fixes;
  };
}

function isPunctuator(node, value) {
  return node.type === 'Punctuator' && node.value === value;
}

// Get the name of the default import of `node`, if any.
function getDefaultImportName(node) {
  var defaultSpecifier = node.specifiers.
  find(function (specifier) {return specifier.type === 'ImportDefaultSpecifier';});
  return defaultSpecifier != null ? defaultSpecifier.local.name : undefined;
}

// Checks whether `node` has a namespace import.
function hasNamespace(node) {
  var specifiers = node.specifiers.
  filter(function (specifier) {return specifier.type === 'ImportNamespaceSpecifier';});
  return specifiers.length > 0;
}

// Checks whether `node` has any non-default specifiers.
function hasSpecifiers(node) {
  var specifiers = node.specifiers.
  filter(function (specifier) {return specifier.type === 'ImportSpecifier';});
  return specifiers.length > 0;
}

// It's not obvious what the user wants to do with comments associated with
// duplicate imports, so skip imports with comments when autofixing.
function hasProblematicComments(node, sourceCode) {
  return (
    hasCommentBefore(node, sourceCode) ||
    hasCommentAfter(node, sourceCode) ||
    hasCommentInsideNonSpecifiers(node, sourceCode));

}

// Checks whether `node` has a comment (that ends) on the previous line or on
// the same line as `node` (starts).
function hasCommentBefore(node, sourceCode) {
  return sourceCode.getCommentsBefore(node).
  some(function (comment) {return comment.loc.end.line >= node.loc.start.line - 1;});
}

// Checks whether `node` has a comment (that starts) on the same line as `node`
// (ends).
function hasCommentAfter(node, sourceCode) {
  return sourceCode.getCommentsAfter(node).
  some(function (comment) {return comment.loc.start.line === node.loc.end.line;});
}

// Checks whether `node` has any comments _inside,_ except inside the `{...}`
// part (if any).
function hasCommentInsideNonSpecifiers(node, sourceCode) {
  var tokens = sourceCode.getTokens(node);
  var openBraceIndex = tokens.findIndex(function (token) {return isPunctuator(token, '{');});
  var closeBraceIndex = tokens.findIndex(function (token) {return isPunctuator(token, '}');});
  // Slice away the first token, since we're no looking for comments _before_
  // `node` (only inside). If there's a `{...}` part, look for comments before
  // the `{`, but not before the `}` (hence the `+1`s).
  var someTokens = openBraceIndex >= 0 && closeBraceIndex >= 0 ?
  tokens.slice(1, openBraceIndex + 1).concat(tokens.slice(closeBraceIndex + 1)) :
  tokens.slice(1);
  return someTokens.some(function (token) {return sourceCode.getCommentsBefore(token).length > 0;});
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      category: 'Style guide',
      description: 'Forbid repeated import of the same module in multiple places.',
      url: (0, _docsUrl2['default'])('no-duplicates') },

    fixable: 'code',
    schema: [
    {
      type: 'object',
      properties: {
        considerQueryString: {
          type: 'boolean' },

        'prefer-inline': {
          type: 'boolean' } },


      additionalProperties: false }] },




  create: function () {function create(context) {
      // Prepare the resolver from options.
      var considerQueryStringOption = context.options[0] &&
      context.options[0]['considerQueryString'];
      var defaultResolver = function () {function defaultResolver(sourcePath) {return (0, _resolve2['default'])(sourcePath, context) || sourcePath;}return defaultResolver;}();
      var resolver = considerQueryStringOption ? function (sourcePath) {
        var parts = sourcePath.match(/^([^?]*)\?(.*)$/);
        if (!parts) {
          return defaultResolver(sourcePath);
        }
        return defaultResolver(parts[1]) + '?' + parts[2];
      } : defaultResolver;

      var moduleMaps = new Map();

      function getImportMap(n) {
        if (!moduleMaps.has(n.parent)) {
          moduleMaps.set(n.parent, {
            imported: new Map(),
            nsImported: new Map(),
            defaultTypesImported: new Map(),
            namedTypesImported: new Map() });

        }
        var map = moduleMaps.get(n.parent);
        if (n.importKind === 'type') {
          return n.specifiers.length > 0 && n.specifiers[0].type === 'ImportDefaultSpecifier' ? map.defaultTypesImported : map.namedTypesImported;
        }
        if (n.specifiers.some(function (spec) {return spec.importKind === 'type';})) {
          return map.namedTypesImported;
        }

        return hasNamespace(n) ? map.nsImported : map.imported;
      }

      return {
        ImportDeclaration: function () {function ImportDeclaration(n) {
            // resolved path will cover aliased duplicates
            var resolvedPath = resolver(n.source.value);
            var importMap = getImportMap(n);

            if (importMap.has(resolvedPath)) {
              importMap.get(resolvedPath).push(n);
            } else {
              importMap.set(resolvedPath, [n]);
            }
          }return ImportDeclaration;}(),

        'Program:exit': function () {function ProgramExit() {var _iteratorNormalCompletion5 = true;var _didIteratorError5 = false;var _iteratorError5 = undefined;try {
              for (var _iterator5 = moduleMaps.values()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {var map = _step5.value;
                checkImports(map.imported, context);
                checkImports(map.nsImported, context);
                checkImports(map.defaultTypesImported, context);
                checkImports(map.namedTypesImported, context);
              }} catch (err) {_didIteratorError5 = true;_iteratorError5 = err;} finally {try {if (!_iteratorNormalCompletion5 && _iterator5['return']) {_iterator5['return']();}} finally {if (_didIteratorError5) {throw _iteratorError5;}}}
          }return ProgramExit;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1kdXBsaWNhdGVzLmpzIl0sIm5hbWVzIjpbInR5cGVzY3JpcHRQa2ciLCJyZXF1aXJlIiwiZSIsImNoZWNrSW1wb3J0cyIsImltcG9ydGVkIiwiY29udGV4dCIsImVudHJpZXMiLCJtb2R1bGUiLCJub2RlcyIsImxlbmd0aCIsIm1lc3NhZ2UiLCJmaXJzdCIsInJlc3QiLCJzb3VyY2VDb2RlIiwiZ2V0U291cmNlQ29kZSIsImZpeCIsImdldEZpeCIsInJlcG9ydCIsIm5vZGUiLCJzb3VyY2UiLCJnZXRDb21tZW50c0JlZm9yZSIsInVuZGVmaW5lZCIsImhhc1Byb2JsZW1hdGljQ29tbWVudHMiLCJoYXNOYW1lc3BhY2UiLCJkZWZhdWx0SW1wb3J0TmFtZXMiLCJTZXQiLCJtYXAiLCJnZXREZWZhdWx0SW1wb3J0TmFtZSIsImZpbHRlciIsIkJvb2xlYW4iLCJzaXplIiwicmVzdFdpdGhvdXRDb21tZW50cyIsInNwZWNpZmllcnMiLCJ0b2tlbnMiLCJnZXRUb2tlbnMiLCJvcGVuQnJhY2UiLCJmaW5kIiwiaXNQdW5jdHVhdG9yIiwidG9rZW4iLCJjbG9zZUJyYWNlIiwiaW1wb3J0Tm9kZSIsImlkZW50aWZpZXJzIiwidGV4dCIsInNsaWNlIiwicmFuZ2UiLCJzcGxpdCIsImlzRW1wdHkiLCJoYXNTcGVjaWZpZXJzIiwidW5uZWNlc3NhcnlJbXBvcnRzIiwic29tZSIsInNwZWNpZmllciIsInNob3VsZEFkZERlZmF1bHQiLCJzaG91bGRBZGRTcGVjaWZpZXJzIiwic2hvdWxkUmVtb3ZlVW5uZWNlc3NhcnkiLCJmaXJzdFRva2VuIiwiZ2V0Rmlyc3RUb2tlbiIsImRlZmF1bHRJbXBvcnROYW1lIiwiZmlyc3RIYXNUcmFpbGluZ0NvbW1hIiwiZ2V0VG9rZW5CZWZvcmUiLCJmaXJzdElzRW1wdHkiLCJmaXJzdEV4aXN0aW5nSWRlbnRpZmllcnMiLCJ4IiwidHJpbSIsInJlZHVjZSIsInJlc3VsdCIsIm5lZWRzQ29tbWEiLCJleGlzdGluZ0lkZW50aWZpZXJzIiwiaXNUeXBlU3BlY2lmaWVyIiwiaW1wb3J0S2luZCIsInByZWZlcklubGluZSIsIm9wdGlvbnMiLCJzZW12ZXIiLCJzYXRpc2ZpZXMiLCJ2ZXJzaW9uIiwiRXJyb3IiLCJjdXIiLCJzZXQiLCJ0cmltbWVkIiwiY3VyV2l0aFR5cGUiLCJoYXMiLCJhZGQiLCJzcGVjaWZpZXJUZXh0IiwidXBkYXRlZEV4aXN0aW5nSWRlbnRpZmllcnMiLCJzcGVjaWZpZXJzVGV4dCIsImZpeGVzIiwicHVzaCIsImZpeGVyIiwiaW5zZXJ0VGV4dEFmdGVyIiwiaW5zZXJ0VGV4dEJlZm9yZSIsInJlbW92ZSIsImNoYXJBZnRlckltcG9ydFJhbmdlIiwiY2hhckFmdGVySW1wb3J0Iiwic3Vic3RyaW5nIiwicmVtb3ZlUmFuZ2UiLCJ2YWx1ZSIsInR5cGUiLCJkZWZhdWx0U3BlY2lmaWVyIiwibG9jYWwiLCJuYW1lIiwiaGFzQ29tbWVudEJlZm9yZSIsImhhc0NvbW1lbnRBZnRlciIsImhhc0NvbW1lbnRJbnNpZGVOb25TcGVjaWZpZXJzIiwiY29tbWVudCIsImxvYyIsImVuZCIsImxpbmUiLCJzdGFydCIsImdldENvbW1lbnRzQWZ0ZXIiLCJvcGVuQnJhY2VJbmRleCIsImZpbmRJbmRleCIsImNsb3NlQnJhY2VJbmRleCIsInNvbWVUb2tlbnMiLCJjb25jYXQiLCJleHBvcnRzIiwibWV0YSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwiZml4YWJsZSIsInNjaGVtYSIsInByb3BlcnRpZXMiLCJjb25zaWRlclF1ZXJ5U3RyaW5nIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJjcmVhdGUiLCJjb25zaWRlclF1ZXJ5U3RyaW5nT3B0aW9uIiwiZGVmYXVsdFJlc29sdmVyIiwic291cmNlUGF0aCIsInJlc29sdmVyIiwicGFydHMiLCJtYXRjaCIsIm1vZHVsZU1hcHMiLCJNYXAiLCJnZXRJbXBvcnRNYXAiLCJuIiwicGFyZW50IiwibnNJbXBvcnRlZCIsImRlZmF1bHRUeXBlc0ltcG9ydGVkIiwibmFtZWRUeXBlc0ltcG9ydGVkIiwiZ2V0Iiwic3BlYyIsIkltcG9ydERlY2xhcmF0aW9uIiwicmVzb2x2ZWRQYXRoIiwiaW1wb3J0TWFwIiwidmFsdWVzIl0sIm1hcHBpbmdzIjoicW9CQUFBLHNEO0FBQ0EscUM7QUFDQSxnQzs7QUFFQSxJQUFJQSxzQkFBSjtBQUNBLElBQUk7QUFDRkEsa0JBQWdCQyxRQUFRLHlCQUFSLENBQWhCLENBREUsQ0FDa0Q7QUFDckQsQ0FGRCxDQUVFLE9BQU9DLENBQVAsRUFBVSxDQUFFLElBQU07O0FBRXBCLFNBQVNDLFlBQVQsQ0FBc0JDLFFBQXRCLEVBQWdDQyxPQUFoQyxFQUF5QztBQUN2Qyx5QkFBOEJELFNBQVNFLE9BQVQsRUFBOUIsOEhBQWtELGdFQUF0Q0MsT0FBc0MsZ0JBQTlCQyxLQUE4QjtBQUNoRCxVQUFJQSxNQUFNQyxNQUFOLEdBQWUsQ0FBbkIsRUFBc0I7QUFDcEIsWUFBTUMsd0JBQWNILE9BQWQsaUNBQU4sQ0FEb0I7QUFFS0MsYUFGTCxFQUViRyxLQUZhLGFBRUhDLElBRkc7QUFHcEIsWUFBTUMsYUFBYVIsUUFBUVMsYUFBUixFQUFuQjtBQUNBLFlBQU1DLE1BQU1DLE9BQU9MLEtBQVAsRUFBY0MsSUFBZCxFQUFvQkMsVUFBcEIsRUFBZ0NSLE9BQWhDLENBQVo7O0FBRUFBLGdCQUFRWSxNQUFSLENBQWU7QUFDYkMsZ0JBQU1QLE1BQU1RLE1BREM7QUFFYlQsMEJBRmE7QUFHYkssa0JBSGEsQ0FHUjtBQUhRLFNBQWYsRUFOb0I7O0FBWXBCLGdDQUFtQkgsSUFBbkIsbUlBQXlCLEtBQWRNLElBQWM7QUFDdkJiLG9CQUFRWSxNQUFSLENBQWU7QUFDYkMsb0JBQU1BLEtBQUtDLE1BREU7QUFFYlQsOEJBRmEsRUFBZjs7QUFJRCxXQWpCbUI7QUFrQnJCO0FBQ0YsS0FyQnNDO0FBc0J4Qzs7QUFFRCxTQUFTTSxNQUFULENBQWdCTCxLQUFoQixFQUF1QkMsSUFBdkIsRUFBNkJDLFVBQTdCLEVBQXlDUixPQUF6QyxFQUFrRDtBQUNoRDtB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QWIsQ0FBbEI7O0FBRUEsZ0JBQUlTLFVBQVVoRSxHQUFWLENBQWMrRCxZQUFkLENBQUosRUFBaUM7QUFDL0JDLHdCQUFVSixHQUFWLENBQWNHLFlBQWQsRUFBNEJ6RCxJQUE1QixDQUFpQ2lELENBQWpDO0FBQ0QsYUFGRCxNQUVPO0FBQ0xTLHdCQUFVbkUsR0FBVixDQUFja0UsWUFBZCxFQUE0QixDQUFDUixDQUFELENBQTVCO0FBQ0Q7QUFDRixXQVhJOztBQWFMLHFDQUFnQix1QkFBWTtBQUMxQixvQ0FBa0JILFdBQVdhLE1BQVgsRUFBbEIsbUlBQXVDLEtBQTVCdEgsR0FBNEI7QUFDckN2Qiw2QkFBYXVCLElBQUl0QixRQUFqQixFQUEyQkMsT0FBM0I7QUFDQUYsNkJBQWF1QixJQUFJOEcsVUFBakIsRUFBNkJuSSxPQUE3QjtBQUNBRiw2QkFBYXVCLElBQUkrRyxvQkFBakIsRUFBdUNwSSxPQUF2QztBQUNBRiw2QkFBYXVCLElBQUlnSCxrQkFBakIsRUFBcUNySSxPQUFyQztBQUNELGVBTnlCO0FBTzNCLFdBUEQsc0JBYkssRUFBUDs7QUFzQkQsS0FsRmMsbUJBQWpCIiwiZmlsZSI6Im5vLWR1cGxpY2F0ZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcmVzb2x2ZSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL3Jlc29sdmUnO1xyXG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJztcclxuaW1wb3J0IHNlbXZlciBmcm9tICdzZW12ZXInO1xyXG5cclxubGV0IHR5cGVzY3JpcHRQa2c7XHJcbnRyeSB7XHJcbiAgdHlwZXNjcmlwdFBrZyA9IHJlcXVpcmUoJ3R5cGVzY3JpcHQvcGFja2FnZS5qc29uJyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzXHJcbn0gY2F0Y2ggKGUpIHsgLyoqLyB9XHJcblxyXG5mdW5jdGlvbiBjaGVja0ltcG9ydHMoaW1wb3J0ZWQsIGNvbnRleHQpIHtcclxuICBmb3IgKGNvbnN0IFttb2R1bGUsIG5vZGVzXSBvZiBpbXBvcnRlZC5lbnRyaWVzKCkpIHtcclxuICAgIGlmIChub2Rlcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgJyR7bW9kdWxlfScgaW1wb3J0ZWQgbXVsdGlwbGUgdGltZXMuYDtcclxuICAgICAgY29uc3QgW2ZpcnN0LCAuLi5yZXN0XSA9IG5vZGVzO1xyXG4gICAgICBjb25zdCBzb3VyY2VDb2RlID0gY29udGV4dC5nZXRTb3VyY2VDb2RlKCk7XHJcbiAgICAgIGNvbnN0IGZpeCA9IGdldEZpeChmaXJzdCwgcmVzdCwgc291cmNlQ29kZSwgY29udGV4dCk7XHJcblxyXG4gICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgbm9kZTogZmlyc3Quc291cmNlLFxyXG4gICAgICAgIG1lc3NhZ2UsXHJcbiAgICAgICAgZml4LCAvLyBBdHRhY2ggdGhlIGF1dG9maXggKGlmIGFueSkgdG8gdGhlIGZpcnN0IGltcG9ydC5cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgcmVzdCkge1xyXG4gICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgIG5vZGU6IG5vZGUuc291cmNlLFxyXG4gICAgICAgICAgbWVzc2FnZSxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Rml4KGZpcnN0LCByZXN0LCBzb3VyY2VDb2RlLCBjb250ZXh0KSB7XHJcbiAgLy8gU29ycnkgRVNMaW50IDw9IDMgdXNlcnMsIG5vIGF1dG9maXggZm9yIHlvdS4gQXV0b2ZpeGluZyBkdXBsaWNhdGUgaW1wb3J0c1xyXG4gIC8vIHJlcXVpcmVzIG11bHRpcGxlIGBmaXhlci53aGF0ZXZlcigpYCBjYWxscyBpbiB0aGUgYGZpeGA6IFdlIGJvdGggbmVlZCB0b1xyXG4gIC8vIHVwZGF0ZSB0aGUgZmlyc3Qgb25lLCBhbmQgcmVtb3ZlIHRoZSByZXN0LiBTdXBwb3J0IGZvciBtdWx0aXBsZVxyXG4gIC8vIGBmaXhlci53aGF0ZXZlcigpYCBpbiBhIHNpbmdsZSBgZml4YCB3YXMgYWRkZWQgaW4gRVNMaW50IDQuMS5cclxuICAvLyBgc291cmNlQ29kZS5nZXRDb21tZW50c0JlZm9yZWAgd2FzIGFkZGVkIGluIDQuMCwgc28gdGhhdCdzIGFuIGVhc3kgdGhpbmcgdG9cclxuICAvLyBjaGVjayBmb3IuXHJcbiAgaWYgKHR5cGVvZiBzb3VyY2VDb2RlLmdldENvbW1lbnRzQmVmb3JlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgLy8gQWRqdXN0aW5nIHRoZSBmaXJzdCBpbXBvcnQgbWlnaHQgbWFrZSBpdCBtdWx0aWxpbmUsIHdoaWNoIGNvdWxkIGJyZWFrXHJcbiAgLy8gYGVzbGludC1kaXNhYmxlLW5leHQtbGluZWAgY29tbWVudHMgYW5kIHNpbWlsYXIsIHNvIGJhaWwgaWYgdGhlIGZpcnN0XHJcbiAgLy8gaW1wb3J0IGhhcyBjb21tZW50cy4gQWxzbywgaWYgdGhlIGZpcnN0IGltcG9ydCBpcyBgaW1wb3J0ICogYXMgbnMgZnJvbVxyXG4gIC8vICcuL2ZvbydgIHRoZXJlJ3Mgbm90aGluZyB3ZSBjYW4gZG8uXHJcbiAgaWYgKGhhc1Byb2JsZW1hdGljQ29tbWVudHMoZmlyc3QsIHNvdXJjZUNvZGUpIHx8IGhhc05hbWVzcGFjZShmaXJzdCkpIHtcclxuICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgfVxyXG5cclxuICBjb25zdCBkZWZhdWx0SW1wb3J0TmFtZXMgPSBuZXcgU2V0KFxyXG4gICAgW2ZpcnN0LCAuLi5yZXN0XS5tYXAoZ2V0RGVmYXVsdEltcG9ydE5hbWUpLmZpbHRlcihCb29sZWFuKSxcclxuICApO1xyXG5cclxuICAvLyBCYWlsIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBkaWZmZXJlbnQgZGVmYXVsdCBpbXBvcnQgbmFtZXMg4oCTIGl0J3MgdXAgdG8gdGhlXHJcbiAgLy8gdXNlciB0byBjaG9vc2Ugd2hpY2ggb25lIHRvIGtlZXAuXHJcbiAgaWYgKGRlZmF1bHRJbXBvcnROYW1lcy5zaXplID4gMSkge1xyXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICB9XHJcblxyXG4gIC8vIExlYXZlIGl0IHRvIHRoZSB1c2VyIHRvIGhhbmRsZSBjb21tZW50cy4gQWxzbyBza2lwIGBpbXBvcnQgKiBhcyBucyBmcm9tXHJcbiAgLy8gJy4vZm9vJ2AgaW1wb3J0cywgc2luY2UgdGhleSBjYW5ub3QgYmUgbWVyZ2VkIGludG8gYW5vdGhlciBpbXBvcnQuXHJcbiAgY29uc3QgcmVzdFdpdGhvdXRDb21tZW50cyA9IHJlc3QuZmlsdGVyKG5vZGUgPT4gIShcclxuICAgIGhhc1Byb2JsZW1hdGljQ29tbWVudHMobm9kZSwgc291cmNlQ29kZSkgfHxcclxuICAgIGhhc05hbWVzcGFjZShub2RlKVxyXG4gICkpO1xyXG5cclxuICBjb25zdCBzcGVjaWZpZXJzID0gcmVzdFdpdGhvdXRDb21tZW50c1xyXG4gICAgLm1hcChub2RlID0+IHtcclxuICAgICAgY29uc3QgdG9rZW5zID0gc291cmNlQ29kZS5nZXRUb2tlbnMobm9kZSk7XHJcbiAgICAgIGNvbnN0IG9wZW5CcmFjZSA9IHRva2Vucy5maW5kKHRva2VuID0+IGlzUHVuY3R1YXRvcih0b2tlbiwgJ3snKSk7XHJcbiAgICAgIGNvbnN0IGNsb3NlQnJhY2UgPSB0b2tlbnMuZmluZCh0b2tlbiA9PiBpc1B1bmN0dWF0b3IodG9rZW4sICd9JykpO1xyXG5cclxuICAgICAgaWYgKG9wZW5CcmFjZSA9PSBudWxsIHx8IGNsb3NlQnJhY2UgPT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgaW1wb3J0Tm9kZTogbm9kZSxcclxuICAgICAgICBpZGVudGlmaWVyczogc291cmNlQ29kZS50ZXh0LnNsaWNlKG9wZW5CcmFjZS5yYW5nZVsxXSwgY2xvc2VCcmFjZS5yYW5nZVswXSkuc3BsaXQoJywnKSwgLy8gU3BsaXQgdGhlIHRleHQgaW50byBzZXBhcmF0ZSBpZGVudGlmaWVycyAocmV0YWluaW5nIGFueSB3aGl0ZXNwYWNlIGJlZm9yZSBvciBhZnRlcilcclxuICAgICAgICBpc0VtcHR5OiAhaGFzU3BlY2lmaWVycyhub2RlKSxcclxuICAgICAgfTtcclxuICAgIH0pXHJcbiAgICAuZmlsdGVyKEJvb2xlYW4pO1xyXG5cclxuICBjb25zdCB1bm5lY2Vzc2FyeUltcG9ydHMgPSByZXN0V2l0aG91dENvbW1lbnRzLmZpbHRlcihub2RlID0+XHJcbiAgICAhaGFzU3BlY2lmaWVycyhub2RlKSAmJlxyXG4gICAgIWhhc05hbWVzcGFjZShub2RlKSAmJlxyXG4gICAgIXNwZWNpZmllcnMuc29tZShzcGVjaWZpZXIgPT4gc3BlY2lmaWVyLmltcG9ydE5vZGUgPT09IG5vZGUpLFxyXG4gICk7XHJcblxyXG4gIGNvbnN0IHNob3VsZEFkZERlZmF1bHQgPSBnZXREZWZhdWx0SW1wb3J0TmFtZShmaXJzdCkgPT0gbnVsbCAmJiBkZWZhdWx0SW1wb3J0TmFtZXMuc2l6ZSA9PT0gMTtcclxuICBjb25zdCBzaG91bGRBZGRTcGVjaWZpZXJzID0gc3BlY2lmaWVycy5sZW5ndGggPiAwO1xyXG4gIGNvbnN0IHNob3VsZFJlbW92ZVVubmVjZXNzYXJ5ID0gdW5uZWNlc3NhcnlJbXBvcnRzLmxlbmd0aCA+IDA7XHJcblxyXG4gIGlmICghKHNob3VsZEFkZERlZmF1bHQgfHwgc2hvdWxkQWRkU3BlY2lmaWVycyB8fCBzaG91bGRSZW1vdmVVbm5lY2Vzc2FyeSkpIHtcclxuICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZml4ZXIgPT4ge1xyXG4gICAgY29uc3QgdG9rZW5zID0gc291cmNlQ29kZS5nZXRUb2tlbnMoZmlyc3QpO1xyXG4gICAgY29uc3Qgb3BlbkJyYWNlID0gdG9rZW5zLmZpbmQodG9rZW4gPT4gaXNQdW5jdHVhdG9yKHRva2VuLCAneycpKTtcclxuICAgIGNvbnN0IGNsb3NlQnJhY2UgPSB0b2tlbnMuZmluZCh0b2tlbiA9PiBpc1B1bmN0dWF0b3IodG9rZW4sICd9JykpO1xyXG4gICAgY29uc3QgZmlyc3RUb2tlbiA9IHNvdXJjZUNvZGUuZ2V0Rmlyc3RUb2tlbihmaXJzdCk7XHJcbiAgICBjb25zdCBbZGVmYXVsdEltcG9ydE5hbWVdID0gZGVmYXVsdEltcG9ydE5hbWVzO1xyXG5cclxuICAgIGNvbnN0IGZpcnN0SGFzVHJhaWxpbmdDb21tYSA9XHJcbiAgICAgIGNsb3NlQnJhY2UgIT0gbnVsbCAmJlxyXG4gICAgICBpc1B1bmN0dWF0b3Ioc291cmNlQ29kZS5nZXRUb2tlbkJlZm9yZShjbG9zZUJyYWNlKSwgJywnKTtcclxuICAgIGNvbnN0IGZpcnN0SXNFbXB0eSA9ICFoYXNTcGVjaWZpZXJzKGZpcnN0KTtcclxuICAgIGNvbnN0IGZpcnN0RXhpc3RpbmdJZGVudGlmaWVycyA9IGZpcnN0SXNFbXB0eVxyXG4gICAgICA/IG5ldyBTZXQoKVxyXG4gICAgICA6IG5ldyBTZXQoc291cmNlQ29kZS50ZXh0LnNsaWNlKG9wZW5CcmFjZS5yYW5nZVsxXSwgY2xvc2VCcmFjZS5yYW5nZVswXSlcclxuICAgICAgICAuc3BsaXQoJywnKVxyXG4gICAgICAgIC5tYXAoKHgpID0+IHgudHJpbSgpKSxcclxuICAgICAgKTtcclxuXHJcbiAgICBjb25zdCBbc3BlY2lmaWVyc1RleHRdID0gc3BlY2lmaWVycy5yZWR1Y2UoXHJcbiAgICAgIChbcmVzdWx0LCBuZWVkc0NvbW1hLCBleGlzdGluZ0lkZW50aWZpZXJzXSwgc3BlY2lmaWVyKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaXNUeXBlU3BlY2lmaWVyID0gc3BlY2lmaWVyLmltcG9ydE5vZGUuaW1wb3J0S2luZCA9PT0gJ3R5cGUnO1xyXG5cclxuICAgICAgICBjb25zdCBwcmVmZXJJbmxpbmUgPSBjb250ZXh0Lm9wdGlvbnNbMF0gJiYgY29udGV4dC5vcHRpb25zWzBdWydwcmVmZXItaW5saW5lJ107XHJcbiAgICAgICAgLy8gYSB1c2VyIG1pZ2h0IHNldCBwcmVmZXItaW5saW5lIGJ1dCBub3QgaGF2ZSBhIHN1cHBvcnRpbmcgVHlwZVNjcmlwdCB2ZXJzaW9uLiAgRmxvdyBkb2VzIG5vdCBzdXBwb3J0IGlubGluZSB0eXBlcyBzbyB0aGlzIHNob3VsZCBmYWlsIGluIHRoYXQgY2FzZSBhcyB3ZWxsLlxyXG4gICAgICAgIGlmIChwcmVmZXJJbmxpbmUgJiYgKCF0eXBlc2NyaXB0UGtnIHx8ICFzZW12ZXIuc2F0aXNmaWVzKHR5cGVzY3JpcHRQa2cudmVyc2lvbiwgJz49IDQuNScpKSkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3VyIHZlcnNpb24gb2YgVHlwZVNjcmlwdCBkb2VzIG5vdCBzdXBwb3J0IGlubGluZSB0eXBlIGltcG9ydHMuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBZGQgKm9ubHkqIHRoZSBuZXcgaWRlbnRpZmllcnMgdGhhdCBkb24ndCBhbHJlYWR5IGV4aXN0LCBhbmQgdHJhY2sgYW55IG5ldyBpZGVudGlmaWVycyBzbyB3ZSBkb24ndCBhZGQgdGhlbSBhZ2FpbiBpbiB0aGUgbmV4dCBsb29wXHJcbiAgICAgICAgY29uc3QgW3NwZWNpZmllclRleHQsIHVwZGF0ZWRFeGlzdGluZ0lkZW50aWZpZXJzXSA9IHNwZWNpZmllci5pZGVudGlmaWVycy5yZWR1Y2UoKFt0ZXh0LCBzZXRdLCBjdXIpID0+IHtcclxuICAgICAgICAgIGNvbnN0IHRyaW1tZWQgPSBjdXIudHJpbSgpOyAvLyBUcmltIHdoaXRlc3BhY2UgYmVmb3JlL2FmdGVyIHRvIGNvbXBhcmUgdG8gb3VyIHNldCBvZiBleGlzdGluZyBpZGVudGlmaWVyc1xyXG4gICAgICAgICAgY29uc3QgY3VyV2l0aFR5cGUgPSB0cmltbWVkLmxlbmd0aCA+IDAgJiYgcHJlZmVySW5saW5lICYmIGlzVHlwZVNwZWNpZmllciA/IGB0eXBlICR7Y3VyfWAgOiBjdXI7XHJcbiAgICAgICAgICBpZiAoZXhpc3RpbmdJZGVudGlmaWVycy5oYXModHJpbW1lZCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFt0ZXh0LCBzZXRdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIFt0ZXh0Lmxlbmd0aCA+IDAgPyBgJHt0ZXh0fSwke2N1cldpdGhUeXBlfWAgOiBjdXJXaXRoVHlwZSwgc2V0LmFkZCh0cmltbWVkKV07XHJcbiAgICAgICAgfSwgWycnLCBleGlzdGluZ0lkZW50aWZpZXJzXSk7XHJcblxyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICBuZWVkc0NvbW1hICYmICFzcGVjaWZpZXIuaXNFbXB0eSAmJiBzcGVjaWZpZXJUZXh0Lmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgPyBgJHtyZXN1bHR9LCR7c3BlY2lmaWVyVGV4dH1gXHJcbiAgICAgICAgICAgIDogYCR7cmVzdWx0fSR7c3BlY2lmaWVyVGV4dH1gLFxyXG4gICAgICAgICAgc3BlY2lmaWVyLmlzRW1wdHkgPyBuZWVkc0NvbW1hIDogdHJ1ZSxcclxuICAgICAgICAgIHVwZGF0ZWRFeGlzdGluZ0lkZW50aWZpZXJzLFxyXG4gICAgICAgIF07XHJcbiAgICAgIH0sXHJcbiAgICAgIFsnJywgIWZpcnN0SGFzVHJhaWxpbmdDb21tYSAmJiAhZmlyc3RJc0VtcHR5LCBmaXJzdEV4aXN0aW5nSWRlbnRpZmllcnNdLFxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBmaXhlcyA9IFtdO1xyXG5cclxuICAgIGlmIChzaG91bGRBZGREZWZhdWx0ICYmIG9wZW5CcmFjZSA9PSBudWxsICYmIHNob3VsZEFkZFNwZWNpZmllcnMpIHtcclxuICAgICAgLy8gYGltcG9ydCAnLi9mb28nYCDihpIgYGltcG9ydCBkZWYsIHsuLi59IGZyb20gJy4vZm9vJ2BcclxuICAgICAgZml4ZXMucHVzaChcclxuICAgICAgICBmaXhlci5pbnNlcnRUZXh0QWZ0ZXIoZmlyc3RUb2tlbiwgYCAke2RlZmF1bHRJbXBvcnROYW1lfSwgeyR7c3BlY2lmaWVyc1RleHR9fSBmcm9tYCksXHJcbiAgICAgICk7XHJcbiAgICB9IGVsc2UgaWYgKHNob3VsZEFkZERlZmF1bHQgJiYgb3BlbkJyYWNlID09IG51bGwgJiYgIXNob3VsZEFkZFNwZWNpZmllcnMpIHtcclxuICAgICAgLy8gYGltcG9ydCAnLi9mb28nYCDihpIgYGltcG9ydCBkZWYgZnJvbSAnLi9mb28nYFxyXG4gICAgICBmaXhlcy5wdXNoKGZpeGVyLmluc2VydFRleHRBZnRlcihmaXJzdFRva2VuLCBgICR7ZGVmYXVsdEltcG9ydE5hbWV9IGZyb21gKSk7XHJcbiAgICB9IGVsc2UgaWYgKHNob3VsZEFkZERlZmF1bHQgJiYgb3BlbkJyYWNlICE9IG51bGwgJiYgY2xvc2VCcmFjZSAhPSBudWxsKSB7XHJcbiAgICAgIC8vIGBpbXBvcnQgey4uLn0gZnJvbSAnLi9mb28nYCDihpIgYGltcG9ydCBkZWYsIHsuLi59IGZyb20gJy4vZm9vJ2BcclxuICAgICAgZml4ZXMucHVzaChmaXhlci5pbnNlcnRUZXh0QWZ0ZXIoZmlyc3RUb2tlbiwgYCAke2RlZmF1bHRJbXBvcnROYW1lfSxgKSk7XHJcbiAgICAgIGlmIChzaG91bGRBZGRTcGVjaWZpZXJzKSB7XHJcbiAgICAgICAgLy8gYGltcG9ydCBkZWYsIHsuLi59IGZyb20gJy4vZm9vJ2Ag4oaSIGBpbXBvcnQgZGVmLCB7Li4uLCAuLi59IGZyb20gJy4vZm9vJ2BcclxuICAgICAgICBmaXhlcy5wdXNoKGZpeGVyLmluc2VydFRleHRCZWZvcmUoY2xvc2VCcmFjZSwgc3BlY2lmaWVyc1RleHQpKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICghc2hvdWxkQWRkRGVmYXVsdCAmJiBvcGVuQnJhY2UgPT0gbnVsbCAmJiBzaG91bGRBZGRTcGVjaWZpZXJzKSB7XHJcbiAgICAgIGlmIChmaXJzdC5zcGVjaWZpZXJzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIC8vIGBpbXBvcnQgJy4vZm9vJ2Ag4oaSIGBpbXBvcnQgey4uLn0gZnJvbSAnLi9mb28nYFxyXG4gICAgICAgIGZpeGVzLnB1c2goZml4ZXIuaW5zZXJ0VGV4dEFmdGVyKGZpcnN0VG9rZW4sIGAgeyR7c3BlY2lmaWVyc1RleHR9fSBmcm9tYCkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGBpbXBvcnQgZGVmIGZyb20gJy4vZm9vJ2Ag4oaSIGBpbXBvcnQgZGVmLCB7Li4ufSBmcm9tICcuL2ZvbydgXHJcbiAgICAgICAgZml4ZXMucHVzaChmaXhlci5pbnNlcnRUZXh0QWZ0ZXIoZmlyc3Quc3BlY2lmaWVyc1swXSwgYCwgeyR7c3BlY2lmaWVyc1RleHR9fWApKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICghc2hvdWxkQWRkRGVmYXVsdCAmJiBvcGVuQnJhY2UgIT0gbnVsbCAmJiBjbG9zZUJyYWNlICE9IG51bGwpIHtcclxuICAgICAgLy8gYGltcG9ydCB7Li4ufSAnLi9mb28nYCDihpIgYGltcG9ydCB7Li4uLCAuLi59IGZyb20gJy4vZm9vJ2BcclxuICAgICAgZml4ZXMucHVzaChmaXhlci5pbnNlcnRUZXh0QmVmb3JlKGNsb3NlQnJhY2UsIHNwZWNpZmllcnNUZXh0KSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVtb3ZlIGltcG9ydHMgd2hvc2Ugc3BlY2lmaWVycyBoYXZlIGJlZW4gbW92ZWQgaW50byB0aGUgZmlyc3QgaW1wb3J0LlxyXG4gICAgZm9yIChjb25zdCBzcGVjaWZpZXIgb2Ygc3BlY2lmaWVycykge1xyXG4gICAgICBjb25zdCBpbXBvcnROb2RlID0gc3BlY2lmaWVyLmltcG9ydE5vZGU7XHJcbiAgICAgIGZpeGVzLnB1c2goZml4ZXIucmVtb3ZlKGltcG9ydE5vZGUpKTtcclxuXHJcbiAgICAgIGNvbnN0IGNoYXJBZnRlckltcG9ydFJhbmdlID0gW2ltcG9ydE5vZGUucmFuZ2VbMV0sIGltcG9ydE5vZGUucmFuZ2VbMV0gKyAxXTtcclxuICAgICAgY29uc3QgY2hhckFmdGVySW1wb3J0ID0gc291cmNlQ29kZS50ZXh0LnN1YnN0cmluZyhjaGFyQWZ0ZXJJbXBvcnRSYW5nZVswXSwgY2hhckFmdGVySW1wb3J0UmFuZ2VbMV0pO1xyXG4gICAgICBpZiAoY2hhckFmdGVySW1wb3J0ID09PSAnXFxuJykge1xyXG4gICAgICAgIGZpeGVzLnB1c2goZml4ZXIucmVtb3ZlUmFuZ2UoY2hhckFmdGVySW1wb3J0UmFuZ2UpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbW92ZSBpbXBvcnRzIHdob3NlIGRlZmF1bHQgaW1wb3J0IGhhcyBiZWVuIG1vdmVkIHRvIHRoZSBmaXJzdCBpbXBvcnQsXHJcbiAgICAvLyBhbmQgc2lkZS1lZmZlY3Qtb25seSBpbXBvcnRzIHRoYXQgYXJlIHVubmVjZXNzYXJ5IGR1ZSB0byB0aGUgZmlyc3RcclxuICAgIC8vIGltcG9ydC5cclxuICAgIGZvciAoY29uc3Qgbm9kZSBvZiB1bm5lY2Vzc2FyeUltcG9ydHMpIHtcclxuICAgICAgZml4ZXMucHVzaChmaXhlci5yZW1vdmUobm9kZSkpO1xyXG5cclxuICAgICAgY29uc3QgY2hhckFmdGVySW1wb3J0UmFuZ2UgPSBbbm9kZS5yYW5nZVsxXSwgbm9kZS5yYW5nZVsxXSArIDFdO1xyXG4gICAgICBjb25zdCBjaGFyQWZ0ZXJJbXBvcnQgPSBzb3VyY2VDb2RlLnRleHQuc3Vic3RyaW5nKGNoYXJBZnRlckltcG9ydFJhbmdlWzBdLCBjaGFyQWZ0ZXJJbXBvcnRSYW5nZVsxXSk7XHJcbiAgICAgIGlmIChjaGFyQWZ0ZXJJbXBvcnQgPT09ICdcXG4nKSB7XHJcbiAgICAgICAgZml4ZXMucHVzaChmaXhlci5yZW1vdmVSYW5nZShjaGFyQWZ0ZXJJbXBvcnRSYW5nZSkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZpeGVzO1xyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzUHVuY3R1YXRvcihub2RlLCB2YWx1ZSkge1xyXG4gIHJldHVybiBub2RlLnR5cGUgPT09ICdQdW5jdHVhdG9yJyAmJiBub2RlLnZhbHVlID09PSB2YWx1ZTtcclxufVxyXG5cclxuLy8gR2V0IHRoZSBuYW1lIG9mIHRoZSBkZWZhdWx0IGltcG9ydCBvZiBgbm9kZWAsIGlmIGFueS5cclxuZnVuY3Rpb24gZ2V0RGVmYXVsdEltcG9ydE5hbWUobm9kZSkge1xyXG4gIGNvbnN0IGRlZmF1bHRTcGVjaWZpZXIgPSBub2RlLnNwZWNpZmllcnNcclxuICAgIC5maW5kKHNwZWNpZmllciA9PiBzcGVjaWZpZXIudHlwZSA9PT0gJ0ltcG9ydERlZmF1bHRTcGVjaWZpZXInKTtcclxuICByZXR1cm4gZGVmYXVsdFNwZWNpZmllciAhPSBudWxsID8gZGVmYXVsdFNwZWNpZmllci5sb2NhbC5uYW1lIDogdW5kZWZpbmVkO1xyXG59XHJcblxyXG4vLyBDaGVja3Mgd2hldGhlciBgbm9kZWAgaGFzIGEgbmFtZXNwYWNlIGltcG9ydC5cclxuZnVuY3Rpb24gaGFzTmFtZXNwYWNlKG5vZGUpIHtcclxuICBjb25zdCBzcGVjaWZpZXJzID0gbm9kZS5zcGVjaWZpZXJzXHJcbiAgICAuZmlsdGVyKHNwZWNpZmllciA9PiBzcGVjaWZpZXIudHlwZSA9PT0gJ0ltcG9ydE5hbWVzcGFjZVNwZWNpZmllcicpO1xyXG4gIHJldHVybiBzcGVjaWZpZXJzLmxlbmd0aCA+IDA7XHJcbn1cclxuXHJcbi8vIENoZWNrcyB3aGV0aGVyIGBub2RlYCBoYXMgYW55IG5vbi1kZWZhdWx0IHNwZWNpZmllcnMuXHJcbmZ1bmN0aW9uIGhhc1NwZWNpZmllcnMobm9kZSkge1xyXG4gIGNvbnN0IHNwZWNpZmllcnMgPSBub2RlLnNwZWNpZmllcnNcclxuICAgIC5maWx0ZXIoc3BlY2lmaWVyID0+IHNwZWNpZmllci50eXBlID09PSAnSW1wb3J0U3BlY2lmaWVyJyk7XHJcbiAgcmV0dXJuIHNwZWNpZmllcnMubGVuZ3RoID4gMDtcclxufVxyXG5cclxuLy8gSXQncyBub3Qgb2J2aW91cyB3aGF0IHRoZSB1c2VyIHdhbnRzIHRvIGRvIHdpdGggY29tbWVudHMgYXNzb2NpYXRlZCB3aXRoXHJcbi8vIGR1cGxpY2F0ZSBpbXBvcnRzLCBzbyBza2lwIGltcG9ydHMgd2l0aCBjb21tZW50cyB3aGVuIGF1dG9maXhpbmcuXHJcbmZ1bmN0aW9uIGhhc1Byb2JsZW1hdGljQ29tbWVudHMobm9kZSwgc291cmNlQ29kZSkge1xyXG4gIHJldHVybiAoXHJcbiAgICBoYXNDb21tZW50QmVmb3JlKG5vZGUsIHNvdXJjZUNvZGUpIHx8XHJcbiAgICBoYXNDb21tZW50QWZ0ZXIobm9kZSwgc291cmNlQ29kZSkgfHxcclxuICAgIGhhc0NvbW1lbnRJbnNpZGVOb25TcGVjaWZpZXJzKG5vZGUsIHNvdXJjZUNvZGUpXHJcbiAgKTtcclxufVxyXG5cclxuLy8gQ2hlY2tzIHdoZXRoZXIgYG5vZGVgIGhhcyBhIGNvbW1lbnQgKHRoYXQgZW5kcykgb24gdGhlIHByZXZpb3VzIGxpbmUgb3Igb25cclxuLy8gdGhlIHNhbWUgbGluZSBhcyBgbm9kZWAgKHN0YXJ0cykuXHJcbmZ1bmN0aW9uIGhhc0NvbW1lbnRCZWZvcmUobm9kZSwgc291cmNlQ29kZSkge1xyXG4gIHJldHVybiBzb3VyY2VDb2RlLmdldENvbW1lbnRzQmVmb3JlKG5vZGUpXHJcbiAgICAuc29tZShjb21tZW50ID0+IGNvbW1lbnQubG9jLmVuZC5saW5lID49IG5vZGUubG9jLnN0YXJ0LmxpbmUgLSAxKTtcclxufVxyXG5cclxuLy8gQ2hlY2tzIHdoZXRoZXIgYG5vZGVgIGhhcyBhIGNvbW1lbnQgKHRoYXQgc3RhcnRzKSBvbiB0aGUgc2FtZSBsaW5lIGFzIGBub2RlYFxyXG4vLyAoZW5kcykuXHJcbmZ1bmN0aW9uIGhhc0NvbW1lbnRBZnRlcihub2RlLCBzb3VyY2VDb2RlKSB7XHJcbiAgcmV0dXJuIHNvdXJjZUNvZGUuZ2V0Q29tbWVudHNBZnRlcihub2RlKVxyXG4gICAgLnNvbWUoY29tbWVudCA9PiBjb21tZW50LmxvYy5zdGFydC5saW5lID09PSBub2RlLmxvYy5lbmQubGluZSk7XHJcbn1cclxuXHJcbi8vIENoZWNrcyB3aGV0aGVyIGBub2RlYCBoYXMgYW55IGNvbW1lbnRzIF9pbnNpZGUsXyBleGNlcHQgaW5zaWRlIHRoZSBgey4uLn1gXHJcbi8vIHBhcnQgKGlmIGFueSkuXHJcbmZ1bmN0aW9uIGhhc0NvbW1lbnRJbnNpZGVOb25TcGVjaWZpZXJzKG5vZGUsIHNvdXJjZUNvZGUpIHtcclxuICBjb25zdCB0b2tlbnMgPSBzb3VyY2VDb2RlLmdldFRva2Vucyhub2RlKTtcclxuICBjb25zdCBvcGVuQnJhY2VJbmRleCA9IHRva2Vucy5maW5kSW5kZXgodG9rZW4gPT4gaXNQdW5jdHVhdG9yKHRva2VuLCAneycpKTtcclxuICBjb25zdCBjbG9zZUJyYWNlSW5kZXggPSB0b2tlbnMuZmluZEluZGV4KHRva2VuID0+IGlzUHVuY3R1YXRvcih0b2tlbiwgJ30nKSk7XHJcbiAgLy8gU2xpY2UgYXdheSB0aGUgZmlyc3QgdG9rZW4sIHNpbmNlIHdlJ3JlIG5vIGxvb2tpbmcgZm9yIGNvbW1lbnRzIF9iZWZvcmVfXHJcbiAgLy8gYG5vZGVgIChvbmx5IGluc2lkZSkuIElmIHRoZXJlJ3MgYSBgey4uLn1gIHBhcnQsIGxvb2sgZm9yIGNvbW1lbnRzIGJlZm9yZVxyXG4gIC8vIHRoZSBge2AsIGJ1dCBub3QgYmVmb3JlIHRoZSBgfWAgKGhlbmNlIHRoZSBgKzFgcykuXHJcbiAgY29uc3Qgc29tZVRva2VucyA9IG9wZW5CcmFjZUluZGV4ID49IDAgJiYgY2xvc2VCcmFjZUluZGV4ID49IDBcclxuICAgID8gdG9rZW5zLnNsaWNlKDEsIG9wZW5CcmFjZUluZGV4ICsgMSkuY29uY2F0KHRva2Vucy5zbGljZShjbG9zZUJyYWNlSW5kZXggKyAxKSlcclxuICAgIDogdG9rZW5zLnNsaWNlKDEpO1xyXG4gIHJldHVybiBzb21lVG9rZW5zLnNvbWUodG9rZW4gPT4gc291cmNlQ29kZS5nZXRDb21tZW50c0JlZm9yZSh0b2tlbikubGVuZ3RoID4gMCk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdwcm9ibGVtJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgY2F0ZWdvcnk6ICdTdHlsZSBndWlkZScsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnRm9yYmlkIHJlcGVhdGVkIGltcG9ydCBvZiB0aGUgc2FtZSBtb2R1bGUgaW4gbXVsdGlwbGUgcGxhY2VzLicsXHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8tZHVwbGljYXRlcycpLFxyXG4gICAgfSxcclxuICAgIGZpeGFibGU6ICdjb2RlJyxcclxuICAgIHNjaGVtYTogW1xyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgY29uc2lkZXJRdWVyeVN0cmluZzoge1xyXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgJ3ByZWZlci1pbmxpbmUnOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZShjb250ZXh0KSB7XHJcbiAgICAvLyBQcmVwYXJlIHRoZSByZXNvbHZlciBmcm9tIG9wdGlvbnMuXHJcbiAgICBjb25zdCBjb25zaWRlclF1ZXJ5U3RyaW5nT3B0aW9uID0gY29udGV4dC5vcHRpb25zWzBdICYmXHJcbiAgICAgIGNvbnRleHQub3B0aW9uc1swXVsnY29uc2lkZXJRdWVyeVN0cmluZyddO1xyXG4gICAgY29uc3QgZGVmYXVsdFJlc29sdmVyID0gc291cmNlUGF0aCA9PiByZXNvbHZlKHNvdXJjZVBhdGgsIGNvbnRleHQpIHx8IHNvdXJjZVBhdGg7XHJcbiAgICBjb25zdCByZXNvbHZlciA9IGNvbnNpZGVyUXVlcnlTdHJpbmdPcHRpb24gPyAoc291cmNlUGF0aCA9PiB7XHJcbiAgICAgIGNvbnN0IHBhcnRzID0gc291cmNlUGF0aC5tYXRjaCgvXihbXj9dKilcXD8oLiopJC8pO1xyXG4gICAgICBpZiAoIXBhcnRzKSB7XHJcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRSZXNvbHZlcihzb3VyY2VQYXRoKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZGVmYXVsdFJlc29sdmVyKHBhcnRzWzFdKSArICc/JyArIHBhcnRzWzJdO1xyXG4gICAgfSkgOiBkZWZhdWx0UmVzb2x2ZXI7XHJcblxyXG4gICAgY29uc3QgbW9kdWxlTWFwcyA9IG5ldyBNYXAoKTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRJbXBvcnRNYXAobikge1xyXG4gICAgICBpZiAoIW1vZHVsZU1hcHMuaGFzKG4ucGFyZW50KSkge1xyXG4gICAgICAgIG1vZHVsZU1hcHMuc2V0KG4ucGFyZW50LCB7XHJcbiAgICAgICAgICBpbXBvcnRlZDogbmV3IE1hcCgpLFxyXG4gICAgICAgICAgbnNJbXBvcnRlZDogbmV3IE1hcCgpLFxyXG4gICAgICAgICAgZGVmYXVsdFR5cGVzSW1wb3J0ZWQ6IG5ldyBNYXAoKSxcclxuICAgICAgICAgIG5hbWVkVHlwZXNJbXBvcnRlZDogbmV3IE1hcCgpLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IG1hcCA9IG1vZHVsZU1hcHMuZ2V0KG4ucGFyZW50KTtcclxuICAgICAgaWYgKG4uaW1wb3J0S2luZCA9PT0gJ3R5cGUnKSB7XHJcbiAgICAgICAgcmV0dXJuIG4uc3BlY2lmaWVycy5sZW5ndGggPiAwICYmIG4uc3BlY2lmaWVyc1swXS50eXBlID09PSAnSW1wb3J0RGVmYXVsdFNwZWNpZmllcicgPyBtYXAuZGVmYXVsdFR5cGVzSW1wb3J0ZWQgOiBtYXAubmFtZWRUeXBlc0ltcG9ydGVkO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChuLnNwZWNpZmllcnMuc29tZSgoc3BlYykgPT4gc3BlYy5pbXBvcnRLaW5kID09PSAndHlwZScpKSB7XHJcbiAgICAgICAgcmV0dXJuIG1hcC5uYW1lZFR5cGVzSW1wb3J0ZWQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBoYXNOYW1lc3BhY2UobikgPyBtYXAubnNJbXBvcnRlZCA6IG1hcC5pbXBvcnRlZDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBJbXBvcnREZWNsYXJhdGlvbihuKSB7XHJcbiAgICAgICAgLy8gcmVzb2x2ZWQgcGF0aCB3aWxsIGNvdmVyIGFsaWFzZWQgZHVwbGljYXRlc1xyXG4gICAgICAgIGNvbnN0IHJlc29sdmVkUGF0aCA9IHJlc29sdmVyKG4uc291cmNlLnZhbHVlKTtcclxuICAgICAgICBjb25zdCBpbXBvcnRNYXAgPSBnZXRJbXBvcnRNYXAobik7XHJcblxyXG4gICAgICAgIGlmIChpbXBvcnRNYXAuaGFzKHJlc29sdmVkUGF0aCkpIHtcclxuICAgICAgICAgIGltcG9ydE1hcC5nZXQocmVzb2x2ZWRQYXRoKS5wdXNoKG4pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpbXBvcnRNYXAuc2V0KHJlc29sdmVkUGF0aCwgW25dKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAnUHJvZ3JhbTpleGl0JzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZvciAoY29uc3QgbWFwIG9mIG1vZHVsZU1hcHMudmFsdWVzKCkpIHtcclxuICAgICAgICAgIGNoZWNrSW1wb3J0cyhtYXAuaW1wb3J0ZWQsIGNvbnRleHQpO1xyXG4gICAgICAgICAgY2hlY2tJbXBvcnRzKG1hcC5uc0ltcG9ydGVkLCBjb250ZXh0KTtcclxuICAgICAgICAgIGNoZWNrSW1wb3J0cyhtYXAuZGVmYXVsdFR5cGVzSW1wb3J0ZWQsIGNvbnRleHQpO1xyXG4gICAgICAgICAgY2hlY2tJbXBvcnRzKG1hcC5uYW1lZFR5cGVzSW1wb3J0ZWQsIGNvbnRleHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH07XHJcbiAgfSxcclxufTtcclxuIl19