---
layout: posts
title: VirtualBox and Windows 8
root: ../../../
---

Ok, so my previous post put a lot of blame on Windows 8, but I've come to realise it may be due to the environment (although, Windows 8: The Experience is still not great). 

I run linux so I decided to use my VirtualBox instance to boot up Windows 8. I got to coding and quickly had a working app that was recieving keypresses and showing a notification. But I hit a problem. For an unknown reason, when I pressed the CapsLock key, I was getting two notifications in quick succession as if I had pressed it twice. In debug mode it never appeared. Even stranger, if I added a second delay in my event handler there was only one notification!

Unusual, but it had a workaround. The real showstopper was that although I could detect a CapsLock keypress, there was no way of determining if CapsLock was enabled or not. Every state reading put it as false. Numerous libraries were tried and numerous hooks made into low level COM objects but nothing worked. As a final attempt I decided to run my code on an actual Windows 8 desktop - success! A quick installation of Windows 8 on VMWare Player found it was working also.

So there seems to be a defect in how VirtualBox handles keyboard input in Windows 8 guest, or maybe it was a dodgy install? 
Regardless, there's a [VirtualBox bug ticket](https://www.virtualbox.org/ticket/12404) for it now. 


