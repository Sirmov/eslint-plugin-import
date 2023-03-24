'use strict';var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);
var _object = require('object.values');var _object2 = _interopRequireDefault(_object);
var _arrayPrototype = require('array.prototype.flat');var _arrayPrototype2 = _interopRequireDefault(_arrayPrototype);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

var meta = {
  type: 'suggestion',
  docs: {
    category: 'Style guide',
    description: 'Prefer named exports to be grouped together in a single export declaration',
    url: (0, _docsUrl2['default'])('group-exports') } };


/* eslint-disable max-len */
var errors = {
  ExportNamedDeclaration: 'Multiple named export declarations; consolidate all named exports into a single export declaration',
  AssignmentExpression: 'Multiple CommonJS exports; consolidate all exports into a single assignment to `module.exports`' };

/* eslint-enable max-len */

/**
                             * Returns an array with names of the properties in the accessor chain for MemberExpression nodes
                             *
                             * Example:
                             *
                             * `module.exports = {}` => ['module', 'exports']
                             * `module.exports.property = true` => ['module', 'exports', 'property']
                             *
                             * @param     {Node}    node    AST Node (MemberExpression)
                             * @return    {Array}           Array with the property names in the chain
                             * @private
                             */
function accessorChain(node) {
  var chain = [];

  do {
    chain.unshift(node.property.name);

    if (node.object.type === 'Identifier') {
      chain.unshift(node.object.name);
      break;
    }

    node = node.object;
  } while (node.type === 'MemberExpression');

  return chain;
}

function create(context) {
  var nodes = {
    modules: {
      set: new Set(),
      sources: {} },

    types: {
      set: new Set(),
      sources: {} },

    commonjs: {
      set: new Set() } };



  return {
    ExportNamedDeclaration: function () {function ExportNamedDeclaration(node) {
        var target = node.exportKind === 'type' ? nodes.types : nodes.modules;
        if (!node.source) {
          target.set.add(node);
        } else if (Array.isArray(target.sources[node.source.value])) {
          target.sources[node.source.value].push(node);
        } else {
          target.sources[node.source.value] = [node];
        }
      }return ExportNamedDeclaration;}(),

    AssignmentExpression: function () {function AssignmentExpression(node) {
        if (node.left.type !== 'MemberExpression') {
          return;
        }

        var chain = accessorChain(node.left);

        // Assignments to module.exports
        // Deeper assignments are ignored since they just modify what's already being exported
        // (ie. module.exports.exported.prop = true is ignored)
        if (chain[0] === 'module' && chain[1] === 'exports' && chain.length <= 3) {
          nodes.commonjs.set.add(node);
          return;
        }

        // Assignments to exports (exports.* = *)
        if (chain[0] === 'exports' && chain.length === 2) {
          nodes.commonjs.set.add(node);
          return;
        }
      }return AssignmentExpression;}(),

    'Program:exit': function () {function onExit() {
        // Report multiple `export` declarations (ES2015 modules)
        if (nodes.modules.set.size > 1) {
          nodes.modules.set.forEach(function (node) {
            context.report({
              node: node,
              message: errors[node.type] });

          });
        }

        // Report multiple `aggregated exports` from the same module (ES2015 modules)
        (0, _arrayPrototype2['default'])((0, _object2['default'])(nodes.modules.sources).
        filter(function (nodesWithSource) {return Array.isArray(nodesWithSource) && nodesWithSource.length > 1;})).
        forEach(function (node) {
          context.report({
            node: node,
            message: errors[node.type] });

        });

        // Report multiple `export type` declarations (FLOW ES2015 modules)
        if (nodes.types.set.size > 1) {
          nodes.types.set.forEach(function (node) {
            context.report({
              node: node,
              message: errors[node.type] });

          });
        }

        // Report multiple `aggregated type exports` from the same module (FLOW ES2015 modules)
        (0, _arrayPrototype2['default'])((0, _object2['default'])(nodes.types.sources).
        filter(function (nodesWithSource) {return Array.isArray(nodesWithSource) && nodesWithSource.length > 1;})).
        forEach(function (node) {
          context.report({
            node: node,
            message: errors[node.type] });

        });

        // Report multiple `module.exports` assignments (CommonJS)
        if (nodes.commonjs.set.size > 1) {
          nodes.commonjs.set.forEach(function (node) {
            context.report({
              node: node,
              message: errors[node.type] });

          });
        }
      }return onExit;}() };

}

module.exports = {
  meta: meta,
  create: create };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9ncm91cC1leHBvcnRzLmpzIl0sIm5hbWVzIjpbIm1ldGEiLCJ0eXBlIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJ1cmwiLCJlcnJvcnMiLCJFeHBvcnROYW1lZERlY2xhcmF0aW9uIiwiQXNzaWdubWVudEV4cHJlc3Npb24iLCJhY2Nlc3NvckNoYWluIiwibm9kZSIsImNoYWluIiwidW5zaGlmdCIsInByb3BlcnR5IiwibmFtZSIsIm9iamVjdCIsImNyZWF0ZSIsImNvbnRleHQiLCJub2RlcyIsIm1vZHVsZXMiLCJzZXQiLCJTZXQiLCJzb3VyY2VzIiwidHlwZXMiLCJjb21tb25qcyIsInRhcmdldCIsImV4cG9ydEtpbmQiLCJzb3VyY2UiLCJhZGQiLCJBcnJheSIsImlzQXJyYXkiLCJ2YWx1ZSIsInB1c2giLCJsZWZ0IiwibGVuZ3RoIiwib25FeGl0Iiwic2l6ZSIsImZvckVhY2giLCJyZXBvcnQiLCJtZXNzYWdlIiwiZmlsdGVyIiwibm9kZXNXaXRoU291cmNlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6ImFBQUEscUM7QUFDQSx1QztBQUNBLHNEOztBQUVBLElBQU1BLE9BQU87QUFDWEMsUUFBTSxZQURLO0FBRVhDLFFBQU07QUFDSkMsY0FBVSxhQUROO0FBRUpDLGlCQUFhLDRFQUZUO0FBR0pDLFNBQUssMEJBQVEsZUFBUixDQUhELEVBRkssRUFBYjs7O0FBUUE7QUFDQSxJQUFNQyxTQUFTO0FBQ2JDLDBCQUF3QixvR0FEWDtBQUViQyx3QkFBc0IsaUdBRlQsRUFBZjs7QUFJQTs7QUFFQTs7Ozs7Ozs7Ozs7O0FBWUEsU0FBU0MsYUFBVCxDQUF1QkMsSUFBdkIsRUFBNkI7QUFDM0IsTUFBTUMsUUFBUSxFQUFkOztBQUVBLEtBQUc7QUFDREEsVUFBTUMsT0FBTixDQUFjRixLQUFLRyxRQUFMLENBQWNDLElBQTVCOztBQUVBLFFBQUlKLEtBQUtLLE1BQUwsQ0FBWWQsSUFBWixLQUFxQixZQUF6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bXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJztcclxuaW1wb3J0IHZhbHVlcyBmcm9tICdvYmplY3QudmFsdWVzJztcclxuaW1wb3J0IGZsYXQgZnJvbSAnYXJyYXkucHJvdG90eXBlLmZsYXQnO1xyXG5cclxuY29uc3QgbWV0YSA9IHtcclxuICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgZG9jczoge1xyXG4gICAgY2F0ZWdvcnk6ICdTdHlsZSBndWlkZScsXHJcbiAgICBkZXNjcmlwdGlvbjogJ1ByZWZlciBuYW1lZCBleHBvcnRzIHRvIGJlIGdyb3VwZWQgdG9nZXRoZXIgaW4gYSBzaW5nbGUgZXhwb3J0IGRlY2xhcmF0aW9uJyxcclxuICAgIHVybDogZG9jc1VybCgnZ3JvdXAtZXhwb3J0cycpLFxyXG4gIH0sXHJcbn07XHJcbi8qIGVzbGludC1kaXNhYmxlIG1heC1sZW4gKi9cclxuY29uc3QgZXJyb3JzID0ge1xyXG4gIEV4cG9ydE5hbWVkRGVjbGFyYXRpb246ICdNdWx0aXBsZSBuYW1lZCBleHBvcnQgZGVjbGFyYXRpb25zOyBjb25zb2xpZGF0ZSBhbGwgbmFtZWQgZXhwb3J0cyBpbnRvIGEgc2luZ2xlIGV4cG9ydCBkZWNsYXJhdGlvbicsXHJcbiAgQXNzaWdubWVudEV4cHJlc3Npb246ICdNdWx0aXBsZSBDb21tb25KUyBleHBvcnRzOyBjb25zb2xpZGF0ZSBhbGwgZXhwb3J0cyBpbnRvIGEgc2luZ2xlIGFzc2lnbm1lbnQgdG8gYG1vZHVsZS5leHBvcnRzYCcsXHJcbn07XHJcbi8qIGVzbGludC1lbmFibGUgbWF4LWxlbiAqL1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYW4gYXJyYXkgd2l0aCBuYW1lcyBvZiB0aGUgcHJvcGVydGllcyBpbiB0aGUgYWNjZXNzb3IgY2hhaW4gZm9yIE1lbWJlckV4cHJlc3Npb24gbm9kZXNcclxuICpcclxuICogRXhhbXBsZTpcclxuICpcclxuICogYG1vZHVsZS5leHBvcnRzID0ge31gID0+IFsnbW9kdWxlJywgJ2V4cG9ydHMnXVxyXG4gKiBgbW9kdWxlLmV4cG9ydHMucHJvcGVydHkgPSB0cnVlYCA9PiBbJ21vZHVsZScsICdleHBvcnRzJywgJ3Byb3BlcnR5J11cclxuICpcclxuICogQHBhcmFtICAgICB7Tm9kZX0gICAgbm9kZSAgICBBU1QgTm9kZSAoTWVtYmVyRXhwcmVzc2lvbilcclxuICogQHJldHVybiAgICB7QXJyYXl9ICAgICAgICAgICBBcnJheSB3aXRoIHRoZSBwcm9wZXJ0eSBuYW1lcyBpbiB0aGUgY2hhaW5cclxuICogQHByaXZhdGVcclxuICovXHJcbmZ1bmN0aW9uIGFjY2Vzc29yQ2hhaW4obm9kZSkge1xyXG4gIGNvbnN0IGNoYWluID0gW107XHJcblxyXG4gIGRvIHtcclxuICAgIGNoYWluLnVuc2hpZnQobm9kZS5wcm9wZXJ0eS5uYW1lKTtcclxuXHJcbiAgICBpZiAobm9kZS5vYmplY3QudHlwZSA9PT0gJ0lkZW50aWZpZXInKSB7XHJcbiAgICAgIGNoYWluLnVuc2hpZnQobm9kZS5vYmplY3QubmFtZSk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIG5vZGUgPSBub2RlLm9iamVjdDtcclxuICB9IHdoaWxlIChub2RlLnR5cGUgPT09ICdNZW1iZXJFeHByZXNzaW9uJyk7XHJcblxyXG4gIHJldHVybiBjaGFpbjtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlKGNvbnRleHQpIHtcclxuICBjb25zdCBub2RlcyA9IHtcclxuICAgIG1vZHVsZXM6IHtcclxuICAgICAgc2V0OiBuZXcgU2V0KCksXHJcbiAgICAgIHNvdXJjZXM6IHt9LFxyXG4gICAgfSxcclxuICAgIHR5cGVzOiB7XHJcbiAgICAgIHNldDogbmV3IFNldCgpLFxyXG4gICAgICBzb3VyY2VzOiB7fSxcclxuICAgIH0sXHJcbiAgICBjb21tb25qczoge1xyXG4gICAgICBzZXQ6IG5ldyBTZXQoKSxcclxuICAgIH0sXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIEV4cG9ydE5hbWVkRGVjbGFyYXRpb24obm9kZSkge1xyXG4gICAgICBjb25zdCB0YXJnZXQgPSBub2RlLmV4cG9ydEtpbmQgPT09ICd0eXBlJyA/IG5vZGVzLnR5cGVzIDogbm9kZXMubW9kdWxlcztcclxuICAgICAgaWYgKCFub2RlLnNvdXJjZSkge1xyXG4gICAgICAgIHRhcmdldC5zZXQuYWRkKG5vZGUpO1xyXG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodGFyZ2V0LnNvdXJjZXNbbm9kZS5zb3VyY2UudmFsdWVdKSkge1xyXG4gICAgICAgIHRhcmdldC5zb3VyY2VzW25vZGUuc291cmNlLnZhbHVlXS5wdXNoKG5vZGUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRhcmdldC5zb3VyY2VzW25vZGUuc291cmNlLnZhbHVlXSA9IFtub2RlXTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBBc3NpZ25tZW50RXhwcmVzc2lvbihub2RlKSB7XHJcbiAgICAgIGlmIChub2RlLmxlZnQudHlwZSAhPT0gJ01lbWJlckV4cHJlc3Npb24nKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBjaGFpbiA9IGFjY2Vzc29yQ2hhaW4obm9kZS5sZWZ0KTtcclxuXHJcbiAgICAgIC8vIEFzc2lnbm1lbnRzIHRvIG1vZHVsZS5leHBvcnRzXHJcbiAgICAgIC8vIERlZXBlciBhc3NpZ25tZW50cyBhcmUgaWdub3JlZCBzaW5jZSB0aGV5IGp1c3QgbW9kaWZ5IHdoYXQncyBhbHJlYWR5IGJlaW5nIGV4cG9ydGVkXHJcbiAgICAgIC8vIChpZS4gbW9kdWxlLmV4cG9ydHMuZXhwb3J0ZWQucHJvcCA9IHRydWUgaXMgaWdub3JlZClcclxuICAgICAgaWYgKGNoYWluWzBdID09PSAnbW9kdWxlJyAmJiBjaGFpblsxXSA9PT0gJ2V4cG9ydHMnICYmIGNoYWluLmxlbmd0aCA8PSAzKSB7XHJcbiAgICAgICAgbm9kZXMuY29tbW9uanMuc2V0LmFkZChub2RlKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFzc2lnbm1lbnRzIHRvIGV4cG9ydHMgKGV4cG9ydHMuKiA9ICopXHJcbiAgICAgIGlmIChjaGFpblswXSA9PT0gJ2V4cG9ydHMnICYmIGNoYWluLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgIG5vZGVzLmNvbW1vbmpzLnNldC5hZGQobm9kZSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgICdQcm9ncmFtOmV4aXQnOiBmdW5jdGlvbiBvbkV4aXQoKSB7XHJcbiAgICAgIC8vIFJlcG9ydCBtdWx0aXBsZSBgZXhwb3J0YCBkZWNsYXJhdGlvbnMgKEVTMjAxNSBtb2R1bGVzKVxyXG4gICAgICBpZiAobm9kZXMubW9kdWxlcy5zZXQuc2l6ZSA+IDEpIHtcclxuICAgICAgICBub2Rlcy5tb2R1bGVzLnNldC5mb3JFYWNoKG5vZGUgPT4ge1xyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvcnNbbm9kZS50eXBlXSxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZXBvcnQgbXVsdGlwbGUgYGFnZ3JlZ2F0ZWQgZXhwb3J0c2AgZnJvbSB0aGUgc2FtZSBtb2R1bGUgKEVTMjAxNSBtb2R1bGVzKVxyXG4gICAgICBmbGF0KHZhbHVlcyhub2Rlcy5tb2R1bGVzLnNvdXJjZXMpXHJcbiAgICAgICAgLmZpbHRlcihub2Rlc1dpdGhTb3VyY2UgPT4gQXJyYXkuaXNBcnJheShub2Rlc1dpdGhTb3VyY2UpICYmIG5vZGVzV2l0aFNvdXJjZS5sZW5ndGggPiAxKSlcclxuICAgICAgICAuZm9yRWFjaCgobm9kZSkgPT4ge1xyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvcnNbbm9kZS50eXBlXSxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gUmVwb3J0IG11bHRpcGxlIGBleHBvcnQgdHlwZWAgZGVjbGFyYXRpb25zIChGTE9XIEVTMjAxNSBtb2R1bGVzKVxyXG4gICAgICBpZiAobm9kZXMudHlwZXMuc2V0LnNpemUgPiAxKSB7XHJcbiAgICAgICAgbm9kZXMudHlwZXMuc2V0LmZvckVhY2gobm9kZSA9PiB7XHJcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yc1tub2RlLnR5cGVdLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlcG9ydCBtdWx0aXBsZSBgYWdncmVnYXRlZCB0eXBlIGV4cG9ydHNgIGZyb20gdGhlIHNhbWUgbW9kdWxlIChGTE9XIEVTMjAxNSBtb2R1bGVzKVxyXG4gICAgICBmbGF0KHZhbHVlcyhub2Rlcy50eXBlcy5zb3VyY2VzKVxyXG4gICAgICAgIC5maWx0ZXIobm9kZXNXaXRoU291cmNlID0+IEFycmF5LmlzQXJyYXkobm9kZXNXaXRoU291cmNlKSAmJiBub2Rlc1dpdGhTb3VyY2UubGVuZ3RoID4gMSkpXHJcbiAgICAgICAgLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgICAgbm9kZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JzW25vZGUudHlwZV0sXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFJlcG9ydCBtdWx0aXBsZSBgbW9kdWxlLmV4cG9ydHNgIGFzc2lnbm1lbnRzIChDb21tb25KUylcclxuICAgICAgaWYgKG5vZGVzLmNvbW1vbmpzLnNldC5zaXplID4gMSkge1xyXG4gICAgICAgIG5vZGVzLmNvbW1vbmpzLnNldC5mb3JFYWNoKG5vZGUgPT4ge1xyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvcnNbbm9kZS50eXBlXSxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGEsXHJcbiAgY3JlYXRlLFxyXG59O1xyXG4iXX0=