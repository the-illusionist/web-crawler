# web-crawler
This Node.js project is intended to crawl through all hyperlinks within a given domain.

### Prerequisites:
* NodeJs (6.0+)
* Npm (3.6+)

### Steps to run:
1. cd "source_directory"
2. npm install
3. node app.js (for code without async library) 
4. node app-async.js (for code with async library)

### Summary:
Crawling through the links is done by firing requests for a particular url. All the links (both relative links & absolute links on same domain) are collected from the response & saved in an array. Now these collected links serve as request links & this goes on until all the unique links are exhausted. We are having two arrays here: one for saving visited links & other for saving links which are yet to be visited. 

### Features:
A throttle feature which limits the number of concurrent requests.
Two versions of script - one using async library & other without async library.

### Things to Note:
**findAll** function in domutils library has an issue which leads to overflow of stack. To resolve this, replace findAll function in **node_modules -> domutils -> lib -> querying.js** with:

    function findAll(test, rootElems){
        var result = [];
        var stack = [rootElems];
        while(stack.length){
            var elems = stack.pop();
            for(var i = 0, j = elems.length; i < j; i++){
                var elem = elems[i];
                if(isTag(elem)) {
                    if(test(elem)) result.push(elem);
                    stack.push(elem.children);
                }
            }
        }
        return result;
    }
