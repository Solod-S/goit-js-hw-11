import "../css/styles.css";
import "simplelightbox/dist/simple-lightbox.min.css";
import { Notify } from "notiflix/build/notiflix-notify-aio";
import simpleLightbox from "simplelightbox";
import galleryTpl from "../templates/images.hbs";
let lightbox;

// уведомление
const BASE_URL = "https://pixabay.com/api/";
// адресс для запроса

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
    totalHits: null,
  },
  // объект с настройками
  onloadMore() {
    this.options.page += 1;
    // для пагинации добавляем +1 страничку
    this.createMarkUp(this.fetchImg());
    // запускаем разметку
  },
  onSubmit(event) {
    event.preventDefault();
    this.clearCurrentGallery();
    // чистим разметку
    this.options.page = 1;
    // для пагинации сбрасываем на первую страничку
    this.options.totalHits = null;
    // для нотификации о найденых страницах
    this.options.query = this.inputEl.value.toLowerCase().trim();
    // то что вбито в inputEl  приводим к нижнему регистру + тримаем
    if (this.inputEl.value === "") {
      Notify.failure(
        "Sorry, there are no images matching your search query. Please try again"
      );

      this.loadMoreBtnEl.classList.add("visually-hidden");
      return;
    }

    this.createMarkUp(this.fetchImg());
    // запускаем функцию динамической генерации разметки в которую передаем функцию фетча с аргументами из инпута (inputEl)
    this.loadMoreBtnEl.classList.remove("visually-hidden");
    //  делаем копку "загрузить еще" активной активной
  },
  fetchImg() {
    return fetch(
      `${BASE_URL}?key=${this.options.key}&q=${this.options.query}&image_type=${this.options.image_type}&orientation=${this.options.orientation}&safesearch=${this.options.safesearch}&page=${this.options.page}&per_page=${this.options.per_page}`
    )
      .then((response) => {
        if (!response.ok) {
          Notify.failure(
            "Sorry, there are no images matching your search query. Please try again"
          );
          this.loadMoreBtnEl.classList.add("visually-hidden");
          return;
        }
        // если не ок выводим ошибку и обрываем все
        return response.json();
      })
      .then((data) => {
        if (data.totalHits > PixaBayApi.options.per_page) {
          PixaBayApi.loadMoreBtnEl.classList.remove("visually-hidden");
        }
        // если объектов в промисе меньше чем на нужно показать на 1 страничке то мы прячем кнопку
        if (data.hits.length === 0) {
          Notify.failure(
            "Sorry, there are no images matching your search query. Please try again."
          );
          this.loadMoreBtnEl.classList.add("visually-hidden");
          return;
          // если не ок выводим ошибку и обрываем все
        } else {
          if (!this.options.totalHits) {
            Notify.success(`Hooray! We found ${data.totalHits} images.`);
          }
          this.options.totalHits = data.totalHits;
          // чтобы в сл раз не выводило строку сколько найдено картинок (если будет новый запрос то значение обнулиться и все снова покажет)
          return data.hits;
        }
        // если ок, возвращаем данные
      })
      .catch((error) => console.log(error));
  },
  // GET запрос на сервер
  createMarkUp(promise) {
    console.log(`!!!!!!`);
    promise.then((array) => {
      const generatedHtml = this.galleryEl.insertAdjacentHTML(
        "beforeend",
        galleryTpl(array)
      );
      //генерируем разметку (с помощью шаблонизатора) и записываем в переменную
      // делаем это для того, чтобы после успеть обьявить lightbox
      lightbox = new SimpleLightbox(".gallery a", {
        captionDelay: 200,
        showCounter: false,
        maxZoom: 3,
        scrollZoomFactor: 0.1,
      });
      // обьявляем lightbox
      const totalPages = Math.floor(
        this.options.totalHits / this.options.per_page
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
      return generatedHtml;
      // возвращаем главный результат функции
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
