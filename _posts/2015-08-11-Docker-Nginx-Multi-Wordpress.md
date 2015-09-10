---
layout: posts
comments: true
comments-url-tag: docker-nginx-wordpress
title: Using Docker and Nginx to serve multiple Wordpress sites
root: ../../../
---

I've just moved back to London and have a bit of spare time to work on a few of my side projects so I decided to have a bash at re-working my websites, notably [CapsLock Notification app](https://capslocknotificationapp.com/). 

I use [DigitalOcean](https://www.digitalocean.com/?refcode=aa14dbdbf224) (Note: Referral link!) to host my sites and I didn't really want to spin up new instances for each of my sites as for a lot of the time they would be sitting idle, wasting resources and adding unecessary cost.

Currently, my sites are run on Wordpress so my requirements are:

* Ability to share the same MySql instance (as these are memory hogs individually)
* Have a mechanism to route requests to the appropriate site
 * Routing should allow for SSL Certificates 

The lastest releases of Wordpress allow you to host multiple sites but my brief look at this found it clunky and as a bit of a tech enthusiast I've been looking to get my hands dirty with Docker and this fits the bill.

So, here's how to set up a single DigitalOcean instance to host multiple sites including routing and HTTPS.

## Prerequisities

1. Get a DigitalOcean instance
 * I recommend a 1GB Ram, 20GB SSD instance as the MySQL database eats a lot of memory!
2. Install Docker (I've been using v1.7.1)
 * DigitalOcean provides pre-made Docker images for easy set up.

## Generate certificates for each of your sites

Once we have access to the DO server instance we need to generate certificates so we can get SSL certificates for HTTPS.

Hopefully this will become much more streamlined once [Let's Encrypt](https://letsencrypt.org/) has launched

### 1. Create private key and CSR on the server:

    openssl req -new -newkea rsa:2048 -nodes \
      -keyout capslocknotificationapp.com.key \
      -out capslocknotificationapp.com.csr

  **Note:** resultant file should be `<domain-class>.<domain-name>.<extension>.crt` e.g `blog.donalfarrell.com.crt`

### 2. Generate SSL certificate with Certificate Authority

  Copy the __.key__ and __.csr__ files from the server to a local machine and register the SSL cert as necessary. 

  If you used Comodo as you CA, wait for verification email with certificate chain. Condense the chain into one __.crt__ file:

    cat capslocknotificationapp_com.crt \
      COMODORSADomainValidationSecureServerCA.crt \
      COMODORSAAddTrustCA.crt \
      AddTrustExternalCARoot.crt \
       > capslocknotificationapp.com.crt

  **Note:** resultant file should be `<domain-class>.<domain-name>.<extension>.crt` e.g `blog.donalfarrell.com.crt`

### 3. Copy final _.crt_ certificate back to server:

    scp capslocknotificationapp.com.crt <user>@<server-name>:/root/certs/


## Set up Nginx Reverse Proxy

Now we have the certificates in place we want to set up a server to route any requests. This should be able to look at the incoming request and be able to point it at the correct site and attach any matching certificates.

Apache is quite clunky in my opinion and the new hotness is Nginx, so I went with that. There is a fantastic docker image that allows you to create a Nginx reverse proxy complete with dynamic configuration generation and matching of SSL certificates. Details of it can be found here: [http://jasonwilder.com/blog/2014/03/25/automated-nginx-reverse-proxy-for-docker/](http://jasonwilder.com/blog/2014/03/25/automated-nginx-reverse-proxy-for-docker/)

### Configure nginx reverse proxy:
    docker run -d \
      --name nginx-reverse-proxy \
      -p 80:80 -p 443:443 \
      -v /root/certs:/etc/nginx/certs \
      -v /var/run/docker.sock:/tmp/docker.sock:ro \
      --restart=always \
      jwilder/nginx-proxy 

**Note:**

You can easily add customised config directories for each hosted site by adding a volume pointing to the configs:

    -v /root/nginx-configs:/etc/nginx/vhost.d:ro

Again, the naming convention is important and should be the name of your domain (no .config either!)


## Set up MySQL instance

As I run Wordpress sites, I need to use MySQL as my backend store. With Docker, I have a choice of running a Wordpress image that has MySQL already included, or pointing a Wordpress image to a dedicated MySQL instance. 

    docker run -d \
      --name mysql-db \
      -e MYSQL_ROOT_PASSWORD=<YOUR-PASSWORD> \
      -v /root/mysql/data:/var/lib/mysql \
      --restart=always \
      mysql:latest

### Note: Memory buffer issues

You may find that your MySQL instance aborts occasionally as you add more databases and run more docker containers. This is usually due to insufficient memory in your server instance. A useful tip is to add/increase the swap space on your server:

[https://www.digitalocean.com/community/tutorials/how-to-add-swap-on-ubuntu-14-04](https://www.digitalocean.com/community/tutorials/how-to-add-swap-on-ubuntu-14-04)

### Note: PHPMyAdmin

A useful tool to look at the contents of the MySQL instance is [PHPMyAdmin](https://www.phpmyadmin.net/). This tool creates an admin portal that is accessible through a webpage.

    docker run -d \
      --name phpmyadmin \
      -p 1000:80 \
      -e MYSQL_USERNAME=<USERNAME> \
      -e MYSQL_PASSWORD=<YOUR-PASSWORD> \
      --link mysql-db:mysql \
      corbinu/docker-phpmyadmin


## Set up web containers

Finally, we are ready to create our Wordpress sites (alhthough, the method will work for any other site I'd imagine).
Below I set up 2 separate Wordpress containers and point each to the MySQL instance with each creating it's own database.

### 1. Your first Wordpress Container

    docker run -d \
      --name wp-site1 \
      -e WORDPRESS_DB_NAME=wpsite1db \
      -e VIRTUAL_HOST=<SSL-CERT-NAME> \
      --link mysql-db:mysql \
      --restart=always \
      wordpress

### 2. A second Wordpress Container

    docker run -d \
      --name wp-site2 \
      -e WORDPRESS_DB_NAME=wpsite2db \
      -e VIRTUAL_HOST=<SSL-CERT-NAME> \
      --link mysql-db:mysql \
      --restart=always \
      wordpress

The `<SSL-CERT-NAME>` is the name of the SSL cert you copied to the `/root/certs/` folder, e.g capslocknotificationapp.com. You do not need to include the _.crt_ extension!

Typing the URL into the browser (as long as you have pointed the DNS records to the IP address of the DigitalOcean server) you should now see the Wordpress installation page.

