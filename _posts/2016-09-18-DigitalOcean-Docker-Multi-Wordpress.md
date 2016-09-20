---
layout: posts
comments: true
comments-url-tag: digitalocean-docker--nginx-wordpress
title: Updated - Using Docker and Nginx to serve multiple Wordpress sites
root: ../../../
---

Two things happened recently: My SSL certificate for [capslocknotificationapp.com](https://capslocknotificationapp.com) expired and I needed to launch a new Wordpress site.

I went to my old server and revisited my old Docker setup (detailed in a previous post [here](/2015/08/11/Docker-Nginx-Multi-Wordpress.html)) and it was in a bit of a state.
It was using a very old version of Docker and it was a pain to get a new certificate etc.

Anyway, I decided to rework the whole shebang:

* updated Docker (v1.12 - latest at the time) so I can use Docker Compose (v1.8.0), allowing the setup to be a bit more flexible in the long run.
* integrated [Let's Encrypt](https://letsencrypt.org/) so I don't have to deal with Comodo via the [HTTPS_PORTAL](https://github.com/SteveLTN/https-portal) container.
* switched from MySql backend to the maintained, compatible and open source [MariaDB](https://mariadb.org/).

Here are the steps:

## Prerequisities

1. Get a DigitalOcean instance
 * This time I got a beefier 2GB Ram, 40GB SSD instance as I intend to be running more (non-critical) sites from it.
2. A suitable OS that supports Docker
 * I selected Ubuntu 16.04, although I think CoreOS is a good option too.
3. Create a SSH key on your local box - [guide here](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/)
 * unless you set up the SSH during the DO instance creation, which wasn't working for me.


### DigitalOcean box setup

We want to secure the DO instance and make sure it is up to date.

http://osxdaily.com/2011/04/05/setup-ssh-config-fie/
SSH into the box using the password/IP address sent in the DO email and change the password.
Add your newly created SSH key to the DO instance:

    cat ~/.ssh/<your-key>.pub | ssh root@[your.ip.address.here] "cat >> ~/.ssh/authorized_keys"

SSH into the box and update the SSH config file (ssh**d**_config) to stop SSH connections using the password

    sudo nano /etc/ssh/sshd_config

Change or add the following line to the 'Authentication' section:

    PermitRootLogin without-password

Restart the SSH server for the changes to take effect

    ps auxw | grep ssh
    kill -HUP <PID of SSH process>

### Setup swap space for MariaDB use later on

The database eats up a lot of memory and I found it killed some of my docker container. A way to solve that is to give the box more swap space.
I set it to 4G due to the amount of space/memory I had on my box. Yours may differ.

    sudo swapon -s
    free -m
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    ls -lh /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    sudo swapon -s
    free -m

Next we need to update the filesytem partition confi file

    sudo nano /etc/fstab

Then add to the bottom (if /swapfile is not already there)

    /swapfile   none    swap    sw    0   0

### Install the latest Docker files

These steps install the latest Docker Engine and Docker Compose. Steps taken from their website [here](https://docs.docker.com/engine/installation/linux/ubuntulinux/) and [here](https://docs.docker.com/compose/install/).
Check them out for additional configurations!

    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install apt-transport-https ca-certificates
    sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
    sudo rm /etc/apt/sources.list.d/docker.list
    sudo touch /etc/apt/sources.list.d/docker.list
    sudo echo 'deb https://apt.dockerproject.org/repo ubuntu-xenial main' >> /etc/apt/sources.list.d/docker.list
    sudo apt-get update
    sudo apt-get purge lxc-docker
    sudo apt-cache policy docker-engine
    sudo apt-get update

    # Requires manual input:
    sudo apt-get install linux-image-extra-$(uname -r)

    sudo apt-get update

    # Requires manual input:
    sudo apt-get install docker-engine

    # Start and test docker install
    sudo service docker start
    sudo docker run hello-world

    # Start docker automatically on box restart
    sudo systemctl enable docker

    # Install Docker Compose
    curl -L https://github.com/docker/compose/releases/download/1.8.0/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

### Setup DO instance for HTTPS_PORTAL and Wordpress containers

There needs to be some data saved and shared on the DO box, so we need to create folders for them

    # Folder to store Nginx config files for each site
    mkdir -p ~/sites/conf.d/

    # Folder to store LetsEncrypt generated SSL certs
    mkdir -p ~/sites/ssl_certs/

    # Folder to store MariaDB data
    mkdir -p ~/sites/mysql/data/

    # Folder(s) to store Wordpress sites
    mkdir -p ~/sites/www/wp-<sitename>/

    cd ~/sites

### Create Docker Compose files for HTTPS_PORTAL and Wordpress containers

I have two Docker Compose files to create and run my containers. One is for HTTPS_PORTAL and the other is for MariaDB and Wordpress sites.
Unfortunately, the compose files need to use V1 syntax, due to underlying containers using that old syntax.

HTTPS_PORTAL listens for and will generate LetsEncrypt SSL certs on any containers created that have a `VIRTUAL_HOST` environment variable set.

Create a file `~/sites/https_portal.yml`

    https-portal:
      container_name: https-portal
      image: steveltn/https-portal
      ports:
        - '80:80'
        - '443:443'
      restart: always
      environment:
        STAGE: 'production'
      volumes:
        - /root/sites/conf.d:/etc/nginx/conf.d/:rw
        - /root/sites/ssl_certs:/var/lib/https-portal:rw
        - /var/run/docker.sock:/var/run/docker.sock:ro

This sets up:
 * the ports to listen and expose
 * makes sure the container is always restarted
 * hooks into the nginx configs and SSL certs

Next, create a file `~/sites/sites.yml`

    mysql:
      container_name: mysql
      image: mariadb
      restart: always
      environment:
        MYSQL_ROOT_PASSWORD: 'ASECUREPASSWORD'
      volumes:
        - /root/sites/mysql/data:/var/lib/mysql:rw

    wp-SITE1:
      container_name: wp-SITE1
      image: wordpress
      restart: always
      links:
        - mysql:mysql
      environment:
        WORDPRESS_DB_NAME: wpSITE1db
        WORDPRESS_DB_PASSWORD: 'ASECUREPASSWORD'
        VIRTUAL_HOST: SITE1.com, www.SITE1.com
      volumes:
        - /root/sites/www/wp-SITE1/:/var/www/html:rw

    wp-SITE2:
      container_name: wp-SITE2
      image: wordpress
      restart: always
      links:
        - mysql:mysql
      environment:
        WORDPRESS_DB_NAME: wpSITE2db
        WORDPRESS_DB_PASSWORD: 'ASECUREPASSWORD'
        VIRTUAL_HOST: SITE2.com, www.SITE2.com
      volumes:
        - /root/sites/www/wp-SITE2/:/var/www/html:rw

This sets up:
 * the MariaDB instance, with password
 * wordpress sites, each with it's own database instance
 * VIRTUAL_HOST environment variable for each site with acceptable url's
 * makes sure the containers are always restarted


Finally, to run the sites we just run docker-compose and it will create the containers as daemons and also ensure they are not destroyed/recreated if the command is re-run.

    # Launch HTTPS_PORTAL
    docker-compose -f https_portal.yml up -d --no-recreate

    # Launch sites
    docker-compose -f sites.yml up -d --no-recreate

#### PHPMyAdmin

If you want to run PHPMyAdmin against the database

    docker run --name phpmyadmin -d --link mysql:db -p 8080:80 phpmyadmin/phpmyadmin

Just remember to stop the container when you are done!

