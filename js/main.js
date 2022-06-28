(function ($) {
    "use strict";


    /*script for menu*/
    jQuery(document).ready(function () {
        $('#toggle').click(function () {

            if ($(this).hasClass('active')) {
                //  alert('if');
                $("#toggle2").removeClass('hide');
                $(this).toggleClass('active');
                $('#overlay').toggleClass('open');
            }
            else {
                //  alert('else');

                $("#toggle2").addClass('hide');
                $(this).toggleClass('active');
                $('#overlay').toggleClass('open');
            }

        });

    });

    jQuery(document).ready(function () {
        $('.btn--menu').click(function () {


            //  alert('if');
            if ($(this).hasClass("show")) {
                $(".btn--menu").removeClass('show');
                $(".btn--menu").addClass('hide');
                $(".btn--close").addClass('show');
                $(".btn--close").removeClass('hide');
            }

            else {
            }

            $(this).toggleClass('active');
            $('#overlay').toggleClass('open');

        });

    });

    //for tooltip
    $(document).ready(function () {
        $(".create_by").find(".info_icon").mouseover(function () {
            $(".info").css("opacity", "1");
        });

        $(".create_by").mouseleave(function () {
            $(".info").css("opacity", "0");
        });
    });

    /*          jQuery(document).ready(function(){
               $('.btn--close').click(function() {



               if($(this).hasClass("show")){
                 $(".btn--close").addClass('hide');
                 $(".btn--close").removeClass('show');
                 $(".btn--menu").addClass('show');
                  $(".btn--menu").removeClass('hide');
               }

              else{

              }

               });

          });
          */


    /*  jQuery(document).scroll(function($) {
        jQuery('.abt_content').viewportChecker({
          classToAdd: 'visible  ',
          offset:10
       });

          jQuery('.wind').viewportChecker({
          classToAdd: 'visible  animated fadeInLefta',
          offset:10
       });
     });*/


    ////roll over abot text slider
//        jQuery(document).ready(function(){

    //      var current = 1; //keeps track of the current div
    //    var height = $('.roles').height(); //the height of the roles div
    //  var numberDivs = 6 //the number of children of the roles div
    //   var first = $('.roles div:nth-child(1)'); //the first div nested in roles div

//        setInterval(function() {

//        var number = current * -height;

//        var thistext = $('.roles div:nth-child('+current+')').text();
//        $('.roles').append('<div>'+thistext+'</div>');


//        first.css('margin-top', number + 'px');   

    //     current++;

    ///   }, 1100);

    //    });


    // for ser_bx0 only start
    window.crtpos = $('#ser_bx0').css("background-position");
    jQuery(window).scroll(function () {


        var ser_bx_id = "ser_bx0";
        var output = " ";


        var fromtop = $(window).scrollTop();
        var output = output + "<br>fromtop_px :" + fromtop;


        var window_height = $(window).height();
        var window_width = $(window).width();
        var output = output + "<br>window_height :" + window_height;
        var output = output + "<br>window_width :" + window_width;


        var sec1ctpos = jQuery("#" + ser_bx_id).offset(); // "left: " + offset.left + ", top: " + offset.top
        var sec1ctposleft = sec1ctpos.left;
        var sec1ctpostop = sec1ctpos.top;
        var sec1ctpos_height = $("#" + ser_bx_id).height();
        var output = output + "<br>sec1ctposleft :" + sec1ctposleft;
        var output = output + "<br>sec1ctpostop :" + sec1ctpostop;
        var output = output + "<br>sec1ctpos_height :" + sec1ctpos_height;


        var sec1ctpos_x = parseInt(window.crtpos);
        var output = output + "<br>old sec1ctpos_x :" + sec1ctpos_x;


        // cal start

        //var diff = sec1ctpostop - fromtop;  // (diff * -1)

        var diff = sec1ctpostop - fromtop - (sec1ctpos_height / 4);  // (diff * -1)
//                      var diff = sec1ctpostop - fromtop;  // (diff * -1)

        var output = output + "<br>diff :" + diff;
        if (0 > diff) {
            //var new_sec1ctpos_x = sec1ctpos_x - ((diff * -1) *3);


            var new_sec1ctpos_x = sec1ctpos_x - ((diff * -1) * 3);


            var output = output + "<br>new_sec1ctpos_x :" + new_sec1ctpos_x;
            //var output = output+"<br>move :yes:";
            $('#' + ser_bx_id).css("background-position-x", new_sec1ctpos_x + "px")

        }
        else {
            var output = output + "<br>move : no";
            $('#' + ser_bx_id).css("background-position-x", sec1ctpos_x + "px")
        }


        var output = output + "<br>ttttt :" + sec1ctpos_height / 4;

        jQuery('#logdiv').html(output);


    });
    // for ser_bx0 only end


    // for ser_bx1 only start
    window.crtpos = $('#ser_bx1').css("background-position");
    jQuery(window).scroll(function () {


        var ser_bx_id = "ser_bx1";
        var output = " ";


        var fromtop = $(window).scrollTop();
        var output = output + "<br>fromtop_px :" + fromtop;


        var window_height = $(window).height();
        var window_width = $(window).width();
        var output = output + "<br>window_height :" + window_height;
        var output = output + "<br>window_width :" + window_width;


        var sec1ctpos = jQuery("#" + ser_bx_id).offset(); // "left: " + offset.left + ", top: " + offset.top
        var sec1ctposleft = sec1ctpos.left;
        var sec1ctpostop = sec1ctpos.top;
        var sec1ctpos_height = $("#" + ser_bx_id).height();
        var output = output + "<br>sec1ctposleft :" + sec1ctposleft;
        var output = output + "<br>sec1ctpostop :" + sec1ctpostop;
        var output = output + "<br>sec1ctpos_height :" + sec1ctpos_height;


        var sec1ctpos_x = parseInt(window.crtpos);
        var output = output + "<br>old sec1ctpos_x :" + sec1ctpos_x;


        // cal start

        //var diff = sec1ctpostop - fromtop;  // (diff * -1)

        var diff = sec1ctpostop - fromtop - (sec1ctpos_height / 4);  // (diff * -1)
//                      var diff = sec1ctpostop - fromtop;  // (diff * -1)

        var output = output + "<br>diff :" + diff;
        if (0 > diff) {
            //var new_sec1ctpos_x = sec1ctpos_x - ((diff * -1) *3);


            var new_sec1ctpos_x = sec1ctpos_x - ((diff * -1) * 3);


            var output = output + "<br>new_sec1ctpos_x :" + new_sec1ctpos_x;
            //var output = output+"<br>move :yes:";
            $('#' + ser_bx_id).css("background-position-x", new_sec1ctpos_x + "px")

        }
        else {
            var output = output + "<br>move : no";
            $('#' + ser_bx_id).css("background-position-x", sec1ctpos_x + "px")
        }


        var output = output + "<br>ttttt :" + sec1ctpos_height / 4;

        jQuery('#logdiv').html(output);


    });
    // for ser_bx1 only end


    // for ser_bx2 only start
    window.crtpos = $('#ser_bx2').css("background-position");
    jQuery(window).scroll(function () {

        var ser_bx_id = "ser_bx2";
        var output = " ";


        var fromtop = $(window).scrollTop();
        var output = output + "<br>fromtop_px :" + fromtop;


        var window_height = $(window).height();
        var window_width = $(window).width();
        var output = output + "<br>window_height :" + window_height;
        var output = output + "<br>window_width :" + window_width;


        var sec1ctpos = jQuery("#" + ser_bx_id).offset(); // "left: " + offset.left + ", top: " + offset.top
        var sec1ctposleft = sec1ctpos.left;
        var sec1ctpostop = sec1ctpos.top;
        var sec1ctpos_height = $("#" + ser_bx_id).height();
        var output = output + "<br>sec1ctposleft :" + sec1ctposleft;
        var output = output + "<br>sec1ctpostop :" + sec1ctpostop;
        var output = output + "<br>sec1ctpos_height :" + sec1ctpos_height;


        var sec1ctpos_x = parseInt(window.crtpos);
        var output = output + "<br>old sec1ctpos_x :" + sec1ctpos_x;


        // cal start

        //var diff = sec1ctpostop - fromtop;  // (diff * -1)

        var diff = sec1ctpostop - fromtop - (sec1ctpos_height / 4);  // (diff * -1)
//                      var diff = sec1ctpostop - fromtop;  // (diff * -1)

        var output = output + "<br>diff :" + diff;
        if (0 > diff) {
            //var new_sec1ctpos_x = sec1ctpos_x - ((diff * -1) *3);


            var new_sec1ctpos_x = sec1ctpos_x - ((diff * -1) * 3);


            var output = output + "<br>new_sec1ctpos_x :" + new_sec1ctpos_x;
            //var output = output+"<br>move :yes:";
            $('#' + ser_bx_id).css("background-position-x", new_sec1ctpos_x + "px")

        }
        else {
            var output = output + "<br>move : no";
            $('#' + ser_bx_id).css("background-position-x", sec1ctpos_x + "px")
        }


        var output = output + "<br>ttttt :" + sec1ctpos_height / 4;


        jQuery('#logdiv').html(output);
    });
    // for ser_bx2 only end


    // for ser_bx3 only start
    window.crtpos = $('#ser_bx3').css("background-position");
    jQuery(window).scroll(function () {

        var ser_bx_id = "ser_bx3";
        var output = " ";


        var fromtop = $(window).scrollTop();
        var output = output + "<br>fromtop_px :" + fromtop;


        var window_height = $(window).height();
        var window_width = $(window).width();
        var output = output + "<br>window_height :" + window_height;
        var output = output + "<br>window_width :" + window_width;


        var sec1ctpos = jQuery("#" + ser_bx_id).offset(); // "left: " + offset.left + ", top: " + offset.top
        var sec1ctposleft = sec1ctpos.left;
        var sec1ctpostop = sec1ctpos.top;
        var sec1ctpos_height = $("#" + ser_bx_id).height();
        var output = output + "<br>sec1ctposleft :" + sec1ctposleft;
        var output = output + "<br>sec1ctpostop :" + sec1ctpostop;
        var output = output + "<br>sec1ctpos_height :" + sec1ctpos_height;


        var sec1ctpos_x = parseInt(window.crtpos);
        var output = output + "<br>old sec1ctpos_x :" + sec1ctpos_x;


        // cal start

        //var diff = sec1ctpostop - fromtop;  // (diff * -1)

        var diff = sec1ctpostop - fromtop - (sec1ctpos_height / 4);  // (diff * -1)
//                      var diff = sec1ctpostop - fromtop;  // (diff * -1)

        var output = output + "<br>diff :" + diff;
        if (0 > diff) {
            //var new_sec1ctpos_x = sec1ctpos_x - ((diff * -1) *3);


            var new_sec1ctpos_x = sec1ctpos_x - ((diff * -1) * 3);


            var output = output + "<br>new_sec1ctpos_x :" + new_sec1ctpos_x;
            //var output = output+"<br>move :yes:";
            $('#' + ser_bx_id).css("background-position-x", new_sec1ctpos_x + "px")

        }
        else {
            var output = output + "<br>move : no";
            $('#' + ser_bx_id).css("background-position-x", sec1ctpos_x + "px")
        }


        var output = output + "<br>ttttt :" + sec1ctpos_height / 4;


        jQuery('#logdiv').html(output);
    });
    // for ser_bx3 only end


    // for ser_bx4 only start
    window.crtpos = $('#ser_bx4').css("background-position");
    jQuery(window).scroll(function () {

        var ser_bx_id = "ser_bx4";
        var output = " ";


        var fromtop = $(window).scrollTop();
        var output = output + "<br>fromtop_px :" + fromtop;


        var window_height = $(window).height();
        var window_width = $(window).width();
        var output = output + "<br>window_height :" + window_height;
        var output = output + "<br>window_width :" + window_width;


        var sec1ctpos = jQuery("#" + ser_bx_id).offset(); // "left: " + offset.left + ", top: " + offset.top
        var sec1ctposleft = sec1ctpos.left;
        var sec1ctpostop = sec1ctpos.top;
        var sec1ctpos_height = $("#" + ser_bx_id).height();
        var output = output + "<br>sec1ctposleft :" + sec1ctposleft;
        var output = output + "<br>sec1ctpostop :" + sec1ctpostop;
        var output = output + "<br>sec1ctpos_height :" + sec1ctpos_height;


        var sec1ctpos_x = parseInt(window.crtpos);
        var output = output + "<br>old sec1ctpos_x :" + sec1ctpos_x;


        // cal start

        //var diff = sec1ctpostop - fromtop;  // (diff * -1)

        var diff = sec1ctpostop - fromtop - (sec1ctpos_height / 4);  // (diff * -1)
//                      var diff = sec1ctpostop - fromtop;  // (diff * -1)

        var output = output + "<br>diff :" + diff;
        if (0 > diff) {
            //var new_sec1ctpos_x = sec1ctpos_x - ((diff * -1) *3);


            var new_sec1ctpos_x = sec1ctpos_x - ((diff * -1) * 3);


            var output = output + "<br>new_sec1ctpos_x :" + new_sec1ctpos_x;
            //var output = output+"<br>move :yes:";
            $('#' + ser_bx_id).css("background-position-x", new_sec1ctpos_x + "px")

        }
        else {
            var output = output + "<br>move : no";
            $('#' + ser_bx_id).css("background-position-x", sec1ctpos_x + "px")
        }


        var output = output + "<br>ttttt :" + sec1ctpos_height / 4;


        jQuery('#logdiv').html(output);
    });
    // for ser_bx3 only end


    // for ser_bx5 only start
    window.crtpos = $('#ser_bx5').css("background-position");
    jQuery(window).scroll(function () {

        var ser_bx_id = "ser_bx5";
        var output = " ";


        var fromtop = $(window).scrollTop();
        var output = output + "<br>fromtop_px :" + fromtop;


        var window_height = $(window).height();
        var window_width = $(window).width();
        var output = output + "<br>window_height :" + window_height;
        var output = output + "<br>window_width :" + window_width;


        var sec1ctpos = jQuery("#" + ser_bx_id).offset(); // "left: " + offset.left + ", top: " + offset.top
        var sec1ctposleft = sec1ctpos.left;
        var sec1ctpostop = sec1ctpos.top;
        var sec1ctpos_height = $("#" + ser_bx_id).height();
        var output = output + "<br>sec1ctposleft :" + sec1ctposleft;
        var output = output + "<br>sec1ctpostop :" + sec1ctpostop;
        var output = output + "<br>sec1ctpos_height :" + sec1ctpos_height;


        var sec1ctpos_x = parseInt(window.crtpos);
        var output = output + "<br>old sec1ctpos_x :" + sec1ctpos_x;


        // cal start

        //var diff = sec1ctpostop - fromtop;  // (diff * -1)

        var diff = sec1ctpostop - fromtop - (sec1ctpos_height / 4);  // (diff * -1)
//                      var diff = sec1ctpostop - fromtop;  // (diff * -1)

        var output = output + "<br>diff :" + diff;
        if (0 > diff) {
            //var new_sec1ctpos_x = sec1ctpos_x - ((diff * -1) *3);


            var new_sec1ctpos_x = sec1ctpos_x - ((diff * -1) * 3);


            var output = output + "<br>new_sec1ctpos_x :" + new_sec1ctpos_x;
            //var output = output+"<br>move :yes:";
            $('#' + ser_bx_id).css("background-position-x", new_sec1ctpos_x + "px")

        }
        else {
            var output = output + "<br>move : no";
            $('#' + ser_bx_id).css("background-position-x", sec1ctpos_x + "px")
        }


        var output = output + "<br>ttttt :" + sec1ctpos_height / 4;


        jQuery('#logdiv').html(output);
    });
    // for ser_bx5 only end


    // for ser_bx6 only start
    window.crtpos = $('#ser_bx6').css("background-position");
    jQuery(window).scroll(function () {

        var ser_bx_id = "ser_bx6";
        var output = " ";


        var fromtop = $(window).scrollTop();
        var output = output + "<br>fromtop_px :" + fromtop;


        var window_height = $(window).height();
        var window_width = $(window).width();
        var output = output + "<br>window_height :" + window_height;
        var output = output + "<br>window_width :" + window_width;


        var sec1ctpos = jQuery("#" + ser_bx_id).offset(); // "left: " + offset.left + ", top: " + offset.top
        var sec1ctposleft = sec1ctpos.left;
        var sec1ctpostop = sec1ctpos.top;
        var sec1ctpos_height = $("#" + ser_bx_id).height();
        var output = output + "<br>sec1ctposleft :" + sec1ctposleft;
        var output = output + "<br>sec1ctpostop :" + sec1ctpostop;
        var output = output + "<br>sec1ctpos_height :" + sec1ctpos_height;


        var sec1ctpos_x = parseInt(window.crtpos);
        var output = output + "<br>old sec1ctpos_x :" + sec1ctpos_x;


        // cal start

        //var diff = sec1ctpostop - fromtop;  // (diff * -1)

        var diff = sec1ctpostop - fromtop - (sec1ctpos_height / 4);  // (diff * -1)
//                      var diff = sec1ctpostop - fromtop;  // (diff * -1)

        var output = output + "<br>diff :" + diff;
        if (0 > diff) {
            //var new_sec1ctpos_x = sec1ctpos_x - ((diff * -1) *3);


            var new_sec1ctpos_x = sec1ctpos_x - ((diff * -1) * 3);


            var output = output + "<br>new_sec1ctpos_x :" + new_sec1ctpos_x;
            //var output = output+"<br>move :yes:";
            $('#' + ser_bx_id).css("background-position-x", new_sec1ctpos_x + "px")

        }
        else {
            var output = output + "<br>move : no";
            $('#' + ser_bx_id).css("background-position-x", sec1ctpos_x + "px")
        }


        var output = output + "<br>ttttt :" + sec1ctpos_height / 4;


        jQuery('#logdiv').html(output);
    });
    // for ser_bx6 only end


    // for ser_bx7 only start
    window.crtpos = $('#ser_bx7').css("background-position");
    jQuery(window).scroll(function () {

        var ser_bx_id = "ser_bx7";
        var output = " ";


        var fromtop = $(window).scrollTop();
        var output = output + "<br>fromtop_px :" + fromtop;


        var window_height = $(window).height();
        var window_width = $(window).width();
        var output = output + "<br>window_height :" + window_height;
        var output = output + "<br>window_width :" + window_width;


        var sec1ctpos = jQuery("#" + ser_bx_id).offset(); // "left: " + offset.left + ", top: " + offset.top
        var sec1ctposleft = sec1ctpos.left;
        var sec1ctpostop = sec1ctpos.top;
        var sec1ctpos_height = $("#" + ser_bx_id).height();
        var output = output + "<br>sec1ctposleft :" + sec1ctposleft;
        var output = output + "<br>sec1ctpostop :" + sec1ctpostop;
        var output = output + "<br>sec1ctpos_height :" + sec1ctpos_height;


        var sec1ctpos_x = parseInt(window.crtpos);
        var output = output + "<br>old sec1ctpos_x :" + sec1ctpos_x;


        // cal start

        //var diff = sec1ctpostop - fromtop;  // (diff * -1)

        var diff = sec1ctpostop - fromtop - (sec1ctpos_height / 4);  // (diff * -1)
//                      var diff = sec1ctpostop - fromtop;  // (diff * -1)

        var output = output + "<br>diff :" + diff;
        if (0 > diff) {
            //var new_sec1ctpos_x = sec1ctpos_x - ((diff * -1) *3);


            var new_sec1ctpos_x = sec1ctpos_x - ((diff * -1) * 3);


            var output = output + "<br>new_sec1ctpos_x :" + new_sec1ctpos_x;
            //var output = output+"<br>move :yes:";
            $('#' + ser_bx_id).css("background-position-x", new_sec1ctpos_x + "px")

        }
        else {
            var output = output + "<br>move : no";
            $('#' + ser_bx_id).css("background-position-x", sec1ctpos_x + "px")
        }


        var output = output + "<br>ttttt :" + sec1ctpos_height / 4;


        jQuery('#logdiv').html(output);
    });
    // for ser_bx7 only end


    ///PRELOADER
    //$('body').show();
    // NProgress.start();
    // setTimeout(function() { NProgress.done(); $('.fade').removeClass('out'); }, 5000);
    //end appear animedted...............


})(jQuery);


