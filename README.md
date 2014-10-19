# Ember-google-api-client - Work In Progress

# Installation

**note: this has not been published yet**
```
npm install --save-dev ember-google-api-client
```

# Usage

## Initialization

```javascript
var egc = Ember.EGC.create({
  apiKey: 'GOOGLE_API_KEY',
  cliendId: 'GOOGLE_CLIENT_ID',
  scope: 'https://www.googleapis.com/auth/drive.appdata' // or whatever scopes you need
});

egc.then(function() {
  // Google's gapi client is loaded, ready and
  // immediate authorization has occured
}, function() {
  // Google's gapi client is load and ready, but
  // immediate authorization failed
}) ;
```

## Drive Files

### Find Files

* Find all files

```javascript
egc.find()
   .then(function(files) { /* ... */ });
```

* Find a file by id

```javascript
egc.find('1234abc')
   .then(function(file) { /* ... */ });
```

* Find using a Google API query

```javascript
egc.find({ q: "title contains 'awesone sauce'"})
   .then(function(files) { /* ... */ });
```

### Create a File

```javascript
var file = {
  title: 'foo.txt',
  mimeType: 'text/plain',
  parents: [{ id: 'appdata' }],
  content: 'Lorem ipsum...'
};

egc.insert(file)
   .then(function(_file) { file.id = _file.id });
```

### Update a File

```javascript
file.title = 'FOO.txt';
file.content = 'LOREM IPSUM...';
egc.update(file)
   .then(function(file) { /* ... */ });
```

### Destroy a File
```javascript
egc.destroy(file.id);
 ```

# Collaboration
This section outlines the details of collaborating on this Ember addon.

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
