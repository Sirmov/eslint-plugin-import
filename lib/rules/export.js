'use strict';var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _ExportMap = require('../ExportMap');var _ExportMap2 = _interopRequireDefault(_ExportMap);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);
var _arrayIncludes = require('array-includes');var _arrayIncludes2 = _interopRequireDefault(_arrayIncludes);
var _arrayPrototype = require('array.prototype.flatmap');var _arrayPrototype2 = _interopRequireDefault(_arrayPrototype);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

/*
                                                                                                                                                                                                                        Notes on TypeScript namespaces aka TSModuleDeclaration:
                                                                                                                                                                                                                        
                                                                                                                                                                                                                        There are two forms:
                                                                                                                                                                                                                        - active namespaces: namespace Foo {} / module Foo {}
                                                                                                                                                                                                                        - ambient modules; declare module "eslint-plugin-import" {}
                                                                                                                                                                                                                        
                                                                                                                                                                                                                        active namespaces:
                                                                                                                                                                                                                        - cannot contain a default export
                                                                                                                                                                                                                        - cannot contain an export all
                                                                                                                                                                                                                        - cannot contain a multi name export (export { a, b })
                                                                                                                                                                                                                        - can have active namespaces nested within them
                                                                                                                                                                                                                        
                                                                                                                                                                                                                        ambient namespaces:
                                                                                                                                                                                                                        - can only be defined in .d.ts files
                                                                                                                                                                                                                        - cannot be nested within active namespaces
                                                                                                                                                                                                                        - have no other restrictions
                                                                                                                                                                                                                        */

var rootProgram = 'root';
var tsTypePrefix = 'type:';

/**
                             * Detect function overloads like:
                             * ```ts
                             * export function foo(a: number);
                             * export function foo(a: string);
                             * export function foo(a: number|string) { return a; }
                             * ```
                             * @param {Set<Object>} nodes
                             * @returns {boolean}
                             */
function isTypescriptFunctionOverloads(nodes) {
  var nodesArr = Array.from(nodes);

  var idents = (0, _arrayPrototype2['default'])(nodesArr, function (node) {return (
      node.declaration && (
      node.declaration.type === 'TSDeclareFunction' // eslint 6+
      || node.declaration.type === 'TSEmptyBodyFunctionDeclaration' // eslint 4-5
      ) ?
      node.declaration.id.name :
      []);});

  if (new Set(idents).size !== idents.length) {
    return true;
  }

  var types = new Set(nodesArr.map(function (node) {return node.parent.type;}));
  if (!types.has('TSDeclareFunction')) {
    return false;
  }
  if (types.size === 1) {
    return true;
  }
  if (types.size === 2 && types.has('FunctionDeclaration')) {
    return true;
  }
  return false;
}

/**
   * Detect merging Namespaces with Classes, Functions, or Enums like:
   * ```ts
   * export class Foo { }
   * export namespace Foo { }
   * ```
   * @param {Set<Object>} nodes
   * @returns {boolean}
   */
function isTypescriptNamespaceMerging(nodes) {
  var types = new Set(Array.from(nodes, function (node) {return node.parent.type;}));
  var noNamespaceNodes = Array.from(nodes).filter(function (node) {return node.parent.type !== 'TSModuleDeclaration';});

  return types.has('TSModuleDeclaration') && (

  types.size === 1
  // Merging with functions
  || types.size === 2 && (types.has('FunctionDeclaration') || types.has('TSDeclareFunction')) ||
  types.size === 3 && types.has('FunctionDeclaration') && types.has('TSDeclareFunction')
  // Merging with classes or enums
  || types.size === 2 && (types.has('ClassDeclaration') || types.has('TSEnumDeclaration')) && noNamespaceNodes.length === 1);

}

/**
   * Detect if a typescript namespace node should be reported as multiple export:
   * ```ts
   * export class Foo { }
   * export function Foo();
   * export namespace Foo { }
   * ```
   * @param {Object} node
   * @param {Set<Object>} nodes
   * @returns {boolean}
   */
function shouldSkipTypescriptNamespace(node, nodes) {
  var types = new Set(Array.from(nodes, function (node) {return node.parent.type;}));

  return !isTypescriptNamespaceMerging(nodes) &&
  node.parent.type === 'TSModuleDeclaration' && (

  types.has('TSEnumDeclaration') ||
  types.has('ClassDeclaration') ||
  types.has('FunctionDeclaration') ||
  types.has('TSDeclareFunction'));

}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      category: 'Helpful warnings',
      description: 'Forbid any invalid exports, i.e. re-export of the same name.',
      url: (0, _docsUrl2['default'])('export') },

    schema: [] },


  create: function () {function create(context) {
      var namespace = new Map([[rootProgram, new Map()]]);

      function addNamed(name, node, parent, isType) {
        if (!namespace.has(parent)) {
          namespace.set(parent, new Map());
        }
        var named = namespace.get(parent);

        var key = isType ? '' + tsTypePrefix + String(name) : name;
        var nodes = named.get(key);

        if (nodes == null) {
          nodes = new Set();
          named.set(key, nodes);
        }

        nodes.add(node);
      }

      function getParent(node) {
        if (node.parent && node.parent.type === 'TSModuleBlock') {
          return node.parent.parent;
        }

        // just in case somehow a non-ts namespace export declaration isn't directly
        // parented to the root Program node
        return rootProgram;
      }

      return {
        ExportDefaultDeclaration: function () {function ExportDefaultDeclaration(node) {
            addNamed('default', node, getParent(node));
          }return ExportDefaultDeclaration;}(),

        ExportSpecifier: function () {function ExportSpecifier(node) {
            addNamed(
            node.exported.name || node.exported.value,
            node.exported,
            getParent(node.parent));

          }return ExportSpecifier;}(),

        ExportNamedDeclaration: function () {function ExportNamedDeclaration(node) {
            if (node.declaration == null) return;

            var parent = getParent(node);
            // support for old TypeScript versions
            var isTypeVariableDecl = node.declaration.kind === 'type';

            if (node.declaration.id != null) {
              if ((0, _arrayIncludes2['default'])([
              'TSTypeAliasDeclaration',
              'TSInterfaceDeclaration'],
              node.declaration.type)) {
                addNamed(node.declaration.id.name, node.declaration.id, parent, true);
              } else {
                addNamed(node.declaration.id.name, node.declaration.id, parent, isTypeVariableDecl);
              }
            }

            if (node.declaration.declarations != null) {var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
                for (var _iterator = node.declaration.declarations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var declaration = _step.value;
                  (0, _ExportMap.recursivePatternCapture)(declaration.id, function (v) {return (
                      addNamed(v.name, v, parent, isTypeVariableDecl));});
                }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
            }
          }return ExportNamedDeclaration;}(),

        ExportAllDeclaration: function () {function ExportAllDeclaration(node) {
            if (node.source == null) return; // not sure if this is ever true

            // `export * as X from 'path'` does not conflict
            if (node.exported && node.exported.name) return;

            var remoteExports = _ExportMap2['default'].get(node.source.value, context);
            if (remoteExports == null) return;

            if (remoteExports.errors.length) {
              remoteExports.reportErrors(context, node);
              return;
            }

            var parent = getParent(node);

            var any = false;
            remoteExports.forEach(function (v, name) {
              if (name !== 'default') {
                any = true; // poor man's filter
                addNamed(name, node, parent);
              }
            });

            if (!any) {
              context.report(
              node.source, 'No named exports found in module \'' + String(
              node.source.value) + '\'.');

            }
          }return ExportAllDeclaration;}(),

        'Program:exit': function () {function ProgramExit() {var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {
              for (var _iterator2 = namespace[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var _ref = _step2.value;var _ref2 = _slicedToArray(_ref, 2);var named = _ref2[1];var _iteratorNormalCompletion3 = true;var _didIteratorError3 = false;var _iteratorError3 = undefined;try {
                  for (var _iterator3 = named[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {var _ref3 = _step3.value;var _ref4 = _slicedToArray(_ref3, 2);var name = _ref4[0];var nodes = _ref4[1];
                    if (nodes.size <= 1) continue;

                    if (isTypescriptFunctionOverloads(nodes) || isTypescriptNamespaceMerging(nodes)) continue;var _iteratorNormalCompletion4 = true;var _didIteratorError4 = false;var _iteratorError4 = undefined;try {

                      for (var _iterator4 = nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {var node = _step4.value;
                        if (shouldSkipTypescriptNamespace(node, nodes)) continue;

                        if (name === 'default') {
                          context.report(node, 'Multiple default exports.');
                        } else {
                          context.report(
                          node, 'Multiple exports of name \'' + String(
                          name.replace(tsTypePrefix, '')) + '\'.');

                        }
                      }} catch (err) {_didIteratorError4 = true;_iteratorError4 = err;} finally {try {if (!_iteratorNormalCompletion4 && _iterator4['return']) {_iterator4['return']();}} finally {if (_didIteratorError4) {throw _iteratorError4;}}}
                  }} catch (err) {_didIteratorError3 = true;_iteratorError3 = err;} finally {try {if (!_iteratorNormalCompletion3 && _iterator3['return']) {_iterator3['return']();}} finally {if (_didIteratorError3) {throw _iteratorError3;}}}
              }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2['return']) {_iterator2['return']();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}
          }return ProgramExit;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9leHBvcnQuanMiXSwibmFtZXMiOlsicm9vdFByb2dyYW0iLCJ0c1R5cGVQcmVmaXgiLCJpc1R5cGVzY3JpcHRGdW5jdGlvbk92ZXJsb2FkcyIsIm5vZGVzIiwibm9kZXNBcnIiLCJBcnJheSIsImZyb20iLCJpZGVudHMiLCJub2RlIiwiZGVjbGFyYXRpb24iLCJ0eXBlIiwiaWQiLCJuYW1lIiwiU2V0Iiwic2l6ZSIsImxlbmd0aCIsInR5cGVzIiwibWFwIiwicGFyZW50IiwiaGFzIiwiaXNUeXBlc2NyaXB0TmFtZXNwYWNlTWVyZ2luZyIsIm5vTmFtZXNwYWNlTm9kZXMiLCJmaWx0ZXIiLCJzaG91bGRTa2lwVHlwZXNjcmlwdE5hbWVzcGFjZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJ1cmwiLCJzY2hlbWEiLCJjcmVhdGUiLCJjb250ZXh0IiwibmFtZXNwYWNlIiwiTWFwIiwiYWRkTmFtZWQiLCJpc1R5cGUiLCJzZXQiLCJuYW1lZCIsImdldCIsImtleSIsImFkZCIsImdldFBhcmVudCIsIkV4cG9ydERlZmF1bHREZWNsYXJhdGlvbiIsIkV4cG9ydFNwZWNpZmllciIsImV4cG9ydGVkIiwidmFsdWUiLCJFeHBvcnROYW1lZERlY2xhcmF0aW9uIiwiaXNUeXBlVmFyaWFibGVEZWNsIiwia2luZCIsImRlY2xhcmF0aW9ucyIsInYiLCJFeHBvcnRBbGxEZWNsYXJhdGlvbiIsInNvdXJjZSIsInJlbW90ZUV4cG9ydHMiLCJFeHBvcnRNYXAiLCJlcnJvcnMiLCJyZXBvcnRFcnJvcnMiLCJhbnkiLCJmb3JFYWNoIiwicmVwb3J0IiwicmVwbGFjZSJdLCJtYXBwaW5ncyI6InFvQkFBQSx5QztBQUNBLHFDO0FBQ0EsK0M7QUFDQSx5RDs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CQSxJQUFNQSxjQUFjLE1BQXBCO0FBQ0EsSUFBTUMsZUFBZSxPQUFyQjs7QUFFQTs7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Q3lDLEdBQUwsRUFBVTtBQUNSMUIsc0JBQVE0QixNQUFSO0FBQ0VyRCxtQkFBSzhDLE1BRFA7QUFFdUM5QyxtQkFBSzhDLE1BQUwsQ0FBWVAsS0FGbkQ7O0FBSUQ7QUFDRixXQXJFSTs7QUF1RUwscUNBQWdCLHVCQUFZO0FBQzFCLG9DQUF3QmIsU0FBeEIsbUlBQW1DLGlFQUFyQkssS0FBcUI7QUFDakMsd0NBQTRCQSxLQUE1QixtSUFBbUMsbUVBQXZCM0IsSUFBdUIsZ0JBQWpCVCxLQUFpQjtBQUNqQyx3QkFBSUEsTUFBTVcsSUFBTixJQUFjLENBQWxCLEVBQXFCOztBQUVyQix3QkFBSVosOEJBQThCQyxLQUE5QixLQUF3Q2lCLDZCQUE2QmpCLEtBQTdCLENBQTVDLEVBQWlGLFNBSGhEOztBQUtqQyw0Q0FBbUJBLEtBQW5CLG1JQUEwQixLQUFmSyxJQUFlO0FBQ3hCLDRCQUFJZSw4QkFBOEJmLElBQTlCLEVBQW9DTCxLQUFwQyxDQUFKLEVBQWdEOztBQUVoRCw0QkFBSVMsU0FBUyxTQUFiLEVBQXdCO0FBQ3RCcUIsa0NBQVE0QixNQUFSLENBQWVyRCxJQUFmLEVBQXFCLDJCQUFyQjtBQUNELHlCQUZELE1BRU87QUFDTHlCLGtDQUFRNEIsTUFBUjtBQUNFckQsOEJBREY7QUFFK0JJLCtCQUFLa0QsT0FBTCxDQUFhN0QsWUFBYixFQUEyQixFQUEzQixDQUYvQjs7QUFJRDtBQUNGLHVCQWhCZ0M7QUFpQmxDLG1CQWxCZ0M7QUFtQmxDLGVBcEJ5QjtBQXFCM0IsV0FyQkQsc0JBdkVLLEVBQVA7O0FBOEZELEtBdkljLG1CQUFqQiIsImZpbGUiOiJleHBvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXhwb3J0TWFwLCB7IHJlY3Vyc2l2ZVBhdHRlcm5DYXB0dXJlIH0gZnJvbSAnLi4vRXhwb3J0TWFwJztcclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XHJcbmltcG9ydCBpbmNsdWRlcyBmcm9tICdhcnJheS1pbmNsdWRlcyc7XHJcbmltcG9ydCBmbGF0TWFwIGZyb20gJ2FycmF5LnByb3RvdHlwZS5mbGF0bWFwJztcclxuXHJcbi8qXHJcbk5vdGVzIG9uIFR5cGVTY3JpcHQgbmFtZXNwYWNlcyBha2EgVFNNb2R1bGVEZWNsYXJhdGlvbjpcclxuXHJcblRoZXJlIGFyZSB0d28gZm9ybXM6XHJcbi0gYWN0aXZlIG5hbWVzcGFjZXM6IG5hbWVzcGFjZSBGb28ge30gLyBtb2R1bGUgRm9vIHt9XHJcbi0gYW1iaWVudCBtb2R1bGVzOyBkZWNsYXJlIG1vZHVsZSBcImVzbGludC1wbHVnaW4taW1wb3J0XCIge31cclxuXHJcbmFjdGl2ZSBuYW1lc3BhY2VzOlxyXG4tIGNhbm5vdCBjb250YWluIGEgZGVmYXVsdCBleHBvcnRcclxuLSBjYW5ub3QgY29udGFpbiBhbiBleHBvcnQgYWxsXHJcbi0gY2Fubm90IGNvbnRhaW4gYSBtdWx0aSBuYW1lIGV4cG9ydCAoZXhwb3J0IHsgYSwgYiB9KVxyXG4tIGNhbiBoYXZlIGFjdGl2ZSBuYW1lc3BhY2VzIG5lc3RlZCB3aXRoaW4gdGhlbVxyXG5cclxuYW1iaWVudCBuYW1lc3BhY2VzOlxyXG4tIGNhbiBvbmx5IGJlIGRlZmluZWQgaW4gLmQudHMgZmlsZXNcclxuLSBjYW5ub3QgYmUgbmVzdGVkIHdpdGhpbiBhY3RpdmUgbmFtZXNwYWNlc1xyXG4tIGhhdmUgbm8gb3RoZXIgcmVzdHJpY3Rpb25zXHJcbiovXHJcblxyXG5jb25zdCByb290UHJvZ3JhbSA9ICdyb290JztcclxuY29uc3QgdHNUeXBlUHJlZml4ID0gJ3R5cGU6JztcclxuXHJcbi8qKlxyXG4gKiBEZXRlY3QgZnVuY3Rpb24gb3ZlcmxvYWRzIGxpa2U6XHJcbiAqIGBgYHRzXHJcbiAqIGV4cG9ydCBmdW5jdGlvbiBmb28oYTogbnVtYmVyKTtcclxuICogZXhwb3J0IGZ1bmN0aW9uIGZvbyhhOiBzdHJpbmcpO1xyXG4gKiBleHBvcnQgZnVuY3Rpb24gZm9vKGE6IG51bWJlcnxzdHJpbmcpIHsgcmV0dXJuIGE7IH1cclxuICogYGBgXHJcbiAqIEBwYXJhbSB7U2V0PE9iamVjdD59IG5vZGVzXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZnVuY3Rpb24gaXNUeXBlc2NyaXB0RnVuY3Rpb25PdmVybG9hZHMobm9kZXMpIHtcclxuICBjb25zdCBub2Rlc0FyciA9IEFycmF5LmZyb20obm9kZXMpO1xyXG5cclxuICBjb25zdCBpZGVudHMgPSBmbGF0TWFwKG5vZGVzQXJyLCAobm9kZSkgPT4gKFxyXG4gICAgbm9kZS5kZWNsYXJhdGlvbiAmJiAoXHJcbiAgICAgIG5vZGUuZGVjbGFyYXRpb24udHlwZSA9PT0gJ1RTRGVjbGFyZUZ1bmN0aW9uJyAvLyBlc2xpbnQgNitcclxuICAgICAgfHwgbm9kZS5kZWNsYXJhdGlvbi50eXBlID09PSAnVFNFbXB0eUJvZHlGdW5jdGlvbkRlY2xhcmF0aW9uJyAvLyBlc2xpbnQgNC01XHJcbiAgICApXHJcbiAgICAgID8gbm9kZS5kZWNsYXJhdGlvbi5pZC5uYW1lXHJcbiAgICAgIDogW11cclxuICApKTtcclxuICBpZiAobmV3IFNldChpZGVudHMpLnNpemUgIT09IGlkZW50cy5sZW5ndGgpIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdHlwZXMgPSBuZXcgU2V0KG5vZGVzQXJyLm1hcChub2RlID0+IG5vZGUucGFyZW50LnR5cGUpKTtcclxuICBpZiAoIXR5cGVzLmhhcygnVFNEZWNsYXJlRnVuY3Rpb24nKSkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBpZiAodHlwZXMuc2l6ZSA9PT0gMSkge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG4gIGlmICh0eXBlcy5zaXplID09PSAyICYmIHR5cGVzLmhhcygnRnVuY3Rpb25EZWNsYXJhdGlvbicpKSB7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG4vKipcclxuICogRGV0ZWN0IG1lcmdpbmcgTmFtZXNwYWNlcyB3aXRoIENsYXNzZXMsIEZ1bmN0aW9ucywgb3IgRW51bXMgbGlrZTpcclxuICogYGBgdHNcclxuICogZXhwb3J0IGNsYXNzIEZvbyB7IH1cclxuICogZXhwb3J0IG5hbWVzcGFjZSBGb28geyB9XHJcbiAqIGBgYFxyXG4gKiBAcGFyYW0ge1NldDxPYmplY3Q+fSBub2Rlc1xyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIGlzVHlwZXNjcmlwdE5hbWVzcGFjZU1lcmdpbmcobm9kZXMpIHtcclxuICBjb25zdCB0eXBlcyA9IG5ldyBTZXQoQXJyYXkuZnJvbShub2Rlcywgbm9kZSA9PiBub2RlLnBhcmVudC50eXBlKSk7XHJcbiAgY29uc3Qgbm9OYW1lc3BhY2VOb2RlcyA9IEFycmF5LmZyb20obm9kZXMpLmZpbHRlcigobm9kZSkgPT4gbm9kZS5wYXJlbnQudHlwZSAhPT0gJ1RTTW9kdWxlRGVjbGFyYXRpb24nKTtcclxuXHJcbiAgcmV0dXJuIHR5cGVzLmhhcygnVFNNb2R1bGVEZWNsYXJhdGlvbicpXHJcbiAgICAmJiAoXHJcbiAgICAgIHR5cGVzLnNpemUgPT09IDFcclxuICAgICAgLy8gTWVyZ2luZyB3aXRoIGZ1bmN0aW9uc1xyXG4gICAgICB8fCAodHlwZXMuc2l6ZSA9PT0gMiAmJiAodHlwZXMuaGFzKCdGdW5jdGlvbkRlY2xhcmF0aW9uJykgfHwgdHlwZXMuaGFzKCdUU0RlY2xhcmVGdW5jdGlvbicpKSlcclxuICAgICAgfHwgKHR5cGVzLnNpemUgPT09IDMgJiYgdHlwZXMuaGFzKCdGdW5jdGlvbkRlY2xhcmF0aW9uJykgJiYgdHlwZXMuaGFzKCdUU0RlY2xhcmVGdW5jdGlvbicpKVxyXG4gICAgICAvLyBNZXJnaW5nIHdpdGggY2xhc3NlcyBvciBlbnVtc1xyXG4gICAgICB8fCAodHlwZXMuc2l6ZSA9PT0gMiAmJiAodHlwZXMuaGFzKCdDbGFzc0RlY2xhcmF0aW9uJykgfHwgdHlwZXMuaGFzKCdUU0VudW1EZWNsYXJhdGlvbicpKSAmJiBub05hbWVzcGFjZU5vZGVzLmxlbmd0aCA9PT0gMSlcclxuICAgICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZXRlY3QgaWYgYSB0eXBlc2NyaXB0IG5hbWVzcGFjZSBub2RlIHNob3VsZCBiZSByZXBvcnRlZCBhcyBtdWx0aXBsZSBleHBvcnQ6XHJcbiAqIGBgYHRzXHJcbiAqIGV4cG9ydCBjbGFzcyBGb28geyB9XHJcbiAqIGV4cG9ydCBmdW5jdGlvbiBGb28oKTtcclxuICogZXhwb3J0IG5hbWVzcGFjZSBGb28geyB9XHJcbiAqIGBgYFxyXG4gKiBAcGFyYW0ge09iamVjdH0gbm9kZVxyXG4gKiBAcGFyYW0ge1NldDxPYmplY3Q+fSBub2Rlc1xyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmZ1bmN0aW9uIHNob3VsZFNraXBUeXBlc2NyaXB0TmFtZXNwYWNlKG5vZGUsIG5vZGVzKSB7XHJcbiAgY29uc3QgdHlwZXMgPSBuZXcgU2V0KEFycmF5LmZyb20obm9kZXMsIG5vZGUgPT4gbm9kZS5wYXJlbnQudHlwZSkpO1xyXG5cclxuICByZXR1cm4gIWlzVHlwZXNjcmlwdE5hbWVzcGFjZU1lcmdpbmcobm9kZXMpXHJcbiAgICAmJiBub2RlLnBhcmVudC50eXBlID09PSAnVFNNb2R1bGVEZWNsYXJhdGlvbidcclxuICAgICYmIChcclxuICAgICAgdHlwZXMuaGFzKCdUU0VudW1EZWNsYXJhdGlvbicpXHJcbiAgICAgIHx8IHR5cGVzLmhhcygnQ2xhc3NEZWNsYXJhdGlvbicpXHJcbiAgICAgIHx8IHR5cGVzLmhhcygnRnVuY3Rpb25EZWNsYXJhdGlvbicpXHJcbiAgICAgIHx8IHR5cGVzLmhhcygnVFNEZWNsYXJlRnVuY3Rpb24nKVxyXG4gICAgKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3Byb2JsZW0nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICBjYXRlZ29yeTogJ0hlbHBmdWwgd2FybmluZ3MnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0ZvcmJpZCBhbnkgaW52YWxpZCBleHBvcnRzLCBpLmUuIHJlLWV4cG9ydCBvZiB0aGUgc2FtZSBuYW1lLicsXHJcbiAgICAgIHVybDogZG9jc1VybCgnZXhwb3J0JyksXHJcbiAgICB9LFxyXG4gICAgc2NoZW1hOiBbXSxcclxuICB9LFxyXG5cclxuICBjcmVhdGUoY29udGV4dCkge1xyXG4gICAgY29uc3QgbmFtZXNwYWNlID0gbmV3IE1hcChbW3Jvb3RQcm9ncmFtLCBuZXcgTWFwKCldXSk7XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkTmFtZWQobmFtZSwgbm9kZSwgcGFyZW50LCBpc1R5cGUpIHtcclxuICAgICAgaWYgKCFuYW1lc3BhY2UuaGFzKHBhcmVudCkpIHtcclxuICAgICAgICBuYW1lc3BhY2Uuc2V0KHBhcmVudCwgbmV3IE1hcCgpKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBuYW1lZCA9IG5hbWVzcGFjZS5nZXQocGFyZW50KTtcclxuXHJcbiAgICAgIGNvbnN0IGtleSA9IGlzVHlwZSA/IGAke3RzVHlwZVByZWZpeH0ke25hbWV9YCA6IG5hbWU7XHJcbiAgICAgIGxldCBub2RlcyA9IG5hbWVkLmdldChrZXkpO1xyXG5cclxuICAgICAgaWYgKG5vZGVzID09IG51bGwpIHtcclxuICAgICAgICBub2RlcyA9IG5ldyBTZXQoKTtcclxuICAgICAgICBuYW1lZC5zZXQoa2V5LCBub2Rlcyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG5vZGVzLmFkZChub2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRQYXJlbnQobm9kZSkge1xyXG4gICAgICBpZiAobm9kZS5wYXJlbnQgJiYgbm9kZS5wYXJlbnQudHlwZSA9PT0gJ1RTTW9kdWxlQmxvY2snKSB7XHJcbiAgICAgICAgcmV0dXJuIG5vZGUucGFyZW50LnBhcmVudDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8ganVzdCBpbiBjYXNlIHNvbWVob3cgYSBub24tdHMgbmFtZXNwYWNlIGV4cG9ydCBkZWNsYXJhdGlvbiBpc24ndCBkaXJlY3RseVxyXG4gICAgICAvLyBwYXJlbnRlZCB0byB0aGUgcm9vdCBQcm9ncmFtIG5vZGVcclxuICAgICAgcmV0dXJuIHJvb3RQcm9ncmFtO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIEV4cG9ydERlZmF1bHREZWNsYXJhdGlvbihub2RlKSB7XHJcbiAgICAgICAgYWRkTmFtZWQoJ2RlZmF1bHQnLCBub2RlLCBnZXRQYXJlbnQobm9kZSkpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgRXhwb3J0U3BlY2lmaWVyKG5vZGUpIHtcclxuICAgICAgICBhZGROYW1lZChcclxuICAgICAgICAgIG5vZGUuZXhwb3J0ZWQubmFtZSB8fCBub2RlLmV4cG9ydGVkLnZhbHVlLFxyXG4gICAgICAgICAgbm9kZS5leHBvcnRlZCxcclxuICAgICAgICAgIGdldFBhcmVudChub2RlLnBhcmVudCksXHJcbiAgICAgICAgKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIEV4cG9ydE5hbWVkRGVjbGFyYXRpb24obm9kZSkge1xyXG4gICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uID09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgcGFyZW50ID0gZ2V0UGFyZW50KG5vZGUpO1xyXG4gICAgICAgIC8vIHN1cHBvcnQgZm9yIG9sZCBUeXBlU2NyaXB0IHZlcnNpb25zXHJcbiAgICAgICAgY29uc3QgaXNUeXBlVmFyaWFibGVEZWNsID0gbm9kZS5kZWNsYXJhdGlvbi5raW5kID09PSAndHlwZSc7XHJcblxyXG4gICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uLmlkICE9IG51bGwpIHtcclxuICAgICAgICAgIGlmIChpbmNsdWRlcyhbXHJcbiAgICAgICAgICAgICdUU1R5cGVBbGlhc0RlY2xhcmF0aW9uJyxcclxuICAgICAgICAgICAgJ1RTSW50ZXJmYWNlRGVjbGFyYXRpb24nLFxyXG4gICAgICAgICAgXSwgbm9kZS5kZWNsYXJhdGlvbi50eXBlKSkge1xyXG4gICAgICAgICAgICBhZGROYW1lZChub2RlLmRlY2xhcmF0aW9uLmlkLm5hbWUsIG5vZGUuZGVjbGFyYXRpb24uaWQsIHBhcmVudCwgdHJ1ZSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhZGROYW1lZChub2RlLmRlY2xhcmF0aW9uLmlkLm5hbWUsIG5vZGUuZGVjbGFyYXRpb24uaWQsIHBhcmVudCwgaXNUeXBlVmFyaWFibGVEZWNsKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uLmRlY2xhcmF0aW9ucyAhPSBudWxsKSB7XHJcbiAgICAgICAgICBmb3IgKGNvbnN0IGRlY2xhcmF0aW9uIG9mIG5vZGUuZGVjbGFyYXRpb24uZGVjbGFyYXRpb25zKSB7XHJcbiAgICAgICAgICAgIHJlY3Vyc2l2ZVBhdHRlcm5DYXB0dXJlKGRlY2xhcmF0aW9uLmlkLCB2ID0+XHJcbiAgICAgICAgICAgICAgYWRkTmFtZWQodi5uYW1lLCB2LCBwYXJlbnQsIGlzVHlwZVZhcmlhYmxlRGVjbCkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIEV4cG9ydEFsbERlY2xhcmF0aW9uKG5vZGUpIHtcclxuICAgICAgICBpZiAobm9kZS5zb3VyY2UgPT0gbnVsbCkgcmV0dXJuOyAvLyBub3Qgc3VyZSBpZiB0aGlzIGlzIGV2ZXIgdHJ1ZVxyXG5cclxuICAgICAgICAvLyBgZXhwb3J0ICogYXMgWCBmcm9tICdwYXRoJ2AgZG9lcyBub3QgY29uZmxpY3RcclxuICAgICAgICBpZiAobm9kZS5leHBvcnRlZCAmJiBub2RlLmV4cG9ydGVkLm5hbWUpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgcmVtb3RlRXhwb3J0cyA9IEV4cG9ydE1hcC5nZXQobm9kZS5zb3VyY2UudmFsdWUsIGNvbnRleHQpO1xyXG4gICAgICAgIGlmIChyZW1vdGVFeHBvcnRzID09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYgKHJlbW90ZUV4cG9ydHMuZXJyb3JzLmxlbmd0aCkge1xyXG4gICAgICAgICAgcmVtb3RlRXhwb3J0cy5yZXBvcnRFcnJvcnMoY29udGV4dCwgbm9kZSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwYXJlbnQgPSBnZXRQYXJlbnQobm9kZSk7XHJcblxyXG4gICAgICAgIGxldCBhbnkgPSBmYWxzZTtcclxuICAgICAgICByZW1vdGVFeHBvcnRzLmZvckVhY2goKHYsIG5hbWUpID0+IHtcclxuICAgICAgICAgIGlmIChuYW1lICE9PSAnZGVmYXVsdCcpIHtcclxuICAgICAgICAgICAgYW55ID0gdHJ1ZTsgLy8gcG9vciBtYW4ncyBmaWx0ZXJcclxuICAgICAgICAgICAgYWRkTmFtZWQobmFtZSwgbm9kZSwgcGFyZW50KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKCFhbnkpIHtcclxuICAgICAgICAgIGNvbnRleHQucmVwb3J0KFxyXG4gICAgICAgICAgICBub2RlLnNvdXJjZSxcclxuICAgICAgICAgICAgYE5vIG5hbWVkIGV4cG9ydHMgZm91bmQgaW4gbW9kdWxlICcke25vZGUuc291cmNlLnZhbHVlfScuYCxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgJ1Byb2dyYW06ZXhpdCc6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IFssIG5hbWVkXSBvZiBuYW1lc3BhY2UpIHtcclxuICAgICAgICAgIGZvciAoY29uc3QgW25hbWUsIG5vZGVzXSBvZiBuYW1lZCkge1xyXG4gICAgICAgICAgICBpZiAobm9kZXMuc2l6ZSA8PSAxKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc1R5cGVzY3JpcHRGdW5jdGlvbk92ZXJsb2Fkcyhub2RlcykgfHwgaXNUeXBlc2NyaXB0TmFtZXNwYWNlTWVyZ2luZyhub2RlcykpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHNob3VsZFNraXBUeXBlc2NyaXB0TmFtZXNwYWNlKG5vZGUsIG5vZGVzKSkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgIGlmIChuYW1lID09PSAnZGVmYXVsdCcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KG5vZGUsICdNdWx0aXBsZSBkZWZhdWx0IGV4cG9ydHMuJyk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KFxyXG4gICAgICAgICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAgICAgICBgTXVsdGlwbGUgZXhwb3J0cyBvZiBuYW1lICcke25hbWUucmVwbGFjZSh0c1R5cGVQcmVmaXgsICcnKX0nLmAsXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH07XHJcbiAgfSxcclxufTtcclxuIl19