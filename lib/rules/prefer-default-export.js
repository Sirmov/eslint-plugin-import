'use strict';

var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

var SINGLE_EXPORT_ERROR_MESSAGE = 'Prefer default export on a file with single export.';
var ANY_EXPORT_ERROR_MESSAGE = 'Prefer default export to be present on every file that has export.';

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Style guide',
      description: 'Prefer a default export if module exports a single name or multiple names.',
      url: (0, _docsUrl2['default'])('prefer-default-export') },

    schema: [{
      type: 'object',
      properties: {
        target: {
          type: 'string',
          'enum': ['single', 'any'],
          'default': 'single' } },


      additionalProperties: false }] },



  create: function () {function create(context) {
      var specifierExportCount = 0;
      var hasDefaultExport = false;
      var hasStarExport = false;
      var hasTypeExport = false;
      var namedExportNode = null;
      // get options. by default we look into files with single export
      var _ref = context.options[0] || {},_ref$target = _ref.target,target = _ref$target === undefined ? 'single' : _ref$target;
      function captureDeclaration(identifierOrPattern) {
        if (identifierOrPattern && identifierOrPattern.type === 'ObjectPattern') {
          // recursively capture
          identifierOrPattern.properties.
          forEach(function (property) {
            captureDeclaration(property.value);
          });
        } else if (identifierOrPattern && identifierOrPattern.type === 'ArrayPattern') {
          identifierOrPattern.elements.
          forEach(captureDeclaration);
        } else {
          // assume it's a single standard identifier
          specifierExportCount++;
        }
      }

      return {
        'ExportDefaultSpecifier': function () {function ExportDefaultSpecifier() {
            hasDefaultExport = true;
          }return ExportDefaultSpecifier;}(),

        'ExportSpecifier': function () {function ExportSpecifier(node) {
            if ((node.exported.name || node.exported.value) === 'default') {
              hasDefaultExport = true;
            } else {
              specifierExportCount++;
              namedExportNode = node;
            }
          }return ExportSpecifier;}(),

        'ExportNamedDeclaration': function () {function ExportNamedDeclaration(node) {
            // if there are specifiers, node.declaration should be null
            if (!node.declaration) return;var

            type = node.declaration.type;

            if (
            type === 'TSTypeAliasDeclaration' ||
            type === 'TypeAlias' ||
            type === 'TSInterfaceDeclaration' ||
            type === 'InterfaceDeclaration')
            {
              specifierExportCount++;
              hasTypeExport = true;
              return;
            }

            if (node.declaration.declarations) {
              node.declaration.declarations.forEach(function (declaration) {
                captureDeclaration(declaration.id);
              });
            } else {
              // captures 'export function foo() {}' syntax
              specifierExportCount++;
            }

            namedExportNode = node;
          }return ExportNamedDeclaration;}(),

        'ExportDefaultDeclaration': function () {function ExportDefaultDeclaration() {
            hasDefaultExport = true;
          }return ExportDefaultDeclaration;}(),

        'ExportAllDeclaration': function () {function ExportAllDeclaration() {
            hasStarExport = true;
          }return ExportAllDeclaration;}(),

        'Program:exit': function () {function ProgramExit() {
            if (hasDefaultExport || hasStarExport || hasTypeExport) {
              return;
            }
            if (target === 'single' && specifierExportCount === 1) {
              context.report(namedExportNode, SINGLE_EXPORT_ERROR_MESSAGE);
            } else if (target === 'any' && specifierExportCount > 0) {
              context.report(namedExportNode, ANY_EXPORT_ERROR_MESSAGE);
            }
          }return ProgramExit;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9wcmVmZXItZGVmYXVsdC1leHBvcnQuanMiXSwibmFtZXMiOlsiU0lOR0xFX0VYUE9SVF9FUlJPUl9NRVNTQUdFIiwiQU5ZX0VYUE9SVF9FUlJPUl9NRVNTQUdFIiwibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJ1cmwiLCJzY2hlbWEiLCJwcm9wZXJ0aWVzIiwidGFyZ2V0IiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJjcmVhdGUiLCJjb250ZXh0Iiwic3BlY2lmaWVyRXhwb3J0Q291bnQiLCJoYXNEZWZhdWx0RXhwb3J0IiwiaGFzU3RhckV4cG9ydCIsImhhc1R5cGVFeHBvcnQiLCJuYW1lZEV4cG9ydE5vZGUiLCJvcHRpb25zIiwiY2FwdHVyZURlY2xhcmF0aW9uIiwiaWRlbnRpZmllck9yUGF0dGVybiIsImZvckVhY2giLCJwcm9wZXJ0eSIsInZhbHVlIiwiZWxlbWVudHMiLCJub2RlIiwiZXhwb3J0ZWQiLCJuYW1lIiwiZGVjbGFyYXRpb24iLCJkZWNsYXJhdGlvbnMiLCJpZCIsInJlcG9ydCJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEscUM7O0FBRUEsSUFBTUEsOEJBQThCLHFEQUFwQztBQUNBLElBQU1DLDJCQUEyQixvRUFBakM7O0FBRUFDLE9BQU9DLE9BQVAsR0FBaUI7QUFDZkMsUUFBTTtBQUNKQyxVQUFNLFlBREY7QUFFSkMsVUFBTTtBQUNKQyxnQkFBVSxhQUROO0FBRUpDLG1CQUFhLDRFQUZUO0FBR0pDLFdBQUssMEJBQVEsdUJBQVIsQ0FIRCxFQUZGOztBQU9KQyxZQUFRLENBQUM7QUFDUEwsWUFBTSxRQURDO0FBRVBNLGtCQUFXO0FBQ1RDLGdCQUFRO0FBQ05QLGdCQUFNLFFBREE7QUFFTixrQkFBTSxDQUFDLFFBQUQsRUFBVyxLQUFYLENBRkE7QUFHTixxQkFBUyxRQUhILEVBREMsRUFGSjs7O0FBU1BRLDRCQUFzQixLQVRmLEVBQUQs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OlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XHJcblxyXG5jb25zdCBTSU5HTEVfRVhQT1JUX0VSUk9SX01FU1NBR0UgPSAnUHJlZmVyIGRlZmF1bHQgZXhwb3J0IG9uIGEgZmlsZSB3aXRoIHNpbmdsZSBleHBvcnQuJztcclxuY29uc3QgQU5ZX0VYUE9SVF9FUlJPUl9NRVNTQUdFID0gJ1ByZWZlciBkZWZhdWx0IGV4cG9ydCB0byBiZSBwcmVzZW50IG9uIGV2ZXJ5IGZpbGUgdGhhdCBoYXMgZXhwb3J0Lic7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnU3R5bGUgZ3VpZGUnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ1ByZWZlciBhIGRlZmF1bHQgZXhwb3J0IGlmIG1vZHVsZSBleHBvcnRzIGEgc2luZ2xlIG5hbWUgb3IgbXVsdGlwbGUgbmFtZXMuJyxcclxuICAgICAgdXJsOiBkb2NzVXJsKCdwcmVmZXItZGVmYXVsdC1leHBvcnQnKSxcclxuICAgIH0sXHJcbiAgICBzY2hlbWE6IFt7XHJcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgICBwcm9wZXJ0aWVzOntcclxuICAgICAgICB0YXJnZXQ6IHtcclxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgICAgZW51bTogWydzaW5nbGUnLCAnYW55J10sXHJcbiAgICAgICAgICBkZWZhdWx0OiAnc2luZ2xlJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXHJcbiAgICB9XSxcclxuICB9LFxyXG5cclxuICBjcmVhdGUoY29udGV4dCkge1xyXG4gICAgbGV0IHNwZWNpZmllckV4cG9ydENvdW50ID0gMDtcclxuICAgIGxldCBoYXNEZWZhdWx0RXhwb3J0ID0gZmFsc2U7XHJcbiAgICBsZXQgaGFzU3RhckV4cG9ydCA9IGZhbHNlO1xyXG4gICAgbGV0IGhhc1R5cGVFeHBvcnQgPSBmYWxzZTtcclxuICAgIGxldCBuYW1lZEV4cG9ydE5vZGUgPSBudWxsO1xyXG4gICAgLy8gZ2V0IG9wdGlvbnMuIGJ5IGRlZmF1bHQgd2UgbG9vayBpbnRvIGZpbGVzIHdpdGggc2luZ2xlIGV4cG9ydFxyXG4gICAgY29uc3QgeyB0YXJnZXQgPSAnc2luZ2xlJyB9ID0gIGNvbnRleHQub3B0aW9uc1swXSB8fCB7fTtcclxuICAgIGZ1bmN0aW9uIGNhcHR1cmVEZWNsYXJhdGlvbihpZGVudGlmaWVyT3JQYXR0ZXJuKSB7XHJcbiAgICAgIGlmIChpZGVudGlmaWVyT3JQYXR0ZXJuICYmIGlkZW50aWZpZXJPclBhdHRlcm4udHlwZSA9PT0gJ09iamVjdFBhdHRlcm4nKSB7XHJcbiAgICAgICAgLy8gcmVjdXJzaXZlbHkgY2FwdHVyZVxyXG4gICAgICAgIGlkZW50aWZpZXJPclBhdHRlcm4ucHJvcGVydGllc1xyXG4gICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgIGNhcHR1cmVEZWNsYXJhdGlvbihwcm9wZXJ0eS52YWx1ZSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIGlmIChpZGVudGlmaWVyT3JQYXR0ZXJuICYmIGlkZW50aWZpZXJPclBhdHRlcm4udHlwZSA9PT0gJ0FycmF5UGF0dGVybicpIHtcclxuICAgICAgICBpZGVudGlmaWVyT3JQYXR0ZXJuLmVsZW1lbnRzXHJcbiAgICAgICAgICAuZm9yRWFjaChjYXB0dXJlRGVjbGFyYXRpb24pO1xyXG4gICAgICB9IGVsc2UgIHtcclxuICAgICAgLy8gYXNzdW1lIGl0J3MgYSBzaW5nbGUgc3RhbmRhcmQgaWRlbnRpZmllclxyXG4gICAgICAgIHNwZWNpZmllckV4cG9ydENvdW50Kys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAnRXhwb3J0RGVmYXVsdFNwZWNpZmllcic6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBoYXNEZWZhdWx0RXhwb3J0ID0gdHJ1ZTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgICdFeHBvcnRTcGVjaWZpZXInOiBmdW5jdGlvbiAobm9kZSkge1xyXG4gICAgICAgIGlmICgobm9kZS5leHBvcnRlZC5uYW1lIHx8IG5vZGUuZXhwb3J0ZWQudmFsdWUpID09PSAnZGVmYXVsdCcpIHtcclxuICAgICAgICAgIGhhc0RlZmF1bHRFeHBvcnQgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzcGVjaWZpZXJFeHBvcnRDb3VudCsrO1xyXG4gICAgICAgICAgbmFtZWRFeHBvcnROb2RlID0gbm9kZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbic6IGZ1bmN0aW9uIChub2RlKSB7XHJcbiAgICAgICAgLy8gaWYgdGhlcmUgYXJlIHNwZWNpZmllcnMsIG5vZGUuZGVjbGFyYXRpb24gc2hvdWxkIGJlIG51bGxcclxuICAgICAgICBpZiAoIW5vZGUuZGVjbGFyYXRpb24pIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgeyB0eXBlIH0gPSBub2RlLmRlY2xhcmF0aW9uO1xyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICB0eXBlID09PSAnVFNUeXBlQWxpYXNEZWNsYXJhdGlvbicgfHxcclxuICAgICAgICAgIHR5cGUgPT09ICdUeXBlQWxpYXMnIHx8XHJcbiAgICAgICAgICB0eXBlID09PSAnVFNJbnRlcmZhY2VEZWNsYXJhdGlvbicgfHxcclxuICAgICAgICAgIHR5cGUgPT09ICdJbnRlcmZhY2VEZWNsYXJhdGlvbidcclxuICAgICAgICApIHtcclxuICAgICAgICAgIHNwZWNpZmllckV4cG9ydENvdW50Kys7XHJcbiAgICAgICAgICBoYXNUeXBlRXhwb3J0ID0gdHJ1ZTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uLmRlY2xhcmF0aW9ucykge1xyXG4gICAgICAgICAgbm9kZS5kZWNsYXJhdGlvbi5kZWNsYXJhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoZGVjbGFyYXRpb24pIHtcclxuICAgICAgICAgICAgY2FwdHVyZURlY2xhcmF0aW9uKGRlY2xhcmF0aW9uLmlkKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBjYXB0dXJlcyAnZXhwb3J0IGZ1bmN0aW9uIGZvbygpIHt9JyBzeW50YXhcclxuICAgICAgICAgIHNwZWNpZmllckV4cG9ydENvdW50Kys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuYW1lZEV4cG9ydE5vZGUgPSBub2RlO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgJ0V4cG9ydERlZmF1bHREZWNsYXJhdGlvbic6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBoYXNEZWZhdWx0RXhwb3J0ID0gdHJ1ZTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgICdFeHBvcnRBbGxEZWNsYXJhdGlvbic6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBoYXNTdGFyRXhwb3J0ID0gdHJ1ZTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgICdQcm9ncmFtOmV4aXQnOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKGhhc0RlZmF1bHRFeHBvcnQgfHwgaGFzU3RhckV4cG9ydCB8fCBoYXNUeXBlRXhwb3J0KSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0YXJnZXQgPT09ICdzaW5nbGUnICYmIHNwZWNpZmllckV4cG9ydENvdW50ID09PSAxKSB7XHJcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydChuYW1lZEV4cG9ydE5vZGUsIFNJTkdMRV9FWFBPUlRfRVJST1JfTUVTU0FHRSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0YXJnZXQgPT09ICdhbnknICYmIHNwZWNpZmllckV4cG9ydENvdW50ID4gMCkge1xyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQobmFtZWRFeHBvcnROb2RlLCBBTllfRVhQT1JUX0VSUk9SX01FU1NBR0UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH07XHJcbiAgfSxcclxufTtcclxuIl19