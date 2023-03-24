'use strict';var _path = require('path');var _path2 = _interopRequireDefault(_path);
var _moduleVisitor = require('eslint-module-utils/moduleVisitor');var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);
var _importType = require('../core/importType');
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Static analysis',
      description: 'Forbid import of modules using absolute paths.',
      url: (0, _docsUrl2['default'])('no-absolute-path') },

    fixable: 'code',
    schema: [(0, _moduleVisitor.makeOptionsSchema)()] },


  create: function () {function create(context) {
      function reportIfAbsolute(source) {
        if ((0, _importType.isAbsolute)(source.value)) {
          context.report({
            node: source,
            message: 'Do not import modules using an absolute path',
            fix: function () {function fix(fixer) {
                var resolvedContext = context.getPhysicalFilename ? context.getPhysicalFilename() : context.getFilename();
                // node.js and web imports work with posix style paths ("/")
                var relativePath = _path2['default'].posix.relative(_path2['default'].dirname(resolvedContext), source.value);
                if (!relativePath.startsWith('.')) {
                  relativePath = './' + relativePath;
                }
                return fixer.replaceText(source, JSON.stringify(relativePath));
              }return fix;}() });

        }
      }

      var options = Object.assign({ esmodule: true, commonjs: true }, context.options[0]);
      return (0, _moduleVisitor2['default'])(reportIfAbsolute, options);
    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1hYnNvbHV0ZS1wYXRoLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwiZml4YWJsZSIsInNjaGVtYSIsImNyZWF0ZSIsImNvbnRleHQiLCJyZXBvcnRJZkFic29sdXRlIiwic291cmNlIiwidmFsdWUiLCJyZXBvcnQiLCJub2RlIiwibWVzc2FnZSIsImZpeCIsInJlc29sdmVkQ29udGV4dCIsImdldFBoeXNpY2FsRmlsZW5hbWUiLCJnZXRGaWxlbmFtZSIsInJlbGF0aXZlUGF0aCIsInBhdGgiLCJwb3NpeCIsInJlbGF0aXZlIiwiZGlybmFtZSIsInN0YXJ0c1dpdGgiLCJmaXhlciIsInJlcGxhY2VUZXh0IiwiSlNPTiIsInN0cmluZ2lmeSIsIm9wdGlvbnMiLCJPYmplY3QiLCJhc3NpZ24iLCJlc21vZHVsZSIsImNvbW1vbmpzIl0sIm1hcHBpbmdzIjoiYUFBQSw0QjtBQUNBLGtFO0FBQ0E7QUFDQSxxQzs7QUFFQUEsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0pDLFVBQU0sWUFERjtBQUVKQyxVQUFNO0FBQ0pDLGdCQUFVLGlCQUROO0FBRUpDLG1CQUFhLGdEQUZUO0FBR0pDLFdBQUssMEJBQVEsa0JBQVIsQ0FIRCxFQUZGOztBQU9KQyxhQUFTLE1BUEw7QUFRSkMsWUFBUSxDQUFFLHVDQUFGLENBUkosRUFEUzs7O0FBWWZDLFFBWmUsK0JBWVJDLE9BWlEsRUFZQztBQUNkLGVBQVNDLGdCQUFULENBQTBCQyxNQUExQixFQUFrQztBQUNoQyxZQUFJLDRCQUFXQSxPQUFPQyxLQUFsQixDQUFKLEVBQThCO0FBQzVCSCxrQkFBUUksTUFBUixDQUFlO0FBQ2JDLGtCQUFNSCxNQURPO0FBRWJJLHFCQUFTLDhDQUZJO0FBR2JDLDhCQUFLLG9CQUFTO0FBQ1osb0JBQU1DLGtCQUFrQlIsUUFBUVMsbUJBQVIsR0FBOEJULFFBQVFTLG1CQUFSLEVBQTlCLEdBQThEVCxRQUFRVSxXQUFSLEVBQXRGO0FBQ0E7QUFDQSxvQkFBSUMsZUFBZUMsa0JBQUtDLEtBQUwsQ0FBV0MsUUFBWCxDQUFvQkYsa0JBQUtHLE9BQUwsQ0FBYVAsZUFBYixDQUFwQixFQUFtRE4sT0FBT0MsS0FBMUQsQ0FBbkI7QUFDQSxvQkFBSSxDQUFDUSxhQUFhSyxVQUFiLENBQXdCLEdBQXhCLENBQUwsRUFBbUM7QUFDakNMLGlDQUFlLE9BQU9BLFlBQXRCO0FBQ0Q7QUFDRCx1QkFBT00sTUFBTUMsV0FBTixDQUFrQmhCLE1BQWxCLEVBQTBCaUIsS0FBS0MsU0FBTCxDQUFlVCxZQUFmLENBQTFCLENBQVA7QUFDRCxlQVJELGNBSGEsRUFBZjs7QUFhRDtBQUNGOztBQUVELFVBQU1VLFVBQVVDLE9BQU9DLE1BQVAsQ0FBYyxFQUFFQyxVQUFVLElBQVosRUFBa0JDLFVBQVUsSUFBNUIsRUFBZCxFQUFrRHpCLFFBQVFxQixPQUFSLENBQWdCLENBQWhCLENBQWxELENBQWhCO0FBQ0EsYUFBTyxnQ0FBY3BCLGdCQUFkLEVBQWdDb0IsT0FBaEMsQ0FBUDtBQUNELEtBakNjLG1CQUFqQiIsImZpbGUiOiJuby1hYnNvbHV0ZS1wYXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCBtb2R1bGVWaXNpdG9yLCB7IG1ha2VPcHRpb25zU2NoZW1hIH0gZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9tb2R1bGVWaXNpdG9yJztcclxuaW1wb3J0IHsgaXNBYnNvbHV0ZSB9IGZyb20gJy4uL2NvcmUvaW1wb3J0VHlwZSc7XHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ3N1Z2dlc3Rpb24nLFxyXG4gICAgZG9jczoge1xyXG4gICAgICBjYXRlZ29yeTogJ1N0YXRpYyBhbmFseXNpcycsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnRm9yYmlkIGltcG9ydCBvZiBtb2R1bGVzIHVzaW5nIGFic29sdXRlIHBhdGhzLicsXHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8tYWJzb2x1dGUtcGF0aCcpLFxyXG4gICAgfSxcclxuICAgIGZpeGFibGU6ICdjb2RlJyxcclxuICAgIHNjaGVtYTogWyBtYWtlT3B0aW9uc1NjaGVtYSgpIF0sXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlKGNvbnRleHQpIHtcclxuICAgIGZ1bmN0aW9uIHJlcG9ydElmQWJzb2x1dGUoc291cmNlKSB7XHJcbiAgICAgIGlmIChpc0Fic29sdXRlKHNvdXJjZS52YWx1ZSkpIHtcclxuICAgICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgICBub2RlOiBzb3VyY2UsXHJcbiAgICAgICAgICBtZXNzYWdlOiAnRG8gbm90IGltcG9ydCBtb2R1bGVzIHVzaW5nIGFuIGFic29sdXRlIHBhdGgnLFxyXG4gICAgICAgICAgZml4OiBmaXhlciA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc29sdmVkQ29udGV4dCA9IGNvbnRleHQuZ2V0UGh5c2ljYWxGaWxlbmFtZSA/IGNvbnRleHQuZ2V0UGh5c2ljYWxGaWxlbmFtZSgpIDogY29udGV4dC5nZXRGaWxlbmFtZSgpO1xyXG4gICAgICAgICAgICAvLyBub2RlLmpzIGFuZCB3ZWIgaW1wb3J0cyB3b3JrIHdpdGggcG9zaXggc3R5bGUgcGF0aHMgKFwiL1wiKVxyXG4gICAgICAgICAgICBsZXQgcmVsYXRpdmVQYXRoID0gcGF0aC5wb3NpeC5yZWxhdGl2ZShwYXRoLmRpcm5hbWUocmVzb2x2ZWRDb250ZXh0KSwgc291cmNlLnZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKCFyZWxhdGl2ZVBhdGguc3RhcnRzV2l0aCgnLicpKSB7XHJcbiAgICAgICAgICAgICAgcmVsYXRpdmVQYXRoID0gJy4vJyArIHJlbGF0aXZlUGF0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZml4ZXIucmVwbGFjZVRleHQoc291cmNlLCBKU09OLnN0cmluZ2lmeShyZWxhdGl2ZVBhdGgpKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7IGVzbW9kdWxlOiB0cnVlLCBjb21tb25qczogdHJ1ZSB9LCBjb250ZXh0Lm9wdGlvbnNbMF0pO1xyXG4gICAgcmV0dXJuIG1vZHVsZVZpc2l0b3IocmVwb3J0SWZBYnNvbHV0ZSwgb3B0aW9ucyk7XHJcbiAgfSxcclxufTtcclxuIl19