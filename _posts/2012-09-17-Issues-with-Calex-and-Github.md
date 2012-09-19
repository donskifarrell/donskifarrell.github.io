---
layout: default
title: Issues with Calex and GitHub
root: ../../../
---

## Issues with Calex and GitHub

So my side project [Calex](http://www.donalfarrell.com/calex/) is pretty much finished, except for one critical issue - adding a new blog post is not possible while using a custom domain.

To give a quick summary, the idea behind [Calex](http://www.donalfarrell.com/calex/) was to easily add and view what activities/tasks were done on any particular day. 
Using GitHub Pages to host, the main page is one big calendar and has a nice tick for each day that I accomplished a task. Adding a new task for a day was a matter of committing a new post with details of what I had done.

Committing a new blog post is easy if I am on my development machine and have SSH GitHub access but I wanted it to be able to commit from anywhere (e.g from my mobile). Hence, I created a page to commit new posts that formats them nicely with markdown syntax.

I use a javascript library, [GitHub-WebCommit](https://github.com/donskifarrell/github-webcommit.js), to commit to the [Calex GitHub repository](https://github.com/donskifarrell/calex) by following the GitHub API. This is where the problem lies. In normal circumstances, the javascript library works exactly as planned and will easily commit a new post from a project page but only if the domain is still showing 'xxxx.github.com' or from 'localhost'. 

Github Pages gives you the ability to use custom domains, which is what I am doing with this site, but as I have set my main User Page all other GitHub project pages in my repository will use this custom domain. For that reason the javascript commit requests will use 'donalfarrell.com/calex' as their origin which is a big no-no as it violates the same domain policy. 

I've tried many things to get around this, but the simple fact is that I need to either set the domain name to be 'xxxx.github.com/calex' (something I am unwilling to do as I will lose this blog domain), or to register the app with GitHub and implement the OAuth protocol.