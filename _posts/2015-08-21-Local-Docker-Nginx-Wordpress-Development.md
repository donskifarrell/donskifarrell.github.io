---
layout: posts
comments: true
comments-url-tag: local-docker-nginx-wordpress-dev
title: Local Development with Docker, Nginx to serving multiple Wordpress sites
root: ../../../
---

Quick post here.. my last [post](/2015/08/11/Docker-Nginx-Multi-Wordpress.html) focused on hosting multiple Wordpress sites on a remote DigitalOcean instance, which is grand and all but most developers want to run things locally first to test things out.

Here's a quick guide to getting things ready locally before running the steps in the previous [post](/2015/08/11/Docker-Nginx-Multi-Wordpress.html)

1. Install [DockerToolbox](https://www.docker.com/toolbox) from Docker.io.
    * This also installs Kitematic, which is a handy GUI for managing Docker containers.

2. Start Docker/Kitematic and run the following command to get the IP Address of the underlying virtual machine:
    * 'default' is the name of the VM Docker Machines creates on setup.

          docker-machine ip default

3. Update your hosts file to point to the expected SSL domains:
    * On OSX, run the following command in the terminal:

          sudo nano /etc/hosts

    * Insert a line for each SSL certificate you want to use (The I.P. Addr is whatever the boot2docker vm IP Addr is) e.g:

          192.168.99.100 capslocknotificationapp.com
          192.168.99.100 <SSL-Cert-Name>
          ...

    * Sometimes you need to refresh the DNS Cache:

          dscacheutil -flushcache; sudo killall -HUP mDNSResponder

4. Get your SSL Certificates and create a folder to place them in.
    * Ideally, create a sub-folder in the local Kitematic directory (you can change the where a Docker container's volume points to in Kitematic)
    * On OSX, Kitematic defaults to `/Users/<username>/Documents/Kitematic`

          mkdir /Users/<username>/Documents/Kitematic/nginx-proxy/root/certs

5. Run the steps in the previous [post](/2015/08/11/Docker-Nginx-Multi-Wordpress.html).

This should get you up and running with the ability to test HTTPS connections. 

__Note:__ Don't forget to remove the host file redirects before testing the real site!
