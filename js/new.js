 $(document).ready(function() {

     $(".menu-icon").on("click", function() {
         $("nav ul").toggleClass("showing");
     });

     $('.carousel').carousel({
         interval: 1000
     })

 });

 // Scrolling Effect
 $(window).on("scroll", function() {
     if ($(window).scrollTop()) {
         $('nav').addClass('black');
     } else {
         $('nav').removeClass('black');
     }
 })