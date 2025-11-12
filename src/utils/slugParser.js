class SlugParser {
  constructor(pattern) {
    this.pattern = pattern;
    this.keys = [];
    this.regExp = null;
    this._createSlugRegExp();
  }

  _createSlugRegExp() {
    let string = this.pattern;
    //clean all special chars except {,},?.-
    string = string.replace(/[^a-zA-Z0-9-{}?]+/g, '');
    const regex = string.replace(/\{([a-zA-Z]+[0-9]?)\}+(\*|\?)?/g, (_, key, optional) => {
      this.keys.push(key);
      return `(?<${key}>.+)` + (optional === '?' ? '?' : '');
    });
    this.regExp = new RegExp(`^${regex}$`);
  }

  test(slug = '') {
    return this.regExp && this.regExp.test(slug);
  }

  parse(slug) {
    const result = this.regExp && this.regExp.exec(slug);
    return (result && result.groups) || {};
  }

  slugify(data = {}) {
    return Object.entries(data)
      .reduce((acc, [key, value]) => {
        if (!this.keys.includes(key) || value === undefined || value === null) return acc;

        const formattedValue = (value + '')
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-{}?\s]+/g, '') // remove special chars
          .replace(/\s+/g, '-') // replace spaces with -
          .replace(/-$/, ''); // replace - at the end
        return acc.replace(`{${key}}`, formattedValue);
      }, this.pattern)
      .replace(/{.+}\??/g, ''); // remove all remaining {key}
  }
}

export const slugPattern = '{title}-{id}';
export const slugParser = new SlugParser(slugPattern);

export default SlugParser;
