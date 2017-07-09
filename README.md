yfa-nodejs-code
===============

[![Join the chat at https://gitter.im/jimschubert/yfa-nodejs-code](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jimschubert/yfa-nodejs-code?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This repository is supplemental code to Jim Schubert's book [Your First App: node.js](https://leanpub.com/yfa-nodejs).

The book is a full-stack application development tutorial using what is commonly known as the 'MEAN' stack, but with a heavier focus on the backend technologies: node.js, express.js, and MongoDB. The book ends with a starter AngularJS project of an HTML5 instant messaging chat application.

While following along in the book, it may be useful to run test queries in a REST client. Postman is available for Google Chrome as a packaged application. Import `yfa-nodejs.postman_dump.json` (located in the root of this project) into Postman to evaluate the application's API.

Errata
======

This section will contain any known issues found by readers with possible work arounds.

Initial install of Karma
------------------------

See [issue #1](https://github.com/jimschubert/yfa-nodejs-code/issues/1) for updates and discussions. Here is the suggested workaround to get Karma up and running:

```
npm install -g karma-coffee-preprocessor@0.1.3
npm install -g karma@0.10.4 jshint@2.3.0
npm install karma-mocha@0.1.0
npm install -d
```

Although possible issues with karma are discussed later in the book, newer versions of karma won't be compatible with the karma dependencies in the original `package.json` and you'll need to install these specific versions.
