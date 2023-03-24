'use strict';var _minimatch = require('minimatch');var _minimatch2 = _interopRequireDefault(_minimatch);

var _resolve = require('eslint-module-utils/resolve');var _resolve2 = _interopRequireDefault(_resolve);
var _importType = require('../core/importType');var _importType2 = _interopRequireDefault(_importType);
var _moduleVisitor = require('eslint-module-utils/moduleVisitor');var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Static analysis',
      description: 'Forbid importing the submodules of other modules.',
      url: (0, _docsUrl2['default'])('no-internal-modules') },


    schema: [
    {
      anyOf: [
      {
        type: 'object',
        properties: {
          allow: {
            type: 'array',
            items: {
              type: 'string' } } },



        additionalProperties: false },

      {
        type: 'object',
        properties: {
          forbid: {
            type: 'array',
            items: {
              type: 'string' } } },



        additionalProperties: false }] }] },






  create: function () {function noReachingInside(context) {
      var options = context.options[0] || {};
      var allowRegexps = (options.allow || []).map(function (p) {return _minimatch2['default'].makeRe(p);});
      var forbidRegexps = (options.forbid || []).map(function (p) {return _minimatch2['default'].makeRe(p);});

      // minimatch patterns are expected to use / path separators, like import
      // statements, so normalize paths to use the same
      function normalizeSep(somePath) {
        return somePath.split('\\').join('/');
      }

      function toSteps(somePath) {
        return normalizeSep(somePath).
        split('/').
        reduce(function (acc, step) {
          if (!step || step === '.') {
            return acc;
          } else if (step === '..') {
            return acc.slice(0, -1);
          } else {
            return acc.concat(step);
          }
        }, []);
      }

      // test if reaching to this destination is allowed
      function reachingAllowed(importPath) {
        return allowRegexps.some(function (re) {return re.test(importPath);});
      }

      // test if reaching to this destination is forbidden
      function reachingForbidden(importPath) {
        return forbidRegexps.some(function (re) {return re.test(importPath);});
      }

      function isAllowViolation(importPath) {
        var steps = toSteps(importPath);

        var nonScopeSteps = steps.filter(function (step) {return step.indexOf('@') !== 0;});
        if (nonScopeSteps.length <= 1) return false;

        // before trying to resolve, see if the raw import (with relative
        // segments resolved) matches an allowed pattern
        var justSteps = steps.join('/');
        if (reachingAllowed(justSteps) || reachingAllowed('/' + String(justSteps))) return false;

        // if the import statement doesn't match directly, try to match the
        // resolved path if the import is resolvable
        var resolved = (0, _resolve2['default'])(importPath, context);
        if (!resolved || reachingAllowed(normalizeSep(resolved))) return false;

        // this import was not allowed by the allowed paths, and reaches
        // so it is a violation
        return true;
      }

      function isForbidViolation(importPath) {
        var steps = toSteps(importPath);

        // before trying to resolve, see if the raw import (with relative
        // segments resolved) matches a forbidden pattern
        var justSteps = steps.join('/');

        if (reachingForbidden(justSteps) || reachingForbidden('/' + String(justSteps))) return true;

        // if the import statement doesn't match directly, try to match the
        // resolved path if the import is resolvable
        var resolved = (0, _resolve2['default'])(importPath, context);
        if (resolved && reachingForbidden(normalizeSep(resolved))) return true;

        // this import was not forbidden by the forbidden paths so it is not a violation
        return false;
      }

      // find a directory that is being reached into, but which shouldn't be
      var isReachViolation = options.forbid ? isForbidViolation : isAllowViolation;

      function checkImportForReaching(importPath, node) {
        var potentialViolationTypes = ['parent', 'index', 'sibling', 'external', 'internal'];
        if (potentialViolationTypes.indexOf((0, _importType2['default'])(importPath, context)) !== -1 &&
        isReachViolation(importPath))
        {
          context.report({
            node: node,
            message: 'Reaching to "' + String(importPath) + '" is not allowed.' });

        }
      }

      return (0, _moduleVisitor2['default'])(function (source) {
        checkImportForReaching(source.value, source);
      }, { commonjs: true });
    }return noReachingInside;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1pbnRlcm5hbC1tb2R1bGVzLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwic2NoZW1hIiwiYW55T2YiLCJwcm9wZXJ0aWVzIiwiYWxsb3ciLCJpdGVtcyIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwiZm9yYmlkIiwiY3JlYXRlIiwibm9SZWFjaGluZ0luc2lkZSIsImNvbnRleHQiLCJvcHRpb25zIiwiYWxsb3dSZWdleHBzIiwibWFwIiwibWluaW1hdGNoIiwibWFrZVJlIiwicCIsImZvcmJpZFJlZ2V4cHMiLCJub3JtYWxpemVTZXAiLCJzb21lUGF0aCIsInNwbGl0Iiwiam9pbiIsInRvU3RlcHMiLCJyZWR1Y2UiLCJhY2MiLCJzdGVwIiwic2xpY2UiLCJjb25jYXQiLCJyZWFjaGluZ0FsbG93ZWQiLCJpbXBvcnRQYXRoIiwic29tZSIsInJlIiwidGVzdCIsInJlYWNoaW5nRm9yYmlkZGVuIiwiaXNBbGxvd1Zpb2xhdGlvbiIsInN0ZXBzIiwibm9uU2NvcGVTdGVwcyIsImZpbHRlciIsImluZGV4T2YiLCJsZW5ndGgiLCJqdXN0U3RlcHMiLCJyZXNvbHZlZCIsImlzRm9yYmlkVmlvbGF0aW9uIiwiaXNSZWFjaFZpb2xhdGlvbiIsImNoZWNrSW1wb3J0Rm9yUmVhY2hpbmciLCJub2RlIiwicG90ZW50aWFsVmlvbGF0aW9uVHlwZXMiLCJyZXBvcnQiLCJtZXNzYWdlIiwic291cmNlIiwidmFsdWUiLCJjb21tb25qcyJdLCJtYXBwaW5ncyI6ImFBQUEsc0M7O0FBRUEsc0Q7QUFDQSxnRDtBQUNBLGtFO0FBQ0EscUM7O0FBRUFBLE9BQU9DLE9BQVAsR0FBaUI7QUFDZkMsUUFBTTtBQUNKQyxVQUFNLFlBREY7QUFFSkMsVUFBTTtBQUNKQyxnQkFBVSxpQkFETjtBQUVKQyxtQkFBYSxtREFGVDtBQUdKQyxXQUFLLDBCQUFR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Q0QsT0FGTSxFQUVKLEVBQUVFLFVBQVUsSUFBWixFQUZJLENBQVA7QUFHRCxLQTVGRCxPQUFpQjFDLGdCQUFqQixJQXpDZSxFQUFqQiIsImZpbGUiOiJuby1pbnRlcm5hbC1tb2R1bGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1pbmltYXRjaCBmcm9tICdtaW5pbWF0Y2gnO1xyXG5cclxuaW1wb3J0IHJlc29sdmUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJztcclxuaW1wb3J0IGltcG9ydFR5cGUgZnJvbSAnLi4vY29yZS9pbXBvcnRUeXBlJztcclxuaW1wb3J0IG1vZHVsZVZpc2l0b3IgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9tb2R1bGVWaXNpdG9yJztcclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnU3RhdGljIGFuYWx5c2lzJyxcclxuICAgICAgZGVzY3JpcHRpb246ICdGb3JiaWQgaW1wb3J0aW5nIHRoZSBzdWJtb2R1bGVzIG9mIG90aGVyIG1vZHVsZXMuJyxcclxuICAgICAgdXJsOiBkb2NzVXJsKCduby1pbnRlcm5hbC1tb2R1bGVzJyksXHJcbiAgICB9LFxyXG5cclxuICAgIHNjaGVtYTogW1xyXG4gICAgICB7XHJcbiAgICAgICAgYW55T2Y6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBhbGxvdzoge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIGZvcmJpZDoge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZTogZnVuY3Rpb24gbm9SZWFjaGluZ0luc2lkZShjb250ZXh0KSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0gY29udGV4dC5vcHRpb25zWzBdIHx8IHt9O1xyXG4gICAgY29uc3QgYWxsb3dSZWdleHBzID0gKG9wdGlvbnMuYWxsb3cgfHwgW10pLm1hcChwID0+IG1pbmltYXRjaC5tYWtlUmUocCkpO1xyXG4gICAgY29uc3QgZm9yYmlkUmVnZXhwcyA9IChvcHRpb25zLmZvcmJpZCB8fCBbXSkubWFwKHAgPT4gbWluaW1hdGNoLm1ha2VSZShwKSk7XHJcblxyXG4gICAgLy8gbWluaW1hdGNoIHBhdHRlcm5zIGFyZSBleHBlY3RlZCB0byB1c2UgLyBwYXRoIHNlcGFyYXRvcnMsIGxpa2UgaW1wb3J0XHJcbiAgICAvLyBzdGF0ZW1lbnRzLCBzbyBub3JtYWxpemUgcGF0aHMgdG8gdXNlIHRoZSBzYW1lXHJcbiAgICBmdW5jdGlvbiBub3JtYWxpemVTZXAoc29tZVBhdGgpIHtcclxuICAgICAgcmV0dXJuIHNvbWVQYXRoLnNwbGl0KCdcXFxcJykuam9pbignLycpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHRvU3RlcHMoc29tZVBhdGgpIHtcclxuICAgICAgcmV0dXJuICBub3JtYWxpemVTZXAoc29tZVBhdGgpXHJcbiAgICAgICAgLnNwbGl0KCcvJylcclxuICAgICAgICAucmVkdWNlKChhY2MsIHN0ZXApID0+IHtcclxuICAgICAgICAgIGlmICghc3RlcCB8fCBzdGVwID09PSAnLicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFjYztcclxuICAgICAgICAgIH0gZWxzZSBpZiAoc3RlcCA9PT0gJy4uJykge1xyXG4gICAgICAgICAgICByZXR1cm4gYWNjLnNsaWNlKDAsIC0xKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhY2MuY29uY2F0KHN0ZXApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sIFtdKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0ZXN0IGlmIHJlYWNoaW5nIHRvIHRoaXMgZGVzdGluYXRpb24gaXMgYWxsb3dlZFxyXG4gICAgZnVuY3Rpb24gcmVhY2hpbmdBbGxvd2VkKGltcG9ydFBhdGgpIHtcclxuICAgICAgcmV0dXJuIGFsbG93UmVnZXhwcy5zb21lKHJlID0+IHJlLnRlc3QoaW1wb3J0UGF0aCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRlc3QgaWYgcmVhY2hpbmcgdG8gdGhpcyBkZXN0aW5hdGlvbiBpcyBmb3JiaWRkZW5cclxuICAgIGZ1bmN0aW9uIHJlYWNoaW5nRm9yYmlkZGVuKGltcG9ydFBhdGgpIHtcclxuICAgICAgcmV0dXJuIGZvcmJpZFJlZ2V4cHMuc29tZShyZSA9PiByZS50ZXN0KGltcG9ydFBhdGgpKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpc0FsbG93VmlvbGF0aW9uKGltcG9ydFBhdGgpIHtcclxuICAgICAgY29uc3Qgc3RlcHMgPSB0b1N0ZXBzKGltcG9ydFBhdGgpO1xyXG5cclxuICAgICAgY29uc3Qgbm9uU2NvcGVTdGVwcyA9IHN0ZXBzLmZpbHRlcihzdGVwID0+IHN0ZXAuaW5kZXhPZignQCcpICE9PSAwKTtcclxuICAgICAgaWYgKG5vblNjb3BlU3RlcHMubGVuZ3RoIDw9IDEpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgIC8vIGJlZm9yZSB0cnlpbmcgdG8gcmVzb2x2ZSwgc2VlIGlmIHRoZSByYXcgaW1wb3J0ICh3aXRoIHJlbGF0aXZlXHJcbiAgICAgIC8vIHNlZ21lbnRzIHJlc29sdmVkKSBtYXRjaGVzIGFuIGFsbG93ZWQgcGF0dGVyblxyXG4gICAgICBjb25zdCBqdXN0U3RlcHMgPSBzdGVwcy5qb2luKCcvJyk7XHJcbiAgICAgIGlmIChyZWFjaGluZ0FsbG93ZWQoanVzdFN0ZXBzKSB8fCByZWFjaGluZ0FsbG93ZWQoYC8ke2p1c3RTdGVwc31gKSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgLy8gaWYgdGhlIGltcG9ydCBzdGF0ZW1lbnQgZG9lc24ndCBtYXRjaCBkaXJlY3RseSwgdHJ5IHRvIG1hdGNoIHRoZVxyXG4gICAgICAvLyByZXNvbHZlZCBwYXRoIGlmIHRoZSBpbXBvcnQgaXMgcmVzb2x2YWJsZVxyXG4gICAgICBjb25zdCByZXNvbHZlZCA9IHJlc29sdmUoaW1wb3J0UGF0aCwgY29udGV4dCk7XHJcbiAgICAgIGlmICghcmVzb2x2ZWQgfHwgcmVhY2hpbmdBbGxvd2VkKG5vcm1hbGl6ZVNlcChyZXNvbHZlZCkpKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAvLyB0aGlzIGltcG9ydCB3YXMgbm90IGFsbG93ZWQgYnkgdGhlIGFsbG93ZWQgcGF0aHMsIGFuZCByZWFjaGVzXHJcbiAgICAgIC8vIHNvIGl0IGlzIGEgdmlvbGF0aW9uXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlzRm9yYmlkVmlvbGF0aW9uKGltcG9ydFBhdGgpIHtcclxuICAgICAgY29uc3Qgc3RlcHMgPSB0b1N0ZXBzKGltcG9ydFBhdGgpO1xyXG5cclxuICAgICAgLy8gYmVmb3JlIHRyeWluZyB0byByZXNvbHZlLCBzZWUgaWYgdGhlIHJhdyBpbXBvcnQgKHdpdGggcmVsYXRpdmVcclxuICAgICAgLy8gc2VnbWVudHMgcmVzb2x2ZWQpIG1hdGNoZXMgYSBmb3JiaWRkZW4gcGF0dGVyblxyXG4gICAgICBjb25zdCBqdXN0U3RlcHMgPSBzdGVwcy5qb2luKCcvJyk7XHJcblxyXG4gICAgICBpZiAocmVhY2hpbmdGb3JiaWRkZW4oanVzdFN0ZXBzKSB8fCByZWFjaGluZ0ZvcmJpZGRlbihgLyR7anVzdFN0ZXBzfWApKSByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIGlmIHRoZSBpbXBvcnQgc3RhdGVtZW50IGRvZXNuJ3QgbWF0Y2ggZGlyZWN0bHksIHRyeSB0byBtYXRjaCB0aGVcclxuICAgICAgLy8gcmVzb2x2ZWQgcGF0aCBpZiB0aGUgaW1wb3J0IGlzIHJlc29sdmFibGVcclxuICAgICAgY29uc3QgcmVzb2x2ZWQgPSByZXNvbHZlKGltcG9ydFBhdGgsIGNvbnRleHQpO1xyXG4gICAgICBpZiAocmVzb2x2ZWQgJiYgcmVhY2hpbmdGb3JiaWRkZW4obm9ybWFsaXplU2VwKHJlc29sdmVkKSkpIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgLy8gdGhpcyBpbXBvcnQgd2FzIG5vdCBmb3JiaWRkZW4gYnkgdGhlIGZvcmJpZGRlbiBwYXRocyBzbyBpdCBpcyBub3QgYSB2aW9sYXRpb25cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGZpbmQgYSBkaXJlY3RvcnkgdGhhdCBpcyBiZWluZyByZWFjaGVkIGludG8sIGJ1dCB3aGljaCBzaG91bGRuJ3QgYmVcclxuICAgIGNvbnN0IGlzUmVhY2hWaW9sYXRpb24gPSBvcHRpb25zLmZvcmJpZCA/IGlzRm9yYmlkVmlvbGF0aW9uIDogaXNBbGxvd1Zpb2xhdGlvbjtcclxuXHJcbiAgICBmdW5jdGlvbiBjaGVja0ltcG9ydEZvclJlYWNoaW5nKGltcG9ydFBhdGgsIG5vZGUpIHtcclxuICAgICAgY29uc3QgcG90ZW50aWFsVmlvbGF0aW9uVHlwZXMgPSBbJ3BhcmVudCcsICdpbmRleCcsICdzaWJsaW5nJywgJ2V4dGVybmFsJywgJ2ludGVybmFsJ107XHJcbiAgICAgIGlmIChwb3RlbnRpYWxWaW9sYXRpb25UeXBlcy5pbmRleE9mKGltcG9ydFR5cGUoaW1wb3J0UGF0aCwgY29udGV4dCkpICE9PSAtMSAmJlxyXG4gICAgICAgIGlzUmVhY2hWaW9sYXRpb24oaW1wb3J0UGF0aClcclxuICAgICAgKSB7XHJcbiAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgbm9kZSxcclxuICAgICAgICAgIG1lc3NhZ2U6IGBSZWFjaGluZyB0byBcIiR7aW1wb3J0UGF0aH1cIiBpcyBub3QgYWxsb3dlZC5gLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG1vZHVsZVZpc2l0b3IoKHNvdXJjZSkgPT4ge1xyXG4gICAgICBjaGVja0ltcG9ydEZvclJlYWNoaW5nKHNvdXJjZS52YWx1ZSwgc291cmNlKTtcclxuICAgIH0sIHsgY29tbW9uanM6IHRydWUgfSk7XHJcbiAgfSxcclxufTtcclxuIl19