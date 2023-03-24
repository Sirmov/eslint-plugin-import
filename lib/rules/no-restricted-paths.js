'use strict';var _path = require('path');var _path2 = _interopRequireDefault(_path);

var _resolve = require('eslint-module-utils/resolve');var _resolve2 = _interopRequireDefault(_resolve);
var _moduleVisitor = require('eslint-module-utils/moduleVisitor');var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);
var _isGlob = require('is-glob');var _isGlob2 = _interopRequireDefault(_isGlob);
var _minimatch = require('minimatch');
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);
var _importType = require('../core/importType');var _importType2 = _interopRequireDefault(_importType);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

var containsPath = function containsPath(filepath, target) {
  var relative = _path2['default'].relative(target, filepath);
  return relative === '' || !relative.startsWith('..');
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      category: 'Static analysis',
      description: 'Enforce which files can be imported in a given folder.',
      url: (0, _docsUrl2['default'])('no-restricted-paths') },


    schema: [
    {
      type: 'object',
      properties: {
        zones: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              target: {
                anyOf: [
                { type: 'string' },
                {
                  type: 'array',
                  items: { type: 'string' },
                  uniqueItems: true,
                  minLength: 1 }] },



              from: {
                anyOf: [
                { type: 'string' },
                {
                  type: 'array',
                  items: { type: 'string' },
                  uniqueItems: true,
                  minLength: 1 }] },



              except: {
                type: 'array',
                items: {
                  type: 'string' },

                uniqueItems: true },

              message: { type: 'string' } },

            additionalProperties: false } },


        basePath: { type: 'string' } },

      additionalProperties: false }] },




  create: function () {function noRestrictedPaths(context) {
      var options = context.options[0] || {};
      var restrictedPaths = options.zones || [];
      var basePath = options.basePath || process.cwd();
      var currentFilename = context.getPhysicalFilename ? context.getPhysicalFilename() : context.getFilename();
      var matchingZones = restrictedPaths.filter(function (zone) {
        return [].concat(zone.target).
        map(function (target) {return _path2['default'].resolve(basePath, target);}).
        some(function (targetPath) {return isMatchingTargetPath(currentFilename, targetPath);});
      });

      function isMatchingTargetPath(filename, targetPath) {
        if ((0, _isGlob2['default'])(targetPath)) {
          var mm = new _minimatch.Minimatch(targetPath);
          return mm.match(filename);
        }

        return containsPath(filename, targetPath);
      }

      function isValidExceptionPath(absoluteFromPath, absoluteExceptionPath) {
        var relativeExceptionPath = _path2['default'].relative(absoluteFromPath, absoluteExceptionPath);

        return (0, _importType2['default'])(relativeExceptionPath, context) !== 'parent';
      }

      function areBothGlobPatternAndAbsolutePath(areGlobPatterns) {
        return areGlobPatterns.some(function (isGlob) {return isGlob;}) && areGlobPatterns.some(function (isGlob) {return !isGlob;});
      }

      function reportInvalidExceptionPath(node) {
        context.report({
          node: node,
          message: 'Restricted path exceptions must be descendants of the configured `from` path for that zone.' });

      }

      function reportInvalidExceptionMixedGlobAndNonGlob(node) {
        context.report({
          node: node,
          message: 'Restricted path `from` must contain either only glob patterns or none' });

      }

      function reportInvalidExceptionGlob(node) {
        context.report({
          node: node,
          message: 'Restricted path exceptions must be glob patterns when `from` contains glob patterns' });

      }

      function computeMixedGlobAndAbsolutePathValidator() {
        return {
          isPathRestricted: function () {function isPathRestricted() {return true;}return isPathRestricted;}(),
          hasValidExceptions: false,
          reportInvalidException: reportInvalidExceptionMixedGlobAndNonGlob };

      }

      function computeGlobPatternPathValidator(absoluteFrom, zoneExcept) {
        var isPathException = void 0;

        var mm = new _minimatch.Minimatch(absoluteFrom);
        var isPathRestricted = function () {function isPathRestricted(absoluteImportPath) {return mm.match(absoluteImportPath);}return isPathRestricted;}();
        var hasValidExceptions = zoneExcept.every(_isGlob2['default']);

        if (hasValidExceptions) {
          var exceptionsMm = zoneExcept.map(function (except) {return new _minimatch.Minimatch(except);});
          isPathException = function () {function isPathException(absoluteImportPath) {return exceptionsMm.some(function (mm) {return mm.match(absoluteImportPath);});}return isPathException;}();
        }

        var reportInvalidException = reportInvalidExceptionGlob;

        return {
          isPathRestricted: isPathRestricted,
          hasValidExceptions: hasValidExceptions,
          isPathException: isPathException,
          reportInvalidException: reportInvalidException };

      }

      function computeAbsolutePathValidator(absoluteFrom, zoneExcept) {
        var isPathException = void 0;

        var isPathRestricted = function () {function isPathRestricted(absoluteImportPath) {return containsPath(absoluteImportPath, absoluteFrom);}return isPathRestricted;}();

        var absoluteExceptionPaths = zoneExcept.
        map(function (exceptionPath) {return _path2['default'].resolve(absoluteFrom, exceptionPath);});
        var hasValidExceptions = absoluteExceptionPaths.
        every(function (absoluteExceptionPath) {return isValidExceptionPath(absoluteFrom, absoluteExceptionPath);});

        if (hasValidExceptions) {
          isPathException = function () {function isPathException(absoluteImportPath) {return absoluteExceptionPaths.some(
              function (absoluteExceptionPath) {return containsPath(absoluteImportPath, absoluteExceptionPath);});}return isPathException;}();

        }

        var reportInvalidException = reportInvalidExceptionPath;

        return {
          isPathRestricted: isPathRestricted,
          hasValidExceptions: hasValidExceptions,
          isPathException: isPathException,
          reportInvalidException: reportInvalidException };

      }

      function reportInvalidExceptions(validators, node) {
        validators.forEach(function (validator) {return validator.reportInvalidException(node);});
      }

      function reportImportsInRestrictedZone(validators, node, importPath, customMessage) {
        validators.forEach(function () {
          context.report({
            node: node,
            message: 'Unexpected path "{{importPath}}" imported in restricted zone.' + (customMessage ? ' ' + String(customMessage) : ''),
            data: { importPath: importPath } });

        });
      }

      var makePathValidators = function () {function makePathValidators(zoneFrom) {var zoneExcept = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
          var allZoneFrom = [].concat(zoneFrom);
          var areGlobPatterns = allZoneFrom.map(_isGlob2['default']);

          if (areBothGlobPatternAndAbsolutePath(areGlobPatterns)) {
            return [computeMixedGlobAndAbsolutePathValidator()];
          }

          var isGlobPattern = areGlobPatterns.every(function (isGlob) {return isGlob;});

          return allZoneFrom.map(function (singleZoneFrom) {
            var absoluteFrom = _path2['default'].resolve(basePath, singleZoneFrom);

            if (isGlobPattern) {
              return computeGlobPatternPathValidator(absoluteFrom, zoneExcept);
            }
            return computeAbsolutePathValidator(absoluteFrom, zoneExcept);
          });
        }return makePathValidators;}();

      var validators = [];

      function checkForRestrictedImportPath(importPath, node) {
        var absoluteImportPath = (0, _resolve2['default'])(importPath, context);

        if (!absoluteImportPath) {
          return;
        }

        matchingZones.forEach(function (zone, index) {
          if (!validators[index]) {
            validators[index] = makePathValidators(zone.from, zone.except);
          }

          var applicableValidatorsForImportPath = validators[index].filter(function (validator) {return validator.isPathRestricted(absoluteImportPath);});

          var validatorsWithInvalidExceptions = applicableValidatorsForImportPath.filter(function (validator) {return !validator.hasValidExceptions;});
          reportInvalidExceptions(validatorsWithInvalidExceptions, node);

          var applicableValidatorsForImportPathExcludingExceptions = applicableValidatorsForImportPath.
          filter(function (validator) {return validator.hasValidExceptions;}).
          filter(function (validator) {return !validator.isPathException(absoluteImportPath);});
          reportImportsInRestrictedZone(applicableValidatorsForImportPathExcludingExceptions, node, importPath, zone.message);
        });
      }

      return (0, _moduleVisitor2['default'])(function (source) {
        checkForRestrictedImportPath(source.value, source);
      }, { commonjs: true });
    }return noRestrictedPaths;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1yZXN0cmljdGVkLXBhdGhzLmpzIl0sIm5hbWVzIjpbImNvbnRhaW5zUGF0aCIsImZpbGVwYXRoIiwidGFyZ2V0IiwicmVsYXRpdmUiLCJwYXRoIiwic3RhcnRzV2l0aCIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwic2NoZW1hIiwicHJvcGVydGllcyIsInpvbmVzIiwibWluSXRlbXMiLCJpdGVtcyIsImFueU9mIiwidW5pcXVlSXRlbXMiLCJtaW5MZW5ndGgiLCJmcm9tIiwiZXhjZXB0IiwibWVzc2FnZSIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwiYmFzZVBhdGgiLCJjcmVhdGUiLCJub1Jlc3RyaWN0ZWRQYXRocyIsImNvbnRleHQiLCJvcHRpb25zIiwicmVzdHJpY3RlZFBhdGhzIiwicHJvY2VzcyIsImN3ZCIsImN1cnJlbnRGaWxlbmFtZSIsImdldFBoeXNpY2FsRmlsZW5hbWUiLCJnZXRGaWxlbmFtZSIsIm1hdGNoaW5nWm9uZXMiLCJmaWx0ZXIiLCJ6b25lIiwiY29uY2F0IiwibWFwIiwicmVzb2x2ZSIsInNvbWUiLCJpc01hdGNoaW5nVGFyZ2V0UGF0aCIsInRhcmdldFBhdGgiLCJmaWxlbmFtZSIsIm1tIiwiTWluaW1hdGNoIiwibWF0Y2giLCJpc1ZhbGlkRXhjZXB0aW9uUGF0aCIsImFic29sdXRlRnJvbVBhdGgiLCJhYnNvbHV0ZUV4Y2VwdGlvblBhdGgiLCJyZWxhdGl2ZUV4Y2VwdGlvblBhdGgiLCJhcmVCb3RoR2xvYlBhdHRlcm5BbmRBYnNvbHV0ZVBhdGgiLCJhcmVHbG9iUGF0dGVybnMiLCJpc0dsb2IiLCJyZXBvcnRJbnZhbGlkRXhjZXB0aW9uUGF0aCIsIm5vZGUiLCJyZXBvcnQiLCJyZXBvcnRJbnZhbGlkRXhjZXB0aW9uTWl4ZWRHbG9iQW5kTm9uR2xvYiIsInJlcG9ydEludmFsaWRFeGNlcHRpb25HbG9iIiwiY29tcHV0ZU1peGVkR2xvYkFuZEFic29sdXRlUGF0aFZhbGlkYXRvciIsImlzUGF0aFJlc3RyaWN0ZWQiLCJoYXNWYWxpZEV4Y2VwdGlvbnMiLCJyZXBvcnRJbnZhbGlkRXhjZXB0aW9uIiwiY29tcHV0ZUdsb2JQYXR0ZXJuUGF0aFZhbGlkYXRvciIsImFic29sdXRlRnJvbSIsInpvbmVFeGNlcHQiLCJpc1BhdGhFeGNlcHRpb24iLCJhYnNvbHV0ZUltcG9ydFBhdGgiLCJldmVyeSIsImV4Y2VwdGlvbnNNbSIsImNvbXB1dGVBYnNvbHV0ZVBhdGhWYWxpZGF0b3IiLCJhYnNvbHV0ZUV4Y2VwdGlvblBhdGhzIiwiZXhjZXB0aW9uUGF0aCIsInJlcG9ydEludmFsaWRFeGNlcHRpb25zIiwidmFsaWRhdG9ycyIsImZvckVhY2giLCJ2YWxpZGF0b3IiLCJyZXBvcnRJbXBvcnRzSW5SZXN0cmljdGVkWm9uZSIsImltcG9ydFBhdGgiLCJjdXN0b21NZXNzYWdlIiwiZGF0YSIsIm1ha2VQYXRoVmFsaWRhdG9ycyIsInpvbmVGcm9tIiwiYWxsWm9uZUZyb20iLCJpc0dsb2JQYXR0ZXJuIiwic2luZ2xlWm9uZUZyb20iLCJjaGVja0ZvclJlc3RyaWN0ZWRJbXBvcnRQYXRoIiwiaW5kZXgiLCJhcHBsaWNhYmxlVmFsaWRhdG9yc0ZvckltcG9ydFBhdGgiLCJ2YWxpZGF0b3JzV2l0aEludmFsaWRFeGNlcHRpb25zIiwiYXBwbGljYWJsZVZhbGlkYXRvcnNGb3JJbXBvcnRQYXRoRXhjbHVkaW5nRXhjZXB0aW9ucyIsInNvdXJjZSIsInZhbHVlIiwiY29tbW9uanMiXSwibWFwcGluZ3MiOiJhQUFBLDRCOztBQUVBLHNEO0FBQ0Esa0U7QUFDQSxpQztBQUNBO0FBQ0EscUM7QUFDQSxnRDs7QUFFQSxJQUFNQSxlQUFlLFNBQWZBLFlBQWUsQ0FBQ0MsUUFBRCxFQUFXQyxNQUFYLEVBQXNCO0FBQ3pDLE1BQU1DLFdBQVdDLGtCQUFLRCxRQUFMLENBQWNELE1BQWQsRUFBc0JELFFBQXRCLENBQWpCO0FBQ0EsU0FBT0UsYUFBYSxFQUFiLElBQW1CLENBQUNBLFNBQVNFLFVBQVQsQ0FBb0IsSUFBcEIsQ0FBM0I7QUFDRCxDQUhEOztBQUtBQyxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZDLFFBQU07QUFDSkMsVUFBTSxTQURGO0FBRUpDLFVBQU07QUFDSkMsZ0JBQVUsaUJBRE47QUFFSkMsbUJBQWEsd0RBRlQ7QUFHSkMsV0FBSywwQkFBUSxxQkFBUixDQUhELEVBRkY7OztBQVFKQyxZQUFRO0FBQ047QUFDRUwsWUFBTSxRQURSO0FBRUVNLGtCQUFZO0FBQ1ZDLGVBQU87QUFDTFAsZ0JBQU0sT0FERDtBQUVMUSxvQkFBVSxDQUZMO0FBR0xDLGlCQUFPO0FBQ0xULGtCQUFNLFFBREQ7QUFFTE0sd0JBQVk7QUFDVmIsc0JBQVE7QUFDTmlCLHVCQUFPO0FBQ0wsa0JBQUVWLE1BQU0sUUFBUixFQURLO0FBRUw7QUFDRUEsd0JBQU0sT0FEUjtBQUVFUyx5QkFBTyxFQUFFVCxNQUFNLFFBQVIsRUFGVDtBQUdFVywrQkFBYSxJQUhmO0FBSUVDLDZCQUFXLENBSmIsRUFGSyxDQURELEVBREU7Ozs7QUFZVkMsb0JBQU07QUFDSkgsdUJBQU87QUFDTCxrQkFBRVYsTUFBTSxRQUFSLEVBREs7QUFFTDtBQUNFQSx3QkFBTSxPQURSO0FBRUVTLHlCQUFPLEVBQUVULE1BQU0sUUFBUixFQUZUO0FBR0VXLCtCQUFhLElBSGY7QUFJRUMsNkJBQVcsQ0FKYixFQUZLLENBREgsRUFaSTs7OztBQXVCVkUsc0JBQVE7QUFDTmQsc0JBQU0sT0FEQTtBQUVOUyx1QkFBTztBQUNMVCx3QkFBTSxRQURELEVBRkQ7O0FBS05XLDZCQUFhLElBTFAsRUF2QkU7O0FBOEJWSSx1QkFBUyxFQUFFZixNQUFNLFFBQVIsRUE5QkMsRUFGUDs7QUFrQ0xnQixrQ0FBc0IsS0FsQ2pCLEVBSEYsRUFERzs7O0FBeUNWQyxrQkFBVSxFQUFFakIsTUFBTSxRQUFSLEVBekNBLEVBRmQ7O0FBNkNFZ0IsNEJBQXNCLEtBN0N4QixFQURNLENBUkosRUFEUzs7Ozs7QUE0RGZFLHVCQUFRLFNBQVNDLGlCQUFULENBQTJCQyxPQUEzQixFQUFvQztBQUMxQyxVQUFNQyxVQUFVRCxRQUFRQyxPQUFSLENBQWdCLENBQWhCLEtBQXNCLEVBQXRDO0FBQ0EsVUFBTUMsa0JBQWtCRCxRQUFRZCxLQUFSLElBQWlCLEVBQXpDO0FBQ0EsVUFBTVUsV0FBV0ksUUFBUUosUUFBUixJQUFvQk0sUUFBUUMsR0FBUixFQUFyQztBQUNBLFVBQU1DLGtCQUFrQkwsUUFBUU0sbUJBQVIsR0FBOEJOLFFBQVFNLG1CQUFSLEVBQTlCLEdBQThETixRQUFRTyxXQUFSLEVBQXRGO0FBQ0EsVUFBTUMsZ0JBQWdCTixnQkFBZ0JPLE1BQWhCLENBQXVCLFVBQUNDLElBQUQsRUFBVTtBQUNyRCxlQUFPLEdBQUdDLE1BQUgsQ0FBVUQsS0FBS3JDLE1BQWY7QUFDSnVDLFdBREksQ0FDQSwwQkFBVXJDLGtCQUFLc0MsT0FBTCxDQUFhaEIsUUFBYixFQUF1QnhCLE1BQXZCLENBQVYsRUFEQTtBQUVKeUMsWUFGSSxDQUVDLDhCQUFjQyxxQkFBcUJWLGVBQXJCLEVBQXNDVyxVQUF0QyxDQUFkLEVBRkQsQ0FBUDtBQUdELE9BSnFCLENBQXRCOztBQU1BLGVBQVNELG9CQUFULENBQThCRSxRQUE5QixFQUF3Q0QsVUFBeEMsRUFBb0Q7QUFDbEQsWUFBSSx5QkFBT0EsVUFBUCxDQUFKLEVBQXdCO0FBQ3RCLGNBQU1FLEtBQUssSUFBSUMsb0JBQUosQ0FBY0gsVUFBZCxDQUFYO0FBQ0EsaUJBQU9FLEdBQUdFLEtBQUgsQ0FBU0gsUUFBVCxDQUFQO0FBQ0Q7O0FBRUQsZUFBTzlDLGFBQWE4QyxRQUFiLEVBQXVCRCxVQUF2QixDQUFQO0FBQ0Q7O0FBRUQsZUFBU0ssb0JBQVQsQ0FBOEJDLGdCQUE5QixFQUFnREMscUJBQWhELEVBQXVFO0FBQ3JFLFlBQU1DLHdCQUF3QmpELGtCQUFLRCxRQUFMLENBQWNnRCxnQkFBZCxFQUFnQ0MscUJBQWhDLENBQTlCOztBQUVBLGVBQU8sNkJBQVdDLHFCQUFYLEVBQWtDeEIsT0FBbEMsTUFBK0MsUUFBdEQ7QUFDRDs7QUFFRCxlQUFTeUIsaUNBQVQsQ0FBMkNDLGVBQTNDLEVBQTREO0FBQzFELGVBQU9BLGdCQUFnQlosSUFBaEIsQ0FBcUIsVUFBQ2EsTUFBRCxVQUFZQSxNQUFaLEVBQXJCLEtBQTRDRCxnQkFBZ0JaLElBQWhCLENBQXFCLFVBQUNhLE1BQUQsVUFBWSxDQUFDQSxNQUFiLEVBQXJCLENBQW5EO0FBQ0Q7O0FBRUQsZUFBU0MsMEJBQVQsQ0FBb0NDLElBQXBDLEVBQTBDO0FBQ3hDN0IsZ0JBQVE4QixNQUFSLENBQWU7QUFDYkQsb0JBRGE7QUFFYmxDLG1CQUFTLDZGQUZJLEVBQWY7O0FBSUQ7O0FBRUQsZUFBU29DLHlDQUFULENBQW1ERixJQUFuRCxFQUF5RDtBQUN2RDdCLGdCQUFROEIsTUFBUixDQUFlO0FBQ2JELG9CQURhO0FBRWJsQyxtQkFBUyx1RUFGSSxFQUFmOztBQUlEOztBQUVELGVBQVNxQywwQkFBVCxDQUFvQ0gsSUFBcEMsRUFBMEM7QUFDeEM3QixnQkFBUThCLE1BQVIsQ0FBZTtBQUNiRCxvQkFEYTtBQUVibEMsbUJBQVMscUZBRkksRUFBZjs7QUFJRDs7QUFFRCxlQUFTc0Msd0NBQVQsR0FBb0Q7QUFDbEQsZUFBTztBQUNMQyx5Q0FBa0Isb0NBQU0sSUFBTixFQUFsQiwyQkFESztBQUVMQyw4QkFBb0IsS0FGZjtBQUdMQyxrQ0FBd0JMLHlDQUhuQixFQUFQOztBQUtEOztBQUVELGVBQVNNLCtCQUFULENBQXlDQyxZQUF6QyxFQUF1REMsVUFBdkQsRUFBbUU7QUFDakUsWUFBSUMsd0JBQUo7O0FBRUEsWUFBTXRCLEtBQUssSUFBSUMsb0JBQUosQ0FBY21CLFlBQWQsQ0FBWDtBQUNBLFlBQU1KLGdDQUFtQixTQUFuQkEsZ0JBQW1CLENBQUNPLGtCQUFELFVBQXdCdkIsR0FBR0UsS0FBSCxDQUFTcUIsa0JBQVQsQ0FBeEIsRUFBbkIsMkJBQU47QUFDQSxZQUFNTixxQkFBcUJJLFdBQVdHLEtBQVgsQ0FBaUJmLG1CQUFqQixDQUEzQjs7QUFFQSxZQUFJUSxrQkFBSixFQUF3QjtBQUN0QixjQUFNUSxlQUFlSixXQUFXM0IsR0FBWCxDQUFlLFVBQUNsQixNQUFELFVBQVksSUFBSXlCLG9CQUFKLENBQWN6QixNQUFkLENBQVosRUFBZixDQUFyQjtBQUNBOEMseUNBQWtCLHlCQUFDQyxrQkFBRCxVQUF3QkUsYUFBYTdCLElBQWIsQ0FBa0IsVUFBQ0ksRUFBRCxVQUFRQSxHQUFHRSxLQUFILENBQVNxQixrQkFBVCxDQUFSLEVBQWxCLENBQXhCLEVBQWxCO0FBQ0Q7O0FBRUQsWUFBTUwseUJBQXlCSiwwQkFBL0I7O0FBRUEsZUFBTztBQUNMRSw0Q0FESztBQUVMQyxnREFGSztBQUdMSywwQ0FISztBQUlMSix3REFKSyxFQUFQOztBQU1EOztBQUVELGVBQVNRLDRCQUFULENBQXNDTixZQUF0QyxFQUFvREMsVUFBcEQsRUFBZ0U7QUFDOUQsWUFBSUMsd0JBQUo7O0FBRUEsWUFBTU4sZ0NBQW1CLFNBQW5CQSxnQkFBbUIsQ0FBQ08sa0JBQUQsVUFBd0J0RSxhQUFhc0Usa0JBQWIsRUFBaUNILFlBQWpDLENBQXhCLEVBQW5CLDJCQUFOOztBQUVBLFlBQU1PLHlCQUF5Qk47QUFDNUIzQixXQUQ0QixDQUN4QixVQUFDa0MsYUFBRCxVQUFtQnZFLGtCQUFLc0MsT0FBTCxDQUFheUIsWUFBYixFQUEyQlEsYUFBM0IsQ0FBbkIsRUFEd0IsQ0FBL0I7QUFFQSxZQUFNWCxxQkFBcUJVO0FBQ3hCSCxhQUR3QixDQUNsQixVQUFDbkIscUJBQUQsVUFBMkJGLHFCQUFxQmlCLFlBQXJCLEVBQW1DZixxQkFBbkMsQ0FBM0IsRUFEa0IsQ0FBM0I7O0FBR0EsWUFBSVksa0JBQUosRUFBd0I7QUFDdEJLLHlDQUFrQix5QkFBQ0Msa0JBQUQsVUFBd0JJLHVCQUF1Qi9CLElBQXZCO0FBQ3hDLHdCQUFDUyxxQkFBRCxVQUEyQnBELGFBQWFzRSxrQkFBYixFQUFpQ2xCLHFCQUFqQyxDQUEzQixFQUR3QyxDQUF4QixFQUFsQjs7QUFHRDs7QUFFRCxZQUFNYSx5QkFBeUJSLDBCQUEvQjs7QUFFQSxlQUFPO0FBQ0xNLDRDQURLO0FBRUxDLGdEQUZLO0FBR0xLLDBDQUhLO0FBSUxKLHdEQUpLLEVBQVA7O0FBTUQ7O0FBRUQsZUFBU1csdUJBQVQsQ0FBaUNDLFVBQWpDLEVBQTZDbkIsSUFBN0MsRUFBbUQ7QUFDakRtQixtQkFBV0MsT0FBWCxDQUFtQiw2QkFBYUMsVUFBVWQsc0JBQVYsQ0FBaUNQLElBQWpDLENBQWIsRUFBbkI7QUFDRDs7QUFFRCxlQUFTc0IsNkJBQVQsQ0FBdUNILFVBQXZDLEVBQW1EbkIsSUFBbkQsRUFBeUR1QixVQUF6RCxFQUFxRUMsYUFBckUsRUFBb0Y7QUFDbEZMLG1CQUFXQyxPQUFYLENBQW1CLFlBQU07QUFDdkJqRCxrQkFBUThCLE1BQVIsQ0FBZTtBQUNiRCxzQkFEYTtBQUVibEMsd0ZBQXlFMEQsNkJBQW9CQSxhQUFwQixJQUFzQyxFQUEvRyxDQUZhO0FBR2JDLGtCQUFNLEVBQUVGLHNCQUFGLEVBSE8sRUFBZjs7QUFLRCxTQU5EO0FBT0Q7O0FBRUQsVUFBTUcsa0NBQXFCLFNBQXJCQSxrQkFBcUIsQ0FBQ0MsUUFBRCxFQUErQixLQUFwQmpCLFVBQW9CLHVFQUFQLEVBQU87QUFDeEQsY0FBTWtCLGNBQWMsR0FBRzlDLE1BQUgsQ0FBVTZDLFFBQVYsQ0FBcEI7QUFDQSxjQUFNOUIsa0JBQWtCK0IsWUFBWTdDLEdBQVosQ0FBZ0JlLG1CQUFoQixDQUF4Qjs7QUFFQSxjQUFJRixrQ0FBa0NDLGVBQWxDLENBQUosRUFBd0Q7QUFDdEQsbUJBQU8sQ0FBQ08sMENBQUQsQ0FBUDtBQUNEOztBQUVELGNBQU15QixnQkFBZ0JoQyxnQkFBZ0JnQixLQUFoQixDQUFzQixVQUFDZixNQUFELFVBQVlBLE1BQVosRUFBdEIsQ0FBdEI7O0FBRUEsaUJBQU84QixZQUFZN0MsR0FBWixDQUFnQiwwQkFBa0I7QUFDdkMsZ0JBQU0wQixlQUFlL0Qsa0JBQUtzQyxPQUFMLENBQWFoQixRQUFiLEVBQXVCOEQsY0FBdkIsQ0FBckI7O0FBRUEsZ0JBQUlELGFBQUosRUFBbUI7QUFDakIscUJBQU9yQixnQ0FBZ0NDLFlBQWhDLEVBQThDQyxVQUE5QyxDQUFQO0FBQ0Q7QUFDRCxtQkFBT0ssNkJBQTZCTixZQUE3QixFQUEyQ0MsVUFBM0MsQ0FBUDtBQUNELFdBUE0sQ0FBUDtBQVFELFNBbEJLLDZCQUFOOztBQW9CQSxVQUFNUyxhQUFhLEVBQW5COztBQUVBLGVBQVNZLDRCQUFULENBQXNDUixVQUF0QyxFQUFrRHZCLElBQWxELEVBQXdEO0FBQ3RELFlBQU1ZLHFCQUFxQiwwQkFBUVcsVUFBUixFQUFvQnBELE9BQXBCLENBQTNCOztBQUVBLFlBQUksQ0FBQ3lDLGtCQUFMLEVBQXlCO0FBQ3ZCO0FBQ0Q7O0FBRURqQyxzQkFBY3lDLE9BQWQsQ0FBc0IsVUFBQ3ZDLElBQUQsRUFBT21ELEtBQVAsRUFBaUI7QUFDckMsY0FBSSxDQUFDYixXQUFXYSxLQUFYLENBQUwsRUFBd0I7QUFDdEJiLHVCQUFXYSxLQUFYLElBQW9CTixtQkFBbUI3QyxLQUFLakIsSUFBeEIsRUFBOEJpQixLQUFLaEIsTUFBbkMsQ0FBcEI7QUFDRDs7QUFFRCxjQUFNb0Usb0NBQW9DZCxXQUFXYSxLQUFYLEVBQWtCcEQsTUFBbEIsQ0FBeUIsNkJBQWF5QyxVQUFVaEIsZ0JBQVYsQ0FBMkJPLGtCQUEzQixDQUFiLEVBQXpCLENBQTFDOztBQUVBLGNBQU1zQixrQ0FBa0NELGtDQUFrQ3JELE1BQWxDLENBQXlDLDZCQUFhLENBQUN5QyxVQUFVZixrQkFBeEIsRUFBekMsQ0FBeEM7QUFDQVksa0NBQXdCZ0IsK0JBQXhCLEVBQXlEbEMsSUFBekQ7O0FBRUEsY0FBTW1DLHVEQUF1REY7QUFDMURyRCxnQkFEMEQsQ0FDbkQsNkJBQWF5QyxVQUFVZixrQkFBdkIsRUFEbUQ7QUFFMUQxQixnQkFGMEQsQ0FFbkQsNkJBQWEsQ0FBQ3lDLFVBQVVWLGVBQVYsQ0FBMEJDLGtCQUExQixDQUFkLEVBRm1ELENBQTdEO0FBR0FVLHdDQUE4QmEsb0RBQTlCLEVBQW9GbkMsSUFBcEYsRUFBMEZ1QixVQUExRixFQUFzRzFDLEtBQUtmLE9BQTNHO0FBQ0QsU0FkRDtBQWVEOztBQUVELGFBQU8sZ0NBQWMsVUFBQ3NFLE1BQUQsRUFBWTtBQUMvQkwscUNBQTZCSyxPQUFPQyxLQUFwQyxFQUEyQ0QsTUFBM0M7QUFDRCxPQUZNLEVBRUosRUFBRUUsVUFBVSxJQUFaLEVBRkksQ0FBUDtBQUdELEtBMUtELE9BQWlCcEUsaUJBQWpCLElBNURlLEVBQWpCIiwiZmlsZSI6Im5vLXJlc3RyaWN0ZWQtcGF0aHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuXHJcbmltcG9ydCByZXNvbHZlIGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvcmVzb2x2ZSc7XHJcbmltcG9ydCBtb2R1bGVWaXNpdG9yIGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvbW9kdWxlVmlzaXRvcic7XHJcbmltcG9ydCBpc0dsb2IgZnJvbSAnaXMtZ2xvYic7XHJcbmltcG9ydCB7IE1pbmltYXRjaCB9IGZyb20gJ21pbmltYXRjaCc7XHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnO1xyXG5pbXBvcnQgaW1wb3J0VHlwZSBmcm9tICcuLi9jb3JlL2ltcG9ydFR5cGUnO1xyXG5cclxuY29uc3QgY29udGFpbnNQYXRoID0gKGZpbGVwYXRoLCB0YXJnZXQpID0+IHtcclxuICBjb25zdCByZWxhdGl2ZSA9IHBhdGgucmVsYXRpdmUodGFyZ2V0LCBmaWxlcGF0aCk7XHJcbiAgcmV0dXJuIHJlbGF0aXZlID09PSAnJyB8fCAhcmVsYXRpdmUuc3RhcnRzV2l0aCgnLi4nKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdwcm9ibGVtJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgY2F0ZWdvcnk6ICdTdGF0aWMgYW5hbHlzaXMnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0VuZm9yY2Ugd2hpY2ggZmlsZXMgY2FuIGJlIGltcG9ydGVkIGluIGEgZ2l2ZW4gZm9sZGVyLicsXHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8tcmVzdHJpY3RlZC1wYXRocycpLFxyXG4gICAgfSxcclxuXHJcbiAgICBzY2hlbWE6IFtcclxuICAgICAge1xyXG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgIHpvbmVzOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgICAgIG1pbkl0ZW1zOiAxLFxyXG4gICAgICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgIHRhcmdldDoge1xyXG4gICAgICAgICAgICAgICAgICBhbnlPZjogW1xyXG4gICAgICAgICAgICAgICAgICAgIHsgdHlwZTogJ3N0cmluZycgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IHsgdHlwZTogJ3N0cmluZycgfSxcclxuICAgICAgICAgICAgICAgICAgICAgIHVuaXF1ZUl0ZW1zOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZnJvbToge1xyXG4gICAgICAgICAgICAgICAgICBhbnlPZjogW1xyXG4gICAgICAgICAgICAgICAgICAgIHsgdHlwZTogJ3N0cmluZycgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IHsgdHlwZTogJ3N0cmluZycgfSxcclxuICAgICAgICAgICAgICAgICAgICAgIHVuaXF1ZUl0ZW1zOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXhjZXB0OiB7XHJcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgICAgICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgIHVuaXF1ZUl0ZW1zOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHsgdHlwZTogJ3N0cmluZycgfSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBiYXNlUGF0aDogeyB0eXBlOiAnc3RyaW5nJyB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICB9LFxyXG5cclxuICBjcmVhdGU6IGZ1bmN0aW9uIG5vUmVzdHJpY3RlZFBhdGhzKGNvbnRleHQpIHtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBjb250ZXh0Lm9wdGlvbnNbMF0gfHwge307XHJcbiAgICBjb25zdCByZXN0cmljdGVkUGF0aHMgPSBvcHRpb25zLnpvbmVzIHx8IFtdO1xyXG4gICAgY29uc3QgYmFzZVBhdGggPSBvcHRpb25zLmJhc2VQYXRoIHx8IHByb2Nlc3MuY3dkKCk7XHJcbiAgICBjb25zdCBjdXJyZW50RmlsZW5hbWUgPSBjb250ZXh0LmdldFBoeXNpY2FsRmlsZW5hbWUgPyBjb250ZXh0LmdldFBoeXNpY2FsRmlsZW5hbWUoKSA6IGNvbnRleHQuZ2V0RmlsZW5hbWUoKTtcclxuICAgIGNvbnN0IG1hdGNoaW5nWm9uZXMgPSByZXN0cmljdGVkUGF0aHMuZmlsdGVyKCh6b25lKSA9PiB7XHJcbiAgICAgIHJldHVybiBbXS5jb25jYXQoem9uZS50YXJnZXQpXHJcbiAgICAgICAgLm1hcCh0YXJnZXQgPT4gcGF0aC5yZXNvbHZlKGJhc2VQYXRoLCB0YXJnZXQpKVxyXG4gICAgICAgIC5zb21lKHRhcmdldFBhdGggPT4gaXNNYXRjaGluZ1RhcmdldFBhdGgoY3VycmVudEZpbGVuYW1lLCB0YXJnZXRQYXRoKSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpc01hdGNoaW5nVGFyZ2V0UGF0aChmaWxlbmFtZSwgdGFyZ2V0UGF0aCkge1xyXG4gICAgICBpZiAoaXNHbG9iKHRhcmdldFBhdGgpKSB7XHJcbiAgICAgICAgY29uc3QgbW0gPSBuZXcgTWluaW1hdGNoKHRhcmdldFBhdGgpO1xyXG4gICAgICAgIHJldHVybiBtbS5tYXRjaChmaWxlbmFtZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBjb250YWluc1BhdGgoZmlsZW5hbWUsIHRhcmdldFBhdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlzVmFsaWRFeGNlcHRpb25QYXRoKGFic29sdXRlRnJvbVBhdGgsIGFic29sdXRlRXhjZXB0aW9uUGF0aCkge1xyXG4gICAgICBjb25zdCByZWxhdGl2ZUV4Y2VwdGlvblBhdGggPSBwYXRoLnJlbGF0aXZlKGFic29sdXRlRnJvbVBhdGgsIGFic29sdXRlRXhjZXB0aW9uUGF0aCk7XHJcblxyXG4gICAgICByZXR1cm4gaW1wb3J0VHlwZShyZWxhdGl2ZUV4Y2VwdGlvblBhdGgsIGNvbnRleHQpICE9PSAncGFyZW50JztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhcmVCb3RoR2xvYlBhdHRlcm5BbmRBYnNvbHV0ZVBhdGgoYXJlR2xvYlBhdHRlcm5zKSB7XHJcbiAgICAgIHJldHVybiBhcmVHbG9iUGF0dGVybnMuc29tZSgoaXNHbG9iKSA9PiBpc0dsb2IpICYmIGFyZUdsb2JQYXR0ZXJucy5zb21lKChpc0dsb2IpID0+ICFpc0dsb2IpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlcG9ydEludmFsaWRFeGNlcHRpb25QYXRoKG5vZGUpIHtcclxuICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgIG5vZGUsXHJcbiAgICAgICAgbWVzc2FnZTogJ1Jlc3RyaWN0ZWQgcGF0aCBleGNlcHRpb25zIG11c3QgYmUgZGVzY2VuZGFudHMgb2YgdGhlIGNvbmZpZ3VyZWQgYGZyb21gIHBhdGggZm9yIHRoYXQgem9uZS4nLFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZXBvcnRJbnZhbGlkRXhjZXB0aW9uTWl4ZWRHbG9iQW5kTm9uR2xvYihub2RlKSB7XHJcbiAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICBub2RlLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdSZXN0cmljdGVkIHBhdGggYGZyb21gIG11c3QgY29udGFpbiBlaXRoZXIgb25seSBnbG9iIHBhdHRlcm5zIG9yIG5vbmUnLFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZXBvcnRJbnZhbGlkRXhjZXB0aW9uR2xvYihub2RlKSB7XHJcbiAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICBub2RlLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdSZXN0cmljdGVkIHBhdGggZXhjZXB0aW9ucyBtdXN0IGJlIGdsb2IgcGF0dGVybnMgd2hlbiBgZnJvbWAgY29udGFpbnMgZ2xvYiBwYXR0ZXJucycsXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvbXB1dGVNaXhlZEdsb2JBbmRBYnNvbHV0ZVBhdGhWYWxpZGF0b3IoKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgaXNQYXRoUmVzdHJpY3RlZDogKCkgPT4gdHJ1ZSxcclxuICAgICAgICBoYXNWYWxpZEV4Y2VwdGlvbnM6IGZhbHNlLFxyXG4gICAgICAgIHJlcG9ydEludmFsaWRFeGNlcHRpb246IHJlcG9ydEludmFsaWRFeGNlcHRpb25NaXhlZEdsb2JBbmROb25HbG9iLFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvbXB1dGVHbG9iUGF0dGVyblBhdGhWYWxpZGF0b3IoYWJzb2x1dGVGcm9tLCB6b25lRXhjZXB0KSB7XHJcbiAgICAgIGxldCBpc1BhdGhFeGNlcHRpb247XHJcblxyXG4gICAgICBjb25zdCBtbSA9IG5ldyBNaW5pbWF0Y2goYWJzb2x1dGVGcm9tKTtcclxuICAgICAgY29uc3QgaXNQYXRoUmVzdHJpY3RlZCA9IChhYnNvbHV0ZUltcG9ydFBhdGgpID0+IG1tLm1hdGNoKGFic29sdXRlSW1wb3J0UGF0aCk7XHJcbiAgICAgIGNvbnN0IGhhc1ZhbGlkRXhjZXB0aW9ucyA9IHpvbmVFeGNlcHQuZXZlcnkoaXNHbG9iKTtcclxuXHJcbiAgICAgIGlmIChoYXNWYWxpZEV4Y2VwdGlvbnMpIHtcclxuICAgICAgICBjb25zdCBleGNlcHRpb25zTW0gPSB6b25lRXhjZXB0Lm1hcCgoZXhjZXB0KSA9PiBuZXcgTWluaW1hdGNoKGV4Y2VwdCkpO1xyXG4gICAgICAgIGlzUGF0aEV4Y2VwdGlvbiA9IChhYnNvbHV0ZUltcG9ydFBhdGgpID0+IGV4Y2VwdGlvbnNNbS5zb21lKChtbSkgPT4gbW0ubWF0Y2goYWJzb2x1dGVJbXBvcnRQYXRoKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHJlcG9ydEludmFsaWRFeGNlcHRpb24gPSByZXBvcnRJbnZhbGlkRXhjZXB0aW9uR2xvYjtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgaXNQYXRoUmVzdHJpY3RlZCxcclxuICAgICAgICBoYXNWYWxpZEV4Y2VwdGlvbnMsXHJcbiAgICAgICAgaXNQYXRoRXhjZXB0aW9uLFxyXG4gICAgICAgIHJlcG9ydEludmFsaWRFeGNlcHRpb24sXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY29tcHV0ZUFic29sdXRlUGF0aFZhbGlkYXRvcihhYnNvbHV0ZUZyb20sIHpvbmVFeGNlcHQpIHtcclxuICAgICAgbGV0IGlzUGF0aEV4Y2VwdGlvbjtcclxuXHJcbiAgICAgIGNvbnN0IGlzUGF0aFJlc3RyaWN0ZWQgPSAoYWJzb2x1dGVJbXBvcnRQYXRoKSA9PiBjb250YWluc1BhdGgoYWJzb2x1dGVJbXBvcnRQYXRoLCBhYnNvbHV0ZUZyb20pO1xyXG5cclxuICAgICAgY29uc3QgYWJzb2x1dGVFeGNlcHRpb25QYXRocyA9IHpvbmVFeGNlcHRcclxuICAgICAgICAubWFwKChleGNlcHRpb25QYXRoKSA9PiBwYXRoLnJlc29sdmUoYWJzb2x1dGVGcm9tLCBleGNlcHRpb25QYXRoKSk7XHJcbiAgICAgIGNvbnN0IGhhc1ZhbGlkRXhjZXB0aW9ucyA9IGFic29sdXRlRXhjZXB0aW9uUGF0aHNcclxuICAgICAgICAuZXZlcnkoKGFic29sdXRlRXhjZXB0aW9uUGF0aCkgPT4gaXNWYWxpZEV4Y2VwdGlvblBhdGgoYWJzb2x1dGVGcm9tLCBhYnNvbHV0ZUV4Y2VwdGlvblBhdGgpKTtcclxuXHJcbiAgICAgIGlmIChoYXNWYWxpZEV4Y2VwdGlvbnMpIHtcclxuICAgICAgICBpc1BhdGhFeGNlcHRpb24gPSAoYWJzb2x1dGVJbXBvcnRQYXRoKSA9PiBhYnNvbHV0ZUV4Y2VwdGlvblBhdGhzLnNvbWUoXHJcbiAgICAgICAgICAoYWJzb2x1dGVFeGNlcHRpb25QYXRoKSA9PiBjb250YWluc1BhdGgoYWJzb2x1dGVJbXBvcnRQYXRoLCBhYnNvbHV0ZUV4Y2VwdGlvblBhdGgpLFxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHJlcG9ydEludmFsaWRFeGNlcHRpb24gPSByZXBvcnRJbnZhbGlkRXhjZXB0aW9uUGF0aDtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgaXNQYXRoUmVzdHJpY3RlZCxcclxuICAgICAgICBoYXNWYWxpZEV4Y2VwdGlvbnMsXHJcbiAgICAgICAgaXNQYXRoRXhjZXB0aW9uLFxyXG4gICAgICAgIHJlcG9ydEludmFsaWRFeGNlcHRpb24sXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVwb3J0SW52YWxpZEV4Y2VwdGlvbnModmFsaWRhdG9ycywgbm9kZSkge1xyXG4gICAgICB2YWxpZGF0b3JzLmZvckVhY2godmFsaWRhdG9yID0+IHZhbGlkYXRvci5yZXBvcnRJbnZhbGlkRXhjZXB0aW9uKG5vZGUpKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZXBvcnRJbXBvcnRzSW5SZXN0cmljdGVkWm9uZSh2YWxpZGF0b3JzLCBub2RlLCBpbXBvcnRQYXRoLCBjdXN0b21NZXNzYWdlKSB7XHJcbiAgICAgIHZhbGlkYXRvcnMuZm9yRWFjaCgoKSA9PiB7XHJcbiAgICAgICAgY29udGV4dC5yZXBvcnQoe1xyXG4gICAgICAgICAgbm9kZSxcclxuICAgICAgICAgIG1lc3NhZ2U6IGBVbmV4cGVjdGVkIHBhdGggXCJ7e2ltcG9ydFBhdGh9fVwiIGltcG9ydGVkIGluIHJlc3RyaWN0ZWQgem9uZS4ke2N1c3RvbU1lc3NhZ2UgPyBgICR7Y3VzdG9tTWVzc2FnZX1gIDogJyd9YCxcclxuICAgICAgICAgIGRhdGE6IHsgaW1wb3J0UGF0aCB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtYWtlUGF0aFZhbGlkYXRvcnMgPSAoem9uZUZyb20sIHpvbmVFeGNlcHQgPSBbXSkgPT4ge1xyXG4gICAgICBjb25zdCBhbGxab25lRnJvbSA9IFtdLmNvbmNhdCh6b25lRnJvbSk7XHJcbiAgICAgIGNvbnN0IGFyZUdsb2JQYXR0ZXJucyA9IGFsbFpvbmVGcm9tLm1hcChpc0dsb2IpO1xyXG5cclxuICAgICAgaWYgKGFyZUJvdGhHbG9iUGF0dGVybkFuZEFic29sdXRlUGF0aChhcmVHbG9iUGF0dGVybnMpKSB7XHJcbiAgICAgICAgcmV0dXJuIFtjb21wdXRlTWl4ZWRHbG9iQW5kQWJzb2x1dGVQYXRoVmFsaWRhdG9yKCldO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBpc0dsb2JQYXR0ZXJuID0gYXJlR2xvYlBhdHRlcm5zLmV2ZXJ5KChpc0dsb2IpID0+IGlzR2xvYik7XHJcblxyXG4gICAgICByZXR1cm4gYWxsWm9uZUZyb20ubWFwKHNpbmdsZVpvbmVGcm9tID0+IHtcclxuICAgICAgICBjb25zdCBhYnNvbHV0ZUZyb20gPSBwYXRoLnJlc29sdmUoYmFzZVBhdGgsIHNpbmdsZVpvbmVGcm9tKTtcclxuXHJcbiAgICAgICAgaWYgKGlzR2xvYlBhdHRlcm4pIHtcclxuICAgICAgICAgIHJldHVybiBjb21wdXRlR2xvYlBhdHRlcm5QYXRoVmFsaWRhdG9yKGFic29sdXRlRnJvbSwgem9uZUV4Y2VwdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb21wdXRlQWJzb2x1dGVQYXRoVmFsaWRhdG9yKGFic29sdXRlRnJvbSwgem9uZUV4Y2VwdCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCB2YWxpZGF0b3JzID0gW107XHJcblxyXG4gICAgZnVuY3Rpb24gY2hlY2tGb3JSZXN0cmljdGVkSW1wb3J0UGF0aChpbXBvcnRQYXRoLCBub2RlKSB7XHJcbiAgICAgIGNvbnN0IGFic29sdXRlSW1wb3J0UGF0aCA9IHJlc29sdmUoaW1wb3J0UGF0aCwgY29udGV4dCk7XHJcblxyXG4gICAgICBpZiAoIWFic29sdXRlSW1wb3J0UGF0aCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbWF0Y2hpbmdab25lcy5mb3JFYWNoKCh6b25lLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGlmICghdmFsaWRhdG9yc1tpbmRleF0pIHtcclxuICAgICAgICAgIHZhbGlkYXRvcnNbaW5kZXhdID0gbWFrZVBhdGhWYWxpZGF0b3JzKHpvbmUuZnJvbSwgem9uZS5leGNlcHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYXBwbGljYWJsZVZhbGlkYXRvcnNGb3JJbXBvcnRQYXRoID0gdmFsaWRhdG9yc1tpbmRleF0uZmlsdGVyKHZhbGlkYXRvciA9PiB2YWxpZGF0b3IuaXNQYXRoUmVzdHJpY3RlZChhYnNvbHV0ZUltcG9ydFBhdGgpKTtcclxuXHJcbiAgICAgICAgY29uc3QgdmFsaWRhdG9yc1dpdGhJbnZhbGlkRXhjZXB0aW9ucyA9IGFwcGxpY2FibGVWYWxpZGF0b3JzRm9ySW1wb3J0UGF0aC5maWx0ZXIodmFsaWRhdG9yID0+ICF2YWxpZGF0b3IuaGFzVmFsaWRFeGNlcHRpb25zKTtcclxuICAgICAgICByZXBvcnRJbnZhbGlkRXhjZXB0aW9ucyh2YWxpZGF0b3JzV2l0aEludmFsaWRFeGNlcHRpb25zLCBub2RlKTtcclxuXHJcbiAgICAgICAgY29uc3QgYXBwbGljYWJsZVZhbGlkYXRvcnNGb3JJbXBvcnRQYXRoRXhjbHVkaW5nRXhjZXB0aW9ucyA9IGFwcGxpY2FibGVWYWxpZGF0b3JzRm9ySW1wb3J0UGF0aFxyXG4gICAgICAgICAgLmZpbHRlcih2YWxpZGF0b3IgPT4gdmFsaWRhdG9yLmhhc1ZhbGlkRXhjZXB0aW9ucylcclxuICAgICAgICAgIC5maWx0ZXIodmFsaWRhdG9yID0+ICF2YWxpZGF0b3IuaXNQYXRoRXhjZXB0aW9uKGFic29sdXRlSW1wb3J0UGF0aCkpO1xyXG4gICAgICAgIHJlcG9ydEltcG9ydHNJblJlc3RyaWN0ZWRab25lKGFwcGxpY2FibGVWYWxpZGF0b3JzRm9ySW1wb3J0UGF0aEV4Y2x1ZGluZ0V4Y2VwdGlvbnMsIG5vZGUsIGltcG9ydFBhdGgsIHpvbmUubWVzc2FnZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBtb2R1bGVWaXNpdG9yKChzb3VyY2UpID0+IHtcclxuICAgICAgY2hlY2tGb3JSZXN0cmljdGVkSW1wb3J0UGF0aChzb3VyY2UudmFsdWUsIHNvdXJjZSk7XHJcbiAgICB9LCB7IGNvbW1vbmpzOiB0cnVlIH0pO1xyXG4gIH0sXHJcbn07XHJcbiJdfQ==