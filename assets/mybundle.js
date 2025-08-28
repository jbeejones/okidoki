(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/lunr/lunr.js
  var require_lunr = __commonJS({
    "node_modules/lunr/lunr.js"(exports, module) {
      (function() {
        var lunr2 = function(config) {
          var builder = new lunr2.Builder();
          builder.pipeline.add(
            lunr2.trimmer,
            lunr2.stopWordFilter,
            lunr2.stemmer
          );
          builder.searchPipeline.add(
            lunr2.stemmer
          );
          config.call(builder, builder);
          return builder.build();
        };
        lunr2.version = "2.3.9";
        lunr2.utils = {};
        lunr2.utils.warn = /* @__PURE__ */ function(global) {
          return function(message) {
            if (global.console && console.warn) {
              console.warn(message);
            }
          };
        }(this);
        lunr2.utils.asString = function(obj) {
          if (obj === void 0 || obj === null) {
            return "";
          } else {
            return obj.toString();
          }
        };
        lunr2.utils.clone = function(obj) {
          if (obj === null || obj === void 0) {
            return obj;
          }
          var clone = /* @__PURE__ */ Object.create(null), keys = Object.keys(obj);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i], val = obj[key];
            if (Array.isArray(val)) {
              clone[key] = val.slice();
              continue;
            }
            if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
              clone[key] = val;
              continue;
            }
            throw new TypeError("clone is not deep and does not support nested objects");
          }
          return clone;
        };
        lunr2.FieldRef = function(docRef, fieldName, stringValue) {
          this.docRef = docRef;
          this.fieldName = fieldName;
          this._stringValue = stringValue;
        };
        lunr2.FieldRef.joiner = "/";
        lunr2.FieldRef.fromString = function(s) {
          var n = s.indexOf(lunr2.FieldRef.joiner);
          if (n === -1) {
            throw "malformed field ref string";
          }
          var fieldRef = s.slice(0, n), docRef = s.slice(n + 1);
          return new lunr2.FieldRef(docRef, fieldRef, s);
        };
        lunr2.FieldRef.prototype.toString = function() {
          if (this._stringValue == void 0) {
            this._stringValue = this.fieldName + lunr2.FieldRef.joiner + this.docRef;
          }
          return this._stringValue;
        };
        lunr2.Set = function(elements) {
          this.elements = /* @__PURE__ */ Object.create(null);
          if (elements) {
            this.length = elements.length;
            for (var i = 0; i < this.length; i++) {
              this.elements[elements[i]] = true;
            }
          } else {
            this.length = 0;
          }
        };
        lunr2.Set.complete = {
          intersect: function(other) {
            return other;
          },
          union: function() {
            return this;
          },
          contains: function() {
            return true;
          }
        };
        lunr2.Set.empty = {
          intersect: function() {
            return this;
          },
          union: function(other) {
            return other;
          },
          contains: function() {
            return false;
          }
        };
        lunr2.Set.prototype.contains = function(object) {
          return !!this.elements[object];
        };
        lunr2.Set.prototype.intersect = function(other) {
          var a, b, elements, intersection = [];
          if (other === lunr2.Set.complete) {
            return this;
          }
          if (other === lunr2.Set.empty) {
            return other;
          }
          if (this.length < other.length) {
            a = this;
            b = other;
          } else {
            a = other;
            b = this;
          }
          elements = Object.keys(a.elements);
          for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if (element in b.elements) {
              intersection.push(element);
            }
          }
          return new lunr2.Set(intersection);
        };
        lunr2.Set.prototype.union = function(other) {
          if (other === lunr2.Set.complete) {
            return lunr2.Set.complete;
          }
          if (other === lunr2.Set.empty) {
            return this;
          }
          return new lunr2.Set(Object.keys(this.elements).concat(Object.keys(other.elements)));
        };
        lunr2.idf = function(posting, documentCount) {
          var documentsWithTerm = 0;
          for (var fieldName in posting) {
            if (fieldName == "_index") continue;
            documentsWithTerm += Object.keys(posting[fieldName]).length;
          }
          var x = (documentCount - documentsWithTerm + 0.5) / (documentsWithTerm + 0.5);
          return Math.log(1 + Math.abs(x));
        };
        lunr2.Token = function(str, metadata) {
          this.str = str || "";
          this.metadata = metadata || {};
        };
        lunr2.Token.prototype.toString = function() {
          return this.str;
        };
        lunr2.Token.prototype.update = function(fn) {
          this.str = fn(this.str, this.metadata);
          return this;
        };
        lunr2.Token.prototype.clone = function(fn) {
          fn = fn || function(s) {
            return s;
          };
          return new lunr2.Token(fn(this.str, this.metadata), this.metadata);
        };
        lunr2.tokenizer = function(obj, metadata) {
          if (obj == null || obj == void 0) {
            return [];
          }
          if (Array.isArray(obj)) {
            return obj.map(function(t) {
              return new lunr2.Token(
                lunr2.utils.asString(t).toLowerCase(),
                lunr2.utils.clone(metadata)
              );
            });
          }
          var str = obj.toString().toLowerCase(), len = str.length, tokens = [];
          for (var sliceEnd = 0, sliceStart = 0; sliceEnd <= len; sliceEnd++) {
            var char = str.charAt(sliceEnd), sliceLength = sliceEnd - sliceStart;
            if (char.match(lunr2.tokenizer.separator) || sliceEnd == len) {
              if (sliceLength > 0) {
                var tokenMetadata = lunr2.utils.clone(metadata) || {};
                tokenMetadata["position"] = [sliceStart, sliceLength];
                tokenMetadata["index"] = tokens.length;
                tokens.push(
                  new lunr2.Token(
                    str.slice(sliceStart, sliceEnd),
                    tokenMetadata
                  )
                );
              }
              sliceStart = sliceEnd + 1;
            }
          }
          return tokens;
        };
        lunr2.tokenizer.separator = /[\s\-]+/;
        lunr2.Pipeline = function() {
          this._stack = [];
        };
        lunr2.Pipeline.registeredFunctions = /* @__PURE__ */ Object.create(null);
        lunr2.Pipeline.registerFunction = function(fn, label) {
          if (label in this.registeredFunctions) {
            lunr2.utils.warn("Overwriting existing registered function: " + label);
          }
          fn.label = label;
          lunr2.Pipeline.registeredFunctions[fn.label] = fn;
        };
        lunr2.Pipeline.warnIfFunctionNotRegistered = function(fn) {
          var isRegistered = fn.label && fn.label in this.registeredFunctions;
          if (!isRegistered) {
            lunr2.utils.warn("Function is not registered with pipeline. This may cause problems when serialising the index.\n", fn);
          }
        };
        lunr2.Pipeline.load = function(serialised) {
          var pipeline = new lunr2.Pipeline();
          serialised.forEach(function(fnName) {
            var fn = lunr2.Pipeline.registeredFunctions[fnName];
            if (fn) {
              pipeline.add(fn);
            } else {
              throw new Error("Cannot load unregistered function: " + fnName);
            }
          });
          return pipeline;
        };
        lunr2.Pipeline.prototype.add = function() {
          var fns = Array.prototype.slice.call(arguments);
          fns.forEach(function(fn) {
            lunr2.Pipeline.warnIfFunctionNotRegistered(fn);
            this._stack.push(fn);
          }, this);
        };
        lunr2.Pipeline.prototype.after = function(existingFn, newFn) {
          lunr2.Pipeline.warnIfFunctionNotRegistered(newFn);
          var pos = this._stack.indexOf(existingFn);
          if (pos == -1) {
            throw new Error("Cannot find existingFn");
          }
          pos = pos + 1;
          this._stack.splice(pos, 0, newFn);
        };
        lunr2.Pipeline.prototype.before = function(existingFn, newFn) {
          lunr2.Pipeline.warnIfFunctionNotRegistered(newFn);
          var pos = this._stack.indexOf(existingFn);
          if (pos == -1) {
            throw new Error("Cannot find existingFn");
          }
          this._stack.splice(pos, 0, newFn);
        };
        lunr2.Pipeline.prototype.remove = function(fn) {
          var pos = this._stack.indexOf(fn);
          if (pos == -1) {
            return;
          }
          this._stack.splice(pos, 1);
        };
        lunr2.Pipeline.prototype.run = function(tokens) {
          var stackLength = this._stack.length;
          for (var i = 0; i < stackLength; i++) {
            var fn = this._stack[i];
            var memo = [];
            for (var j = 0; j < tokens.length; j++) {
              var result = fn(tokens[j], j, tokens);
              if (result === null || result === void 0 || result === "") continue;
              if (Array.isArray(result)) {
                for (var k = 0; k < result.length; k++) {
                  memo.push(result[k]);
                }
              } else {
                memo.push(result);
              }
            }
            tokens = memo;
          }
          return tokens;
        };
        lunr2.Pipeline.prototype.runString = function(str, metadata) {
          var token = new lunr2.Token(str, metadata);
          return this.run([token]).map(function(t) {
            return t.toString();
          });
        };
        lunr2.Pipeline.prototype.reset = function() {
          this._stack = [];
        };
        lunr2.Pipeline.prototype.toJSON = function() {
          return this._stack.map(function(fn) {
            lunr2.Pipeline.warnIfFunctionNotRegistered(fn);
            return fn.label;
          });
        };
        lunr2.Vector = function(elements) {
          this._magnitude = 0;
          this.elements = elements || [];
        };
        lunr2.Vector.prototype.positionForIndex = function(index) {
          if (this.elements.length == 0) {
            return 0;
          }
          var start = 0, end = this.elements.length / 2, sliceLength = end - start, pivotPoint = Math.floor(sliceLength / 2), pivotIndex = this.elements[pivotPoint * 2];
          while (sliceLength > 1) {
            if (pivotIndex < index) {
              start = pivotPoint;
            }
            if (pivotIndex > index) {
              end = pivotPoint;
            }
            if (pivotIndex == index) {
              break;
            }
            sliceLength = end - start;
            pivotPoint = start + Math.floor(sliceLength / 2);
            pivotIndex = this.elements[pivotPoint * 2];
          }
          if (pivotIndex == index) {
            return pivotPoint * 2;
          }
          if (pivotIndex > index) {
            return pivotPoint * 2;
          }
          if (pivotIndex < index) {
            return (pivotPoint + 1) * 2;
          }
        };
        lunr2.Vector.prototype.insert = function(insertIdx, val) {
          this.upsert(insertIdx, val, function() {
            throw "duplicate index";
          });
        };
        lunr2.Vector.prototype.upsert = function(insertIdx, val, fn) {
          this._magnitude = 0;
          var position = this.positionForIndex(insertIdx);
          if (this.elements[position] == insertIdx) {
            this.elements[position + 1] = fn(this.elements[position + 1], val);
          } else {
            this.elements.splice(position, 0, insertIdx, val);
          }
        };
        lunr2.Vector.prototype.magnitude = function() {
          if (this._magnitude) return this._magnitude;
          var sumOfSquares = 0, elementsLength = this.elements.length;
          for (var i = 1; i < elementsLength; i += 2) {
            var val = this.elements[i];
            sumOfSquares += val * val;
          }
          return this._magnitude = Math.sqrt(sumOfSquares);
        };
        lunr2.Vector.prototype.dot = function(otherVector) {
          var dotProduct = 0, a = this.elements, b = otherVector.elements, aLen = a.length, bLen = b.length, aVal = 0, bVal = 0, i = 0, j = 0;
          while (i < aLen && j < bLen) {
            aVal = a[i], bVal = b[j];
            if (aVal < bVal) {
              i += 2;
            } else if (aVal > bVal) {
              j += 2;
            } else if (aVal == bVal) {
              dotProduct += a[i + 1] * b[j + 1];
              i += 2;
              j += 2;
            }
          }
          return dotProduct;
        };
        lunr2.Vector.prototype.similarity = function(otherVector) {
          return this.dot(otherVector) / this.magnitude() || 0;
        };
        lunr2.Vector.prototype.toArray = function() {
          var output = new Array(this.elements.length / 2);
          for (var i = 1, j = 0; i < this.elements.length; i += 2, j++) {
            output[j] = this.elements[i];
          }
          return output;
        };
        lunr2.Vector.prototype.toJSON = function() {
          return this.elements;
        };
        lunr2.stemmer = function() {
          var step2list = {
            "ational": "ate",
            "tional": "tion",
            "enci": "ence",
            "anci": "ance",
            "izer": "ize",
            "bli": "ble",
            "alli": "al",
            "entli": "ent",
            "eli": "e",
            "ousli": "ous",
            "ization": "ize",
            "ation": "ate",
            "ator": "ate",
            "alism": "al",
            "iveness": "ive",
            "fulness": "ful",
            "ousness": "ous",
            "aliti": "al",
            "iviti": "ive",
            "biliti": "ble",
            "logi": "log"
          }, step3list = {
            "icate": "ic",
            "ative": "",
            "alize": "al",
            "iciti": "ic",
            "ical": "ic",
            "ful": "",
            "ness": ""
          }, c = "[^aeiou]", v = "[aeiouy]", C = c + "[^aeiouy]*", V = v + "[aeiou]*", mgr0 = "^(" + C + ")?" + V + C, meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$", mgr1 = "^(" + C + ")?" + V + C + V + C, s_v = "^(" + C + ")?" + v;
          var re_mgr0 = new RegExp(mgr0);
          var re_mgr1 = new RegExp(mgr1);
          var re_meq1 = new RegExp(meq1);
          var re_s_v = new RegExp(s_v);
          var re_1a = /^(.+?)(ss|i)es$/;
          var re2_1a = /^(.+?)([^s])s$/;
          var re_1b = /^(.+?)eed$/;
          var re2_1b = /^(.+?)(ed|ing)$/;
          var re_1b_2 = /.$/;
          var re2_1b_2 = /(at|bl|iz)$/;
          var re3_1b_2 = new RegExp("([^aeiouylsz])\\1$");
          var re4_1b_2 = new RegExp("^" + C + v + "[^aeiouwxy]$");
          var re_1c = /^(.+?[^aeiou])y$/;
          var re_2 = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
          var re_3 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
          var re_4 = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
          var re2_4 = /^(.+?)(s|t)(ion)$/;
          var re_5 = /^(.+?)e$/;
          var re_5_1 = /ll$/;
          var re3_5 = new RegExp("^" + C + v + "[^aeiouwxy]$");
          var porterStemmer = function porterStemmer2(w) {
            var stem, suffix, firstch, re, re2, re3, re4;
            if (w.length < 3) {
              return w;
            }
            firstch = w.substr(0, 1);
            if (firstch == "y") {
              w = firstch.toUpperCase() + w.substr(1);
            }
            re = re_1a;
            re2 = re2_1a;
            if (re.test(w)) {
              w = w.replace(re, "$1$2");
            } else if (re2.test(w)) {
              w = w.replace(re2, "$1$2");
            }
            re = re_1b;
            re2 = re2_1b;
            if (re.test(w)) {
              var fp = re.exec(w);
              re = re_mgr0;
              if (re.test(fp[1])) {
                re = re_1b_2;
                w = w.replace(re, "");
              }
            } else if (re2.test(w)) {
              var fp = re2.exec(w);
              stem = fp[1];
              re2 = re_s_v;
              if (re2.test(stem)) {
                w = stem;
                re2 = re2_1b_2;
                re3 = re3_1b_2;
                re4 = re4_1b_2;
                if (re2.test(w)) {
                  w = w + "e";
                } else if (re3.test(w)) {
                  re = re_1b_2;
                  w = w.replace(re, "");
                } else if (re4.test(w)) {
                  w = w + "e";
                }
              }
            }
            re = re_1c;
            if (re.test(w)) {
              var fp = re.exec(w);
              stem = fp[1];
              w = stem + "i";
            }
            re = re_2;
            if (re.test(w)) {
              var fp = re.exec(w);
              stem = fp[1];
              suffix = fp[2];
              re = re_mgr0;
              if (re.test(stem)) {
                w = stem + step2list[suffix];
              }
            }
            re = re_3;
            if (re.test(w)) {
              var fp = re.exec(w);
              stem = fp[1];
              suffix = fp[2];
              re = re_mgr0;
              if (re.test(stem)) {
                w = stem + step3list[suffix];
              }
            }
            re = re_4;
            re2 = re2_4;
            if (re.test(w)) {
              var fp = re.exec(w);
              stem = fp[1];
              re = re_mgr1;
              if (re.test(stem)) {
                w = stem;
              }
            } else if (re2.test(w)) {
              var fp = re2.exec(w);
              stem = fp[1] + fp[2];
              re2 = re_mgr1;
              if (re2.test(stem)) {
                w = stem;
              }
            }
            re = re_5;
            if (re.test(w)) {
              var fp = re.exec(w);
              stem = fp[1];
              re = re_mgr1;
              re2 = re_meq1;
              re3 = re3_5;
              if (re.test(stem) || re2.test(stem) && !re3.test(stem)) {
                w = stem;
              }
            }
            re = re_5_1;
            re2 = re_mgr1;
            if (re.test(w) && re2.test(w)) {
              re = re_1b_2;
              w = w.replace(re, "");
            }
            if (firstch == "y") {
              w = firstch.toLowerCase() + w.substr(1);
            }
            return w;
          };
          return function(token) {
            return token.update(porterStemmer);
          };
        }();
        lunr2.Pipeline.registerFunction(lunr2.stemmer, "stemmer");
        lunr2.generateStopWordFilter = function(stopWords) {
          var words = stopWords.reduce(function(memo, stopWord) {
            memo[stopWord] = stopWord;
            return memo;
          }, {});
          return function(token) {
            if (token && words[token.toString()] !== token.toString()) return token;
          };
        };
        lunr2.stopWordFilter = lunr2.generateStopWordFilter([
          "a",
          "able",
          "about",
          "across",
          "after",
          "all",
          "almost",
          "also",
          "am",
          "among",
          "an",
          "and",
          "any",
          "are",
          "as",
          "at",
          "be",
          "because",
          "been",
          "but",
          "by",
          "can",
          "cannot",
          "could",
          "dear",
          "did",
          "do",
          "does",
          "either",
          "else",
          "ever",
          "every",
          "for",
          "from",
          "get",
          "got",
          "had",
          "has",
          "have",
          "he",
          "her",
          "hers",
          "him",
          "his",
          "how",
          "however",
          "i",
          "if",
          "in",
          "into",
          "is",
          "it",
          "its",
          "just",
          "least",
          "let",
          "like",
          "likely",
          "may",
          "me",
          "might",
          "most",
          "must",
          "my",
          "neither",
          "no",
          "nor",
          "not",
          "of",
          "off",
          "often",
          "on",
          "only",
          "or",
          "other",
          "our",
          "own",
          "rather",
          "said",
          "say",
          "says",
          "she",
          "should",
          "since",
          "so",
          "some",
          "than",
          "that",
          "the",
          "their",
          "them",
          "then",
          "there",
          "these",
          "they",
          "this",
          "tis",
          "to",
          "too",
          "twas",
          "us",
          "wants",
          "was",
          "we",
          "were",
          "what",
          "when",
          "where",
          "which",
          "while",
          "who",
          "whom",
          "why",
          "will",
          "with",
          "would",
          "yet",
          "you",
          "your"
        ]);
        lunr2.Pipeline.registerFunction(lunr2.stopWordFilter, "stopWordFilter");
        lunr2.trimmer = function(token) {
          return token.update(function(s) {
            return s.replace(/^\W+/, "").replace(/\W+$/, "");
          });
        };
        lunr2.Pipeline.registerFunction(lunr2.trimmer, "trimmer");
        lunr2.TokenSet = function() {
          this.final = false;
          this.edges = {};
          this.id = lunr2.TokenSet._nextId;
          lunr2.TokenSet._nextId += 1;
        };
        lunr2.TokenSet._nextId = 1;
        lunr2.TokenSet.fromArray = function(arr) {
          var builder = new lunr2.TokenSet.Builder();
          for (var i = 0, len = arr.length; i < len; i++) {
            builder.insert(arr[i]);
          }
          builder.finish();
          return builder.root;
        };
        lunr2.TokenSet.fromClause = function(clause) {
          if ("editDistance" in clause) {
            return lunr2.TokenSet.fromFuzzyString(clause.term, clause.editDistance);
          } else {
            return lunr2.TokenSet.fromString(clause.term);
          }
        };
        lunr2.TokenSet.fromFuzzyString = function(str, editDistance) {
          var root = new lunr2.TokenSet();
          var stack = [{
            node: root,
            editsRemaining: editDistance,
            str
          }];
          while (stack.length) {
            var frame = stack.pop();
            if (frame.str.length > 0) {
              var char = frame.str.charAt(0), noEditNode;
              if (char in frame.node.edges) {
                noEditNode = frame.node.edges[char];
              } else {
                noEditNode = new lunr2.TokenSet();
                frame.node.edges[char] = noEditNode;
              }
              if (frame.str.length == 1) {
                noEditNode.final = true;
              }
              stack.push({
                node: noEditNode,
                editsRemaining: frame.editsRemaining,
                str: frame.str.slice(1)
              });
            }
            if (frame.editsRemaining == 0) {
              continue;
            }
            if ("*" in frame.node.edges) {
              var insertionNode = frame.node.edges["*"];
            } else {
              var insertionNode = new lunr2.TokenSet();
              frame.node.edges["*"] = insertionNode;
            }
            if (frame.str.length == 0) {
              insertionNode.final = true;
            }
            stack.push({
              node: insertionNode,
              editsRemaining: frame.editsRemaining - 1,
              str: frame.str
            });
            if (frame.str.length > 1) {
              stack.push({
                node: frame.node,
                editsRemaining: frame.editsRemaining - 1,
                str: frame.str.slice(1)
              });
            }
            if (frame.str.length == 1) {
              frame.node.final = true;
            }
            if (frame.str.length >= 1) {
              if ("*" in frame.node.edges) {
                var substitutionNode = frame.node.edges["*"];
              } else {
                var substitutionNode = new lunr2.TokenSet();
                frame.node.edges["*"] = substitutionNode;
              }
              if (frame.str.length == 1) {
                substitutionNode.final = true;
              }
              stack.push({
                node: substitutionNode,
                editsRemaining: frame.editsRemaining - 1,
                str: frame.str.slice(1)
              });
            }
            if (frame.str.length > 1) {
              var charA = frame.str.charAt(0), charB = frame.str.charAt(1), transposeNode;
              if (charB in frame.node.edges) {
                transposeNode = frame.node.edges[charB];
              } else {
                transposeNode = new lunr2.TokenSet();
                frame.node.edges[charB] = transposeNode;
              }
              if (frame.str.length == 1) {
                transposeNode.final = true;
              }
              stack.push({
                node: transposeNode,
                editsRemaining: frame.editsRemaining - 1,
                str: charA + frame.str.slice(2)
              });
            }
          }
          return root;
        };
        lunr2.TokenSet.fromString = function(str) {
          var node = new lunr2.TokenSet(), root = node;
          for (var i = 0, len = str.length; i < len; i++) {
            var char = str[i], final = i == len - 1;
            if (char == "*") {
              node.edges[char] = node;
              node.final = final;
            } else {
              var next = new lunr2.TokenSet();
              next.final = final;
              node.edges[char] = next;
              node = next;
            }
          }
          return root;
        };
        lunr2.TokenSet.prototype.toArray = function() {
          var words = [];
          var stack = [{
            prefix: "",
            node: this
          }];
          while (stack.length) {
            var frame = stack.pop(), edges = Object.keys(frame.node.edges), len = edges.length;
            if (frame.node.final) {
              frame.prefix.charAt(0);
              words.push(frame.prefix);
            }
            for (var i = 0; i < len; i++) {
              var edge = edges[i];
              stack.push({
                prefix: frame.prefix.concat(edge),
                node: frame.node.edges[edge]
              });
            }
          }
          return words;
        };
        lunr2.TokenSet.prototype.toString = function() {
          if (this._str) {
            return this._str;
          }
          var str = this.final ? "1" : "0", labels = Object.keys(this.edges).sort(), len = labels.length;
          for (var i = 0; i < len; i++) {
            var label = labels[i], node = this.edges[label];
            str = str + label + node.id;
          }
          return str;
        };
        lunr2.TokenSet.prototype.intersect = function(b) {
          var output = new lunr2.TokenSet(), frame = void 0;
          var stack = [{
            qNode: b,
            output,
            node: this
          }];
          while (stack.length) {
            frame = stack.pop();
            var qEdges = Object.keys(frame.qNode.edges), qLen = qEdges.length, nEdges = Object.keys(frame.node.edges), nLen = nEdges.length;
            for (var q = 0; q < qLen; q++) {
              var qEdge = qEdges[q];
              for (var n = 0; n < nLen; n++) {
                var nEdge = nEdges[n];
                if (nEdge == qEdge || qEdge == "*") {
                  var node = frame.node.edges[nEdge], qNode = frame.qNode.edges[qEdge], final = node.final && qNode.final, next = void 0;
                  if (nEdge in frame.output.edges) {
                    next = frame.output.edges[nEdge];
                    next.final = next.final || final;
                  } else {
                    next = new lunr2.TokenSet();
                    next.final = final;
                    frame.output.edges[nEdge] = next;
                  }
                  stack.push({
                    qNode,
                    output: next,
                    node
                  });
                }
              }
            }
          }
          return output;
        };
        lunr2.TokenSet.Builder = function() {
          this.previousWord = "";
          this.root = new lunr2.TokenSet();
          this.uncheckedNodes = [];
          this.minimizedNodes = {};
        };
        lunr2.TokenSet.Builder.prototype.insert = function(word) {
          var node, commonPrefix = 0;
          if (word < this.previousWord) {
            throw new Error("Out of order word insertion");
          }
          for (var i = 0; i < word.length && i < this.previousWord.length; i++) {
            if (word[i] != this.previousWord[i]) break;
            commonPrefix++;
          }
          this.minimize(commonPrefix);
          if (this.uncheckedNodes.length == 0) {
            node = this.root;
          } else {
            node = this.uncheckedNodes[this.uncheckedNodes.length - 1].child;
          }
          for (var i = commonPrefix; i < word.length; i++) {
            var nextNode = new lunr2.TokenSet(), char = word[i];
            node.edges[char] = nextNode;
            this.uncheckedNodes.push({
              parent: node,
              char,
              child: nextNode
            });
            node = nextNode;
          }
          node.final = true;
          this.previousWord = word;
        };
        lunr2.TokenSet.Builder.prototype.finish = function() {
          this.minimize(0);
        };
        lunr2.TokenSet.Builder.prototype.minimize = function(downTo) {
          for (var i = this.uncheckedNodes.length - 1; i >= downTo; i--) {
            var node = this.uncheckedNodes[i], childKey = node.child.toString();
            if (childKey in this.minimizedNodes) {
              node.parent.edges[node.char] = this.minimizedNodes[childKey];
            } else {
              node.child._str = childKey;
              this.minimizedNodes[childKey] = node.child;
            }
            this.uncheckedNodes.pop();
          }
        };
        lunr2.Index = function(attrs) {
          this.invertedIndex = attrs.invertedIndex;
          this.fieldVectors = attrs.fieldVectors;
          this.tokenSet = attrs.tokenSet;
          this.fields = attrs.fields;
          this.pipeline = attrs.pipeline;
        };
        lunr2.Index.prototype.search = function(queryString) {
          return this.query(function(query) {
            var parser = new lunr2.QueryParser(queryString, query);
            parser.parse();
          });
        };
        lunr2.Index.prototype.query = function(fn) {
          var query = new lunr2.Query(this.fields), matchingFields = /* @__PURE__ */ Object.create(null), queryVectors = /* @__PURE__ */ Object.create(null), termFieldCache = /* @__PURE__ */ Object.create(null), requiredMatches = /* @__PURE__ */ Object.create(null), prohibitedMatches = /* @__PURE__ */ Object.create(null);
          for (var i = 0; i < this.fields.length; i++) {
            queryVectors[this.fields[i]] = new lunr2.Vector();
          }
          fn.call(query, query);
          for (var i = 0; i < query.clauses.length; i++) {
            var clause = query.clauses[i], terms = null, clauseMatches = lunr2.Set.empty;
            if (clause.usePipeline) {
              terms = this.pipeline.runString(clause.term, {
                fields: clause.fields
              });
            } else {
              terms = [clause.term];
            }
            for (var m = 0; m < terms.length; m++) {
              var term = terms[m];
              clause.term = term;
              var termTokenSet = lunr2.TokenSet.fromClause(clause), expandedTerms = this.tokenSet.intersect(termTokenSet).toArray();
              if (expandedTerms.length === 0 && clause.presence === lunr2.Query.presence.REQUIRED) {
                for (var k = 0; k < clause.fields.length; k++) {
                  var field = clause.fields[k];
                  requiredMatches[field] = lunr2.Set.empty;
                }
                break;
              }
              for (var j = 0; j < expandedTerms.length; j++) {
                var expandedTerm = expandedTerms[j], posting = this.invertedIndex[expandedTerm], termIndex = posting._index;
                for (var k = 0; k < clause.fields.length; k++) {
                  var field = clause.fields[k], fieldPosting = posting[field], matchingDocumentRefs = Object.keys(fieldPosting), termField = expandedTerm + "/" + field, matchingDocumentsSet = new lunr2.Set(matchingDocumentRefs);
                  if (clause.presence == lunr2.Query.presence.REQUIRED) {
                    clauseMatches = clauseMatches.union(matchingDocumentsSet);
                    if (requiredMatches[field] === void 0) {
                      requiredMatches[field] = lunr2.Set.complete;
                    }
                  }
                  if (clause.presence == lunr2.Query.presence.PROHIBITED) {
                    if (prohibitedMatches[field] === void 0) {
                      prohibitedMatches[field] = lunr2.Set.empty;
                    }
                    prohibitedMatches[field] = prohibitedMatches[field].union(matchingDocumentsSet);
                    continue;
                  }
                  queryVectors[field].upsert(termIndex, clause.boost, function(a, b) {
                    return a + b;
                  });
                  if (termFieldCache[termField]) {
                    continue;
                  }
                  for (var l = 0; l < matchingDocumentRefs.length; l++) {
                    var matchingDocumentRef = matchingDocumentRefs[l], matchingFieldRef = new lunr2.FieldRef(matchingDocumentRef, field), metadata = fieldPosting[matchingDocumentRef], fieldMatch;
                    if ((fieldMatch = matchingFields[matchingFieldRef]) === void 0) {
                      matchingFields[matchingFieldRef] = new lunr2.MatchData(expandedTerm, field, metadata);
                    } else {
                      fieldMatch.add(expandedTerm, field, metadata);
                    }
                  }
                  termFieldCache[termField] = true;
                }
              }
            }
            if (clause.presence === lunr2.Query.presence.REQUIRED) {
              for (var k = 0; k < clause.fields.length; k++) {
                var field = clause.fields[k];
                requiredMatches[field] = requiredMatches[field].intersect(clauseMatches);
              }
            }
          }
          var allRequiredMatches = lunr2.Set.complete, allProhibitedMatches = lunr2.Set.empty;
          for (var i = 0; i < this.fields.length; i++) {
            var field = this.fields[i];
            if (requiredMatches[field]) {
              allRequiredMatches = allRequiredMatches.intersect(requiredMatches[field]);
            }
            if (prohibitedMatches[field]) {
              allProhibitedMatches = allProhibitedMatches.union(prohibitedMatches[field]);
            }
          }
          var matchingFieldRefs = Object.keys(matchingFields), results = [], matches = /* @__PURE__ */ Object.create(null);
          if (query.isNegated()) {
            matchingFieldRefs = Object.keys(this.fieldVectors);
            for (var i = 0; i < matchingFieldRefs.length; i++) {
              var matchingFieldRef = matchingFieldRefs[i];
              var fieldRef = lunr2.FieldRef.fromString(matchingFieldRef);
              matchingFields[matchingFieldRef] = new lunr2.MatchData();
            }
          }
          for (var i = 0; i < matchingFieldRefs.length; i++) {
            var fieldRef = lunr2.FieldRef.fromString(matchingFieldRefs[i]), docRef = fieldRef.docRef;
            if (!allRequiredMatches.contains(docRef)) {
              continue;
            }
            if (allProhibitedMatches.contains(docRef)) {
              continue;
            }
            var fieldVector = this.fieldVectors[fieldRef], score = queryVectors[fieldRef.fieldName].similarity(fieldVector), docMatch;
            if ((docMatch = matches[docRef]) !== void 0) {
              docMatch.score += score;
              docMatch.matchData.combine(matchingFields[fieldRef]);
            } else {
              var match = {
                ref: docRef,
                score,
                matchData: matchingFields[fieldRef]
              };
              matches[docRef] = match;
              results.push(match);
            }
          }
          return results.sort(function(a, b) {
            return b.score - a.score;
          });
        };
        lunr2.Index.prototype.toJSON = function() {
          var invertedIndex = Object.keys(this.invertedIndex).sort().map(function(term) {
            return [term, this.invertedIndex[term]];
          }, this);
          var fieldVectors = Object.keys(this.fieldVectors).map(function(ref) {
            return [ref, this.fieldVectors[ref].toJSON()];
          }, this);
          return {
            version: lunr2.version,
            fields: this.fields,
            fieldVectors,
            invertedIndex,
            pipeline: this.pipeline.toJSON()
          };
        };
        lunr2.Index.load = function(serializedIndex) {
          var attrs = {}, fieldVectors = {}, serializedVectors = serializedIndex.fieldVectors, invertedIndex = /* @__PURE__ */ Object.create(null), serializedInvertedIndex = serializedIndex.invertedIndex, tokenSetBuilder = new lunr2.TokenSet.Builder(), pipeline = lunr2.Pipeline.load(serializedIndex.pipeline);
          if (serializedIndex.version != lunr2.version) {
            lunr2.utils.warn("Version mismatch when loading serialised index. Current version of lunr '" + lunr2.version + "' does not match serialized index '" + serializedIndex.version + "'");
          }
          for (var i = 0; i < serializedVectors.length; i++) {
            var tuple = serializedVectors[i], ref = tuple[0], elements = tuple[1];
            fieldVectors[ref] = new lunr2.Vector(elements);
          }
          for (var i = 0; i < serializedInvertedIndex.length; i++) {
            var tuple = serializedInvertedIndex[i], term = tuple[0], posting = tuple[1];
            tokenSetBuilder.insert(term);
            invertedIndex[term] = posting;
          }
          tokenSetBuilder.finish();
          attrs.fields = serializedIndex.fields;
          attrs.fieldVectors = fieldVectors;
          attrs.invertedIndex = invertedIndex;
          attrs.tokenSet = tokenSetBuilder.root;
          attrs.pipeline = pipeline;
          return new lunr2.Index(attrs);
        };
        lunr2.Builder = function() {
          this._ref = "id";
          this._fields = /* @__PURE__ */ Object.create(null);
          this._documents = /* @__PURE__ */ Object.create(null);
          this.invertedIndex = /* @__PURE__ */ Object.create(null);
          this.fieldTermFrequencies = {};
          this.fieldLengths = {};
          this.tokenizer = lunr2.tokenizer;
          this.pipeline = new lunr2.Pipeline();
          this.searchPipeline = new lunr2.Pipeline();
          this.documentCount = 0;
          this._b = 0.75;
          this._k1 = 1.2;
          this.termIndex = 0;
          this.metadataWhitelist = [];
        };
        lunr2.Builder.prototype.ref = function(ref) {
          this._ref = ref;
        };
        lunr2.Builder.prototype.field = function(fieldName, attributes) {
          if (/\//.test(fieldName)) {
            throw new RangeError("Field '" + fieldName + "' contains illegal character '/'");
          }
          this._fields[fieldName] = attributes || {};
        };
        lunr2.Builder.prototype.b = function(number) {
          if (number < 0) {
            this._b = 0;
          } else if (number > 1) {
            this._b = 1;
          } else {
            this._b = number;
          }
        };
        lunr2.Builder.prototype.k1 = function(number) {
          this._k1 = number;
        };
        lunr2.Builder.prototype.add = function(doc, attributes) {
          var docRef = doc[this._ref], fields = Object.keys(this._fields);
          this._documents[docRef] = attributes || {};
          this.documentCount += 1;
          for (var i = 0; i < fields.length; i++) {
            var fieldName = fields[i], extractor = this._fields[fieldName].extractor, field = extractor ? extractor(doc) : doc[fieldName], tokens = this.tokenizer(field, {
              fields: [fieldName]
            }), terms = this.pipeline.run(tokens), fieldRef = new lunr2.FieldRef(docRef, fieldName), fieldTerms = /* @__PURE__ */ Object.create(null);
            this.fieldTermFrequencies[fieldRef] = fieldTerms;
            this.fieldLengths[fieldRef] = 0;
            this.fieldLengths[fieldRef] += terms.length;
            for (var j = 0; j < terms.length; j++) {
              var term = terms[j];
              if (fieldTerms[term] == void 0) {
                fieldTerms[term] = 0;
              }
              fieldTerms[term] += 1;
              if (this.invertedIndex[term] == void 0) {
                var posting = /* @__PURE__ */ Object.create(null);
                posting["_index"] = this.termIndex;
                this.termIndex += 1;
                for (var k = 0; k < fields.length; k++) {
                  posting[fields[k]] = /* @__PURE__ */ Object.create(null);
                }
                this.invertedIndex[term] = posting;
              }
              if (this.invertedIndex[term][fieldName][docRef] == void 0) {
                this.invertedIndex[term][fieldName][docRef] = /* @__PURE__ */ Object.create(null);
              }
              for (var l = 0; l < this.metadataWhitelist.length; l++) {
                var metadataKey = this.metadataWhitelist[l], metadata = term.metadata[metadataKey];
                if (this.invertedIndex[term][fieldName][docRef][metadataKey] == void 0) {
                  this.invertedIndex[term][fieldName][docRef][metadataKey] = [];
                }
                this.invertedIndex[term][fieldName][docRef][metadataKey].push(metadata);
              }
            }
          }
        };
        lunr2.Builder.prototype.calculateAverageFieldLengths = function() {
          var fieldRefs = Object.keys(this.fieldLengths), numberOfFields = fieldRefs.length, accumulator = {}, documentsWithField = {};
          for (var i = 0; i < numberOfFields; i++) {
            var fieldRef = lunr2.FieldRef.fromString(fieldRefs[i]), field = fieldRef.fieldName;
            documentsWithField[field] || (documentsWithField[field] = 0);
            documentsWithField[field] += 1;
            accumulator[field] || (accumulator[field] = 0);
            accumulator[field] += this.fieldLengths[fieldRef];
          }
          var fields = Object.keys(this._fields);
          for (var i = 0; i < fields.length; i++) {
            var fieldName = fields[i];
            accumulator[fieldName] = accumulator[fieldName] / documentsWithField[fieldName];
          }
          this.averageFieldLength = accumulator;
        };
        lunr2.Builder.prototype.createFieldVectors = function() {
          var fieldVectors = {}, fieldRefs = Object.keys(this.fieldTermFrequencies), fieldRefsLength = fieldRefs.length, termIdfCache = /* @__PURE__ */ Object.create(null);
          for (var i = 0; i < fieldRefsLength; i++) {
            var fieldRef = lunr2.FieldRef.fromString(fieldRefs[i]), fieldName = fieldRef.fieldName, fieldLength = this.fieldLengths[fieldRef], fieldVector = new lunr2.Vector(), termFrequencies = this.fieldTermFrequencies[fieldRef], terms = Object.keys(termFrequencies), termsLength = terms.length;
            var fieldBoost = this._fields[fieldName].boost || 1, docBoost = this._documents[fieldRef.docRef].boost || 1;
            for (var j = 0; j < termsLength; j++) {
              var term = terms[j], tf = termFrequencies[term], termIndex = this.invertedIndex[term]._index, idf, score, scoreWithPrecision;
              if (termIdfCache[term] === void 0) {
                idf = lunr2.idf(this.invertedIndex[term], this.documentCount);
                termIdfCache[term] = idf;
              } else {
                idf = termIdfCache[term];
              }
              score = idf * ((this._k1 + 1) * tf) / (this._k1 * (1 - this._b + this._b * (fieldLength / this.averageFieldLength[fieldName])) + tf);
              score *= fieldBoost;
              score *= docBoost;
              scoreWithPrecision = Math.round(score * 1e3) / 1e3;
              fieldVector.insert(termIndex, scoreWithPrecision);
            }
            fieldVectors[fieldRef] = fieldVector;
          }
          this.fieldVectors = fieldVectors;
        };
        lunr2.Builder.prototype.createTokenSet = function() {
          this.tokenSet = lunr2.TokenSet.fromArray(
            Object.keys(this.invertedIndex).sort()
          );
        };
        lunr2.Builder.prototype.build = function() {
          this.calculateAverageFieldLengths();
          this.createFieldVectors();
          this.createTokenSet();
          return new lunr2.Index({
            invertedIndex: this.invertedIndex,
            fieldVectors: this.fieldVectors,
            tokenSet: this.tokenSet,
            fields: Object.keys(this._fields),
            pipeline: this.searchPipeline
          });
        };
        lunr2.Builder.prototype.use = function(fn) {
          var args = Array.prototype.slice.call(arguments, 1);
          args.unshift(this);
          fn.apply(this, args);
        };
        lunr2.MatchData = function(term, field, metadata) {
          var clonedMetadata = /* @__PURE__ */ Object.create(null), metadataKeys = Object.keys(metadata || {});
          for (var i = 0; i < metadataKeys.length; i++) {
            var key = metadataKeys[i];
            clonedMetadata[key] = metadata[key].slice();
          }
          this.metadata = /* @__PURE__ */ Object.create(null);
          if (term !== void 0) {
            this.metadata[term] = /* @__PURE__ */ Object.create(null);
            this.metadata[term][field] = clonedMetadata;
          }
        };
        lunr2.MatchData.prototype.combine = function(otherMatchData) {
          var terms = Object.keys(otherMatchData.metadata);
          for (var i = 0; i < terms.length; i++) {
            var term = terms[i], fields = Object.keys(otherMatchData.metadata[term]);
            if (this.metadata[term] == void 0) {
              this.metadata[term] = /* @__PURE__ */ Object.create(null);
            }
            for (var j = 0; j < fields.length; j++) {
              var field = fields[j], keys = Object.keys(otherMatchData.metadata[term][field]);
              if (this.metadata[term][field] == void 0) {
                this.metadata[term][field] = /* @__PURE__ */ Object.create(null);
              }
              for (var k = 0; k < keys.length; k++) {
                var key = keys[k];
                if (this.metadata[term][field][key] == void 0) {
                  this.metadata[term][field][key] = otherMatchData.metadata[term][field][key];
                } else {
                  this.metadata[term][field][key] = this.metadata[term][field][key].concat(otherMatchData.metadata[term][field][key]);
                }
              }
            }
          }
        };
        lunr2.MatchData.prototype.add = function(term, field, metadata) {
          if (!(term in this.metadata)) {
            this.metadata[term] = /* @__PURE__ */ Object.create(null);
            this.metadata[term][field] = metadata;
            return;
          }
          if (!(field in this.metadata[term])) {
            this.metadata[term][field] = metadata;
            return;
          }
          var metadataKeys = Object.keys(metadata);
          for (var i = 0; i < metadataKeys.length; i++) {
            var key = metadataKeys[i];
            if (key in this.metadata[term][field]) {
              this.metadata[term][field][key] = this.metadata[term][field][key].concat(metadata[key]);
            } else {
              this.metadata[term][field][key] = metadata[key];
            }
          }
        };
        lunr2.Query = function(allFields) {
          this.clauses = [];
          this.allFields = allFields;
        };
        lunr2.Query.wildcard = new String("*");
        lunr2.Query.wildcard.NONE = 0;
        lunr2.Query.wildcard.LEADING = 1;
        lunr2.Query.wildcard.TRAILING = 2;
        lunr2.Query.presence = {
          /**
           * Term's presence in a document is optional, this is the default value.
           */
          OPTIONAL: 1,
          /**
           * Term's presence in a document is required, documents that do not contain
           * this term will not be returned.
           */
          REQUIRED: 2,
          /**
           * Term's presence in a document is prohibited, documents that do contain
           * this term will not be returned.
           */
          PROHIBITED: 3
        };
        lunr2.Query.prototype.clause = function(clause) {
          if (!("fields" in clause)) {
            clause.fields = this.allFields;
          }
          if (!("boost" in clause)) {
            clause.boost = 1;
          }
          if (!("usePipeline" in clause)) {
            clause.usePipeline = true;
          }
          if (!("wildcard" in clause)) {
            clause.wildcard = lunr2.Query.wildcard.NONE;
          }
          if (clause.wildcard & lunr2.Query.wildcard.LEADING && clause.term.charAt(0) != lunr2.Query.wildcard) {
            clause.term = "*" + clause.term;
          }
          if (clause.wildcard & lunr2.Query.wildcard.TRAILING && clause.term.slice(-1) != lunr2.Query.wildcard) {
            clause.term = "" + clause.term + "*";
          }
          if (!("presence" in clause)) {
            clause.presence = lunr2.Query.presence.OPTIONAL;
          }
          this.clauses.push(clause);
          return this;
        };
        lunr2.Query.prototype.isNegated = function() {
          for (var i = 0; i < this.clauses.length; i++) {
            if (this.clauses[i].presence != lunr2.Query.presence.PROHIBITED) {
              return false;
            }
          }
          return true;
        };
        lunr2.Query.prototype.term = function(term, options) {
          if (Array.isArray(term)) {
            term.forEach(function(t) {
              this.term(t, lunr2.utils.clone(options));
            }, this);
            return this;
          }
          var clause = options || {};
          clause.term = term.toString();
          this.clause(clause);
          return this;
        };
        lunr2.QueryParseError = function(message, start, end) {
          this.name = "QueryParseError";
          this.message = message;
          this.start = start;
          this.end = end;
        };
        lunr2.QueryParseError.prototype = new Error();
        lunr2.QueryLexer = function(str) {
          this.lexemes = [];
          this.str = str;
          this.length = str.length;
          this.pos = 0;
          this.start = 0;
          this.escapeCharPositions = [];
        };
        lunr2.QueryLexer.prototype.run = function() {
          var state = lunr2.QueryLexer.lexText;
          while (state) {
            state = state(this);
          }
        };
        lunr2.QueryLexer.prototype.sliceString = function() {
          var subSlices = [], sliceStart = this.start, sliceEnd = this.pos;
          for (var i = 0; i < this.escapeCharPositions.length; i++) {
            sliceEnd = this.escapeCharPositions[i];
            subSlices.push(this.str.slice(sliceStart, sliceEnd));
            sliceStart = sliceEnd + 1;
          }
          subSlices.push(this.str.slice(sliceStart, this.pos));
          this.escapeCharPositions.length = 0;
          return subSlices.join("");
        };
        lunr2.QueryLexer.prototype.emit = function(type) {
          this.lexemes.push({
            type,
            str: this.sliceString(),
            start: this.start,
            end: this.pos
          });
          this.start = this.pos;
        };
        lunr2.QueryLexer.prototype.escapeCharacter = function() {
          this.escapeCharPositions.push(this.pos - 1);
          this.pos += 1;
        };
        lunr2.QueryLexer.prototype.next = function() {
          if (this.pos >= this.length) {
            return lunr2.QueryLexer.EOS;
          }
          var char = this.str.charAt(this.pos);
          this.pos += 1;
          return char;
        };
        lunr2.QueryLexer.prototype.width = function() {
          return this.pos - this.start;
        };
        lunr2.QueryLexer.prototype.ignore = function() {
          if (this.start == this.pos) {
            this.pos += 1;
          }
          this.start = this.pos;
        };
        lunr2.QueryLexer.prototype.backup = function() {
          this.pos -= 1;
        };
        lunr2.QueryLexer.prototype.acceptDigitRun = function() {
          var char, charCode;
          do {
            char = this.next();
            charCode = char.charCodeAt(0);
          } while (charCode > 47 && charCode < 58);
          if (char != lunr2.QueryLexer.EOS) {
            this.backup();
          }
        };
        lunr2.QueryLexer.prototype.more = function() {
          return this.pos < this.length;
        };
        lunr2.QueryLexer.EOS = "EOS";
        lunr2.QueryLexer.FIELD = "FIELD";
        lunr2.QueryLexer.TERM = "TERM";
        lunr2.QueryLexer.EDIT_DISTANCE = "EDIT_DISTANCE";
        lunr2.QueryLexer.BOOST = "BOOST";
        lunr2.QueryLexer.PRESENCE = "PRESENCE";
        lunr2.QueryLexer.lexField = function(lexer) {
          lexer.backup();
          lexer.emit(lunr2.QueryLexer.FIELD);
          lexer.ignore();
          return lunr2.QueryLexer.lexText;
        };
        lunr2.QueryLexer.lexTerm = function(lexer) {
          if (lexer.width() > 1) {
            lexer.backup();
            lexer.emit(lunr2.QueryLexer.TERM);
          }
          lexer.ignore();
          if (lexer.more()) {
            return lunr2.QueryLexer.lexText;
          }
        };
        lunr2.QueryLexer.lexEditDistance = function(lexer) {
          lexer.ignore();
          lexer.acceptDigitRun();
          lexer.emit(lunr2.QueryLexer.EDIT_DISTANCE);
          return lunr2.QueryLexer.lexText;
        };
        lunr2.QueryLexer.lexBoost = function(lexer) {
          lexer.ignore();
          lexer.acceptDigitRun();
          lexer.emit(lunr2.QueryLexer.BOOST);
          return lunr2.QueryLexer.lexText;
        };
        lunr2.QueryLexer.lexEOS = function(lexer) {
          if (lexer.width() > 0) {
            lexer.emit(lunr2.QueryLexer.TERM);
          }
        };
        lunr2.QueryLexer.termSeparator = lunr2.tokenizer.separator;
        lunr2.QueryLexer.lexText = function(lexer) {
          while (true) {
            var char = lexer.next();
            if (char == lunr2.QueryLexer.EOS) {
              return lunr2.QueryLexer.lexEOS;
            }
            if (char.charCodeAt(0) == 92) {
              lexer.escapeCharacter();
              continue;
            }
            if (char == ":") {
              return lunr2.QueryLexer.lexField;
            }
            if (char == "~") {
              lexer.backup();
              if (lexer.width() > 0) {
                lexer.emit(lunr2.QueryLexer.TERM);
              }
              return lunr2.QueryLexer.lexEditDistance;
            }
            if (char == "^") {
              lexer.backup();
              if (lexer.width() > 0) {
                lexer.emit(lunr2.QueryLexer.TERM);
              }
              return lunr2.QueryLexer.lexBoost;
            }
            if (char == "+" && lexer.width() === 1) {
              lexer.emit(lunr2.QueryLexer.PRESENCE);
              return lunr2.QueryLexer.lexText;
            }
            if (char == "-" && lexer.width() === 1) {
              lexer.emit(lunr2.QueryLexer.PRESENCE);
              return lunr2.QueryLexer.lexText;
            }
            if (char.match(lunr2.QueryLexer.termSeparator)) {
              return lunr2.QueryLexer.lexTerm;
            }
          }
        };
        lunr2.QueryParser = function(str, query) {
          this.lexer = new lunr2.QueryLexer(str);
          this.query = query;
          this.currentClause = {};
          this.lexemeIdx = 0;
        };
        lunr2.QueryParser.prototype.parse = function() {
          this.lexer.run();
          this.lexemes = this.lexer.lexemes;
          var state = lunr2.QueryParser.parseClause;
          while (state) {
            state = state(this);
          }
          return this.query;
        };
        lunr2.QueryParser.prototype.peekLexeme = function() {
          return this.lexemes[this.lexemeIdx];
        };
        lunr2.QueryParser.prototype.consumeLexeme = function() {
          var lexeme = this.peekLexeme();
          this.lexemeIdx += 1;
          return lexeme;
        };
        lunr2.QueryParser.prototype.nextClause = function() {
          var completedClause = this.currentClause;
          this.query.clause(completedClause);
          this.currentClause = {};
        };
        lunr2.QueryParser.parseClause = function(parser) {
          var lexeme = parser.peekLexeme();
          if (lexeme == void 0) {
            return;
          }
          switch (lexeme.type) {
            case lunr2.QueryLexer.PRESENCE:
              return lunr2.QueryParser.parsePresence;
            case lunr2.QueryLexer.FIELD:
              return lunr2.QueryParser.parseField;
            case lunr2.QueryLexer.TERM:
              return lunr2.QueryParser.parseTerm;
            default:
              var errorMessage = "expected either a field or a term, found " + lexeme.type;
              if (lexeme.str.length >= 1) {
                errorMessage += " with value '" + lexeme.str + "'";
              }
              throw new lunr2.QueryParseError(errorMessage, lexeme.start, lexeme.end);
          }
        };
        lunr2.QueryParser.parsePresence = function(parser) {
          var lexeme = parser.consumeLexeme();
          if (lexeme == void 0) {
            return;
          }
          switch (lexeme.str) {
            case "-":
              parser.currentClause.presence = lunr2.Query.presence.PROHIBITED;
              break;
            case "+":
              parser.currentClause.presence = lunr2.Query.presence.REQUIRED;
              break;
            default:
              var errorMessage = "unrecognised presence operator'" + lexeme.str + "'";
              throw new lunr2.QueryParseError(errorMessage, lexeme.start, lexeme.end);
          }
          var nextLexeme = parser.peekLexeme();
          if (nextLexeme == void 0) {
            var errorMessage = "expecting term or field, found nothing";
            throw new lunr2.QueryParseError(errorMessage, lexeme.start, lexeme.end);
          }
          switch (nextLexeme.type) {
            case lunr2.QueryLexer.FIELD:
              return lunr2.QueryParser.parseField;
            case lunr2.QueryLexer.TERM:
              return lunr2.QueryParser.parseTerm;
            default:
              var errorMessage = "expecting term or field, found '" + nextLexeme.type + "'";
              throw new lunr2.QueryParseError(errorMessage, nextLexeme.start, nextLexeme.end);
          }
        };
        lunr2.QueryParser.parseField = function(parser) {
          var lexeme = parser.consumeLexeme();
          if (lexeme == void 0) {
            return;
          }
          if (parser.query.allFields.indexOf(lexeme.str) == -1) {
            var possibleFields = parser.query.allFields.map(function(f) {
              return "'" + f + "'";
            }).join(", "), errorMessage = "unrecognised field '" + lexeme.str + "', possible fields: " + possibleFields;
            throw new lunr2.QueryParseError(errorMessage, lexeme.start, lexeme.end);
          }
          parser.currentClause.fields = [lexeme.str];
          var nextLexeme = parser.peekLexeme();
          if (nextLexeme == void 0) {
            var errorMessage = "expecting term, found nothing";
            throw new lunr2.QueryParseError(errorMessage, lexeme.start, lexeme.end);
          }
          switch (nextLexeme.type) {
            case lunr2.QueryLexer.TERM:
              return lunr2.QueryParser.parseTerm;
            default:
              var errorMessage = "expecting term, found '" + nextLexeme.type + "'";
              throw new lunr2.QueryParseError(errorMessage, nextLexeme.start, nextLexeme.end);
          }
        };
        lunr2.QueryParser.parseTerm = function(parser) {
          var lexeme = parser.consumeLexeme();
          if (lexeme == void 0) {
            return;
          }
          parser.currentClause.term = lexeme.str.toLowerCase();
          if (lexeme.str.indexOf("*") != -1) {
            parser.currentClause.usePipeline = false;
          }
          var nextLexeme = parser.peekLexeme();
          if (nextLexeme == void 0) {
            parser.nextClause();
            return;
          }
          switch (nextLexeme.type) {
            case lunr2.QueryLexer.TERM:
              parser.nextClause();
              return lunr2.QueryParser.parseTerm;
            case lunr2.QueryLexer.FIELD:
              parser.nextClause();
              return lunr2.QueryParser.parseField;
            case lunr2.QueryLexer.EDIT_DISTANCE:
              return lunr2.QueryParser.parseEditDistance;
            case lunr2.QueryLexer.BOOST:
              return lunr2.QueryParser.parseBoost;
            case lunr2.QueryLexer.PRESENCE:
              parser.nextClause();
              return lunr2.QueryParser.parsePresence;
            default:
              var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'";
              throw new lunr2.QueryParseError(errorMessage, nextLexeme.start, nextLexeme.end);
          }
        };
        lunr2.QueryParser.parseEditDistance = function(parser) {
          var lexeme = parser.consumeLexeme();
          if (lexeme == void 0) {
            return;
          }
          var editDistance = parseInt(lexeme.str, 10);
          if (isNaN(editDistance)) {
            var errorMessage = "edit distance must be numeric";
            throw new lunr2.QueryParseError(errorMessage, lexeme.start, lexeme.end);
          }
          parser.currentClause.editDistance = editDistance;
          var nextLexeme = parser.peekLexeme();
          if (nextLexeme == void 0) {
            parser.nextClause();
            return;
          }
          switch (nextLexeme.type) {
            case lunr2.QueryLexer.TERM:
              parser.nextClause();
              return lunr2.QueryParser.parseTerm;
            case lunr2.QueryLexer.FIELD:
              parser.nextClause();
              return lunr2.QueryParser.parseField;
            case lunr2.QueryLexer.EDIT_DISTANCE:
              return lunr2.QueryParser.parseEditDistance;
            case lunr2.QueryLexer.BOOST:
              return lunr2.QueryParser.parseBoost;
            case lunr2.QueryLexer.PRESENCE:
              parser.nextClause();
              return lunr2.QueryParser.parsePresence;
            default:
              var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'";
              throw new lunr2.QueryParseError(errorMessage, nextLexeme.start, nextLexeme.end);
          }
        };
        lunr2.QueryParser.parseBoost = function(parser) {
          var lexeme = parser.consumeLexeme();
          if (lexeme == void 0) {
            return;
          }
          var boost = parseInt(lexeme.str, 10);
          if (isNaN(boost)) {
            var errorMessage = "boost must be numeric";
            throw new lunr2.QueryParseError(errorMessage, lexeme.start, lexeme.end);
          }
          parser.currentClause.boost = boost;
          var nextLexeme = parser.peekLexeme();
          if (nextLexeme == void 0) {
            parser.nextClause();
            return;
          }
          switch (nextLexeme.type) {
            case lunr2.QueryLexer.TERM:
              parser.nextClause();
              return lunr2.QueryParser.parseTerm;
            case lunr2.QueryLexer.FIELD:
              parser.nextClause();
              return lunr2.QueryParser.parseField;
            case lunr2.QueryLexer.EDIT_DISTANCE:
              return lunr2.QueryParser.parseEditDistance;
            case lunr2.QueryLexer.BOOST:
              return lunr2.QueryParser.parseBoost;
            case lunr2.QueryLexer.PRESENCE:
              parser.nextClause();
              return lunr2.QueryParser.parsePresence;
            default:
              var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'";
              throw new lunr2.QueryParseError(errorMessage, nextLexeme.start, nextLexeme.end);
          }
        };
        (function(root, factory) {
          if (typeof define === "function" && define.amd) {
            define(factory);
          } else if (typeof exports === "object") {
            module.exports = factory();
          } else {
            root.lunr = factory();
          }
        })(this, function() {
          return lunr2;
        });
      })();
    }
  });

  // src/clientscript.js
  var import_lunr = __toESM(require_lunr(), 1);
  function buildUrl(path) {
    const baseUrl = document.documentElement.getAttribute("data-base-url") || "/";
    if (path.startsWith("http")) return path;
    const cleanBase = baseUrl.replace(/\/$/, "");
    const cleanPath = path.replace(/^\//, "");
    return cleanBase + "/" + cleanPath;
  }
  var idx;
  var searchData = {};
  var CACHE_KEYS = {
    INDEX: "okidoki_lunr_index",
    DATA: "okidoki_search_data",
    META: "okidoki_search_meta",
    INDEX_ETAG: "okidoki_lunr_index_etag",
    DATA_ETAG: "okidoki_search_data_etag",
    TIMESTAMP: "okidoki_cache_timestamp"
  };
  var CACHE_EXPIRY = 24 * 60 * 60 * 1e3;
  function clearSearchCache() {
    console.log("\u{1F5D1}\uFE0F Clearing search cache...");
    try {
      localStorage.removeItem("okidoki_search_index");
      localStorage.removeItem("okidoki_search_data");
      localStorage.removeItem("okidoki_search_timestamp");
      localStorage.removeItem("okidoki_search_etag");
      console.log("\u2705 Search cache cleared");
    } catch (e) {
      console.warn("Failed to clear search cache:", e);
    }
  }
  function saveSearchState(query, results) {
    try {
      if (!query || query.trim().length < 2) {
        localStorage.removeItem("okidoki_last_search");
        return;
      }
      const searchState = {
        query: query.trim(),
        results,
        timestamp: Date.now()
      };
      localStorage.setItem("okidoki_last_search", JSON.stringify(searchState));
      console.log("\u{1F4BE} Search state saved:", query);
    } catch (e) {
      console.warn("Failed to save search state:", e);
    }
  }
  function clearSavedSearchState() {
    try {
      localStorage.removeItem("okidoki_last_search");
      console.log("\u{1F5D1}\uFE0F Search state cleared");
      const searchInputs = document.querySelectorAll("#search-desktop, #search-mobile, #search-mobile-navbar");
      searchInputs.forEach((input) => {
        if (input && input.value.trim()) {
          const activeElement = document.activeElement;
          if (input !== activeElement) {
            input.value = "";
          }
        }
      });
    } catch (e) {
      console.warn("Failed to clear search state:", e);
    }
  }
  function loadSearchState() {
    try {
      const saved = localStorage.getItem("okidoki_last_search");
      if (!saved) return null;
      const searchState = JSON.parse(saved);
      const maxAge = 24 * 60 * 60 * 1e3;
      if (Date.now() - searchState.timestamp > maxAge) {
        localStorage.removeItem("okidoki_last_search");
        return null;
      }
      return searchState;
    } catch (e) {
      console.warn("Failed to load search state:", e);
      localStorage.removeItem("okidoki_last_search");
      return null;
    }
  }
  function restoreSearchState() {
    const savedState = loadSearchState();
    if (!savedState || !idx) return;
    console.log("\u{1F504} Restoring search state:", savedState.query);
    const searchInputs = document.querySelectorAll("#search-desktop, #search-mobile, #search-mobile-navbar");
    searchInputs.forEach((input) => {
      if (input) {
        input.value = savedState.query;
        if (!input.hasAttribute("data-search-listeners-added")) {
          input.setAttribute("data-search-listeners-added", "true");
          input.addEventListener("focus", function(e) {
            const currentSavedState = loadSearchState();
            if (currentSavedState && currentSavedState.query === e.target.value.trim() && e.target.value.trim().length >= 2) {
              showCachedSearchResults(currentSavedState.query, currentSavedState.results);
            }
          });
          input.addEventListener("click", function(e) {
            const currentSavedState = loadSearchState();
            if (currentSavedState && currentSavedState.query === e.target.value.trim() && e.target.value.trim().length >= 2) {
              showCachedSearchResults(currentSavedState.query, currentSavedState.results);
            }
          });
        }
      }
    });
  }
  function showCachedSearchResults(query, results) {
    console.log("\u{1F4CB} Showing cached search results for:", query);
    updateSearchResults("search-results", query, results);
    updateSearchResults("search-results-mobile", query, results);
    updateSearchResults("search-results-mobile-navbar", query, results);
  }
  async function initializeSearch() {
    try {
      console.log("\u{1F50D} Initializing search...");
      const cachedData = await loadFromCache();
      console.log("\u{1F4E6} Cache load result:", cachedData.success ? "SUCCESS" : "FAILED", cachedData.reason || "");
      if (cachedData.success) {
        idx = cachedData.index;
        searchData = cachedData.data;
        console.log("\u2705 Search initialized from cache");
        restoreSearchState();
        return;
      }
      console.log("\u{1F310} Cache miss - clearing old cache and fetching search data from server");
      clearSearchCache();
      await fetchAndCacheSearchData();
      restoreSearchState();
    } catch (e) {
      console.warn("\u274C Failed to initialize search:", e);
    }
  }
  async function loadFromCache() {
    try {
      console.log("\u{1F4E6} Attempting to load from cache...");
      const localStorageAvailable = isLocalStorageAvailable();
      console.log("\u{1F4BE} localStorage available:", localStorageAvailable);
      if (!localStorageAvailable) {
        return { success: false, reason: "localStorage not available" };
      }
      const cachedIndex = localStorage.getItem(CACHE_KEYS.INDEX);
      const cachedData = localStorage.getItem(CACHE_KEYS.DATA);
      const cachedMeta = localStorage.getItem(CACHE_KEYS.META);
      const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
      console.log("\u{1F4E6} Cache check:", {
        hasIndex: !!cachedIndex,
        hasData: !!cachedData,
        hasMeta: !!cachedMeta,
        hasTimestamp: !!timestamp,
        indexSize: cachedIndex ? `${(cachedIndex.length / 1024).toFixed(1)}KB` : "none",
        dataSize: cachedData ? `${(cachedData.length / 1024).toFixed(1)}KB` : "none"
      });
      if (!cachedIndex || !cachedData || !timestamp) {
        return { success: false, reason: "missing cached data" };
      }
      const shouldValidate = await shouldValidateCache(timestamp);
      console.log("\u{1F504} Should validate cache:", shouldValidate);
      if (shouldValidate) {
        const isValid = await validateCacheWithServer();
        console.log("\u2705 Cache validation result:", isValid ? "VALID" : "INVALID");
        if (!isValid) {
          console.log("\u{1F504} Server files changed - cache invalid");
          return { success: false, reason: "server files changed" };
        }
      }
      console.log("\u{1F4CA} Parsing cached data...");
      const indexData = JSON.parse(cachedIndex);
      const searchDataParsed = JSON.parse(cachedData);
      const loadedIndex = import_lunr.default.Index.load(indexData);
      console.log("\u2705 Successfully loaded from cache");
      return {
        success: true,
        index: loadedIndex,
        data: searchDataParsed
      };
    } catch (e) {
      console.warn("\u274C Failed to load from cache:", e);
      return { success: false, reason: "parse error: " + e.message };
    }
  }
  async function shouldValidateCache(timestamp) {
    const age = Date.now() - parseInt(timestamp);
    const ageHours = age / (1e3 * 60 * 60);
    const expiryHours = CACHE_EXPIRY / (1e3 * 60 * 60);
    console.log("\u23F0 Cache age check:", {
      ageHours: ageHours.toFixed(2),
      expiryHours,
      expired: age > CACHE_EXPIRY
    });
    if (age > CACHE_EXPIRY) {
      console.log("\u23F0 Cache expired - validation required");
      return true;
    }
    const contentHashValidationInterval = 1 * 60 * 1e3;
    if (age > contentHashValidationInterval) {
      console.log("\u{1F504} Content hash validation interval reached - validation required");
      return true;
    }
    console.log("\u{1F3B2} Cache is very fresh - skipping validation for now");
    return false;
  }
  async function validateCacheWithServer() {
    try {
      console.log("\u{1F504} Validating cache with server using content hash...");
      const metaResponse = await fetch(buildUrl("/search-meta.json")).catch((e) => {
        console.warn("\u{1F4E1} Meta request failed:", e.message);
        return null;
      });
      if (metaResponse && metaResponse.ok) {
        console.log("\u{1F4CA} Got server metadata - using content hash validation");
        const serverMeta = await metaResponse.json();
        const cachedMeta = localStorage.getItem(CACHE_KEYS.META);
        console.log("\u{1F50D} Content hash validation:", {
          hasServerMeta: !!serverMeta,
          hasCachedMeta: !!cachedMeta
        });
        if (cachedMeta) {
          const parsedCachedMeta = JSON.parse(cachedMeta);
          console.log("\u{1F50D} Hash comparison:", {
            serverIndexHash: serverMeta.indexHash,
            cachedIndexHash: parsedCachedMeta.indexHash,
            serverDataHash: serverMeta.dataHash,
            cachedDataHash: parsedCachedMeta.dataHash
          });
          if (serverMeta.indexHash !== parsedCachedMeta.indexHash || serverMeta.dataHash !== parsedCachedMeta.dataHash) {
            console.log("\u274C Content hash mismatch - cache invalid");
            return false;
          }
          console.log("\u2705 Content hash validation passed - cache is still valid");
          return true;
        } else {
          console.log("\u274C No cached metadata - assuming cache is invalid");
          return false;
        }
      }
      console.log("\u{1F504} Falling back to ETag validation...");
      const cachedIndexETag = localStorage.getItem(CACHE_KEYS.INDEX_ETAG);
      const cachedDataETag = localStorage.getItem(CACHE_KEYS.DATA_ETAG);
      console.log("\u{1F3F7}\uFE0F Cached ETags:", {
        indexETag: cachedIndexETag,
        dataETag: cachedDataETag
      });
      if (!cachedIndexETag && !cachedDataETag) {
        console.log("\u{1F3F7}\uFE0F No ETags or metadata available - invalidating cache for safety");
        return false;
      }
      console.log("\u{1F4E1} Making HEAD requests for ETag validation...");
      const [indexHead, dataHead] = await Promise.all([
        fetch(buildUrl("/lunr-index.json"), { method: "HEAD" }).catch((e) => {
          console.warn("\u{1F4E1} Index HEAD request failed:", e.message);
          return null;
        }),
        fetch(buildUrl("/search-data.json"), { method: "HEAD" }).catch((e) => {
          console.warn("\u{1F4E1} Data HEAD request failed:", e.message);
          return null;
        })
      ]);
      console.log("\u{1F4E1} HEAD responses:", {
        indexOk: indexHead?.ok,
        dataOk: dataHead?.ok
      });
      if (indexHead && cachedIndexETag) {
        const serverIndexETag = indexHead.headers.get("etag");
        console.log("\u{1F3F7}\uFE0F Index ETag comparison:", {
          cached: cachedIndexETag,
          server: serverIndexETag
        });
        if (serverIndexETag && serverIndexETag !== cachedIndexETag) {
          console.log("\u274C Index ETag mismatch - cache invalid");
          return false;
        }
      }
      if (dataHead && cachedDataETag) {
        const serverDataETag = dataHead.headers.get("etag");
        console.log("\u{1F3F7}\uFE0F Data ETag comparison:", {
          cached: cachedDataETag,
          server: serverDataETag
        });
        if (serverDataETag && serverDataETag !== cachedDataETag) {
          console.log("\u274C Data ETag mismatch - cache invalid");
          return false;
        }
      }
      console.log("\u2705 ETag validation passed - cache is still valid");
      return true;
    } catch (e) {
      console.warn("\u274C Failed to validate cache with server:", e);
      console.log("\u{1F504} Invalidating cache due to validation error for safety");
      return false;
    }
  }
  async function fetchAndCacheSearchData() {
    try {
      console.log("\u{1F310} Fetching search data from server...");
      const [indexResponse, dataResponse, metaResponse] = await Promise.all([
        fetch(buildUrl("/lunr-index.json")),
        fetch(buildUrl("/search-data.json")),
        fetch(buildUrl("/search-meta.json")).catch((e) => {
          console.warn("\u{1F4E1} Meta fetch failed (this is ok for older builds):", e.message);
          return null;
        })
      ]);
      console.log("\u{1F4E1} Fetch responses:", {
        indexOk: indexResponse.ok,
        indexStatus: indexResponse.status,
        dataOk: dataResponse.ok,
        dataStatus: dataResponse.status,
        metaOk: metaResponse?.ok,
        metaStatus: metaResponse?.status
      });
      if (indexResponse.ok && dataResponse.ok) {
        console.log("\u{1F4CA} Parsing response data...");
        const prebuiltIndex = await indexResponse.json();
        const fetchedSearchData = await dataResponse.json();
        const fetchedMeta = metaResponse?.ok ? await metaResponse.json() : null;
        console.log("\u{1F4CA} Data parsed:", {
          indexKeys: Object.keys(prebuiltIndex).length,
          dataEntries: Object.keys(fetchedSearchData).length,
          hasMeta: !!fetchedMeta
        });
        console.log("\u{1F50D} Loading lunr index...");
        idx = import_lunr.default.Index.load(prebuiltIndex);
        searchData = fetchedSearchData;
        console.log("\u{1F4BE} Caching data...");
        await cacheSearchData(prebuiltIndex, fetchedSearchData, fetchedMeta, indexResponse, dataResponse, metaResponse);
        console.log("\u2705 Search data fetched and cached successfully");
      } else {
        console.warn("\u274C Search index files not found - search functionality disabled");
      }
    } catch (e) {
      console.warn("\u274C Failed to fetch search data:", e);
    }
  }
  async function cacheSearchData(indexData, searchData2, metaData, indexResponse, dataResponse, metaResponse) {
    try {
      console.log("\u{1F4BE} Starting cache storage...");
      const localStorageAvailable = isLocalStorageAvailable();
      console.log("\u{1F4BE} localStorage check for caching:", localStorageAvailable);
      if (!localStorageAvailable) {
        console.warn("\u274C localStorage not available - skipping cache");
        return;
      }
      console.log("\u{1F4BE} Storing data in localStorage...");
      const indexJson = JSON.stringify(indexData);
      const dataJson = JSON.stringify(searchData2);
      const metaJson = metaData ? JSON.stringify(metaData) : null;
      const timestamp = Date.now().toString();
      console.log("\u{1F4BE} Data sizes before storage:", {
        indexSize: `${(indexJson.length / 1024).toFixed(1)}KB`,
        dataSize: `${(dataJson.length / 1024).toFixed(1)}KB`,
        metaSize: metaJson ? `${(metaJson.length / 1024).toFixed(1)}KB` : "none",
        totalSize: `${((indexJson.length + dataJson.length + (metaJson?.length || 0)) / 1024).toFixed(1)}KB`
      });
      localStorage.setItem(CACHE_KEYS.INDEX, indexJson);
      localStorage.setItem(CACHE_KEYS.DATA, dataJson);
      localStorage.setItem(CACHE_KEYS.TIMESTAMP, timestamp);
      if (metaJson) {
        localStorage.setItem(CACHE_KEYS.META, metaJson);
        console.log("\u{1F4BE} Metadata stored successfully");
      }
      console.log("\u{1F4BE} Basic data stored successfully");
      const indexETag = indexResponse.headers.get("etag");
      const dataETag = dataResponse.headers.get("etag");
      console.log("\u{1F3F7}\uFE0F ETags:", { indexETag, dataETag });
      if (indexETag) {
        localStorage.setItem(CACHE_KEYS.INDEX_ETAG, indexETag);
      }
      if (dataETag) {
        localStorage.setItem(CACHE_KEYS.DATA_ETAG, dataETag);
      }
      console.log("\u2705 Search data cached successfully");
      const verification = {
        hasIndex: !!localStorage.getItem(CACHE_KEYS.INDEX),
        hasData: !!localStorage.getItem(CACHE_KEYS.DATA),
        hasTimestamp: !!localStorage.getItem(CACHE_KEYS.TIMESTAMP)
      };
      console.log("\u2705 Cache verification:", verification);
    } catch (e) {
      console.error("\u274C Failed to cache search data:", e);
      if (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
        console.warn("\u{1F4BE} localStorage quota exceeded - clearing old cache data");
        clearSearchCache();
      } else {
        console.warn("\u{1F4BE} Cache storage failed:", e.name, e.message);
      }
    }
  }
  function isLocalStorageAvailable() {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
  window.clearSearchCache = clearSearchCache;
  window.getSearchCacheInfo = function() {
    if (!isLocalStorageAvailable()) {
      return { error: "localStorage not available" };
    }
    const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
    const indexSize = localStorage.getItem(CACHE_KEYS.INDEX)?.length || 0;
    const dataSize = localStorage.getItem(CACHE_KEYS.DATA)?.length || 0;
    const indexETag = localStorage.getItem(CACHE_KEYS.INDEX_ETAG);
    const dataETag = localStorage.getItem(CACHE_KEYS.DATA_ETAG);
    return {
      cached: !!timestamp,
      timestamp: timestamp ? new Date(parseInt(timestamp)).toISOString() : null,
      age: timestamp ? Date.now() - parseInt(timestamp) : null,
      ageHours: timestamp ? ((Date.now() - parseInt(timestamp)) / (1e3 * 60 * 60)).toFixed(2) : null,
      indexSize: `${(indexSize / 1024).toFixed(2)} KB`,
      dataSize: `${(dataSize / 1024).toFixed(2)} KB`,
      totalSize: `${((indexSize + dataSize) / 1024).toFixed(2)} KB`,
      indexETag,
      dataETag,
      expiryHours: CACHE_EXPIRY / (1e3 * 60 * 60)
    };
  };
  window.testCacheValidation = async function() {
    console.log("\u{1F9EA} Testing cache validation manually...");
    const isValid = await validateCacheWithServer();
    console.log("\u{1F9EA} Manual validation result:", isValid ? "VALID" : "INVALID");
    return isValid;
  };
  window.forceRefreshSearchCache = async function() {
    console.log("Force refreshing search cache...");
    clearSearchCache();
    await initializeSearch();
    console.log("Search cache refreshed");
    return window.getSearchCacheInfo();
  };
  window.debugLocalStorage = function() {
    console.log("\u{1F50D} localStorage Debug Info:");
    console.log("localStorage available:", isLocalStorageAvailable());
    if (!isLocalStorageAvailable()) {
      return { error: "localStorage not available" };
    }
    const allKeys = Object.keys(localStorage).filter((key) => key.startsWith("okidoki_"));
    console.log("Okidoki cache keys found:", allKeys);
    allKeys.forEach((key) => {
      const value = localStorage.getItem(key);
      const size = value ? value.length : 0;
      console.log(`- ${key}: ${size} chars (${(size / 1024).toFixed(1)}KB)`);
      if (size > 0 && size < 1e3) {
        console.log(`  Value: ${value.substring(0, 100)}${size > 100 ? "..." : ""}`);
      }
    });
    return { keys: allKeys, available: true };
  };
  function checkAndApplyUrlHighlighting() {
    try {
      let highlightQuery = "";
      if (window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        highlightQuery = urlParams.get("highlight") || "";
      }
      let sessionHighlight = "";
      try {
        sessionHighlight = sessionStorage.getItem("searchHighlight") || "";
      } catch (e) {
        console.warn("SessionStorage access failed:", e);
      }
      const finalQuery = highlightQuery || sessionHighlight;
      if (finalQuery && finalQuery.length > 1) {
        setTimeout(() => {
          highlightSearchTerms(finalQuery);
        }, 100);
        if (sessionHighlight && !highlightQuery) {
          try {
            sessionStorage.removeItem("searchHighlight");
          } catch (e) {
            console.warn("SessionStorage removal failed:", e);
          }
        }
      }
    } catch (error) {
      console.warn("Highlighting initialization failed:", error);
    }
  }
  document.addEventListener("DOMContentLoaded", function() {
    initializeSearch();
    checkAndApplyUrlHighlighting();
    setTimeout(() => {
      checkAndApplyUrlHighlighting();
    }, 250);
    setTimeout(() => {
      checkAndApplyUrlHighlighting();
    }, 500);
    setTimeout(() => {
      checkAndApplyUrlHighlighting();
    }, 1e3);
    setTimeout(() => {
      checkAndApplyUrlHighlighting();
    }, 2e3);
  });
  window.addEventListener("load", function() {
    setTimeout(() => {
      checkAndApplyUrlHighlighting();
    }, 100);
  });
  var MAX_RESULTS = 10;
  function highlightSearchTerms(query) {
    clearHighlights();
    if (!query || query.length < 2) {
      return;
    }
    let contentArea = document.querySelector(".prose");
    if (!contentArea) {
      contentArea = document.querySelector("main") || document.querySelector(".content") || document.body;
      if (!contentArea) {
        return;
      }
    }
    highlightInElement(contentArea, query);
  }
  function highlightInElement(element, query) {
    const terms = query.toLowerCase().trim().split(/\s+/);
    terms.forEach((term) => {
      if (term.length < 2) return;
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      const textNodes = [];
      let node;
      while (node = walker.nextNode()) {
        textNodes.push(node);
      }
      textNodes.forEach((textNode) => {
        const text = textNode.textContent;
        const regex = new RegExp(`(${escapeRegex(term)})`, "gi");
        if (regex.test(text)) {
          const highlightedHTML = text.replace(regex, '<mark class="search-highlight">$1</mark>');
          const wrapper = document.createElement("span");
          wrapper.innerHTML = highlightedHTML;
          textNode.parentNode.replaceChild(wrapper, textNode);
        }
      });
    });
    setTimeout(() => {
      const firstHighlight = document.querySelector(".search-highlight");
      if (firstHighlight) {
        firstHighlight.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }, 100);
  }
  function clearHighlights() {
    const highlights = document.querySelectorAll(".search-highlight");
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize();
    });
    const wrappers = document.querySelectorAll("span:empty");
    wrappers.forEach((wrapper) => wrapper.remove());
  }
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  window.handleSearch = function(query) {
    const results = updateSearchResults("search-results", query);
    updateSearchResults("search-results-mobile", query, results);
    updateSearchResults("search-results-mobile-navbar", query, results);
    if (query && query.trim().length >= 2 && results) {
      saveSearchState(query, results);
    } else {
      clearSavedSearchState();
    }
  };
  function handleClickOutside(event) {
    const dropdowns = document.querySelectorAll(".dropdown.dropdown-open");
    dropdowns.forEach((dropdown) => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove("dropdown-open");
        const resultsContainer = dropdown.querySelector('[id*="search-results"]');
        if (resultsContainer) {
          resultsContainer.classList.add("hidden");
        }
      }
    });
  }
  document.addEventListener("click", handleClickOutside);
  function updateSearchResults(resultsId, query, cachedResults = null) {
    const searchResultsContainer = document.getElementById(resultsId);
    if (!searchResultsContainer) {
      return null;
    }
    const dropdownParent = searchResultsContainer.closest(".dropdown");
    if (!query || query.trim().length < 2) {
      searchResultsContainer.classList.add("hidden");
      if (dropdownParent) {
        dropdownParent.classList.remove("dropdown-open");
      }
      return null;
    }
    if (!idx) {
      searchResultsContainer.innerHTML = '<li class="p-4 text-sm opacity-50">Search not available</li>';
      searchResultsContainer.classList.remove("hidden");
      if (dropdownParent) {
        dropdownParent.classList.add("dropdown-open");
      }
      return null;
    }
    try {
      let results = [];
      const cleanQuery = query.trim();
      if (cachedResults) {
        results = cachedResults;
      } else {
        try {
          results = idx.search(cleanQuery);
        } catch (e) {
        }
        if (results.length === 0) {
          const wildcardQuery = cleanQuery.split(" ").map((word) => `${word}*`).join(" ");
          try {
            results = idx.search(wildcardQuery);
          } catch (e) {
          }
        }
        if (results.length === 0) {
          const fuzzyQuery = cleanQuery.split(" ").map((word) => `${word}~1`).join(" ");
          try {
            results = idx.search(fuzzyQuery);
          } catch (e) {
          }
        }
      }
      window.searchResults = results;
      if (results.length === 0) {
        searchResultsContainer.classList.add("hidden");
        if (dropdownParent) {
          dropdownParent.classList.remove("dropdown-open");
        }
        return results;
      } else {
        const displayedResults = results.slice(0, MAX_RESULTS);
        searchResultsContainer.innerHTML = displayedResults.map((result) => {
          const doc = searchData[result.ref];
          if (!doc) return "";
          const urlWithSearch = `${doc.path}?highlight=${encodeURIComponent(cleanQuery)}`;
          return `
                        <li class="p-3 hover:bg-base-200 cursor-pointer border-b border-base-300 last:border-b-0" data-url="${urlWithSearch}">
                            <div class="font-medium text-base-content">${doc.title}</div>
                            ${doc.description ? `<div class="text-sm opacity-70 mt-1">${doc.description}</div>` : ""}
                            <div class="text-xs opacity-50 mt-1">${doc.path}</div>
                        </li>
                    `;
        }).join("") + (results.length > MAX_RESULTS ? `
                    <li class="p-2 text-center border-t border-base-300">                        
                        <div class="text-sm opacity-70">+${results.length - MAX_RESULTS} more results</div>                        
                    </li>
                ` : "");
      }
      searchResultsContainer.classList.remove("hidden");
      if (dropdownParent) {
        dropdownParent.classList.add("dropdown-open");
      }
      setupSearchResultInteractions(searchResultsContainer, cleanQuery);
      return results;
    } catch (e) {
      console.error("Search error:", e);
      searchResultsContainer.classList.add("hidden");
      if (dropdownParent) {
        dropdownParent.classList.remove("dropdown-open");
      }
      return null;
    }
  }
  function setupSearchResultInteractions(container, query) {
    const items = container.querySelectorAll("li[data-url]");
    let selectedIndex = -1;
    const inputElement = container.parentElement.querySelector("input");
    const dropdownParent = container.closest(".dropdown");
    items.forEach((item) => {
      item.addEventListener("click", () => {
        const url = item.getAttribute("data-url");
        try {
          sessionStorage.setItem("searchHighlight", query);
        } catch (e) {
          console.warn("Failed to store search highlight:", e);
        }
        window.location.href = url;
      });
      item.addEventListener("mouseenter", () => {
        clearSelected();
        item.classList.add("bg-base-200");
        selectedIndex = Array.from(items).indexOf(item);
      });
      item.addEventListener("mouseleave", () => {
        if (selectedIndex !== Array.from(items).indexOf(item)) {
          item.classList.remove("bg-base-200");
        }
      });
    });
    function clearSelected() {
      items.forEach((item) => item.classList.remove("bg-base-200"));
    }
    function selectItem(index) {
      clearSelected();
      if (index >= 0 && index < items.length) {
        selectedIndex = index;
        items[index].classList.add("bg-base-200");
        items[index].scrollIntoView({ block: "nearest" });
      }
    }
    const keyboardHandler = (e) => {
      if (!container.classList.contains("hidden") && document.activeElement === inputElement) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          e.stopPropagation();
          if (selectedIndex < items.length - 1) {
            selectItem(selectedIndex + 1);
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          e.stopPropagation();
          if (selectedIndex > 0) {
            selectItem(selectedIndex - 1);
          } else if (selectedIndex === 0) {
            clearSelected();
            selectedIndex = -1;
          }
        } else if (e.key === "Enter" && selectedIndex >= 0) {
          e.preventDefault();
          e.stopPropagation();
          const url = items[selectedIndex].getAttribute("data-url");
          try {
            sessionStorage.setItem("searchHighlight", query);
          } catch (e2) {
            console.warn("Failed to store search highlight:", e2);
          }
          window.location.href = url;
        } else if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          container.classList.add("hidden");
          if (dropdownParent) {
            dropdownParent.classList.remove("dropdown-open");
          }
          clearSelected();
          selectedIndex = -1;
        }
      }
    };
    if (inputElement.searchKeyboardHandler) {
      inputElement.removeEventListener("keydown", inputElement.searchKeyboardHandler);
    }
    inputElement.searchKeyboardHandler = keyboardHandler;
    inputElement.addEventListener("keydown", keyboardHandler);
    container.keyboardHandler = keyboardHandler;
  }
  document.addEventListener("keydown", function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      const desktopSearch = document.getElementById("search-desktop");
      const mobileNavbarSearch = document.getElementById("search-mobile-navbar");
      const mobileSearch = document.getElementById("search-mobile");
      if (desktopSearch && window.getComputedStyle(desktopSearch).display !== "none") {
        desktopSearch.focus();
      } else if (mobileNavbarSearch && window.getComputedStyle(mobileNavbarSearch).display !== "none") {
        mobileNavbarSearch.focus();
      } else if (mobileSearch) {
        mobileSearch.focus();
      }
    }
  });
  document.addEventListener("click", function(event) {
    if (!event.target.closest(".dropdown")) {
      const searchResults = document.getElementById("search-results");
      const searchResultsMobile = document.getElementById("search-results-mobile");
      const searchResultsMobileNavbar = document.getElementById("search-results-mobile-navbar");
      if (searchResults) searchResults.classList.add("hidden");
      if (searchResultsMobile) searchResultsMobile.classList.add("hidden");
      if (searchResultsMobileNavbar) searchResultsMobileNavbar.classList.add("hidden");
    }
  });
  function markActiveMenuItems() {
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll("#sidebar-menu ul li a");
    menuItems.forEach((item) => {
      const href = item.getAttribute("href");
      if (!href) return;
      const normalizedHref = href.replace(/^\//, "").replace(/\.html$/, "");
      const normalizedPath = currentPath.replace(/^\//, "").replace(/\.html$/, "");
      const isHome = (normalizedPath === "" || normalizedPath === "index") && (normalizedHref === "" || normalizedHref === "index");
      const isActive = isHome || normalizedPath === normalizedHref;
      if (isActive) {
        item.classList.add("active");
        const details = item.closest("details");
        if (details) {
          details.setAttribute("open", "");
        }
      } else {
        item.classList.remove("active");
      }
    });
  }
  document.addEventListener("DOMContentLoaded", markActiveMenuItems);
  document.addEventListener("DOMContentLoaded", function() {
    const setupSearchNavigation = (inputId, resultsId) => {
      const input = document.getElementById(inputId);
      const results = document.getElementById(resultsId);
      if (!input || !results) return;
      input.addEventListener("keydown", function(e) {
        console.log("Safari debug - input keydown:", inputId, "key:", e.key);
        if (e.key === "ArrowDown") {
          e.preventDefault();
          e.stopPropagation();
          if (!results.classList.contains("hidden")) {
            const firstLink = results.querySelector("li:first-child a[href]");
            if (firstLink) {
              firstLink.focus();
              console.log("Safari debug - focused first result");
            }
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          results.classList.add("hidden");
        }
      });
      results.addEventListener("keydown", function(e) {
        console.log("Safari debug - results keydown:", resultsId, "key:", e.key);
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "Escape") {
          return;
        }
        const allLinks = Array.from(results.querySelectorAll("li a[href]"));
        const currentFocus = document.activeElement;
        const currentIndex = allLinks.indexOf(currentFocus);
        console.log("Safari debug - current index:", currentIndex, "total links:", allLinks.length);
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            e.stopPropagation();
            if (currentIndex >= 0 && currentIndex < allLinks.length - 1) {
              allLinks[currentIndex + 1].focus();
              console.log("Safari debug - moved to next item:", currentIndex + 1);
            }
            break;
          case "ArrowUp":
            e.preventDefault();
            e.stopPropagation();
            if (currentIndex > 0) {
              allLinks[currentIndex - 1].focus();
              console.log("Safari debug - moved to previous item:", currentIndex - 1);
            } else if (currentIndex === 0) {
              input.focus();
              console.log("Safari debug - focused back to input");
            }
            break;
          case "Escape":
            e.preventDefault();
            e.stopPropagation();
            results.classList.add("hidden");
            input.focus();
            console.log("Safari debug - escaped to input");
            break;
        }
      });
    };
    setupSearchNavigation("search-desktop", "search-results");
    setupSearchNavigation("search-mobile-navbar", "search-results-mobile-navbar");
    setupSearchNavigation("search-mobile", "search-results-mobile");
  });
})();
/*! Bundled license information:

lunr/lunr.js:
  (**
   * lunr - http://lunrjs.com - A bit like Solr, but much smaller and not as bright - 2.3.9
   * Copyright (C) 2020 Oliver Nightingale
   * @license MIT
   *)
  (*!
   * lunr.utils
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.Set
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.tokenizer
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.Pipeline
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.Vector
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.stemmer
   * Copyright (C) 2020 Oliver Nightingale
   * Includes code from - http://tartarus.org/~martin/PorterStemmer/js.txt
   *)
  (*!
   * lunr.stopWordFilter
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.trimmer
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.TokenSet
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.Index
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.Builder
   * Copyright (C) 2020 Oliver Nightingale
   *)
*/
