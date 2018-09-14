# Changelog

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