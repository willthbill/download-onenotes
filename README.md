# OneNote downloader

### Description
Downloads all notebooks for a specific microsoft account. It will fail if the access token runs out.

### Instructions

1. Create a .env file with the following content:

``` 
ACCESS_TOKEN=**your access token**
```

Get the access token at: https://developer.microsoft.com/en-us/graph/graph-explorer

Remember to allow access to OneDrive features.

2. Install dependencies:

npm install

3. run the script

npm run start
