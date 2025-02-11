const fs = require('fs');
const path = require('path');
const compiler = require('vue-template-compiler');

const DEFAULT_SCRIPT_LANG = 'js';
const DEFAULT_STYLE_LANG = 'scss';

const languageMap = {
  css: 'scss',
  stylus: 'styl'
};
module.exports = function (options) {
  const { partial, filename, isScript, resolveConfig } = options;
  const cabinet = require('../../filing-cabinet');

  const fileContent = fs.readFileSync(filename);
  const { script, styles } = compiler.parseComponent(fileContent.toString(), { pad: 'line' });
  if (isScript) {
    const scriptExt = script.lang ? languageMap[script.lang] || script.lang : DEFAULT_SCRIPT_LANG;
    return cabinet(
      Object.assign(options, {
        directory: path.dirname(filename),
        content: script.content,
        ast: null,
        ext: `.${scriptExt}` || path.extname(partial)
      })
    );
  }
  const stylesResult = styles.map((style) => {
    const styleExt = style.lang ? languageMap[style.lang] || style.lang : DEFAULT_STYLE_LANG;
    return cabinet(
      Object.assign(options, {
        filename: `${path.join(path.dirname(filename), path.parse(filename).name)}.${styleExt}`,
        directory: path.dirname(filename),
        content: style.content,
        ast: null,
        ext: `.${styleExt}`
      })
    );
  });
  return stylesResult[0];
};
