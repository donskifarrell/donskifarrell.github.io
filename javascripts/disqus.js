var disqus_shortname = 'donalfarrellblog';
var disqus_identifier;
var disqus_url;

var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js'; // Found in disqus.js script
$('head').append(dsq);

function loadDisqus(element, postTitle, postUrlTag) {
  var identifier = postTitle;
  var url = window.location.origin + '/#!' + postUrlTag;

  var disqus_identifier = identifier;
  var disqus_url = url;

  if (window.DISQUS) {
    // Horrible, but jQuery wasn't removing the div elements
    $( ".comments-load" ).each(function(){
      var len = this.childNodes.length;

      for(var i = 0; i < len; i++)
      {  
        if (this.childNodes[i].tagName == "DIV"){
          this.removeChild(this.childNodes[i]);
        } 
      }

    });

    $(element).append('<div class="disqus-thread" id="disqus_thread"></div>');

    /** if Disqus exists, call it's reset method with new parameters **/
    DISQUS.reset({
      reload: true,
      config: function () { 
        this.page.identifier = identifier.toString();    //important to convert it to string
        this.page.url = url;
      }
    });
  }
};