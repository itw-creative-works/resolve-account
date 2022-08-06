<p align="center">
  <a href="https://cdn.itwcreativeworks.com/assets/resolve-account/images/logo/resolve-account-brandmark-black-x.svg">
    <img src="https://cdn.itwcreativeworks.com/assets/resolve-account/images/logo/resolve-account-brandmark-black-x.svg" width="100px">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/resolve-account/resolve-account.svg">
  <br>
  <img src="https://img.shields.io/librariesio/release/npm/resolve-account.svg">
  <img src="https://img.shields.io/bundlephobia/min/resolve-account.svg">
  <img src="https://img.shields.io/codeclimate/maintainability-percentage/resolve-account/resolve-account.svg">
  <img src="https://img.shields.io/npm/dm/resolve-account.svg">
  <img src="https://img.shields.io/node/v/resolve-account.svg">
  <img src="https://img.shields.io/website/https/itwcreativeworks.com.svg">
  <img src="https://img.shields.io/github/license/resolve-account/resolve-account.svg">
  <img src="https://img.shields.io/github/contributors/resolve-account/resolve-account.svg">
  <img src="https://img.shields.io/github/last-commit/resolve-account/resolve-account.svg">
  <br>
  <br>
  <a href="https://itwcreativeworks.com">Site</a> | <a href="https://www.npmjs.com/package/resolve-account">NPM Module</a> | <a href="https://github.com/resolve-account/resolve-account">GitHub Repo</a>
  <br>
  <br>
  <strong>resolve-account</strong> is the official ITW Creative Works npm module to standardize and resolve the JSON structure for Firebase Firestore accounts.
</p>

## Resolve Account Works in Node AND browser environments
Yes, this module works in both Node and browser environments, including compatibility with [Webpack](https://www.npmjs.com/package/webpack) and [Browserify](https://www.npmjs.com/package/browserify)!

## Features
* Standardize JSON structure
* Resolve plan IDs for expired plans

## Install Resolve Account
### Install via npm
Install with npm if you plan to use `resolve-account` in a Node project or in the browser.
```shell
npm install resolve-account
```
If you plan to use `resolve-account` in a browser environment, you will probably need to use [Webpack](https://www.npmjs.com/package/webpack), [Browserify](https://www.npmjs.com/package/browserify), or a similar service to compile it.

```js
const ResolveAccount = new (require('resolve-account'))();
const resolved = ResolveAccount.resolve({
  // ... pass in the account JSON from Firebase Firestore
})
```

### Install via CDN
Install with CDN if you plan to use Resolve Account only in a browser environment.
```html
<script src="https://cdn.jsdelivr.net/npm/resolve-account@latest/dist/index.min.js"></script>
<script type="text/javascript">
  var resolved = new ResolveAccount().resolve({
    // ... pass in the account JSON from Firebase Firestore
  })
</script>
```

### Use without installation
You can use `resolve-account` in a variety of ways that require no installation, such as `curl` in terminal/shell. See the **Use without installation** section below.

## Using Resolve Account
After you have followed the install step, you can start using `resolve-account` to resolve Firebase Firestore JSON accounts

For a more in-depth documentation of this library and the Resolve Account service, please visit the official Resolve Account website.

## What Can Resolve Account do?
is the official ITW Creative Works npm module to standardize and resolve the JSON structure for Firebase Firestore accounts.

## Final Words
If you are still having difficulty, we would love for you to post
a question to [the Resolve Account issues page](https://github.com/resolve-account/resolve-account/issues). It is much easier to answer questions that include your code and relevant files! So if you can provide them, we'd be extremely grateful (and more likely to help you find the answer!)

## Projects Using this Library
* coming soon!

Ask us to have your project listed! :)
