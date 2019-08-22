# Niht Icons

This is a port of [styled-icons](https://styled-icons.js.org/) using webcomponents for [haunted](https://github.com/matthewp/haunted) using the customized bundle [@niht/haunted](https://github.com/bvkimball/haunted-niht) which includes the css preprocessor by [sytlis](https://stylis.js.org/) and html template literals are bundled from [lit-html](https://lit-html.polymer-project.org/).

## WIP NOTES

- [ ] Ensure treeshaking can occur
- [ ] How to import specific icons or mix and match
- [ ] Make Bundles Smaller
- [ ] Finish gh-page

## Installation

Use the package manager [npm](https://npmjs.org) to install.

```bash
npm install @niht/icons --save
```

### Importing

**Niht Icons** can be imported just like any other library when using a bundler of your choice:

```js
import "@niht/icons/lib/fa-regular.js"
```

### Web modules

**Niht Icons** can work directly in the browser without using any build tools. Simply import the icon bundle from the cdn of your choice:

```js
import "https://unpkg.com/@niht/icons/lib/fa-regular.js"
import "https://unpkg.com/@niht/icons/lib/material.js"
```

or with a script tag in html:

```html
<script type="module" src="https://unpkg.com/@niht/icons/lib/material.js"></script>
```

If you install the icons **locally** this build is located at `node_modules/@niht/icons/*icon-pack*.js`.

### Usage

Each icon pack is bundle and each icon is prefixed with its icon pack name in kebab-case.
eg.:

```html
<material-account-circle></material-account-circle>
<fa-regular-moon></fa-regular-moon>
<fa-regular-sun></fa-regular-sun>
```

## Contributing

This repo is being used to experiment with the libraries that are bundled with it. Its fate is very uncertain, I would recommend using and contributing to the libraries described above.

## License

[UNLICENSE](https://unlicense.org/)

The Boxicons are licensed under the [CC BY 4.0 License](https://boxicons.com/get-started#license).

The Cryptocurrency icons are licensed under the [CC0 1.0 Universal License](https://github.com/atomiclabs/cryptocurrency-icons/blob/master/LICENSE.md).

The Evil Icons are licensed under the [MIT License](https://github.com/evil-icons/evil-icons/blob/master/LICENSE.txt).

The Font Awesome icons are licensed under the [CC BY 4.0 License](https://github.com/FortAwesome/Font-Awesome/blob/master/LICENSE.txt).

The Feather icons are licensed under the [MIT License](https://github.com/feathericons/feather/blob/master/LICENSE).

The Icomoon icons are dual licensed under [GPL](http://www.gnu.org/licenses/gpl.html) / [CC BY 4.0 License](http://creativecommons.org/licenses/by/4.0/).

The Material Design icons are licensed under the [Apache License Version 2.0](https://github.com/google/material-design-icons/blob/master/LICENSE).

The Octicons are licensed under the [MIT License](https://github.com/primer/octicons/blob/master/LICENSE).

The Typicons are licensed under the [CC BY SA 3.0 License](http://creativecommons.org/licenses/by-sa/3.0/).
