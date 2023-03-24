'use strict';var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _path = require('path');var path = _interopRequireWildcard(_path);
var _ExportMap = require('../ExportMap');var _ExportMap2 = _interopRequireDefault(_ExportMap);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj['default'] = obj;return newObj;}}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      category: 'Static analysis',
      description: 'Ensure named imports correspond to a named export in the remote file.',
      url: (0, _docsUrl2['default'])('named') },

    schema: [
    {
      type: 'object',
      properties: {
        commonjs: {
          type: 'boolean' } },


      additionalProperties: false }] },




  create: function () {function create(context) {
      var options = context.options[0] || {};

      function checkSpecifiers(key, type, node) {
        // ignore local exports and type imports/exports
        if (
        node.source == null ||
        node.importKind === 'type' ||
        node.importKind === 'typeof' ||
        node.exportKind === 'type')
        {
          return;
        }

        if (!node.specifiers.some(function (im) {return im.type === type;})) {
          return; // no named imports/exports
        }

        var imports = _ExportMap2['default'].get(node.source.value, context);
        if (imports == null || imports.parseGoal === 'ambiguous') {
          return;
        }

        if (imports.errors.length) {
          imports.reportErrors(context, node);
          return;
        }

        node.specifiers.forEach(function (im) {
          if (
          im.type !== type
          // ignore type imports
          || im.importKind === 'type' || im.importKind === 'typeof')
          {
            return;
          }

          var name = im[key].name || im[key].value;

          var deepLookup = imports.hasDeep(name);

          if (!deepLookup.found) {
            if (deepLookup.path.length > 1) {
              var deepPath = deepLookup.path.
              map(function (i) {return path.relative(path.dirname(context.getPhysicalFilename ? context.getPhysicalFilename() : context.getFilename()), i.path);}).
              join(' -> ');

              context.report(im[key], String(name) + ' not found via ' + String(deepPath));
            } else {
              context.report(im[key], name + ' not found in \'' + node.source.value + '\'');
            }
          }
        });
      }

      function checkRequire(node) {
        if (
        !options.commonjs ||
        node.type !== 'VariableDeclarator'
        // return if it's not an object destructure or it's an empty object destructure
        || !node.id || node.id.type !== 'ObjectPattern' || node.id.properties.length === 0
        // return if there is no call expression on the right side
        || !node.init || node.init.type !== 'CallExpression')
        {
          return;
        }

        var call = node.init;var _call$arguments = _slicedToArray(
        call.arguments, 1),source = _call$arguments[0];
        var variableImports = node.id.properties;
        var variableExports = _ExportMap2['default'].get(source.value, context);

        if (
        // return if it's not a commonjs require statement
        call.callee.type !== 'Identifier' || call.callee.name !== 'require' || call.arguments.length !== 1
        // return if it's not a string source
        || source.type !== 'Literal' ||
        variableExports == null ||
        variableExports.parseGoal === 'ambiguous')
        {
          return;
        }

        if (variableExports.errors.length) {
          variableExports.reportErrors(context, node);
          return;
        }

        variableImports.forEach(function (im) {
          if (im.type !== 'Property' || !im.key || im.key.type !== 'Identifier') {
            return;
          }

          var deepLookup = variableExports.hasDeep(im.key.name);

          if (!deepLookup.found) {
            if (deepLookup.path.length > 1) {
              var deepPath = deepLookup.path.
              map(function (i) {return path.relative(path.dirname(context.getFilename()), i.path);}).
              join(' -> ');

              context.report(im.key, String(im.key.name) + ' not found via ' + String(deepPath));
            } else {
              context.report(im.key, im.key.name + ' not found in \'' + source.value + '\'');
            }
          }
        });
      }

      return {
        ImportDeclaration: checkSpecifiers.bind(null, 'imported', 'ImportSpecifier'),

        ExportNamedDeclaration: checkSpecifiers.bind(null, 'local', 'ExportSpecifier'),

        VariableDeclarator: checkRequire };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uYW1lZC5qcyJdLCJuYW1lcyI6WyJwYXRoIiwibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJ1cmwiLCJzY2hlbWEiLCJwcm9wZXJ0aWVzIiwiY29tbW9uanMiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsImNyZWF0ZSIsImNvbnRleHQiLCJvcHRpb25zIiwiY2hlY2tTcGVjaWZpZXJzIiwia2V5Iiwibm9kZSIsInNvdXJjZSIsImltcG9ydEtpbmQiLCJleHBvcnRLaW5kIiwic3BlY2lmaWVycyIsInNvbWUiLCJpbSIsImltcG9ydHMiLCJFeHBvcnRzIiwiZ2V0IiwidmFsdWUiLCJwYXJzZUdvYWwiLCJlcnJvcnMiLCJsZW5ndGgiLCJyZXBvcnRFcnJvcnMiLCJmb3JFYWNoIiwibmFtZSIsImRlZXBMb29rdXAiLCJoYXNEZWVwIiwiZm91bmQiLCJkZWVwUGF0aCIsIm1hcCIsInJlbGF0aXZlIiwiZGlybmFtZSIsImdldFBoeXNpY2FsRmlsZW5hbWUiLCJnZXRGaWxlbmFtZSIsImkiLCJqb2luIiwicmVwb3J0IiwiY2hlY2tSZXF1aXJlIiwiaWQiLCJpbml0IiwiY2FsbCIsImFyZ3VtZW50cyIsInZhcmlhYmxlSW1wb3J0cyIsInZhcmlhYmxlRXhwb3J0cyIsImNhbGxlZSIsIkltcG9ydERlY2xhcmF0aW9uIiwiYmluZCIsIkV4cG9ydE5hbWVkRGVjbGFyYXRpb24iLCJWYXJpYWJsZURlY2xhcmF0b3IiXSwibWFwcGluZ3MiOiJxb0JBQUEsNEIsSUFBWUEsSTtBQUNaLHlDO0FBQ0EscUM7O0FBRUFDLE9BQU9DLE9BQVAsR0FBaUI7QUFDZkMsUUFBTTtBQUNKQyxVQUFNLFNBREY7QUFFSkMsVUFBTTtBQUNKQyxnQkFBVSxpQkFETjtBQUVKQyxtQkFBYSx1RUFGVDtBQUdKQyxXQUFLLDBCQUFRLE9BQVIsQ0FIRCxFQUZGOztBQU9KQyxZQUFRO0FBQ047QUFDRUws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Q3JCLGdCQUFJRixXQUFXbkMsSUFBWCxDQUFnQitCLE1BQWhCLEdBQXlCLENBQTdCLEVBQWdDO0FBQzlCLGtCQUFNTyxXQUFXSCxXQUFXbkMsSUFBWDtBQUNkdUMsaUJBRGMsQ0FDVixxQkFBS3ZDLEtBQUt3QyxRQUFMLENBQWN4QyxLQUFLeUMsT0FBTCxDQUFhM0IsUUFBUTZCLFdBQVIsRUFBYixDQUFkLEVBQW1EQyxFQUFFNUMsSUFBckQsQ0FBTCxFQURVO0FBRWQ2QyxrQkFGYyxDQUVULE1BRlMsQ0FBakI7O0FBSUEvQixzQkFBUWdDLE1BQVIsQ0FBZXRCLEdBQUdQLEdBQWxCLFNBQTBCTyxHQUFHUCxHQUFILENBQU9pQixJQUFqQywrQkFBdURJLFFBQXZEO0FBQ0QsYUFORCxNQU1PO0FBQ0x4QixzQkFBUWdDLE1BQVIsQ0FBZXRCLEdBQUdQLEdBQWxCLEVBQXVCTyxHQUFHUCxHQUFILENBQU9pQixJQUFQLEdBQWMsa0JBQWQsR0FBbUNmLE9BQU9TLEtBQTFDLEdBQWtELElBQXpFO0FBQ0Q7QUFDRjtBQUNGLFNBbEJEO0FBbUJEOztBQUVELGFBQU87QUFDTDJCLDJCQUFtQnZDLGdCQUFnQndDLElBQWhCLENBQXFCLElBQXJCLEVBQTJCLFVBQTNCLEVBQXVDLGlCQUF2QyxDQURkOztBQUdMQyxnQ0FBd0J6QyxnQkFBZ0J3QyxJQUFoQixDQUFxQixJQUFyQixFQUEyQixPQUEzQixFQUFvQyxpQkFBcEMsQ0FIbkI7O0FBS0xFLDRCQUFvQlgsWUFMZixFQUFQOztBQU9ELEtBekljLG1CQUFqQiIsImZpbGUiOiJuYW1lZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCBFeHBvcnRzIGZyb20gJy4uL0V4cG9ydE1hcCc7XHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3Byb2JsZW0nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICBjYXRlZ29yeTogJ1N0YXRpYyBhbmFseXNpcycsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnRW5zdXJlIG5hbWVkIGltcG9ydHMgY29ycmVzcG9uZCB0byBhIG5hbWVkIGV4cG9ydCBpbiB0aGUgcmVtb3RlIGZpbGUuJyxcclxuICAgICAgdXJsOiBkb2NzVXJsKCduYW1lZCcpLFxyXG4gICAgfSxcclxuICAgIHNjaGVtYTogW1xyXG4gICAgICB7XHJcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgY29tbW9uanM6IHtcclxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlKGNvbnRleHQpIHtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBjb250ZXh0Lm9wdGlvbnNbMF0gfHwge307XHJcblxyXG4gICAgZnVuY3Rpb24gY2hlY2tTcGVjaWZpZXJzKGtleSwgdHlwZSwgbm9kZSkge1xyXG4gICAgICAvLyBpZ25vcmUgbG9jYWwgZXhwb3J0cyBhbmQgdHlwZSBpbXBvcnRzL2V4cG9ydHNcclxuICAgICAgaWYgKFxyXG4gICAgICAgIG5vZGUuc291cmNlID09IG51bGxcclxuICAgICAgICB8fCBub2RlLmltcG9ydEtpbmQgPT09ICd0eXBlJ1xyXG4gICAgICAgIHx8IG5vZGUuaW1wb3J0S2luZCA9PT0gJ3R5cGVvZidcclxuICAgICAgICB8fCBub2RlLmV4cG9ydEtpbmQgPT09ICd0eXBlJ1xyXG4gICAgICApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghbm9kZS5zcGVjaWZpZXJzLnNvbWUoKGltKSA9PiBpbS50eXBlID09PSB0eXBlKSkge1xyXG4gICAgICAgIHJldHVybjsgLy8gbm8gbmFtZWQgaW1wb3J0cy9leHBvcnRzXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGltcG9ydHMgPSBFeHBvcnRzLmdldChub2RlLnNvdXJjZS52YWx1ZSwgY29udGV4dCk7XHJcbiAgICAgIGlmIChpbXBvcnRzID09IG51bGwgfHwgaW1wb3J0cy5wYXJzZUdvYWwgPT09ICdhbWJpZ3VvdXMnKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaW1wb3J0cy5lcnJvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgaW1wb3J0cy5yZXBvcnRFcnJvcnMoY29udGV4dCwgbm9kZSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBub2RlLnNwZWNpZmllcnMuZm9yRWFjaChmdW5jdGlvbiAoaW0pIHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICBpbS50eXBlICE9PSB0eXBlXHJcbiAgICAgICAgICAvLyBpZ25vcmUgdHlwZSBpbXBvcnRzXHJcbiAgICAgICAgICB8fCBpbS5pbXBvcnRLaW5kID09PSAndHlwZScgfHwgaW0uaW1wb3J0S2luZCA9PT0gJ3R5cGVvZidcclxuICAgICAgICApIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBpbVtrZXldLm5hbWUgfHwgaW1ba2V5XS52YWx1ZTtcclxuXHJcbiAgICAgICAgY29uc3QgZGVlcExvb2t1cCA9IGltcG9ydHMuaGFzRGVlcChuYW1lKTtcclxuXHJcbiAgICAgICAgaWYgKCFkZWVwTG9va3VwLmZvdW5kKSB7XHJcbiAgICAgICAgICBpZiAoZGVlcExvb2t1cC5wYXRoLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgY29uc3QgZGVlcFBhdGggPSBkZWVwTG9va3VwLnBhdGhcclxuICAgICAgICAgICAgICAubWFwKGkgPT4gcGF0aC5yZWxhdGl2ZShwYXRoLmRpcm5hbWUoY29udGV4dC5nZXRQaHlzaWNhbEZpbGVuYW1lID8gY29udGV4dC5nZXRQaHlzaWNhbEZpbGVuYW1lKCkgOiBjb250ZXh0LmdldEZpbGVuYW1lKCkpLCBpLnBhdGgpKVxyXG4gICAgICAgICAgICAgIC5qb2luKCcgLT4gJyk7XHJcblxyXG4gICAgICAgICAgICBjb250ZXh0LnJlcG9ydChpbVtrZXldLCBgJHtuYW1lfSBub3QgZm91bmQgdmlhICR7ZGVlcFBhdGh9YCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb250ZXh0LnJlcG9ydChpbVtrZXldLCBuYW1lICsgJyBub3QgZm91bmQgaW4gXFwnJyArIG5vZGUuc291cmNlLnZhbHVlICsgJ1xcJycpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2hlY2tSZXF1aXJlKG5vZGUpIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgICFvcHRpb25zLmNvbW1vbmpzXHJcbiAgICAgICAgfHwgbm9kZS50eXBlICE9PSAnVmFyaWFibGVEZWNsYXJhdG9yJ1xyXG4gICAgICAgIC8vIHJldHVybiBpZiBpdCdzIG5vdCBhbiBvYmplY3QgZGVzdHJ1Y3R1cmUgb3IgaXQncyBhbiBlbXB0eSBvYmplY3QgZGVzdHJ1Y3R1cmVcclxuICAgICAgICB8fCAhbm9kZS5pZCB8fCBub2RlLmlkLnR5cGUgIT09ICdPYmplY3RQYXR0ZXJuJyB8fCBub2RlLmlkLnByb3BlcnRpZXMubGVuZ3RoID09PSAwXHJcbiAgICAgICAgLy8gcmV0dXJuIGlmIHRoZXJlIGlzIG5vIGNhbGwgZXhwcmVzc2lvbiBvbiB0aGUgcmlnaHQgc2lkZVxyXG4gICAgICAgIHx8ICFub2RlLmluaXQgfHwgbm9kZS5pbml0LnR5cGUgIT09ICdDYWxsRXhwcmVzc2lvbidcclxuICAgICAgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBjYWxsID0gbm9kZS5pbml0O1xyXG4gICAgICBjb25zdCBbc291cmNlXSA9IGNhbGwuYXJndW1lbnRzO1xyXG4gICAgICBjb25zdCB2YXJpYWJsZUltcG9ydHMgPSBub2RlLmlkLnByb3BlcnRpZXM7XHJcbiAgICAgIGNvbnN0IHZhcmlhYmxlRXhwb3J0cyA9IEV4cG9ydHMuZ2V0KHNvdXJjZS52YWx1ZSwgY29udGV4dCk7XHJcblxyXG4gICAgICBpZiAoXHJcbiAgICAgICAgLy8gcmV0dXJuIGlmIGl0J3Mgbm90IGEgY29tbW9uanMgcmVxdWlyZSBzdGF0ZW1lbnRcclxuICAgICAgICBjYWxsLmNhbGxlZS50eXBlICE9PSAnSWRlbnRpZmllcicgfHwgY2FsbC5jYWxsZWUubmFtZSAhPT0gJ3JlcXVpcmUnIHx8IGNhbGwuYXJndW1lbnRzLmxlbmd0aCAhPT0gMVxyXG4gICAgICAgIC8vIHJldHVybiBpZiBpdCdzIG5vdCBhIHN0cmluZyBzb3VyY2VcclxuICAgICAgICB8fCBzb3VyY2UudHlwZSAhPT0gJ0xpdGVyYWwnXHJcbiAgICAgICAgfHwgdmFyaWFibGVFeHBvcnRzID09IG51bGxcclxuICAgICAgICB8fCB2YXJpYWJsZUV4cG9ydHMucGFyc2VHb2FsID09PSAnYW1iaWd1b3VzJ1xyXG4gICAgICApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh2YXJpYWJsZUV4cG9ydHMuZXJyb3JzLmxlbmd0aCkge1xyXG4gICAgICAgIHZhcmlhYmxlRXhwb3J0cy5yZXBvcnRFcnJvcnMoY29udGV4dCwgbm9kZSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXJpYWJsZUltcG9ydHMuZm9yRWFjaChmdW5jdGlvbiAoaW0pIHtcclxuICAgICAgICBpZiAoaW0udHlwZSAhPT0gJ1Byb3BlcnR5JyB8fCAhaW0ua2V5IHx8IGltLmtleS50eXBlICE9PSAnSWRlbnRpZmllcicpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRlZXBMb29rdXAgPSB2YXJpYWJsZUV4cG9ydHMuaGFzRGVlcChpbS5rZXkubmFtZSk7XHJcblxyXG4gICAgICAgIGlmICghZGVlcExvb2t1cC5mb3VuZCkge1xyXG4gICAgICAgICAgaWYgKGRlZXBMb29rdXAucGF0aC5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlZXBQYXRoID0gZGVlcExvb2t1cC5wYXRoXHJcbiAgICAgICAgICAgICAgLm1hcChpID0+IHBhdGgucmVsYXRpdmUocGF0aC5kaXJuYW1lKGNvbnRleHQuZ2V0RmlsZW5hbWUoKSksIGkucGF0aCkpXHJcbiAgICAgICAgICAgICAgLmpvaW4oJyAtPiAnKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KGltLmtleSwgYCR7aW0ua2V5Lm5hbWV9IG5vdCBmb3VuZCB2aWEgJHtkZWVwUGF0aH1gKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KGltLmtleSwgaW0ua2V5Lm5hbWUgKyAnIG5vdCBmb3VuZCBpbiBcXCcnICsgc291cmNlLnZhbHVlICsgJ1xcJycpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgSW1wb3J0RGVjbGFyYXRpb246IGNoZWNrU3BlY2lmaWVycy5iaW5kKG51bGwsICdpbXBvcnRlZCcsICdJbXBvcnRTcGVjaWZpZXInKSxcclxuXHJcbiAgICAgIEV4cG9ydE5hbWVkRGVjbGFyYXRpb246IGNoZWNrU3BlY2lmaWVycy5iaW5kKG51bGwsICdsb2NhbCcsICdFeHBvcnRTcGVjaWZpZXInKSxcclxuXHJcbiAgICAgIFZhcmlhYmxlRGVjbGFyYXRvcjogY2hlY2tSZXF1aXJlLFxyXG4gICAgfTtcclxuICB9LFxyXG59O1xyXG4iXX0=