'use strict';var _declaredScope = require('eslint-module-utils/declaredScope');var _declaredScope2 = _interopRequireDefault(_declaredScope);
var _ExportMap = require('../ExportMap');var _ExportMap2 = _interopRequireDefault(_ExportMap);
var _importDeclaration = require('../importDeclaration');var _importDeclaration2 = _interopRequireDefault(_importDeclaration);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

function processBodyStatement(context, namespaces, declaration) {
  if (declaration.type !== 'ImportDeclaration') return;

  if (declaration.specifiers.length === 0) return;

  var imports = _ExportMap2['default'].get(declaration.source.value, context);
  if (imports == null) return null;

  if (imports.errors.length > 0) {
    imports.reportErrors(context, declaration);
    return;
  }

  declaration.specifiers.forEach(function (specifier) {
    switch (specifier.type) {
      case 'ImportNamespaceSpecifier':
        if (!imports.size) {
          context.report(
          specifier, 'No exported names found in module \'' + String(
          declaration.source.value) + '\'.');

        }
        namespaces.set(specifier.local.name, imports);
        break;
      case 'ImportDefaultSpecifier':
      case 'ImportSpecifier':{
          var meta = imports.get(
          // default to 'default' for default https://i.imgur.com/nj6qAWy.jpg
          specifier.imported ? specifier.imported.name || specifier.imported.value : 'default');

          if (!meta || !meta.namespace) {break;}
          namespaces.set(specifier.local.name, meta.namespace);
          break;
        }}

  });
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      category: 'Static analysis',
      description: 'Ensure imported namespaces contain dereferenced properties as they are dereferenced.',
      url: (0, _docsUrl2['default'])('namespace') },


    schema: [
    {
      type: 'object',
      properties: {
        allowComputed: {
          description: 'If `false`, will report computed (and thus, un-lintable) references to namespace members.',
          type: 'boolean',
          'default': false } },


      additionalProperties: false }] },




  create: function () {function namespaceRule(context) {

      // read options
      var _ref =

      context.options[0] || {},_ref$allowComputed = _ref.allowComputed,allowComputed = _ref$allowComputed === undefined ? false : _ref$allowComputed;

      var namespaces = new Map();

      function makeMessage(last, namepath) {
        return '\'' + String(last.name) + '\' not found in ' + (namepath.length > 1 ? 'deeply ' : '') + 'imported namespace \'' + String(namepath.join('.')) + '\'.';
      }

      return {
        // pick up all imports at body entry time, to properly respect hoisting
        Program: function () {function Program(_ref2) {var body = _ref2.body;
            body.forEach(function (x) {return processBodyStatement(context, namespaces, x);});
          }return Program;}(),

        // same as above, but does not add names to local map
        ExportNamespaceSpecifier: function () {function ExportNamespaceSpecifier(namespace) {
            var declaration = (0, _importDeclaration2['default'])(context);

            var imports = _ExportMap2['default'].get(declaration.source.value, context);
            if (imports == null) return null;

            if (imports.errors.length) {
              imports.reportErrors(context, declaration);
              return;
            }

            if (!imports.size) {
              context.report(
              namespace, 'No exported names found in module \'' + String(
              declaration.source.value) + '\'.');

            }
          }return ExportNamespaceSpecifier;}(),

        // todo: check for possible redefinition

        MemberExpression: function () {function MemberExpression(dereference) {
            if (dereference.object.type !== 'Identifier') return;
            if (!namespaces.has(dereference.object.name)) return;
            if ((0, _declaredScope2['default'])(context, dereference.object.name) !== 'module') return;

            if (dereference.parent.type === 'AssignmentExpression' && dereference.parent.left === dereference) {
              context.report(
              dereference.parent, 'Assignment to member of namespace \'' + String(
              dereference.object.name) + '\'.');

            }

            // go deep
            var namespace = namespaces.get(dereference.object.name);
            var namepath = [dereference.object.name];
            // while property is namespace and parent is member expression, keep validating
            while (namespace instanceof _ExportMap2['default'] && dereference.type === 'MemberExpression') {
              if (dereference.computed) {
                if (!allowComputed) {
                  context.report(
                  dereference.property, 'Unable to validate computed reference to imported namespace \'' + String(
                  dereference.object.name) + '\'.');

                }
                return;
              }

              if (!namespace.has(dereference.property.name)) {
                context.report(
                dereference.property,
                makeMessage(dereference.property, namepath));

                break;
              }

              var exported = namespace.get(dereference.property.name);
              if (exported == null) return;

              // stash and pop
              namepath.push(dereference.property.name);
              namespace = exported.namespace;
              dereference = dereference.parent;
            }
          }return MemberExpression;}(),

        VariableDeclarator: function () {function VariableDeclarator(_ref3) {var id = _ref3.id,init = _ref3.init;
            if (init == null) return;
            if (init.type !== 'Identifier') return;
            if (!namespaces.has(init.name)) return;

            // check for redefinition in intermediate scopes
            if ((0, _declaredScope2['default'])(context, init.name) !== 'module') return;

            // DFS traverse child namespaces
            function testKey(pattern, namespace) {var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [init.name];
              if (!(namespace instanceof _ExportMap2['default'])) return;

              if (pattern.type !== 'ObjectPattern') return;var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {

                for (var _iterator = pattern.properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var property = _step.value;
                  if (
                  property.type === 'ExperimentalRestProperty' ||
                  property.type === 'RestElement' ||
                  !property.key)
                  {
                    continue;
                  }

                  if (property.key.type !== 'Identifier') {
                    context.report({
                      node: property,
                      message: 'Only destructure top-level names.' });

                    continue;
                  }

                  if (!namespace.has(property.key.name)) {
                    context.report({
                      node: property,
                      message: makeMessage(property.key, path) });

                    continue;
                  }

                  path.push(property.key.name);
                  var dependencyExportMap = namespace.get(property.key.name);
                  // could be null when ignored or ambiguous
                  if (dependencyExportMap !== null) {
                    testKey(property.value, dependencyExportMap.namespace, path);
                  }
                  path.pop();
                }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
            }

            testKey(id, namespaces.get(init.name));
          }return VariableDeclarator;}(),

        JSXMemberExpression: function () {function JSXMemberExpression(_ref4) {var object = _ref4.object,property = _ref4.property;
            if (!namespaces.has(object.name)) return;
            var namespace = namespaces.get(object.name);
            if (!namespace.has(property.name)) {
              context.report({
                node: property,
                message: makeMessage(property, [object.name]) });

            }
          }return JSXMemberExpression;}() };

    }return namespaceRule;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uYW1lc3BhY2UuanMiXSwibmFtZXMiOlsicHJvY2Vzc0JvZHlTdGF0ZW1lbnQiLCJjb250ZXh0IiwibmFtZXNwYWNlcyIsImRlY2xhcmF0aW9uIiwidHlwZSIsInNwZWNpZmllcnMiLCJsZW5ndGgiLCJpbXBvcnRzIiwiRXhwb3J0cyIsImdldCIsInNvdXJjZSIsInZhbHVlIiwiZXJyb3JzIiwicmVwb3J0RXJyb3JzIiwiZm9yRWFjaCIsInNwZWNpZmllciIsInNpemUiLCJyZXBvcnQiLCJzZXQiLCJsb2NhbCIsIm5hbWUiLCJtZXRhIiwiaW1wb3J0ZWQiLCJuYW1lc3BhY2UiLCJtb2R1bGUiLCJleHBvcnRzIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJ1cmwiLCJzY2hlbWEiLCJwcm9wZXJ0aWVzIiwiYWxsb3dDb21wdXRlZCIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwiY3JlYXRlIiwibmFtZXNwYWNlUnVsZSIsIm9wdGlvbnMiLCJNYXAiLCJtYWtlTWVzc2FnZSIsImxhc3QiLCJuYW1lcGF0aCIsImpvaW4iLCJQcm9ncmFtIiwiYm9keSIsIngiLCJFeHBvcnROYW1lc3BhY2VTcGVjaWZpZXIiLCJNZW1iZXJFeHByZXNzaW9uIiwiZGVyZWZlcmVuY2UiLCJvYmplY3QiLCJoYXMiLCJwYXJlbnQiLCJsZWZ0IiwiY29tcHV0ZWQiLCJwcm9wZXJ0eSIsImV4cG9ydGVkIiwicHVzaCIsIlZhcmlhYmxlRGVjbGFyYXRvciIsImlkIiwiaW5pdCIsInRlc3RLZXkiLCJwYXR0ZXJuIiwicGF0aCIsImtleSIsIm5vZGUiLCJtZXNzYWdlIiwiZGVwZW5kZW5jeUV4cG9ydE1hcCIsInBvcCIsIkpTWE1lbWJlckV4cHJlc3Npb24iXSwibWFwcGluZ3MiOiJhQUFBLGtFO0FBQ0EseUM7QUFDQSx5RDtBQUNBLHFDOztBQUVBLFNBQVNBLG9CQUFULENBQThCQyxPQUE5QixFQUF1Q0MsVUFBdkMsRUFBbURDLFdBQW5ELEVBQWdF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RFAsb0JBQVFGLEVBQVIsRUFBWXZELFdBQVdPLEdBQVgsQ0FBZWlELEtBQUt0QyxJQUFwQixDQUFaO0FBQ0QsV0EzSEk7O0FBNkhMK0MsMkJBN0hLLG1EQTZIcUMsS0FBcEJuQixNQUFvQixTQUFwQkEsTUFBb0IsQ0FBWkssUUFBWSxTQUFaQSxRQUFZO0FBQ3hDLGdCQUFJLENBQUNuRCxXQUFXK0MsR0FBWCxDQUFlRCxPQUFPNUIsSUFBdEIsQ0FBTCxFQUFrQztBQUNsQyxnQkFBTUcsWUFBWXJCLFdBQVdPLEdBQVgsQ0FBZXVDLE9BQU81QixJQUF0QixDQUFsQjtBQUNBLGdCQUFJLENBQUNHLFVBQVUwQixHQUFWLENBQWNJLFNBQVNqQyxJQUF2QixDQUFMLEVBQW1DO0FBQ2pDbkIsc0JBQVFnQixNQUFSLENBQWU7QUFDYjhDLHNCQUFNVixRQURPO0FBRWJXLHlCQUFTMUIsWUFBWWUsUUFBWixFQUFzQixDQUFDTCxPQUFPNUIsSUFBUixDQUF0QixDQUZJLEVBQWY7O0FBSUQ7QUFDRixXQXRJSSxnQ0FBUDs7QUF3SUQsS0FySkQsT0FBaUJlLGFBQWpCLElBeEJlLEVBQWpCIiwiZmlsZSI6Im5hbWVzcGFjZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWNsYXJlZFNjb3BlIGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvZGVjbGFyZWRTY29wZSc7XHJcbmltcG9ydCBFeHBvcnRzIGZyb20gJy4uL0V4cG9ydE1hcCc7XHJcbmltcG9ydCBpbXBvcnREZWNsYXJhdGlvbiBmcm9tICcuLi9pbXBvcnREZWNsYXJhdGlvbic7XHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnO1xyXG5cclxuZnVuY3Rpb24gcHJvY2Vzc0JvZHlTdGF0ZW1lbnQoY29udGV4dCwgbmFtZXNwYWNlcywgZGVjbGFyYXRpb24pIHtcclxuICBpZiAoZGVjbGFyYXRpb24udHlwZSAhPT0gJ0ltcG9ydERlY2xhcmF0aW9uJykgcmV0dXJuO1xyXG5cclxuICBpZiAoZGVjbGFyYXRpb24uc3BlY2lmaWVycy5sZW5ndGggPT09IDApIHJldHVybjtcclxuXHJcbiAgY29uc3QgaW1wb3J0cyA9IEV4cG9ydHMuZ2V0KGRlY2xhcmF0aW9uLnNvdXJjZS52YWx1ZSwgY29udGV4dCk7XHJcbiAgaWYgKGltcG9ydHMgPT0gbnVsbCkgcmV0dXJuIG51bGw7XHJcblxyXG4gIGlmIChpbXBvcnRzLmVycm9ycy5sZW5ndGggPiAwKSB7XHJcbiAgICBpbXBvcnRzLnJlcG9ydEVycm9ycyhjb250ZXh0LCBkZWNsYXJhdGlvbik7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBkZWNsYXJhdGlvbi5zcGVjaWZpZXJzLmZvckVhY2goKHNwZWNpZmllcikgPT4ge1xyXG4gICAgc3dpdGNoIChzcGVjaWZpZXIudHlwZSkge1xyXG4gICAgY2FzZSAnSW1wb3J0TmFtZXNwYWNlU3BlY2lmaWVyJzpcclxuICAgICAgaWYgKCFpbXBvcnRzLnNpemUpIHtcclxuICAgICAgICBjb250ZXh0LnJlcG9ydChcclxuICAgICAgICAgIHNwZWNpZmllcixcclxuICAgICAgICAgIGBObyBleHBvcnRlZCBuYW1lcyBmb3VuZCBpbiBtb2R1bGUgJyR7ZGVjbGFyYXRpb24uc291cmNlLnZhbHVlfScuYCxcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIG5hbWVzcGFjZXMuc2V0KHNwZWNpZmllci5sb2NhbC5uYW1lLCBpbXBvcnRzKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlICdJbXBvcnREZWZhdWx0U3BlY2lmaWVyJzpcclxuICAgIGNhc2UgJ0ltcG9ydFNwZWNpZmllcic6IHtcclxuICAgICAgY29uc3QgbWV0YSA9IGltcG9ydHMuZ2V0KFxyXG4gICAgICAgIC8vIGRlZmF1bHQgdG8gJ2RlZmF1bHQnIGZvciBkZWZhdWx0IGh0dHBzOi8vaS5pbWd1ci5jb20vbmo2cUFXeS5qcGdcclxuICAgICAgICBzcGVjaWZpZXIuaW1wb3J0ZWQgPyAoc3BlY2lmaWVyLmltcG9ydGVkLm5hbWUgfHwgc3BlY2lmaWVyLmltcG9ydGVkLnZhbHVlKSA6ICdkZWZhdWx0JyxcclxuICAgICAgKTtcclxuICAgICAgaWYgKCFtZXRhIHx8ICFtZXRhLm5hbWVzcGFjZSkgeyBicmVhazsgfVxyXG4gICAgICBuYW1lc3BhY2VzLnNldChzcGVjaWZpZXIubG9jYWwubmFtZSwgbWV0YS5uYW1lc3BhY2UpO1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3Byb2JsZW0nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICBjYXRlZ29yeTogJ1N0YXRpYyBhbmFseXNpcycsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnRW5zdXJlIGltcG9ydGVkIG5hbWVzcGFjZXMgY29udGFpbiBkZXJlZmVyZW5jZWQgcHJvcGVydGllcyBhcyB0aGV5IGFyZSBkZXJlZmVyZW5jZWQuJyxcclxuICAgICAgdXJsOiBkb2NzVXJsKCduYW1lc3BhY2UnKSxcclxuICAgIH0sXHJcblxyXG4gICAgc2NoZW1hOiBbXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICBhbGxvd0NvbXB1dGVkOiB7XHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSWYgYGZhbHNlYCwgd2lsbCByZXBvcnQgY29tcHV0ZWQgKGFuZCB0aHVzLCB1bi1saW50YWJsZSkgcmVmZXJlbmNlcyB0byBuYW1lc3BhY2UgbWVtYmVycy4nLFxyXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlOiBmdW5jdGlvbiBuYW1lc3BhY2VSdWxlKGNvbnRleHQpIHtcclxuXHJcbiAgICAvLyByZWFkIG9wdGlvbnNcclxuICAgIGNvbnN0IHtcclxuICAgICAgYWxsb3dDb21wdXRlZCA9IGZhbHNlLFxyXG4gICAgfSA9IGNvbnRleHQub3B0aW9uc1swXSB8fCB7fTtcclxuXHJcbiAgICBjb25zdCBuYW1lc3BhY2VzID0gbmV3IE1hcCgpO1xyXG5cclxuICAgIGZ1bmN0aW9uIG1ha2VNZXNzYWdlKGxhc3QsIG5hbWVwYXRoKSB7XHJcbiAgICAgIHJldHVybiBgJyR7bGFzdC5uYW1lfScgbm90IGZvdW5kIGluICR7bmFtZXBhdGgubGVuZ3RoID4gMSA/ICdkZWVwbHkgJyA6ICcnfWltcG9ydGVkIG5hbWVzcGFjZSAnJHtuYW1lcGF0aC5qb2luKCcuJyl9Jy5gO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIC8vIHBpY2sgdXAgYWxsIGltcG9ydHMgYXQgYm9keSBlbnRyeSB0aW1lLCB0byBwcm9wZXJseSByZXNwZWN0IGhvaXN0aW5nXHJcbiAgICAgIFByb2dyYW0oeyBib2R5IH0pIHtcclxuICAgICAgICBib2R5LmZvckVhY2goeCA9PiBwcm9jZXNzQm9keVN0YXRlbWVudChjb250ZXh0LCBuYW1lc3BhY2VzLCB4KSk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBzYW1lIGFzIGFib3ZlLCBidXQgZG9lcyBub3QgYWRkIG5hbWVzIHRvIGxvY2FsIG1hcFxyXG4gICAgICBFeHBvcnROYW1lc3BhY2VTcGVjaWZpZXIobmFtZXNwYWNlKSB7XHJcbiAgICAgICAgY29uc3QgZGVjbGFyYXRpb24gPSBpbXBvcnREZWNsYXJhdGlvbihjb250ZXh0KTtcclxuXHJcbiAgICAgICAgY29uc3QgaW1wb3J0cyA9IEV4cG9ydHMuZ2V0KGRlY2xhcmF0aW9uLnNvdXJjZS52YWx1ZSwgY29udGV4dCk7XHJcbiAgICAgICAgaWYgKGltcG9ydHMgPT0gbnVsbCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIGlmIChpbXBvcnRzLmVycm9ycy5sZW5ndGgpIHtcclxuICAgICAgICAgIGltcG9ydHMucmVwb3J0RXJyb3JzKGNvbnRleHQsIGRlY2xhcmF0aW9uKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghaW1wb3J0cy5zaXplKSB7XHJcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydChcclxuICAgICAgICAgICAgbmFtZXNwYWNlLFxyXG4gICAgICAgICAgICBgTm8gZXhwb3J0ZWQgbmFtZXMgZm91bmQgaW4gbW9kdWxlICcke2RlY2xhcmF0aW9uLnNvdXJjZS52YWx1ZX0nLmAsXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIHRvZG86IGNoZWNrIGZvciBwb3NzaWJsZSByZWRlZmluaXRpb25cclxuXHJcbiAgICAgIE1lbWJlckV4cHJlc3Npb24oZGVyZWZlcmVuY2UpIHtcclxuICAgICAgICBpZiAoZGVyZWZlcmVuY2Uub2JqZWN0LnR5cGUgIT09ICdJZGVudGlmaWVyJykgcmV0dXJuO1xyXG4gICAgICAgIGlmICghbmFtZXNwYWNlcy5oYXMoZGVyZWZlcmVuY2Uub2JqZWN0Lm5hbWUpKSByZXR1cm47XHJcbiAgICAgICAgaWYgKGRlY2xhcmVkU2NvcGUoY29udGV4dCwgZGVyZWZlcmVuY2Uub2JqZWN0Lm5hbWUpICE9PSAnbW9kdWxlJykgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiAoZGVyZWZlcmVuY2UucGFyZW50LnR5cGUgPT09ICdBc3NpZ25tZW50RXhwcmVzc2lvbicgJiYgZGVyZWZlcmVuY2UucGFyZW50LmxlZnQgPT09IGRlcmVmZXJlbmNlKSB7XHJcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydChcclxuICAgICAgICAgICAgZGVyZWZlcmVuY2UucGFyZW50LFxyXG4gICAgICAgICAgICBgQXNzaWdubWVudCB0byBtZW1iZXIgb2YgbmFtZXNwYWNlICcke2RlcmVmZXJlbmNlLm9iamVjdC5uYW1lfScuYCxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBnbyBkZWVwXHJcbiAgICAgICAgbGV0IG5hbWVzcGFjZSA9IG5hbWVzcGFjZXMuZ2V0KGRlcmVmZXJlbmNlLm9iamVjdC5uYW1lKTtcclxuICAgICAgICBjb25zdCBuYW1lcGF0aCA9IFtkZXJlZmVyZW5jZS5vYmplY3QubmFtZV07XHJcbiAgICAgICAgLy8gd2hpbGUgcHJvcGVydHkgaXMgbmFtZXNwYWNlIGFuZCBwYXJlbnQgaXMgbWVtYmVyIGV4cHJlc3Npb24sIGtlZXAgdmFsaWRhdGluZ1xyXG4gICAgICAgIHdoaWxlIChuYW1lc3BhY2UgaW5zdGFuY2VvZiBFeHBvcnRzICYmIGRlcmVmZXJlbmNlLnR5cGUgPT09ICdNZW1iZXJFeHByZXNzaW9uJykge1xyXG4gICAgICAgICAgaWYgKGRlcmVmZXJlbmNlLmNvbXB1dGVkKSB7XHJcbiAgICAgICAgICAgIGlmICghYWxsb3dDb21wdXRlZCkge1xyXG4gICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KFxyXG4gICAgICAgICAgICAgICAgZGVyZWZlcmVuY2UucHJvcGVydHksXHJcbiAgICAgICAgICAgICAgICBgVW5hYmxlIHRvIHZhbGlkYXRlIGNvbXB1dGVkIHJlZmVyZW5jZSB0byBpbXBvcnRlZCBuYW1lc3BhY2UgJyR7ZGVyZWZlcmVuY2Uub2JqZWN0Lm5hbWV9Jy5gLFxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICghbmFtZXNwYWNlLmhhcyhkZXJlZmVyZW5jZS5wcm9wZXJ0eS5uYW1lKSkge1xyXG4gICAgICAgICAgICBjb250ZXh0LnJlcG9ydChcclxuICAgICAgICAgICAgICBkZXJlZmVyZW5jZS5wcm9wZXJ0eSxcclxuICAgICAgICAgICAgICBtYWtlTWVzc2FnZShkZXJlZmVyZW5jZS5wcm9wZXJ0eSwgbmFtZXBhdGgpLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBleHBvcnRlZCA9IG5hbWVzcGFjZS5nZXQoZGVyZWZlcmVuY2UucHJvcGVydHkubmFtZSk7XHJcbiAgICAgICAgICBpZiAoZXhwb3J0ZWQgPT0gbnVsbCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgIC8vIHN0YXNoIGFuZCBwb3BcclxuICAgICAgICAgIG5hbWVwYXRoLnB1c2goZGVyZWZlcmVuY2UucHJvcGVydHkubmFtZSk7XHJcbiAgICAgICAgICBuYW1lc3BhY2UgPSBleHBvcnRlZC5uYW1lc3BhY2U7XHJcbiAgICAgICAgICBkZXJlZmVyZW5jZSA9IGRlcmVmZXJlbmNlLnBhcmVudDtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBWYXJpYWJsZURlY2xhcmF0b3IoeyBpZCwgaW5pdCB9KSB7XHJcbiAgICAgICAgaWYgKGluaXQgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgIGlmIChpbml0LnR5cGUgIT09ICdJZGVudGlmaWVyJykgcmV0dXJuO1xyXG4gICAgICAgIGlmICghbmFtZXNwYWNlcy5oYXMoaW5pdC5uYW1lKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBjaGVjayBmb3IgcmVkZWZpbml0aW9uIGluIGludGVybWVkaWF0ZSBzY29wZXNcclxuICAgICAgICBpZiAoZGVjbGFyZWRTY29wZShjb250ZXh0LCBpbml0Lm5hbWUpICE9PSAnbW9kdWxlJykgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBERlMgdHJhdmVyc2UgY2hpbGQgbmFtZXNwYWNlc1xyXG4gICAgICAgIGZ1bmN0aW9uIHRlc3RLZXkocGF0dGVybiwgbmFtZXNwYWNlLCBwYXRoID0gW2luaXQubmFtZV0pIHtcclxuICAgICAgICAgIGlmICghKG5hbWVzcGFjZSBpbnN0YW5jZW9mIEV4cG9ydHMpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgaWYgKHBhdHRlcm4udHlwZSAhPT0gJ09iamVjdFBhdHRlcm4nKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgZm9yIChjb25zdCBwcm9wZXJ0eSBvZiBwYXR0ZXJuLnByb3BlcnRpZXMpIHtcclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgIHByb3BlcnR5LnR5cGUgPT09ICdFeHBlcmltZW50YWxSZXN0UHJvcGVydHknXHJcbiAgICAgICAgICAgICAgfHwgcHJvcGVydHkudHlwZSA9PT0gJ1Jlc3RFbGVtZW50J1xyXG4gICAgICAgICAgICAgIHx8ICFwcm9wZXJ0eS5rZXlcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5rZXkudHlwZSAhPT0gJ0lkZW50aWZpZXInKSB7XHJcbiAgICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICAgICAgbm9kZTogcHJvcGVydHksXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnT25seSBkZXN0cnVjdHVyZSB0b3AtbGV2ZWwgbmFtZXMuJyxcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuYW1lc3BhY2UuaGFzKHByb3BlcnR5LmtleS5uYW1lKSkge1xyXG4gICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgICAgIG5vZGU6IHByb3BlcnR5LFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogbWFrZU1lc3NhZ2UocHJvcGVydHkua2V5LCBwYXRoKSxcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcGF0aC5wdXNoKHByb3BlcnR5LmtleS5uYW1lKTtcclxuICAgICAgICAgICAgY29uc3QgZGVwZW5kZW5jeUV4cG9ydE1hcCA9IG5hbWVzcGFjZS5nZXQocHJvcGVydHkua2V5Lm5hbWUpO1xyXG4gICAgICAgICAgICAvLyBjb3VsZCBiZSBudWxsIHdoZW4gaWdub3JlZCBvciBhbWJpZ3VvdXNcclxuICAgICAgICAgICAgaWYgKGRlcGVuZGVuY3lFeHBvcnRNYXAgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICB0ZXN0S2V5KHByb3BlcnR5LnZhbHVlLCBkZXBlbmRlbmN5RXhwb3J0TWFwLm5hbWVzcGFjZSwgcGF0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGF0aC5wb3AoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRlc3RLZXkoaWQsIG5hbWVzcGFjZXMuZ2V0KGluaXQubmFtZSkpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgSlNYTWVtYmVyRXhwcmVzc2lvbih7IG9iamVjdCwgcHJvcGVydHkgfSkge1xyXG4gICAgICAgIGlmICghbmFtZXNwYWNlcy5oYXMob2JqZWN0Lm5hbWUpKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgbmFtZXNwYWNlID0gbmFtZXNwYWNlcy5nZXQob2JqZWN0Lm5hbWUpO1xyXG4gICAgICAgIGlmICghbmFtZXNwYWNlLmhhcyhwcm9wZXJ0eS5uYW1lKSkge1xyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICBub2RlOiBwcm9wZXJ0eSxcclxuICAgICAgICAgICAgbWVzc2FnZTogbWFrZU1lc3NhZ2UocHJvcGVydHksIFtvYmplY3QubmFtZV0pLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfTtcclxuICB9LFxyXG59O1xyXG4iXX0=