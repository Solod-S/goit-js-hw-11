let lastScroll = 0;
const defaultOffset = 200;
const header = document.querySelector(".search-search");

const scrollPosition = () =>
  window.pageYOffset || document.documentElement.scrollTop;
const containHide = () => header.classList.contains("is-shrinked");

window.addEventListener("scroll", () => {
  if (
    scrollPosition() > lastScroll &&
    !containHide() &&
    scrollPosition() > defaultOffset
  ) {
    //scroll down
    header.classList.add("is-shrinked");
  } else if (scrollPosition() < lastScroll && containHide()) {
    //scroll up
    header.classList.remove("is-shrinked");
  }

  lastScroll = scrollPosition();
});
