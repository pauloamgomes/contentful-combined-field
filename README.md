# Contentful Combined Field

The Combined Field is a simple UI extension for Contentful CMS that provides a more enhanced way to deal with text fields that are built with dynamic information.
This can be relevant on situations you want a taxonomy and you want to automaticaly define the title based on the parent.

## Overview

The extension has the following features:

- Generate a dynamic text field based on a pattern defined for each Content Model

## Requirements

- Contentful CMS account with permissions to manage extensions

## Instalation (UI - using this repo)

The UI Extension can be installed manually from the Contentful UI following the below steps:

1. Navigate to Settings > Extensions
2. Click on "Add extension > Install from Github"
3. Use `https://raw.githubusercontent.com/pauloamgomes/contentful-combined-field/master/extension.json` in the url
4. On the extension settings screen change Hosting to Self-hosted using the url `https://pauloamgomes.github.io/contentful-combined-field/`

## Usage

1. Add a new text field to your content model, it can be localized.
2. On the Appearance tab ensure that Combined Field is selected
3. Provide your token based pattern, the pattern can use the following tokens:

- **`[locale]`** - Will replace the token with the node locale
- **`[field:your-field-name]`** - Will replace the token with the value of the field
- **`[field:your-reference-field-name:field-name]`** - Will replace the token with the value of field that belongs to the reference.

### Example patterns:

#### Example 1 `[field:title] ([locale])`

Assuming your locale is English, your entry title is `Category 1` the field value will be: `Category 1 (en)`

![Example with locale](https://monosnap.com/image/yHIjicgg9pvN3FVFyjX2WEdRFQxK0y)

When editing the entry the field is automatically updated with the locale (e.g. (en), (pt))

![Result with locale](https://monosnap.com/image/WEvrf37myUCmZcpfAWjDPauHrPNTGQ)

#### Example 2 `[field:parent:title] › [field:title]`

Assuming you have have a simple content model composed by title and parent (reference to same model type) and you create a new entry with title `Apple` and parent pointing to `Brands`, your new title will be `Brands › Apple`.

![Configuration](https://monosnap.com/image/SC97DiwE2aD3GjXAye4A50YoaTOTZs)

When editing the entry the field is automatically updated depending on what we put in title or parent fields.

![Entry edit](https://monosnap.com/image/QBgmfBmcrGY0q7vlSjbBFOqWndtQeE)

When visualizing the entries will be easier to understand each entry using the combined field title.

![Alt text](https://monosnap.com/image/NKw1w4r5ZpvF7l5ZDhnO5M8dhtQiNA)

## Optional Usage for Development

After cloning, install the dependencies

```bash
yarn install
```

To bundle the extension

```bash
yarn build
```

To host the extension for development on `http://localhost:1234`

```bash
yarn start
```

To install the extension:

```bash
contentful extension update --force
```

## Limitations

Works only with text fields and one level depth references.

## Copyright and license

Copyright 2020 pauloamgomes under the MIT license.
