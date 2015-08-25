---
layout: posts
comments: true
comments-url-tag: multiple-disqus-githubpages
title: Allowing multiple Disqus comment threads on a single page
root: ../../../
---

I show multiple posts on the main page of this blog, and as it is essentially a site static (run off [GitHub Pages](https://pages.github.com/)), I don't have the ability to run my own commenting system.

Luckily, there is a service called [Disqus](https://disqus.com/) that provides an easy way to enable comments on each post. The issue is that you can only have once comment thread on a single page due to the way Disqus embeds its comment form and use of global variables.

Fortunately, we can get around this with a bit of hackery and allow for multiple threads per page. Although, technically, only 1 thread is shown at any one time and there is a nasty looking browser exception thrown occasionally.

First, we need to add the ability to show comments:


    <a class="comments-load" onclick="loadDisqus($(this), 'The Title Of The Thread', 'a-unique-url-tag');">
      Show comments
    </a>
    <noscript>
      Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a>
    </noscript>


When a user clicks on the 'Show Comments' link, the loadDisqus function is called.
I put the following in a separate Disqus.js file that is loaded with the page:

```
    // Global variables needed by Disqus. The identifier and url should be different for each comment thread.
    var disqus_shortname = 'donalfarrellblog';
    var disqus_identifier;
    var disqus_url;

    // Loads the Disqus JS file that will create the comment form and threads.
    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
    dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js'; // Found in disqus.js script
    $('head').append(dsq);

    // Called in each location you want to show the thread.

    // Disqus searches for 'disqus-thread' elements and uses the first one it finds so to
    // overcome this, the function will clear any previous comment threads (by finding 'comments-load' elements)
    // 
    function loadDisqus(element, postTitle, postUrlTag) {
      var identifier = postTitle;

      // Including the hashbang ('/#!') is important.
      var url = window.location.origin + '/#!' + postUrlTag;

      var disqus_identifier = identifier;
      var disqus_url = url;

      if (window.DISQUS) {
        // Horrible, but jQuery wasn't removing the div elements fully
        $( ".comments-load" ).each(function() {
          var len = this.childNodes.length;
          for(var i = 0; i < len; i++)
          {  
            if (this.childNodes[i].tagName == "DIV") {
              this.removeChild(this.childNodes[i]);
            } 
          }
        });

        $(element).append('<div class="disqus-thread" id="disqus_thread"></div>');

        /** if Disqus exists, call it's reset method with new parameters **/
        DISQUS.reset({
          reload: true,
          config: function () { 
            //important to convert it to string
            this.page.identifier = identifier.toString();    
            this.page.url = url;
          }
        });
      }
    };
```

