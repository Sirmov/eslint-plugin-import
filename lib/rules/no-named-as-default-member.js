'use strict';





var _ExportMap = require('../ExportMap');var _ExportMap2 = _interopRequireDefault(_ExportMap);
var _importDeclaration = require('../importDeclaration');var _importDeclaration2 = _interopRequireDefault(_importDeclaration);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Helpful warnings',
      description: 'Forbid use of exported name as property of default export.',
      url: (0, _docsUrl2['default'])('no-named-as-default-member') },

    schema: [] },


  create: function () {function create(context) {

      var fileImports = new Map();
      var allPropertyLookups = new Map();

      function handleImportDefault(node) {
        var declaration = (0, _importDeclaration2['default'])(context);
        var exportMap = _ExportMap2['default'].get(declaration.source.value, context);
        if (exportMap == null) return;

        if (exportMap.errors.length) {
          exportMap.reportErrors(context, declaration);
          return;
        }

        fileImports.set(node.local.name, {
          exportMap: exportMap,
          sourcePath: declaration.source.value });

      }

      function storePropertyLookup(objectName, propName, node) {
        var lookups = allPropertyLookups.get(objectName) || [];
        lookups.push({ node: node, propName: propName });
        allPropertyLookups.set(objectName, lookups);
      }

      function handlePropLookup(node) {
        var objectName = node.object.name;
        var propName = node.property.name;
        storePropertyLookup(objectName, propName, node);
      }

      function handleDestructuringAssignment(node) {
        var isDestructure =
        node.id.type === 'ObjectPattern' &&
        node.init != null &&
        node.init.type === 'Identifier';

        if (!isDestructure) return;

        var objectName = node.init.name;var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
          for (var _iterator = node.id.properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var _ref = _step.value;var key = _ref.key;
            if (key == null) continue; // true for rest properties
            storePropertyLookup(objectName, key.name, key);
          }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
      }

      function handleProgramExit() {
        allPropertyLookups.forEach(function (lookups, objectName) {
          var fileImport = fileImports.get(objectName);
          if (fileImport == null) return;var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {

            for (var _iterator2 = lookups[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var _ref2 = _step2.value;var propName = _ref2.propName,node = _ref2.node;
              // the default import can have a "default" property
              if (propName === 'default') continue;
              if (!fileImport.exportMap.namespace.has(propName)) continue;

              context.report({
                node: node,
                message:
                'Caution: `' + String(objectName) + '` also has a named export ' + ('`' + String(
                propName) + '`. Check if you meant to write ') + ('`import {' + String(
                propName) + '} from \'' + String(fileImport.sourcePath) + '\'` ') +
                'instead.' });


            }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2['return']) {_iterator2['return']();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}
        });
      }

      return {
        'ImportDefaultSpecifier': handleImportDefault,
        'MemberExpression': handlePropLookup,
        'VariableDeclarator': handleDestructuringAssignment,
        'Program:exit': handleProgramExit };

    }return create;}() }; /**
                           * @fileoverview Rule to warn about potentially confused use of name exports
                           * @author Desmond Brand
                           * @copyright 2016 Desmond Brand. All rights reserved.
                           * See LICENSE in root directory for full license.
                           */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1uYW1lZC1hcy1kZWZhdWx0LW1lbWJlci5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwiY2F0ZWdvcnkiLCJkZXNjcmlwdGlvbiIsInVybCIsInNjaGVtYSIsImNyZWF0ZSIsImNvbnRleHQiLCJmaWxlSW1wb3J0cyIsIk1hcCIsImFsbFByb3BlcnR5TG9va3VwcyIsImhhbmRsZUltcG9ydERlZmF1bHQiLCJub2RlIiwiZGVjbGFyYXRpb24iLCJleHBvcnRNYXAiLCJFeHBvcnRzIiwiZ2V0Iiwic291cmNlIiwidmFsdWUiLCJlcnJvcnMiLCJsZW5ndGgiLCJyZXBvcnRFcnJvcnMiLCJzZXQiLCJsb2NhbCIsIm5hbWUiLCJzb3VyY2VQYXRoIiwic3RvcmVQcm9wZXJ0eUxvb2t1cCIsIm9iamVjdE5hbWUiLCJwcm9wTmFtZSIsImxvb2t1cHMiLCJwdXNoIiwiaGFuZGxlUHJvcExvb2t1cCIsIm9iamVjdCIsInByb3BlcnR5IiwiaGFuZGxlRGVzdHJ1Y3R1cmluZ0Fzc2lnbm1lbnQiLCJpc0Rlc3RydWN0dXJlIiwiaWQiLCJpbml0IiwicHJvcGVydGllcyIsImtleSIsImhhbmRsZVByb2dyYW1FeGl0IiwiZm9yRWFjaCIsImZpbGVJbXBvcnQiLCJuYW1lc3BhY2UiLCJoYXMiLCJyZXBvcnQiLCJtZXNzYWdlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQSx5QztBQUNBLHlEO0FBQ0EscUM7O0FBRUE7QUFDQTtBQUNBOztBQUVBQSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSkMsVUFBTSxZQURGO0FBRUpDLFVBQU07QUFDSkMsZ0JBQVUsa0JBRE47QUFFSkMsbUJBQWEsNERBRlQ7QUFHSkMsV0FBSywwQkFBUSw0QkFBUixDQUhELEVBRkY7O0FBT0pDLFlBQVEsRUFQSixFQURTOzs7QUFXZkMsUUFYZSwrQkFXUkMsT0FYUSxFQVdDOztBQUVkLFVBQU1DLGNBQWMsSUFB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RCxhQUFPO0FBQ0wsa0NBQTBCZCxtQkFEckI7QUFFTCw0QkFBb0JvQixnQkFGZjtBQUdMLDhCQUFzQkcsNkJBSGpCO0FBSUwsd0JBQWdCTSxpQkFKWCxFQUFQOztBQU1ELEtBeEZjLG1CQUFqQixDLENBZEEiLCJmaWxlIjoibm8tbmFtZWQtYXMtZGVmYXVsdC1tZW1iZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGZpbGVvdmVydmlldyBSdWxlIHRvIHdhcm4gYWJvdXQgcG90ZW50aWFsbHkgY29uZnVzZWQgdXNlIG9mIG5hbWUgZXhwb3J0c1xyXG4gKiBAYXV0aG9yIERlc21vbmQgQnJhbmRcclxuICogQGNvcHlyaWdodCAyMDE2IERlc21vbmQgQnJhbmQuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqIFNlZSBMSUNFTlNFIGluIHJvb3QgZGlyZWN0b3J5IGZvciBmdWxsIGxpY2Vuc2UuXHJcbiAqL1xyXG5pbXBvcnQgRXhwb3J0cyBmcm9tICcuLi9FeHBvcnRNYXAnO1xyXG5pbXBvcnQgaW1wb3J0RGVjbGFyYXRpb24gZnJvbSAnLi4vaW1wb3J0RGVjbGFyYXRpb24nO1xyXG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJztcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIFJ1bGUgRGVmaW5pdGlvblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3N1Z2dlc3Rpb24nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICBjYXRlZ29yeTogJ0hlbHBmdWwgd2FybmluZ3MnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0ZvcmJpZCB1c2Ugb2YgZXhwb3J0ZWQgbmFtZSBhcyBwcm9wZXJ0eSBvZiBkZWZhdWx0IGV4cG9ydC4nLFxyXG4gICAgICB1cmw6IGRvY3NVcmwoJ25vLW5hbWVkLWFzLWRlZmF1bHQtbWVtYmVyJyksXHJcbiAgICB9LFxyXG4gICAgc2NoZW1hOiBbXSxcclxuICB9LFxyXG5cclxuICBjcmVhdGUoY29udGV4dCkge1xyXG5cclxuICAgIGNvbnN0IGZpbGVJbXBvcnRzID0gbmV3IE1hcCgpO1xyXG4gICAgY29uc3QgYWxsUHJvcGVydHlMb29rdXBzID0gbmV3IE1hcCgpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZUltcG9ydERlZmF1bHQobm9kZSkge1xyXG4gICAgICBjb25zdCBkZWNsYXJhdGlvbiA9IGltcG9ydERlY2xhcmF0aW9uKGNvbnRleHQpO1xyXG4gICAgICBjb25zdCBleHBvcnRNYXAgPSBFeHBvcnRzLmdldChkZWNsYXJhdGlvbi5zb3VyY2UudmFsdWUsIGNvbnRleHQpO1xyXG4gICAgICBpZiAoZXhwb3J0TWFwID09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICAgIGlmIChleHBvcnRNYXAuZXJyb3JzLmxlbmd0aCkge1xyXG4gICAgICAgIGV4cG9ydE1hcC5yZXBvcnRFcnJvcnMoY29udGV4dCwgZGVjbGFyYXRpb24pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZmlsZUltcG9ydHMuc2V0KG5vZGUubG9jYWwubmFtZSwge1xyXG4gICAgICAgIGV4cG9ydE1hcCxcclxuICAgICAgICBzb3VyY2VQYXRoOiBkZWNsYXJhdGlvbi5zb3VyY2UudmFsdWUsXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHN0b3JlUHJvcGVydHlMb29rdXAob2JqZWN0TmFtZSwgcHJvcE5hbWUsIG5vZGUpIHtcclxuICAgICAgY29uc3QgbG9va3VwcyA9IGFsbFByb3BlcnR5TG9va3Vwcy5nZXQob2JqZWN0TmFtZSkgfHwgW107XHJcbiAgICAgIGxvb2t1cHMucHVzaCh7IG5vZGUsIHByb3BOYW1lIH0pO1xyXG4gICAgICBhbGxQcm9wZXJ0eUxvb2t1cHMuc2V0KG9iamVjdE5hbWUsIGxvb2t1cHMpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZVByb3BMb29rdXAobm9kZSkge1xyXG4gICAgICBjb25zdCBvYmplY3ROYW1lID0gbm9kZS5vYmplY3QubmFtZTtcclxuICAgICAgY29uc3QgcHJvcE5hbWUgPSBub2RlLnByb3BlcnR5Lm5hbWU7XHJcbiAgICAgIHN0b3JlUHJvcGVydHlMb29rdXAob2JqZWN0TmFtZSwgcHJvcE5hbWUsIG5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZURlc3RydWN0dXJpbmdBc3NpZ25tZW50KG5vZGUpIHtcclxuICAgICAgY29uc3QgaXNEZXN0cnVjdHVyZSA9IChcclxuICAgICAgICBub2RlLmlkLnR5cGUgPT09ICdPYmplY3RQYXR0ZXJuJyAmJlxyXG4gICAgICAgIG5vZGUuaW5pdCAhPSBudWxsICYmXHJcbiAgICAgICAgbm9kZS5pbml0LnR5cGUgPT09ICdJZGVudGlmaWVyJ1xyXG4gICAgICApO1xyXG4gICAgICBpZiAoIWlzRGVzdHJ1Y3R1cmUpIHJldHVybjtcclxuXHJcbiAgICAgIGNvbnN0IG9iamVjdE5hbWUgPSBub2RlLmluaXQubmFtZTtcclxuICAgICAgZm9yIChjb25zdCB7IGtleSB9IG9mIG5vZGUuaWQucHJvcGVydGllcykge1xyXG4gICAgICAgIGlmIChrZXkgPT0gbnVsbCkgY29udGludWU7ICAvLyB0cnVlIGZvciByZXN0IHByb3BlcnRpZXNcclxuICAgICAgICBzdG9yZVByb3BlcnR5TG9va3VwKG9iamVjdE5hbWUsIGtleS5uYW1lLCBrZXkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaGFuZGxlUHJvZ3JhbUV4aXQoKSB7XHJcbiAgICAgIGFsbFByb3BlcnR5TG9va3Vwcy5mb3JFYWNoKChsb29rdXBzLCBvYmplY3ROYW1lKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZmlsZUltcG9ydCA9IGZpbGVJbXBvcnRzLmdldChvYmplY3ROYW1lKTtcclxuICAgICAgICBpZiAoZmlsZUltcG9ydCA9PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgeyBwcm9wTmFtZSwgbm9kZSB9IG9mIGxvb2t1cHMpIHtcclxuICAgICAgICAgIC8vIHRoZSBkZWZhdWx0IGltcG9ydCBjYW4gaGF2ZSBhIFwiZGVmYXVsdFwiIHByb3BlcnR5XHJcbiAgICAgICAgICBpZiAocHJvcE5hbWUgPT09ICdkZWZhdWx0JykgY29udGludWU7XHJcbiAgICAgICAgICBpZiAoIWZpbGVJbXBvcnQuZXhwb3J0TWFwLm5hbWVzcGFjZS5oYXMocHJvcE5hbWUpKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IChcclxuICAgICAgICAgICAgICBgQ2F1dGlvbjogXFxgJHtvYmplY3ROYW1lfVxcYCBhbHNvIGhhcyBhIG5hbWVkIGV4cG9ydCBgICtcclxuICAgICAgICAgICAgICBgXFxgJHtwcm9wTmFtZX1cXGAuIENoZWNrIGlmIHlvdSBtZWFudCB0byB3cml0ZSBgICtcclxuICAgICAgICAgICAgICBgXFxgaW1wb3J0IHske3Byb3BOYW1lfX0gZnJvbSAnJHtmaWxlSW1wb3J0LnNvdXJjZVBhdGh9J1xcYCBgICtcclxuICAgICAgICAgICAgICAnaW5zdGVhZC4nXHJcbiAgICAgICAgICAgICksXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICdJbXBvcnREZWZhdWx0U3BlY2lmaWVyJzogaGFuZGxlSW1wb3J0RGVmYXVsdCxcclxuICAgICAgJ01lbWJlckV4cHJlc3Npb24nOiBoYW5kbGVQcm9wTG9va3VwLFxyXG4gICAgICAnVmFyaWFibGVEZWNsYXJhdG9yJzogaGFuZGxlRGVzdHJ1Y3R1cmluZ0Fzc2lnbm1lbnQsXHJcbiAgICAgICdQcm9ncmFtOmV4aXQnOiBoYW5kbGVQcm9ncmFtRXhpdCxcclxuICAgIH07XHJcbiAgfSxcclxufTtcclxuIl19