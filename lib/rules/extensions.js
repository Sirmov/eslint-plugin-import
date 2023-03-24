'use strict';var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _path = require('path');var _path2 = _interopRequireDefault(_path);

var _resolve = require('eslint-module-utils/resolve');var _resolve2 = _interopRequireDefault(_resolve);
var _importType = require('../core/importType');
var _moduleVisitor = require('eslint-module-utils/moduleVisitor');var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

var enumValues = { 'enum': ['always', 'ignorePackages', 'never'] };
var patternProperties = {
  type: 'object',
  patternProperties: { '.*': enumValues } };

var properties = {
  type: 'object',
  properties: {
    'pattern': patternProperties,
    'ignorePackages': { type: 'boolean' } } };



function buildProperties(context) {

  var result = {
    defaultConfig: 'never',
    pattern: {},
    ignorePackages: false };


  context.options.forEach(function (obj) {

    // If this is a string, set defaultConfig to its value
    if (typeof obj === 'string') {
      result.defaultConfig = obj;
      return;
    }

    // If this is not the new structure, transfer all props to result.pattern
    if (obj.pattern === undefined && obj.ignorePackages === undefined) {
      Object.assign(result.pattern, obj);
      return;
    }

    // If pattern is provided, transfer all props
    if (obj.pattern !== undefined) {
      Object.assign(result.pattern, obj.pattern);
    }

    // If ignorePackages is provided, transfer it to result
    if (obj.ignorePackages !== undefined) {
      result.ignorePackages = obj.ignorePackages;
    }
  });

  if (result.defaultConfig === 'ignorePackages') {
    result.defaultConfig = 'always';
    result.ignorePackages = true;
  }

  return result;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Style guide',
      description: 'Ensure consistent use of file extension within the import path.',
      url: (0, _docsUrl2['default'])('extensions') },


    schema: {
      anyOf: [
      {
        type: 'array',
        items: [enumValues],
        additionalItems: false },

      {
        type: 'array',
        items: [
        enumValues,
        properties],

        additionalItems: false },

      {
        type: 'array',
        items: [properties],
        additionalItems: false },

      {
        type: 'array',
        items: [patternProperties],
        additionalItems: false },

      {
        type: 'array',
        items: [
        enumValues,
        patternProperties],

        additionalItems: false }] } },





  create: function () {function create(context) {

      var props = buildProperties(context);

      function getModifier(extension) {
        return props.pattern[extension] || props.defaultConfig;
      }

      function isUseOfExtensionRequired(extension, isPackage) {
        return getModifier(extension) === 'always' && (!props.ignorePackages || !isPackage);
      }

      function isUseOfExtensionForbidden(extension) {
        return getModifier(extension) === 'never';
      }

      function isResolvableWithoutExtension(file) {
        var extension = _path2['default'].extname(file);
        var fileWithoutExtension = file.slice(0, -extension.length);
        var resolvedFileWithoutExtension = (0, _resolve2['default'])(fileWithoutExtension, context);

        return resolvedFileWithoutExtension === (0, _resolve2['default'])(file, context);
      }

      function isExternalRootModule(file, context) {
        var slashCount = file.split('/').length - 1;

        if (slashCount === 0) return true;

        /**
                                               * treat custom aliases as internal modules
                                               * Like `import sum from '@src/sum'`
                                               * @link https://www.npmjs.com/package/eslint-import-resolver-alias
                                               * @link https://github.com/import-js/eslint-plugin-import/issues/2365
                                           */
        if (context.settings && context.settings['import/resolver'] && context.settings['import/resolver'].alias) {
          var aliases = void 0;

          if (Array.isArray(context.settings['import/resolver'].alias)) {
            aliases = context.settings['import/resolver'].alias;
          } else if (Array.isArray(context.settings['import/resolver'].alias.map)) {
            aliases = context.settings['import/resolver'].alias.map.map(function (_ref) {var _ref2 = _slicedToArray(_ref, 1),alias = _ref2[0];return alias;});
          } else {
            aliases = [];
          }

          if (aliases.some(function (alias) {return file.startsWith(String(alias) + '/');})) return false;
        }

        if ((0, _importType.isScoped)(file) && slashCount <= 1) return true;
        return false;
      }

      function checkFileExtension(source, node) {
        // bail if the declaration doesn't have a source, e.g. "export { foo };", or if it's only partially typed like in an editor
        if (!source || !source.value) return;

        var importPathWithQueryString = source.value;

        // don't enforce anything on builtins
        if ((0, _importType.isBuiltIn)(importPathWithQueryString, context.settings)) return;

        var importPath = importPathWithQueryString.replace(/\?(.*)$/, '');

        // don't enforce in root external packages as they may have names with `.js`.
        // Like `import Decimal from decimal.js`)
        if (isExternalRootModule(importPath, context)) return;

        var resolvedPath = (0, _resolve2['default'])(importPath, context);

        // get extension from resolved path, if possible.
        // for unresolved, use source value.
        var extension = _path2['default'].extname(resolvedPath || importPath).substring(1);

        // determine if this is a module
        var isPackage = (0, _importType.isExternalModule)(
        importPath,
        (0, _resolve2['default'])(importPath, context),
        context) ||
        (0, _importType.isScoped)(importPath);

        if (!extension || !importPath.endsWith('.' + String(extension))) {
          // ignore type-only imports and exports
          if (node.importKind === 'type' || node.exportKind === 'type') return;
          var extensionRequired = isUseOfExtensionRequired(extension, isPackage);
          var extensionForbidden = isUseOfExtensionForbidden(extension);
          if (extensionRequired && !extensionForbidden) {
            context.report({
              node: source,
              message: 'Missing file extension ' + (
              extension ? '"' + String(extension) + '" ' : '') + 'for "' + String(importPathWithQueryString) + '"' });

          }
        } else if (extension) {
          if (isUseOfExtensionForbidden(extension) && isResolvableWithoutExtension(importPath)) {
            context.report({
              node: source,
              message: 'Unexpected use of file extension "' + String(extension) + '" for "' + String(importPathWithQueryString) + '"' });

          }
        }
      }

      return (0, _moduleVisitor2['default'])(checkFileExtension, { commonjs: true });
    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9leHRlbnNpb25zLmpzIl0sIm5hbWVzIjpbImVudW1WYWx1ZXMiLCJwYXR0ZXJuUHJvcGVydGllcyIsInR5cGUiLCJwcm9wZXJ0aWVzIiwiYnVpbGRQcm9wZXJ0aWVzIiwiY29udGV4dCIsInJlc3VsdCIsImRlZmF1bHRDb25maWciLCJwYXR0ZXJuIiwiaWdub3JlUGFja2FnZXMiLCJvcHRpb25zIiwiZm9yRWFjaCIsIm9iaiIsInVuZGVmaW5lZCIsIk9iamVjdCIsImFzc2lnbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJ1cmwiLCJzY2hlbWEiLCJhbnlPZiIsIml0ZW1zIiwiYWRkaXRpb25hbEl0ZW1zIiwiY3JlYXRlIiwicHJvcHMiLCJnZXRNb2RpZmllciIsImV4dGVuc2lvbiIsImlzVXNlT2ZFeHRlbnNpb25SZXF1aXJlZCIsImlzUGFja2FnZSIsImlzVXNlT2ZFeHRlbnNpb25Gb3JiaWRkZW4iLCJpc1Jlc29sdmFibGVXaXRob3V0RXh0ZW5zaW9uIiwiZmlsZSIsInBhdGgiLCJleHRuYW1lIiwiZmlsZVdpdGhvdXRFeHRlbnNpb24iLCJzbGljZSIsImxlbmd0aCIsInJlc29sdmVkRmlsZVdpdGhvdXRFeHRlbnNpb24iLCJpc0V4dGVybmFsUm9vdE1vZHVsZSIsInNsYXNoQ291bnQiLCJzcGxpdCIsInNldHRpbmdzIiwiYWxpYXMiLCJhbGlhc2VzIiwiQXJyYXkiLCJpc0FycmF5IiwibWFwIiwic29tZSIsInN0YXJ0c1dpdGgiLCJjaGVja0ZpbGVFeHRlbnNpb24iLCJzb3VyY2UiLCJub2RlIiwidmFsdWUiLCJpbXBvcnRQYXRoV2l0aFF1ZXJ5U3RyaW5nIiwiaW1wb3J0UGF0aCIsInJlcGxhY2UiLCJyZXNvbHZlZFBhdGgiLCJzdWJzdHJpbmciLCJlbmRzV2l0aCIsImltcG9ydEtpbmQiLCJleHBvcnRLaW5kIiwiZXh0ZW5zaW9uUmVxdWlyZWQiLCJleHRl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dGgnO1xyXG5cclxuaW1wb3J0IHJlc29sdmUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJztcclxuaW1wb3J0IHsgaXNCdWlsdEluLCBpc0V4dGVybmFsTW9kdWxlLCBpc1Njb3BlZCB9IGZyb20gJy4uL2NvcmUvaW1wb3J0VHlwZSc7XHJcbmltcG9ydCBtb2R1bGVWaXNpdG9yIGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvbW9kdWxlVmlzaXRvcic7XHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnO1xyXG5cclxuY29uc3QgZW51bVZhbHVlcyA9IHsgZW51bTogWyAnYWx3YXlzJywgJ2lnbm9yZVBhY2thZ2VzJywgJ25ldmVyJyBdIH07XHJcbmNvbnN0IHBhdHRlcm5Qcm9wZXJ0aWVzID0ge1xyXG4gIHR5cGU6ICdvYmplY3QnLFxyXG4gIHBhdHRlcm5Qcm9wZXJ0aWVzOiB7ICcuKic6IGVudW1WYWx1ZXMgfSxcclxufTtcclxuY29uc3QgcHJvcGVydGllcyA9IHtcclxuICB0eXBlOiAnb2JqZWN0JyxcclxuICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAncGF0dGVybic6IHBhdHRlcm5Qcm9wZXJ0aWVzLFxyXG4gICAgJ2lnbm9yZVBhY2thZ2VzJzogeyB0eXBlOiAnYm9vbGVhbicgfSxcclxuICB9LFxyXG59O1xyXG5cclxuZnVuY3Rpb24gYnVpbGRQcm9wZXJ0aWVzKGNvbnRleHQpIHtcclxuXHJcbiAgY29uc3QgcmVzdWx0ID0ge1xyXG4gICAgZGVmYXVsdENvbmZpZzogJ25ldmVyJyxcclxuICAgIHBhdHRlcm46IHt9LFxyXG4gICAgaWdub3JlUGFja2FnZXM6IGZhbHNlLFxyXG4gIH07XHJcblxyXG4gIGNvbnRleHQub3B0aW9ucy5mb3JFYWNoKG9iaiA9PiB7XHJcblxyXG4gICAgLy8gSWYgdGhpcyBpcyBhIHN0cmluZywgc2V0IGRlZmF1bHRDb25maWcgdG8gaXRzIHZhbHVlXHJcbiAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgcmVzdWx0LmRlZmF1bHRDb25maWcgPSBvYmo7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB0aGlzIGlzIG5vdCB0aGUgbmV3IHN0cnVjdHVyZSwgdHJhbnNmZXIgYWxsIHByb3BzIHRvIHJlc3VsdC5wYXR0ZXJuXHJcbiAgICBpZiAob2JqLnBhdHRlcm4gPT09IHVuZGVmaW5lZCAmJiBvYmouaWdub3JlUGFja2FnZXMgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBPYmplY3QuYXNzaWduKHJlc3VsdC5wYXR0ZXJuLCBvYmopO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgcGF0dGVybiBpcyBwcm92aWRlZCwgdHJhbnNmZXIgYWxsIHByb3BzXHJcbiAgICBpZiAob2JqLnBhdHRlcm4gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBPYmplY3QuYXNzaWduKHJlc3VsdC5wYXR0ZXJuLCBvYmoucGF0dGVybik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgaWdub3JlUGFja2FnZXMgaXMgcHJvdmlkZWQsIHRyYW5zZmVyIGl0IHRvIHJlc3VsdFxyXG4gICAgaWYgKG9iai5pZ25vcmVQYWNrYWdlcyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHJlc3VsdC5pZ25vcmVQYWNrYWdlcyA9IG9iai5pZ25vcmVQYWNrYWdlcztcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgaWYgKHJlc3VsdC5kZWZhdWx0Q29uZmlnID09PSAnaWdub3JlUGFja2FnZXMnKSB7XHJcbiAgICByZXN1bHQuZGVmYXVsdENvbmZpZyA9ICdhbHdheXMnO1xyXG4gICAgcmVzdWx0Lmlnbm9yZVBhY2thZ2VzID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdzdWdnZXN0aW9uJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgY2F0ZWdvcnk6ICdTdHlsZSBndWlkZScsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnRW5zdXJlIGNvbnNpc3RlbnQgdXNlIG9mIGZpbGUgZXh0ZW5zaW9uIHdpdGhpbiB0aGUgaW1wb3J0IHBhdGguJyxcclxuICAgICAgdXJsOiBkb2NzVXJsKCdleHRlbnNpb25zJyksXHJcbiAgICB9LFxyXG5cclxuICAgIHNjaGVtYToge1xyXG4gICAgICBhbnlPZjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgICBpdGVtczogW2VudW1WYWx1ZXNdLFxyXG4gICAgICAgICAgYWRkaXRpb25hbEl0ZW1zOiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICBlbnVtVmFsdWVzLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIGFkZGl0aW9uYWxJdGVtczogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICAgICAgaXRlbXM6IFtwcm9wZXJ0aWVzXSxcclxuICAgICAgICAgIGFkZGl0aW9uYWxJdGVtczogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICAgICAgaXRlbXM6IFtwYXR0ZXJuUHJvcGVydGllc10sXHJcbiAgICAgICAgICBhZGRpdGlvbmFsSXRlbXM6IGZhbHNlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgIGVudW1WYWx1ZXMsXHJcbiAgICAgICAgICAgIHBhdHRlcm5Qcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIGFkZGl0aW9uYWxJdGVtczogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlKGNvbnRleHQpIHtcclxuXHJcbiAgICBjb25zdCBwcm9wcyA9IGJ1aWxkUHJvcGVydGllcyhjb250ZXh0KTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRNb2RpZmllcihleHRlbnNpb24pIHtcclxuICAgICAgcmV0dXJuIHByb3BzLnBhdHRlcm5bZXh0ZW5zaW9uXSB8fCBwcm9wcy5kZWZhdWx0Q29uZmlnO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlzVXNlT2ZFeHRlbnNpb25SZXF1aXJlZChleHRlbnNpb24sIGlzUGFja2FnZSkge1xyXG4gICAgICByZXR1cm4gZ2V0TW9kaWZpZXIoZXh0ZW5zaW9uKSA9PT0gJ2Fsd2F5cycgJiYgKCFwcm9wcy5pZ25vcmVQYWNrYWdlcyB8fCAhaXNQYWNrYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc1VzZU9mRXh0ZW5zaW9uRm9yYmlkZGVuKGV4dGVuc2lvbikge1xyXG4gICAgICByZXR1cm4gZ2V0TW9kaWZpZXIoZXh0ZW5zaW9uKSA9PT0gJ25ldmVyJztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc1Jlc29sdmFibGVXaXRob3V0RXh0ZW5zaW9uKGZpbGUpIHtcclxuICAgICAgY29uc3QgZXh0ZW5zaW9uID0gcGF0aC5leHRuYW1lKGZpbGUpO1xyXG4gICAgICBjb25zdCBmaWxlV2l0aG91dEV4dGVuc2lvbiA9IGZpbGUuc2xpY2UoMCwgLWV4dGVuc2lvbi5sZW5ndGgpO1xyXG4gICAgICBjb25zdCByZXNvbHZlZEZpbGVXaXRob3V0RXh0ZW5zaW9uID0gcmVzb2x2ZShmaWxlV2l0aG91dEV4dGVuc2lvbiwgY29udGV4dCk7XHJcblxyXG4gICAgICByZXR1cm4gcmVzb2x2ZWRGaWxlV2l0aG91dEV4dGVuc2lvbiA9PT0gcmVzb2x2ZShmaWxlLCBjb250ZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc0V4dGVybmFsUm9vdE1vZHVsZShmaWxlLCBjb250ZXh0KSB7XHJcbiAgICAgIGNvbnN0IHNsYXNoQ291bnQgPSBmaWxlLnNwbGl0KCcvJykubGVuZ3RoIC0gMTtcclxuXHJcbiAgICAgIGlmIChzbGFzaENvdW50ID09PSAwKSAgcmV0dXJuIHRydWU7XHJcbiAgICAgIFxyXG4gICAgICAvKipcclxuICAgICAgICAgICogdHJlYXQgY3VzdG9tIGFsaWFzZXMgYXMgaW50ZXJuYWwgbW9kdWxlc1xyXG4gICAgICAgICAgKiBMaWtlIGBpbXBvcnQgc3VtIGZyb20gJ0BzcmMvc3VtJ2BcclxuICAgICAgICAgICogQGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvZXNsaW50LWltcG9ydC1yZXNvbHZlci1hbGlhc1xyXG4gICAgICAgICAgKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW1wb3J0LWpzL2VzbGludC1wbHVnaW4taW1wb3J0L2lzc3Vlcy8yMzY1XHJcbiAgICAgICovXHJcbiAgICAgICAgaWYgKGNvbnRleHQuc2V0dGluZ3MgJiYgY29udGV4dC5zZXR0aW5nc1snaW1wb3J0L3Jlc29sdmVyJ10gJiYgY29udGV4dC5zZXR0aW5nc1snaW1wb3J0L3Jlc29sdmVyJ10uYWxpYXMpIHtcclxuICAgICAgICAgIGxldCBhbGlhc2VzO1xyXG5cclxuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvbnRleHQuc2V0dGluZ3NbJ2ltcG9ydC9yZXNvbHZlciddLmFsaWFzKSkge1xyXG4gICAgICAgICAgICAgIGFsaWFzZXMgPSBjb250ZXh0LnNldHRpbmdzWydpbXBvcnQvcmVzb2x2ZXInXS5hbGlhcztcclxuICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShjb250ZXh0LnNldHRpbmdzWydpbXBvcnQvcmVzb2x2ZXInXS5hbGlhcy5tYXApKSB7XHJcbiAgICAgICAgICAgICAgYWxpYXNlcyA9IGNvbnRleHQuc2V0dGluZ3NbJ2ltcG9ydC9yZXNvbHZlciddLmFsaWFzLm1hcC5tYXAoKFthbGlhc10pID0+IGFsaWFzKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgYWxpYXNlcyA9IFtdO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChhbGlhc2VzLnNvbWUoKGFsaWFzKSA9PiBmaWxlLnN0YXJ0c1dpdGgoYCR7YWxpYXN9L2ApKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGlmIChpc1Njb3BlZChmaWxlKSAmJiBzbGFzaENvdW50IDw9IDEpIHJldHVybiB0cnVlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2hlY2tGaWxlRXh0ZW5zaW9uKHNvdXJjZSwgbm9kZSkge1xyXG4gICAgICAvLyBiYWlsIGlmIHRoZSBkZWNsYXJhdGlvbiBkb2Vzbid0IGhhdmUgYSBzb3VyY2UsIGUuZy4gXCJleHBvcnQgeyBmb28gfTtcIiwgb3IgaWYgaXQncyBvbmx5IHBhcnRpYWxseSB0eXBlZCBsaWtlIGluIGFuIGVkaXRvclxyXG4gICAgICBpZiAoIXNvdXJjZSB8fCAhc291cmNlLnZhbHVlKSByZXR1cm47XHJcblxyXG4gICAgICBjb25zdCBpbXBvcnRQYXRoV2l0aFF1ZXJ5U3RyaW5nID0gc291cmNlLnZhbHVlO1xyXG5cclxuICAgICAgLy8gZG9uJ3QgZW5mb3JjZSBhbnl0aGluZyBvbiBidWlsdGluc1xyXG4gICAgICBpZiAoaXNCdWlsdEluKGltcG9ydFBhdGhXaXRoUXVlcnlTdHJpbmcsIGNvbnRleHQuc2V0dGluZ3MpKSByZXR1cm47XHJcblxyXG4gICAgICBjb25zdCBpbXBvcnRQYXRoID0gaW1wb3J0UGF0aFdpdGhRdWVyeVN0cmluZy5yZXBsYWNlKC9cXD8oLiopJC8sICcnKTtcclxuXHJcbiAgICAgIC8vIGRvbid0IGVuZm9yY2UgaW4gcm9vdCBleHRlcm5hbCBwYWNrYWdlcyBhcyB0aGV5IG1heSBoYXZlIG5hbWVzIHdpdGggYC5qc2AuXHJcbiAgICAgIC8vIExpa2UgYGltcG9ydCBEZWNpbWFsIGZyb20gZGVjaW1hbC5qc2ApXHJcbiAgICAgIGlmIChpc0V4dGVybmFsUm9vdE1vZHVsZShpbXBvcnRQYXRoLCBjb250ZXh0KSkgcmV0dXJuO1xyXG5cclxuICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gcmVzb2x2ZShpbXBvcnRQYXRoLCBjb250ZXh0KTtcclxuXHJcbiAgICAgIC8vIGdldCBleHRlbnNpb24gZnJvbSByZXNvbHZlZCBwYXRoLCBpZiBwb3NzaWJsZS5cclxuICAgICAgLy8gZm9yIHVucmVzb2x2ZWQsIHVzZSBzb3VyY2UgdmFsdWUuXHJcbiAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IHBhdGguZXh0bmFtZShyZXNvbHZlZFBhdGggfHwgaW1wb3J0UGF0aCkuc3Vic3RyaW5nKDEpO1xyXG5cclxuICAgICAgLy8gZGV0ZXJtaW5lIGlmIHRoaXMgaXMgYSBtb2R1bGVcclxuICAgICAgY29uc3QgaXNQYWNrYWdlID0gaXNFeHRlcm5hbE1vZHVsZShcclxuICAgICAgICBpbXBvcnRQYXRoLFxyXG4gICAgICAgIHJlc29sdmUoaW1wb3J0UGF0aCwgY29udGV4dCksXHJcbiAgICAgICAgY29udGV4dCxcclxuICAgICAgKSB8fCBpc1Njb3BlZChpbXBvcnRQYXRoKTtcclxuXHJcbiAgICAgIGlmICghZXh0ZW5zaW9uIHx8ICFpbXBvcnRQYXRoLmVuZHNXaXRoKGAuJHtleHRlbnNpb259YCkpIHtcclxuICAgICAgICAvLyBpZ25vcmUgdHlwZS1vbmx5IGltcG9ydHMgYW5kIGV4cG9ydHNcclxuICAgICAgICBpZiAobm9kZS5pbXBvcnRLaW5kID09PSAndHlwZScgfHwgbm9kZS5leHBvcnRLaW5kID09PSAndHlwZScpIHJldHVybjtcclxuICAgICAgICBjb25zdCBleHRlbnNpb25SZXF1aXJlZCA9IGlzVXNlT2ZFeHRlbnNpb25SZXF1aXJlZChleHRlbnNpb24sIGlzUGFja2FnZSk7XHJcbiAgICAgICAgY29uc3QgZXh0ZW5zaW9uRm9yYmlkZGVuID0gaXNVc2VPZkV4dGVuc2lvbkZvcmJpZGRlbihleHRlbnNpb24pO1xyXG4gICAgICAgIGlmIChleHRlbnNpb25SZXF1aXJlZCAmJiAhZXh0ZW5zaW9uRm9yYmlkZGVuKSB7XHJcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgICAgIG5vZGU6IHNvdXJjZSxcclxuICAgICAgICAgICAgbWVzc2FnZTpcclxuICAgICAgICAgICAgICBgTWlzc2luZyBmaWxlIGV4dGVuc2lvbiAke2V4dGVuc2lvbiA/IGBcIiR7ZXh0ZW5zaW9ufVwiIGAgOiAnJ31mb3IgXCIke2ltcG9ydFBhdGhXaXRoUXVlcnlTdHJpbmd9XCJgLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKGV4dGVuc2lvbikge1xyXG4gICAgICAgIGlmIChpc1VzZU9mRXh0ZW5zaW9uRm9yYmlkZGVuKGV4dGVuc2lvbikgJiYgaXNSZXNvbHZhYmxlV2l0aG91dEV4dGVuc2lvbihpbXBvcnRQYXRoKSkge1xyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICBub2RlOiBzb3VyY2UsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IGBVbmV4cGVjdGVkIHVzZSBvZiBmaWxlIGV4dGVuc2lvbiBcIiR7ZXh0ZW5zaW9ufVwiIGZvciBcIiR7aW1wb3J0UGF0aFdpdGhRdWVyeVN0cmluZ31cImAsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbW9kdWxlVmlzaXRvcihjaGVja0ZpbGVFeHRlbnNpb24sIHsgY29tbW9uanM6IHRydWUgfSk7XHJcbiAgfSxcclxufTtcclxuIl19