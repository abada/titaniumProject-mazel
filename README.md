# CODING CONVENTIONS

## Global
- use the force of Alloy/MVC: separate data/models, UI and logic
- reuse code: modularize code with Alloy's <Require> and <Module> elements or attributes. 
  * partials
    - global partials - back button etc.
    - class partials - class dependant partials, like profile forms used in signup steps and profile management
- comments help other to understand your code and thoughts. Use them whereever things are not 100% obvious. Consider comments as a kind of mnemonic reminder: they help you to understand code you wrote months ago, save you from wasting time in thoughts you already spent time on and reduce errors and mistakes!       
- camel case (e.g. class="mainTabTopSeparator" or var \_hideRevealOverlayTimeout)! exceptions: i18n IDs (separated by underscores, e.g. btn_create_account)
- we like space! 4 spaces = 1 tab

## Controller
- default multiline comments for structuring
- member (private) variables and functions start with an underscore (_)
- listeners start with "on". Names describe action of listener not of event

```javascript
var Utils = require('util'),
    _user;

/************
 *** INIT ***
 ************/
$.win.addEventListener('postlayout', onOpened);

/***************
 *** PRIVATE ***
 ***************/
function _showReveal () {}

/*****************
 *** LISTENERS ***
 *****************/
function onOpenDialog () {}
```

## View

## Style
- try to structure the tss by multiline comments indicating the beginning of a block of classes. Like /* HEADER */, /* BUTTONS */, /* TABLE ROW */       
 
 
# PARSE.COM BACKEND ADAPTER

- lib/alloy/sync/parse_rest.js is the home of our parse.com adapter. It's a work in progress library that is changed as needed. But keep in mind to keep it backwards-compatible.
  - It offers the default fetch, create, update and destroy methods. The passed option dictonary provides the possibility to adjust the generated parse.com URL and payload.
- models/File.js etc. are our parse.com objects that make use of the parse_rest adapter


 
