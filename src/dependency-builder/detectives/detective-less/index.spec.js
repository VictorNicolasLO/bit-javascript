const detective = require('./');
const assert = require('assert');

describe('detective-less', function () {
  function test(src, deps, opts) {
    assert.deepEqual(detective(src, opts), deps);
  }

  describe('throws', function () {
    it('does not throw for empty files', function () {
      assert.doesNotThrow(function () {
        detective('');
      });
    });

    it('throws if the given content is not a string', function () {
      assert.throws(function () {
        detective(function () {});
      });
    });

    it('throws if called with no arguments', function () {
      assert.throws(function () {
        detective();
      });
    });

    it.skip('does throw on broken syntax', function () {
      assert.throws(function () {
        detective('@');
      });
    });
  });

  it('dangles the parsed AST', function () {
    detective('@import "_foo.less";');
    assert.ok(detective.ast);
  });

  describe('less', function () {
    it('returns the dependencies of the given .less file content', function () {
      test('@import "_foo.less";', ['_foo.less']);
      test('@import          "_foo.less";', ['_foo.less']);
      test('@import "_foo";', ['_foo']);
      test('body { color: blue; } @import "_foo.css";', ['_foo.css']);
      test('@import "bar";', ['bar']);
      test('@import "bar"; @import "foo";', ['bar', 'foo']);
      test("@import 'bar';", ['bar']);
      test("@import 'bar.less';", ['bar.less']);
      test('@import "_foo.less";\n@import "_bar.less";', ['_foo.less', '_bar.less']);
      test('@import "_foo.less";\n@import "_bar.less";\n@import "_baz";\n@import "_buttons";', [
        '_foo.less',
        '_bar.less',
        '_baz',
        '_buttons'
      ]);
      test('@import "_nested.less"; body { color: blue; a { text-decoration: underline; }}', ['_nested.less']);
    });

    it('handles comma-separated imports (#2)', function () {
      test('@import "_foo.less", "bar";', ['_foo.less', 'bar']);
    });

    it('allows imports with no semicolon', function () {
      test('@import "_foo.less"\n@import "_bar.less"', ['_foo.less', '_bar.less']);
    });

    it('allow less spical imports', function () {
      test('@import (reference) "_foo.less";', ['_foo.less']);
      test('@import (reference   )   "_foo.less"; ', ['_foo.less']);
      test('@import ( reference ) "_foo.less";', ['_foo.less']);
      test('@import (less) "_foo.less";', ['_foo.less']);
      test('@import (css) "_foo.less";', ['_foo.less']);
      test('@import (once) "_foo.less";', ['_foo.less']);
      test('@import (multiple) "_foo.less";', ['_foo.less']);
      test('@import (optional) "_foo.less";', ['_foo.less']);
      test('@import (inline , optional) "_foo.less";', ['_foo.less']);
      test('@import (inline , optional, multiple) "_foo.less";', ['_foo.less']);
      test('@import (inline               , optional,     multiple) "_foo.less";', ['_foo.less']);
    });
    it('allow style decleretion with number, without block inside class', function () {
      test(
        "@import '../../style/themes/default';@import '../../style/mixins/index'; @keyframes card-loading{0%,100%{background-position:0 50%}50%{background-position:100% 50%}}",
        ['../../style/themes/default', '../../style/mixins/index']
      );
      test(
        '@import url(../colors.module.css);@import url(../variables.module.css);@import url(./config.module.css);.navigationContainer{display:flex}',
        ['../colors.module.css', '../variables.module.css', './config.module.css']
      );
    });
  });
});
