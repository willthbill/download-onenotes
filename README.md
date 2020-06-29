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

4. In case of any problems. Firstly, try to generate a new access token. Secondly, wait a few minutes (10 minutes). If it still does not work and you followed the above steps - then it is probably a bug by me.

5. Once everything is downloaded - open the index.html file inside the downloads folder in your browser.