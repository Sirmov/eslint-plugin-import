'use strict';var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};





var _ExportMap = require('../ExportMap');var _ExportMap2 = _interopRequireDefault(_ExportMap);
var _ignore = require('eslint-module-utils/ignore');
var _resolve = require('eslint-module-utils/resolve');var _resolve2 = _interopRequireDefault(_resolve);
var _visit = require('eslint-module-utils/visit');var _visit2 = _interopRequireDefault(_visit);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);
var _path = require('path');
var _readPkgUp2 = require('eslint-module-utils/readPkgUp');var _readPkgUp3 = _interopRequireDefault(_readPkgUp2);
var _object = require('object.values');var _object2 = _interopRequireDefault(_object);
var _arrayIncludes = require('array-includes');var _arrayIncludes2 = _interopRequireDefault(_arrayIncludes);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}} /**
                                                                                                                                                                                                                                                                                                                                                                                                       * @fileOverview Ensures that modules contain exports and/or all
                                                                                                                                                                                                                                                                                                                                                                                                       * modules are consumed within other modules.
                                                                                                                                                                                                                                                                                                                                                                                                       * @author René Fermann
                                                                                                                                                                                                                                                                                                                                                                                                       */var FileEnumerator = void 0;var listFilesToProcess = void 0;
try {var _require =
  require('eslint/use-at-your-own-risk');FileEnumerator = _require.FileEnumerator;
} catch (e) {
  try {var _require2 =

    require('eslint/lib/cli-engine/file-enumerator'); // has been moved to eslint/lib/cli-engine/file-enumerator in version 6
    FileEnumerator = _require2.FileEnumerator;} catch (e) {
    try {
      // eslint/lib/util/glob-util has been moved to eslint/lib/util/glob-utils with version 5.3
      var _require3 = require('eslint/lib/util/glob-utils'),originalListFilesToProcess = _require3.listFilesToProcess;

      // Prevent passing invalid options (extensions array) to old versions of the function.
      // https://github.com/eslint/eslint/blob/v5.16.0/lib/util/glob-utils.js#L178-L280
      // https://github.com/eslint/eslint/blob/v5.2.0/lib/util/glob-util.js#L174-L269
      listFilesToProcess = function listFilesToProcess(src, extensions) {
        return originalListFilesToProcess(src, {
          extensions: extensions });

      };
    } catch (e) {var _require4 =
      require('eslint/lib/util/glob-util'),_originalListFilesToProcess = _require4.listFilesToProcess;

      listFilesToProcess = function listFilesToProcess(src, extensions) {
        var patterns = src.reduce(function (carry, pattern) {
          return carry.concat(extensions.map(function (extension) {
            return (/\*\*|\*\./.test(pattern) ? pattern : String(pattern) + '/**/*' + String(extension));
          }));
        }, src.slice());

        return _originalListFilesToProcess(patterns);
      };
    }
  }
}

if (FileEnumerator) {
  listFilesToProcess = function listFilesToProcess(src, extensions) {
    var e = new FileEnumerator({
      extensions: extensions });


    return Array.from(e.iterateFiles(src), function (_ref) {var filePath = _ref.filePath,ignored = _ref.ignored;return {
        ignored: ignored,
        filename: filePath };});

  };
}

var EXPORT_DEFAULT_DECLARATION = 'ExportDefaultDeclaration';
var EXPORT_NAMED_DECLARATION = 'ExportNamedDeclaration';
var EXPORT_ALL_DECLARATION = 'ExportAllDeclaration';
var IMPORT_DECLARATION = 'ImportDeclaration';
var IMPORT_NAMESPACE_SPECIFIER = 'ImportNamespaceSpecifier';
var IMPORT_DEFAULT_SPECIFIER = 'ImportDefaultSpecifier';
var VARIABLE_DECLARATION = 'VariableDeclaration';
var FUNCTION_DECLARATION = 'FunctionDeclaration';
var CLASS_DECLARATION = 'ClassDeclaration';
var IDENTIFIER = 'Identifier';
var OBJECT_PATTERN = 'ObjectPattern';
var TS_INTERFACE_DECLARATION = 'TSInterfaceDeclaration';
var TS_TYPE_ALIAS_DECLARATION = 'TSTypeAliasDeclaration';
var TS_ENUM_DECLARATION = 'TSEnumDeclaration';
var DEFAULT = 'default';

function forEachDeclarationIdentifier(declaration, cb) {
  if (declaration) {
    if (
    declaration.type === FUNCTION_DECLARATION ||
    declaration.type === CLASS_DECLARATION ||
    declaration.type === TS_INTERFACE_DECLARATION ||
    declaration.type === TS_TYPE_ALIAS_DECLARATION ||
    declaration.type === TS_ENUM_DECLARATION)
    {
      cb(declaration.id.name);
    } else if (declaration.type === VARIABLE_DECLARATION) {
      declaration.declarations.forEach(function (_ref2) {var id = _ref2.id;
        if (id.type === OBJECT_PATTERN) {
          (0, _ExportMap.recursivePatternCapture)(id, function (pattern) {
            if (pattern.type === IDENTIFIER) {
              cb(pattern.name);
            }
          });
        } else {
          cb(id.name);
        }
      });
    }
  }
}

/**
   * List of imports per file.
   *
   * Represented by a two-level Map to a Set of identifiers. The upper-level Map
   * keys are the paths to the modules containing the imports, while the
   * lower-level Map keys are the paths to the files which are being imported
   * from. Lastly, the Set of identifiers contains either names being imported
   * or a special AST node name listed above (e.g ImportDefaultSpecifier).
   *
   * For example, if we have a file named foo.js containing:
   *
   *   import { o2 } from './bar.js';
   *
   * Then we will have a structure that looks like:
   *
   *   Map { 'foo.js' => Map { 'bar.js' => Set { 'o2' } } }
   *
   * @type {Map<string, Map<string, Set<string>>>}
   */
var importList = new Map();

/**
                             * List of exports per file.
                             *
                             * Represented by a two-level Map to an object of metadata. The upper-level Map
                             * keys are the paths to the modules containing the exports, while the
                             * lower-level Map keys are the specific identifiers or special AST node names
                             * being exported. The leaf-level metadata object at the moment only contains a
                             * `whereUsed` property, which contains a Set of paths to modules that import
                             * the name.
                             *
                             * For example, if we have a file named bar.js containing the following exports:
                             *
                             *   const o2 = 'bar';
                             *   export { o2 };
                             *
                             * And a file named foo.js containing the following import:
                             *
                             *   import { o2 } from './bar.js';
                             *
                             * Then we will have a structure that looks like:
                             *
                             *   Map { 'bar.js' => Map { 'o2' => { whereUsed: Set { 'foo.js' } } } }
                             *
                             * @type {Map<string, Map<string, object>>}
                             */
var exportList = new Map();

var visitorKeyMap = new Map();

var ignoredFiles = new Set();
var filesOutsideSrc = new Set();

var isNodeModule = function isNodeModule(path) {
  return (/\/(node_modules)\//.test(path));
};

/**
    * read all files matching the patterns in src and ignoreExports
    *
    * return all files matching src pattern, which are not matching the ignoreExports pattern
    */
var resolveFiles = function resolveFiles(src, ignoreExports, context) {
  var extensions = Array.from((0, _ignore.getFileExtensions)(context.settings));

  var srcFiles = new Set();
  var srcFileList = listFilesToProcess(src, extensions);

  // prepare list of ignored files
  var ignoredFilesList = listFilesToProcess(ignoreExports, extensions);
  ignoredFilesList.forEach(function (_ref3) {var filename = _ref3.filename;return ignoredFiles.add(filename);});

  // prepare list of source files, don't consider files from node_modules
  srcFileList.filter(function (_ref4) {var filename = _ref4.filename;return !isNodeModule(filename);}).forEach(function (_ref5) {var filename = _ref5.filename;
    srcFiles.add(filename);
  });
  return srcFiles;
};

/**
    * parse all source files and build up 2 maps containing the existing imports and exports
    */
var prepareImportsAndExports = function prepareImportsAndExports(srcFiles, context) {
  var exportAll = new Map();
  srcFiles.forEach(function (file) {
    var exports = new Map();
    var imports = new Map();
    var currentExports = _ExportMap2['default'].get(file, context);
    if (currentExports) {var

      dependencies =




      currentExports.dependencies,reexports = currentExports.reexports,localImportList = currentExports.imports,namespace = currentExports.namespace,visitorKeys = currentExports.visitorKeys;

      visitorKeyMap.set(file, visitorKeys);
      // dependencies === export * from
      var currentExportAll = new Set();
      dependencies.forEach(function (getDependency) {
        var dependency = getDependency();
        if (dependency === null) {
          return;
        }

        currentExportAll.add(dependency.path);
      });
      exportAll.set(file, currentExportAll);

      reexports.forEach(function (value, key) {
        if (key === DEFAULT) {
          exports.set(IMPORT_DEFAULT_SPECIFIER, { whereUsed: new Set() });
        } else {
          exports.set(key, { whereUsed: new Set() });
        }
        var reexport = value.getImport();
        if (!reexport) {
          return;
        }
        var localImport = imports.get(reexport.path);
        var currentValue = void 0;
        if (value.local === DEFAULT) {
          currentValue = IMPORT_DEFAULT_SPECIFIER;
        } else {
          currentValue = value.local;
        }
        if (typeof localImport !== 'undefined') {
          localImport = new Set([].concat(_toConsumableArray(localImport), [currentValue]));
        } else {
          localImport = new Set([currentValue]);
        }
        imports.set(reexport.path, localImport);
      });

      localImportList.forEach(function (value, key) {
        if (isNodeModule(key)) {
          return;
        }
        var localImport = imports.get(key) || new Set();
        value.declarations.forEach(function (_ref6) {var importedSpecifiers = _ref6.importedSpecifiers;return (
            importedSpecifiers.forEach(function (specifier) {return localImport.add(specifier);}));});

        imports.set(key, localImport);
      });
      importList.set(file, imports);

      // build up export list only, if file is not ignored
      if (ignoredFiles.has(file)) {
        return;
      }
      namespace.forEach(function (value, key) {
        if (key === DEFAULT) {
          exports.set(IMPORT_DEFAULT_SPECIFIER, { whereUsed: new Set() });
        } else {
          exports.set(key, { whereUsed: new Set() });
        }
      });
    }
    exports.set(EXPORT_ALL_DECLARATION, { whereUsed: new Set() });
    exports.set(IMPORT_NAMESPACE_SPECIFIER, { whereUsed: new Set() });
    exportList.set(file, exports);
  });
  exportAll.forEach(function (value, key) {
    value.forEach(function (val) {
      var currentExports = exportList.get(val);
      if (currentExports) {
        var currentExport = currentExports.get(EXPORT_ALL_DECLARATION);
        currentExport.whereUsed.add(key);
      }
    });
  });
};

/**
    * traverse through all imports and add the respective path to the whereUsed-list
    * of the corresponding export
    */
var determineUsage = function determineUsage() {
  importList.forEach(function (listValue, listKey) {
    listValue.forEach(function (value, key) {
      var exports = exportList.get(key);
      if (typeof exports !== 'undefined') {
        value.forEach(function (currentImport) {
          var specifier = void 0;
          if (currentImport === IMPORT_NAMESPACE_SPECIFIER) {
            specifier = IMPORT_NAMESPACE_SPECIFIER;
          } else if (currentImport === IMPORT_DEFAULT_SPECIFIER) {
            specifier = IMPORT_DEFAULT_SPECIFIER;
          } else {
            specifier = currentImport;
          }
          if (typeof specifier !== 'undefined') {
            var exportStatement = exports.get(specifier);
            if (typeof exportStatement !== 'undefined') {var
              whereUsed = exportStatement.whereUsed;
              whereUsed.add(listKey);
              exports.set(specifier, { whereUsed: whereUsed });
            }
          }
        });
      }
    });
  });
};

var getSrc = function getSrc(src) {
  if (src) {
    return src;
  }
  return [process.cwd()];
};

/**
    * prepare the lists of existing imports and exports - should only be executed once at
    * the start of a new eslint run
    */
var srcFiles = void 0;
var lastPrepareKey = void 0;
var doPreparation = function doPreparation(src, ignoreExports, context) {
  var prepareKey = JSON.stringify({
    src: (src || []).sort(),
    ignoreExports: (ignoreExports || []).sort(),
    extensions: Array.from((0, _ignore.getFileExtensions)(context.settings)).sort() });

  if (prepareKey === lastPrepareKey) {
    return;
  }

  importList.clear();
  exportList.clear();
  ignoredFiles.clear();
  filesOutsideSrc.clear();

  srcFiles = resolveFiles(getSrc(src), ignoreExports, context);
  prepareImportsAndExports(srcFiles, context);
  determineUsage();
  lastPrepareKey = prepareKey;
};

var newNamespaceImportExists = function newNamespaceImportExists(specifiers) {return (
    specifiers.some(function (_ref7) {var type = _ref7.type;return type === IMPORT_NAMESPACE_SPECIFIER;}));};

var newDefaultImportExists = function newDefaultImportExists(specifiers) {return (
    specifiers.some(function (_ref8) {var type = _ref8.type;return type === IMPORT_DEFAULT_SPECIFIER;}));};

var fileIsInPkg = function fileIsInPkg(file) {var _readPkgUp =
  (0, _readPkgUp3['default'])({ cwd: file }),path = _readPkgUp.path,pkg = _readPkgUp.pkg;
  var basePath = (0, _path.dirname)(path);

  var checkPkgFieldString = function checkPkgFieldString(pkgField) {
    if ((0, _path.join)(basePath, pkgField) === file) {
      return true;
    }
  };

  var checkPkgFieldObject = function checkPkgFieldObject(pkgField) {
    var pkgFieldFiles = (0, _object2['default'])(pkgField).
    filter(function (value) {return typeof value !== 'boolean';}).
    map(function (value) {return (0, _path.join)(basePath, value);});

    if ((0, _arrayIncludes2['default'])(pkgFieldFiles, file)) {
      return true;
    }
  };

  var checkPkgField = function checkPkgField(pkgField) {
    if (typeof pkgField === 'string') {
      return checkPkgFieldString(pkgField);
    }

    if ((typeof pkgField === 'undefined' ? 'undefined' : _typeof(pkgField)) === 'object') {
      return checkPkgFieldObject(pkgField);
    }
  };

  if (pkg['private'] === true) {
    return false;
  }

  if (pkg.bin) {
    if (checkPkgField(pkg.bin)) {
      return true;
    }
  }

  if (pkg.browser) {
    if (checkPkgField(pkg.browser)) {
      return true;
    }
  }

  if (pkg.main) {
    if (checkPkgFieldString(pkg.main)) {
      return true;
    }
  }

  return false;
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Helpful warnings',
      description: 'Forbid modules without exports, or exports without matching import in another module.',
      url: (0, _docsUrl2['default'])('no-unused-modules') },

    schema: [{
      properties: {
        src: {
          description: 'files/paths to be analyzed (only for unused exports)',
          type: 'array',
          minItems: 1,
          items: {
            type: 'string',
            minLength: 1 } },


        ignoreExports: {
          description:
          'files/paths for which unused exports will not be reported (e.g module entry points)',
          type: 'array',
          minItems: 1,
          items: {
            type: 'string',
            minLength: 1 } },


        missingExports: {
          description: 'report modules without any exports',
          type: 'boolean' },

        unusedExports: {
          description: 'report exports without any usage',
          type: 'boolean' } },


      not: {
        properties: {
          unusedExports: { 'enum': [false] },
          missingExports: { 'enum': [false] } } },


      anyOf: [{
        not: {
          properties: {
            unusedExports: { 'enum': [true] } } },


        required: ['missingExports'] },
      {
        not: {
          properties: {
            missingExports: { 'enum': [true] } } },


        required: ['unusedExports'] },
      {
        properties: {
          unusedExports: { 'enum': [true] } },

        required: ['unusedExports'] },
      {
        properties: {
          missingExports: { 'enum': [true] } },

        required: ['missingExports'] }] }] },




  create: function () {function create(context) {var _ref9 =





      context.options[0] || {},src = _ref9.src,_ref9$ignoreExports = _ref9.ignoreExports,ignoreExports = _ref9$ignoreExports === undefined ? [] : _ref9$ignoreExports,missingExports = _ref9.missingExports,unusedExports = _ref9.unusedExports;

      if (unusedExports) {
        doPreparation(src, ignoreExports, context);
      }

      var file = context.getPhysicalFilename ? context.getPhysicalFilename() : context.getFilename();

      var checkExportPresence = function () {function checkExportPresence(node) {
          if (!missingExports) {
            return;
          }

          if (ignoredFiles.has(file)) {
            return;
          }

          var exportCount = exportList.get(file);
          var exportAll = exportCount.get(EXPORT_ALL_DECLARATION);
          var namespaceImports = exportCount.get(IMPORT_NAMESPACE_SPECIFIER);

          exportCount['delete'](EXPORT_ALL_DECLARATION);
          exportCount['delete'](IMPORT_NAMESPACE_SPECIFIER);
          if (exportCount.size < 1) {
            // node.body[0] === 'undefined' only happens, if everything is commented out in the file
            // being linted
            context.report(node.body[0] ? node.body[0] : node, 'No exports found');
          }
          exportCount.set(EXPORT_ALL_DECLARATION, exportAll);
          exportCount.set(IMPORT_NAMESPACE_SPECIFIER, namespaceImports);
        }return checkExportPresence;}();

      var checkUsage = function () {function checkUsage(node, exportedValue) {
          if (!unusedExports) {
            return;
          }

          if (ignoredFiles.has(file)) {
            return;
          }

          if (fileIsInPkg(file)) {
            return;
          }

          if (filesOutsideSrc.has(file)) {
            return;
          }

          // make sure file to be linted is included in source files
          if (!srcFiles.has(file)) {
            srcFiles = resolveFiles(getSrc(src), ignoreExports, context);
            if (!srcFiles.has(file)) {
              filesOutsideSrc.add(file);
              return;
            }
          }

          exports = exportList.get(file);

          // special case: export * from
          var exportAll = exports.get(EXPORT_ALL_DECLARATION);
          if (typeof exportAll !== 'undefined' && exportedValue !== IMPORT_DEFAULT_SPECIFIER) {
            if (exportAll.whereUsed.size > 0) {
              return;
            }
          }

          // special case: namespace import
          var namespaceImports = exports.get(IMPORT_NAMESPACE_SPECIFIER);
          if (typeof namespaceImports !== 'undefined') {
            if (namespaceImports.whereUsed.size > 0) {
              return;
            }
          }

          // exportsList will always map any imported value of 'default' to 'ImportDefaultSpecifier'
          var exportsKey = exportedValue === DEFAULT ? IMPORT_DEFAULT_SPECIFIER : exportedValue;

          var exportStatement = exports.get(exportsKey);

          var value = exportsKey === IMPORT_DEFAULT_SPECIFIER ? DEFAULT : exportsKey;

          if (typeof exportStatement !== 'undefined') {
            if (exportStatement.whereUsed.size < 1) {
              context.report(
              node, 'exported declaration \'' +
              value + '\' not used within other modules');

            }
          } else {
            context.report(
            node, 'exported declaration \'' +
            value + '\' not used within other modules');

          }
        }return checkUsage;}();

      /**
                                 * only useful for tools like vscode-eslint
                                 *
                                 * update lists of existing exports during runtime
                                 */
      var updateExportUsage = function () {function updateExportUsage(node) {
          if (ignoredFiles.has(file)) {
            return;
          }

          var exports = exportList.get(file);

          // new module has been created during runtime
          // include it in further processing
          if (typeof exports === 'undefined') {
            exports = new Map();
          }

          var newExports = new Map();
          var newExportIdentifiers = new Set();

          node.body.forEach(function (_ref10) {var type = _ref10.type,declaration = _ref10.declaration,specifiers = _ref10.specifiers;
            if (type === EXPORT_DEFAULT_DECLARATION) {
              newExportIdentifiers.add(IMPORT_DEFAULT_SPECIFIER);
            }
            if (type === EXPORT_NAMED_DECLARATION) {
              if (specifiers.length > 0) {
                specifiers.forEach(function (specifier) {
                  if (specifier.exported) {
                    newExportIdentifiers.add(specifier.exported.name || specifier.exported.value);
                  }
                });
              }
              forEachDeclarationIdentifier(declaration, function (name) {
                newExportIdentifiers.add(name);
              });
            }
          });

          // old exports exist within list of new exports identifiers: add to map of new exports
          exports.forEach(function (value, key) {
            if (newExportIdentifiers.has(key)) {
              newExports.set(key, value);
            }
          });

          // new export identifiers added: add to map of new exports
          newExportIdentifiers.forEach(function (key) {
            if (!exports.has(key)) {
              newExports.set(key, { whereUsed: new Set() });
            }
          });

          // preserve information about namespace imports
          var exportAll = exports.get(EXPORT_ALL_DECLARATION);
          var namespaceImports = exports.get(IMPORT_NAMESPACE_SPECIFIER);

          if (typeof namespaceImports === 'undefined') {
            namespaceImports = { whereUsed: new Set() };
          }

          newExports.set(EXPORT_ALL_DECLARATION, exportAll);
          newExports.set(IMPORT_NAMESPACE_SPECIFIER, namespaceImports);
          exportList.set(file, newExports);
        }return updateExportUsage;}();

      /**
                                        * only useful for tools like vscode-eslint
                                        *
                                        * update lists of existing imports during runtime
                                        */
      var updateImportUsage = function () {function updateImportUsage(node) {
          if (!unusedExports) {
            return;
          }

          var oldImportPaths = importList.get(file);
          if (typeof oldImportPaths === 'undefined') {
            oldImportPaths = new Map();
          }

          var oldNamespaceImports = new Set();
          var newNamespaceImports = new Set();

          var oldExportAll = new Set();
          var newExportAll = new Set();

          var oldDefaultImports = new Set();
          var newDefaultImports = new Set();

          var oldImports = new Map();
          var newImports = new Map();
          oldImportPaths.forEach(function (value, key) {
            if (value.has(EXPORT_ALL_DECLARATION)) {
              oldExportAll.add(key);
            }
            if (value.has(IMPORT_NAMESPACE_SPECIFIER)) {
              oldNamespaceImports.add(key);
            }
            if (value.has(IMPORT_DEFAULT_SPECIFIER)) {
              oldDefaultImports.add(key);
            }
            value.forEach(function (val) {
              if (val !== IMPORT_NAMESPACE_SPECIFIER &&
              val !== IMPORT_DEFAULT_SPECIFIER) {
                oldImports.set(val, key);
              }
            });
          });

          function processDynamicImport(source) {
            if (source.type !== 'Literal') {
              return null;
            }
            var p = (0, _resolve2['default'])(source.value, context);
            if (p == null) {
              return null;
            }
            newNamespaceImports.add(p);
          }

          (0, _visit2['default'])(node, visitorKeyMap.get(file), {
            ImportExpression: function () {function ImportExpression(child) {
                processDynamicImport(child.source);
              }return ImportExpression;}(),
            CallExpression: function () {function CallExpression(child) {
                if (child.callee.type === 'Import') {
                  processDynamicImport(child.arguments[0]);
                }
              }return CallExpression;}() });


          node.body.forEach(function (astNode) {
            var resolvedPath = void 0;

            // support for export { value } from 'module'
            if (astNode.type === EXPORT_NAMED_DECLARATION) {
              if (astNode.source) {
                resolvedPath = (0, _resolve2['default'])(astNode.source.raw.replace(/('|")/g, ''), context);
                astNode.specifiers.forEach(function (specifier) {
                  var name = specifier.local.name || specifier.local.value;
                  if (name === DEFAULT) {
                    newDefaultImports.add(resolvedPath);
                  } else {
                    newImports.set(name, resolvedPath);
                  }
                });
              }
            }

            if (astNode.type === EXPORT_ALL_DECLARATION) {
              resolvedPath = (0, _resolve2['default'])(astNode.source.raw.replace(/('|")/g, ''), context);
              newExportAll.add(resolvedPath);
            }

            if (astNode.type === IMPORT_DECLARATION) {
              resolvedPath = (0, _resolve2['default'])(astNode.source.raw.replace(/('|")/g, ''), context);
              if (!resolvedPath) {
                return;
              }

              if (isNodeModule(resolvedPath)) {
                return;
              }

              if (newNamespaceImportExists(astNode.specifiers)) {
                newNamespaceImports.add(resolvedPath);
              }

              if (newDefaultImportExists(astNode.specifiers)) {
                newDefaultImports.add(resolvedPath);
              }

              astNode.specifiers.forEach(function (specifier) {
                if (specifier.type === IMPORT_DEFAULT_SPECIFIER ||
                specifier.type === IMPORT_NAMESPACE_SPECIFIER) {
                  return;
                }
                newImports.set(specifier.imported.name || specifier.imported.value, resolvedPath);
              });
            }
          });

          newExportAll.forEach(function (value) {
            if (!oldExportAll.has(value)) {
              var imports = oldImportPaths.get(value);
              if (typeof imports === 'undefined') {
                imports = new Set();
              }
              imports.add(EXPORT_ALL_DECLARATION);
              oldImportPaths.set(value, imports);

              var _exports = exportList.get(value);
              var currentExport = void 0;
              if (typeof _exports !== 'undefined') {
                currentExport = _exports.get(EXPORT_ALL_DECLARATION);
              } else {
                _exports = new Map();
                exportList.set(value, _exports);
              }

              if (typeof currentExport !== 'undefined') {
                currentExport.whereUsed.add(file);
              } else {
                var whereUsed = new Set();
                whereUsed.add(file);
                _exports.set(EXPORT_ALL_DECLARATION, { whereUsed: whereUsed });
              }
            }
          });

          oldExportAll.forEach(function (value) {
            if (!newExportAll.has(value)) {
              var imports = oldImportPaths.get(value);
              imports['delete'](EXPORT_ALL_DECLARATION);

              var _exports2 = exportList.get(value);
              if (typeof _exports2 !== 'undefined') {
                var currentExport = _exports2.get(EXPORT_ALL_DECLARATION);
                if (typeof currentExport !== 'undefined') {
                  currentExport.whereUsed['delete'](file);
                }
              }
            }
          });

          newDefaultImports.forEach(function (value) {
            if (!oldDefaultImports.has(value)) {
              var imports = oldImportPaths.get(value);
              if (typeof imports === 'undefined') {
                imports = new Set();
              }
              imports.add(IMPORT_DEFAULT_SPECIFIER);
              oldImportPaths.set(value, imports);

              var _exports3 = exportList.get(value);
              var currentExport = void 0;
              if (typeof _exports3 !== 'undefined') {
                currentExport = _exports3.get(IMPORT_DEFAULT_SPECIFIER);
              } else {
                _exports3 = new Map();
                exportList.set(value, _exports3);
              }

              if (typeof currentExport !== 'undefined') {
                currentExport.whereUsed.add(file);
              } else {
                var whereUsed = new Set();
                whereUsed.add(file);
                _exports3.set(IMPORT_DEFAULT_SPECIFIER, { whereUsed: whereUsed });
              }
            }
          });

          oldDefaultImports.forEach(function (value) {
            if (!newDefaultImports.has(value)) {
              var imports = oldImportPaths.get(value);
              imports['delete'](IMPORT_DEFAULT_SPECIFIER);

              var _exports4 = exportList.get(value);
              if (typeof _exports4 !== 'undefined') {
                var currentExport = _exports4.get(IMPORT_DEFAULT_SPECIFIER);
                if (typeof currentExport !== 'undefined') {
                  currentExport.whereUsed['delete'](file);
                }
              }
            }
          });

          newNamespaceImports.forEach(function (value) {
            if (!oldNamespaceImports.has(value)) {
              var imports = oldImportPaths.get(value);
              if (typeof imports === 'undefined') {
                imports = new Set();
              }
              imports.add(IMPORT_NAMESPACE_SPECIFIER);
              oldImportPaths.set(value, imports);

              var _exports5 = exportList.get(value);
              var currentExport = void 0;
              if (typeof _exports5 !== 'undefined') {
                currentExport = _exports5.get(IMPORT_NAMESPACE_SPECIFIER);
              } else {
                _exports5 = new Map();
                exportList.set(value, _exports5);
              }

              if (typeof currentExport !== 'undefined') {
                currentExport.whereUsed.add(file);
              } else {
                var whereUsed = new Set();
                whereUsed.add(file);
                _exports5.set(IMPORT_NAMESPACE_SPECIFIER, { whereUsed: whereUsed });
              }
            }
          });

          oldNamespaceImports.forEach(function (value) {
            if (!newNamespaceImports.has(value)) {
              var imports = oldImportPaths.get(value);
              imports['delete'](IMPORT_NAMESPACE_SPECIFIER);

              var _exports6 = exportList.get(value);
              if (typeof _exports6 !== 'undefined') {
                var currentExport = _exports6.get(IMPORT_NAMESPACE_SPECIFIER);
                if (typeof currentExport !== 'undefined') {
                  currentExport.whereUsed['delete'](file);
                }
              }
            }
          });

          newImports.forEach(function (value, key) {
            if (!oldImports.has(key)) {
              var imports = oldImportPaths.get(value);
              if (typeof imports === 'undefined') {
                imports = new Set();
              }
              imports.add(key);
              oldImportPaths.set(value, imports);

              var _exports7 = exportList.get(value);
              var currentExport = void 0;
              if (typeof _exports7 !== 'undefined') {
                currentExport = _exports7.get(key);
              } else {
                _exports7 = new Map();
                exportList.set(value, _exports7);
              }

              if (typeof currentExport !== 'undefined') {
                currentExport.whereUsed.add(file);
              } else {
                var whereUsed = new Set();
                whereUsed.add(file);
                _exports7.set(key, { whereUsed: whereUsed });
              }
            }
          });

          oldImports.forEach(function (value, key) {
            if (!newImports.has(key)) {
              var imports = oldImportPaths.get(value);
              imports['delete'](key);

              var _exports8 = exportList.get(value);
              if (typeof _exports8 !== 'undefined') {
                var currentExport = _exports8.get(key);
                if (typeof currentExport !== 'undefined') {
                  currentExport.whereUsed['delete'](file);
                }
              }
            }
          });
        }return updateImportUsage;}();

      return {
        'Program:exit': function () {function ProgramExit(node) {
            updateExportUsage(node);
            updateImportUsage(node);
            checkExportPresence(node);
          }return ProgramExit;}(),
        'ExportDefaultDeclaration': function () {function ExportDefaultDeclaration(node) {
            checkUsage(node, IMPORT_DEFAULT_SPECIFIER);
          }return ExportDefaultDeclaration;}(),
        'ExportNamedDeclaration': function () {function ExportNamedDeclaration(node) {
            node.specifiers.forEach(function (specifier) {
              checkUsage(node, specifier.exported.name || specifier.exported.value);
            });
            forEachDeclarationIdentifier(node.declaration, function (name) {
              checkUsage(node, name);
            });
          }return ExportNamedDeclaration;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby11bnVzZWQtbW9kdWxlcy5qcyJdLCJuYW1lcyI6WyJGaWxlRW51bWVyYXRvciIsImxpc3RGaWxlc1RvUHJvY2VzcyIsInJlcXVpcmUiLCJlIiwib3JpZ2luYWxMaXN0RmlsZXNUb1Byb2Nlc3MiLCJzcmMiLCJleHRlbnNpb25zIiwicGF0dGVybnMiLCJyZWR1Y2UiLCJjYXJyeSIsInBhdHRlcm4iLCJjb25jYXQiLCJtYXAiLCJleHRlbnNpb24iLCJ0ZXN0Iiwic2xpY2UiLCJBcnJheSIsImZyb20iLCJpdGVyYXRlRmlsZXMiLCJmaWxlUGF0aCIsImlnbm9yZWQiLCJmaWxlbmFtZSIsIkVYUE9SVF9ERUZBVUxUX0RFQ0xBUkFUSU9OIiwiRVhQT1JUX05BTUVEX0RFQ0xBUkFUSU9OIiwiRVhQT1JUX0FMTF9ERUNMQVJBVElPTiIsIklNUE9SVF9ERUNMQVJBVElPTiIsIklNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSIiwiSU1QT1JUX0RFRkFVTFRfU1BFQ0lGSUVSIiwiVkFSSUFCTEVfREVDTEFSQVRJT04iLCJGVU5DVElPTl9ERUNMQVJBVElPTiIsIkNMQVNTX0RFQ0xBUkFUSU9OIiwiSURFTlRJRklFUiIsIk9CSkVDVF9QQVRURVJOIiwiVFNfSU5URVJGQUNFX0RFQ0xBUkFUSU9OIiwiVFNfVFlQRV9BTElBU19ERUNMQVJBVElPTiIsIlRTX0VOVU1fREVDTEFSQVRJT04iLCJERUZBVUxUIiwiZm9yRWFjaERlY2xhcmF0aW9uSWRlbnRpZmllciIsImRlY2xhcmF0aW9uIiwiY2IiLCJ0eXBlIiwiaWQiLCJuYW1lIiwiZGVjbGFyYXRpb25zIiwiZm9yRWFjaCIsImltcG9ydExpc3QiLCJNYXAiLCJleHBvcnRMaXN0IiwidmlzaXRvcktleU1hcCIsImlnbm9yZWRGaWxlcyIsIlNldCIsImZpbGVzT3V0c2lkZVNyYyIsImlzTm9kZU1vZHVsZSIsInBhdGgiLCJyZXNvbHZlRmlsZXMiLCJpZ25vcmVFeHBvcnRzIiwiY29udGV4dCIsInNldHRpbmdzIiwic3JjRmlsZXMiLCJzcmNGaWxlTGlzdCIsImlnbm9yZWRGaWxlc0xpc3QiLCJhZGQiLCJmaWx0ZXIiLCJwcmVwYXJlSW1wb3J0c0FuZEV4cG9ydHMiLCJleHBvcnRBbGwiLCJleHBvcnRzIiwiaW1wb3J0cyIsImN1cnJlbnRFeHBvcnRzIiwiRXhwb3J0cyIsImdldCIsImZpbGUiLCJkZXBlbmRlbmNpZXMiLCJyZWV4cG9ydHMiLCJsb2NhbEltcG9ydExpc3QiLCJuYW1lc3BhY2UiLCJ2aXNpdG9yS2V5cyIsInNldCIsImN1cnJlbnRFeHBvcnRBbGwiLCJkZXBlbmRlbmN5IiwiZ2V0RGVwZW5kZW5jeSIsInZhbHVlIiwia2V5Iiwid2hlcmVVc2VkIiwicmVleHBvcnQiLCJnZXRJbXBvcnQiLCJsb2NhbEltcG9ydCIsImN1cnJlbnRWYWx1ZSIsImxvY2FsIiwiaW1wb3J0ZWRTcGVjaWZpZXJzIiwic3BlY2lmaWVyIiwiaGFzIiwidmFsIiwiY3VycmVudEV4cG9ydCIsImRldGVybWluZVVzYWdlIiwibGlzdFZhbHVlIiwibGlzdEtleSIsImN1cnJlbnRJbXBvcnQiLCJleHBvcnRTdGF0ZW1lbnQiLCJnZXRTcmMiLCJwcm9jZXNzIiwiY3dkIiwibGFzdFByZXBhcmVLZXkiLCJkb1ByZXBhcmF0aW9uIiwicHJlcGFyZUtleSIsIkpTT04iLCJzdHJpbmdpZnkiLCJzb3J0IiwiY2xlYXIiLCJuZXdOYW1lc3BhY2VJbXBvcnRFeGlzdHMiLCJzcGVjaWZpZXJzIiwic29tZSIsIm5ld0RlZmF1bHRJbXBvcnRFeGlzdHMiLCJmaWxlSXNJblBrZyIsInBrZyIsImJhc2VQYXRoIiwiY2hlY2tQa2dGaWVsZFN0cmluZyIsInBrZ0ZpZWxkIiwiY2hlY2tQa2dGaWVsZE9iamVjdCIsInBrZ0ZpZWxkRmlsZXMiLCJjaGVja1BrZ0ZpZWxkIiwiYmluIiwiYnJvd3NlciIsIm1haW4iLCJtb2R1bGUiLCJtZXRhIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJ1cmwiLCJzY2hlbWEiLCJwcm9wZXJ0aWVzIiwibWluSXRlbXMiLCJpdGVtcyIsIm1pbkxlbmd0aCIsIm1pc3NpbmdFeHBvcnRzIiwidW51c2VkRXhwb3J0cyIsIm5vdCIsImFueU9mIiwicmVxdWlyZWQiLCJjcmVhdGUiLCJvcHRpb25zIiwiZ2V0UGh5c2ljYWxGaWxlbmFtZSIsImdldEZpbGVuYW1lIiwiY2hlY2tFeHBvcnRQcmVzZW5jZSIsImV4cG9ydENvdW50IiwibmFtZXNwYWNlSW1wb3J0cyIsInNpemUiLCJyZXBvcnQiLCJub2RlIiwiYm9keSIsImNoZWNrVXNhZ2UiLCJleHBvcnRlZFZhbHVlIiwiZXhwb3J0c0tleSIsInVwZGF0ZUV4cG9ydFVzYWdlIiwibmV3RXhwb3J0cyIsIm5ld0V4cG9ydElkZW50aWZpZXJzIiwibGVuZ3RoIiwiZXhwb3J0ZWQiLCJ1cGRhdGVJbXBvcnRVc2FnZSIsIm9sZEltcG9ydFBhdGhzIiwib2xkTmFtZXNwYWNlSW1wb3J0cyIsIm5ld05hbWVzcGFjZUltcG9ydHMiLCJvbGRFeHBvcnRBbGwiLCJuZXdFeHBvcnRBbGwiLCJvbGREZWZhdWx0SW1wb3J0cyIsIm5ld0RlZmF1bHRJbXBvcnRzIiwib2xkSW1wb3J0cyIsIm5ld0ltcG9ydHMiLCJwcm9jZXNzRHluYW1pY0ltcG9ydCIsInNvdXJjZSIsInAiLCJJbXBvcnRFeHByZXNzaW9uIiwiY2hpbGQiLCJDYWxsRXhwcmVzc2lvbiIsImNhbGxlZSIsImFyZ3VtZW50cyIsInJlc29sdmVkUGF0aCIsImFzdE5vZGUiLCJyYXciLCJyZXBsYWNlIiwiaW1wb3J0ZWQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BLHlDO0FBQ0E7QUFDQSxzRDtBQUNBLGtEO0FBQ0EscUM7QUFDQTtBQUNBLDJEO0FBQ0EsdUM7QUFDQSwrQyx1VkFkQTs7Ozt5WUFnQkEsSUFBSUEsdUJBQUosQ0FDQSxJQUFJQywyQkFBSjtBQUVBLElBQUk7QUFDb0JDLFVBQVEsNkJBQVIsQ0FEcEIsQ0FDQ0YsY0FERCxZQUNDQSxjQUREO0FBRUgsQ0FGRCxDQUVFLE9BQU9HLENBQVAsRUFB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YUFGRDtBQUdBM0MseUNBQTZCK0csS0FBSzlHLFdBQWxDLEVBQStDLFVBQUNJLElBQUQsRUFBVTtBQUN2RDRHLHlCQUFXRixJQUFYLEVBQWlCMUcsSUFBakI7QUFDRCxhQUZEO0FBR0QsV0FQRCxpQ0FUSyxFQUFQOztBQWtCRCxLQTlkRCxpQkF4RWUsRUFBakIiLCJmaWxlIjoibm8tdW51c2VkLW1vZHVsZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGZpbGVPdmVydmlldyBFbnN1cmVzIHRoYXQgbW9kdWxlcyBjb250YWluIGV4cG9ydHMgYW5kL29yIGFsbFxyXG4gKiBtb2R1bGVzIGFyZSBjb25zdW1lZCB3aXRoaW4gb3RoZXIgbW9kdWxlcy5cclxuICogQGF1dGhvciBSZW7DqSBGZXJtYW5uXHJcbiAqL1xyXG5cclxuaW1wb3J0IEV4cG9ydHMsIHsgcmVjdXJzaXZlUGF0dGVybkNhcHR1cmUgfSBmcm9tICcuLi9FeHBvcnRNYXAnO1xyXG5pbXBvcnQgeyBnZXRGaWxlRXh0ZW5zaW9ucyB9IGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvaWdub3JlJztcclxuaW1wb3J0IHJlc29sdmUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJztcclxuaW1wb3J0IHZpc2l0IGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvdmlzaXQnO1xyXG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJztcclxuaW1wb3J0IHsgZGlybmFtZSwgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgcmVhZFBrZ1VwIGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvcmVhZFBrZ1VwJztcclxuaW1wb3J0IHZhbHVlcyBmcm9tICdvYmplY3QudmFsdWVzJztcclxuaW1wb3J0IGluY2x1ZGVzIGZyb20gJ2FycmF5LWluY2x1ZGVzJztcclxuXHJcbmxldCBGaWxlRW51bWVyYXRvcjtcclxubGV0IGxpc3RGaWxlc1RvUHJvY2VzcztcclxuXHJcbnRyeSB7XHJcbiAgKHsgRmlsZUVudW1lcmF0b3IgfSA9IHJlcXVpcmUoJ2VzbGludC91c2UtYXQteW91ci1vd24tcmlzaycpKTtcclxufSBjYXRjaCAoZSkge1xyXG4gIHRyeSB7XHJcbiAgICAvLyBoYXMgYmVlbiBtb3ZlZCB0byBlc2xpbnQvbGliL2NsaS1lbmdpbmUvZmlsZS1lbnVtZXJhdG9yIGluIHZlcnNpb24gNlxyXG4gICAgKHsgRmlsZUVudW1lcmF0b3IgfSA9IHJlcXVpcmUoJ2VzbGludC9saWIvY2xpLWVuZ2luZS9maWxlLWVudW1lcmF0b3InKSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gZXNsaW50L2xpYi91dGlsL2dsb2ItdXRpbCBoYXMgYmVlbiBtb3ZlZCB0byBlc2xpbnQvbGliL3V0aWwvZ2xvYi11dGlscyB3aXRoIHZlcnNpb24gNS4zXHJcbiAgICAgIGNvbnN0IHsgbGlzdEZpbGVzVG9Qcm9jZXNzOiBvcmlnaW5hbExpc3RGaWxlc1RvUHJvY2VzcyB9ID0gcmVxdWlyZSgnZXNsaW50L2xpYi91dGlsL2dsb2ItdXRpbHMnKTtcclxuXHJcbiAgICAgIC8vIFByZXZlbnQgcGFzc2luZyBpbnZhbGlkIG9wdGlvbnMgKGV4dGVuc2lvbnMgYXJyYXkpIHRvIG9sZCB2ZXJzaW9ucyBvZiB0aGUgZnVuY3Rpb24uXHJcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9lc2xpbnQvZXNsaW50L2Jsb2IvdjUuMTYuMC9saWIvdXRpbC9nbG9iLXV0aWxzLmpzI0wxNzgtTDI4MFxyXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZXNsaW50L2VzbGludC9ibG9iL3Y1LjIuMC9saWIvdXRpbC9nbG9iLXV0aWwuanMjTDE3NC1MMjY5XHJcbiAgICAgIGxpc3RGaWxlc1RvUHJvY2VzcyA9IGZ1bmN0aW9uIChzcmMsIGV4dGVuc2lvbnMpIHtcclxuICAgICAgICByZXR1cm4gb3JpZ2luYWxMaXN0RmlsZXNUb1Byb2Nlc3Moc3JjLCB7XHJcbiAgICAgICAgICBleHRlbnNpb25zLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBjb25zdCB7IGxpc3RGaWxlc1RvUHJvY2Vzczogb3JpZ2luYWxMaXN0RmlsZXNUb1Byb2Nlc3MgfSA9IHJlcXVpcmUoJ2VzbGludC9saWIvdXRpbC9nbG9iLXV0aWwnKTtcclxuXHJcbiAgICAgIGxpc3RGaWxlc1RvUHJvY2VzcyA9IGZ1bmN0aW9uIChzcmMsIGV4dGVuc2lvbnMpIHtcclxuICAgICAgICBjb25zdCBwYXR0ZXJucyA9IHNyYy5yZWR1Y2UoKGNhcnJ5LCBwYXR0ZXJuKSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gY2FycnkuY29uY2F0KGV4dGVuc2lvbnMubWFwKChleHRlbnNpb24pID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIC9cXCpcXCp8XFwqXFwuLy50ZXN0KHBhdHRlcm4pID8gcGF0dGVybiA6IGAke3BhdHRlcm59LyoqLyoke2V4dGVuc2lvbn1gO1xyXG4gICAgICAgICAgfSkpO1xyXG4gICAgICAgIH0sIHNyYy5zbGljZSgpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsTGlzdEZpbGVzVG9Qcm9jZXNzKHBhdHRlcm5zKTtcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmlmIChGaWxlRW51bWVyYXRvcikge1xyXG4gIGxpc3RGaWxlc1RvUHJvY2VzcyA9IGZ1bmN0aW9uIChzcmMsIGV4dGVuc2lvbnMpIHtcclxuICAgIGNvbnN0IGUgPSBuZXcgRmlsZUVudW1lcmF0b3Ioe1xyXG4gICAgICBleHRlbnNpb25zLFxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIEFycmF5LmZyb20oZS5pdGVyYXRlRmlsZXMoc3JjKSwgKHsgZmlsZVBhdGgsIGlnbm9yZWQgfSkgPT4gKHtcclxuICAgICAgaWdub3JlZCxcclxuICAgICAgZmlsZW5hbWU6IGZpbGVQYXRoLFxyXG4gICAgfSkpO1xyXG4gIH07XHJcbn1cclxuXHJcbmNvbnN0IEVYUE9SVF9ERUZBVUxUX0RFQ0xBUkFUSU9OID0gJ0V4cG9ydERlZmF1bHREZWNsYXJhdGlvbic7XHJcbmNvbnN0IEVYUE9SVF9OQU1FRF9ERUNMQVJBVElPTiA9ICdFeHBvcnROYW1lZERlY2xhcmF0aW9uJztcclxuY29uc3QgRVhQT1JUX0FMTF9ERUNMQVJBVElPTiA9ICdFeHBvcnRBbGxEZWNsYXJhdGlvbic7XHJcbmNvbnN0IElNUE9SVF9ERUNMQVJBVElPTiA9ICdJbXBvcnREZWNsYXJhdGlvbic7XHJcbmNvbnN0IElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSID0gJ0ltcG9ydE5hbWVzcGFjZVNwZWNpZmllcic7XHJcbmNvbnN0IElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUiA9ICdJbXBvcnREZWZhdWx0U3BlY2lmaWVyJztcclxuY29uc3QgVkFSSUFCTEVfREVDTEFSQVRJT04gPSAnVmFyaWFibGVEZWNsYXJhdGlvbic7XHJcbmNvbnN0IEZVTkNUSU9OX0RFQ0xBUkFUSU9OID0gJ0Z1bmN0aW9uRGVjbGFyYXRpb24nO1xyXG5jb25zdCBDTEFTU19ERUNMQVJBVElPTiA9ICdDbGFzc0RlY2xhcmF0aW9uJztcclxuY29uc3QgSURFTlRJRklFUiA9ICdJZGVudGlmaWVyJztcclxuY29uc3QgT0JKRUNUX1BBVFRFUk4gPSAnT2JqZWN0UGF0dGVybic7XHJcbmNvbnN0IFRTX0lOVEVSRkFDRV9ERUNMQVJBVElPTiA9ICdUU0ludGVyZmFjZURlY2xhcmF0aW9uJztcclxuY29uc3QgVFNfVFlQRV9BTElBU19ERUNMQVJBVElPTiA9ICdUU1R5cGVBbGlhc0RlY2xhcmF0aW9uJztcclxuY29uc3QgVFNfRU5VTV9ERUNMQVJBVElPTiA9ICdUU0VudW1EZWNsYXJhdGlvbic7XHJcbmNvbnN0IERFRkFVTFQgPSAnZGVmYXVsdCc7XHJcblxyXG5mdW5jdGlvbiBmb3JFYWNoRGVjbGFyYXRpb25JZGVudGlmaWVyKGRlY2xhcmF0aW9uLCBjYikge1xyXG4gIGlmIChkZWNsYXJhdGlvbikge1xyXG4gICAgaWYgKFxyXG4gICAgICBkZWNsYXJhdGlvbi50eXBlID09PSBGVU5DVElPTl9ERUNMQVJBVElPTiB8fFxyXG4gICAgICBkZWNsYXJhdGlvbi50eXBlID09PSBDTEFTU19ERUNMQVJBVElPTiB8fFxyXG4gICAgICBkZWNsYXJhdGlvbi50eXBlID09PSBUU19JTlRFUkZBQ0VfREVDTEFSQVRJT04gfHxcclxuICAgICAgZGVjbGFyYXRpb24udHlwZSA9PT0gVFNfVFlQRV9BTElBU19ERUNMQVJBVElPTiB8fFxyXG4gICAgICBkZWNsYXJhdGlvbi50eXBlID09PSBUU19FTlVNX0RFQ0xBUkFUSU9OXHJcbiAgICApIHtcclxuICAgICAgY2IoZGVjbGFyYXRpb24uaWQubmFtZSk7XHJcbiAgICB9IGVsc2UgaWYgKGRlY2xhcmF0aW9uLnR5cGUgPT09IFZBUklBQkxFX0RFQ0xBUkFUSU9OKSB7XHJcbiAgICAgIGRlY2xhcmF0aW9uLmRlY2xhcmF0aW9ucy5mb3JFYWNoKCh7IGlkIH0pID0+IHtcclxuICAgICAgICBpZiAoaWQudHlwZSA9PT0gT0JKRUNUX1BBVFRFUk4pIHtcclxuICAgICAgICAgIHJlY3Vyc2l2ZVBhdHRlcm5DYXB0dXJlKGlkLCAocGF0dGVybikgPT4ge1xyXG4gICAgICAgICAgICBpZiAocGF0dGVybi50eXBlID09PSBJREVOVElGSUVSKSB7XHJcbiAgICAgICAgICAgICAgY2IocGF0dGVybi5uYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNiKGlkLm5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogTGlzdCBvZiBpbXBvcnRzIHBlciBmaWxlLlxyXG4gKlxyXG4gKiBSZXByZXNlbnRlZCBieSBhIHR3by1sZXZlbCBNYXAgdG8gYSBTZXQgb2YgaWRlbnRpZmllcnMuIFRoZSB1cHBlci1sZXZlbCBNYXBcclxuICoga2V5cyBhcmUgdGhlIHBhdGhzIHRvIHRoZSBtb2R1bGVzIGNvbnRhaW5pbmcgdGhlIGltcG9ydHMsIHdoaWxlIHRoZVxyXG4gKiBsb3dlci1sZXZlbCBNYXAga2V5cyBhcmUgdGhlIHBhdGhzIHRvIHRoZSBmaWxlcyB3aGljaCBhcmUgYmVpbmcgaW1wb3J0ZWRcclxuICogZnJvbS4gTGFzdGx5LCB0aGUgU2V0IG9mIGlkZW50aWZpZXJzIGNvbnRhaW5zIGVpdGhlciBuYW1lcyBiZWluZyBpbXBvcnRlZFxyXG4gKiBvciBhIHNwZWNpYWwgQVNUIG5vZGUgbmFtZSBsaXN0ZWQgYWJvdmUgKGUuZyBJbXBvcnREZWZhdWx0U3BlY2lmaWVyKS5cclxuICpcclxuICogRm9yIGV4YW1wbGUsIGlmIHdlIGhhdmUgYSBmaWxlIG5hbWVkIGZvby5qcyBjb250YWluaW5nOlxyXG4gKlxyXG4gKiAgIGltcG9ydCB7IG8yIH0gZnJvbSAnLi9iYXIuanMnO1xyXG4gKlxyXG4gKiBUaGVuIHdlIHdpbGwgaGF2ZSBhIHN0cnVjdHVyZSB0aGF0IGxvb2tzIGxpa2U6XHJcbiAqXHJcbiAqICAgTWFwIHsgJ2Zvby5qcycgPT4gTWFwIHsgJ2Jhci5qcycgPT4gU2V0IHsgJ28yJyB9IH0gfVxyXG4gKlxyXG4gKiBAdHlwZSB7TWFwPHN0cmluZywgTWFwPHN0cmluZywgU2V0PHN0cmluZz4+Pn1cclxuICovXHJcbmNvbnN0IGltcG9ydExpc3QgPSBuZXcgTWFwKCk7XHJcblxyXG4vKipcclxuICogTGlzdCBvZiBleHBvcnRzIHBlciBmaWxlLlxyXG4gKlxyXG4gKiBSZXByZXNlbnRlZCBieSBhIHR3by1sZXZlbCBNYXAgdG8gYW4gb2JqZWN0IG9mIG1ldGFkYXRhLiBUaGUgdXBwZXItbGV2ZWwgTWFwXHJcbiAqIGtleXMgYXJlIHRoZSBwYXRocyB0byB0aGUgbW9kdWxlcyBjb250YWluaW5nIHRoZSBleHBvcnRzLCB3aGlsZSB0aGVcclxuICogbG93ZXItbGV2ZWwgTWFwIGtleXMgYXJlIHRoZSBzcGVjaWZpYyBpZGVudGlmaWVycyBvciBzcGVjaWFsIEFTVCBub2RlIG5hbWVzXHJcbiAqIGJlaW5nIGV4cG9ydGVkLiBUaGUgbGVhZi1sZXZlbCBtZXRhZGF0YSBvYmplY3QgYXQgdGhlIG1vbWVudCBvbmx5IGNvbnRhaW5zIGFcclxuICogYHdoZXJlVXNlZGAgcHJvcGVydHksIHdoaWNoIGNvbnRhaW5zIGEgU2V0IG9mIHBhdGhzIHRvIG1vZHVsZXMgdGhhdCBpbXBvcnRcclxuICogdGhlIG5hbWUuXHJcbiAqXHJcbiAqIEZvciBleGFtcGxlLCBpZiB3ZSBoYXZlIGEgZmlsZSBuYW1lZCBiYXIuanMgY29udGFpbmluZyB0aGUgZm9sbG93aW5nIGV4cG9ydHM6XHJcbiAqXHJcbiAqICAgY29uc3QgbzIgPSAnYmFyJztcclxuICogICBleHBvcnQgeyBvMiB9O1xyXG4gKlxyXG4gKiBBbmQgYSBmaWxlIG5hbWVkIGZvby5qcyBjb250YWluaW5nIHRoZSBmb2xsb3dpbmcgaW1wb3J0OlxyXG4gKlxyXG4gKiAgIGltcG9ydCB7IG8yIH0gZnJvbSAnLi9iYXIuanMnO1xyXG4gKlxyXG4gKiBUaGVuIHdlIHdpbGwgaGF2ZSBhIHN0cnVjdHVyZSB0aGF0IGxvb2tzIGxpa2U6XHJcbiAqXHJcbiAqICAgTWFwIHsgJ2Jhci5qcycgPT4gTWFwIHsgJ28yJyA9PiB7IHdoZXJlVXNlZDogU2V0IHsgJ2Zvby5qcycgfSB9IH0gfVxyXG4gKlxyXG4gKiBAdHlwZSB7TWFwPHN0cmluZywgTWFwPHN0cmluZywgb2JqZWN0Pj59XHJcbiAqL1xyXG5jb25zdCBleHBvcnRMaXN0ID0gbmV3IE1hcCgpO1xyXG5cclxuY29uc3QgdmlzaXRvcktleU1hcCA9IG5ldyBNYXAoKTtcclxuXHJcbmNvbnN0IGlnbm9yZWRGaWxlcyA9IG5ldyBTZXQoKTtcclxuY29uc3QgZmlsZXNPdXRzaWRlU3JjID0gbmV3IFNldCgpO1xyXG5cclxuY29uc3QgaXNOb2RlTW9kdWxlID0gcGF0aCA9PiB7XHJcbiAgcmV0dXJuIC9cXC8obm9kZV9tb2R1bGVzKVxcLy8udGVzdChwYXRoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiByZWFkIGFsbCBmaWxlcyBtYXRjaGluZyB0aGUgcGF0dGVybnMgaW4gc3JjIGFuZCBpZ25vcmVFeHBvcnRzXHJcbiAqXHJcbiAqIHJldHVybiBhbGwgZmlsZXMgbWF0Y2hpbmcgc3JjIHBhdHRlcm4sIHdoaWNoIGFyZSBub3QgbWF0Y2hpbmcgdGhlIGlnbm9yZUV4cG9ydHMgcGF0dGVyblxyXG4gKi9cclxuY29uc3QgcmVzb2x2ZUZpbGVzID0gKHNyYywgaWdub3JlRXhwb3J0cywgY29udGV4dCkgPT4ge1xyXG4gIGNvbnN0IGV4dGVuc2lvbnMgPSBBcnJheS5mcm9tKGdldEZpbGVFeHRlbnNpb25zKGNvbnRleHQuc2V0dGluZ3MpKTtcclxuXHJcbiAgY29uc3Qgc3JjRmlsZXMgPSBuZXcgU2V0KCk7XHJcbiAgY29uc3Qgc3JjRmlsZUxpc3QgPSBsaXN0RmlsZXNUb1Byb2Nlc3Moc3JjLCBleHRlbnNpb25zKTtcclxuXHJcbiAgLy8gcHJlcGFyZSBsaXN0IG9mIGlnbm9yZWQgZmlsZXNcclxuICBjb25zdCBpZ25vcmVkRmlsZXNMaXN0ID0gIGxpc3RGaWxlc1RvUHJvY2VzcyhpZ25vcmVFeHBvcnRzLCBleHRlbnNpb25zKTtcclxuICBpZ25vcmVkRmlsZXNMaXN0LmZvckVhY2goKHsgZmlsZW5hbWUgfSkgPT4gaWdub3JlZEZpbGVzLmFkZChmaWxlbmFtZSkpO1xyXG5cclxuICAvLyBwcmVwYXJlIGxpc3Qgb2Ygc291cmNlIGZpbGVzLCBkb24ndCBjb25zaWRlciBmaWxlcyBmcm9tIG5vZGVfbW9kdWxlc1xyXG4gIHNyY0ZpbGVMaXN0LmZpbHRlcigoeyBmaWxlbmFtZSB9KSA9PiAhaXNOb2RlTW9kdWxlKGZpbGVuYW1lKSkuZm9yRWFjaCgoeyBmaWxlbmFtZSB9KSA9PiB7XHJcbiAgICBzcmNGaWxlcy5hZGQoZmlsZW5hbWUpO1xyXG4gIH0pO1xyXG4gIHJldHVybiBzcmNGaWxlcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBwYXJzZSBhbGwgc291cmNlIGZpbGVzIGFuZCBidWlsZCB1cCAyIG1hcHMgY29udGFpbmluZyB0aGUgZXhpc3RpbmcgaW1wb3J0cyBhbmQgZXhwb3J0c1xyXG4gKi9cclxuY29uc3QgcHJlcGFyZUltcG9ydHNBbmRFeHBvcnRzID0gKHNyY0ZpbGVzLCBjb250ZXh0KSA9PiB7XHJcbiAgY29uc3QgZXhwb3J0QWxsID0gbmV3IE1hcCgpO1xyXG4gIHNyY0ZpbGVzLmZvckVhY2goZmlsZSA9PiB7XHJcbiAgICBjb25zdCBleHBvcnRzID0gbmV3IE1hcCgpO1xyXG4gICAgY29uc3QgaW1wb3J0cyA9IG5ldyBNYXAoKTtcclxuICAgIGNvbnN0IGN1cnJlbnRFeHBvcnRzID0gRXhwb3J0cy5nZXQoZmlsZSwgY29udGV4dCk7XHJcbiAgICBpZiAoY3VycmVudEV4cG9ydHMpIHtcclxuICAgICAgY29uc3Qge1xyXG4gICAgICAgIGRlcGVuZGVuY2llcyxcclxuICAgICAgICByZWV4cG9ydHMsXHJcbiAgICAgICAgaW1wb3J0czogbG9jYWxJbXBvcnRMaXN0LFxyXG4gICAgICAgIG5hbWVzcGFjZSxcclxuICAgICAgICB2aXNpdG9yS2V5cyxcclxuICAgICAgfSA9IGN1cnJlbnRFeHBvcnRzO1xyXG5cclxuICAgICAgdmlzaXRvcktleU1hcC5zZXQoZmlsZSwgdmlzaXRvcktleXMpO1xyXG4gICAgICAvLyBkZXBlbmRlbmNpZXMgPT09IGV4cG9ydCAqIGZyb21cclxuICAgICAgY29uc3QgY3VycmVudEV4cG9ydEFsbCA9IG5ldyBTZXQoKTtcclxuICAgICAgZGVwZW5kZW5jaWVzLmZvckVhY2goZ2V0RGVwZW5kZW5jeSA9PiB7XHJcbiAgICAgICAgY29uc3QgZGVwZW5kZW5jeSA9IGdldERlcGVuZGVuY3koKTtcclxuICAgICAgICBpZiAoZGVwZW5kZW5jeSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3VycmVudEV4cG9ydEFsbC5hZGQoZGVwZW5kZW5jeS5wYXRoKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGV4cG9ydEFsbC5zZXQoZmlsZSwgY3VycmVudEV4cG9ydEFsbCk7XHJcblxyXG4gICAgICByZWV4cG9ydHMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xyXG4gICAgICAgIGlmIChrZXkgPT09IERFRkFVTFQpIHtcclxuICAgICAgICAgIGV4cG9ydHMuc2V0KElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUiwgeyB3aGVyZVVzZWQ6IG5ldyBTZXQoKSB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZXhwb3J0cy5zZXQoa2V5LCB7IHdoZXJlVXNlZDogbmV3IFNldCgpIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCByZWV4cG9ydCA9ICB2YWx1ZS5nZXRJbXBvcnQoKTtcclxuICAgICAgICBpZiAoIXJlZXhwb3J0KSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBsb2NhbEltcG9ydCA9IGltcG9ydHMuZ2V0KHJlZXhwb3J0LnBhdGgpO1xyXG4gICAgICAgIGxldCBjdXJyZW50VmFsdWU7XHJcbiAgICAgICAgaWYgKHZhbHVlLmxvY2FsID09PSBERUZBVUxUKSB7XHJcbiAgICAgICAgICBjdXJyZW50VmFsdWUgPSBJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IHZhbHVlLmxvY2FsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIGxvY2FsSW1wb3J0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgbG9jYWxJbXBvcnQgPSBuZXcgU2V0KFsuLi5sb2NhbEltcG9ydCwgY3VycmVudFZhbHVlXSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGxvY2FsSW1wb3J0ID0gbmV3IFNldChbY3VycmVudFZhbHVlXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGltcG9ydHMuc2V0KHJlZXhwb3J0LnBhdGgsIGxvY2FsSW1wb3J0KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBsb2NhbEltcG9ydExpc3QuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xyXG4gICAgICAgIGlmIChpc05vZGVNb2R1bGUoa2V5KSkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBsb2NhbEltcG9ydCA9IGltcG9ydHMuZ2V0KGtleSkgfHwgbmV3IFNldCgpO1xyXG4gICAgICAgIHZhbHVlLmRlY2xhcmF0aW9ucy5mb3JFYWNoKCh7IGltcG9ydGVkU3BlY2lmaWVycyB9KSA9PlxyXG4gICAgICAgICAgaW1wb3J0ZWRTcGVjaWZpZXJzLmZvckVhY2goc3BlY2lmaWVyID0+IGxvY2FsSW1wb3J0LmFkZChzcGVjaWZpZXIpKSxcclxuICAgICAgICApO1xyXG4gICAgICAgIGltcG9ydHMuc2V0KGtleSwgbG9jYWxJbXBvcnQpO1xyXG4gICAgICB9KTtcclxuICAgICAgaW1wb3J0TGlzdC5zZXQoZmlsZSwgaW1wb3J0cyk7XHJcblxyXG4gICAgICAvLyBidWlsZCB1cCBleHBvcnQgbGlzdCBvbmx5LCBpZiBmaWxlIGlzIG5vdCBpZ25vcmVkXHJcbiAgICAgIGlmIChpZ25vcmVkRmlsZXMuaGFzKGZpbGUpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIG5hbWVzcGFjZS5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XHJcbiAgICAgICAgaWYgKGtleSA9PT0gREVGQVVMVCkge1xyXG4gICAgICAgICAgZXhwb3J0cy5zZXQoSU1QT1JUX0RFRkFVTFRfU1BFQ0lGSUVSLCB7IHdoZXJlVXNlZDogbmV3IFNldCgpIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBleHBvcnRzLnNldChrZXksIHsgd2hlcmVVc2VkOiBuZXcgU2V0KCkgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIGV4cG9ydHMuc2V0KEVYUE9SVF9BTExfREVDTEFSQVRJT04sIHsgd2hlcmVVc2VkOiBuZXcgU2V0KCkgfSk7XHJcbiAgICBleHBvcnRzLnNldChJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUiwgeyB3aGVyZVVzZWQ6IG5ldyBTZXQoKSB9KTtcclxuICAgIGV4cG9ydExpc3Quc2V0KGZpbGUsIGV4cG9ydHMpO1xyXG4gIH0pO1xyXG4gIGV4cG9ydEFsbC5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XHJcbiAgICB2YWx1ZS5mb3JFYWNoKHZhbCA9PiB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRFeHBvcnRzID0gZXhwb3J0TGlzdC5nZXQodmFsKTtcclxuICAgICAgaWYgKGN1cnJlbnRFeHBvcnRzKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudEV4cG9ydCA9IGN1cnJlbnRFeHBvcnRzLmdldChFWFBPUlRfQUxMX0RFQ0xBUkFUSU9OKTtcclxuICAgICAgICBjdXJyZW50RXhwb3J0LndoZXJlVXNlZC5hZGQoa2V5KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn07XHJcblxyXG4vKipcclxuICogdHJhdmVyc2UgdGhyb3VnaCBhbGwgaW1wb3J0cyBhbmQgYWRkIHRoZSByZXNwZWN0aXZlIHBhdGggdG8gdGhlIHdoZXJlVXNlZC1saXN0XHJcbiAqIG9mIHRoZSBjb3JyZXNwb25kaW5nIGV4cG9ydFxyXG4gKi9cclxuY29uc3QgZGV0ZXJtaW5lVXNhZ2UgPSAoKSA9PiB7XHJcbiAgaW1wb3J0TGlzdC5mb3JFYWNoKChsaXN0VmFsdWUsIGxpc3RLZXkpID0+IHtcclxuICAgIGxpc3RWYWx1ZS5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XHJcbiAgICAgIGNvbnN0IGV4cG9ydHMgPSBleHBvcnRMaXN0LmdldChrZXkpO1xyXG4gICAgICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgdmFsdWUuZm9yRWFjaChjdXJyZW50SW1wb3J0ID0+IHtcclxuICAgICAgICAgIGxldCBzcGVjaWZpZXI7XHJcbiAgICAgICAgICBpZiAoY3VycmVudEltcG9ydCA9PT0gSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIpIHtcclxuICAgICAgICAgICAgc3BlY2lmaWVyID0gSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVI7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbXBvcnQgPT09IElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUikge1xyXG4gICAgICAgICAgICBzcGVjaWZpZXIgPSBJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVI7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzcGVjaWZpZXIgPSBjdXJyZW50SW1wb3J0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHR5cGVvZiBzcGVjaWZpZXIgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGV4cG9ydFN0YXRlbWVudCA9IGV4cG9ydHMuZ2V0KHNwZWNpZmllcik7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXhwb3J0U3RhdGVtZW50ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHsgd2hlcmVVc2VkIH0gPSBleHBvcnRTdGF0ZW1lbnQ7XHJcbiAgICAgICAgICAgICAgd2hlcmVVc2VkLmFkZChsaXN0S2V5KTtcclxuICAgICAgICAgICAgICBleHBvcnRzLnNldChzcGVjaWZpZXIsIHsgd2hlcmVVc2VkIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pO1xyXG59O1xyXG5cclxuY29uc3QgZ2V0U3JjID0gc3JjID0+IHtcclxuICBpZiAoc3JjKSB7XHJcbiAgICByZXR1cm4gc3JjO1xyXG4gIH1cclxuICByZXR1cm4gW3Byb2Nlc3MuY3dkKCldO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHByZXBhcmUgdGhlIGxpc3RzIG9mIGV4aXN0aW5nIGltcG9ydHMgYW5kIGV4cG9ydHMgLSBzaG91bGQgb25seSBiZSBleGVjdXRlZCBvbmNlIGF0XHJcbiAqIHRoZSBzdGFydCBvZiBhIG5ldyBlc2xpbnQgcnVuXHJcbiAqL1xyXG5sZXQgc3JjRmlsZXM7XHJcbmxldCBsYXN0UHJlcGFyZUtleTtcclxuY29uc3QgZG9QcmVwYXJhdGlvbiA9IChzcmMsIGlnbm9yZUV4cG9ydHMsIGNvbnRleHQpID0+IHtcclxuICBjb25zdCBwcmVwYXJlS2V5ID0gSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgc3JjOiAoc3JjIHx8IFtdKS5zb3J0KCksXHJcbiAgICBpZ25vcmVFeHBvcnRzOiAoaWdub3JlRXhwb3J0cyB8fCBbXSkuc29ydCgpLFxyXG4gICAgZXh0ZW5zaW9uczogQXJyYXkuZnJvbShnZXRGaWxlRXh0ZW5zaW9ucyhjb250ZXh0LnNldHRpbmdzKSkuc29ydCgpLFxyXG4gIH0pO1xyXG4gIGlmIChwcmVwYXJlS2V5ID09PSBsYXN0UHJlcGFyZUtleSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaW1wb3J0TGlzdC5jbGVhcigpO1xyXG4gIGV4cG9ydExpc3QuY2xlYXIoKTtcclxuICBpZ25vcmVkRmlsZXMuY2xlYXIoKTtcclxuICBmaWxlc091dHNpZGVTcmMuY2xlYXIoKTtcclxuXHJcbiAgc3JjRmlsZXMgPSByZXNvbHZlRmlsZXMoZ2V0U3JjKHNyYyksIGlnbm9yZUV4cG9ydHMsIGNvbnRleHQpO1xyXG4gIHByZXBhcmVJbXBvcnRzQW5kRXhwb3J0cyhzcmNGaWxlcywgY29udGV4dCk7XHJcbiAgZGV0ZXJtaW5lVXNhZ2UoKTtcclxuICBsYXN0UHJlcGFyZUtleSA9IHByZXBhcmVLZXk7XHJcbn07XHJcblxyXG5jb25zdCBuZXdOYW1lc3BhY2VJbXBvcnRFeGlzdHMgPSBzcGVjaWZpZXJzID0+XHJcbiAgc3BlY2lmaWVycy5zb21lKCh7IHR5cGUgfSkgPT4gdHlwZSA9PT0gSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIpO1xyXG5cclxuY29uc3QgbmV3RGVmYXVsdEltcG9ydEV4aXN0cyA9IHNwZWNpZmllcnMgPT5cclxuICBzcGVjaWZpZXJzLnNvbWUoKHsgdHlwZSB9KSA9PiB0eXBlID09PSBJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIpO1xyXG5cclxuY29uc3QgZmlsZUlzSW5Qa2cgPSBmaWxlID0+IHtcclxuICBjb25zdCB7IHBhdGgsIHBrZyB9ID0gcmVhZFBrZ1VwKHsgY3dkOiBmaWxlIH0pO1xyXG4gIGNvbnN0IGJhc2VQYXRoID0gZGlybmFtZShwYXRoKTtcclxuXHJcbiAgY29uc3QgY2hlY2tQa2dGaWVsZFN0cmluZyA9IHBrZ0ZpZWxkID0+IHtcclxuICAgIGlmIChqb2luKGJhc2VQYXRoLCBwa2dGaWVsZCkgPT09IGZpbGUpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgY2hlY2tQa2dGaWVsZE9iamVjdCA9IHBrZ0ZpZWxkID0+IHtcclxuICAgIGNvbnN0IHBrZ0ZpZWxkRmlsZXMgPSB2YWx1ZXMocGtnRmllbGQpXHJcbiAgICAgIC5maWx0ZXIoKHZhbHVlKSA9PiB0eXBlb2YgdmFsdWUgIT09ICdib29sZWFuJylcclxuICAgICAgLm1hcCh2YWx1ZSA9PiBqb2luKGJhc2VQYXRoLCB2YWx1ZSkpO1xyXG5cclxuICAgIGlmIChpbmNsdWRlcyhwa2dGaWVsZEZpbGVzLCBmaWxlKSkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBjaGVja1BrZ0ZpZWxkID0gcGtnRmllbGQgPT4ge1xyXG4gICAgaWYgKHR5cGVvZiBwa2dGaWVsZCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgcmV0dXJuIGNoZWNrUGtnRmllbGRTdHJpbmcocGtnRmllbGQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgcGtnRmllbGQgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIHJldHVybiBjaGVja1BrZ0ZpZWxkT2JqZWN0KHBrZ0ZpZWxkKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBpZiAocGtnLnByaXZhdGUgPT09IHRydWUpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGlmIChwa2cuYmluKSB7XHJcbiAgICBpZiAoY2hlY2tQa2dGaWVsZChwa2cuYmluKSkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmIChwa2cuYnJvd3Nlcikge1xyXG4gICAgaWYgKGNoZWNrUGtnRmllbGQocGtnLmJyb3dzZXIpKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaWYgKHBrZy5tYWluKSB7XHJcbiAgICBpZiAoY2hlY2tQa2dGaWVsZFN0cmluZyhwa2cubWFpbikpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBtZXRhOiB7XHJcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIGNhdGVnb3J5OiAnSGVscGZ1bCB3YXJuaW5ncycsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnRm9yYmlkIG1vZHVsZXMgd2l0aG91dCBleHBvcnRzLCBvciBleHBvcnRzIHdpdGhvdXQgbWF0Y2hpbmcgaW1wb3J0IGluIGFub3RoZXIgbW9kdWxlLicsXHJcbiAgICAgIHVybDogZG9jc1VybCgnbm8tdW51c2VkLW1vZHVsZXMnKSxcclxuICAgIH0sXHJcbiAgICBzY2hlbWE6IFt7XHJcbiAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICBzcmM6IHtcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnZmlsZXMvcGF0aHMgdG8gYmUgYW5hbHl6ZWQgKG9ubHkgZm9yIHVudXNlZCBleHBvcnRzKScsXHJcbiAgICAgICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICAgICAgbWluSXRlbXM6IDEsXHJcbiAgICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlnbm9yZUV4cG9ydHM6IHtcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgICAnZmlsZXMvcGF0aHMgZm9yIHdoaWNoIHVudXNlZCBleHBvcnRzIHdpbGwgbm90IGJlIHJlcG9ydGVkIChlLmcgbW9kdWxlIGVudHJ5IHBvaW50cyknLFxyXG4gICAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICAgIG1pbkl0ZW1zOiAxLFxyXG4gICAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgICAgIG1pbkxlbmd0aDogMSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtaXNzaW5nRXhwb3J0czoge1xyXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdyZXBvcnQgbW9kdWxlcyB3aXRob3V0IGFueSBleHBvcnRzJyxcclxuICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVudXNlZEV4cG9ydHM6IHtcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAncmVwb3J0IGV4cG9ydHMgd2l0aG91dCBhbnkgdXNhZ2UnLFxyXG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIG5vdDoge1xyXG4gICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgIHVudXNlZEV4cG9ydHM6IHsgZW51bTogW2ZhbHNlXSB9LFxyXG4gICAgICAgICAgbWlzc2luZ0V4cG9ydHM6IHsgZW51bTogW2ZhbHNlXSB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIGFueU9mOlt7XHJcbiAgICAgICAgbm90OiB7XHJcbiAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgIHVudXNlZEV4cG9ydHM6IHsgZW51bTogW3RydWVdIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVxdWlyZWQ6IFsnbWlzc2luZ0V4cG9ydHMnXSxcclxuICAgICAgfSwge1xyXG4gICAgICAgIG5vdDoge1xyXG4gICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICBtaXNzaW5nRXhwb3J0czogeyBlbnVtOiBbdHJ1ZV0gfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXF1aXJlZDogWyd1bnVzZWRFeHBvcnRzJ10sXHJcbiAgICAgIH0sIHtcclxuICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICB1bnVzZWRFeHBvcnRzOiB7IGVudW06IFt0cnVlXSB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVxdWlyZWQ6IFsndW51c2VkRXhwb3J0cyddLFxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgbWlzc2luZ0V4cG9ydHM6IHsgZW51bTogW3RydWVdIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXF1aXJlZDogWydtaXNzaW5nRXhwb3J0cyddLFxyXG4gICAgICB9XSxcclxuICAgIH1dLFxyXG4gIH0sXHJcblxyXG4gIGNyZWF0ZTogY29udGV4dCA9PiB7XHJcbiAgICBjb25zdCB7XHJcbiAgICAgIHNyYyxcclxuICAgICAgaWdub3JlRXhwb3J0cyA9IFtdLFxyXG4gICAgICBtaXNzaW5nRXhwb3J0cyxcclxuICAgICAgdW51c2VkRXhwb3J0cyxcclxuICAgIH0gPSBjb250ZXh0Lm9wdGlvbnNbMF0gfHwge307XHJcblxyXG4gICAgaWYgKHVudXNlZEV4cG9ydHMpIHtcclxuICAgICAgZG9QcmVwYXJhdGlvbihzcmMsIGlnbm9yZUV4cG9ydHMsIGNvbnRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZpbGUgPSBjb250ZXh0LmdldFBoeXNpY2FsRmlsZW5hbWUgPyBjb250ZXh0LmdldFBoeXNpY2FsRmlsZW5hbWUoKSA6IGNvbnRleHQuZ2V0RmlsZW5hbWUoKTtcclxuXHJcbiAgICBjb25zdCBjaGVja0V4cG9ydFByZXNlbmNlID0gbm9kZSA9PiB7XHJcbiAgICAgIGlmICghbWlzc2luZ0V4cG9ydHMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChpZ25vcmVkRmlsZXMuaGFzKGZpbGUpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBleHBvcnRDb3VudCA9IGV4cG9ydExpc3QuZ2V0KGZpbGUpO1xyXG4gICAgICBjb25zdCBleHBvcnRBbGwgPSBleHBvcnRDb3VudC5nZXQoRVhQT1JUX0FMTF9ERUNMQVJBVElPTik7XHJcbiAgICAgIGNvbnN0IG5hbWVzcGFjZUltcG9ydHMgPSBleHBvcnRDb3VudC5nZXQoSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIpO1xyXG5cclxuICAgICAgZXhwb3J0Q291bnQuZGVsZXRlKEVYUE9SVF9BTExfREVDTEFSQVRJT04pO1xyXG4gICAgICBleHBvcnRDb3VudC5kZWxldGUoSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIpO1xyXG4gICAgICBpZiAoZXhwb3J0Q291bnQuc2l6ZSA8IDEpIHtcclxuICAgICAgICAvLyBub2RlLmJvZHlbMF0gPT09ICd1bmRlZmluZWQnIG9ubHkgaGFwcGVucywgaWYgZXZlcnl0aGluZyBpcyBjb21tZW50ZWQgb3V0IGluIHRoZSBmaWxlXHJcbiAgICAgICAgLy8gYmVpbmcgbGludGVkXHJcbiAgICAgICAgY29udGV4dC5yZXBvcnQobm9kZS5ib2R5WzBdID8gbm9kZS5ib2R5WzBdIDogbm9kZSwgJ05vIGV4cG9ydHMgZm91bmQnKTtcclxuICAgICAgfVxyXG4gICAgICBleHBvcnRDb3VudC5zZXQoRVhQT1JUX0FMTF9ERUNMQVJBVElPTiwgZXhwb3J0QWxsKTtcclxuICAgICAgZXhwb3J0Q291bnQuc2V0KElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSLCBuYW1lc3BhY2VJbXBvcnRzKTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgY2hlY2tVc2FnZSA9IChub2RlLCBleHBvcnRlZFZhbHVlKSA9PiB7XHJcbiAgICAgIGlmICghdW51c2VkRXhwb3J0cykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGlnbm9yZWRGaWxlcy5oYXMoZmlsZSkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChmaWxlSXNJblBrZyhmaWxlKSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGZpbGVzT3V0c2lkZVNyYy5oYXMoZmlsZSkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG1ha2Ugc3VyZSBmaWxlIHRvIGJlIGxpbnRlZCBpcyBpbmNsdWRlZCBpbiBzb3VyY2UgZmlsZXNcclxuICAgICAgaWYgKCFzcmNGaWxlcy5oYXMoZmlsZSkpIHtcclxuICAgICAgICBzcmNGaWxlcyA9IHJlc29sdmVGaWxlcyhnZXRTcmMoc3JjKSwgaWdub3JlRXhwb3J0cywgY29udGV4dCk7XHJcbiAgICAgICAgaWYgKCFzcmNGaWxlcy5oYXMoZmlsZSkpIHtcclxuICAgICAgICAgIGZpbGVzT3V0c2lkZVNyYy5hZGQoZmlsZSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBleHBvcnRzID0gZXhwb3J0TGlzdC5nZXQoZmlsZSk7XHJcblxyXG4gICAgICAvLyBzcGVjaWFsIGNhc2U6IGV4cG9ydCAqIGZyb21cclxuICAgICAgY29uc3QgZXhwb3J0QWxsID0gZXhwb3J0cy5nZXQoRVhQT1JUX0FMTF9ERUNMQVJBVElPTik7XHJcbiAgICAgIGlmICh0eXBlb2YgZXhwb3J0QWxsICE9PSAndW5kZWZpbmVkJyAmJiBleHBvcnRlZFZhbHVlICE9PSBJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIpIHtcclxuICAgICAgICBpZiAoZXhwb3J0QWxsLndoZXJlVXNlZC5zaXplID4gMCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gc3BlY2lhbCBjYXNlOiBuYW1lc3BhY2UgaW1wb3J0XHJcbiAgICAgIGNvbnN0IG5hbWVzcGFjZUltcG9ydHMgPSBleHBvcnRzLmdldChJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUik7XHJcbiAgICAgIGlmICh0eXBlb2YgbmFtZXNwYWNlSW1wb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICBpZiAobmFtZXNwYWNlSW1wb3J0cy53aGVyZVVzZWQuc2l6ZSA+IDApIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGV4cG9ydHNMaXN0IHdpbGwgYWx3YXlzIG1hcCBhbnkgaW1wb3J0ZWQgdmFsdWUgb2YgJ2RlZmF1bHQnIHRvICdJbXBvcnREZWZhdWx0U3BlY2lmaWVyJ1xyXG4gICAgICBjb25zdCBleHBvcnRzS2V5ID0gZXhwb3J0ZWRWYWx1ZSA9PT0gREVGQVVMVCA/IElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUiA6IGV4cG9ydGVkVmFsdWU7XHJcblxyXG4gICAgICBjb25zdCBleHBvcnRTdGF0ZW1lbnQgPSBleHBvcnRzLmdldChleHBvcnRzS2V5KTtcclxuXHJcbiAgICAgIGNvbnN0IHZhbHVlID0gZXhwb3J0c0tleSA9PT0gSU1QT1JUX0RFRkFVTFRfU1BFQ0lGSUVSID8gREVGQVVMVCA6IGV4cG9ydHNLZXk7XHJcblxyXG4gICAgICBpZiAodHlwZW9mIGV4cG9ydFN0YXRlbWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICBpZiAoZXhwb3J0U3RhdGVtZW50LndoZXJlVXNlZC5zaXplIDwgMSkge1xyXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoXHJcbiAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgIGBleHBvcnRlZCBkZWNsYXJhdGlvbiAnJHt2YWx1ZX0nIG5vdCB1c2VkIHdpdGhpbiBvdGhlciBtb2R1bGVzYCxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnRleHQucmVwb3J0KFxyXG4gICAgICAgICAgbm9kZSxcclxuICAgICAgICAgIGBleHBvcnRlZCBkZWNsYXJhdGlvbiAnJHt2YWx1ZX0nIG5vdCB1c2VkIHdpdGhpbiBvdGhlciBtb2R1bGVzYCxcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogb25seSB1c2VmdWwgZm9yIHRvb2xzIGxpa2UgdnNjb2RlLWVzbGludFxyXG4gICAgICpcclxuICAgICAqIHVwZGF0ZSBsaXN0cyBvZiBleGlzdGluZyBleHBvcnRzIGR1cmluZyBydW50aW1lXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IHVwZGF0ZUV4cG9ydFVzYWdlID0gbm9kZSA9PiB7XHJcbiAgICAgIGlmIChpZ25vcmVkRmlsZXMuaGFzKGZpbGUpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgZXhwb3J0cyA9IGV4cG9ydExpc3QuZ2V0KGZpbGUpO1xyXG5cclxuICAgICAgLy8gbmV3IG1vZHVsZSBoYXMgYmVlbiBjcmVhdGVkIGR1cmluZyBydW50aW1lXHJcbiAgICAgIC8vIGluY2x1ZGUgaXQgaW4gZnVydGhlciBwcm9jZXNzaW5nXHJcbiAgICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICBleHBvcnRzID0gbmV3IE1hcCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBuZXdFeHBvcnRzID0gbmV3IE1hcCgpO1xyXG4gICAgICBjb25zdCBuZXdFeHBvcnRJZGVudGlmaWVycyA9IG5ldyBTZXQoKTtcclxuXHJcbiAgICAgIG5vZGUuYm9keS5mb3JFYWNoKCh7IHR5cGUsIGRlY2xhcmF0aW9uLCBzcGVjaWZpZXJzIH0pID0+IHtcclxuICAgICAgICBpZiAodHlwZSA9PT0gRVhQT1JUX0RFRkFVTFRfREVDTEFSQVRJT04pIHtcclxuICAgICAgICAgIG5ld0V4cG9ydElkZW50aWZpZXJzLmFkZChJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZSA9PT0gRVhQT1JUX05BTUVEX0RFQ0xBUkFUSU9OKSB7XHJcbiAgICAgICAgICBpZiAoc3BlY2lmaWVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHNwZWNpZmllcnMuZm9yRWFjaChzcGVjaWZpZXIgPT4ge1xyXG4gICAgICAgICAgICAgIGlmIChzcGVjaWZpZXIuZXhwb3J0ZWQpIHtcclxuICAgICAgICAgICAgICAgIG5ld0V4cG9ydElkZW50aWZpZXJzLmFkZChzcGVjaWZpZXIuZXhwb3J0ZWQubmFtZSB8fCBzcGVjaWZpZXIuZXhwb3J0ZWQudmFsdWUpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmb3JFYWNoRGVjbGFyYXRpb25JZGVudGlmaWVyKGRlY2xhcmF0aW9uLCAobmFtZSkgPT4ge1xyXG4gICAgICAgICAgICBuZXdFeHBvcnRJZGVudGlmaWVycy5hZGQobmFtZSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gb2xkIGV4cG9ydHMgZXhpc3Qgd2l0aGluIGxpc3Qgb2YgbmV3IGV4cG9ydHMgaWRlbnRpZmllcnM6IGFkZCB0byBtYXAgb2YgbmV3IGV4cG9ydHNcclxuICAgICAgZXhwb3J0cy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XHJcbiAgICAgICAgaWYgKG5ld0V4cG9ydElkZW50aWZpZXJzLmhhcyhrZXkpKSB7XHJcbiAgICAgICAgICBuZXdFeHBvcnRzLnNldChrZXksIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gbmV3IGV4cG9ydCBpZGVudGlmaWVycyBhZGRlZDogYWRkIHRvIG1hcCBvZiBuZXcgZXhwb3J0c1xyXG4gICAgICBuZXdFeHBvcnRJZGVudGlmaWVycy5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgICAgaWYgKCFleHBvcnRzLmhhcyhrZXkpKSB7XHJcbiAgICAgICAgICBuZXdFeHBvcnRzLnNldChrZXksIHsgd2hlcmVVc2VkOiBuZXcgU2V0KCkgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIHByZXNlcnZlIGluZm9ybWF0aW9uIGFib3V0IG5hbWVzcGFjZSBpbXBvcnRzXHJcbiAgICAgIGNvbnN0IGV4cG9ydEFsbCA9IGV4cG9ydHMuZ2V0KEVYUE9SVF9BTExfREVDTEFSQVRJT04pO1xyXG4gICAgICBsZXQgbmFtZXNwYWNlSW1wb3J0cyA9IGV4cG9ydHMuZ2V0KElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSKTtcclxuXHJcbiAgICAgIGlmICh0eXBlb2YgbmFtZXNwYWNlSW1wb3J0cyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICBuYW1lc3BhY2VJbXBvcnRzID0geyB3aGVyZVVzZWQ6IG5ldyBTZXQoKSB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBuZXdFeHBvcnRzLnNldChFWFBPUlRfQUxMX0RFQ0xBUkFUSU9OLCBleHBvcnRBbGwpO1xyXG4gICAgICBuZXdFeHBvcnRzLnNldChJTVBPUlRfTkFNRVNQQUNFX1NQRUNJRklFUiwgbmFtZXNwYWNlSW1wb3J0cyk7XHJcbiAgICAgIGV4cG9ydExpc3Quc2V0KGZpbGUsIG5ld0V4cG9ydHMpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIG9ubHkgdXNlZnVsIGZvciB0b29scyBsaWtlIHZzY29kZS1lc2xpbnRcclxuICAgICAqXHJcbiAgICAgKiB1cGRhdGUgbGlzdHMgb2YgZXhpc3RpbmcgaW1wb3J0cyBkdXJpbmcgcnVudGltZVxyXG4gICAgICovXHJcbiAgICBjb25zdCB1cGRhdGVJbXBvcnRVc2FnZSA9IG5vZGUgPT4ge1xyXG4gICAgICBpZiAoIXVudXNlZEV4cG9ydHMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBvbGRJbXBvcnRQYXRocyA9IGltcG9ydExpc3QuZ2V0KGZpbGUpO1xyXG4gICAgICBpZiAodHlwZW9mIG9sZEltcG9ydFBhdGhzID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIG9sZEltcG9ydFBhdGhzID0gbmV3IE1hcCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBvbGROYW1lc3BhY2VJbXBvcnRzID0gbmV3IFNldCgpO1xyXG4gICAgICBjb25zdCBuZXdOYW1lc3BhY2VJbXBvcnRzID0gbmV3IFNldCgpO1xyXG5cclxuICAgICAgY29uc3Qgb2xkRXhwb3J0QWxsID0gbmV3IFNldCgpO1xyXG4gICAgICBjb25zdCBuZXdFeHBvcnRBbGwgPSBuZXcgU2V0KCk7XHJcblxyXG4gICAgICBjb25zdCBvbGREZWZhdWx0SW1wb3J0cyA9IG5ldyBTZXQoKTtcclxuICAgICAgY29uc3QgbmV3RGVmYXVsdEltcG9ydHMgPSBuZXcgU2V0KCk7XHJcblxyXG4gICAgICBjb25zdCBvbGRJbXBvcnRzID0gbmV3IE1hcCgpO1xyXG4gICAgICBjb25zdCBuZXdJbXBvcnRzID0gbmV3IE1hcCgpO1xyXG4gICAgICBvbGRJbXBvcnRQYXRocy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XHJcbiAgICAgICAgaWYgKHZhbHVlLmhhcyhFWFBPUlRfQUxMX0RFQ0xBUkFUSU9OKSkge1xyXG4gICAgICAgICAgb2xkRXhwb3J0QWxsLmFkZChrZXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodmFsdWUuaGFzKElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSKSkge1xyXG4gICAgICAgICAgb2xkTmFtZXNwYWNlSW1wb3J0cy5hZGQoa2V5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHZhbHVlLmhhcyhJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIpKSB7XHJcbiAgICAgICAgICBvbGREZWZhdWx0SW1wb3J0cy5hZGQoa2V5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFsdWUuZm9yRWFjaCh2YWwgPT4ge1xyXG4gICAgICAgICAgaWYgKHZhbCAhPT0gSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIgJiZcclxuICAgICAgICAgICAgICB2YWwgIT09IElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUikge1xyXG4gICAgICAgICAgICBvbGRJbXBvcnRzLnNldCh2YWwsIGtleSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgZnVuY3Rpb24gcHJvY2Vzc0R5bmFtaWNJbXBvcnQoc291cmNlKSB7XHJcbiAgICAgICAgaWYgKHNvdXJjZS50eXBlICE9PSAnTGl0ZXJhbCcpIHtcclxuICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwID0gcmVzb2x2ZShzb3VyY2UudmFsdWUsIGNvbnRleHQpO1xyXG4gICAgICAgIGlmIChwID09IG51bGwpIHtcclxuICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBuZXdOYW1lc3BhY2VJbXBvcnRzLmFkZChwKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmlzaXQobm9kZSwgdmlzaXRvcktleU1hcC5nZXQoZmlsZSksIHtcclxuICAgICAgICBJbXBvcnRFeHByZXNzaW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICBwcm9jZXNzRHluYW1pY0ltcG9ydChjaGlsZC5zb3VyY2UpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgQ2FsbEV4cHJlc3Npb24oY2hpbGQpIHtcclxuICAgICAgICAgIGlmIChjaGlsZC5jYWxsZWUudHlwZSA9PT0gJ0ltcG9ydCcpIHtcclxuICAgICAgICAgICAgcHJvY2Vzc0R5bmFtaWNJbXBvcnQoY2hpbGQuYXJndW1lbnRzWzBdKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIG5vZGUuYm9keS5mb3JFYWNoKGFzdE5vZGUgPT4ge1xyXG4gICAgICAgIGxldCByZXNvbHZlZFBhdGg7XHJcblxyXG4gICAgICAgIC8vIHN1cHBvcnQgZm9yIGV4cG9ydCB7IHZhbHVlIH0gZnJvbSAnbW9kdWxlJ1xyXG4gICAgICAgIGlmIChhc3ROb2RlLnR5cGUgPT09IEVYUE9SVF9OQU1FRF9ERUNMQVJBVElPTikge1xyXG4gICAgICAgICAgaWYgKGFzdE5vZGUuc291cmNlKSB7XHJcbiAgICAgICAgICAgIHJlc29sdmVkUGF0aCA9IHJlc29sdmUoYXN0Tm9kZS5zb3VyY2UucmF3LnJlcGxhY2UoLygnfFwiKS9nLCAnJyksIGNvbnRleHQpO1xyXG4gICAgICAgICAgICBhc3ROb2RlLnNwZWNpZmllcnMuZm9yRWFjaChzcGVjaWZpZXIgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBzcGVjaWZpZXIubG9jYWwubmFtZSB8fCBzcGVjaWZpZXIubG9jYWwudmFsdWU7XHJcbiAgICAgICAgICAgICAgaWYgKG5hbWUgPT09IERFRkFVTFQpIHtcclxuICAgICAgICAgICAgICAgIG5ld0RlZmF1bHRJbXBvcnRzLmFkZChyZXNvbHZlZFBhdGgpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBuZXdJbXBvcnRzLnNldChuYW1lLCByZXNvbHZlZFBhdGgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYXN0Tm9kZS50eXBlID09PSBFWFBPUlRfQUxMX0RFQ0xBUkFUSU9OKSB7XHJcbiAgICAgICAgICByZXNvbHZlZFBhdGggPSByZXNvbHZlKGFzdE5vZGUuc291cmNlLnJhdy5yZXBsYWNlKC8oJ3xcIikvZywgJycpLCBjb250ZXh0KTtcclxuICAgICAgICAgIG5ld0V4cG9ydEFsbC5hZGQocmVzb2x2ZWRQYXRoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChhc3ROb2RlLnR5cGUgPT09IElNUE9SVF9ERUNMQVJBVElPTikge1xyXG4gICAgICAgICAgcmVzb2x2ZWRQYXRoID0gcmVzb2x2ZShhc3ROb2RlLnNvdXJjZS5yYXcucmVwbGFjZSgvKCd8XCIpL2csICcnKSwgY29udGV4dCk7XHJcbiAgICAgICAgICBpZiAoIXJlc29sdmVkUGF0aCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGlzTm9kZU1vZHVsZShyZXNvbHZlZFBhdGgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAobmV3TmFtZXNwYWNlSW1wb3J0RXhpc3RzKGFzdE5vZGUuc3BlY2lmaWVycykpIHtcclxuICAgICAgICAgICAgbmV3TmFtZXNwYWNlSW1wb3J0cy5hZGQocmVzb2x2ZWRQYXRoKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAobmV3RGVmYXVsdEltcG9ydEV4aXN0cyhhc3ROb2RlLnNwZWNpZmllcnMpKSB7XHJcbiAgICAgICAgICAgIG5ld0RlZmF1bHRJbXBvcnRzLmFkZChyZXNvbHZlZFBhdGgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGFzdE5vZGUuc3BlY2lmaWVycy5mb3JFYWNoKHNwZWNpZmllciA9PiB7XHJcbiAgICAgICAgICAgIGlmIChzcGVjaWZpZXIudHlwZSA9PT0gSU1QT1JUX0RFRkFVTFRfU1BFQ0lGSUVSIHx8XHJcbiAgICAgICAgICAgICAgICBzcGVjaWZpZXIudHlwZSA9PT0gSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIpIHtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV3SW1wb3J0cy5zZXQoc3BlY2lmaWVyLmltcG9ydGVkLm5hbWUgfHwgc3BlY2lmaWVyLmltcG9ydGVkLnZhbHVlLCByZXNvbHZlZFBhdGgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIG5ld0V4cG9ydEFsbC5mb3JFYWNoKHZhbHVlID0+IHtcclxuICAgICAgICBpZiAoIW9sZEV4cG9ydEFsbC5oYXModmFsdWUpKSB7XHJcbiAgICAgICAgICBsZXQgaW1wb3J0cyA9IG9sZEltcG9ydFBhdGhzLmdldCh2YWx1ZSk7XHJcbiAgICAgICAgICBpZiAodHlwZW9mIGltcG9ydHMgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGltcG9ydHMgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpbXBvcnRzLmFkZChFWFBPUlRfQUxMX0RFQ0xBUkFUSU9OKTtcclxuICAgICAgICAgIG9sZEltcG9ydFBhdGhzLnNldCh2YWx1ZSwgaW1wb3J0cyk7XHJcblxyXG4gICAgICAgICAgbGV0IGV4cG9ydHMgPSBleHBvcnRMaXN0LmdldCh2YWx1ZSk7XHJcbiAgICAgICAgICBsZXQgY3VycmVudEV4cG9ydDtcclxuICAgICAgICAgIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgY3VycmVudEV4cG9ydCA9IGV4cG9ydHMuZ2V0KEVYUE9SVF9BTExfREVDTEFSQVRJT04pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZXhwb3J0cyA9IG5ldyBNYXAoKTtcclxuICAgICAgICAgICAgZXhwb3J0TGlzdC5zZXQodmFsdWUsIGV4cG9ydHMpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudEV4cG9ydCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgY3VycmVudEV4cG9ydC53aGVyZVVzZWQuYWRkKGZpbGUpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3Qgd2hlcmVVc2VkID0gbmV3IFNldCgpO1xyXG4gICAgICAgICAgICB3aGVyZVVzZWQuYWRkKGZpbGUpO1xyXG4gICAgICAgICAgICBleHBvcnRzLnNldChFWFBPUlRfQUxMX0RFQ0xBUkFUSU9OLCB7IHdoZXJlVXNlZCB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgb2xkRXhwb3J0QWxsLmZvckVhY2godmFsdWUgPT4ge1xyXG4gICAgICAgIGlmICghbmV3RXhwb3J0QWxsLmhhcyh2YWx1ZSkpIHtcclxuICAgICAgICAgIGNvbnN0IGltcG9ydHMgPSBvbGRJbXBvcnRQYXRocy5nZXQodmFsdWUpO1xyXG4gICAgICAgICAgaW1wb3J0cy5kZWxldGUoRVhQT1JUX0FMTF9ERUNMQVJBVElPTik7XHJcblxyXG4gICAgICAgICAgY29uc3QgZXhwb3J0cyA9IGV4cG9ydExpc3QuZ2V0KHZhbHVlKTtcclxuICAgICAgICAgIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudEV4cG9ydCA9IGV4cG9ydHMuZ2V0KEVYUE9SVF9BTExfREVDTEFSQVRJT04pO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnRFeHBvcnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgY3VycmVudEV4cG9ydC53aGVyZVVzZWQuZGVsZXRlKGZpbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIG5ld0RlZmF1bHRJbXBvcnRzLmZvckVhY2godmFsdWUgPT4ge1xyXG4gICAgICAgIGlmICghb2xkRGVmYXVsdEltcG9ydHMuaGFzKHZhbHVlKSkge1xyXG4gICAgICAgICAgbGV0IGltcG9ydHMgPSBvbGRJbXBvcnRQYXRocy5nZXQodmFsdWUpO1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBpbXBvcnRzID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBpbXBvcnRzID0gbmV3IFNldCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaW1wb3J0cy5hZGQoSU1QT1JUX0RFRkFVTFRfU1BFQ0lGSUVSKTtcclxuICAgICAgICAgIG9sZEltcG9ydFBhdGhzLnNldCh2YWx1ZSwgaW1wb3J0cyk7XHJcblxyXG4gICAgICAgICAgbGV0IGV4cG9ydHMgPSBleHBvcnRMaXN0LmdldCh2YWx1ZSk7XHJcbiAgICAgICAgICBsZXQgY3VycmVudEV4cG9ydDtcclxuICAgICAgICAgIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgY3VycmVudEV4cG9ydCA9IGV4cG9ydHMuZ2V0KElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBleHBvcnRzID0gbmV3IE1hcCgpO1xyXG4gICAgICAgICAgICBleHBvcnRMaXN0LnNldCh2YWx1ZSwgZXhwb3J0cyk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50RXhwb3J0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBjdXJyZW50RXhwb3J0LndoZXJlVXNlZC5hZGQoZmlsZSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCB3aGVyZVVzZWQgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgICAgIHdoZXJlVXNlZC5hZGQoZmlsZSk7XHJcbiAgICAgICAgICAgIGV4cG9ydHMuc2V0KElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUiwgeyB3aGVyZVVzZWQgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIG9sZERlZmF1bHRJbXBvcnRzLmZvckVhY2godmFsdWUgPT4ge1xyXG4gICAgICAgIGlmICghbmV3RGVmYXVsdEltcG9ydHMuaGFzKHZhbHVlKSkge1xyXG4gICAgICAgICAgY29uc3QgaW1wb3J0cyA9IG9sZEltcG9ydFBhdGhzLmdldCh2YWx1ZSk7XHJcbiAgICAgICAgICBpbXBvcnRzLmRlbGV0ZShJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGV4cG9ydHMgPSBleHBvcnRMaXN0LmdldCh2YWx1ZSk7XHJcbiAgICAgICAgICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRFeHBvcnQgPSBleHBvcnRzLmdldChJTVBPUlRfREVGQVVMVF9TUEVDSUZJRVIpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnRFeHBvcnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgY3VycmVudEV4cG9ydC53aGVyZVVzZWQuZGVsZXRlKGZpbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIG5ld05hbWVzcGFjZUltcG9ydHMuZm9yRWFjaCh2YWx1ZSA9PiB7XHJcbiAgICAgICAgaWYgKCFvbGROYW1lc3BhY2VJbXBvcnRzLmhhcyh2YWx1ZSkpIHtcclxuICAgICAgICAgIGxldCBpbXBvcnRzID0gb2xkSW1wb3J0UGF0aHMuZ2V0KHZhbHVlKTtcclxuICAgICAgICAgIGlmICh0eXBlb2YgaW1wb3J0cyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgaW1wb3J0cyA9IG5ldyBTZXQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGltcG9ydHMuYWRkKElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSKTtcclxuICAgICAgICAgIG9sZEltcG9ydFBhdGhzLnNldCh2YWx1ZSwgaW1wb3J0cyk7XHJcblxyXG4gICAgICAgICAgbGV0IGV4cG9ydHMgPSBleHBvcnRMaXN0LmdldCh2YWx1ZSk7XHJcbiAgICAgICAgICBsZXQgY3VycmVudEV4cG9ydDtcclxuICAgICAgICAgIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgY3VycmVudEV4cG9ydCA9IGV4cG9ydHMuZ2V0KElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGV4cG9ydHMgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgICAgIGV4cG9ydExpc3Quc2V0KHZhbHVlLCBleHBvcnRzKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnRFeHBvcnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFeHBvcnQud2hlcmVVc2VkLmFkZChmaWxlKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHdoZXJlVXNlZCA9IG5ldyBTZXQoKTtcclxuICAgICAgICAgICAgd2hlcmVVc2VkLmFkZChmaWxlKTtcclxuICAgICAgICAgICAgZXhwb3J0cy5zZXQoSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIsIHsgd2hlcmVVc2VkIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBvbGROYW1lc3BhY2VJbXBvcnRzLmZvckVhY2godmFsdWUgPT4ge1xyXG4gICAgICAgIGlmICghbmV3TmFtZXNwYWNlSW1wb3J0cy5oYXModmFsdWUpKSB7XHJcbiAgICAgICAgICBjb25zdCBpbXBvcnRzID0gb2xkSW1wb3J0UGF0aHMuZ2V0KHZhbHVlKTtcclxuICAgICAgICAgIGltcG9ydHMuZGVsZXRlKElNUE9SVF9OQU1FU1BBQ0VfU1BFQ0lGSUVSKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBleHBvcnRzID0gZXhwb3J0TGlzdC5nZXQodmFsdWUpO1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RXhwb3J0ID0gZXhwb3J0cy5nZXQoSU1QT1JUX05BTUVTUEFDRV9TUEVDSUZJRVIpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnRFeHBvcnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgY3VycmVudEV4cG9ydC53aGVyZVVzZWQuZGVsZXRlKGZpbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIG5ld0ltcG9ydHMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xyXG4gICAgICAgIGlmICghb2xkSW1wb3J0cy5oYXMoa2V5KSkge1xyXG4gICAgICAgICAgbGV0IGltcG9ydHMgPSBvbGRJbXBvcnRQYXRocy5nZXQodmFsdWUpO1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBpbXBvcnRzID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBpbXBvcnRzID0gbmV3IFNldCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaW1wb3J0cy5hZGQoa2V5KTtcclxuICAgICAgICAgIG9sZEltcG9ydFBhdGhzLnNldCh2YWx1ZSwgaW1wb3J0cyk7XHJcblxyXG4gICAgICAgICAgbGV0IGV4cG9ydHMgPSBleHBvcnRMaXN0LmdldCh2YWx1ZSk7XHJcbiAgICAgICAgICBsZXQgY3VycmVudEV4cG9ydDtcclxuICAgICAgICAgIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgY3VycmVudEV4cG9ydCA9IGV4cG9ydHMuZ2V0KGtleSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBleHBvcnRzID0gbmV3IE1hcCgpO1xyXG4gICAgICAgICAgICBleHBvcnRMaXN0LnNldCh2YWx1ZSwgZXhwb3J0cyk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50RXhwb3J0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBjdXJyZW50RXhwb3J0LndoZXJlVXNlZC5hZGQoZmlsZSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCB3aGVyZVVzZWQgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgICAgIHdoZXJlVXNlZC5hZGQoZmlsZSk7XHJcbiAgICAgICAgICAgIGV4cG9ydHMuc2V0KGtleSwgeyB3aGVyZVVzZWQgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIG9sZEltcG9ydHMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xyXG4gICAgICAgIGlmICghbmV3SW1wb3J0cy5oYXMoa2V5KSkge1xyXG4gICAgICAgICAgY29uc3QgaW1wb3J0cyA9IG9sZEltcG9ydFBhdGhzLmdldCh2YWx1ZSk7XHJcbiAgICAgICAgICBpbXBvcnRzLmRlbGV0ZShrZXkpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IGV4cG9ydHMgPSBleHBvcnRMaXN0LmdldCh2YWx1ZSk7XHJcbiAgICAgICAgICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRFeHBvcnQgPSBleHBvcnRzLmdldChrZXkpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnRFeHBvcnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgY3VycmVudEV4cG9ydC53aGVyZVVzZWQuZGVsZXRlKGZpbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgJ1Byb2dyYW06ZXhpdCc6IG5vZGUgPT4ge1xyXG4gICAgICAgIHVwZGF0ZUV4cG9ydFVzYWdlKG5vZGUpO1xyXG4gICAgICAgIHVwZGF0ZUltcG9ydFVzYWdlKG5vZGUpO1xyXG4gICAgICAgIGNoZWNrRXhwb3J0UHJlc2VuY2Uobm9kZSk7XHJcbiAgICAgIH0sXHJcbiAgICAgICdFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24nOiBub2RlID0+IHtcclxuICAgICAgICBjaGVja1VzYWdlKG5vZGUsIElNUE9SVF9ERUZBVUxUX1NQRUNJRklFUik7XHJcbiAgICAgIH0sXHJcbiAgICAgICdFeHBvcnROYW1lZERlY2xhcmF0aW9uJzogbm9kZSA9PiB7XHJcbiAgICAgICAgbm9kZS5zcGVjaWZpZXJzLmZvckVhY2goc3BlY2lmaWVyID0+IHtcclxuICAgICAgICAgIGNoZWNrVXNhZ2Uobm9kZSwgc3BlY2lmaWVyLmV4cG9ydGVkLm5hbWUgfHwgc3BlY2lmaWVyLmV4cG9ydGVkLnZhbHVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBmb3JFYWNoRGVjbGFyYXRpb25JZGVudGlmaWVyKG5vZGUuZGVjbGFyYXRpb24sIChuYW1lKSA9PiB7XHJcbiAgICAgICAgICBjaGVja1VzYWdlKG5vZGUsIG5hbWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgfTtcclxuICB9LFxyXG59O1xyXG4iXX0=