# Work In Progress

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

1. Find all files

```javascript
egc.find()
   .then(function(files) { /* ... */ });
```

2. Find a file by id

```javascript
egc.find('1234abc')
   .then(function(file) { /* ... */ });
```

3. Find using a Google API query

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
