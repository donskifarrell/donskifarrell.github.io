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

