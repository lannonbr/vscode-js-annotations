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
| `jsannotations.fontStyle` | Hide annotation if argument name matches parameter name | "italic" |

## Themable Colors

JS Annotations provides a single themable color being the color of what the annotation should be:

| Name | Description |
|------|-------------|
| `jsannotations.annotationForeground` | Specifies the foreground color for the annotations |

## Contributors 👨‍💻 👩‍💻

Thanks to the following Contributors who have helped with this project in any way

* Flavio Copes ([@flaviocopes](https://github.com/flaviocopes)) (PRs)
* Nigel Scott ([@Gruntfuggly](https://github.com/Gruntfuggly)) (Issues)
* Nurbol Alpysbayev ([@anurbol](https://github.com/anurbol)) (Issues)
* Sioxas ([@sioxas](https://github.com/Sioxas)) (Issues)