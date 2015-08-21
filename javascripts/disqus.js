var disqus_shortname = 'donalfarrellblog';
var disqus_identifier;
var disqus_url;

function loadDisqus(element, postTitle, postUrlTag) {
  var identifier = postTitle;
  var url = window.location.origin + '/#!' + postUrlTag;

  if (window.DISQUS) {
    $(".disqus_thread").remove();
    $(element).append('<div id="disqus_thread"></div>');
    /** if Disqus exists, call it's reset method with new parameters **/

    DISQUS.reset({
      reload: true,
      config: function () { 
        this.page.identifier = identifier.toString();    //important to convert it to string
        this.page.url = url;
      }
    });
  }
  else {
    //insert a wrapper in HTML after the relevant "show comments" link
    jQuery('<div id="disqus_thread"></div>').insertAfter(element);
    disqus_identifier = identifier; //set the identifier argument
    disqus_url = url; //set the permalink argument

    //append the Disqus embed script to HTML
    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
    dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
    jQuery('head').append(dsq);
  }
};