'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();exports.













































































































































































































































































































































































































































































































































































































































































































































































recursivePatternCapture = recursivePatternCapture;var _fs = require('fs');var _fs2 = _interopRequireDefault(_fs);var _path = require('path');var _doctrine = require('doctrine');var _doctrine2 = _interopRequireDefault(_doctrine);var _debug = require('debug');var _debug2 = _interopRequireDefault(_debug);var _eslint = require('eslint');var _parse = require('eslint-module-utils/parse');var _parse2 = _interopRequireDefault(_parse);var _visit = require('eslint-module-utils/visit');var _visit2 = _interopRequireDefault(_visit);var _resolve = require('eslint-module-utils/resolve');var _resolve2 = _interopRequireDefault(_resolve);var _ignore = require('eslint-module-utils/ignore');var _ignore2 = _interopRequireDefault(_ignore);var _hash = require('eslint-module-utils/hash');var _unambiguous = require('eslint-module-utils/unambiguous');var unambiguous = _interopRequireWildcard(_unambiguous);var _tsconfigLoader = require('tsconfig-paths/lib/tsconfig-loader');var _arrayIncludes = require('array-includes');var _arrayIncludes2 = _interopRequireDefault(_arrayIncludes);function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj['default'] = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var ts = void 0;var log = (0, _debug2['default'])('eslint-plugin-import:ExportMap');var exportCache = new Map();var tsConfigCache = new Map();var ExportMap = function () {function ExportMap(path) {_classCallCheck(this, ExportMap);this.path = path;this.namespace = new Map(); // todo: restructure to key on path, value is resolver + map of names
    this.reexports = new Map(); /**
                                 * star-exports
                                 * @type {Set} of () => ExportMap
                                 */this.dependencies = new Set(); /**
                                                                   * dependencies of this module that are not explicitly re-exported
                                                                   * @type {Map} from path = () => ExportMap
                                                                   */this.imports = new Map();this.errors = []; /**
                                                                                                                 * type {'ambiguous' | 'Module' | 'Script'}
                                                                                                                 */this.parseGoal = 'ambiguous';}_createClass(ExportMap, [{ key: 'has', /**
                                                                                                                                                                                         * Note that this does not check explicitly re-exported names for existence
                                                                                                                                                                                         * in the base namespace, but it will expand all `export * from '...'` exports
                                                                                                                                                                                         * if not found in the explicit namespace.
                                                                                                                                                                                         * @param  {string}  name
                                                                                                                                                                                         * @return {Boolean} true if `name` is exported by this module.
                                                                                                                                                                                         */value: function () {function has(name) {if (this.namespace.has(name)) return true;if (this.reexports.has(name)) return true; // default exports must be explicitly re-exported (#328)
        if (name !== 'default') {var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {for (var _iterator = this.dependencies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var dep = _step.value;var innerMap = dep(); // todo: report as unresolved?
              if (!innerMap) continue;if (innerMap.has(name)) return true;}} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}}return false;}return has;}() /**
                                                                                                                                                                                                                                                                                                                                 * ensure that imported name fully resolves.
                                                                                                                                                                                                                                                                                                                                 * @param  {string} name
                                                                                                                                                                                                                                                                                                                                 * @return {{ found: boolean, path: ExportMap[] }}
                                                                                                                                                                                                                                                                                                                                 */ }, { key: 'hasDeep', value: function () {function hasDeep(name) {if (this.namespace.has(name)) return { found: true, path: [this] };if (this.reexports.has(name)) {var reexports = this.reexports.get(name);var imported = reexports.getImport(); // if import is ignored, return explicit 'null'
          if (imported == null) return { found: true, path: [this] }; // safeguard against cycles, only if name matches
          if (imported.path === this.path && reexports.local === name) {return { found: false, path: [this] };}var deep = imported.hasDeep(reexports.local);deep.path.unshift(this);return deep;} // default exports must be explicitly re-exported (#328)
        if (name !== 'default') {var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {for (var _iterator2 = this.dependencies[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var dep = _step2.value;var innerMap = dep();if (innerMap == null) return { found: true, path: [this] }; // todo: report as unresolved?
              if (!innerMap) continue; // safeguard against cycles
              if (innerMap.path === this.path) continue;var innerValue = innerMap.hasDeep(name);if (innerValue.found) {innerValue.path.unshift(this);return innerValue;}}} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2['return']) {_iterator2['return']();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}}return { found: false, path: [this] };}return hasDeep;}() }, { key: 'get', value: function () {function get(name) {if (this.namespace.has(name)) return this.namespace.get(name);if (this.reexports.has(name)) {var reexports = this.reexports.get(name);var imported = reexports.getImport(); // if import is ignored, return explicit 'null'
          if (imported == null) return null; // safeguard against cycles, only if name matches
          if (imported.path === this.path && reexports.local === name) return undefined;return imported.get(reexports.local);} // default exports must be explicitly re-exported (#328)
        if (name !== 'default') {var _iteratorNormalCompletion3 = true;var _didIteratorError3 = false;var _iteratorError3 = undefined;try {for (var _iterator3 = this.dependencies[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {var dep = _step3.value;var innerMap = dep(); // todo: report as unresolved?
              if (!innerMap) continue; // safeguard against cycles
              if (innerMap.path === this.path) continue;var innerValue = innerMap.get(name);if (innerValue !== undefined) return innerValue;}} catch (err) {_didIteratorError3 = true;_iteratorError3 = err;} finally {try {if (!_iteratorNormalCompletion3 && _iterator3['return']) {_iterator3['return']();}} finally {if (_didIteratorError3) {throw _iteratorError3;}}}}return undefined;}return get;}() }, { key: 'forEach', value: function () {function forEach(callback, thisArg) {var _this = this;this.namespace.forEach(function (v, n) {return callback.call(thisArg, v, n, _this);});this.reexports.forEach(function (reexports, name) {var reexported = reexports.getImport(); // can't look up meta for ignored re-exports (#348)
          callback.call(thisArg, reexported && reexported.get(reexports.local), name, _this);});this.dependencies.forEach(function (dep) {var d = dep(); // CJS / ignored dependencies won't exist (#717)
          if (d == null) return;d.forEach(function (v, n) {return n !== 'default' && callback.call(thisArg, v, n, _this);});});}return forEach;}() // todo: keys, values, entries?
  }, { key: 'reportErrors', value: function () {function reportErrors(context, declaration) {context.report({ node: declaration.source, message: 'Parse errors in imported module \'' + String(declaration.source.value) + '\': ' + ('' + String(this.errors.map(function (e) {return String(e.message) + ' (' + String(e.lineNumber) + ':' + String(e.column) + ')';}).join(', '))) });}return reportErrors;}() }, { key: 'hasDefault', get: function () {function get() {return this.get('default') != null;}return get;}() // stronger than this.has
  }, { key: 'size', get: function () {function get() {var size = this.namespace.size + this.reexports.size;this.dependencies.forEach(function (dep) {var d = dep(); // CJS / ignored dependencies won't exist (#717)
          if (d == null) return;size += d.size;});return size;}return get;}() }]);return ExportMap;}(); /**
                                                                                                         * parse docs from the first node that has leading comments
                                                                                                         */exports['default'] = ExportMap;function captureDoc(source, docStyleParsers) {var metadata = {}; // 'some' short-circuits on first 'true'
  for (var _len = arguments.length, nodes = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {nodes[_key - 2] = arguments[_key];}nodes.some(function (n) {try {var leadingComments = void 0; // n.leadingComments is legacy `attachComments` behavior
      if ('leadingComments' in n) {leadingComments = n.leadingComments;} else if (n.range) {leadingComments = source.getCommentsBefore(n);}if (!leadingComments || leadingComments.length === 0) return false;for (var name in docStyleParsers) {var doc = docStyleParsers[name](leadingComments);if (doc) {metadata.doc = doc;}}return true;} catch (err) {return false;}});return metadata;}var availableDocStyleParsers = { jsdoc: captureJsDoc, tomdoc: captureTomDoc }; /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * parse JSDoc from leading comments
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @param {object[]} comments
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @return {{ doc: object }}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */function captureJsDoc(comments) {var doc = void 0; // capture XSDoc
  comments.forEach(function (comment) {// skip non-block comments
    if (comment.type !== 'Block') return;try {doc = _doctrine2['default'].parse(comment.value, { unwrap: true });} catch (err) {/* don't care, for now? maybe add to `errors?` */}});return doc;} /**
                                                                                                                                                                                                    * parse TomDoc section from comments
                                                                                                                                                                                                    */function captureTomDoc(comments) {// collect lines up to first paragraph break
  var lines = [];for (var i = 0; i < comments.length; i++) {var comment = comments[i];if (comment.value.match(/^\s*$/)) break;lines.push(comment.value.trim());} // return doctrine-like object
  var statusMatch = lines.join(' ').match(/^(Public|Internal|Deprecated):\s*(.+)/);if (statusMatch) {return { description: statusMatch[2], tags: [{ title: statusMatch[1].toLowerCase(), description: statusMatch[2] }] };}}var supportedImportTypes = new Set(['ImportDefaultSpecifier', 'ImportNamespaceSpecifier']);ExportMap.get = function (source, context) {var path = (0, _resolve2['default'])(source, context);if (path == null) return null;return ExportMap['for'](childContext(path, context));};ExportMap['for'] = function (context) {var path = context.path;var cacheKey = (0, _hash.hashObject)(context).digest('hex');var exportMap = exportCache.get(cacheKey); // return cached ignore
  if (exportMap === null) return null;var stats = _fs2['default'].statSync(path);if (exportMap != null) {// date equality check
    if (exportMap.mtime - stats.mtime === 0) {return exportMap;} // future: check content equality?
  } // check valid extensions first
  if (!(0, _ignore.hasValidExtension)(path, context)) {exportCache.set(cacheKey, null);return null;} // check for and cache ignore
  if ((0, _ignore2['default'])(path, context)) {log('ignored path due to ignore settings:', path);exportCache.set(cacheKey, null);return null;}var content = _fs2['default'].readFileSync(path, { encoding: 'utf8' }); // check for and cache unambiguous modules
  if (!unambiguous.test(content)) {log('ignored path due to unambiguous regex:', path);exportCache.set(cacheKey, null);return null;}log('cache miss', cacheKey, 'for path', path);exportMap = ExportMap.parse(path, content, context); // ambiguous modules return null
  if (exportMap == null) {log('ignored path due to ambiguous parse:', path);exportCache.set(cacheKey, null);return null;}exportMap.mtime = stats.mtime;exportCache.set(cacheKey, exportMap);return exportMap;};ExportMap.parse = function (path, content, context) {var m = new ExportMap(path);var isEsModuleInteropTrue = isEsModuleInterop();var ast = void 0;var visitorKeys = void 0;try {var result = (0, _parse2['default'])(path, content, context);ast = result.ast;visitorKeys = result.visitorKeys;} catch (err) {m.errors.push(err);return m; // can't continue
  }m.visitorKeys = visitorKeys;var hasDynamicImports = false;function processDynamicImport(source) {hasDynamicImports = true;if (source.type !== 'Literal') {return null;}var p = remotePath(source.value);if (p == null) {return null;}var importedSpecifiers = new Set();importedSpecifiers.add('ImportNamespaceSpecifier');var getter = thunkFor(p, context);m.imports.set(p, { getter: getter, declarations: new Set([{ source: { // capturing actual node reference holds full AST in memory!
          value: source.value, loc: source.loc }, importedSpecifiers: importedSpecifiers, dynamic: true }]) });}(0, _visit2['default'])(ast, visitorKeys, { ImportExpression: function () {function ImportExpression(node) {processDynamicImport(node.source);}return ImportExpression;}(), CallExpression: function () {function CallExpression(node) {if (node.callee.type === 'Import') {processDynamicImport(node.arguments[0]);}}return CallExpression;}() });var unambiguouslyESM = unambiguous.isModule(ast);if (!unambiguouslyESM && !hasDynamicImports) return null;var docstyle = context.settings && context.settings['import/docstyle'] || ['jsdoc'];var docStyleParsers = {};docstyle.forEach(function (style) {docStyleParsers[style] = availableDocStyleParsers[style];}); // attempt to collect module doc
  if (ast.comments) {ast.comments.some(function (c) {if (c.type !== 'Block') return false;try {var doc = _doctrine2['default'].parse(c.value, { unwrap: true });if (doc.tags.some(function (t) {return t.title === 'module';})) {m.doc = doc;return true;}} catch (err) {/* ignore */}return false;});}var namespaces = new Map();function remotePath(value) {return _resolve2['default'].relative(value, path, context.settings);}function resolveImport(value) {var rp = remotePath(value);if (rp == null) return null;return ExportMap['for'](childContext(rp, context));}function getNamespace(identifier) {if (!namespaces.has(identifier.name)) return;return function () {return resolveImport(namespaces.get(identifier.name));};}function addNamespace(object, identifier) {var nsfn = getNamespace(identifier);if (nsfn) {Object.defineProperty(object, 'namespace', { get: nsfn });}return object;}function processSpecifier(s, n, m) {var nsource = n.source && n.source.value;var exportMeta = {};var local = void 0;switch (s.type) {case 'ExportDefaultSpecifier':if (!nsource) return;local = 'default';break;case 'ExportNamespaceSpecifier':m.namespace.set(s.exported.name, Object.defineProperty(exportMeta, 'namespace', { get: function () {function get() {return resolveImport(nsource);}return get;}() }));return;case 'ExportAllDeclaration':m.namespace.set(s.exported.name || s.exported.value, addNamespace(exportMeta, s.source.value));return;case 'ExportSpecifier':if (!n.source) {m.namespace.set(s.exported.name || s.exported.value, addNamespace(exportMeta, s.local));return;} // else falls through
      default:local = s.local.name;break;} // todo: JSDoc
    m.reexports.set(s.exported.name, { local: local, getImport: function () {function getImport() {return resolveImport(nsource);}return getImport;}() });}function captureDependencyWithSpecifiers(n) {// import type { Foo } (TS and Flow); import typeof { Foo } (Flow)
    var declarationIsType = n.importKind === 'type' || n.importKind === 'typeof'; // import './foo' or import {} from './foo' (both 0 specifiers) is a side effect and
    // shouldn't be considered to be just importing types
    var specifiersOnlyImportingTypes = n.specifiers.length > 0;var importedSpecifiers = new Set();n.specifiers.forEach(function (specifier) {if (specifier.type === 'ImportSpecifier') {importedSpecifiers.add(specifier.imported.name || specifier.imported.value);} else if (supportedImportTypes.has(specifier.type)) {importedSpecifiers.add(specifier.type);} // import { type Foo } (Flow); import { typeof Foo } (Flow)
      specifiersOnlyImportingTypes = specifiersOnlyImportingTypes && (specifier.importKind === 'type' || specifier.importKind === 'typeof');});captureDependency(n, declarationIsType || specifiersOnlyImportingTypes, importedSpecifiers);}function captureDependency(_ref, isOnlyImportingTypes) {var source = _ref.source;var importedSpecifiers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Set();if (source == null) return null;var p = remotePath(source.value);if (p == null) return null;var declarationMetadata = { // capturing actual node reference holds full AST in memory!
      source: { value: source.value, loc: source.loc }, isOnlyImportingTypes: isOnlyImportingTypes, importedSpecifiers: importedSpecifiers };var existing = m.imports.get(p);if (existing != null) {existing.declarations.add(declarationMetadata);return existing.getter;}var getter = thunkFor(p, context);m.imports.set(p, { getter: getter, declarations: new Set([declarationMetadata]) });return getter;}var source = makeSourceCode(content, ast);function readTsConfig(context) {var tsConfigInfo = (0, _tsconfigLoader.tsConfigLoader)({ cwd: context.parserOptions && context.parserOptions.tsconfigRootDir || process.cwd(), getEnv: function () {function getEnv(key) {return process.env[key];}return getEnv;}() });try {if (tsConfigInfo.tsConfigPath !== undefined) {// Projects not using TypeScript won't have `typescript` installed.
        if (!ts) {ts = require('typescript');} // eslint-disable-line import/no-extraneous-dependencies
        var configFile = ts.readConfigFile(tsConfigInfo.tsConfigPath, ts.sys.readFile);return ts.parseJsonConfigFileContent(configFile.config, ts.sys, (0, _path.dirname)(tsConfigInfo.tsConfigPath));}} catch (e) {// Catch any errors
    }return null;}function isEsModuleInterop() {var cacheKey = (0, _hash.hashObject)({ tsconfigRootDir: context.parserOptions && context.parserOptions.tsconfigRootDir }).digest('hex');var tsConfig = tsConfigCache.get(cacheKey);if (typeof tsConfig === 'undefined') {tsConfig = readTsConfig(context);tsConfigCache.set(cacheKey, tsConfig);}return tsConfig && tsConfig.options ? tsConfig.options.esModuleInterop : false;}ast.body.forEach(function (n) {if (n.type === 'ExportDefaultDeclaration') {var exportMeta = captureDoc(source, docStyleParsers, n);if (n.declaration.type === 'Identifier') {addNamespace(exportMeta, n.declaration);}m.namespace.set('default', exportMeta);return;}if (n.type === 'ExportAllDeclaration') {var getter = captureDependency(n, n.exportKind === 'type');if (getter) m.dependencies.add(getter);if (n.exported) {processSpecifier(n, n.exported, m);}return;} // capture namespaces in case of later export
    if (n.type === 'ImportDeclaration') {captureDependencyWithSpecifiers(n);var ns = n.specifiers.find(function (s) {return s.type === 'ImportNamespaceSpecifier';});if (ns) {namespaces.set(ns.local.name, n.source.value);}return;}if (n.type === 'ExportNamedDeclaration') {captureDependencyWithSpecifiers(n); // capture declaration
      if (n.declaration != null) {switch (n.declaration.type) {case 'FunctionDeclaration':case 'ClassDeclaration':case 'TypeAlias': // flowtype with babel-eslint parser
          case 'InterfaceDeclaration':case 'DeclareFunction':case 'TSDeclareFunction':case 'TSEnumDeclaration':case 'TSTypeAliasDeclaration':case 'TSInterfaceDeclaration':case 'TSAbstractClassDeclaration':case 'TSModuleDeclaration':m.namespace.set(n.declaration.id.name, captureDoc(source, docStyleParsers, n));break;case 'VariableDeclaration':n.declaration.declarations.forEach(function (d) {return recursivePatternCapture(d.id, function (id) {return m.namespace.set(id.name, captureDoc(source, docStyleParsers, d, n));});});break;}}n.specifiers.forEach(function (s) {return processSpecifier(s, n, m);});}var exports = ['TSExportAssignment'];if (isEsModuleInteropTrue) {exports.push('TSNamespaceExportDeclaration');} // This doesn't declare anything, but changes what's being exported.
    if ((0, _arrayIncludes2['default'])(exports, n.type)) {var exportedName = n.type === 'TSNamespaceExportDeclaration' ? (n.id || n.name).name : n.expression && n.expression.name || n.expression.id && n.expression.id.name || null;var declTypes = ['VariableDeclaration', 'ClassDeclaration', 'TSDeclareFunction', 'TSEnumDeclaration', 'TSTypeAliasDeclaration', 'TSInterfaceDeclaration', 'TSAbstractClassDeclaration', 'TSModuleDeclaration'];var exportedDecls = ast.body.filter(function (_ref2) {var type = _ref2.type,id = _ref2.id,declarations = _ref2.declarations;return (0, _arrayIncludes2['default'])(declTypes, type) && (id && id.name === exportedName || declarations && declarations.find(function (d) {return d.id.name === exportedName;}));});if (exportedDecls.length === 0) {// Export is not referencing any local declaration, must be re-exporting
        m.namespace.set('default', captureDoc(source, docStyleParsers, n));return;}if (isEsModuleInteropTrue // esModuleInterop is on in tsconfig
      && !m.namespace.has('default') // and default isn't added already
      ) {m.namespace.set('default', {}); // add default export
        }exportedDecls.forEach(function (decl) {if (decl.type === 'TSModuleDeclaration') {if (decl.body && decl.body.type === 'TSModuleDeclaration') {m.namespace.set(decl.body.id.name, captureDoc(source, docStyleParsers, decl.body));} else if (decl.body && decl.body.body) {decl.body.body.forEach(function (moduleBlockNode) {// Export-assignment exports all members in the namespace,
              // explicitly exported or not.
              var namespaceDecl = moduleBlockNode.type === 'ExportNamedDeclaration' ? moduleBlockNode.declaration : moduleBlockNode;if (!namespaceDecl) {// TypeScript can check this for us; we needn't
              } else if (namespaceDecl.type === 'VariableDeclaration') {namespaceDecl.declarations.forEach(function (d) {return recursivePatternCapture(d.id, function (id) {return m.namespace.set(id.name, captureDoc(source, docStyleParsers, decl, namespaceDecl, moduleBlockNode));});});} else {m.namespace.set(namespaceDecl.id.name, captureDoc(source, docStyleParsers, moduleBlockNode));}});}} else {// Export as default
          m.namespace.set('default', captureDoc(source, docStyleParsers, decl));}});}});if (isEsModuleInteropTrue // esModuleInterop is on in tsconfig
  && m.namespace.size > 0 // anything is exported
  && !m.namespace.has('default') // and default isn't added already
  ) {m.namespace.set('default', {}); // add default export
    }if (unambiguouslyESM) {m.parseGoal = 'Module';}return m;}; /**
                                                                 * The creation of this closure is isolated from other scopes
                                                                 * to avoid over-retention of unrelated variables, which has
                                                                 * caused memory leaks. See #1266.
                                                                 */function thunkFor(p, context) {return function () {return ExportMap['for'](childContext(p, context));};} /**
                                                                                                                                                                             * Traverse a pattern/identifier node, calling 'callback'
                                                                                                                                                                             * for each leaf identifier.
                                                                                                                                                                             * @param  {node}   pattern
                                                                                                                                                                             * @param  {Function} callback
                                                                                                                                                                             * @return {void}
                                                                                                                                                                             */function recursivePatternCapture(pattern, callback) {switch (pattern.type) {case 'Identifier': // base case
      callback(pattern);break;case 'ObjectPattern':pattern.properties.forEach(function (p) {if (p.type === 'ExperimentalRestProperty' || p.type === 'RestElement') {callback(p.argument);return;}recursivePatternCapture(p.value, callback);});break;case 'ArrayPattern':pattern.elements.forEach(function (element) {if (element == null) return;if (element.type === 'ExperimentalRestProperty' || element.type === 'RestElement') {callback(element.argument);return;}recursivePatternCapture(element, callback);});break;case 'AssignmentPattern':callback(pattern.left);break;}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * don't hold full context object in memory, just grab what we need.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       */function childContext(path, context) {var settings = context.settings,parserOptions = context.parserOptions,parserPath = context.parserPath;return { settings: settings, parserOptions: parserOptions, parserPath: parserPath, path: path };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * sometimes legacy support isn't _that_ hard... right?
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        */function makeSourceCode(text, ast) {if (_eslint.SourceCode.length > 1) {// ESLint 3
    return new _eslint.SourceCode(text, ast);} else {// ESLint 4, 5
    return new _eslint.SourceCode({ text: text, ast: ast });}}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9FeHBvcnRNYXAuanMiXSwibmFtZXMiOlsicmVjdXJzaXZlUGF0dGVybkNhcHR1cmUiLCJ1bmFtYmlndW91cyIsInRzIiwibG9nIiwiZXhwb3J0Q2FjaGUiLCJNYXAiLCJ0c0NvbmZpZ0NhY2hlIiwiRXhwb3J0TWFwIiwicGF0aCIsIm5hbWVzcGFjZSIsInJlZXhwb3J0cyIsImRlcGVuZGVuY2llcyIsIlNldCIsImltcG9ydHMiLCJlcnJvcnMiLCJwYXJzZUdvYWwiLCJuYW1lIiwiaGFzIiwiZGVwIiwiaW5uZXJNYXAiLCJmb3VuZCIsImdldCIsImltcG9ydGVkIiwiZ2V0SW1wb3J0IiwibG9jYWwiLCJkZWVwIiwiaGFzRGVlcCIsInVuc2hpZnQiLCJpbm5lclZhbHVlIiwidW5kZWZpbmVkIiwiY2FsbGJhY2siLCJ0aGlzQXJnIiwiZm9yRWFjaCIsInYiLCJuIiwiY2FsbCIsInJlZXhwb3J0ZWQiLCJkIiwiY29udGV4dCIsImRlY2xhcmF0aW9uIiwicmVwb3J0Iiwibm9kZSIsInNvdXJjZSIsIm1lc3NhZ2UiLCJ2YWx1ZSIsIm1hcCIsImUiLCJsaW5lTnVtYmVyIiwiY29sdW1uIiwiam9pbiIsInNpemUiLCJjYXB0dXJlRG9jIiwiZG9jU3R5bGVQYXJzZXJzIiwibWV0YWRhdGEiLCJub2RlcyIsInNvbWUiLCJsZWFkaW5nQ29tbWVudHMiLCJyYW5nZSIsImdldENvbW1lbnRzQmVmb3JlIiwibGVuZ3RoIiwiZG9jIiwiZXJyIiwiYXZhaWxhYmxlRG9jU3R5bGVQYXJzZXJzIiwianNkb2MiLCJjYXB0dXJlSnNEb2MiLCJ0b21kb2MiLCJjYXB0dXJlVG9tRG9jIiwiY29tbWVudHMiLCJjb21tZW50IiwidHlwZSIsImRvY3RyaW5lIiwicGFyc2UiLCJ1bndyYXAiLCJsaW5lcyIsImkiLCJtYXRjaCIsInB1c2giLCJ0cmltIiwic3RhdHVzTWF0Y2giLCJkZXNjcmlwdGlvbiIsInRhZ3MiLCJ0aXRsZSIsInRvTG93ZXJDYXNlIiwic3VwcG9ydGVkSW1wb3J0VHlwZXMiLCJjaGlsZENvbnRleHQiLCJjYWNoZUtleSIsImRpZ2VzdCIsImV4cG9ydE1hcCIsInN0YXRzIiwiZnMiLCJzdGF0U3luYyIsIm10aW1lIiwic2V0IiwiY29udGVudCIsInJlYWRGaWxlU3luYyIsImVuY29kaW5nIiwidGVzdCIsIm0iLCJpc0VzTW9kdWxlSW50ZXJvcFRydWUiLCJpc0VzTW9kdWxlSW50ZXJvcCIsImFzdCIsInZpc2l0b3JLZXlzIiwicmVzdWx0IiwiaGFzRHluYW1pY0ltcG9ydHMiLCJwcm9jZXNzRHluYW1pY0ltcG9ydCIsInAiLCJyZW1vdGVQYXRoIiwiaW1wb3J0ZWRTcGVjaWZpZXJzIiwiYWRkIiwiZ2V0dGVyIiwidGh1bmtGb3IiLCJkZWNsYXJhdGlvbnMiLCJsb2MiLCJkeW5hbWljIiwiSW1wb3J0RXhwcmVzc2lvbiIsIkNhbGxFeHByZXNzaW9uIiwiY2FsbGVlIiwiYXJndW1lbnRzIiwidW5hbWJpZ3VvdXNseUVTTSIsImlzTW9kdWxlIiwiZG9jc3R5bGUiLCJzZXR0aW5ncyIsInN0eWxlIiwiYyIsInQiLCJuYW1lc3BhY2VzIiwicmVzb2x2ZSIsInJlbGF0aXZlIiwicmVzb2x2ZUltcG9ydCIsInJwIiwiZ2V0TmFtZXNwYWNlIiwiaWRlbnRpZmllciIsImFkZE5hbWVzcGFjZSIsIm9iamVjdCIsIm5zZm4iLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsInByb2Nlc3NTcGVjaWZpZXIiLCJzIiwibnNvdXJjZSIsImV4cG9ydE1ldGEiLCJleHBvcnRlZCIsImNhcHR1cmVEZXBlbmRlbmN5V2l0aFNwZWNpZmllcnMiLCJkZWNsYXJhdGlvbklzVHlwZSIsImltcG9ydEtpbmQiLCJzcGVjaWZpZXJzT25seUltcG9ydGluZ1R5cGVzIiwic3BlY2lmaWVycyIsInNwZWNpZmllciIsImNhcHR1cmVEZXBlbmRlbmN5IiwiaXNPbmx5SW1wb3J0aW5nVHlwZXMiLCJkZWNsYXJhdGlvbk1ldGFkYXRhIiwiZXhpc3RpbmciLCJtYWtlU291cmNlQ29kZSIsInJlYWRUc0NvbmZpZyIsInRzQ29uZmlnSW5mbyIsImN3ZCIsInBhcnNlck9wdGlvbnMiLCJ0c2NvbmZpZ1Jvb3REaXIiLCJwcm9jZXNzIiwiZ2V0RW52Iiwia2V5IiwiZW52IiwidHNDb25maWdQYXRoIiwicmVxdWlyZSIsImNvbmZpZ0ZpbGUiLCJyZWFkQ29uZmlnRmlsZSIsInN5cyIsInJlYWRGaWxlIiwicGFyc2VKc29uQ29uZmlnRmlsZUNvbnRlbnQiLCJjb25maWciLCJ0c0NvbmZpZyIsIm9wdGlvbnMiLCJlc01vZHVsZUludGVyb3AiLCJib2R5IiwiZXhwb3J0S2luZCIsIm5zIiwiZmluZCIsImlkIiwiZXhwb3J0cyIsImV4cG9ydGVkTmFtZSIsImV4cHJlc3Npb24iLCJkZWNsVHlwZXMiLCJleHBvcnRlZERlY2xzIiwiZmlsdGVyIiwiZGVjbCIsIm1vZHVsZUJsb2NrTm9kZSIsIm5hbWVzcGFjZURlY2wiLCJwYXR0ZXJuIiwicHJvcGVydGllcyIsImFyZ3VtZW50IiwiZWxlbWVudHMiLCJlbGVtZW50IiwibGVmdCIsInBhcnNlclBhdGgiLCJ0ZXh0IiwiU291cmNlQ29kZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBOHVCZ0JBLHVCLEdBQUFBLHVCLENBOXVCaEIsd0IsdUNBQ0EsNEJBRUEsb0MsbURBRUEsOEIsNkNBRUEsZ0NBRUEsa0QsNkNBQ0Esa0QsNkNBQ0Esc0QsaURBQ0Esb0QsK0NBRUEsZ0RBQ0EsOEQsSUFBWUMsVyx5Q0FFWixvRUFFQSwrQyxvakJBRUEsSUFBSUMsV0FBSixDQUVBLElBQU1DLE1BQU0sd0JBQU0sZ0NBQU4sQ0FBWixDQUVBLElBQU1DLGNBQWMsSUFBSUMsR0FBSixFQUFwQixDQUNBLElBQU1DLGdCQUFnQixJQUFJRCxHQUFKLEVBQXRCLEMsSUFFcUJFLFMsZ0JBQ25CLG1CQUFZQyxJQUFaLEVBQWtCLGtDQUNoQixLQUFLQSxJQUFMLEdBQVlBLElBQVosQ0FDQSxLQUFLQyxTQUFMLEdBQWlCLElBQUlKLEdBQUosRUFBakIsQ0FGZ0IsQ0FHaEI7QUFDQSxTQUFLSyxTQUFMLEdBQWlCLElBQUlMLEdBQUosRUFBakIsQ0FKZ0IsQ0FLaEI7OzttQ0FJQSxLQUFLTSxZQUFMLEdBQW9CLElBQUlDLEdBQUosRUFBcEIsQ0FUZ0IsQ0FVaEI7OztxRUFJQSxLQUFLQyxPQUFMLEdBQWUsSUFBSVIsR0FBSixFQUFmLENBQ0EsS0FBS1MsTUFBTCxHQUFjLEVBQWQsQ0FmZ0IsQ0FnQmhCOzttSEFHQSxLQUFLQyxTQUFMLEdBQWlCLFdBQWpCLENBQ0QsQyx1Q0FlRDs7Ozs7OzROQU9JQyxJLEVBQU0sQ0FDUixJQUFJLEtBQUtQLFNBQUwsQ0FBZVEsR0FBZixDQUFtQkQsSUFBbkIsQ0FBSixFQUE4QixPQUFPLElBQVAsQ0FDOUIsSUFBSSxLQUFLTixTQUFMLENBQWVPLEdBQWYsQ0FBbUJELElBQW5CLENBQUosRUFBOEIsT0FBTyxJQUFQLENBRnRCLENBSVI7QUFDQSxZQUFJQSxTQUFTLFNBQWIsRUFBd0Isd0dBQ3RCLHFCQUFrQixLQUFLTCxZQUF2Qiw4SEFBcUMsS0FBMUJPLEdBQTBCLGVBQ25DLElBQU1DLFdBQVdELEtBQWpCLENBRG1DLENBR25DO0FBQ0Esa0JBQUksQ0FBQ0MsUUFBTCxFQUFlLFNBRWYsSUFBSUEsU0FBU0YsR0FBVCxDQUFhRCxJQUFiLENBQUosRUFBd0IsT0FBTyxJQUFQLENBQ3pCLENBUnFCLHVOQVN2QixDQUVELE9BQU8sS0FBUCxDQUNELEMsZUFFRDs7Ozs4WEFLUUEsSSxFQUFNLENBQ1osSUFBSSxLQUFLUCxTQUFMLENBQWVRLEdBQWYsQ0FBbUJELElBQW5CLENBQUosRUFBOEIsT0FBTyxFQUFFSSxPQUFPLElBQVQsRUFBZVosTUFBTSxDQUFDLElBQUQsQ0FBckIsRUFBUCxDQUU5QixJQUFJLEtBQUtFLFNBQUwsQ0FBZU8sR0FBZixDQUFtQkQsSUFBbkIsQ0FBSixFQUE4QixDQUM1QixJQUFNTixZQUFZLEtBQUtBLFNBQUwsQ0FBZVcsR0FBZixDQUFtQkwsSUFBbkIsQ0FBbEIsQ0FDQSxJQUFNTSxXQUFXWixVQUFVYSxTQUFWLEVBQWpCLENBRjRCLENBSTVCO0FBQ0EsY0FBSUQsWUFBWSxJQUFoQixFQUFzQixPQUFPLEVBQUVGLE9BQU8sSUFBVCxFQUFlWixNQUFNLENBQUMsSUFBRCxDQUFyQixFQUFQLENBTE0sQ0FPNUI7QUFDQSxjQUFJYyxTQUFTZCxJQUFULEtBQWtCLEtBQUtBLElBQXZCLElBQStCRSxVQUFVYyxLQUFWLEtBQW9CUixJQUF2RCxFQUE2RCxDQUMzRCxPQUFPLEVBQUVJLE9BQU8sS0FBVCxFQUFnQlosTUFBTSxDQUFDLElBQUQsQ0FBdEIsRUFBUCxDQUNELENBRUQsSUFBTWlCLE9BQU9ILFNBQVNJLE9BQVQsQ0FBaUJoQixVQUFVYyxLQUEzQixDQUFiLENBQ0FDLEtBQUtqQixJQUFMLENBQVVtQixPQUFWLENBQWtCLElBQWxCLEVBRUEsT0FBT0YsSUFBUCxDQUNELENBbkJXLENBc0JaO0FBQ0EsWUFBSVQsU0FBUyxTQUFiLEVBQXdCLDJHQUN0QixzQkFBa0IsS0FBS0wsWUFBdkIsbUlBQXFDLEtBQTFCTyxHQUEwQixnQkFDbkMsSUFBTUMsV0FBV0QsS0FBakIsQ0FDQSxJQUFJQyxZQUFZLElBQWhCLEVBQXNCLE9BQU8sRUFBRUMsT0FBTyxJQUFULEVBQWVaLE1BQU0sQ0FBQyxJQUFELENBQXJCLEVBQVAsQ0FGYSxDQUduQztBQUNBLGtCQUFJLENBQUNXLFFBQUwsRUFBZSxTQUpvQixDQU1uQztBQUNBLGtCQUFJQSxTQUFTWCxJQUFULEtBQWtCLEtBQUtBLElBQTNCLEVBQWlDLFNBRWpDLElBQU1vQixhQUFhVCxTQUFTTyxPQUFULENBQWlCVixJQUFqQixDQUFuQixDQUNBLElBQUlZLFdBQVdSLEtBQWYsRUFBc0IsQ0FDcEJRLFdBQVdwQixJQUFYLENBQWdCbUIsT0FBaEIsQ0FBd0IsSUFBeEIsRUFDQSxPQUFPQyxVQUFQLENBQ0QsQ0FDRixDQWZxQiw4TkFnQnZCLENBRUQsT0FBTyxFQUFFUixPQUFPLEtBQVQsRUFBZ0JaLE1BQU0sQ0FBQyxJQUFELENBQXRCLEVBQVAsQ0FDRCxDLHFFQUVHUSxJLEVBQU0sQ0FDUixJQUFJLEtBQUtQLFNBQUwsQ0FBZVEsR0FBZixDQUFtQkQsSUFBbkIsQ0FBSixFQUE4QixPQUFPLEtBQUtQLFNBQUwsQ0FBZVksR0FBZixDQUFtQkwsSUFBbkIsQ0FBUCxDQUU5QixJQUFJLEtBQUtOLFNBQUwsQ0FBZU8sR0FBZixDQUFtQkQsSUFBbkIsQ0FBSixFQUE4QixDQUM1QixJQUFNTixZQUFZLEtBQUtBLFNBQUwsQ0FBZVcsR0FBZixDQUFtQkwsSUFBbkIsQ0FBbEIsQ0FDQSxJQUFNTSxXQUFXWixVQUFVYSxTQUFWLEVBQWpCLENBRjRCLENBSTVCO0FBQ0EsY0FBSUQsWUFBWSxJQUFoQixFQUFzQixPQUFPLElBQVAsQ0FMTSxDQU81QjtBQUNBLGNBQUlBLFNBQVNkLElBQVQsS0FBa0IsS0FBS0EsSUFBdkIsSUFBK0JFLFVBQVVjLEtBQVYsS0FBb0JSLElBQXZELEVBQTZELE9BQU9hLFNBQVAsQ0FFN0QsT0FBT1AsU0FBU0QsR0FBVCxDQUFhWCxVQUFVYyxLQUF2QixDQUFQLENBQ0QsQ0FkTyxDQWdCUjtBQUNBLFlBQUlSLFNBQVMsU0FBYixFQUF3QiwyR0FDdEIsc0JBQWtCLEtBQUtMLFlBQXZCLG1JQUFxQyxLQUExQk8sR0FBMEIsZ0JBQ25DLElBQU1DLFdBQVdELEtBQWpCLENBRG1DLENBRW5DO0FBQ0Esa0JBQUksQ0FBQ0MsUUFBTCxFQUFlLFNBSG9CLENBS25DO0FBQ0Esa0JBQUlBLFNBQVNYLElBQVQsS0FBa0IsS0FBS0EsSUFBM0IsRUFBaUMsU0FFakMsSUFBTW9CLGFBQWFULFNBQVNFLEdBQVQsQ0FBYUwsSUFBYixDQUFuQixDQUNBLElBQUlZLGVBQWVDLFNBQW5CLEVBQThCLE9BQU9ELFVBQVAsQ0FDL0IsQ0FYcUIsOE5BWXZCLENBRUQsT0FBT0MsU0FBUCxDQUNELEMseUVBRU9DLFEsRUFBVUMsTyxFQUFTLGtCQUN6QixLQUFLdEIsU0FBTCxDQUFldUIsT0FBZixDQUF1QixVQUFDQyxDQUFELEVBQUlDLENBQUosVUFDckJKLFNBQVNLLElBQVQsQ0FBY0osT0FBZCxFQUF1QkUsQ0FBdkIsRUFBMEJDLENBQTFCLEVBQTZCLEtBQTdCLENBRHFCLEVBQXZCLEVBR0EsS0FBS3hCLFNBQUwsQ0FBZXNCLE9BQWYsQ0FBdUIsVUFBQ3RCLFNBQUQsRUFBWU0sSUFBWixFQUFxQixDQUMxQyxJQUFNb0IsYUFBYTFCLFVBQVVhLFNBQVYsRUFBbkIsQ0FEMEMsQ0FFMUM7QUFDQU8sbUJBQVNLLElBQVQsQ0FBY0osT0FBZCxFQUF1QkssY0FBY0EsV0FBV2YsR0FBWCxDQUFlWCxVQUFVYyxLQUF6QixDQUFyQyxFQUFzRVIsSUFBdEUsRUFBNEUsS0FBNUUsRUFDRCxDQUpELEVBTUEsS0FBS0wsWUFBTCxDQUFrQnFCLE9BQWxCLENBQTBCLGVBQU8sQ0FDL0IsSUFBTUssSUFBSW5CLEtBQVYsQ0FEK0IsQ0FFL0I7QUFDQSxjQUFJbUIsS0FBSyxJQUFULEVBQWUsT0FFZkEsRUFBRUwsT0FBRixDQUFVLFVBQUNDLENBQUQsRUFBSUMsQ0FBSixVQUNSQSxNQUFNLFNBQU4sSUFBbUJKLFNBQVNLLElBQVQsQ0FBY0osT0FBZCxFQUF1QkUsQ0FBdkIsRUFBMEJDLENBQTFCLEVBQTZCLEtBQTdCLENBRFgsRUFBVixFQUVELENBUEQsRUFRRCxDLG1CQUVEO3NFQUVhSSxPLEVBQVNDLFcsRUFBYSxDQUNqQ0QsUUFBUUUsTUFBUixDQUFlLEVBQ2JDLE1BQU1GLFlBQVlHLE1BREwsRUFFYkMsU0FBUyw4Q0FBb0NKLFlBQVlHLE1BQVosQ0FBbUJFLEtBQXZELDBCQUNNLEtBQUs5QixNQUFMLENBQ0ErQixHQURBLENBQ0ksNEJBQVFDLEVBQUVILE9BQVYsa0JBQXNCRyxFQUFFQyxVQUF4QixpQkFBc0NELEVBQUVFLE1BQXhDLFNBREosRUFFQUMsSUFGQSxDQUVLLElBRkwsQ0FETixFQUZJLEVBQWYsRUFPRCxDLGlGQXhKZ0IsQ0FBRSxPQUFPLEtBQUs1QixHQUFMLENBQVMsU0FBVCxLQUF1QixJQUE5QixDQUFxQyxDLGVBQUM7cURBRTlDLENBQ1QsSUFBSTZCLE9BQU8sS0FBS3pDLFNBQUwsQ0FBZXlDLElBQWYsR0FBc0IsS0FBS3hDLFNBQUwsQ0FBZXdDLElBQWhELENBQ0EsS0FBS3ZDLFlBQUwsQ0FBa0JxQixPQUFsQixDQUEwQixlQUFPLENBQy9CLElBQU1LLElBQUluQixLQUFWLENBRCtCLENBRS9CO0FBQ0EsY0FBSW1CLEtBQUssSUFBVCxFQUFlLE9BQ2ZhLFFBQVFiLEVBQUVhLElBQVYsQ0FDRCxDQUxELEVBTUEsT0FBT0EsSUFBUCxDQUNELEMseUNBZ0pIOztnSUFsTHFCM0MsUyxDQXFMckIsU0FBUzRDLFVBQVQsQ0FBb0JULE1BQXBCLEVBQTRCVSxlQUE1QixFQUF1RCxDQUNyRCxJQUFNQyxXQUFXLEVBQWpCLENBRHFELENBR3JEO0FBSHFELG9DQUFQQyxLQUFPLG1FQUFQQSxLQUFPLDhCQUlyREEsTUFBTUMsSUFBTixDQUFXLGFBQUssQ0FDZCxJQUFJLENBRUYsSUFBSUMsd0JBQUosQ0FGRSxDQUlGO0FBQ0EsVUFBSSxxQkFBcUJ0QixDQUF6QixFQUE0QixDQUMxQnNCLGtCQUFrQnRCLEVBQUVzQixlQUFwQixDQUNELENBRkQsTUFFTyxJQUFJdEIsRUFBRXVCLEtBQU4sRUFBYSxDQUNsQkQsa0JBQWtCZCxPQUFPZ0IsaUJBQVAsQ0FBeUJ4QixDQUF6QixDQUFsQixDQUNELENBRUQsSUFBSSxDQUFDc0IsZUFBRCxJQUFvQkEsZ0JBQWdCRyxNQUFoQixLQUEyQixDQUFuRCxFQUFzRCxPQUFPLEtBQVAsQ0FFdEQsS0FBSyxJQUFNM0MsSUFBWCxJQUFtQm9DLGVBQW5CLEVBQW9DLENBQ2xDLElBQU1RLE1BQU1SLGdCQUFnQnBDLElBQWhCLEVBQXNCd0MsZUFBdEIsQ0FBWixDQUNBLElBQUlJLEdBQUosRUFBUyxDQUNQUCxTQUFTTyxHQUFULEdBQWVBLEdBQWYsQ0FDRCxDQUNGLENBRUQsT0FBTyxJQUFQLENBQ0QsQ0FyQkQsQ0FxQkUsT0FBT0MsR0FBUCxFQUFZLENBQ1osT0FBTyxLQUFQLENBQ0QsQ0FDRixDQXpCRCxFQTJCQSxPQUFPUixRQUFQLENBQ0QsQ0FFRCxJQUFNUywyQkFBMkIsRUFDL0JDLE9BQU9DLFlBRHdCLEVBRS9CQyxRQUFRQyxhQUZ1QixFQUFqQyxDLENBS0E7Ozs7Z2RBS0EsU0FBU0YsWUFBVCxDQUFzQkcsUUFBdEIsRUFBZ0MsQ0FDOUIsSUFBSVAsWUFBSixDQUQ4QixDQUc5QjtBQUNBTyxXQUFTbkMsT0FBVCxDQUFpQixtQkFBVyxDQUMxQjtBQUNBLFFBQUlvQyxRQUFRQyxJQUFSLEtBQWlCLE9BQXJCLEVBQThCLE9BQzlCLElBQUksQ0FDRlQsTUFBTVUsc0JBQVNDLEtBQVQsQ0FBZUgsUUFBUXhCLEtBQXZCLEVBQThCLEVBQUU0QixRQUFRLElBQVYsRUFBOUIsQ0FBTixDQUNELENBRkQsQ0FFRSxPQUFPWCxHQUFQLEVBQVksQ0FDWixpREFDRCxDQUNGLENBUkQsRUFVQSxPQUFPRCxHQUFQLENBQ0QsQyxDQUVEOztzTUFHQSxTQUFTTSxhQUFULENBQXVCQyxRQUF2QixFQUFpQyxDQUMvQjtBQUNBLE1BQU1NLFFBQVEsRUFBZCxDQUNBLEtBQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJUCxTQUFTUixNQUE3QixFQUFxQ2UsR0FBckMsRUFBMEMsQ0FDeEMsSUFBTU4sVUFBVUQsU0FBU08sQ0FBVCxDQUFoQixDQUNBLElBQUlOLFFBQVF4QixLQUFSLENBQWMrQixLQUFkLENBQW9CLE9BQXBCLENBQUosRUFBa0MsTUFDbENGLE1BQU1HLElBQU4sQ0FBV1IsUUFBUXhCLEtBQVIsQ0FBY2lDLElBQWQsRUFBWCxFQUNELENBUDhCLENBUy9CO0FBQ0EsTUFBTUMsY0FBY0wsTUFBTXhCLElBQU4sQ0FBVyxHQUFYLEVBQWdCMEIsS0FBaEIsQ0FBc0IsdUNBQXRCLENBQXBCLENBQ0EsSUFBSUcsV0FBSixFQUFpQixDQUNmLE9BQU8sRUFDTEMsYUFBYUQsWUFBWSxDQUFaLENBRFIsRUFFTEUsTUFBTSxDQUFDLEVBQ0xDLE9BQU9ILFlBQVksQ0FBWixFQUFlSSxXQUFmLEVBREYsRUFFTEgsYUFBYUQsWUFBWSxDQUFaLENBRlIsRUFBRCxDQUZELEVBQVAsQ0FPRCxDQUNGLENBRUQsSUFBTUssdUJBQXVCLElBQUl2RSxHQUFKLENBQVEsQ0FBQyx3QkFBRCxFQUEyQiwwQkFBM0IsQ0FBUixDQUE3QixDQUVBTCxVQUFVYyxHQUFWLEdBQWdCLFVBQVVxQixNQUFWLEVBQWtCSixPQUFsQixFQUEyQixDQUN6QyxJQUFNOUIsT0FBTywwQkFBUWtDLE1BQVIsRUFBZ0JKLE9BQWhCLENBQWIsQ0FDQSxJQUFJOUIsUUFBUSxJQUFaLEVBQWtCLE9BQU8sSUFBUCxDQUVsQixPQUFPRCxpQkFBYzZFLGFBQWE1RSxJQUFiLEVBQW1COEIsT0FBbkIsQ0FBZCxDQUFQLENBQ0QsQ0FMRCxDQU9BL0IsbUJBQWdCLFVBQVUrQixPQUFWLEVBQW1CLEtBQ3pCOUIsSUFEeUIsR0FDaEI4QixPQURnQixDQUN6QjlCLElBRHlCLENBR2pDLElBQU02RSxXQUFXLHNCQUFXL0MsT0FBWCxFQUFvQmdELE1BQXBCLENBQTJCLEtBQTNCLENBQWpCLENBQ0EsSUFBSUMsWUFBWW5GLFlBQVlpQixHQUFaLENBQWdCZ0UsUUFBaEIsQ0FBaEIsQ0FKaUMsQ0FNakM7QUFDQSxNQUFJRSxjQUFjLElBQWxCLEVBQXdCLE9BQU8sSUFBUCxDQUV4QixJQUFNQyxRQUFRQyxnQkFBR0MsUUFBSCxDQUFZbEYsSUFBWixDQUFkLENBQ0EsSUFBSStFLGFBQWEsSUFBakIsRUFBdUIsQ0FDckI7QUFDQSxRQUFJQSxVQUFVSSxLQUFWLEdBQWtCSCxNQUFNRyxLQUF4QixLQUFrQyxDQUF0QyxFQUF5QyxDQUN2QyxPQUFPSixTQUFQLENBQ0QsQ0FKb0IsQ0FLckI7QUFDRCxHQWhCZ0MsQ0FrQmpDO0FBQ0EsTUFBSSxDQUFDLCtCQUFrQi9FLElBQWxCLEVBQXdCOEIsT0FBeEIsQ0FBTCxFQUF1QyxDQUNyQ2xDLFlBQVl3RixHQUFaLENBQWdCUCxRQUFoQixFQUEwQixJQUExQixFQUNBLE9BQU8sSUFBUCxDQUNELENBdEJnQyxDQXdCakM7QUFDQSxNQUFJLHlCQUFVN0UsSUFBVixFQUFnQjhCLE9BQWhCLENBQUosRUFBOEIsQ0FDNUJuQyxJQUFJLHNDQUFKLEVBQTRDSyxJQUE1QyxFQUNBSixZQUFZd0YsR0FBWixDQUFnQlAsUUFBaEIsRUFBMEIsSUFBMUIsRUFDQSxPQUFPLElBQVAsQ0FDRCxDQUVELElBQU1RLFVBQVVKLGdCQUFHSyxZQUFILENBQWdCdEYsSUFBaEIsRUFBc0IsRUFBRXVGLFVBQVUsTUFBWixFQUF0QixDQUFoQixDQS9CaUMsQ0FpQ2pDO0FBQ0EsTUFBSSxDQUFDOUYsWUFBWStGLElBQVosQ0FBaUJILE9BQWpCLENBQUwsRUFBZ0MsQ0FDOUIxRixJQUFJLHdDQUFKLEVBQThDSyxJQUE5QyxFQUNBSixZQUFZd0YsR0FBWixDQUFnQlAsUUFBaEIsRUFBMEIsSUFBMUIsRUFDQSxPQUFPLElBQVAsQ0FDRCxDQUVEbEYsSUFBSSxZQUFKLEVBQWtCa0YsUUFBbEIsRUFBNEIsVUFBNUIsRUFBd0M3RSxJQUF4QyxFQUNBK0UsWUFBWWhGLFVBQVVnRSxLQUFWLENBQWdCL0QsSUFBaEIsRUFBc0JxRixPQUF0QixFQUErQnZELE9BQS9CLENBQVosQ0F6Q2lDLENBMkNqQztBQUNBLE1BQUlpRCxhQUFhLElBQWpCLEVBQXVCLENBQ3JCcEYsSUFBSSxzQ0FBSixFQUE0Q0ssSUFBNUMsRUFDQUosWUFBWXdGLEdBQVosQ0FBZ0JQLFFBQWhCLEVBQTBCLElBQTFCLEVBQ0EsT0FBTyxJQUFQLENBQ0QsQ0FFREUsVUFBVUksS0FBVixHQUFrQkgsTUFBTUcsS0FBeEIsQ0FFQXZGLFlBQVl3RixHQUFaLENBQWdCUCxRQUFoQixFQUEwQkUsU0FBMUIsRUFDQSxPQUFPQSxTQUFQLENBQ0QsQ0F0REQsQ0F5REFoRixVQUFVZ0UsS0FBVixHQUFrQixVQUFVL0QsSUFBVixFQUFnQnFGLE9BQWhCLEVBQXlCdkQsT0FBekIsRUFBa0MsQ0FDbEQsSUFBTTJELElBQUksSUFBSTFGLFNBQUosQ0FBY0MsSUFBZCxDQUFWLENBQ0EsSUFBTTBGLHdCQUF3QkMsbUJBQTlCLENBRUEsSUFBSUMsWUFBSixDQUNBLElBQUlDLG9CQUFKLENBQ0EsSUFBSSxDQUNGLElBQU1DLFNBQVMsd0JBQU05RixJQUFOLEVBQVlxRixPQUFaLEVBQXFCdkQsT0FBckIsQ0FBZixDQUNBOEQsTUFBTUUsT0FBT0YsR0FBYixDQUNBQyxjQUFjQyxPQUFPRCxXQUFyQixDQUNELENBSkQsQ0FJRSxPQUFPeEMsR0FBUCxFQUFZLENBQ1pvQyxFQUFFbkYsTUFBRixDQUFTOEQsSUFBVCxDQUFjZixHQUFkLEVBQ0EsT0FBT29DLENBQVAsQ0FGWSxDQUVGO0FBQ1gsR0FFREEsRUFBRUksV0FBRixHQUFnQkEsV0FBaEIsQ0FFQSxJQUFJRSxvQkFBb0IsS0FBeEIsQ0FFQSxTQUFTQyxvQkFBVCxDQUE4QjlELE1BQTlCLEVBQXNDLENBQ3BDNkQsb0JBQW9CLElBQXBCLENBQ0EsSUFBSTdELE9BQU8yQixJQUFQLEtBQWdCLFNBQXBCLEVBQStCLENBQzdCLE9BQU8sSUFBUCxDQUNELENBQ0QsSUFBTW9DLElBQUlDLFdBQVdoRSxPQUFPRSxLQUFsQixDQUFWLENBQ0EsSUFBSTZELEtBQUssSUFBVCxFQUFlLENBQ2IsT0FBTyxJQUFQLENBQ0QsQ0FDRCxJQUFNRSxxQkFBcUIsSUFBSS9GLEdBQUosRUFBM0IsQ0FDQStGLG1CQUFtQkMsR0FBbkIsQ0FBdUIsMEJBQXZCLEVBQ0EsSUFBTUMsU0FBU0MsU0FBU0wsQ0FBVCxFQUFZbkUsT0FBWixDQUFmLENBQ0EyRCxFQUFFcEYsT0FBRixDQUFVK0UsR0FBVixDQUFjYSxDQUFkLEVBQWlCLEVBQ2ZJLGNBRGUsRUFFZkUsY0FBYyxJQUFJbkcsR0FBSixDQUFRLENBQUMsRUFDckI4QixRQUFRLEVBQ1I7QUFDRUUsaUJBQU9GLE9BQU9FLEtBRlIsRUFHTm9FLEtBQUt0RSxPQUFPc0UsR0FITixFQURhLEVBTXJCTCxzQ0FOcUIsRUFPckJNLFNBQVMsSUFQWSxFQUFELENBQVIsQ0FGQyxFQUFqQixFQVlELENBRUQsd0JBQU1iLEdBQU4sRUFBV0MsV0FBWCxFQUF3QixFQUN0QmEsZ0JBRHNCLHlDQUNMekUsSUFESyxFQUNDLENBQ3JCK0QscUJBQXFCL0QsS0FBS0MsTUFBMUIsRUFDRCxDQUhxQiw2QkFJdEJ5RSxjQUpzQix1Q0FJUDFFLElBSk8sRUFJRCxDQUNuQixJQUFJQSxLQUFLMkUsTUFBTCxDQUFZL0MsSUFBWixLQUFxQixRQUF6QixFQUFtQyxDQUNqQ21DLHFCQUFxQi9ELEtBQUs0RSxTQUFMLENBQWUsQ0FBZixDQUFyQixFQUNELENBQ0YsQ0FScUIsMkJBQXhCLEVBV0EsSUFBTUMsbUJBQW1CckgsWUFBWXNILFFBQVosQ0FBcUJuQixHQUFyQixDQUF6QixDQUNBLElBQUksQ0FBQ2tCLGdCQUFELElBQXFCLENBQUNmLGlCQUExQixFQUE2QyxPQUFPLElBQVAsQ0FFN0MsSUFBTWlCLFdBQVlsRixRQUFRbUYsUUFBUixJQUFvQm5GLFFBQVFtRixRQUFSLENBQWlCLGlCQUFqQixDQUFyQixJQUE2RCxDQUFDLE9BQUQsQ0FBOUUsQ0FDQSxJQUFNckUsa0JBQWtCLEVBQXhCLENBQ0FvRSxTQUFTeEYsT0FBVCxDQUFpQixpQkFBUyxDQUN4Qm9CLGdCQUFnQnNFLEtBQWhCLElBQXlCNUQseUJBQXlCNEQsS0FBekIsQ0FBekIsQ0FDRCxDQUZELEVBN0RrRCxDQWlFbEQ7QUFDQSxNQUFJdEIsSUFBSWpDLFFBQVIsRUFBa0IsQ0FDaEJpQyxJQUFJakMsUUFBSixDQUFhWixJQUFiLENBQWtCLGFBQUssQ0FDckIsSUFBSW9FLEVBQUV0RCxJQUFGLEtBQVcsT0FBZixFQUF3QixPQUFPLEtBQVAsQ0FDeEIsSUFBSSxDQUNGLElBQU1ULE1BQU1VLHNCQUFTQyxLQUFULENBQWVvRCxFQUFFL0UsS0FBakIsRUFBd0IsRUFBRTRCLFFBQVEsSUFBVixFQUF4QixDQUFaLENBQ0EsSUFBSVosSUFBSW9CLElBQUosQ0FBU3pCLElBQVQsQ0FBYyxxQkFBS3FFLEVBQUUzQyxLQUFGLEtBQVksUUFBakIsRUFBZCxDQUFKLEVBQThDLENBQzVDZ0IsRUFBRXJDLEdBQUYsR0FBUUEsR0FBUixDQUNBLE9BQU8sSUFBUCxDQUNELENBQ0YsQ0FORCxDQU1FLE9BQU9DLEdBQVAsRUFBWSxDQUFFLFlBQWMsQ0FDOUIsT0FBTyxLQUFQLENBQ0QsQ0FWRCxFQVdELENBRUQsSUFBTWdFLGFBQWEsSUFBSXhILEdBQUosRUFBbkIsQ0FFQSxTQUFTcUcsVUFBVCxDQUFvQjlELEtBQXBCLEVBQTJCLENBQ3pCLE9BQU9rRixxQkFBUUMsUUFBUixDQUFpQm5GLEtBQWpCLEVBQXdCcEMsSUFBeEIsRUFBOEI4QixRQUFRbUYsUUFBdEMsQ0FBUCxDQUNELENBRUQsU0FBU08sYUFBVCxDQUF1QnBGLEtBQXZCLEVBQThCLENBQzVCLElBQU1xRixLQUFLdkIsV0FBVzlELEtBQVgsQ0FBWCxDQUNBLElBQUlxRixNQUFNLElBQVYsRUFBZ0IsT0FBTyxJQUFQLENBQ2hCLE9BQU8xSCxpQkFBYzZFLGFBQWE2QyxFQUFiLEVBQWlCM0YsT0FBakIsQ0FBZCxDQUFQLENBQ0QsQ0FFRCxTQUFTNEYsWUFBVCxDQUFzQkMsVUFBdEIsRUFBa0MsQ0FDaEMsSUFBSSxDQUFDTixXQUFXNUcsR0FBWCxDQUFla0gsV0FBV25ILElBQTFCLENBQUwsRUFBc0MsT0FFdEMsT0FBTyxZQUFZLENBQ2pCLE9BQU9nSCxjQUFjSCxXQUFXeEcsR0FBWCxDQUFlOEcsV0FBV25ILElBQTFCLENBQWQsQ0FBUCxDQUNELENBRkQsQ0FHRCxDQUVELFNBQVNvSCxZQUFULENBQXNCQyxNQUF0QixFQUE4QkYsVUFBOUIsRUFBMEMsQ0FDeEMsSUFBTUcsT0FBT0osYUFBYUMsVUFBYixDQUFiLENBQ0EsSUFBSUcsSUFBSixFQUFVLENBQ1JDLE9BQU9DLGNBQVAsQ0FBc0JILE1BQXRCLEVBQThCLFdBQTlCLEVBQTJDLEVBQUVoSCxLQUFLaUgsSUFBUCxFQUEzQyxFQUNELENBRUQsT0FBT0QsTUFBUCxDQUNELENBRUQsU0FBU0ksZ0JBQVQsQ0FBMEJDLENBQTFCLEVBQTZCeEcsQ0FBN0IsRUFBZ0MrRCxDQUFoQyxFQUFtQyxDQUNqQyxJQUFNMEMsVUFBVXpHLEVBQUVRLE1BQUYsSUFBWVIsRUFBRVEsTUFBRixDQUFTRSxLQUFyQyxDQUNBLElBQU1nRyxhQUFhLEVBQW5CLENBQ0EsSUFBSXBILGNBQUosQ0FFQSxRQUFRa0gsRUFBRXJFLElBQVYsR0FDQSxLQUFLLHdCQUFMLENBQ0UsSUFBSSxDQUFDc0UsT0FBTCxFQUFjLE9BQ2RuSCxRQUFRLFNBQVIsQ0FDQSxNQUNGLEtBQUssMEJBQUwsQ0FDRXlFLEVBQUV4RixTQUFGLENBQVltRixHQUFaLENBQWdCOEMsRUFBRUcsUUFBRixDQUFXN0gsSUFBM0IsRUFBaUN1SCxPQUFPQyxjQUFQLENBQXNCSSxVQUF0QixFQUFrQyxXQUFsQyxFQUErQyxFQUM5RXZILEdBRDhFLDhCQUN4RSxDQUFFLE9BQU8yRyxjQUFjVyxPQUFkLENBQVAsQ0FBZ0MsQ0FEc0MsZ0JBQS9DLENBQWpDLEVBR0EsT0FDRixLQUFLLHNCQUFMLENBQ0UxQyxFQUFFeEYsU0FBRixDQUFZbUYsR0FBWixDQUFnQjhDLEVBQUVHLFFBQUYsQ0FBVzdILElBQVgsSUFBbUIwSCxFQUFFRyxRQUFGLENBQVdqRyxLQUE5QyxFQUFxRHdGLGFBQWFRLFVBQWIsRUFBeUJGLEVBQUVoRyxNQUFGLENBQVNFLEtBQWxDLENBQXJELEVBQ0EsT0FDRixLQUFLLGlCQUFMLENBQ0UsSUFBSSxDQUFDVixFQUFFUSxNQUFQLEVBQWUsQ0FDYnVELEVBQUV4RixTQUFGLENBQVltRixHQUFaLENBQWdCOEMsRUFBRUcsUUFBRixDQUFXN0gsSUFBWCxJQUFtQjBILEVBQUVHLFFBQUYsQ0FBV2pHLEtBQTlDLEVBQXFEd0YsYUFBYVEsVUFBYixFQUF5QkYsRUFBRWxILEtBQTNCLENBQXJELEVBQ0EsT0FDRCxDQWpCSCxDQWtCRTtBQUNGLGNBQ0VBLFFBQVFrSCxFQUFFbEgsS0FBRixDQUFRUixJQUFoQixDQUNBLE1BckJGLENBTGlDLENBNkJqQztBQUNBaUYsTUFBRXZGLFNBQUYsQ0FBWWtGLEdBQVosQ0FBZ0I4QyxFQUFFRyxRQUFGLENBQVc3SCxJQUEzQixFQUFpQyxFQUFFUSxZQUFGLEVBQVNELHdCQUFXLDZCQUFNeUcsY0FBY1csT0FBZCxDQUFOLEVBQVgsb0JBQVQsRUFBakMsRUFDRCxDQUVELFNBQVNHLCtCQUFULENBQXlDNUcsQ0FBekMsRUFBNEMsQ0FDMUM7QUFDQSxRQUFNNkcsb0JBQW9CN0csRUFBRThHLFVBQUYsS0FBaUIsTUFBakIsSUFBMkI5RyxFQUFFOEcsVUFBRixLQUFpQixRQUF0RSxDQUYwQyxDQUcxQztBQUNBO0FBQ0EsUUFBSUMsK0JBQStCL0csRUFBRWdILFVBQUYsQ0FBYXZGLE1BQWIsR0FBc0IsQ0FBekQsQ0FDQSxJQUFNZ0QscUJBQXFCLElBQUkvRixHQUFKLEVBQTNCLENBQ0FzQixFQUFFZ0gsVUFBRixDQUFhbEgsT0FBYixDQUFxQixxQkFBYSxDQUNoQyxJQUFJbUgsVUFBVTlFLElBQVYsS0FBbUIsaUJBQXZCLEVBQTBDLENBQ3hDc0MsbUJBQW1CQyxHQUFuQixDQUF1QnVDLFVBQVU3SCxRQUFWLENBQW1CTixJQUFuQixJQUEyQm1JLFVBQVU3SCxRQUFWLENBQW1Cc0IsS0FBckUsRUFDRCxDQUZELE1BRU8sSUFBSXVDLHFCQUFxQmxFLEdBQXJCLENBQXlCa0ksVUFBVTlFLElBQW5DLENBQUosRUFBOEMsQ0FDbkRzQyxtQkFBbUJDLEdBQW5CLENBQXVCdUMsVUFBVTlFLElBQWpDLEVBQ0QsQ0FMK0IsQ0FPaEM7QUFDQTRFLHFDQUErQkEsaUNBQ3pCRSxVQUFVSCxVQUFWLEtBQXlCLE1BQXpCLElBQW1DRyxVQUFVSCxVQUFWLEtBQXlCLFFBRG5DLENBQS9CLENBRUQsQ0FWRCxFQVdBSSxrQkFBa0JsSCxDQUFsQixFQUFxQjZHLHFCQUFxQkUsNEJBQTFDLEVBQXdFdEMsa0JBQXhFLEVBQ0QsQ0FFRCxTQUFTeUMsaUJBQVQsT0FBdUNDLG9CQUF2QyxFQUE2RixLQUFoRTNHLE1BQWdFLFFBQWhFQSxNQUFnRSxLQUFoQ2lFLGtCQUFnQyx1RUFBWCxJQUFJL0YsR0FBSixFQUFXLENBQzNGLElBQUk4QixVQUFVLElBQWQsRUFBb0IsT0FBTyxJQUFQLENBRXBCLElBQU0rRCxJQUFJQyxXQUFXaEUsT0FBT0UsS0FBbEIsQ0FBVixDQUNBLElBQUk2RCxLQUFLLElBQVQsRUFBZSxPQUFPLElBQVAsQ0FFZixJQUFNNkMsc0JBQXNCLEVBQzFCO0FBQ0E1RyxjQUFRLEVBQUVFLE9BQU9GLE9BQU9FLEtBQWhCLEVBQXVCb0UsS0FBS3RFLE9BQU9zRSxHQUFuQyxFQUZrQixFQUcxQnFDLDBDQUgwQixFQUkxQjFDLHNDQUowQixFQUE1QixDQU9BLElBQU00QyxXQUFXdEQsRUFBRXBGLE9BQUYsQ0FBVVEsR0FBVixDQUFjb0YsQ0FBZCxDQUFqQixDQUNBLElBQUk4QyxZQUFZLElBQWhCLEVBQXNCLENBQ3BCQSxTQUFTeEMsWUFBVCxDQUFzQkgsR0FBdEIsQ0FBMEIwQyxtQkFBMUIsRUFDQSxPQUFPQyxTQUFTMUMsTUFBaEIsQ0FDRCxDQUVELElBQU1BLFNBQVNDLFNBQVNMLENBQVQsRUFBWW5FLE9BQVosQ0FBZixDQUNBMkQsRUFBRXBGLE9BQUYsQ0FBVStFLEdBQVYsQ0FBY2EsQ0FBZCxFQUFpQixFQUFFSSxjQUFGLEVBQVVFLGNBQWMsSUFBSW5HLEdBQUosQ0FBUSxDQUFDMEksbUJBQUQsQ0FBUixDQUF4QixFQUFqQixFQUNBLE9BQU96QyxNQUFQLENBQ0QsQ0FFRCxJQUFNbkUsU0FBUzhHLGVBQWUzRCxPQUFmLEVBQXdCTyxHQUF4QixDQUFmLENBRUEsU0FBU3FELFlBQVQsQ0FBc0JuSCxPQUF0QixFQUErQixDQUM3QixJQUFNb0gsZUFBZSxvQ0FBZSxFQUNsQ0MsS0FDR3JILFFBQVFzSCxhQUFSLElBQXlCdEgsUUFBUXNILGFBQVIsQ0FBc0JDLGVBQWhELElBQ0FDLFFBQVFILEdBQVIsRUFIZ0MsRUFJbENJLHFCQUFRLGdCQUFDQyxHQUFELFVBQVNGLFFBQVFHLEdBQVIsQ0FBWUQsR0FBWixDQUFULEVBQVIsaUJBSmtDLEVBQWYsQ0FBckIsQ0FNQSxJQUFJLENBQ0YsSUFBSU4sYUFBYVEsWUFBYixLQUE4QnJJLFNBQWxDLEVBQTZDLENBQzNDO0FBQ0EsWUFBSSxDQUFDM0IsRUFBTCxFQUFTLENBQUVBLEtBQUtpSyxRQUFRLFlBQVIsQ0FBTCxDQUE2QixDQUZHLENBRUY7QUFFekMsWUFBTUMsYUFBYWxLLEdBQUdtSyxjQUFILENBQWtCWCxhQUFhUSxZQUEvQixFQUE2Q2hLLEdBQUdvSyxHQUFILENBQU9DLFFBQXBELENBQW5CLENBQ0EsT0FBT3JLLEdBQUdzSywwQkFBSCxDQUNMSixXQUFXSyxNQUROLEVBRUx2SyxHQUFHb0ssR0FGRSxFQUdMLG1CQUFRWixhQUFhUSxZQUFyQixDQUhLLENBQVAsQ0FLRCxDQUNGLENBWkQsQ0FZRSxPQUFPcEgsQ0FBUCxFQUFVLENBQ1Y7QUFDRCxLQUVELE9BQU8sSUFBUCxDQUNELENBRUQsU0FBU3FELGlCQUFULEdBQTZCLENBQzNCLElBQU1kLFdBQVcsc0JBQVcsRUFDMUJ3RSxpQkFBaUJ2SCxRQUFRc0gsYUFBUixJQUF5QnRILFFBQVFzSCxhQUFSLENBQXNCQyxlQUR0QyxFQUFYLEVBRWR2RSxNQUZjLENBRVAsS0FGTyxDQUFqQixDQUdBLElBQUlvRixXQUFXcEssY0FBY2UsR0FBZCxDQUFrQmdFLFFBQWxCLENBQWYsQ0FDQSxJQUFJLE9BQU9xRixRQUFQLEtBQW9CLFdBQXhCLEVBQXFDLENBQ25DQSxXQUFXakIsYUFBYW5ILE9BQWIsQ0FBWCxDQUNBaEMsY0FBY3NGLEdBQWQsQ0FBa0JQLFFBQWxCLEVBQTRCcUYsUUFBNUIsRUFDRCxDQUVELE9BQU9BLFlBQVlBLFNBQVNDLE9BQXJCLEdBQStCRCxTQUFTQyxPQUFULENBQWlCQyxlQUFoRCxHQUFrRSxLQUF6RSxDQUNELENBRUR4RSxJQUFJeUUsSUFBSixDQUFTN0ksT0FBVCxDQUFpQixVQUFVRSxDQUFWLEVBQWEsQ0FDNUIsSUFBSUEsRUFBRW1DLElBQUYsS0FBVywwQkFBZixFQUEyQyxDQUN6QyxJQUFNdUUsYUFBYXpGLFdBQVdULE1BQVgsRUFBbUJVLGVBQW5CLEVBQW9DbEIsQ0FBcEMsQ0FBbkIsQ0FDQSxJQUFJQSxFQUFFSyxXQUFGLENBQWM4QixJQUFkLEtBQXVCLFlBQTNCLEVBQXlDLENBQ3ZDK0QsYUFBYVEsVUFBYixFQUF5QjFHLEVBQUVLLFdBQTNCLEVBQ0QsQ0FDRDBELEVBQUV4RixTQUFGLENBQVltRixHQUFaLENBQWdCLFNBQWhCLEVBQTJCZ0QsVUFBM0IsRUFDQSxPQUNELENBRUQsSUFBSTFHLEVBQUVtQyxJQUFGLEtBQVcsc0JBQWYsRUFBdUMsQ0FDckMsSUFBTXdDLFNBQVN1QyxrQkFBa0JsSCxDQUFsQixFQUFxQkEsRUFBRTRJLFVBQUYsS0FBaUIsTUFBdEMsQ0FBZixDQUNBLElBQUlqRSxNQUFKLEVBQVlaLEVBQUV0RixZQUFGLENBQWVpRyxHQUFmLENBQW1CQyxNQUFuQixFQUNaLElBQUkzRSxFQUFFMkcsUUFBTixFQUFnQixDQUNkSixpQkFBaUJ2RyxDQUFqQixFQUFvQkEsRUFBRTJHLFFBQXRCLEVBQWdDNUMsQ0FBaEMsRUFDRCxDQUNELE9BQ0QsQ0FqQjJCLENBbUI1QjtBQUNBLFFBQUkvRCxFQUFFbUMsSUFBRixLQUFXLG1CQUFmLEVBQW9DLENBQ2xDeUUsZ0NBQWdDNUcsQ0FBaEMsRUFFQSxJQUFNNkksS0FBSzdJLEVBQUVnSCxVQUFGLENBQWE4QixJQUFiLENBQWtCLHFCQUFLdEMsRUFBRXJFLElBQUYsS0FBVywwQkFBaEIsRUFBbEIsQ0FBWCxDQUNBLElBQUkwRyxFQUFKLEVBQVEsQ0FDTmxELFdBQVdqQyxHQUFYLENBQWVtRixHQUFHdkosS0FBSCxDQUFTUixJQUF4QixFQUE4QmtCLEVBQUVRLE1BQUYsQ0FBU0UsS0FBdkMsRUFDRCxDQUNELE9BQ0QsQ0FFRCxJQUFJVixFQUFFbUMsSUFBRixLQUFXLHdCQUFmLEVBQXlDLENBQ3ZDeUUsZ0NBQWdDNUcsQ0FBaEMsRUFEdUMsQ0FHdkM7QUFDQSxVQUFJQSxFQUFFSyxXQUFGLElBQWlCLElBQXJCLEVBQTJCLENBQ3pCLFFBQVFMLEVBQUVLLFdBQUYsQ0FBYzhCLElBQXRCLEdBQ0EsS0FBSyxxQkFBTCxDQUNBLEtBQUssa0JBQUwsQ0FDQSxLQUFLLFdBQUwsQ0FIQSxDQUdrQjtBQUNsQixlQUFLLHNCQUFMLENBQ0EsS0FBSyxpQkFBTCxDQUNBLEtBQUssbUJBQUwsQ0FDQSxLQUFLLG1CQUFMLENBQ0EsS0FBSyx3QkFBTCxDQUNBLEtBQUssd0JBQUwsQ0FDQSxLQUFLLDRCQUFMLENBQ0EsS0FBSyxxQkFBTCxDQUNFNEIsRUFBRXhGLFNBQUYsQ0FBWW1GLEdBQVosQ0FBZ0IxRCxFQUFFSyxXQUFGLENBQWMwSSxFQUFkLENBQWlCakssSUFBakMsRUFBdUNtQyxXQUFXVCxNQUFYLEVBQW1CVSxlQUFuQixFQUFvQ2xCLENBQXBDLENBQXZDLEVBQ0EsTUFDRixLQUFLLHFCQUFMLENBQ0VBLEVBQUVLLFdBQUYsQ0FBY3dFLFlBQWQsQ0FBMkIvRSxPQUEzQixDQUFtQyxVQUFDSyxDQUFELFVBQ2pDckMsd0JBQXdCcUMsRUFBRTRJLEVBQTFCLEVBQ0Usc0JBQU1oRixFQUFFeEYsU0FBRixDQUFZbUYsR0FBWixDQUFnQnFGLEdBQUdqSyxJQUFuQixFQUF5Qm1DLFdBQVdULE1BQVgsRUFBbUJVLGVBQW5CLEVBQW9DZixDQUFwQyxFQUF1Q0gsQ0FBdkMsQ0FBekIsQ0FBTixFQURGLENBRGlDLEVBQW5DLEVBR0EsTUFsQkYsQ0FvQkQsQ0FFREEsRUFBRWdILFVBQUYsQ0FBYWxILE9BQWIsQ0FBcUIsVUFBQzBHLENBQUQsVUFBT0QsaUJBQWlCQyxDQUFqQixFQUFvQnhHLENBQXBCLEVBQXVCK0QsQ0FBdkIsQ0FBUCxFQUFyQixFQUNELENBRUQsSUFBTWlGLFVBQVUsQ0FBQyxvQkFBRCxDQUFoQixDQUNBLElBQUloRixxQkFBSixFQUEyQixDQUN6QmdGLFFBQVF0RyxJQUFSLENBQWEsOEJBQWIsRUFDRCxDQS9EMkIsQ0FpRTVCO0FBQ0EsUUFBSSxnQ0FBU3NHLE9BQVQsRUFBa0JoSixFQUFFbUMsSUFBcEIsQ0FBSixFQUErQixDQUM3QixJQUFNOEcsZUFBZWpKLEVBQUVtQyxJQUFGLEtBQVcsOEJBQVgsR0FDakIsQ0FBQ25DLEVBQUUrSSxFQUFGLElBQVEvSSxFQUFFbEIsSUFBWCxFQUFpQkEsSUFEQSxHQUVoQmtCLEVBQUVrSixVQUFGLElBQWdCbEosRUFBRWtKLFVBQUYsQ0FBYXBLLElBQTdCLElBQXNDa0IsRUFBRWtKLFVBQUYsQ0FBYUgsRUFBYixJQUFtQi9JLEVBQUVrSixVQUFGLENBQWFILEVBQWIsQ0FBZ0JqSyxJQUF6RSxJQUFrRixJQUZ2RixDQUdBLElBQU1xSyxZQUFZLENBQ2hCLHFCQURnQixFQUVoQixrQkFGZ0IsRUFHaEIsbUJBSGdCLEVBSWhCLG1CQUpnQixFQUtoQix3QkFMZ0IsRUFNaEIsd0JBTmdCLEVBT2hCLDRCQVBnQixFQVFoQixxQkFSZ0IsQ0FBbEIsQ0FVQSxJQUFNQyxnQkFBZ0JsRixJQUFJeUUsSUFBSixDQUFTVSxNQUFULENBQWdCLHNCQUFHbEgsSUFBSCxTQUFHQSxJQUFILENBQVM0RyxFQUFULFNBQVNBLEVBQVQsQ0FBYWxFLFlBQWIsU0FBYUEsWUFBYixRQUFnQyxnQ0FBU3NFLFNBQVQsRUFBb0JoSCxJQUFwQixNQUNuRTRHLE1BQU1BLEdBQUdqSyxJQUFILEtBQVltSyxZQUFuQixJQUFxQ3BFLGdCQUFnQkEsYUFBYWlFLElBQWIsQ0FBa0IsVUFBQzNJLENBQUQsVUFBT0EsRUFBRTRJLEVBQUYsQ0FBS2pLLElBQUwsS0FBY21LLFlBQXJCLEVBQWxCLENBRGUsQ0FBaEMsRUFBaEIsQ0FBdEIsQ0FHQSxJQUFJRyxjQUFjM0gsTUFBZCxLQUF5QixDQUE3QixFQUFnQyxDQUM5QjtBQUNBc0MsVUFBRXhGLFNBQUYsQ0FBWW1GLEdBQVosQ0FBZ0IsU0FBaEIsRUFBMkJ6QyxXQUFXVCxNQUFYLEVBQW1CVSxlQUFuQixFQUFvQ2xCLENBQXBDLENBQTNCLEVBQ0EsT0FDRCxDQUNELElBQ0VnRSxzQkFBc0I7QUFBdEIsU0FDRyxDQUFDRCxFQUFFeEYsU0FBRixDQUFZUSxHQUFaLENBQWdCLFNBQWhCLENBRk4sQ0FFaUM7QUFGakMsUUFHRSxDQUNBZ0YsRUFBRXhGLFNBQUYsQ0FBWW1GLEdBQVosQ0FBZ0IsU0FBaEIsRUFBMkIsRUFBM0IsRUFEQSxDQUNnQztBQUNqQyxTQUNEMEYsY0FBY3RKLE9BQWQsQ0FBc0IsVUFBQ3dKLElBQUQsRUFBVSxDQUM5QixJQUFJQSxLQUFLbkgsSUFBTCxLQUFjLHFCQUFsQixFQUF5QyxDQUN2QyxJQUFJbUgsS0FBS1gsSUFBTCxJQUFhVyxLQUFLWCxJQUFMLENBQVV4RyxJQUFWLEtBQW1CLHFCQUFwQyxFQUEyRCxDQUN6RDRCLEVBQUV4RixTQUFGLENBQVltRixHQUFaLENBQWdCNEYsS0FBS1gsSUFBTCxDQUFVSSxFQUFWLENBQWFqSyxJQUE3QixFQUFtQ21DLFdBQVdULE1BQVgsRUFBbUJVLGVBQW5CLEVBQW9Db0ksS0FBS1gsSUFBekMsQ0FBbkMsRUFDRCxDQUZELE1BRU8sSUFBSVcsS0FBS1gsSUFBTCxJQUFhVyxLQUFLWCxJQUFMLENBQVVBLElBQTNCLEVBQWlDLENBQ3RDVyxLQUFLWCxJQUFMLENBQVVBLElBQVYsQ0FBZTdJLE9BQWYsQ0FBdUIsVUFBQ3lKLGVBQUQsRUFBcUIsQ0FDMUM7QUFDQTtBQUNBLGtCQUFNQyxnQkFBZ0JELGdCQUFnQnBILElBQWhCLEtBQXlCLHdCQUF6QixHQUNwQm9ILGdCQUFnQmxKLFdBREksR0FFcEJrSixlQUZGLENBSUEsSUFBSSxDQUFDQyxhQUFMLEVBQW9CLENBQ2xCO0FBQ0QsZUFGRCxNQUVPLElBQUlBLGNBQWNySCxJQUFkLEtBQXVCLHFCQUEzQixFQUFrRCxDQUN2RHFILGNBQWMzRSxZQUFkLENBQTJCL0UsT0FBM0IsQ0FBbUMsVUFBQ0ssQ0FBRCxVQUNqQ3JDLHdCQUF3QnFDLEVBQUU0SSxFQUExQixFQUE4QixVQUFDQSxFQUFELFVBQVFoRixFQUFFeEYsU0FBRixDQUFZbUYsR0FBWixDQUNwQ3FGLEdBQUdqSyxJQURpQyxFQUVwQ21DLFdBQVdULE1BQVgsRUFBbUJVLGVBQW5CLEVBQW9Db0ksSUFBcEMsRUFBMENFLGFBQTFDLEVBQXlERCxlQUF6RCxDQUZvQyxDQUFSLEVBQTlCLENBRGlDLEVBQW5DLEVBTUQsQ0FQTSxNQU9BLENBQ0x4RixFQUFFeEYsU0FBRixDQUFZbUYsR0FBWixDQUNFOEYsY0FBY1QsRUFBZCxDQUFpQmpLLElBRG5CLEVBRUVtQyxXQUFXVCxNQUFYLEVBQW1CVSxlQUFuQixFQUFvQ3FJLGVBQXBDLENBRkYsRUFHRCxDQUNGLENBckJELEVBc0JELENBQ0YsQ0EzQkQsTUEyQk8sQ0FDTDtBQUNBeEYsWUFBRXhGLFNBQUYsQ0FBWW1GLEdBQVosQ0FBZ0IsU0FBaEIsRUFBMkJ6QyxXQUFXVCxNQUFYLEVBQW1CVSxlQUFuQixFQUFvQ29JLElBQXBDLENBQTNCLEVBQ0QsQ0FDRixDQWhDRCxFQWlDRCxDQUNGLENBaElELEVBa0lBLElBQ0V0RixzQkFBc0I7QUFBdEIsS0FDR0QsRUFBRXhGLFNBQUYsQ0FBWXlDLElBQVosR0FBbUIsQ0FEdEIsQ0FDd0I7QUFEeEIsS0FFRyxDQUFDK0MsRUFBRXhGLFNBQUYsQ0FBWVEsR0FBWixDQUFnQixTQUFoQixDQUhOLENBR2lDO0FBSGpDLElBSUUsQ0FDQWdGLEVBQUV4RixTQUFGLENBQVltRixHQUFaLENBQWdCLFNBQWhCLEVBQTJCLEVBQTNCLEVBREEsQ0FDZ0M7QUFDakMsS0FFRCxJQUFJMEIsZ0JBQUosRUFBc0IsQ0FDcEJyQixFQUFFbEYsU0FBRixHQUFjLFFBQWQsQ0FDRCxDQUNELE9BQU9rRixDQUFQLENBQ0QsQ0FsWEQsQyxDQW9YQTs7OzttRUFLQSxTQUFTYSxRQUFULENBQWtCTCxDQUFsQixFQUFxQm5FLE9BQXJCLEVBQThCLENBQzVCLE9BQU8sb0JBQU0vQixpQkFBYzZFLGFBQWFxQixDQUFiLEVBQWdCbkUsT0FBaEIsQ0FBZCxDQUFOLEVBQVAsQ0FDRCxDLENBR0Q7Ozs7OzsrS0FPTyxTQUFTdEMsdUJBQVQsQ0FBaUMyTCxPQUFqQyxFQUEwQzdKLFFBQTFDLEVBQW9ELENBQ3pELFFBQVE2SixRQUFRdEgsSUFBaEIsR0FDQSxLQUFLLFlBQUwsRUFBbUI7QUFDakJ2QyxlQUFTNkosT0FBVCxFQUNBLE1BRUYsS0FBSyxlQUFMLENBQ0VBLFFBQVFDLFVBQVIsQ0FBbUI1SixPQUFuQixDQUEyQixhQUFLLENBQzlCLElBQUl5RSxFQUFFcEMsSUFBRixLQUFXLDBCQUFYLElBQXlDb0MsRUFBRXBDLElBQUYsS0FBVyxhQUF4RCxFQUF1RSxDQUNyRXZDLFNBQVMyRSxFQUFFb0YsUUFBWCxFQUNBLE9BQ0QsQ0FDRDdMLHdCQUF3QnlHLEVBQUU3RCxLQUExQixFQUFpQ2QsUUFBakMsRUFDRCxDQU5ELEVBT0EsTUFFRixLQUFLLGNBQUwsQ0FDRTZKLFFBQVFHLFFBQVIsQ0FBaUI5SixPQUFqQixDQUF5QixVQUFDK0osT0FBRCxFQUFhLENBQ3BDLElBQUlBLFdBQVcsSUFBZixFQUFxQixPQUNyQixJQUFJQSxRQUFRMUgsSUFBUixLQUFpQiwwQkFBakIsSUFBK0MwSCxRQUFRMUgsSUFBUixLQUFpQixhQUFwRSxFQUFtRixDQUNqRnZDLFNBQVNpSyxRQUFRRixRQUFqQixFQUNBLE9BQ0QsQ0FDRDdMLHdCQUF3QitMLE9BQXhCLEVBQWlDakssUUFBakMsRUFDRCxDQVBELEVBUUEsTUFFRixLQUFLLG1CQUFMLENBQ0VBLFNBQVM2SixRQUFRSyxJQUFqQixFQUNBLE1BNUJGLENBOEJELEMsQ0FFRDs7eWpCQUdBLFNBQVM1RyxZQUFULENBQXNCNUUsSUFBdEIsRUFBNEI4QixPQUE1QixFQUFxQyxLQUMzQm1GLFFBRDJCLEdBQ2FuRixPQURiLENBQzNCbUYsUUFEMkIsQ0FDakJtQyxhQURpQixHQUNhdEgsT0FEYixDQUNqQnNILGFBRGlCLENBQ0ZxQyxVQURFLEdBQ2EzSixPQURiLENBQ0YySixVQURFLENBRW5DLE9BQU8sRUFDTHhFLGtCQURLLEVBRUxtQyw0QkFGSyxFQUdMcUMsc0JBSEssRUFJTHpMLFVBSkssRUFBUCxDQU1ELEMsQ0FHRDs7MHlCQUdBLFNBQVNnSixjQUFULENBQXdCMEMsSUFBeEIsRUFBOEI5RixHQUE5QixFQUFtQyxDQUNqQyxJQUFJK0YsbUJBQVd4SSxNQUFYLEdBQW9CLENBQXhCLEVBQTJCLENBQ3pCO0FBQ0EsV0FBTyxJQUFJd0ksa0JBQUosQ0FBZUQsSUFBZixFQUFxQjlGLEdBQXJCLENBQVAsQ0FDRCxDQUhELE1BR08sQ0FDTDtBQUNBLFdBQU8sSUFBSStGLGtCQUFKLENBQWUsRUFBRUQsVUFBRixFQUFROUYsUUFBUixFQUFmLENBQVAsQ0FDRCxDQUNGIiwiZmlsZSI6IkV4cG9ydE1hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XHJcbmltcG9ydCB7IGRpcm5hbWUgfSBmcm9tICdwYXRoJztcclxuXHJcbmltcG9ydCBkb2N0cmluZSBmcm9tICdkb2N0cmluZSc7XHJcblxyXG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xyXG5cclxuaW1wb3J0IHsgU291cmNlQ29kZSB9IGZyb20gJ2VzbGludCc7XHJcblxyXG5pbXBvcnQgcGFyc2UgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9wYXJzZSc7XHJcbmltcG9ydCB2aXNpdCBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL3Zpc2l0JztcclxuaW1wb3J0IHJlc29sdmUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJztcclxuaW1wb3J0IGlzSWdub3JlZCwgeyBoYXNWYWxpZEV4dGVuc2lvbiB9IGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvaWdub3JlJztcclxuXHJcbmltcG9ydCB7IGhhc2hPYmplY3QgfSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL2hhc2gnO1xyXG5pbXBvcnQgKiBhcyB1bmFtYmlndW91cyBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL3VuYW1iaWd1b3VzJztcclxuXHJcbmltcG9ydCB7IHRzQ29uZmlnTG9hZGVyIH0gZnJvbSAndHNjb25maWctcGF0aHMvbGliL3RzY29uZmlnLWxvYWRlcic7XHJcblxyXG5pbXBvcnQgaW5jbHVkZXMgZnJvbSAnYXJyYXktaW5jbHVkZXMnO1xyXG5cclxubGV0IHRzO1xyXG5cclxuY29uc3QgbG9nID0gZGVidWcoJ2VzbGludC1wbHVnaW4taW1wb3J0OkV4cG9ydE1hcCcpO1xyXG5cclxuY29uc3QgZXhwb3J0Q2FjaGUgPSBuZXcgTWFwKCk7XHJcbmNvbnN0IHRzQ29uZmlnQ2FjaGUgPSBuZXcgTWFwKCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeHBvcnRNYXAge1xyXG4gIGNvbnN0cnVjdG9yKHBhdGgpIHtcclxuICAgIHRoaXMucGF0aCA9IHBhdGg7XHJcbiAgICB0aGlzLm5hbWVzcGFjZSA9IG5ldyBNYXAoKTtcclxuICAgIC8vIHRvZG86IHJlc3RydWN0dXJlIHRvIGtleSBvbiBwYXRoLCB2YWx1ZSBpcyByZXNvbHZlciArIG1hcCBvZiBuYW1lc1xyXG4gICAgdGhpcy5yZWV4cG9ydHMgPSBuZXcgTWFwKCk7XHJcbiAgICAvKipcclxuICAgICAqIHN0YXItZXhwb3J0c1xyXG4gICAgICogQHR5cGUge1NldH0gb2YgKCkgPT4gRXhwb3J0TWFwXHJcbiAgICAgKi9cclxuICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gbmV3IFNldCgpO1xyXG4gICAgLyoqXHJcbiAgICAgKiBkZXBlbmRlbmNpZXMgb2YgdGhpcyBtb2R1bGUgdGhhdCBhcmUgbm90IGV4cGxpY2l0bHkgcmUtZXhwb3J0ZWRcclxuICAgICAqIEB0eXBlIHtNYXB9IGZyb20gcGF0aCA9ICgpID0+IEV4cG9ydE1hcFxyXG4gICAgICovXHJcbiAgICB0aGlzLmltcG9ydHMgPSBuZXcgTWFwKCk7XHJcbiAgICB0aGlzLmVycm9ycyA9IFtdO1xyXG4gICAgLyoqXHJcbiAgICAgKiB0eXBlIHsnYW1iaWd1b3VzJyB8ICdNb2R1bGUnIHwgJ1NjcmlwdCd9XHJcbiAgICAgKi9cclxuICAgIHRoaXMucGFyc2VHb2FsID0gJ2FtYmlndW91cyc7XHJcbiAgfVxyXG5cclxuICBnZXQgaGFzRGVmYXVsdCgpIHsgcmV0dXJuIHRoaXMuZ2V0KCdkZWZhdWx0JykgIT0gbnVsbDsgfSAvLyBzdHJvbmdlciB0aGFuIHRoaXMuaGFzXHJcblxyXG4gIGdldCBzaXplKCkge1xyXG4gICAgbGV0IHNpemUgPSB0aGlzLm5hbWVzcGFjZS5zaXplICsgdGhpcy5yZWV4cG9ydHMuc2l6ZTtcclxuICAgIHRoaXMuZGVwZW5kZW5jaWVzLmZvckVhY2goZGVwID0+IHtcclxuICAgICAgY29uc3QgZCA9IGRlcCgpO1xyXG4gICAgICAvLyBDSlMgLyBpZ25vcmVkIGRlcGVuZGVuY2llcyB3b24ndCBleGlzdCAoIzcxNylcclxuICAgICAgaWYgKGQgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICBzaXplICs9IGQuc2l6ZTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHNpemU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBOb3RlIHRoYXQgdGhpcyBkb2VzIG5vdCBjaGVjayBleHBsaWNpdGx5IHJlLWV4cG9ydGVkIG5hbWVzIGZvciBleGlzdGVuY2VcclxuICAgKiBpbiB0aGUgYmFzZSBuYW1lc3BhY2UsIGJ1dCBpdCB3aWxsIGV4cGFuZCBhbGwgYGV4cG9ydCAqIGZyb20gJy4uLidgIGV4cG9ydHNcclxuICAgKiBpZiBub3QgZm91bmQgaW4gdGhlIGV4cGxpY2l0IG5hbWVzcGFjZS5cclxuICAgKiBAcGFyYW0gIHtzdHJpbmd9ICBuYW1lXHJcbiAgICogQHJldHVybiB7Qm9vbGVhbn0gdHJ1ZSBpZiBgbmFtZWAgaXMgZXhwb3J0ZWQgYnkgdGhpcyBtb2R1bGUuXHJcbiAgICovXHJcbiAgaGFzKG5hbWUpIHtcclxuICAgIGlmICh0aGlzLm5hbWVzcGFjZS5oYXMobmFtZSkpIHJldHVybiB0cnVlO1xyXG4gICAgaWYgKHRoaXMucmVleHBvcnRzLmhhcyhuYW1lKSkgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgLy8gZGVmYXVsdCBleHBvcnRzIG11c3QgYmUgZXhwbGljaXRseSByZS1leHBvcnRlZCAoIzMyOClcclxuICAgIGlmIChuYW1lICE9PSAnZGVmYXVsdCcpIHtcclxuICAgICAgZm9yIChjb25zdCBkZXAgb2YgdGhpcy5kZXBlbmRlbmNpZXMpIHtcclxuICAgICAgICBjb25zdCBpbm5lck1hcCA9IGRlcCgpO1xyXG5cclxuICAgICAgICAvLyB0b2RvOiByZXBvcnQgYXMgdW5yZXNvbHZlZD9cclxuICAgICAgICBpZiAoIWlubmVyTWFwKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgaWYgKGlubmVyTWFwLmhhcyhuYW1lKSkgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBlbnN1cmUgdGhhdCBpbXBvcnRlZCBuYW1lIGZ1bGx5IHJlc29sdmVzLlxyXG4gICAqIEBwYXJhbSAge3N0cmluZ30gbmFtZVxyXG4gICAqIEByZXR1cm4ge3sgZm91bmQ6IGJvb2xlYW4sIHBhdGg6IEV4cG9ydE1hcFtdIH19XHJcbiAgICovXHJcbiAgaGFzRGVlcChuYW1lKSB7XHJcbiAgICBpZiAodGhpcy5uYW1lc3BhY2UuaGFzKG5hbWUpKSByZXR1cm4geyBmb3VuZDogdHJ1ZSwgcGF0aDogW3RoaXNdIH07XHJcblxyXG4gICAgaWYgKHRoaXMucmVleHBvcnRzLmhhcyhuYW1lKSkge1xyXG4gICAgICBjb25zdCByZWV4cG9ydHMgPSB0aGlzLnJlZXhwb3J0cy5nZXQobmFtZSk7XHJcbiAgICAgIGNvbnN0IGltcG9ydGVkID0gcmVleHBvcnRzLmdldEltcG9ydCgpO1xyXG5cclxuICAgICAgLy8gaWYgaW1wb3J0IGlzIGlnbm9yZWQsIHJldHVybiBleHBsaWNpdCAnbnVsbCdcclxuICAgICAgaWYgKGltcG9ydGVkID09IG51bGwpIHJldHVybiB7IGZvdW5kOiB0cnVlLCBwYXRoOiBbdGhpc10gfTtcclxuXHJcbiAgICAgIC8vIHNhZmVndWFyZCBhZ2FpbnN0IGN5Y2xlcywgb25seSBpZiBuYW1lIG1hdGNoZXNcclxuICAgICAgaWYgKGltcG9ydGVkLnBhdGggPT09IHRoaXMucGF0aCAmJiByZWV4cG9ydHMubG9jYWwgPT09IG5hbWUpIHtcclxuICAgICAgICByZXR1cm4geyBmb3VuZDogZmFsc2UsIHBhdGg6IFt0aGlzXSB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBkZWVwID0gaW1wb3J0ZWQuaGFzRGVlcChyZWV4cG9ydHMubG9jYWwpO1xyXG4gICAgICBkZWVwLnBhdGgudW5zaGlmdCh0aGlzKTtcclxuXHJcbiAgICAgIHJldHVybiBkZWVwO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBkZWZhdWx0IGV4cG9ydHMgbXVzdCBiZSBleHBsaWNpdGx5IHJlLWV4cG9ydGVkICgjMzI4KVxyXG4gICAgaWYgKG5hbWUgIT09ICdkZWZhdWx0Jykge1xyXG4gICAgICBmb3IgKGNvbnN0IGRlcCBvZiB0aGlzLmRlcGVuZGVuY2llcykge1xyXG4gICAgICAgIGNvbnN0IGlubmVyTWFwID0gZGVwKCk7XHJcbiAgICAgICAgaWYgKGlubmVyTWFwID09IG51bGwpIHJldHVybiB7IGZvdW5kOiB0cnVlLCBwYXRoOiBbdGhpc10gfTtcclxuICAgICAgICAvLyB0b2RvOiByZXBvcnQgYXMgdW5yZXNvbHZlZD9cclxuICAgICAgICBpZiAoIWlubmVyTWFwKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgLy8gc2FmZWd1YXJkIGFnYWluc3QgY3ljbGVzXHJcbiAgICAgICAgaWYgKGlubmVyTWFwLnBhdGggPT09IHRoaXMucGF0aCkgY29udGludWU7XHJcblxyXG4gICAgICAgIGNvbnN0IGlubmVyVmFsdWUgPSBpbm5lck1hcC5oYXNEZWVwKG5hbWUpO1xyXG4gICAgICAgIGlmIChpbm5lclZhbHVlLmZvdW5kKSB7XHJcbiAgICAgICAgICBpbm5lclZhbHVlLnBhdGgudW5zaGlmdCh0aGlzKTtcclxuICAgICAgICAgIHJldHVybiBpbm5lclZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7IGZvdW5kOiBmYWxzZSwgcGF0aDogW3RoaXNdIH07XHJcbiAgfVxyXG5cclxuICBnZXQobmFtZSkge1xyXG4gICAgaWYgKHRoaXMubmFtZXNwYWNlLmhhcyhuYW1lKSkgcmV0dXJuIHRoaXMubmFtZXNwYWNlLmdldChuYW1lKTtcclxuXHJcbiAgICBpZiAodGhpcy5yZWV4cG9ydHMuaGFzKG5hbWUpKSB7XHJcbiAgICAgIGNvbnN0IHJlZXhwb3J0cyA9IHRoaXMucmVleHBvcnRzLmdldChuYW1lKTtcclxuICAgICAgY29uc3QgaW1wb3J0ZWQgPSByZWV4cG9ydHMuZ2V0SW1wb3J0KCk7XHJcblxyXG4gICAgICAvLyBpZiBpbXBvcnQgaXMgaWdub3JlZCwgcmV0dXJuIGV4cGxpY2l0ICdudWxsJ1xyXG4gICAgICBpZiAoaW1wb3J0ZWQgPT0gbnVsbCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAvLyBzYWZlZ3VhcmQgYWdhaW5zdCBjeWNsZXMsIG9ubHkgaWYgbmFtZSBtYXRjaGVzXHJcbiAgICAgIGlmIChpbXBvcnRlZC5wYXRoID09PSB0aGlzLnBhdGggJiYgcmVleHBvcnRzLmxvY2FsID09PSBuYW1lKSByZXR1cm4gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgcmV0dXJuIGltcG9ydGVkLmdldChyZWV4cG9ydHMubG9jYWwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGRlZmF1bHQgZXhwb3J0cyBtdXN0IGJlIGV4cGxpY2l0bHkgcmUtZXhwb3J0ZWQgKCMzMjgpXHJcbiAgICBpZiAobmFtZSAhPT0gJ2RlZmF1bHQnKSB7XHJcbiAgICAgIGZvciAoY29uc3QgZGVwIG9mIHRoaXMuZGVwZW5kZW5jaWVzKSB7XHJcbiAgICAgICAgY29uc3QgaW5uZXJNYXAgPSBkZXAoKTtcclxuICAgICAgICAvLyB0b2RvOiByZXBvcnQgYXMgdW5yZXNvbHZlZD9cclxuICAgICAgICBpZiAoIWlubmVyTWFwKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgLy8gc2FmZWd1YXJkIGFnYWluc3QgY3ljbGVzXHJcbiAgICAgICAgaWYgKGlubmVyTWFwLnBhdGggPT09IHRoaXMucGF0aCkgY29udGludWU7XHJcblxyXG4gICAgICAgIGNvbnN0IGlubmVyVmFsdWUgPSBpbm5lck1hcC5nZXQobmFtZSk7XHJcbiAgICAgICAgaWYgKGlubmVyVmFsdWUgIT09IHVuZGVmaW5lZCkgcmV0dXJuIGlubmVyVmFsdWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgZm9yRWFjaChjYWxsYmFjaywgdGhpc0FyZykge1xyXG4gICAgdGhpcy5uYW1lc3BhY2UuZm9yRWFjaCgodiwgbikgPT5cclxuICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2LCBuLCB0aGlzKSk7XHJcblxyXG4gICAgdGhpcy5yZWV4cG9ydHMuZm9yRWFjaCgocmVleHBvcnRzLCBuYW1lKSA9PiB7XHJcbiAgICAgIGNvbnN0IHJlZXhwb3J0ZWQgPSByZWV4cG9ydHMuZ2V0SW1wb3J0KCk7XHJcbiAgICAgIC8vIGNhbid0IGxvb2sgdXAgbWV0YSBmb3IgaWdub3JlZCByZS1leHBvcnRzICgjMzQ4KVxyXG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHJlZXhwb3J0ZWQgJiYgcmVleHBvcnRlZC5nZXQocmVleHBvcnRzLmxvY2FsKSwgbmFtZSwgdGhpcyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmRlcGVuZGVuY2llcy5mb3JFYWNoKGRlcCA9PiB7XHJcbiAgICAgIGNvbnN0IGQgPSBkZXAoKTtcclxuICAgICAgLy8gQ0pTIC8gaWdub3JlZCBkZXBlbmRlbmNpZXMgd29uJ3QgZXhpc3QgKCM3MTcpXHJcbiAgICAgIGlmIChkID09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICAgIGQuZm9yRWFjaCgodiwgbikgPT5cclxuICAgICAgICBuICE9PSAnZGVmYXVsdCcgJiYgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2LCBuLCB0aGlzKSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vIHRvZG86IGtleXMsIHZhbHVlcywgZW50cmllcz9cclxuXHJcbiAgcmVwb3J0RXJyb3JzKGNvbnRleHQsIGRlY2xhcmF0aW9uKSB7XHJcbiAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgIG5vZGU6IGRlY2xhcmF0aW9uLnNvdXJjZSxcclxuICAgICAgbWVzc2FnZTogYFBhcnNlIGVycm9ycyBpbiBpbXBvcnRlZCBtb2R1bGUgJyR7ZGVjbGFyYXRpb24uc291cmNlLnZhbHVlfSc6IGAgK1xyXG4gICAgICAgICAgICAgICAgICBgJHt0aGlzLmVycm9yc1xyXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoZSA9PiBgJHtlLm1lc3NhZ2V9ICgke2UubGluZU51bWJlcn06JHtlLmNvbHVtbn0pYClcclxuICAgICAgICAgICAgICAgICAgICAuam9pbignLCAnKX1gLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogcGFyc2UgZG9jcyBmcm9tIHRoZSBmaXJzdCBub2RlIHRoYXQgaGFzIGxlYWRpbmcgY29tbWVudHNcclxuICovXHJcbmZ1bmN0aW9uIGNhcHR1cmVEb2Moc291cmNlLCBkb2NTdHlsZVBhcnNlcnMsIC4uLm5vZGVzKSB7XHJcbiAgY29uc3QgbWV0YWRhdGEgPSB7fTtcclxuXHJcbiAgLy8gJ3NvbWUnIHNob3J0LWNpcmN1aXRzIG9uIGZpcnN0ICd0cnVlJ1xyXG4gIG5vZGVzLnNvbWUobiA9PiB7XHJcbiAgICB0cnkge1xyXG5cclxuICAgICAgbGV0IGxlYWRpbmdDb21tZW50cztcclxuXHJcbiAgICAgIC8vIG4ubGVhZGluZ0NvbW1lbnRzIGlzIGxlZ2FjeSBgYXR0YWNoQ29tbWVudHNgIGJlaGF2aW9yXHJcbiAgICAgIGlmICgnbGVhZGluZ0NvbW1lbnRzJyBpbiBuKSB7XHJcbiAgICAgICAgbGVhZGluZ0NvbW1lbnRzID0gbi5sZWFkaW5nQ29tbWVudHM7XHJcbiAgICAgIH0gZWxzZSBpZiAobi5yYW5nZSkge1xyXG4gICAgICAgIGxlYWRpbmdDb21tZW50cyA9IHNvdXJjZS5nZXRDb21tZW50c0JlZm9yZShuKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFsZWFkaW5nQ29tbWVudHMgfHwgbGVhZGluZ0NvbW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgZm9yIChjb25zdCBuYW1lIGluIGRvY1N0eWxlUGFyc2Vycykge1xyXG4gICAgICAgIGNvbnN0IGRvYyA9IGRvY1N0eWxlUGFyc2Vyc1tuYW1lXShsZWFkaW5nQ29tbWVudHMpO1xyXG4gICAgICAgIGlmIChkb2MpIHtcclxuICAgICAgICAgIG1ldGFkYXRhLmRvYyA9IGRvYztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG1ldGFkYXRhO1xyXG59XHJcblxyXG5jb25zdCBhdmFpbGFibGVEb2NTdHlsZVBhcnNlcnMgPSB7XHJcbiAganNkb2M6IGNhcHR1cmVKc0RvYyxcclxuICB0b21kb2M6IGNhcHR1cmVUb21Eb2MsXHJcbn07XHJcblxyXG4vKipcclxuICogcGFyc2UgSlNEb2MgZnJvbSBsZWFkaW5nIGNvbW1lbnRzXHJcbiAqIEBwYXJhbSB7b2JqZWN0W119IGNvbW1lbnRzXHJcbiAqIEByZXR1cm4ge3sgZG9jOiBvYmplY3QgfX1cclxuICovXHJcbmZ1bmN0aW9uIGNhcHR1cmVKc0RvYyhjb21tZW50cykge1xyXG4gIGxldCBkb2M7XHJcblxyXG4gIC8vIGNhcHR1cmUgWFNEb2NcclxuICBjb21tZW50cy5mb3JFYWNoKGNvbW1lbnQgPT4ge1xyXG4gICAgLy8gc2tpcCBub24tYmxvY2sgY29tbWVudHNcclxuICAgIGlmIChjb21tZW50LnR5cGUgIT09ICdCbG9jaycpIHJldHVybjtcclxuICAgIHRyeSB7XHJcbiAgICAgIGRvYyA9IGRvY3RyaW5lLnBhcnNlKGNvbW1lbnQudmFsdWUsIHsgdW53cmFwOiB0cnVlIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIC8qIGRvbid0IGNhcmUsIGZvciBub3c/IG1heWJlIGFkZCB0byBgZXJyb3JzP2AgKi9cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIGRvYztcclxufVxyXG5cclxuLyoqXHJcbiAgKiBwYXJzZSBUb21Eb2Mgc2VjdGlvbiBmcm9tIGNvbW1lbnRzXHJcbiAgKi9cclxuZnVuY3Rpb24gY2FwdHVyZVRvbURvYyhjb21tZW50cykge1xyXG4gIC8vIGNvbGxlY3QgbGluZXMgdXAgdG8gZmlyc3QgcGFyYWdyYXBoIGJyZWFrXHJcbiAgY29uc3QgbGluZXMgPSBbXTtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjb25zdCBjb21tZW50ID0gY29tbWVudHNbaV07XHJcbiAgICBpZiAoY29tbWVudC52YWx1ZS5tYXRjaCgvXlxccyokLykpIGJyZWFrO1xyXG4gICAgbGluZXMucHVzaChjb21tZW50LnZhbHVlLnRyaW0oKSk7XHJcbiAgfVxyXG5cclxuICAvLyByZXR1cm4gZG9jdHJpbmUtbGlrZSBvYmplY3RcclxuICBjb25zdCBzdGF0dXNNYXRjaCA9IGxpbmVzLmpvaW4oJyAnKS5tYXRjaCgvXihQdWJsaWN8SW50ZXJuYWx8RGVwcmVjYXRlZCk6XFxzKiguKykvKTtcclxuICBpZiAoc3RhdHVzTWF0Y2gpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGRlc2NyaXB0aW9uOiBzdGF0dXNNYXRjaFsyXSxcclxuICAgICAgdGFnczogW3tcclxuICAgICAgICB0aXRsZTogc3RhdHVzTWF0Y2hbMV0udG9Mb3dlckNhc2UoKSxcclxuICAgICAgICBkZXNjcmlwdGlvbjogc3RhdHVzTWF0Y2hbMl0sXHJcbiAgICAgIH1dLFxyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IHN1cHBvcnRlZEltcG9ydFR5cGVzID0gbmV3IFNldChbJ0ltcG9ydERlZmF1bHRTcGVjaWZpZXInLCAnSW1wb3J0TmFtZXNwYWNlU3BlY2lmaWVyJ10pO1xyXG5cclxuRXhwb3J0TWFwLmdldCA9IGZ1bmN0aW9uIChzb3VyY2UsIGNvbnRleHQpIHtcclxuICBjb25zdCBwYXRoID0gcmVzb2x2ZShzb3VyY2UsIGNvbnRleHQpO1xyXG4gIGlmIChwYXRoID09IG51bGwpIHJldHVybiBudWxsO1xyXG5cclxuICByZXR1cm4gRXhwb3J0TWFwLmZvcihjaGlsZENvbnRleHQocGF0aCwgY29udGV4dCkpO1xyXG59O1xyXG5cclxuRXhwb3J0TWFwLmZvciA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XHJcbiAgY29uc3QgeyBwYXRoIH0gPSBjb250ZXh0O1xyXG5cclxuICBjb25zdCBjYWNoZUtleSA9IGhhc2hPYmplY3QoY29udGV4dCkuZGlnZXN0KCdoZXgnKTtcclxuICBsZXQgZXhwb3J0TWFwID0gZXhwb3J0Q2FjaGUuZ2V0KGNhY2hlS2V5KTtcclxuXHJcbiAgLy8gcmV0dXJuIGNhY2hlZCBpZ25vcmVcclxuICBpZiAoZXhwb3J0TWFwID09PSBudWxsKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyhwYXRoKTtcclxuICBpZiAoZXhwb3J0TWFwICE9IG51bGwpIHtcclxuICAgIC8vIGRhdGUgZXF1YWxpdHkgY2hlY2tcclxuICAgIGlmIChleHBvcnRNYXAubXRpbWUgLSBzdGF0cy5tdGltZSA9PT0gMCkge1xyXG4gICAgICByZXR1cm4gZXhwb3J0TWFwO1xyXG4gICAgfVxyXG4gICAgLy8gZnV0dXJlOiBjaGVjayBjb250ZW50IGVxdWFsaXR5P1xyXG4gIH1cclxuXHJcbiAgLy8gY2hlY2sgdmFsaWQgZXh0ZW5zaW9ucyBmaXJzdFxyXG4gIGlmICghaGFzVmFsaWRFeHRlbnNpb24ocGF0aCwgY29udGV4dCkpIHtcclxuICAgIGV4cG9ydENhY2hlLnNldChjYWNoZUtleSwgbnVsbCk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIC8vIGNoZWNrIGZvciBhbmQgY2FjaGUgaWdub3JlXHJcbiAgaWYgKGlzSWdub3JlZChwYXRoLCBjb250ZXh0KSkge1xyXG4gICAgbG9nKCdpZ25vcmVkIHBhdGggZHVlIHRvIGlnbm9yZSBzZXR0aW5nczonLCBwYXRoKTtcclxuICAgIGV4cG9ydENhY2hlLnNldChjYWNoZUtleSwgbnVsbCk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMocGF0aCwgeyBlbmNvZGluZzogJ3V0ZjgnIH0pO1xyXG5cclxuICAvLyBjaGVjayBmb3IgYW5kIGNhY2hlIHVuYW1iaWd1b3VzIG1vZHVsZXNcclxuICBpZiAoIXVuYW1iaWd1b3VzLnRlc3QoY29udGVudCkpIHtcclxuICAgIGxvZygnaWdub3JlZCBwYXRoIGR1ZSB0byB1bmFtYmlndW91cyByZWdleDonLCBwYXRoKTtcclxuICAgIGV4cG9ydENhY2hlLnNldChjYWNoZUtleSwgbnVsbCk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIGxvZygnY2FjaGUgbWlzcycsIGNhY2hlS2V5LCAnZm9yIHBhdGgnLCBwYXRoKTtcclxuICBleHBvcnRNYXAgPSBFeHBvcnRNYXAucGFyc2UocGF0aCwgY29udGVudCwgY29udGV4dCk7XHJcblxyXG4gIC8vIGFtYmlndW91cyBtb2R1bGVzIHJldHVybiBudWxsXHJcbiAgaWYgKGV4cG9ydE1hcCA9PSBudWxsKSB7XHJcbiAgICBsb2coJ2lnbm9yZWQgcGF0aCBkdWUgdG8gYW1iaWd1b3VzIHBhcnNlOicsIHBhdGgpO1xyXG4gICAgZXhwb3J0Q2FjaGUuc2V0KGNhY2hlS2V5LCBudWxsKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgZXhwb3J0TWFwLm10aW1lID0gc3RhdHMubXRpbWU7XHJcblxyXG4gIGV4cG9ydENhY2hlLnNldChjYWNoZUtleSwgZXhwb3J0TWFwKTtcclxuICByZXR1cm4gZXhwb3J0TWFwO1xyXG59O1xyXG5cclxuXHJcbkV4cG9ydE1hcC5wYXJzZSA9IGZ1bmN0aW9uIChwYXRoLCBjb250ZW50LCBjb250ZXh0KSB7XHJcbiAgY29uc3QgbSA9IG5ldyBFeHBvcnRNYXAocGF0aCk7XHJcbiAgY29uc3QgaXNFc01vZHVsZUludGVyb3BUcnVlID0gaXNFc01vZHVsZUludGVyb3AoKTtcclxuXHJcbiAgbGV0IGFzdDtcclxuICBsZXQgdmlzaXRvcktleXM7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlKHBhdGgsIGNvbnRlbnQsIGNvbnRleHQpO1xyXG4gICAgYXN0ID0gcmVzdWx0LmFzdDtcclxuICAgIHZpc2l0b3JLZXlzID0gcmVzdWx0LnZpc2l0b3JLZXlzO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgbS5lcnJvcnMucHVzaChlcnIpO1xyXG4gICAgcmV0dXJuIG07IC8vIGNhbid0IGNvbnRpbnVlXHJcbiAgfVxyXG5cclxuICBtLnZpc2l0b3JLZXlzID0gdmlzaXRvcktleXM7XHJcblxyXG4gIGxldCBoYXNEeW5hbWljSW1wb3J0cyA9IGZhbHNlO1xyXG5cclxuICBmdW5jdGlvbiBwcm9jZXNzRHluYW1pY0ltcG9ydChzb3VyY2UpIHtcclxuICAgIGhhc0R5bmFtaWNJbXBvcnRzID0gdHJ1ZTtcclxuICAgIGlmIChzb3VyY2UudHlwZSAhPT0gJ0xpdGVyYWwnKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgY29uc3QgcCA9IHJlbW90ZVBhdGgoc291cmNlLnZhbHVlKTtcclxuICAgIGlmIChwID09IG51bGwpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBjb25zdCBpbXBvcnRlZFNwZWNpZmllcnMgPSBuZXcgU2V0KCk7XHJcbiAgICBpbXBvcnRlZFNwZWNpZmllcnMuYWRkKCdJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXInKTtcclxuICAgIGNvbnN0IGdldHRlciA9IHRodW5rRm9yKHAsIGNvbnRleHQpO1xyXG4gICAgbS5pbXBvcnRzLnNldChwLCB7XHJcbiAgICAgIGdldHRlcixcclxuICAgICAgZGVjbGFyYXRpb25zOiBuZXcgU2V0KFt7XHJcbiAgICAgICAgc291cmNlOiB7XHJcbiAgICAgICAgLy8gY2FwdHVyaW5nIGFjdHVhbCBub2RlIHJlZmVyZW5jZSBob2xkcyBmdWxsIEFTVCBpbiBtZW1vcnkhXHJcbiAgICAgICAgICB2YWx1ZTogc291cmNlLnZhbHVlLFxyXG4gICAgICAgICAgbG9jOiBzb3VyY2UubG9jLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW1wb3J0ZWRTcGVjaWZpZXJzLFxyXG4gICAgICAgIGR5bmFtaWM6IHRydWUsXHJcbiAgICAgIH1dKSxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgdmlzaXQoYXN0LCB2aXNpdG9yS2V5cywge1xyXG4gICAgSW1wb3J0RXhwcmVzc2lvbihub2RlKSB7XHJcbiAgICAgIHByb2Nlc3NEeW5hbWljSW1wb3J0KG5vZGUuc291cmNlKTtcclxuICAgIH0sXHJcbiAgICBDYWxsRXhwcmVzc2lvbihub2RlKSB7XHJcbiAgICAgIGlmIChub2RlLmNhbGxlZS50eXBlID09PSAnSW1wb3J0Jykge1xyXG4gICAgICAgIHByb2Nlc3NEeW5hbWljSW1wb3J0KG5vZGUuYXJndW1lbnRzWzBdKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgY29uc3QgdW5hbWJpZ3VvdXNseUVTTSA9IHVuYW1iaWd1b3VzLmlzTW9kdWxlKGFzdCk7XHJcbiAgaWYgKCF1bmFtYmlndW91c2x5RVNNICYmICFoYXNEeW5hbWljSW1wb3J0cykgcmV0dXJuIG51bGw7XHJcblxyXG4gIGNvbnN0IGRvY3N0eWxlID0gKGNvbnRleHQuc2V0dGluZ3MgJiYgY29udGV4dC5zZXR0aW5nc1snaW1wb3J0L2RvY3N0eWxlJ10pIHx8IFsnanNkb2MnXTtcclxuICBjb25zdCBkb2NTdHlsZVBhcnNlcnMgPSB7fTtcclxuICBkb2NzdHlsZS5mb3JFYWNoKHN0eWxlID0+IHtcclxuICAgIGRvY1N0eWxlUGFyc2Vyc1tzdHlsZV0gPSBhdmFpbGFibGVEb2NTdHlsZVBhcnNlcnNbc3R5bGVdO1xyXG4gIH0pO1xyXG5cclxuICAvLyBhdHRlbXB0IHRvIGNvbGxlY3QgbW9kdWxlIGRvY1xyXG4gIGlmIChhc3QuY29tbWVudHMpIHtcclxuICAgIGFzdC5jb21tZW50cy5zb21lKGMgPT4ge1xyXG4gICAgICBpZiAoYy50eXBlICE9PSAnQmxvY2snKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZG9jID0gZG9jdHJpbmUucGFyc2UoYy52YWx1ZSwgeyB1bndyYXA6IHRydWUgfSk7XHJcbiAgICAgICAgaWYgKGRvYy50YWdzLnNvbWUodCA9PiB0LnRpdGxlID09PSAnbW9kdWxlJykpIHtcclxuICAgICAgICAgIG0uZG9jID0gZG9jO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnIpIHsgLyogaWdub3JlICovIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBuYW1lc3BhY2VzID0gbmV3IE1hcCgpO1xyXG5cclxuICBmdW5jdGlvbiByZW1vdGVQYXRoKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gcmVzb2x2ZS5yZWxhdGl2ZSh2YWx1ZSwgcGF0aCwgY29udGV4dC5zZXR0aW5ncyk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZXNvbHZlSW1wb3J0KHZhbHVlKSB7XHJcbiAgICBjb25zdCBycCA9IHJlbW90ZVBhdGgodmFsdWUpO1xyXG4gICAgaWYgKHJwID09IG51bGwpIHJldHVybiBudWxsO1xyXG4gICAgcmV0dXJuIEV4cG9ydE1hcC5mb3IoY2hpbGRDb250ZXh0KHJwLCBjb250ZXh0KSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXROYW1lc3BhY2UoaWRlbnRpZmllcikge1xyXG4gICAgaWYgKCFuYW1lc3BhY2VzLmhhcyhpZGVudGlmaWVyLm5hbWUpKSByZXR1cm47XHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIHJlc29sdmVJbXBvcnQobmFtZXNwYWNlcy5nZXQoaWRlbnRpZmllci5uYW1lKSk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYWRkTmFtZXNwYWNlKG9iamVjdCwgaWRlbnRpZmllcikge1xyXG4gICAgY29uc3QgbnNmbiA9IGdldE5hbWVzcGFjZShpZGVudGlmaWVyKTtcclxuICAgIGlmIChuc2ZuKSB7XHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsICduYW1lc3BhY2UnLCB7IGdldDogbnNmbiB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb2JqZWN0O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcHJvY2Vzc1NwZWNpZmllcihzLCBuLCBtKSB7XHJcbiAgICBjb25zdCBuc291cmNlID0gbi5zb3VyY2UgJiYgbi5zb3VyY2UudmFsdWU7XHJcbiAgICBjb25zdCBleHBvcnRNZXRhID0ge307XHJcbiAgICBsZXQgbG9jYWw7XHJcblxyXG4gICAgc3dpdGNoIChzLnR5cGUpIHtcclxuICAgIGNhc2UgJ0V4cG9ydERlZmF1bHRTcGVjaWZpZXInOlxyXG4gICAgICBpZiAoIW5zb3VyY2UpIHJldHVybjtcclxuICAgICAgbG9jYWwgPSAnZGVmYXVsdCc7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnRXhwb3J0TmFtZXNwYWNlU3BlY2lmaWVyJzpcclxuICAgICAgbS5uYW1lc3BhY2Uuc2V0KHMuZXhwb3J0ZWQubmFtZSwgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydE1ldGEsICduYW1lc3BhY2UnLCB7XHJcbiAgICAgICAgZ2V0KCkgeyByZXR1cm4gcmVzb2x2ZUltcG9ydChuc291cmNlKTsgfSxcclxuICAgICAgfSkpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICBjYXNlICdFeHBvcnRBbGxEZWNsYXJhdGlvbic6XHJcbiAgICAgIG0ubmFtZXNwYWNlLnNldChzLmV4cG9ydGVkLm5hbWUgfHwgcy5leHBvcnRlZC52YWx1ZSwgYWRkTmFtZXNwYWNlKGV4cG9ydE1ldGEsIHMuc291cmNlLnZhbHVlKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIGNhc2UgJ0V4cG9ydFNwZWNpZmllcic6XHJcbiAgICAgIGlmICghbi5zb3VyY2UpIHtcclxuICAgICAgICBtLm5hbWVzcGFjZS5zZXQocy5leHBvcnRlZC5uYW1lIHx8IHMuZXhwb3J0ZWQudmFsdWUsIGFkZE5hbWVzcGFjZShleHBvcnRNZXRhLCBzLmxvY2FsKSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIGVsc2UgZmFsbHMgdGhyb3VnaFxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgbG9jYWwgPSBzLmxvY2FsLm5hbWU7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRvZG86IEpTRG9jXHJcbiAgICBtLnJlZXhwb3J0cy5zZXQocy5leHBvcnRlZC5uYW1lLCB7IGxvY2FsLCBnZXRJbXBvcnQ6ICgpID0+IHJlc29sdmVJbXBvcnQobnNvdXJjZSkgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjYXB0dXJlRGVwZW5kZW5jeVdpdGhTcGVjaWZpZXJzKG4pIHtcclxuICAgIC8vIGltcG9ydCB0eXBlIHsgRm9vIH0gKFRTIGFuZCBGbG93KTsgaW1wb3J0IHR5cGVvZiB7IEZvbyB9IChGbG93KVxyXG4gICAgY29uc3QgZGVjbGFyYXRpb25Jc1R5cGUgPSBuLmltcG9ydEtpbmQgPT09ICd0eXBlJyB8fCBuLmltcG9ydEtpbmQgPT09ICd0eXBlb2YnO1xyXG4gICAgLy8gaW1wb3J0ICcuL2Zvbycgb3IgaW1wb3J0IHt9IGZyb20gJy4vZm9vJyAoYm90aCAwIHNwZWNpZmllcnMpIGlzIGEgc2lkZSBlZmZlY3QgYW5kXHJcbiAgICAvLyBzaG91bGRuJ3QgYmUgY29uc2lkZXJlZCB0byBiZSBqdXN0IGltcG9ydGluZyB0eXBlc1xyXG4gICAgbGV0IHNwZWNpZmllcnNPbmx5SW1wb3J0aW5nVHlwZXMgPSBuLnNwZWNpZmllcnMubGVuZ3RoID4gMDtcclxuICAgIGNvbnN0IGltcG9ydGVkU3BlY2lmaWVycyA9IG5ldyBTZXQoKTtcclxuICAgIG4uc3BlY2lmaWVycy5mb3JFYWNoKHNwZWNpZmllciA9PiB7XHJcbiAgICAgIGlmIChzcGVjaWZpZXIudHlwZSA9PT0gJ0ltcG9ydFNwZWNpZmllcicpIHtcclxuICAgICAgICBpbXBvcnRlZFNwZWNpZmllcnMuYWRkKHNwZWNpZmllci5pbXBvcnRlZC5uYW1lIHx8IHNwZWNpZmllci5pbXBvcnRlZC52YWx1ZSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydGVkSW1wb3J0VHlwZXMuaGFzKHNwZWNpZmllci50eXBlKSkge1xyXG4gICAgICAgIGltcG9ydGVkU3BlY2lmaWVycy5hZGQoc3BlY2lmaWVyLnR5cGUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBpbXBvcnQgeyB0eXBlIEZvbyB9IChGbG93KTsgaW1wb3J0IHsgdHlwZW9mIEZvbyB9IChGbG93KVxyXG4gICAgICBzcGVjaWZpZXJzT25seUltcG9ydGluZ1R5cGVzID0gc3BlY2lmaWVyc09ubHlJbXBvcnRpbmdUeXBlc1xyXG4gICAgICAgICYmIChzcGVjaWZpZXIuaW1wb3J0S2luZCA9PT0gJ3R5cGUnIHx8IHNwZWNpZmllci5pbXBvcnRLaW5kID09PSAndHlwZW9mJyk7XHJcbiAgICB9KTtcclxuICAgIGNhcHR1cmVEZXBlbmRlbmN5KG4sIGRlY2xhcmF0aW9uSXNUeXBlIHx8IHNwZWNpZmllcnNPbmx5SW1wb3J0aW5nVHlwZXMsIGltcG9ydGVkU3BlY2lmaWVycyk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjYXB0dXJlRGVwZW5kZW5jeSh7IHNvdXJjZSB9LCBpc09ubHlJbXBvcnRpbmdUeXBlcywgaW1wb3J0ZWRTcGVjaWZpZXJzID0gbmV3IFNldCgpKSB7XHJcbiAgICBpZiAoc291cmNlID09IG51bGwpIHJldHVybiBudWxsO1xyXG5cclxuICAgIGNvbnN0IHAgPSByZW1vdGVQYXRoKHNvdXJjZS52YWx1ZSk7XHJcbiAgICBpZiAocCA9PSBudWxsKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICBjb25zdCBkZWNsYXJhdGlvbk1ldGFkYXRhID0ge1xyXG4gICAgICAvLyBjYXB0dXJpbmcgYWN0dWFsIG5vZGUgcmVmZXJlbmNlIGhvbGRzIGZ1bGwgQVNUIGluIG1lbW9yeSFcclxuICAgICAgc291cmNlOiB7IHZhbHVlOiBzb3VyY2UudmFsdWUsIGxvYzogc291cmNlLmxvYyB9LFxyXG4gICAgICBpc09ubHlJbXBvcnRpbmdUeXBlcyxcclxuICAgICAgaW1wb3J0ZWRTcGVjaWZpZXJzLFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBleGlzdGluZyA9IG0uaW1wb3J0cy5nZXQocCk7XHJcbiAgICBpZiAoZXhpc3RpbmcgIT0gbnVsbCkge1xyXG4gICAgICBleGlzdGluZy5kZWNsYXJhdGlvbnMuYWRkKGRlY2xhcmF0aW9uTWV0YWRhdGEpO1xyXG4gICAgICByZXR1cm4gZXhpc3RpbmcuZ2V0dGVyO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGdldHRlciA9IHRodW5rRm9yKHAsIGNvbnRleHQpO1xyXG4gICAgbS5pbXBvcnRzLnNldChwLCB7IGdldHRlciwgZGVjbGFyYXRpb25zOiBuZXcgU2V0KFtkZWNsYXJhdGlvbk1ldGFkYXRhXSkgfSk7XHJcbiAgICByZXR1cm4gZ2V0dGVyO1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgc291cmNlID0gbWFrZVNvdXJjZUNvZGUoY29udGVudCwgYXN0KTtcclxuXHJcbiAgZnVuY3Rpb24gcmVhZFRzQ29uZmlnKGNvbnRleHQpIHtcclxuICAgIGNvbnN0IHRzQ29uZmlnSW5mbyA9IHRzQ29uZmlnTG9hZGVyKHtcclxuICAgICAgY3dkOlxyXG4gICAgICAgIChjb250ZXh0LnBhcnNlck9wdGlvbnMgJiYgY29udGV4dC5wYXJzZXJPcHRpb25zLnRzY29uZmlnUm9vdERpcikgfHxcclxuICAgICAgICBwcm9jZXNzLmN3ZCgpLFxyXG4gICAgICBnZXRFbnY6IChrZXkpID0+IHByb2Nlc3MuZW52W2tleV0sXHJcbiAgICB9KTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGlmICh0c0NvbmZpZ0luZm8udHNDb25maWdQYXRoICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAvLyBQcm9qZWN0cyBub3QgdXNpbmcgVHlwZVNjcmlwdCB3b24ndCBoYXZlIGB0eXBlc2NyaXB0YCBpbnN0YWxsZWQuXHJcbiAgICAgICAgaWYgKCF0cykgeyB0cyA9IHJlcXVpcmUoJ3R5cGVzY3JpcHQnKTsgfSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llc1xyXG4gIFxyXG4gICAgICAgIGNvbnN0IGNvbmZpZ0ZpbGUgPSB0cy5yZWFkQ29uZmlnRmlsZSh0c0NvbmZpZ0luZm8udHNDb25maWdQYXRoLCB0cy5zeXMucmVhZEZpbGUpO1xyXG4gICAgICAgIHJldHVybiB0cy5wYXJzZUpzb25Db25maWdGaWxlQ29udGVudChcclxuICAgICAgICAgIGNvbmZpZ0ZpbGUuY29uZmlnLFxyXG4gICAgICAgICAgdHMuc3lzLFxyXG4gICAgICAgICAgZGlybmFtZSh0c0NvbmZpZ0luZm8udHNDb25maWdQYXRoKSxcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIC8vIENhdGNoIGFueSBlcnJvcnNcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGlzRXNNb2R1bGVJbnRlcm9wKCkge1xyXG4gICAgY29uc3QgY2FjaGVLZXkgPSBoYXNoT2JqZWN0KHtcclxuICAgICAgdHNjb25maWdSb290RGlyOiBjb250ZXh0LnBhcnNlck9wdGlvbnMgJiYgY29udGV4dC5wYXJzZXJPcHRpb25zLnRzY29uZmlnUm9vdERpcixcclxuICAgIH0pLmRpZ2VzdCgnaGV4Jyk7XHJcbiAgICBsZXQgdHNDb25maWcgPSB0c0NvbmZpZ0NhY2hlLmdldChjYWNoZUtleSk7XHJcbiAgICBpZiAodHlwZW9mIHRzQ29uZmlnID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0c0NvbmZpZyA9IHJlYWRUc0NvbmZpZyhjb250ZXh0KTtcclxuICAgICAgdHNDb25maWdDYWNoZS5zZXQoY2FjaGVLZXksIHRzQ29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHNDb25maWcgJiYgdHNDb25maWcub3B0aW9ucyA/IHRzQ29uZmlnLm9wdGlvbnMuZXNNb2R1bGVJbnRlcm9wIDogZmFsc2U7XHJcbiAgfVxyXG5cclxuICBhc3QuYm9keS5mb3JFYWNoKGZ1bmN0aW9uIChuKSB7XHJcbiAgICBpZiAobi50eXBlID09PSAnRXhwb3J0RGVmYXVsdERlY2xhcmF0aW9uJykge1xyXG4gICAgICBjb25zdCBleHBvcnRNZXRhID0gY2FwdHVyZURvYyhzb3VyY2UsIGRvY1N0eWxlUGFyc2Vycywgbik7XHJcbiAgICAgIGlmIChuLmRlY2xhcmF0aW9uLnR5cGUgPT09ICdJZGVudGlmaWVyJykge1xyXG4gICAgICAgIGFkZE5hbWVzcGFjZShleHBvcnRNZXRhLCBuLmRlY2xhcmF0aW9uKTtcclxuICAgICAgfVxyXG4gICAgICBtLm5hbWVzcGFjZS5zZXQoJ2RlZmF1bHQnLCBleHBvcnRNZXRhKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChuLnR5cGUgPT09ICdFeHBvcnRBbGxEZWNsYXJhdGlvbicpIHtcclxuICAgICAgY29uc3QgZ2V0dGVyID0gY2FwdHVyZURlcGVuZGVuY3kobiwgbi5leHBvcnRLaW5kID09PSAndHlwZScpO1xyXG4gICAgICBpZiAoZ2V0dGVyKSBtLmRlcGVuZGVuY2llcy5hZGQoZ2V0dGVyKTtcclxuICAgICAgaWYgKG4uZXhwb3J0ZWQpIHtcclxuICAgICAgICBwcm9jZXNzU3BlY2lmaWVyKG4sIG4uZXhwb3J0ZWQsIG0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjYXB0dXJlIG5hbWVzcGFjZXMgaW4gY2FzZSBvZiBsYXRlciBleHBvcnRcclxuICAgIGlmIChuLnR5cGUgPT09ICdJbXBvcnREZWNsYXJhdGlvbicpIHtcclxuICAgICAgY2FwdHVyZURlcGVuZGVuY3lXaXRoU3BlY2lmaWVycyhuKTtcclxuXHJcbiAgICAgIGNvbnN0IG5zID0gbi5zcGVjaWZpZXJzLmZpbmQocyA9PiBzLnR5cGUgPT09ICdJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXInKTtcclxuICAgICAgaWYgKG5zKSB7XHJcbiAgICAgICAgbmFtZXNwYWNlcy5zZXQobnMubG9jYWwubmFtZSwgbi5zb3VyY2UudmFsdWUpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobi50eXBlID09PSAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbicpIHtcclxuICAgICAgY2FwdHVyZURlcGVuZGVuY3lXaXRoU3BlY2lmaWVycyhuKTtcclxuXHJcbiAgICAgIC8vIGNhcHR1cmUgZGVjbGFyYXRpb25cclxuICAgICAgaWYgKG4uZGVjbGFyYXRpb24gIT0gbnVsbCkge1xyXG4gICAgICAgIHN3aXRjaCAobi5kZWNsYXJhdGlvbi50eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnRnVuY3Rpb25EZWNsYXJhdGlvbic6XHJcbiAgICAgICAgY2FzZSAnQ2xhc3NEZWNsYXJhdGlvbic6XHJcbiAgICAgICAgY2FzZSAnVHlwZUFsaWFzJzogLy8gZmxvd3R5cGUgd2l0aCBiYWJlbC1lc2xpbnQgcGFyc2VyXHJcbiAgICAgICAgY2FzZSAnSW50ZXJmYWNlRGVjbGFyYXRpb24nOlxyXG4gICAgICAgIGNhc2UgJ0RlY2xhcmVGdW5jdGlvbic6XHJcbiAgICAgICAgY2FzZSAnVFNEZWNsYXJlRnVuY3Rpb24nOlxyXG4gICAgICAgIGNhc2UgJ1RTRW51bURlY2xhcmF0aW9uJzpcclxuICAgICAgICBjYXNlICdUU1R5cGVBbGlhc0RlY2xhcmF0aW9uJzpcclxuICAgICAgICBjYXNlICdUU0ludGVyZmFjZURlY2xhcmF0aW9uJzpcclxuICAgICAgICBjYXNlICdUU0Fic3RyYWN0Q2xhc3NEZWNsYXJhdGlvbic6XHJcbiAgICAgICAgY2FzZSAnVFNNb2R1bGVEZWNsYXJhdGlvbic6XHJcbiAgICAgICAgICBtLm5hbWVzcGFjZS5zZXQobi5kZWNsYXJhdGlvbi5pZC5uYW1lLCBjYXB0dXJlRG9jKHNvdXJjZSwgZG9jU3R5bGVQYXJzZXJzLCBuKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdWYXJpYWJsZURlY2xhcmF0aW9uJzpcclxuICAgICAgICAgIG4uZGVjbGFyYXRpb24uZGVjbGFyYXRpb25zLmZvckVhY2goKGQpID0+XHJcbiAgICAgICAgICAgIHJlY3Vyc2l2ZVBhdHRlcm5DYXB0dXJlKGQuaWQsXHJcbiAgICAgICAgICAgICAgaWQgPT4gbS5uYW1lc3BhY2Uuc2V0KGlkLm5hbWUsIGNhcHR1cmVEb2Moc291cmNlLCBkb2NTdHlsZVBhcnNlcnMsIGQsIG4pKSkpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBuLnNwZWNpZmllcnMuZm9yRWFjaCgocykgPT4gcHJvY2Vzc1NwZWNpZmllcihzLCBuLCBtKSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZXhwb3J0cyA9IFsnVFNFeHBvcnRBc3NpZ25tZW50J107XHJcbiAgICBpZiAoaXNFc01vZHVsZUludGVyb3BUcnVlKSB7XHJcbiAgICAgIGV4cG9ydHMucHVzaCgnVFNOYW1lc3BhY2VFeHBvcnREZWNsYXJhdGlvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoaXMgZG9lc24ndCBkZWNsYXJlIGFueXRoaW5nLCBidXQgY2hhbmdlcyB3aGF0J3MgYmVpbmcgZXhwb3J0ZWQuXHJcbiAgICBpZiAoaW5jbHVkZXMoZXhwb3J0cywgbi50eXBlKSkge1xyXG4gICAgICBjb25zdCBleHBvcnRlZE5hbWUgPSBuLnR5cGUgPT09ICdUU05hbWVzcGFjZUV4cG9ydERlY2xhcmF0aW9uJ1xyXG4gICAgICAgID8gKG4uaWQgfHwgbi5uYW1lKS5uYW1lXHJcbiAgICAgICAgOiAobi5leHByZXNzaW9uICYmIG4uZXhwcmVzc2lvbi5uYW1lIHx8IChuLmV4cHJlc3Npb24uaWQgJiYgbi5leHByZXNzaW9uLmlkLm5hbWUpIHx8IG51bGwpO1xyXG4gICAgICBjb25zdCBkZWNsVHlwZXMgPSBbXHJcbiAgICAgICAgJ1ZhcmlhYmxlRGVjbGFyYXRpb24nLFxyXG4gICAgICAgICdDbGFzc0RlY2xhcmF0aW9uJyxcclxuICAgICAgICAnVFNEZWNsYXJlRnVuY3Rpb24nLFxyXG4gICAgICAgICdUU0VudW1EZWNsYXJhdGlvbicsXHJcbiAgICAgICAgJ1RTVHlwZUFsaWFzRGVjbGFyYXRpb24nLFxyXG4gICAgICAgICdUU0ludGVyZmFjZURlY2xhcmF0aW9uJyxcclxuICAgICAgICAnVFNBYnN0cmFjdENsYXNzRGVjbGFyYXRpb24nLFxyXG4gICAgICAgICdUU01vZHVsZURlY2xhcmF0aW9uJyxcclxuICAgICAgXTtcclxuICAgICAgY29uc3QgZXhwb3J0ZWREZWNscyA9IGFzdC5ib2R5LmZpbHRlcigoeyB0eXBlLCBpZCwgZGVjbGFyYXRpb25zIH0pID0+IGluY2x1ZGVzKGRlY2xUeXBlcywgdHlwZSkgJiYgKFxyXG4gICAgICAgIChpZCAmJiBpZC5uYW1lID09PSBleHBvcnRlZE5hbWUpIHx8IChkZWNsYXJhdGlvbnMgJiYgZGVjbGFyYXRpb25zLmZpbmQoKGQpID0+IGQuaWQubmFtZSA9PT0gZXhwb3J0ZWROYW1lKSlcclxuICAgICAgKSk7XHJcbiAgICAgIGlmIChleHBvcnRlZERlY2xzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIC8vIEV4cG9ydCBpcyBub3QgcmVmZXJlbmNpbmcgYW55IGxvY2FsIGRlY2xhcmF0aW9uLCBtdXN0IGJlIHJlLWV4cG9ydGluZ1xyXG4gICAgICAgIG0ubmFtZXNwYWNlLnNldCgnZGVmYXVsdCcsIGNhcHR1cmVEb2Moc291cmNlLCBkb2NTdHlsZVBhcnNlcnMsIG4pKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgaWYgKFxyXG4gICAgICAgIGlzRXNNb2R1bGVJbnRlcm9wVHJ1ZSAvLyBlc01vZHVsZUludGVyb3AgaXMgb24gaW4gdHNjb25maWdcclxuICAgICAgICAmJiAhbS5uYW1lc3BhY2UuaGFzKCdkZWZhdWx0JykgLy8gYW5kIGRlZmF1bHQgaXNuJ3QgYWRkZWQgYWxyZWFkeVxyXG4gICAgICApIHtcclxuICAgICAgICBtLm5hbWVzcGFjZS5zZXQoJ2RlZmF1bHQnLCB7fSk7IC8vIGFkZCBkZWZhdWx0IGV4cG9ydFxyXG4gICAgICB9XHJcbiAgICAgIGV4cG9ydGVkRGVjbHMuZm9yRWFjaCgoZGVjbCkgPT4ge1xyXG4gICAgICAgIGlmIChkZWNsLnR5cGUgPT09ICdUU01vZHVsZURlY2xhcmF0aW9uJykge1xyXG4gICAgICAgICAgaWYgKGRlY2wuYm9keSAmJiBkZWNsLmJvZHkudHlwZSA9PT0gJ1RTTW9kdWxlRGVjbGFyYXRpb24nKSB7XHJcbiAgICAgICAgICAgIG0ubmFtZXNwYWNlLnNldChkZWNsLmJvZHkuaWQubmFtZSwgY2FwdHVyZURvYyhzb3VyY2UsIGRvY1N0eWxlUGFyc2VycywgZGVjbC5ib2R5KSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGRlY2wuYm9keSAmJiBkZWNsLmJvZHkuYm9keSkge1xyXG4gICAgICAgICAgICBkZWNsLmJvZHkuYm9keS5mb3JFYWNoKChtb2R1bGVCbG9ja05vZGUpID0+IHtcclxuICAgICAgICAgICAgICAvLyBFeHBvcnQtYXNzaWdubWVudCBleHBvcnRzIGFsbCBtZW1iZXJzIGluIHRoZSBuYW1lc3BhY2UsXHJcbiAgICAgICAgICAgICAgLy8gZXhwbGljaXRseSBleHBvcnRlZCBvciBub3QuXHJcbiAgICAgICAgICAgICAgY29uc3QgbmFtZXNwYWNlRGVjbCA9IG1vZHVsZUJsb2NrTm9kZS50eXBlID09PSAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbicgP1xyXG4gICAgICAgICAgICAgICAgbW9kdWxlQmxvY2tOb2RlLmRlY2xhcmF0aW9uIDpcclxuICAgICAgICAgICAgICAgIG1vZHVsZUJsb2NrTm9kZTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKCFuYW1lc3BhY2VEZWNsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUeXBlU2NyaXB0IGNhbiBjaGVjayB0aGlzIGZvciB1czsgd2UgbmVlZG4ndFxyXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAobmFtZXNwYWNlRGVjbC50eXBlID09PSAnVmFyaWFibGVEZWNsYXJhdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIG5hbWVzcGFjZURlY2wuZGVjbGFyYXRpb25zLmZvckVhY2goKGQpID0+XHJcbiAgICAgICAgICAgICAgICAgIHJlY3Vyc2l2ZVBhdHRlcm5DYXB0dXJlKGQuaWQsIChpZCkgPT4gbS5uYW1lc3BhY2Uuc2V0KFxyXG4gICAgICAgICAgICAgICAgICAgIGlkLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgY2FwdHVyZURvYyhzb3VyY2UsIGRvY1N0eWxlUGFyc2VycywgZGVjbCwgbmFtZXNwYWNlRGVjbCwgbW9kdWxlQmxvY2tOb2RlKSxcclxuICAgICAgICAgICAgICAgICAgKSksXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBtLm5hbWVzcGFjZS5zZXQoXHJcbiAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZURlY2wuaWQubmFtZSxcclxuICAgICAgICAgICAgICAgICAgY2FwdHVyZURvYyhzb3VyY2UsIGRvY1N0eWxlUGFyc2VycywgbW9kdWxlQmxvY2tOb2RlKSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gRXhwb3J0IGFzIGRlZmF1bHRcclxuICAgICAgICAgIG0ubmFtZXNwYWNlLnNldCgnZGVmYXVsdCcsIGNhcHR1cmVEb2Moc291cmNlLCBkb2NTdHlsZVBhcnNlcnMsIGRlY2wpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBpZiAoXHJcbiAgICBpc0VzTW9kdWxlSW50ZXJvcFRydWUgLy8gZXNNb2R1bGVJbnRlcm9wIGlzIG9uIGluIHRzY29uZmlnXHJcbiAgICAmJiBtLm5hbWVzcGFjZS5zaXplID4gMCAvLyBhbnl0aGluZyBpcyBleHBvcnRlZFxyXG4gICAgJiYgIW0ubmFtZXNwYWNlLmhhcygnZGVmYXVsdCcpIC8vIGFuZCBkZWZhdWx0IGlzbid0IGFkZGVkIGFscmVhZHlcclxuICApIHtcclxuICAgIG0ubmFtZXNwYWNlLnNldCgnZGVmYXVsdCcsIHt9KTsgLy8gYWRkIGRlZmF1bHQgZXhwb3J0XHJcbiAgfVxyXG5cclxuICBpZiAodW5hbWJpZ3VvdXNseUVTTSkge1xyXG4gICAgbS5wYXJzZUdvYWwgPSAnTW9kdWxlJztcclxuICB9XHJcbiAgcmV0dXJuIG07XHJcbn07XHJcblxyXG4vKipcclxuICogVGhlIGNyZWF0aW9uIG9mIHRoaXMgY2xvc3VyZSBpcyBpc29sYXRlZCBmcm9tIG90aGVyIHNjb3Blc1xyXG4gKiB0byBhdm9pZCBvdmVyLXJldGVudGlvbiBvZiB1bnJlbGF0ZWQgdmFyaWFibGVzLCB3aGljaCBoYXNcclxuICogY2F1c2VkIG1lbW9yeSBsZWFrcy4gU2VlICMxMjY2LlxyXG4gKi9cclxuZnVuY3Rpb24gdGh1bmtGb3IocCwgY29udGV4dCkge1xyXG4gIHJldHVybiAoKSA9PiBFeHBvcnRNYXAuZm9yKGNoaWxkQ29udGV4dChwLCBjb250ZXh0KSk7XHJcbn1cclxuXHJcblxyXG4vKipcclxuICogVHJhdmVyc2UgYSBwYXR0ZXJuL2lkZW50aWZpZXIgbm9kZSwgY2FsbGluZyAnY2FsbGJhY2snXHJcbiAqIGZvciBlYWNoIGxlYWYgaWRlbnRpZmllci5cclxuICogQHBhcmFtICB7bm9kZX0gICBwYXR0ZXJuXHJcbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFja1xyXG4gKiBAcmV0dXJuIHt2b2lkfVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlY3Vyc2l2ZVBhdHRlcm5DYXB0dXJlKHBhdHRlcm4sIGNhbGxiYWNrKSB7XHJcbiAgc3dpdGNoIChwYXR0ZXJuLnR5cGUpIHtcclxuICBjYXNlICdJZGVudGlmaWVyJzogLy8gYmFzZSBjYXNlXHJcbiAgICBjYWxsYmFjayhwYXR0ZXJuKTtcclxuICAgIGJyZWFrO1xyXG5cclxuICBjYXNlICdPYmplY3RQYXR0ZXJuJzpcclxuICAgIHBhdHRlcm4ucHJvcGVydGllcy5mb3JFYWNoKHAgPT4ge1xyXG4gICAgICBpZiAocC50eXBlID09PSAnRXhwZXJpbWVudGFsUmVzdFByb3BlcnR5JyB8fCBwLnR5cGUgPT09ICdSZXN0RWxlbWVudCcpIHtcclxuICAgICAgICBjYWxsYmFjayhwLmFyZ3VtZW50KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgcmVjdXJzaXZlUGF0dGVybkNhcHR1cmUocC52YWx1ZSwgY2FsbGJhY2spO1xyXG4gICAgfSk7XHJcbiAgICBicmVhaztcclxuXHJcbiAgY2FzZSAnQXJyYXlQYXR0ZXJuJzpcclxuICAgIHBhdHRlcm4uZWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xyXG4gICAgICBpZiAoZWxlbWVudCA9PSBudWxsKSByZXR1cm47XHJcbiAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICdFeHBlcmltZW50YWxSZXN0UHJvcGVydHknIHx8IGVsZW1lbnQudHlwZSA9PT0gJ1Jlc3RFbGVtZW50Jykge1xyXG4gICAgICAgIGNhbGxiYWNrKGVsZW1lbnQuYXJndW1lbnQpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZShlbGVtZW50LCBjYWxsYmFjayk7XHJcbiAgICB9KTtcclxuICAgIGJyZWFrO1xyXG5cclxuICBjYXNlICdBc3NpZ25tZW50UGF0dGVybic6XHJcbiAgICBjYWxsYmFjayhwYXR0ZXJuLmxlZnQpO1xyXG4gICAgYnJlYWs7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogZG9uJ3QgaG9sZCBmdWxsIGNvbnRleHQgb2JqZWN0IGluIG1lbW9yeSwganVzdCBncmFiIHdoYXQgd2UgbmVlZC5cclxuICovXHJcbmZ1bmN0aW9uIGNoaWxkQ29udGV4dChwYXRoLCBjb250ZXh0KSB7XHJcbiAgY29uc3QgeyBzZXR0aW5ncywgcGFyc2VyT3B0aW9ucywgcGFyc2VyUGF0aCB9ID0gY29udGV4dDtcclxuICByZXR1cm4ge1xyXG4gICAgc2V0dGluZ3MsXHJcbiAgICBwYXJzZXJPcHRpb25zLFxyXG4gICAgcGFyc2VyUGF0aCxcclxuICAgIHBhdGgsXHJcbiAgfTtcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBzb21ldGltZXMgbGVnYWN5IHN1cHBvcnQgaXNuJ3QgX3RoYXRfIGhhcmQuLi4gcmlnaHQ/XHJcbiAqL1xyXG5mdW5jdGlvbiBtYWtlU291cmNlQ29kZSh0ZXh0LCBhc3QpIHtcclxuICBpZiAoU291cmNlQ29kZS5sZW5ndGggPiAxKSB7XHJcbiAgICAvLyBFU0xpbnQgM1xyXG4gICAgcmV0dXJuIG5ldyBTb3VyY2VDb2RlKHRleHQsIGFzdCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIEVTTGludCA0LCA1XHJcbiAgICByZXR1cm4gbmV3IFNvdXJjZUNvZGUoeyB0ZXh0LCBhc3QgfSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==