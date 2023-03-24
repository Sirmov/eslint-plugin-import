'use strict';




var _minimatch = require('minimatch');var _minimatch2 = _interopRequireDefault(_minimatch);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
/**
 * @fileoverview Rule to disallow namespace import
 * @author Radek Benkel
 */module.exports = { meta: {
    type: 'suggestion',
    docs: {
      category: 'Style guide',
      description: 'Forbid namespace (a.k.a. "wildcard" `*`) imports.',
      url: (0, _docsUrl2['default'])('no-namespace') },

    fixable: 'code',
    schema: [{
      type: 'object',
      properties: {
        ignore: {
          type: 'array',
          items: {
            type: 'string' },

          uniqueItems: true } } }] },





  create: function () {function create(context) {
      var firstOption = context.options[0] || {};
      var ignoreGlobs = firstOption.ignore;

      return {
        ImportNamespaceSpecifier: function () {function ImportNamespaceSpecifier(node) {
            if (ignoreGlobs && ignoreGlobs.find(function (glob) {return (0, _minimatch2['default'])(node.parent.source.value, glob, { matchBase: true });})) {
              return;
            }

            var scopeVariables = context.getScope().variables;
            var namespaceVariable = scopeVariables.find(function (variable) {return variable.defs[0].node === node;});
            var namespaceReferences = namespaceVariable.references;
            var namespaceIdentifiers = namespaceReferences.map(function (reference) {return reference.identifier;});
            var canFix = namespaceIdentifiers.length > 0 && !usesNamespaceAsObject(namespaceIdentifiers);

            context.report({
              node: node,
              message: 'Unexpected namespace import.',
              fix: canFix && function (fixer) {
                var scopeManager = context.getSourceCode().scopeManager;
                var fixes = [];

                // Pass 1: Collect variable names that are already in scope for each reference we want
                // to transform, so that we can be sure that we choose non-conflicting import names
                var importNameConflicts = {};
                namespaceIdentifiers.forEach(function (identifier) {
                  var parent = identifier.parent;
                  if (parent && parent.type === 'MemberExpression') {
                    var importName = getMemberPropertyName(parent);
                    var localConflicts = getVariableNamesInScope(scopeManager, parent);
                    if (!importNameConflicts[importName]) {
                      importNameConflicts[importName] = localConflicts;
                    } else {
                      localConflicts.forEach(function (c) {return importNameConflicts[importName].add(c);});
                    }
                  }
                });

                // Choose new names for each import
                var importNames = Object.keys(importNameConflicts);
                var importLocalNames = generateLocalNames(
                importNames,
                importNameConflicts,
                namespaceVariable.name);


                // Replace the ImportNamespaceSpecifier with a list of ImportSpecifiers
                var namedImportSpecifiers = importNames.map(function (importName) {return (
                    importName === importLocalNames[importName] ?
                    importName : String(
                    importName) + ' as ' + String(importLocalNames[importName]));});

                fixes.push(fixer.replaceText(node, '{ ' + String(namedImportSpecifiers.join(', ')) + ' }'));

                // Pass 2: Replace references to the namespace with references to the named imports
                namespaceIdentifiers.forEach(function (identifier) {
                  var parent = identifier.parent;
                  if (parent && parent.type === 'MemberExpression') {
                    var importName = getMemberPropertyName(parent);
                    fixes.push(fixer.replaceText(parent, importLocalNames[importName]));
                  }
                });

                return fixes;
              } });

          }return ImportNamespaceSpecifier;}() };

    }return create;}() };


/**
                           * @param {Identifier[]} namespaceIdentifiers
                           * @returns {boolean} `true` if the namespace variable is more than just a glorified constant
                           */
function usesNamespaceAsObject(namespaceIdentifiers) {
  return !namespaceIdentifiers.every(function (identifier) {
    var parent = identifier.parent;

    // `namespace.x` or `namespace['x']`
    return (
      parent && parent.type === 'MemberExpression' && (
      parent.property.type === 'Identifier' || parent.property.type === 'Literal'));

  });
}

/**
   * @param {MemberExpression} memberExpression
   * @returns {string} the name of the member in the object expression, e.g. the `x` in `namespace.x`
   */
function getMemberPropertyName(memberExpression) {
  return memberExpression.property.type === 'Identifier' ?
  memberExpression.property.name :
  memberExpression.property.value;
}

/**
   * @param {ScopeManager} scopeManager
   * @param {ASTNode} node
   * @return {Set<string>}
   */
function getVariableNamesInScope(scopeManager, node) {
  var currentNode = node;
  var scope = scopeManager.acquire(currentNode);
  while (scope == null) {
    currentNode = currentNode.parent;
    scope = scopeManager.acquire(currentNode, true);
  }
  return new Set(scope.variables.concat(scope.upper.variables).map(function (variable) {return variable.name;}));
}

/**
   *
   * @param {*} names
   * @param {*} nameConflicts
   * @param {*} namespaceName
   */
function generateLocalNames(names, nameConflicts, namespaceName) {
  var localNames = {};
  names.forEach(function (name) {
    var localName = void 0;
    if (!nameConflicts[name].has(name)) {
      localName = name;
    } else if (!nameConflicts[name].has(String(namespaceName) + '_' + String(name))) {
      localName = String(namespaceName) + '_' + String(name);
    } else {
      for (var i = 1; i < Infinity; i++) {
        if (!nameConflicts[name].has(String(namespaceName) + '_' + String(name) + '_' + String(i))) {
          localName = String(namespaceName) + '_' + String(name) + '_' + String(i);
          break;
        }
      }
    }
    localNames[name] = localName;
  });
  return localNames;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1uYW1lc3BhY2UuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJ1cmwiLCJmaXhhYmxlIiwic2NoZW1hIiwicHJvcGVydGllcyIsImlnbm9yZSIsIml0ZW1zIiwidW5pcXVlSXRlbXMiLCJjcmVhdGUiLCJjb250ZXh0IiwiZmlyc3RPcHRpb24iLCJvcHRpb25zIiwiaWdub3JlR2xvYnMiLCJJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXIiLCJub2RlIiwiZmluZCIsInBhcmVudCIsInNvdXJjZSIsInZhbHVlIiwiZ2xvYiIsIm1hdGNoQmFzZSIsInNjb3BlVmFyaWFibGVzIiwiZ2V0U2NvcGUiLCJ2YXJpYWJsZXMiLCJuYW1lc3BhY2VWYXJpYWJsZSIsInZhcmlhYmxlIiwiZGVmcyIsIm5hbWVzcGFjZVJlZmVyZW5jZXMiLCJyZWZlcmVuY2VzIiwibmFtZXNwYWNlSWRlbnRpZmllcnMiLCJtYXAiLCJyZWZlcmVuY2UiLCJpZGVudGlmaWVyIiwiY2FuRml4IiwibGVuZ3RoIiwidXNlc05hbWVzcGFjZUFzT2JqZWN0IiwicmVwb3J0IiwibWVzc2FnZSIsImZpeCIsInNjb3BlTWFuYWdlciIsImdldFNvdXJjZUNvZGUiLCJmaXhlcyIsImltcG9ydE5hbWVDb25mbGljdHMiLCJmb3JFYWNoIiwiaW1wb3J0TmFtZSIsImdldE1lbWJlclByb3BlcnR5TmFtZSIsImxvY2FsQ29uZmxpY3RzIiwiZ2V0VmFyaWFibGVOYW1lc0luU2NvcGUiLCJjIiwiYWRkIiwiaW1wb3J0TmFtZXMiLCJPYmplY3QiLCJrZXlzIiwiaW1wb3J0TG9jYWxOYW1lcyIsImdlbmVyYXRlTG9jYWxOYW1lcyIsIm5hbWUiLCJuYW1lZEltcG9ydFNwZWNpZmllcnMiLCJwdXNoIiwiZml4ZXIiLCJyZXBsYWNlVGV4dCIsImpvaW4iLCJldmVyeSIsInByb3BlcnR5IiwibWVtYmVyRXhwcmVzc2lvbiIsImN1cnJlbnROb2RlIiwic2NvcGUiLCJhY3F1aXJlIiwiU2V0IiwiY29uY2F0IiwidXBwZXIiLCJuYW1lcyIsIm5hbWVDb25mbGljdHMiLCJuYW1lc3BhY2VOYW1lIiwibG9jYWxOYW1lcyIsImxvY2FsTmFtZSIsImhhcyIsImkiLCJJbmZpbml0eSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFLQSxzQztBQUNBLHFDOztBQUVBO0FBQ0E7QUFDQTtBQVZBOzs7R0FhQUEsT0FBT0MsT0FBUCxHQUFpQixFQUNmQyxNQUFNO0FBQ0pDLFVBQU0sWUFERjtBQUVKQyxVQUFNO0FBQ0pDLGdCQUFVLGFBRE47QUFFSkMsbUJBQWEsbURBRlQ7QUFHSkMsV0FBSywwQkFBUSxjQUFSLENBSEQsRUFGRjs7QUFPSkMsYUFBUyxNQVBMO0FBUUpDLFlBQVEsQ0FBQztBQUNQTixZQUFNLFFBREM7QUFFUE8sa0JBQVk7QUFDVkMsZ0JBQVE7QUFDTlIsZ0JBQU0sT0FEQTtBQUVOUyxpQkFBTztBQUNMVCxrQkFBTSxRQURELEVBRkQ7O0FBS05VLHVCQUFhLElBTFAsRUFERSxFQUZMLEVBQUQsQ0FSSixFQURTOzs7Ozs7QUF1QmZDLFFBdkJlLCtCQXVCUkMsT0F2QlEsRUF1QkM7QUFDZCxVQUFNQyxjQUFjRCxRQUFRRSxPQUFSLENBQWdCLENBQWhCLEtBQXNCLEVBQTFDO0FBQ0EsVUFBTUMsY0FBY0YsWUFBWUwsTUFBaEM7O0FBRUEsYUFBTztBQUNMUSxnQ0FESyxpREFDb0JDLElBRHBCLEVBQzBCO0FBQzdCLGdCQUFJRixlQUFlQSxZQUFZRyxJQUFaLENBQWlCLHdCQUFRLDRCQUFVRCxLQUFLRSxNQUFMLENBQVlDLE1BQVosQ0FBbUJDLEtBQTdCLEVBQW9DQyxJQUFwQyxFQUEwQyxFQUFFQyxXQUFXLElBQWIsRUFBMUMsQ0FBUixFQUFqQixDQUFuQixFQUE2RztBQUMzRztBQUNEOztBQUVELGdCQUFNQyxpQkFBaUJaLFFBQVFhLFFBQVIsR0FBbUJDLFNBQTFDO0FBQ0EsZ0JBQU1DLG9CQUFvQkgsZUFBZU4s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QztBQUNsQ21CLGtCQUFZbkIsSUFBWjtBQUNELEtBRkQsTUFFTyxJQUFJLENBQUNnQixjQUFjaEIsSUFBZCxFQUFvQm9CLEdBQXBCLFFBQTJCSCxhQUEzQixpQkFBNENqQixJQUE1QyxFQUFMLEVBQTBEO0FBQy9EbUIseUJBQWVGLGFBQWYsaUJBQWdDakIsSUFBaEM7QUFDRCxLQUZNLE1BRUE7QUFDTCxXQUFLLElBQUlxQixJQUFJLENBQWIsRUFBZ0JBLElBQUlDLFFBQXBCLEVBQThCRCxHQUE5QixFQUFtQztBQUNqQyxZQUFJLENBQUNMLGNBQWNoQixJQUFkLEVBQW9Cb0IsR0FBcEIsUUFBMkJILGFBQTNCLGlCQUE0Q2pCLElBQTVDLGlCQUFvRHFCLENBQXBELEVBQUwsRUFBK0Q7QUFDN0RGLDZCQUFlRixhQUFmLGlCQUFnQ2pCLElBQWhDLGlCQUF3Q3FCLENBQXhDO0FBQ0E7QUFDRDtBQUNGO0FBQ0Y7QUFDREgsZUFBV2xCLElBQVgsSUFBbUJtQixTQUFuQjtBQUNELEdBZkQ7QUFnQkEsU0FBT0QsVUFBUDtBQUNEIiwiZmlsZSI6Im5vLW5hbWVzcGFjZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IFJ1bGUgdG8gZGlzYWxsb3cgbmFtZXNwYWNlIGltcG9ydFxyXG4gKiBAYXV0aG9yIFJhZGVrIEJlbmtlbFxyXG4gKi9cclxuXHJcbmltcG9ydCBtaW5pbWF0Y2ggZnJvbSAnbWluaW1hdGNoJztcclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBSdWxlIERlZmluaXRpb25cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnU3R5bGUgZ3VpZGUnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0ZvcmJpZCBuYW1lc3BhY2UgKGEuay5hLiBcIndpbGRjYXJkXCIgYCpgKSBpbXBvcnRzLicsXHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8tbmFtZXNwYWNlJyksXHJcbiAgICB9LFxyXG4gICAgZml4YWJsZTogJ2NvZGUnLFxyXG4gICAgc2NoZW1hOiBbe1xyXG4gICAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIGlnbm9yZToge1xyXG4gICAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHVuaXF1ZUl0ZW1zOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9XSxcclxuICB9LFxyXG5cclxuICBjcmVhdGUoY29udGV4dCkge1xyXG4gICAgY29uc3QgZmlyc3RPcHRpb24gPSBjb250ZXh0Lm9wdGlvbnNbMF0gfHwge307XHJcbiAgICBjb25zdCBpZ25vcmVHbG9icyA9IGZpcnN0T3B0aW9uLmlnbm9yZTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXIobm9kZSkge1xyXG4gICAgICAgIGlmIChpZ25vcmVHbG9icyAmJiBpZ25vcmVHbG9icy5maW5kKGdsb2IgPT4gbWluaW1hdGNoKG5vZGUucGFyZW50LnNvdXJjZS52YWx1ZSwgZ2xvYiwgeyBtYXRjaEJhc2U6IHRydWUgfSkpKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzY29wZVZhcmlhYmxlcyA9IGNvbnRleHQuZ2V0U2NvcGUoKS52YXJpYWJsZXM7XHJcbiAgICAgICAgY29uc3QgbmFtZXNwYWNlVmFyaWFibGUgPSBzY29wZVZhcmlhYmxlcy5maW5kKCh2YXJpYWJsZSkgPT4gdmFyaWFibGUuZGVmc1swXS5ub2RlID09PSBub2RlKTtcclxuICAgICAgICBjb25zdCBuYW1lc3BhY2VSZWZlcmVuY2VzID0gbmFtZXNwYWNlVmFyaWFibGUucmVmZXJlbmNlcztcclxuICAgICAgICBjb25zdCBuYW1lc3BhY2VJZGVudGlmaWVycyA9IG5hbWVzcGFjZVJlZmVyZW5jZXMubWFwKHJlZmVyZW5jZSA9PiByZWZlcmVuY2UuaWRlbnRpZmllcik7XHJcbiAgICAgICAgY29uc3QgY2FuRml4ID0gbmFtZXNwYWNlSWRlbnRpZmllcnMubGVuZ3RoID4gMCAmJiAhdXNlc05hbWVzcGFjZUFzT2JqZWN0KG5hbWVzcGFjZUlkZW50aWZpZXJzKTtcclxuXHJcbiAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgbm9kZSxcclxuICAgICAgICAgIG1lc3NhZ2U6IGBVbmV4cGVjdGVkIG5hbWVzcGFjZSBpbXBvcnQuYCxcclxuICAgICAgICAgIGZpeDogY2FuRml4ICYmIChmaXhlciA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNjb3BlTWFuYWdlciA9IGNvbnRleHQuZ2V0U291cmNlQ29kZSgpLnNjb3BlTWFuYWdlcjtcclxuICAgICAgICAgICAgY29uc3QgZml4ZXMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIC8vIFBhc3MgMTogQ29sbGVjdCB2YXJpYWJsZSBuYW1lcyB0aGF0IGFyZSBhbHJlYWR5IGluIHNjb3BlIGZvciBlYWNoIHJlZmVyZW5jZSB3ZSB3YW50XHJcbiAgICAgICAgICAgIC8vIHRvIHRyYW5zZm9ybSwgc28gdGhhdCB3ZSBjYW4gYmUgc3VyZSB0aGF0IHdlIGNob29zZSBub24tY29uZmxpY3RpbmcgaW1wb3J0IG5hbWVzXHJcbiAgICAgICAgICAgIGNvbnN0IGltcG9ydE5hbWVDb25mbGljdHMgPSB7fTtcclxuICAgICAgICAgICAgbmFtZXNwYWNlSWRlbnRpZmllcnMuZm9yRWFjaCgoaWRlbnRpZmllcikgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IGlkZW50aWZpZXIucGFyZW50O1xyXG4gICAgICAgICAgICAgIGlmIChwYXJlbnQgJiYgcGFyZW50LnR5cGUgPT09ICdNZW1iZXJFeHByZXNzaW9uJykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW1wb3J0TmFtZSA9IGdldE1lbWJlclByb3BlcnR5TmFtZShwYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxDb25mbGljdHMgPSBnZXRWYXJpYWJsZU5hbWVzSW5TY29wZShzY29wZU1hbmFnZXIsIHBhcmVudCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWltcG9ydE5hbWVDb25mbGljdHNbaW1wb3J0TmFtZV0pIHtcclxuICAgICAgICAgICAgICAgICAgaW1wb3J0TmFtZUNvbmZsaWN0c1tpbXBvcnROYW1lXSA9IGxvY2FsQ29uZmxpY3RzO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgbG9jYWxDb25mbGljdHMuZm9yRWFjaCgoYykgPT4gaW1wb3J0TmFtZUNvbmZsaWN0c1tpbXBvcnROYW1lXS5hZGQoYykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBDaG9vc2UgbmV3IG5hbWVzIGZvciBlYWNoIGltcG9ydFxyXG4gICAgICAgICAgICBjb25zdCBpbXBvcnROYW1lcyA9IE9iamVjdC5rZXlzKGltcG9ydE5hbWVDb25mbGljdHMpO1xyXG4gICAgICAgICAgICBjb25zdCBpbXBvcnRMb2NhbE5hbWVzID0gZ2VuZXJhdGVMb2NhbE5hbWVzKFxyXG4gICAgICAgICAgICAgIGltcG9ydE5hbWVzLFxyXG4gICAgICAgICAgICAgIGltcG9ydE5hbWVDb25mbGljdHMsXHJcbiAgICAgICAgICAgICAgbmFtZXNwYWNlVmFyaWFibGUubmFtZSxcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlcGxhY2UgdGhlIEltcG9ydE5hbWVzcGFjZVNwZWNpZmllciB3aXRoIGEgbGlzdCBvZiBJbXBvcnRTcGVjaWZpZXJzXHJcbiAgICAgICAgICAgIGNvbnN0IG5hbWVkSW1wb3J0U3BlY2lmaWVycyA9IGltcG9ydE5hbWVzLm1hcCgoaW1wb3J0TmFtZSkgPT4gKFxyXG4gICAgICAgICAgICAgIGltcG9ydE5hbWUgPT09IGltcG9ydExvY2FsTmFtZXNbaW1wb3J0TmFtZV1cclxuICAgICAgICAgICAgICAgID8gaW1wb3J0TmFtZVxyXG4gICAgICAgICAgICAgICAgOiBgJHtpbXBvcnROYW1lfSBhcyAke2ltcG9ydExvY2FsTmFtZXNbaW1wb3J0TmFtZV19YFxyXG4gICAgICAgICAgICApKTtcclxuICAgICAgICAgICAgZml4ZXMucHVzaChmaXhlci5yZXBsYWNlVGV4dChub2RlLCBgeyAke25hbWVkSW1wb3J0U3BlY2lmaWVycy5qb2luKCcsICcpfSB9YCkpO1xyXG5cclxuICAgICAgICAgICAgLy8gUGFzcyAyOiBSZXBsYWNlIHJlZmVyZW5jZXMgdG8gdGhlIG5hbWVzcGFjZSB3aXRoIHJlZmVyZW5jZXMgdG8gdGhlIG5hbWVkIGltcG9ydHNcclxuICAgICAgICAgICAgbmFtZXNwYWNlSWRlbnRpZmllcnMuZm9yRWFjaCgoaWRlbnRpZmllcikgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IGlkZW50aWZpZXIucGFyZW50O1xyXG4gICAgICAgICAgICAgIGlmIChwYXJlbnQgJiYgcGFyZW50LnR5cGUgPT09ICdNZW1iZXJFeHByZXNzaW9uJykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW1wb3J0TmFtZSA9IGdldE1lbWJlclByb3BlcnR5TmFtZShwYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgZml4ZXMucHVzaChmaXhlci5yZXBsYWNlVGV4dChwYXJlbnQsIGltcG9ydExvY2FsTmFtZXNbaW1wb3J0TmFtZV0pKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZpeGVzO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sXHJcbiAgICB9O1xyXG4gIH0sXHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtJZGVudGlmaWVyW119IG5hbWVzcGFjZUlkZW50aWZpZXJzXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSBgdHJ1ZWAgaWYgdGhlIG5hbWVzcGFjZSB2YXJpYWJsZSBpcyBtb3JlIHRoYW4ganVzdCBhIGdsb3JpZmllZCBjb25zdGFudFxyXG4gKi9cclxuZnVuY3Rpb24gdXNlc05hbWVzcGFjZUFzT2JqZWN0KG5hbWVzcGFjZUlkZW50aWZpZXJzKSB7XHJcbiAgcmV0dXJuICFuYW1lc3BhY2VJZGVudGlmaWVycy5ldmVyeSgoaWRlbnRpZmllcikgPT4ge1xyXG4gICAgY29uc3QgcGFyZW50ID0gaWRlbnRpZmllci5wYXJlbnQ7XHJcblxyXG4gICAgLy8gYG5hbWVzcGFjZS54YCBvciBgbmFtZXNwYWNlWyd4J11gXHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBwYXJlbnQgJiYgcGFyZW50LnR5cGUgPT09ICdNZW1iZXJFeHByZXNzaW9uJyAmJlxyXG4gICAgICAocGFyZW50LnByb3BlcnR5LnR5cGUgPT09ICdJZGVudGlmaWVyJyB8fCBwYXJlbnQucHJvcGVydHkudHlwZSA9PT0gJ0xpdGVyYWwnKVxyXG4gICAgKTtcclxuICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7TWVtYmVyRXhwcmVzc2lvbn0gbWVtYmVyRXhwcmVzc2lvblxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgbmFtZSBvZiB0aGUgbWVtYmVyIGluIHRoZSBvYmplY3QgZXhwcmVzc2lvbiwgZS5nLiB0aGUgYHhgIGluIGBuYW1lc3BhY2UueGBcclxuICovXHJcbmZ1bmN0aW9uIGdldE1lbWJlclByb3BlcnR5TmFtZShtZW1iZXJFeHByZXNzaW9uKSB7XHJcbiAgcmV0dXJuIG1lbWJlckV4cHJlc3Npb24ucHJvcGVydHkudHlwZSA9PT0gJ0lkZW50aWZpZXInXHJcbiAgICA/IG1lbWJlckV4cHJlc3Npb24ucHJvcGVydHkubmFtZVxyXG4gICAgOiBtZW1iZXJFeHByZXNzaW9uLnByb3BlcnR5LnZhbHVlO1xyXG59XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtTY29wZU1hbmFnZXJ9IHNjb3BlTWFuYWdlclxyXG4gKiBAcGFyYW0ge0FTVE5vZGV9IG5vZGVcclxuICogQHJldHVybiB7U2V0PHN0cmluZz59XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRWYXJpYWJsZU5hbWVzSW5TY29wZShzY29wZU1hbmFnZXIsIG5vZGUpIHtcclxuICBsZXQgY3VycmVudE5vZGUgPSBub2RlO1xyXG4gIGxldCBzY29wZSA9IHNjb3BlTWFuYWdlci5hY3F1aXJlKGN1cnJlbnROb2RlKTtcclxuICB3aGlsZSAoc2NvcGUgPT0gbnVsbCkge1xyXG4gICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5wYXJlbnQ7XHJcbiAgICBzY29wZSA9IHNjb3BlTWFuYWdlci5hY3F1aXJlKGN1cnJlbnROb2RlLCB0cnVlKTtcclxuICB9XHJcbiAgcmV0dXJuIG5ldyBTZXQoc2NvcGUudmFyaWFibGVzLmNvbmNhdChzY29wZS51cHBlci52YXJpYWJsZXMpLm1hcCh2YXJpYWJsZSA9PiB2YXJpYWJsZS5uYW1lKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IG5hbWVzXHJcbiAqIEBwYXJhbSB7Kn0gbmFtZUNvbmZsaWN0c1xyXG4gKiBAcGFyYW0geyp9IG5hbWVzcGFjZU5hbWVcclxuICovXHJcbmZ1bmN0aW9uIGdlbmVyYXRlTG9jYWxOYW1lcyhuYW1lcywgbmFtZUNvbmZsaWN0cywgbmFtZXNwYWNlTmFtZSkge1xyXG4gIGNvbnN0IGxvY2FsTmFtZXMgPSB7fTtcclxuICBuYW1lcy5mb3JFYWNoKChuYW1lKSA9PiB7XHJcbiAgICBsZXQgbG9jYWxOYW1lO1xyXG4gICAgaWYgKCFuYW1lQ29uZmxpY3RzW25hbWVdLmhhcyhuYW1lKSkge1xyXG4gICAgICBsb2NhbE5hbWUgPSBuYW1lO1xyXG4gICAgfSBlbHNlIGlmICghbmFtZUNvbmZsaWN0c1tuYW1lXS5oYXMoYCR7bmFtZXNwYWNlTmFtZX1fJHtuYW1lfWApKSB7XHJcbiAgICAgIGxvY2FsTmFtZSA9IGAke25hbWVzcGFjZU5hbWV9XyR7bmFtZX1gO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBJbmZpbml0eTsgaSsrKSB7XHJcbiAgICAgICAgaWYgKCFuYW1lQ29uZmxpY3RzW25hbWVdLmhhcyhgJHtuYW1lc3BhY2VOYW1lfV8ke25hbWV9XyR7aX1gKSkge1xyXG4gICAgICAgICAgbG9jYWxOYW1lID0gYCR7bmFtZXNwYWNlTmFtZX1fJHtuYW1lfV8ke2l9YDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgbG9jYWxOYW1lc1tuYW1lXSA9IGxvY2FsTmFtZTtcclxuICB9KTtcclxuICByZXR1cm4gbG9jYWxOYW1lcztcclxufVxyXG4iXX0=