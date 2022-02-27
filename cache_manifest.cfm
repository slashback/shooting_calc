<!---
	Define the Cache Manifest content. I'm doing it this way since
	the "CACHE MANIFEST" line needs to be the first line in the file
	and storing it in a buffer allows us to TRIM later without having
	ugly line breaks.
--->
<cfsavecontent variable="cacheManifest">

<!---
	NOTE: Cache Manifest must be the very first thing in this
	manifest file.
--->
CACHE MANIFEST

<!---
	When a cache manifest is reviewed by the browser, it uses a
	complete byte-wise comparison. As such, we can use COMMENTS
	to defunk a previously used cache manifest. In this way, we
	can use a version-comment to indicate change even when the
	file list has not changed.
	NOTE: If ANY part of this file is different from the previous
	cache manifest, ALL of the files are re-downloaded.
--->
# Cache Manifest Version: 1.8

<!---
	Let's list the file that get cached. The URLs to these files
	are relative to the cache manifest file (or absolute).
--->
# Core files.
./app.js
./index.html

<cfcontent
	type="text/cache-manifest"
	variable="#toBinary( toBase64( trim( cacheManifest ) ) )#"
	/>
