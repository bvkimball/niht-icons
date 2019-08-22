const { toWords } = require("number-to-words")
const execa = require("execa")
const fastCase = require("fast-case")
// const fg = require("fast-glob")
const fs = require("fs-extra")
const path = require("path")
const h2x = require("./transform/h2x")
const svgo = require("./transform/svgo")

const PACKS = [
  "boxicons-logos",
  "boxicons-regular",
  "boxicons-solid",
  // "crypto",
  "evil",
  "fa-brands",
  "fa-regular",
  "fa-solid",
  // "feather",
  "material",
  "octicons",
  "typicons",
]

const SVG_ATTRS = [
  "fill",
  "fill-opacity",
  "fill-rule",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
]

const kebabCase = str =>
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)
    .filter(Boolean)
    .map(x => x.toLowerCase())
    .join("-")

const getComponentName = originalName => {
  originalName = originalName.replace(/^\d+/, digits => `${toWords(parseInt(digits, 10))}_`)
  return originalName.length === 1 ? originalName.toUpperCase() : fastCase.pascalize(originalName)
}

const getTemplate = () =>
  new Promise((resolve, reject) =>
    fs.readFile(path.join(__dirname, "templates", "icon.js.template"), (err, data) => {
      if (err) reject(err)
      else resolve(data.toString())
    })
  )

const baseDir = path.join(__dirname, "..", ".build-cache")
const libDir = path.join(__dirname, "..", "lib")

const pkgJSON = name => `{
  "private": true,
  "sideEffects": false,
  "main": "./${name}",
  "module": "./${name}.esm"
}
`

const pkgJSONBuilt = name => `{
  "private": true,
  "sideEffects": false,
  "main": "./${name}.js",
  "module": "./${name}.esm.js",
  "types": "./${name}.d.ts"
}
`

const generate = async () => {
  console.log("Reading icon packs...")

  const packIcons = await Promise.all(PACKS.map(pack => require(`./sources/${pack}`)()))

  for (const [idx, pack] of packIcons.entries()) {
    if (pack.length === 0) {
      console.log(`Error reading icons from pack ${PACKS[idx]}`)
      process.exit(1)
    }
  }

  const icons = packIcons.reduce((all, icons) => all.concat(...icons), [])

  console.log("Reading template...")
  const template = await getTemplate()

  console.log("Clearing desination files...")
  const destinationFiles = [".build-cache", "lib", ...PACKS, "index.d.ts", "index.esm.js", "index.js", "index.ts", "StyledIconBase", "types"]
  for (const destinationFile of destinationFiles) {
    await fs.remove(path.join(__dirname, "..", destinationFile))
  }

  console.log("Building icons...")
  const totalIcons = icons.length

  for (const icon of icons) {
    const state = {}

    let result = icon.source
    result = await svgo(result)
    result = await h2x(result, state)
    result = result.join("\n      ").replace(/\=\{([\w\d\.]+)\}/gim, '="$1"') //={15.332}

    icon.name = getComponentName(icon.originalName)
    icon.height = state.height || icon.height || 24
    icon.width = state.width || icon.width || 24
    icon.viewBox = state.viewBox || `0 0 ${icon.width} ${icon.height}`
    icon.attrs = { fill: "currentColor", xmlns: "http://www.w3.org/2000/svg" }

    for (const attr of SVG_ATTRS) {
      if (attr in state.attrs) {
        icon.attrs[fastCase.camelize(attr)] = state.attrs[attr]
      }
    }

    // Special-case the `React` icon
    if (icon.name === "React") icon.name = "ReactLogo"
    // Special-case the `Package` icon (conflicts with the package.json file)
    if (icon.name === "Package") icon.name = "PackageIcon"

    const component = () =>
      template
        .replace(/{{attrs}}/g, JSON.stringify(icon.attrs, null, 2).slice(2, -2))
        .replace(/{{height}}/g, icon.height)
        .replace(/{{name}}/g, icon.name)
        .replace(/{{element}}/g, `${icon.pack}-` + kebabCase(icon.name))
        .replace(/{{svg}}/g, result)
        .replace(/{{verticalAlign}}/g, icon.verticalAlign || "middle")
        .replace(/{{viewBox}}/g, icon.viewBox)
        .replace(/{{width}}/g, icon.width)

    const destinationPath = path.join(baseDir, icon.pack, icon.name)
    await fs.mkdirp(destinationPath)
    await fs.outputFile(path.join(destinationPath, `${icon.name}.js`), component())
    await fs.outputFile(path.join(destinationPath, "package.json"), pkgJSON(icon.name))
  }

  console.log("Writing index files...")

  const writeIndexFiles = async () => {
    for (const iconPack of PACKS) {
      const seenNames = new Set()

      const packIcons = icons.filter(({ pack }) => pack === iconPack)
      await fs.outputFile(
        path.join(baseDir, iconPack, "index.js"),
        packIcons
          .map(({ name }) => {
            // The Material icon pack has one icon incorrectly in the pack twice
            const seen = seenNames.has(name)
            seenNames.add(name)
            return seen ? null : `export { ${name} } from './${name}/${name}.js'`
          })
          .filter(lines => lines)
          .join("\n")
      )
    }

    await fs.outputFile(
      path.join(baseDir, "index.js"),
      `${PACKS.map(pack => `import * as ${fastCase.camelize(pack)} from './${pack}'`).join("\n")}

export {${PACKS.map(fastCase.camelize).join(", ")}}
`
    )
  }

  await writeIndexFiles()

  console.log("Creating Bundles...")

  await fs.mkdirp(path.join(libDir))
  for (const iconPack of PACKS) {
    let filepath = path.join(baseDir, iconPack, "index.js")
    let outpath = path.join(libDir, `${kebabCase(iconPack)}.js`)
    console.log("Bundling...", iconPack)
    await execa("./node_modules/.bin/bake", [filepath, "-o", outpath, "-m", "-f", "es", "-e", "https://unpkg.com/@niht/haunted?module"])
    console.log(iconPack, "bundled.")
  }

  console.log("Writing icon manifest for website...")
  const seenImports = new Set()
  await fs.writeJSON(
    path.join(__dirname, "..", "examples", "manifest.json"),
    icons
      .map(({ name, originalName, pack }) => {
        const importPath = `@niht/icons/${kebabCase(pack)}`
        const element = `${kebabCase(pack)}-${kebabCase(name)}`
        if (seenImports.has(element)) return null
        seenImports.add(element)

        return {
          importPath,
          element,
          name,
          originalName,
          pack,
        }
      })
      .filter(icon => icon)
  )

  console.log(`${totalIcons} icons successfully built!`)
}

generate().catch(err => {
  console.log(err.stack)
  process.exit(1)
})
