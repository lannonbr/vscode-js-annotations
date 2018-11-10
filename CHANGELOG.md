# Changelog

## 0.10.0-dev
- [Bug] Fixed arrow functions without params not being used
- [Bug] Expressions which were immediately invoked functions after importing ("require("module")(params)) now annotated properly
- [Bug] documentCache was not specific enough and was tripping over itself. Now using last two parts of filepath for documentCache.
- [Bug] Typescript fake `this` parameter won't be used when annotating
- [Dev] Added script to package.json to run just unit tests

## 0.9.1 - Oct 16, 2018
- [Bug] TS casted params were incorrectly annotated by one column.

## 0.9.0 - Sep 29, 2018
- [Feature] Annotations will now be added / remove in real time without needing to save.
- [Hotfix] Fixed CI breaking
- [Hotfix] Rest params with a space between the ... operator and the param name now annotated

## 0.8.4 - Sep 15, 2018
- [Bug] Continued working on cleaning up parameter splitting algorithm. Now doesn't break with functions
- [Feature] Wrote unit tests for splitToParamList function

## 0.8.3 - Sep 14, 2018
- [Bug] Importing functions with require don't cause issues with annotations anymore.
- [Bug] TS functions with Generic types now properly annotate

## 0.8.2 - Sep 14, 2018
- [Hotfix] Duplicate diagnostics were showing up in problems panel. Fixed this in this patch.

## 0.8.1 - Sep 13, 2018
- [Hotfix] Added settings to hide either of the diagnostics or error annotations

## 0.8.0 - Sep 13, 2018
- [Feature] Invalid parameters in JS will now appear in the Problems panel

## 0.7.3 - Sep 12, 2018
- [Bug] Definitions with extra spaces caused incorrect annotations

## 0.7.2 - Sep 6, 2018
- [Bug] Param capturing did not fully capture definition parameter list. Switched off of a regex to properly capture string

## 0.7.1 - Sep 4, 2018
- [Bug] Typescript functions with access modifiers were returning the modifiers instead of param names

## 0.7.0 - Sep 4, 2018
- [Feature] Added config options for annotation font-weight and font-style
- [Bug] Fixed issue where arguments that weren't supposed to be there were being annotated with undefined

## 0.6.1 - Sep 3, 2018
- [Hotfix] Made nested new object expressions annotated

## 0.6.0 - Sep 3, 2018
- [Feature] new object expressions now annotated

## 0.5.2 - Sep 1, 2018
- [Hotfix] Made the last bug fix work with deeply nested object properties (ex: a.b.c.d)

## 0.5.1 - Sep 1, 2018
- [Bug] Array access params (a[2]) and object property params (foo.bar) were not being annotated.

## 0.5.0 - Aug 30, 2018
- [Feature] functions with variadic parameter will be spread across function calls

## 0.4.2 - Aug 29, 2018
- [Bug] fixed issue where #! would break parser and cause annotations not to occur.

## 0.4.1 - Aug 28, 2018
- [Hotfix] switched jsannotations.hideIfEqual to be on by default

## 0.4.0 - Aug 27, 2018
- [Feature] new config: jsannotations.hideIfEqual - will not display annotation if the name of the argument matches the name of the parameter (configured to be false by default).

## 0.3.3 - Aug 27, 2018
- [Bug] for-of loop iterating through functions could cause incorrect decoration.
- [Bug] callback functions could cause incorrect decorations.

## 0.3.2 - Aug 25, 2018
- [Bug] files using tabs as indentation were misaligning annotation

## 0.3.1 - Aug 24, 2018
- [Hotfix] Updated Readme

## 0.3.0 - Aug 24, 2018
- [Feature] Now supports Typescript

## 0.2.1 - Aug 20, 2018
- [Hotfix] Added keybinding for toggling annotations ('ctrl/cmd+k a' by default)
- [Hotfix] Switched color config to use builtin 'colors' contributes property

## 0.2.0 - Aug 19, 2018
- [Feature] Configuration for enabling / disabling annotations: jsannotations.enabled
- [Feature] Configuration for changing color of annotations on light and dark themes: jsannotations.colors
- [Feature] Command to hide / show annotations: "JS Annotations: Hide / Show Annotations
- [Bug] Fixed to only made decorate run on JS files

## 0.1.0 - Aug 15, 2018
- Initial Release