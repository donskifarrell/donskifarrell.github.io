# Personal Blog

This is the set of files that run my personal blog found at http://www.donalfarrell.com

The site uses [Jekyll](https://github.com/mojombo/jekyll) as it's engine.

# Dependencies

Icons: http://simpleicons.org/
Theme: http://git-scm.com/
Grid: http://purecss.io/

Fonts:
	- Merriweather
	- Ostrich Sans

# Running with Docker

* Get Kitematic / DockerToolbox
* Run docker CLI from kitematic menu
* Navigate to directory where Jekyll site is found (e.g dev/personal/blog)
* Run command:

	docker stop jekyll && docker rm jekyll && docker run -d -v "$PWD:/src" --name jekyll -p 4000:4000 grahamc/jekyll serve -H 0.0.0.0

* In a browser, type the ip:port as shown in the Kitematic UI for the running jekyll container

