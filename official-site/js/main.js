$(document).ready(function () {
    //initialize swiper when document ready
    var shopSwiper = new Swiper('.shop-swiper-container', {
        pagination: {
            el: '.swiper-pagination',
          },
    });
    var productSwiper = new Swiper('.product-swiper', {
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
    });
    $('.link-area').on('click', 'span', function (params) {
        var $this = $(this);
        if ($this.hasClass('active')) {
            return;
        }
        $this.siblings().removeClass('active');
        $this.addClass('active');
        var targetId = $this.data('target');
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#" + targetId).offset().top
        }, 1000);
    })
});