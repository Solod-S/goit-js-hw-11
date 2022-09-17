import "./css/styles.css";
import "simplelightbox/dist/simple-lightbox.min.css";
import { Notify } from "notiflix/build/notiflix-notify-aio";
import simpleLightbox from "simplelightbox";
let lightbox;

// уведомление
const BASE_URL = "https://pixabay.com/api/";
// адресс для запроса
import galleryTpl from "./template/images.hbs";
console.log(galleryTpl);
const PixaBayApi = {
  formEl: document.querySelector(".search-form"),
  inputEl: document.querySelector(".search-form-input"),
  galleryEl: document.querySelector(".gallery"),
  loadMoreBtnEl: document.querySelector(".load-more"),
  options: {
    key: "29776170-5db4a15cb76834f05dd09f0ed",
    q: "",
    image_type: "photo",
    orientation: "horizontal",
    safesearch: "true",
    page: 1,
    per_page: 40,
  },
  // объект с настройками
  onloadMore() {
    PixaBayApi.options.page += 1;
    // для пагинации добавляем +1 страничку
    PixaBayApi.innerMarkUp(PixaBayApi.fetchImg());
    // запускаем разметку
  },
  onSubmit(event) {
    PixaBayApi.clearCurrentGallery();
    // чистим разметку
    PixaBayApi.options.page = 1;
    // для пагинации сбрасываем на первую страничку
    const loadMoreBtnIsNotActive =
      PixaBayApi.loadMoreBtnEl.classList.contains("visually-hidden");
    // кнопка не активна
    if (loadMoreBtnIsNotActive) {
      setTimeout(() => {
        PixaBayApi.loadMoreBtnEl.classList.remove("visually-hidden");
      }, 1000);
    }
    //  делаем копку "загрузить еще" активной активной

    event.preventDefault();
    if (PixaBayApi.inputEl.value === "") {
      Notify.failure(
        "Sorry, there are no images matching your search query. Please try again"
      );
      return;
    }
    // если поле пустое дальше функция не пойдет

    PixaBayApi.options.q = PixaBayApi.inputEl.value.toLowerCase().trim();
    // то что вбито в inputEl  приводим к нижнему регистру + тримаем
    PixaBayApi.inputEl.value = "";
    // чистим поле ввода
    PixaBayApi.innerMarkUp(PixaBayApi.fetchImg());

    // запускаем функцию динамической генерации разметки в которую передаем функцию фетча с аргументами из инпута (inputEl)
  },
  fetchImg() {
    return fetch(
      `${BASE_URL}?key=${PixaBayApi.options.key}&q=${PixaBayApi.options.q}&image_type=${PixaBayApi.options.image_type}&orientation=${PixaBayApi.options.orientation}&safesearch=${PixaBayApi.options.safesearch}&page=${PixaBayApi.options.page}&per_page=${PixaBayApi.options.per_page}`
    )
      .then((response) => {
        if (!response.ok) {
          Notify.failure(
            "Sorry, there are no images matching your search query. Please try again"
          );
          return;
        }
        // если не ок выводим ошибку и обрываем все
        return response.json();
      })
      .then((data) => {
        if (data.hits.length === 0) {
          Notify.failure(
            "Sorry, there are no images matching your search query. Please try again."
          );
          return;
          // если не ок выводим ошибку и обрываем все
        }
        console.log(data);
        return data;
        // если ок парсим данные в json
      });
  },
  innerMarkUp(promise) {
    promise.then((array) => {
      console.log(array.hits);

      const generatedHtml = PixaBayApi.galleryEl.insertAdjacentHTML(
        "beforeend",
        galleryTpl(array.hits)
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
      return generatedHtml;
      // возвращаем Главный результат функции
    });
  },
  clearCurrentGallery() {
    PixaBayApi.galleryEl.innerHTML = "";
  },
  // функция очистки разметки
};
// GET запрос на сервер

PixaBayApi.formEl.addEventListener("submit", PixaBayApi.onSubmit);
PixaBayApi.loadMoreBtnEl.addEventListener("click", PixaBayApi.onloadMore);
//
//
//ниже настройки нотификатора

Notify.init({
  width: "280px",
  position: "right-bottom", // 'right-top' - 'right-bottom' - 'left-top' - 'left-bottom' - 'center-top' - 'center-bottom' - 'center-center'
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
    background: "#32c682",
    textColor: "#fff",
    childClassName: "notiflix-notify-success",
    notiflixIconColor: "rgba(0,0,0,0.2)",
    fontAwesomeClassName: "fas fa-check-circle",
    fontAwesomeIconColor: "rgba(0,0,0,0.2)",
    backOverlayColor: "rgba(50,198,130,0.2)",
  },

  failure: {
    background: "#444444",
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
