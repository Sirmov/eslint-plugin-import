'use strict';var _moduleVisitor = require('eslint-module-utils/moduleVisitor');var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

var DEFAULT_MAX = 10;
var DEFAULT_IGNORE_TYPE_IMPORTS = false;
var TYPE_IMPORT = 'type';

var countDependencies = function countDependencies(dependencies, lastNode, context) {var _ref =
  context.options[0] || { max: DEFAULT_MAX },max = _ref.max;

  if (dependencies.size > max) {
    context.report(lastNode, 'Maximum number of dependencies (' + String(max) + ') exceeded.');
  }
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Style guide',
      description: 'Enforce the maximum number of dependencies a module can have.',
      url: (0, _docsUrl2['default'])('max-dependencies') },


    schema: [
    {
      'type': 'object',
      'properties': {
        'max': { 'type': 'number' },
        'ignoreTypeImports': { 'type': 'boolean' } },

      'additionalProperties': false }] },




  create: function () {function create(context) {var _ref2 =


      context.options[0] || {},_ref2$ignoreTypeImpor = _ref2.ignoreTypeImports,ignoreTypeImports = _ref2$ignoreTypeImpor === undefined ? DEFAULT_IGNORE_TYPE_IMPORTS : _ref2$ignoreTypeImpor;

      var dependencies = new Set(); // keep track of dependencies
      var lastNode = void 0; // keep track of the last node to report on

      return Object.assign({
        'Program:exit': function () {function ProgramExit() {
            countDependencies(dependencies, lastNode, context);
          }return ProgramExit;}() },
      (0, _moduleVisitor2['default'])(function (source, _ref3) {var importKind = _ref3.importKind;
        if (importKind !== TYPE_IMPORT || !ignoreTypeImports) {
          dependencies.add(source.value);
        }
        lastNode = source;
      }, { commonjs: true }));
    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9tYXgtZGVwZW5kZW5jaWVzLmpzIl0sIm5hbWVzIjpbIkRFRkFVTFRfTUFYIiwiREVGQVVMVF9JR05PUkVfVFlQRV9JTVBPUlRTIiwiVFlQRV9JTVBPUlQiLCJjb3VudERlcGVuZGVuY2llcyIsImRlcGVuZGVuY2llcyIsImxhc3ROb2RlIiwiY29udGV4dCIsIm9wdGlvbnMiLCJtYXgiLCJzaXplIiwicmVwb3J0IiwibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJ1cmwiLCJzY2hlbWEiLCJjcmVhdGUiLCJpZ25vcmVUeXBlSW1wb3J0cyIsIlNldCIsIk9iamVjdCIsImFzc2lnbiIsInNvdXJjZSIsImltcG9ydEtpbmQiLCJhZGQiLCJ2YWx1ZSIsImNvbW1vbmpzIl0sIm1hcHBpbmdzIjoiYUFBQSxrRTtBQUNBLHFDOztBQUVBLElBQU1BLGNBQWMsRUFBcEI7QUFDQSxJQUFNQyw4QkFBOEIsS0FBcEM7QUFDQSxJQUFNQyxjQUFjLE1BQXBCOztBQUVBLElBQU1DLG9CQUFvQixTQUFwQkEsaUJBQW9CLENBQUNDLFlBQUQsRUFBZUMsUUFBZixFQUF5QkMsT0FBekIsRUFBcUM7QUFDN0NBLFVBQVFDLE9BQVIsQ0FBZ0IsQ0FBaEIsS0FBc0IsRUFBRUMsS0FBS1IsV0FBUCxFQUR1QixDQUNyRFEsR0FEcUQsUUFDckRBLEdBRHFEOztBQUc3RCxNQUFJSixhQUFhSyxJQUFiLEdBQW9CRCxHQUF4QixFQUE2QjtBQUMzQkYsWUFBUUksTUFBUixDQUFlTCxRQUFmLDhDQUE0REcsR0FBNUQ7QUFDRDtBQUNGLENBTkQ7O0FBUUFHLE9BQU9DLE9BQVAsR0FBaUI7QUFDZkMsUUFBTTtBQUNKQyxVQUFNLFlBREY7QUFFSkMsVUFBTTtBQUNKQyxnQkFBVSxhQUROO0FBRUpDLG1CQUFhLCtEQUZUO0FBR0pDLFdBQUssMEJBQVEsa0JBQVIsQ0FIRCxFQUZGOzs7QUFRSkMsWUFBUTtBQUNOO0FBQ0UsY0FBUSxRQURWO0FBRUUsb0JBQWM7QUFDWixlQUFPLEVBQUUsUUFBUSxRQUFWLEVBREs7QUFFWiw2QkFBcUIsRUFBRSxRQUFRLFNBQVYsRUFGVCxFQUZoQjs7QUFNRSw4QkFBd0IsS0FOMUIsRUFETSxDQVJKLEVBRFM7Ozs7O0FBcUJmQyx1QkFBUSx5QkFBVzs7O0FBR2JkLGNBQVFDLE9BQVIsQ0FBZ0IsQ0FBaEIsS0FBc0IsRUFIVCwrQkFFZmMsaUJBRmUsQ0FFZkEsaUJBRmUseUNBRUtwQiwyQkFGTDs7QUFLakIsVUFBTUcsZUFBZSxJQUFJa0IsR0FBSixFQUFyQixDQUxpQixDQUtlO0FBQ2hDLFVBQUlqQixpQkFBSixDQU5pQixDQU1IOztBQUVkLGFBQU9rQixPQUFPQyxNQUFQLENBQWM7QUFDbkIscUNBQWdCLHVCQUFZO0FBQzFCckIsOEJBQWtCQyxZQUFsQixFQUFnQ0MsUUFBaEMsRUFBMENDLE9BQTFDO0FBQ0QsV0FGRCxzQkFEbUIsRUFBZDtBQUlKLHNDQUFjLFVBQUNtQixNQUFELFNBQTRCLEtBQWpCQyxVQUFpQixTQUFqQkEsVUFBaUI7QUFDM0MsWUFBSUEsZUFBZXhCLFdBQWYsSUFBOEIsQ0FBQ21CLGlCQUFuQyxFQUFzRDtBQUNwRGpCLHVCQUFhdUIsR0FBYixDQUFpQkYsT0FBT0csS0FBeEI7QUFDRDtBQUNEdkIsbUJBQVdvQixNQUFYO0FBQ0QsT0FMRSxFQUtBLEVBQUVJLFVBQVUsSUFBWixFQUxBLENBSkksQ0FBUDtBQVVELEtBbEJELGlCQXJCZSxFQUFqQiIsImZpbGUiOiJtYXgtZGVwZW5kZW5jaWVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1vZHVsZVZpc2l0b3IgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9tb2R1bGVWaXNpdG9yJztcclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XHJcblxyXG5jb25zdCBERUZBVUxUX01BWCA9IDEwO1xyXG5jb25zdCBERUZBVUxUX0lHTk9SRV9UWVBFX0lNUE9SVFMgPSBmYWxzZTtcclxuY29uc3QgVFlQRV9JTVBPUlQgPSAndHlwZSc7XHJcblxyXG5jb25zdCBjb3VudERlcGVuZGVuY2llcyA9IChkZXBlbmRlbmNpZXMsIGxhc3ROb2RlLCBjb250ZXh0KSA9PiB7XHJcbiAgY29uc3QgeyBtYXggfSA9IGNvbnRleHQub3B0aW9uc1swXSB8fCB7IG1heDogREVGQVVMVF9NQVggfTtcclxuXHJcbiAgaWYgKGRlcGVuZGVuY2llcy5zaXplID4gbWF4KSB7XHJcbiAgICBjb250ZXh0LnJlcG9ydChsYXN0Tm9kZSwgYE1heGltdW0gbnVtYmVyIG9mIGRlcGVuZGVuY2llcyAoJHttYXh9KSBleGNlZWRlZC5gKTtcclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnU3R5bGUgZ3VpZGUnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0VuZm9yY2UgdGhlIG1heGltdW0gbnVtYmVyIG9mIGRlcGVuZGVuY2llcyBhIG1vZHVsZSBjYW4gaGF2ZS4nLFxyXG4gICAgICB1cmw6IGRvY3NVcmwoJ21heC1kZXBlbmRlbmNpZXMnKSxcclxuICAgIH0sXHJcblxyXG4gICAgc2NoZW1hOiBbXHJcbiAgICAgIHtcclxuICAgICAgICAndHlwZSc6ICdvYmplY3QnLFxyXG4gICAgICAgICdwcm9wZXJ0aWVzJzoge1xyXG4gICAgICAgICAgJ21heCc6IHsgJ3R5cGUnOiAnbnVtYmVyJyB9LFxyXG4gICAgICAgICAgJ2lnbm9yZVR5cGVJbXBvcnRzJzogeyAndHlwZSc6ICdib29sZWFuJyB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJzogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZTogY29udGV4dCA9PiB7XHJcbiAgICBjb25zdCB7XHJcbiAgICAgIGlnbm9yZVR5cGVJbXBvcnRzID0gREVGQVVMVF9JR05PUkVfVFlQRV9JTVBPUlRTLFxyXG4gICAgfSA9IGNvbnRleHQub3B0aW9uc1swXSB8fCB7fTtcclxuXHJcbiAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBuZXcgU2V0KCk7IC8vIGtlZXAgdHJhY2sgb2YgZGVwZW5kZW5jaWVzXHJcbiAgICBsZXQgbGFzdE5vZGU7IC8vIGtlZXAgdHJhY2sgb2YgdGhlIGxhc3Qgbm9kZSB0byByZXBvcnQgb25cclxuXHJcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XHJcbiAgICAgICdQcm9ncmFtOmV4aXQnOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY291bnREZXBlbmRlbmNpZXMoZGVwZW5kZW5jaWVzLCBsYXN0Tm9kZSwgY29udGV4dCk7XHJcbiAgICAgIH0sXHJcbiAgICB9LCBtb2R1bGVWaXNpdG9yKChzb3VyY2UsIHsgaW1wb3J0S2luZCB9KSA9PiB7XHJcbiAgICAgIGlmIChpbXBvcnRLaW5kICE9PSBUWVBFX0lNUE9SVCB8fCAhaWdub3JlVHlwZUltcG9ydHMpIHtcclxuICAgICAgICBkZXBlbmRlbmNpZXMuYWRkKHNvdXJjZS52YWx1ZSk7XHJcbiAgICAgIH1cclxuICAgICAgbGFzdE5vZGUgPSBzb3VyY2U7XHJcbiAgICB9LCB7IGNvbW1vbmpzOiB0cnVlIH0pKTtcclxuICB9LFxyXG59O1xyXG4iXX0=