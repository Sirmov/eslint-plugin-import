'use strict';var _declaredScope = require('eslint-module-utils/declaredScope');var _declaredScope2 = _interopRequireDefault(_declaredScope);
var _ExportMap = require('../ExportMap');var _ExportMap2 = _interopRequireDefault(_ExportMap);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

function message(deprecation) {
  return 'Deprecated' + (deprecation.description ? ': ' + deprecation.description : '.');
}

function getDeprecation(metadata) {
  if (!metadata || !metadata.doc) return;

  return metadata.doc.tags.find(function (t) {return t.title === 'deprecated';});
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Helpful warnings',
      description: 'Forbid imported names marked with `@deprecated` documentation tag.',
      url: (0, _docsUrl2['default'])('no-deprecated') },

    schema: [] },


  create: function () {function create(context) {
      var deprecated = new Map();
      var namespaces = new Map();

      function checkSpecifiers(node) {
        if (node.type !== 'ImportDeclaration') return;
        if (node.source == null) return; // local export, ignore

        var imports = _ExportMap2['default'].get(node.source.value, context);
        if (imports == null) return;

        var moduleDeprecation = imports.doc && imports.doc.tags.find(function (t) {return t.title === 'deprecated';});
        if (moduleDeprecation) {
          context.report({ node: node, message: message(moduleDeprecation) });
        }

        if (imports.errors.length) {
          imports.reportErrors(context, node);
          return;
        }

        node.specifiers.forEach(function (im) {
          var imported = void 0;var local = void 0;
          switch (im.type) {


            case 'ImportNamespaceSpecifier':{
                if (!imports.size) return;
                namespaces.set(im.local.name, imports);
                return;
              }

            case 'ImportDefaultSpecifier':
              imported = 'default';
              local = im.local.name;
              break;

            case 'ImportSpecifier':
              imported = im.imported.name;
              local = im.local.name;
              break;

            default:return; // can't handle this one
          }

          // unknown thing can't be deprecated
          var exported = imports.get(imported);
          if (exported == null) return;

          // capture import of deep namespace
          if (exported.namespace) namespaces.set(local, exported.namespace);

          var deprecation = getDeprecation(imports.get(imported));
          if (!deprecation) return;

          context.report({ node: im, message: message(deprecation) });

          deprecated.set(local, deprecation);

        });
      }

      return {
        'Program': function () {function Program(_ref) {var body = _ref.body;return body.forEach(checkSpecifiers);}return Program;}(),

        'Identifier': function () {function Identifier(node) {
            if (node.parent.type === 'MemberExpression' && node.parent.property === node) {
              return; // handled by MemberExpression
            }

            // ignore specifier identifiers
            if (node.parent.type.slice(0, 6) === 'Import') return;

            if (!deprecated.has(node.name)) return;

            if ((0, _declaredScope2['default'])(context, node.name) !== 'module') return;
            context.report({
              node: node,
              message: message(deprecated.get(node.name)) });

          }return Identifier;}(),

        'MemberExpression': function () {function MemberExpression(dereference) {
            if (dereference.object.type !== 'Identifier') return;
            if (!namespaces.has(dereference.object.name)) return;

            if ((0, _declaredScope2['default'])(context, dereference.object.name) !== 'module') return;

            // go deep
            var namespace = namespaces.get(dereference.object.name);
            var namepath = [dereference.object.name];
            // while property is namespace and parent is member expression, keep validating
            while (namespace instanceof _ExportMap2['default'] &&
            dereference.type === 'MemberExpression') {

              // ignore computed parts for now
              if (dereference.computed) return;

              var metadata = namespace.get(dereference.property.name);

              if (!metadata) break;
              var deprecation = getDeprecation(metadata);

              if (deprecation) {
                context.report({ node: dereference.property, message: message(deprecation) });
              }

              // stash and pop
              namepath.push(dereference.property.name);
              namespace = metadata.namespace;
              dereference = dereference.parent;
            }
          }return MemberExpression;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1kZXByZWNhdGVkLmpzIl0sIm5hbWVzIjpbIm1lc3NhZ2UiLCJkZXByZWNhdGlvbiIsImRlc2NyaXB0aW9uIiwiZ2V0RGVwcmVjYXRpb24iLCJtZXRhZGF0YSIsImRvYyIsInRhZ3MiLCJmaW5kIiwidCIsInRpdGxlIiwibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsImNhdGVnb3J5IiwidXJsIiwic2NoZW1hIiwiY3JlYXRlIiwiY29udGV4dCIsImRlcHJlY2F0ZWQiLCJNYXAiLCJuYW1lc3BhY2VzIiwiY2hlY2tTcGVjaWZpZXJzIiwibm9kZSIsInNvdXJjZSIsImltcG9ydHMiLCJFeHBvcnRzIiwiZ2V0IiwidmFsdWUiLCJtb2R1bGVEZXByZWNhdGlvbiIsInJlcG9ydCIsImVycm9ycyIsImxlbmd0aCIsInJlcG9ydEVycm9ycyIsInNwZWNpZmllcnMiLCJmb3JFYWNoIiwiaW0iLCJpbXBvcnRlZCIsImxvY2FsIiwic2l6ZSIsInNldCIsIm5hbWUiLCJleHBvcnRlZCIsIm5hbWVzcGFjZSIsImJvZHkiLCJwYXJlbnQiLCJwcm9wZXJ0eSIsInNsaWNlIiwiaGFzIiwiZGVyZWZlcmVuY2UiLCJvYmplY3QiLCJuYW1lcGF0aCIsImNvbXB1dGVkIiwicHVzaCJdLCJtYXBwaW5ncyI6ImFBQUEsa0U7QUFDQSx5QztBQUNBLHFDOztBQUVBLFNBQVNBLE9BQVQsQ0FBaUJDLFdBQWpCLEVBQThCO0FBQzVCLFNBQU8sZ0JBQWdCQSxZQUFZQyxXQUFaLEdBQTBCLE9BQU9ELFlBQVlDLFdBQTdDLEdBQTJELEdBQTNFLENBQVA7QUFDRDs7QUFFRCxTQUFTQyxjQUFULENBQXdCQyxRQUF4QixFQUFrQztBQUNoQyxNQUFJLENBQUNBLFFBQUQsSUFBYSxDQUFDQSxTQUFTQyxHQUEzQixFQUFnQzs7QUFFaEMsU0FBT0QsU0FBU0MsR0FBVCxDQUFhQyxJQUFiLENBQWtCQyxJQUFsQixDQUF1QixxQkFBS0MsRUFBRUMs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O0FBQ0Esa0JBQUlxQyxZQUFZRyxRQUFoQixFQUEwQjs7QUFFMUIsa0JBQU1qRCxXQUFXd0MsVUFBVWhCLEdBQVYsQ0FBY3NCLFlBQVlILFFBQVosQ0FBcUJMLElBQW5DLENBQWpCOztBQUVBLGtCQUFJLENBQUN0QyxRQUFMLEVBQWU7QUFDZixrQkFBTUgsY0FBY0UsZUFBZUMsUUFBZixDQUFwQjs7QUFFQSxrQkFBSUgsV0FBSixFQUFpQjtBQUNma0Isd0JBQVFZLE1BQVIsQ0FBZSxFQUFFUCxNQUFNMEIsWUFBWUgsUUFBcEIsRUFBOEIvQyxTQUFTQSxRQUFRQyxXQUFSLENBQXZDLEVBQWY7QUFDRDs7QUFFRDtBQUNBbUQsdUJBQVNFLElBQVQsQ0FBY0osWUFBWUgsUUFBWixDQUFxQkwsSUFBbkM7QUFDQUUsMEJBQVl4QyxTQUFTd0MsU0FBckI7QUFDQU0sNEJBQWNBLFlBQVlKLE1BQTFCO0FBQ0Q7QUFDRixXQTlCRCwyQkFwQkssRUFBUDs7QUFvREQsS0E3SGMsbUJBQWpCIiwiZmlsZSI6Im5vLWRlcHJlY2F0ZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZGVjbGFyZWRTY29wZSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL2RlY2xhcmVkU2NvcGUnO1xyXG5pbXBvcnQgRXhwb3J0cyBmcm9tICcuLi9FeHBvcnRNYXAnO1xyXG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJztcclxuXHJcbmZ1bmN0aW9uIG1lc3NhZ2UoZGVwcmVjYXRpb24pIHtcclxuICByZXR1cm4gJ0RlcHJlY2F0ZWQnICsgKGRlcHJlY2F0aW9uLmRlc2NyaXB0aW9uID8gJzogJyArIGRlcHJlY2F0aW9uLmRlc2NyaXB0aW9uIDogJy4nKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RGVwcmVjYXRpb24obWV0YWRhdGEpIHtcclxuICBpZiAoIW1ldGFkYXRhIHx8ICFtZXRhZGF0YS5kb2MpIHJldHVybjtcclxuXHJcbiAgcmV0dXJuIG1ldGFkYXRhLmRvYy50YWdzLmZpbmQodCA9PiB0LnRpdGxlID09PSAnZGVwcmVjYXRlZCcpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnSGVscGZ1bCB3YXJuaW5ncycsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnRm9yYmlkIGltcG9ydGVkIG5hbWVzIG1hcmtlZCB3aXRoIGBAZGVwcmVjYXRlZGAgZG9jdW1lbnRhdGlvbiB0YWcuJyxcclxuICAgICAgdXJsOiBkb2NzVXJsKCduby1kZXByZWNhdGVkJyksXHJcbiAgICB9LFxyXG4gICAgc2NoZW1hOiBbXSxcclxuICB9LFxyXG5cclxuICBjcmVhdGUoY29udGV4dCkge1xyXG4gICAgY29uc3QgZGVwcmVjYXRlZCA9IG5ldyBNYXAoKTtcclxuICAgIGNvbnN0IG5hbWVzcGFjZXMgPSBuZXcgTWFwKCk7XHJcblxyXG4gICAgZnVuY3Rpb24gY2hlY2tTcGVjaWZpZXJzKG5vZGUpIHtcclxuICAgICAgaWYgKG5vZGUudHlwZSAhPT0gJ0ltcG9ydERlY2xhcmF0aW9uJykgcmV0dXJuO1xyXG4gICAgICBpZiAobm9kZS5zb3VyY2UgPT0gbnVsbCkgcmV0dXJuOyAvLyBsb2NhbCBleHBvcnQsIGlnbm9yZVxyXG5cclxuICAgICAgY29uc3QgaW1wb3J0cyA9IEV4cG9ydHMuZ2V0KG5vZGUuc291cmNlLnZhbHVlLCBjb250ZXh0KTtcclxuICAgICAgaWYgKGltcG9ydHMgPT0gbnVsbCkgcmV0dXJuO1xyXG5cclxuICAgICAgY29uc3QgbW9kdWxlRGVwcmVjYXRpb24gPSBpbXBvcnRzLmRvYyAmJiBpbXBvcnRzLmRvYy50YWdzLmZpbmQodCA9PiB0LnRpdGxlID09PSAnZGVwcmVjYXRlZCcpO1xyXG4gICAgICBpZiAobW9kdWxlRGVwcmVjYXRpb24pIHtcclxuICAgICAgICBjb250ZXh0LnJlcG9ydCh7IG5vZGUsIG1lc3NhZ2U6IG1lc3NhZ2UobW9kdWxlRGVwcmVjYXRpb24pIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaW1wb3J0cy5lcnJvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgaW1wb3J0cy5yZXBvcnRFcnJvcnMoY29udGV4dCwgbm9kZSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBub2RlLnNwZWNpZmllcnMuZm9yRWFjaChmdW5jdGlvbiAoaW0pIHtcclxuICAgICAgICBsZXQgaW1wb3J0ZWQ7IGxldCBsb2NhbDtcclxuICAgICAgICBzd2l0Y2ggKGltLnR5cGUpIHtcclxuXHJcblxyXG4gICAgICAgIGNhc2UgJ0ltcG9ydE5hbWVzcGFjZVNwZWNpZmllcic6e1xyXG4gICAgICAgICAgaWYgKCFpbXBvcnRzLnNpemUpIHJldHVybjtcclxuICAgICAgICAgIG5hbWVzcGFjZXMuc2V0KGltLmxvY2FsLm5hbWUsIGltcG9ydHMpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2FzZSAnSW1wb3J0RGVmYXVsdFNwZWNpZmllcic6XHJcbiAgICAgICAgICBpbXBvcnRlZCA9ICdkZWZhdWx0JztcclxuICAgICAgICAgIGxvY2FsID0gaW0ubG9jYWwubmFtZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdJbXBvcnRTcGVjaWZpZXInOlxyXG4gICAgICAgICAgaW1wb3J0ZWQgPSBpbS5pbXBvcnRlZC5uYW1lO1xyXG4gICAgICAgICAgbG9jYWwgPSBpbS5sb2NhbC5uYW1lO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6IHJldHVybjsgLy8gY2FuJ3QgaGFuZGxlIHRoaXMgb25lXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB1bmtub3duIHRoaW5nIGNhbid0IGJlIGRlcHJlY2F0ZWRcclxuICAgICAgICBjb25zdCBleHBvcnRlZCA9IGltcG9ydHMuZ2V0KGltcG9ydGVkKTtcclxuICAgICAgICBpZiAoZXhwb3J0ZWQgPT0gbnVsbCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBjYXB0dXJlIGltcG9ydCBvZiBkZWVwIG5hbWVzcGFjZVxyXG4gICAgICAgIGlmIChleHBvcnRlZC5uYW1lc3BhY2UpIG5hbWVzcGFjZXMuc2V0KGxvY2FsLCBleHBvcnRlZC5uYW1lc3BhY2UpO1xyXG5cclxuICAgICAgICBjb25zdCBkZXByZWNhdGlvbiA9IGdldERlcHJlY2F0aW9uKGltcG9ydHMuZ2V0KGltcG9ydGVkKSk7XHJcbiAgICAgICAgaWYgKCFkZXByZWNhdGlvbikgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb250ZXh0LnJlcG9ydCh7IG5vZGU6IGltLCBtZXNzYWdlOiBtZXNzYWdlKGRlcHJlY2F0aW9uKSB9KTtcclxuXHJcbiAgICAgICAgZGVwcmVjYXRlZC5zZXQobG9jYWwsIGRlcHJlY2F0aW9uKTtcclxuXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICdQcm9ncmFtJzogKHsgYm9keSB9KSA9PiBib2R5LmZvckVhY2goY2hlY2tTcGVjaWZpZXJzKSxcclxuXHJcbiAgICAgICdJZGVudGlmaWVyJzogZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICBpZiAobm9kZS5wYXJlbnQudHlwZSA9PT0gJ01lbWJlckV4cHJlc3Npb24nICYmIG5vZGUucGFyZW50LnByb3BlcnR5ID09PSBub2RlKSB7XHJcbiAgICAgICAgICByZXR1cm47IC8vIGhhbmRsZWQgYnkgTWVtYmVyRXhwcmVzc2lvblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaWdub3JlIHNwZWNpZmllciBpZGVudGlmaWVyc1xyXG4gICAgICAgIGlmIChub2RlLnBhcmVudC50eXBlLnNsaWNlKDAsIDYpID09PSAnSW1wb3J0JykgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiAoIWRlcHJlY2F0ZWQuaGFzKG5vZGUubmFtZSkpIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYgKGRlY2xhcmVkU2NvcGUoY29udGV4dCwgbm9kZS5uYW1lKSAhPT0gJ21vZHVsZScpIHJldHVybjtcclxuICAgICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgbWVzc2FnZTogbWVzc2FnZShkZXByZWNhdGVkLmdldChub2RlLm5hbWUpKSxcclxuICAgICAgICB9KTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgICdNZW1iZXJFeHByZXNzaW9uJzogZnVuY3Rpb24gKGRlcmVmZXJlbmNlKSB7XHJcbiAgICAgICAgaWYgKGRlcmVmZXJlbmNlLm9iamVjdC50eXBlICE9PSAnSWRlbnRpZmllcicpIHJldHVybjtcclxuICAgICAgICBpZiAoIW5hbWVzcGFjZXMuaGFzKGRlcmVmZXJlbmNlLm9iamVjdC5uYW1lKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiAoZGVjbGFyZWRTY29wZShjb250ZXh0LCBkZXJlZmVyZW5jZS5vYmplY3QubmFtZSkgIT09ICdtb2R1bGUnKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIGdvIGRlZXBcclxuICAgICAgICBsZXQgbmFtZXNwYWNlID0gbmFtZXNwYWNlcy5nZXQoZGVyZWZlcmVuY2Uub2JqZWN0Lm5hbWUpO1xyXG4gICAgICAgIGNvbnN0IG5hbWVwYXRoID0gW2RlcmVmZXJlbmNlLm9iamVjdC5uYW1lXTtcclxuICAgICAgICAvLyB3aGlsZSBwcm9wZXJ0eSBpcyBuYW1lc3BhY2UgYW5kIHBhcmVudCBpcyBtZW1iZXIgZXhwcmVzc2lvbiwga2VlcCB2YWxpZGF0aW5nXHJcbiAgICAgICAgd2hpbGUgKG5hbWVzcGFjZSBpbnN0YW5jZW9mIEV4cG9ydHMgJiZcclxuICAgICAgICAgICAgICAgZGVyZWZlcmVuY2UudHlwZSA9PT0gJ01lbWJlckV4cHJlc3Npb24nKSB7XHJcblxyXG4gICAgICAgICAgLy8gaWdub3JlIGNvbXB1dGVkIHBhcnRzIGZvciBub3dcclxuICAgICAgICAgIGlmIChkZXJlZmVyZW5jZS5jb21wdXRlZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgIGNvbnN0IG1ldGFkYXRhID0gbmFtZXNwYWNlLmdldChkZXJlZmVyZW5jZS5wcm9wZXJ0eS5uYW1lKTtcclxuXHJcbiAgICAgICAgICBpZiAoIW1ldGFkYXRhKSBicmVhaztcclxuICAgICAgICAgIGNvbnN0IGRlcHJlY2F0aW9uID0gZ2V0RGVwcmVjYXRpb24obWV0YWRhdGEpO1xyXG5cclxuICAgICAgICAgIGlmIChkZXByZWNhdGlvbikge1xyXG4gICAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7IG5vZGU6IGRlcmVmZXJlbmNlLnByb3BlcnR5LCBtZXNzYWdlOiBtZXNzYWdlKGRlcHJlY2F0aW9uKSB9KTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBzdGFzaCBhbmQgcG9wXHJcbiAgICAgICAgICBuYW1lcGF0aC5wdXNoKGRlcmVmZXJlbmNlLnByb3BlcnR5Lm5hbWUpO1xyXG4gICAgICAgICAgbmFtZXNwYWNlID0gbWV0YWRhdGEubmFtZXNwYWNlO1xyXG4gICAgICAgICAgZGVyZWZlcmVuY2UgPSBkZXJlZmVyZW5jZS5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfTtcclxuICB9LFxyXG59O1xyXG4iXX0=