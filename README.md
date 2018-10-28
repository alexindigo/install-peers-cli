# install-peers-cli

CLI to install project's peerDependencies, without side effects.
Works with `npm`, `yarn`. Supports yarn workspaces flow.

## Install

### yarn

```
$ yarn add --dev install-peers-cli
```
### npm

```
$ npm install --save-dev install-peers-cli
```

## Usage

Add package.json script:

```
{
  "scripts": {
    "install-peers": "install-peers"
  }
}
```

Then run `yarn install-peers` (or `npm run install-peers`) to install `peer` dependencies of your project. It won't update lock files or modify package.json, keeping your setup pure and clean. Any other lifecycle script could be used depending on your use case.

_You still may see "unmet peer dependency" warnings during regular install phase, due to installation flow of npm/yarn._

## License

Install-Peers-CLI is released under the MIT license.
