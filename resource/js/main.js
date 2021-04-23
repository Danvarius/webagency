var nav = document.querySelector('.page-header__nav');
var navButton = document.querySelector('.page-header__menu');
var navLine = document.querySelector('.page-header__line');


navButton.classList.remove('page-header__menu-no-js');
nav.classList.remove('no-js');


navButton.addEventListener('click', function () {
   if (navLine.classList.contains('page-header__line--closed')) {
      navLine.classList.remove('page-header__line--closed');
      nav.classList.add('js-nav');
      navLine.classList.add('page-header__line--opened');
   } else {
      navLine.classList.remove('page-header__line--opened');
      nav.classList.remove('js-nav');
      navLine.classList.add('page-header__line--closed');
   }
});




