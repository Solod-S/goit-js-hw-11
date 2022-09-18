import "./css/styles.css";
import "simplelightbox/dist/simple-lightbox.min.css";
import { Notify } from "notiflix/build/notiflix-notify-aio";
import simpleLightbox from "simplelightbox";
import galleryTpl from "./template/images.hbs";

import axios from "axios";
let lightbox;
const PixaBayApi = {
  formEl: document.querySelector(".search-form"),
  inputEl: document.querySelector(".search-form-input"),
  galleryEl: document.querySelector(".gallery"),
  loadMoreBtnEl: document.querySelector(".load-more"),
  options: {
    key: "29776170-5db4a15cb76834f05dd09f0ed",
    query: "",
    image_type: "photo",
    orientation: "horizontal",
    safesearch: "true",
    page: 1,
    per_page: 40,
  },
  async axiosApi(key, query, page, perPage) {
    axios.defaults.baseURL = "https://pixabay.com/api/";
    const response = await axios.get(
      `?key=${key}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
    );
    return response;
  },
  //axios который делает запрос
  onSubmit(event) {
    event.preventDefault();
    this.clearCurrentGallery();
    // чистим разметку
    this.options.page = 1;
    // для пагинации сбрасываем на первую страничку
    this.options.query = event.currentTarget.searchQuery.value.trim();
    // то что вбито в inputEl  приводим к нижнему регистру + тримаем

    if (!this.options.query) {
      Notify.failure(
        "Sorry, there are no images matching your search query. Please try again"
      );
      this.loadMoreBtnEl.classList.add("visually-hidden");
      return;
    }
    // если поле пустое выдаем ошибку

    this.fetchAndMarkUp();
    // GET запрос на сервер + разметка
  },
  async fetchAndMarkUp() {
    const fetch = this.axiosApi(
      this.options.key,
      this.options.query,
      this.options.page,
      this.options.per_page
    );
    const markUp = await fetch
      .then((obj) => {
        // console.log(obj.data.totalHits / this.options.per_page);
        if (obj.data.hits.length === 0) {
          Notify.failure(
            "Sorry, there are no images matching your search query. Please try again."
          );
          this.loadMoreBtnEl.classList.add("visually-hidden");
          return;
          // если не ок выводим ошибку и обрываем все
        } else {
          //obj.data.hits === дотсупнных в бесплатном достпе найденых картинок

          Notify.success(`Hooray! We found ${obj.data.totalHits} images.`);
          this.createMarkUp(obj.data.hits);
        }
        // если ок, делаем разметку и выводим сколькно нашло картинок
        if (obj.data.totalHits > this.options.per_page) {
          this.loadMoreBtnEl.classList.remove("visually-hidden");
        }
        // если объектов в промисе больше чем нам нужно показать на 1 страничке то мы не прячем кнопку
      })
      .catch((error) => console.log(error));
  },
  async onloadMore() {
    this.options.page += 1;
    // для пагинации добавляем +1 страничку
    const fetch = this.axiosApi(
      this.options.key,
      this.options.query,
      this.options.page,
      this.options.per_page
    );
    const markUp = await fetch
      .then((obj) => {
        console.log(Math.floor(obj.data.totalHits / this.options.per_page));
        console.log(this.options.page);
        this.createMarkUp(obj.data.hits);
        const totalPages = Math.floor(
          obj.data.totalHits / this.options.per_page
        );
        // высчитываем примерное число стрниц с округлению по низу 12.3 => 12
        if (this.options.page > totalPages) {
          this.loadMoreBtnEl.classList.add("visually-hidden");
          Notify.failure(
            "We're sorry, but you've reached the end of search results."
          );
        }
        // сравниваем сл запрашиваемую страницу (которую делали для пагинации) с примерным числом страниц
        // если мы сл запрашиваемая страница больше чем примерное число страниц,  прячем кнопку
      })
      .catch((error) => console.log(error));
  },
  createMarkUp(images) {
    this.galleryEl.insertAdjacentHTML("beforeend", galleryTpl(images));
    //генерируем разметку (с помощью шаблонизатора) и записываем в переменную
    // делаем это для того, чтобы после успеть обьявить lightbox
    lightbox = new SimpleLightbox(".gallery a", {
      captionDelay: 200,
      showCounter: false,
      maxZoom: 3,
      scrollZoomFactor: 0.1,
    });
  },
  clearCurrentGallery() {
    this.galleryEl.innerHTML = "";
  },
  // функция очистки разметки
};

PixaBayApi.formEl.addEventListener(
  "submit",
  PixaBayApi.onSubmit.bind(PixaBayApi)
);
PixaBayApi.loadMoreBtnEl.addEventListener(
  "click",
  PixaBayApi.onloadMore.bind(PixaBayApi)
);

//
//
//ниже настройки нотификатора

Notify.init({
  width: "280px",
  position: "left-bottom", // 'right-top' - 'right-bottom' - 'left-top' - 'left-bottom' - 'center-top' - 'center-bottom' - 'center-center'
  distance: "10px",
  opacity: 1,
  borderRadius: "0",
  rtl: false,
  timeout: 3000,
  messageMaxLength: 110,
  backOverlay: false,
  backOverlayColor: "rgba(0,0,0,0.5)",
  plainText: true,
  showOnlyTheLastOne: false,
  clickToClose: false,
  pauseOnHover: true,

  ID: "NotiflixNotify",
  className: "notiflix-notify",
  zindex: 4001,
  fontFamily: "Quicksand",
  fontSize: "17px",
  cssAnimation: true,
  cssAnimationDuration: 400,
  cssAnimationStyle: "fade" - "zoom", // 'fade' - 'zoom' - 'from-right' - 'from-top' - 'from-bottom' - 'from-left'
  closeButton: false,
  useIcon: false,
  useFontAwesome: true,
  fontAwesomeIconStyle: "basic" - "shadow", // 'basic' - 'shadow'
  fontAwesomeIconSize: "34px",

  success: {
    background: "#101113",
    textColor: "#d6d6d6",
    childClassName: "notiflix-notify-success",
    notiflixIconColor: "rgba(0,0,0,0.2)",
    fontAwesomeClassName: "fas fa-check-circle",
    fontAwesomeIconColor: "rgba(0,0,0,0.2)",
    backOverlayColor: "rgba(50,198,130,0.2)",
  },

  failure: {
    background: "#101113",
    textColor: "#d6d6d6",
    childClassName: "notiflix-notify-failure",
    notiflixIconColor: "rgba(0,0,0,0.2)",
    fontAwesomeClassName: "fas fa-times-circle",
    fontAwesomeIconColor: "rgba(0,0,0,0.2)",
    backOverlayColor: "rgba(255,85,73,0.2)",
  },

  warning: {
    background: "#F5F4FA",
    textColor: "#fff",
    childClassName: "notiflix-notify-warning",
    notiflixIconColor: "rgba(0,0,0,0.2)",
    fontAwesomeClassName: "fas fa-exclamation-circle",
    fontAwesomeIconColor: "rgba(0,0,0,0.2)",
    backOverlayColor: "rgba(238,191,49,0.2)",
  },

  info: {
    background: "#2196F3",
    textColor: "#FFFFFF",
    childClassName: "notiflix-notify-info",
    notiflixIconColor: "rgba(255,255,255)",
    fontAwesomeClassName: "fas fa-info-circle",
    fontAwesomeIconColor: "rgba(0,0,0,0.2)",
    backOverlayColor: "rgba(38,192,211,0.2)",
  },
});
