---
layout: posts
title: Setting up GitHub redirects 
root: ../../../
---

This site is actually hosted on GitHub. It uses the fantastic [GitHub Pages](http://pages.github.com/) service, which uses the [Jekyll](https://github.com/mojombo/jekyll/) static site generator. It essentially serves up whatever content you have in your git repository. 

While this works fine, the default url that is used by GitHub to display the site is http://Username.github.com/. Luckily you can set up your own custom domains in GitHub. This involves nothing more than adding a CNAME file to your repo and adding whatever redirects you want. In mine I have only one site:

www.donalfarrell.com

Setting up my DNS settings was a little tricker. The GitHub documentation is a little vague on this so I had to do a little fiddling to get mine working:

![DNS Settings](../../../images/GitHub-DNS.png)

Any changes you make to your DNS settings take a few hours to update. 

A nice side effect is that any other GitHub projects that you set up to use Pages will automatically show the correct url in the address bar e.g. my project [CaleX](http://www.donalfarrell.com/calex/)

