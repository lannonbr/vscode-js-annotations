# ⚠️ This repo is no longer being maintained. See [#92](https://github.com/lannonbr/vscode-js-annotations/issues/92)

---

# JS / TS Parameter Annotations for Visual Studio Code

[![VS Marketplace Version](https://vsmarketplacebadge.apphb.com/version-short/lannonbr.vscode-js-annotations.svg)](https://marketplace.visualstudio.com/items?itemName=lannonbr.vscode-js-annotations)
[![VS Marketplace Installs](https://vsmarketplacebadge.apphb.com/installs-short/lannonbr.vscode-js-annotations.svg)](https://marketplace.visualstudio.com/items?itemName=lannonbr.vscode-js-annotations)
[![VS Marketplace Rating](https://vsmarketplacebadge.apphb.com/rating-short/lannonbr.vscode-js-annotations.svg)](https://marketplace.visualstudio.com/items?itemName=lannonbr.vscode-js-annotations)
[![TravisCI Build Status](https://travis-ci.org/lannonbr/vscode-js-annotations.svg?branch=master)](https://travis-ci.org/lannonbr/vscode-js-annotations)
[![AppVeyor Build status](https://ci.appveyor.com/api/projects/status/xdqr6dl8ofk27sdi?svg=true)](https://ci.appveyor.com/project/lannonbr/vscode-js-annotations)

![jsannotations screenshot](jsannotations.png)

vscode-js-annotations goes through any Javascript or Typescript file and inserts parameter annotations into all function calls so it is easily noticable on what a particular parameter is.

## Settings

There currently is a few configurable settings in the extension

| Name | Description | Default |
|-------|------------|---------|
| `jsannotations.enabled`  | Enable JS Annotations | true |
| `jsannotations.hideIfEqual` | Hide annotation if argument name matches parameter name | true |
| `jsannotations.hideInvalidAnnotation` | Hide annotations for invalid params | true |
| `jsannotations.hideDiagnostics` | Hide red squiggles under invalid parameters | false |
| `jsannotations.fontWeight` | Annotation styling of font-weight CSS property | "400" |
| `jsannotations.fontStyle` | Font style for annotations | "italic" |
| `jsannotations.showFirstSpace` | Show leading whitespace for first parameter | true |

## Themable Colors

JS Annotations provides a single themable color being the color of what the annotation should be. It can be added to the `workbench.colorCustomizations` property in user settings.

| Name | Description |
|------|-------------|
| `jsannotations.annotationForeground` | Specifies the foreground color for the annotations |

## Contributors 👨‍💻 👩‍💻

Thanks to the following Contributors who have helped with this project in any way

* Flavio Copes ([@flaviocopes](https://github.com/flaviocopes)) (PRs)
* Guilherme Amorim ([@GuiAmPm](https://github.com/GuiAmPm)) (PRs)
* Laurens Bosscher ([@LaurensBosscher](https://github.com/LaurensBosscher)) (Issues)
* Luca Steeb ([@steebchen](https://github.com/steebchen)) (Issues)
* Mike Erickson ([@mikeerickson](https://github.com/mikeerickson)) (PRs, Issues)
* Nigel Scott ([@Gruntfuggly](https://github.com/Gruntfuggly)) (Issues)
* Nurbol Alpysbayev ([@anurbol](https://github.com/anurbol)) (Issues)
* Roman Pavlov ([@romap0](https://github.com/romap0)) (PRs)
* Sioxas ([@sioxas](https://github.com/Sioxas)) (Issues)
* Thibault Malbranche ([@Titozzz](https://github.com/Titozzz)) (Issues)
