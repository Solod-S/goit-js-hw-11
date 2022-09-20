import "../css/styles.css";
import "simplelightbox/dist/simple-lightbox.min.css";
import { Notify } from "notiflix/build/notiflix-notify-aio";
import lightboxOptions from "./lightbox_options";
import simpleLightbox from "simplelightbox";
import galleryTpl from "../templates/images.hbs";
import revevers from "lodash.reverse";
import sortBy from "lodash.sortby";
import axios from "axios";
let lightbox = new SimpleLightbox(".gallery a", {
  captionDelay: 200,
  showCounter: false,
  maxZoom: 3,
  scrollZoomFactor: 0.1,
});
const PixaBayApi = {
  searchResult: [],
  filters: document.querySelector(".filters"),
  likesBtn: document.querySelector('[name = "likes"]'),
  downloadsBtn: document.querySelector('[name = "downloads"]'),
  viewsdsBtn: document.querySelector('[name = "views"]'),
  commentsBtn: document.querySelector('[name = "comments"]'),
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
    //
    axios.defaults.baseURL = "https://pixabay.com/api/";
    const response = await axios.get(
      `?key=${key}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
      //
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
        "Sorry, there are no images matching your search query. Please try again."
      );

      this.loadMoreBtnEl.classList.add("visually-hidden");
      this.filters.classList.add("visually-hidden");
      this.resetfilters();

      return;
    }
    // если поле пустое выдаем ошибку
    this.filters.classList.remove("visually-hidden");
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
          this.filters.classList.add("visually-hidden");
          this.resetfilters();
          return;
          // если не ок выводим ошибку и обрываем все
        } else {
          //obj.data.hits === дотсупнных в бесплатном достпе найденых картинок
          PixaBayApi.searchResult = obj.data.hits;
          Notify.success(`Hooray! We found ${obj.data.totalHits} images.`);
          this.createMarkUp(PixaBayApi.searchResult);
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
        this.searchResult.push(...obj.data.hits);

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

    lightbox.refresh();
  },
  clearCurrentGallery() {
    this.galleryEl.innerHTML = "";
  },
  // функция очистки разметки
  onSortByMinLikes() {
    if (this.searchResult === []) {
      return;
    } else {
      this.searchResult = sortBy(this.searchResult, (card) => card.likes);
      this.clearCurrentGallery();
      this.createMarkUp(this.searchResult);
      window.scrollTo(0, 0);
    }
  },
  onSortByMaxLikes() {
    if (this.searchResult === []) {
      return;
    } else {
      this.searchResult = sortBy(
        this.searchResult,
        (card) => card.likes
      ).reverse();
      this.clearCurrentGallery();
      this.createMarkUp(this.searchResult);
      window.scrollTo(0, 0);
    }
  },
  onSortByMinDownloads() {
    if (this.searchResult === []) {
      return;
    } else {
      this.searchResult = sortBy(this.searchResult, (card) => card.downloads);
      this.clearCurrentGallery();
      this.createMarkUp(this.searchResult);
      window.scrollTo(0, 0);
    }
  },
  onSortByMaxDownloads() {
    if (this.searchResult === []) {
      return;
    } else {
      this.searchResult = sortBy(
        this.searchResult,
        (card) => card.downloads
      ).reverse();
      this.clearCurrentGallery();
      this.createMarkUp(this.searchResult);
      window.scrollTo(0, 0);
    }
  },
  onSortByMinViews() {
    if (this.searchResult === []) {
      return;
    } else {
      this.searchResult = sortBy(this.searchResult, (card) => card.views);
      this.clearCurrentGallery();
      this.createMarkUp(this.searchResult);
      window.scrollTo(0, 0);
    }
  },
  onSortByMaxViews() {
    if (this.searchResult === []) {
      return;
    } else {
      this.searchResult = sortBy(
        this.searchResult,
        (card) => card.views
      ).reverse();
      this.clearCurrentGallery();
      this.createMarkUp(this.searchResult);
      window.scrollTo(0, 0);
    }
  },
  onSortByMinComments() {
    if (this.searchResult === []) {
      return;
    } else {
      this.searchResult = sortBy(this.searchResult, (card) => card.comments);
      this.clearCurrentGallery();
      this.createMarkUp(this.searchResult);
      window.scrollTo(0, 0);
    }
  },
  onSortByMaxComments() {
    if (this.searchResult === []) {
      return;
    } else {
      this.searchResult = sortBy(
        this.searchResult,
        (card) => card.comments
      ).reverse();
      this.clearCurrentGallery();
      this.createMarkUp(this.searchResult);
      window.scrollTo(0, 0);
    }
  },
  onLikefilters(event) {
    const isActive = document.querySelector(".active");
    if (!event.target.classList.contains("active") && isActive) {
      isActive.classList.remove("active");
      isActive.dataset.status = "off";
      isActive.nextElementSibling.classList.remove("max");
    }
    event.target.classList.add("active");
    const statusOff = event.target.dataset.status === "off";
    const statusMin = event.target.dataset.status === "min";
    const statusMax = event.target.dataset.status === "max";
    if (statusOff) {
      event.target.dataset.status = "min";
      event.target.nextElementSibling.classList.add("max");

      this.onSortByMinLikes();
    }
    if (statusMin) {
      event.target.dataset.status = "max";
      event.target.nextElementSibling.classList.remove("max");
      this.onSortByMaxLikes();
    }
    if (statusMax) {
      event.target.dataset.status = "min";
      event.target.nextElementSibling.classList.add("max");
      this.onSortByMinLikes();
    }
  },
  onDownloadsfilters(event) {
    const isActive = document.querySelector(".active");
    if (!event.target.classList.contains("active") && isActive) {
      isActive.classList.remove("active");
      isActive.dataset.status = "off";
      isActive.nextElementSibling.classList.remove("max");
    }
    event.target.classList.add("active");
    const statusOff = event.target.dataset.status === "off";
    const statusMin = event.target.dataset.status === "min";
    const statusMax = event.target.dataset.status === "max";
    if (statusOff) {
      event.target.dataset.status = "min";
      event.target.nextElementSibling.classList.add("max");

      this.onSortByMinDownloads();
    }
    if (statusMin) {
      event.target.dataset.status = "max";
      event.target.nextElementSibling.classList.remove("max");

      this.onSortByMaxDownloads();
    }
    if (statusMax) {
      event.target.dataset.status = "min";
      event.target.nextElementSibling.classList.add("max");
      this.onSortByMinDownloads();
    }
  },
  onViewsfilters(event) {
    const isActive = document.querySelector(".active");
    if (!event.target.classList.contains("active") && isActive) {
      isActive.classList.remove("active");
      isActive.dataset.status = "off";
      isActive.nextElementSibling.classList.remove("max");
    }
    event.target.classList.add("active");
    const statusOff = event.target.dataset.status === "off";
    const statusMin = event.target.dataset.status === "min";
    const statusMax = event.target.dataset.status === "max";
    if (statusOff) {
      event.target.dataset.status = "min";
      event.target.nextElementSibling.classList.add("max");

      this.onSortByMinDownloads();
    }
    if (statusMin) {
      event.target.dataset.status = "max";
      event.target.nextElementSibling.classList.remove("max");

      this.onSortByMaxDownloads();
    }
    if (statusMax) {
      event.target.dataset.status = "min";
      event.target.nextElementSibling.classList.add("max");
      this.onSortByMinDownloads();
    }
  },
  onCommentsfilters(event) {
    const isActive = document.querySelector(".active");
    if (!event.target.classList.contains("active") && isActive) {
      this.resetfilters();
    }
    event.target.classList.add("active");
    const statusOff = event.target.dataset.status === "off";
    const statusMin = event.target.dataset.status === "min";
    const statusMax = event.target.dataset.status === "max";
    if (statusOff) {
      event.target.dataset.status = "min";
      event.target.nextElementSibling.classList.add("max");

      this.onSortByMinDownloads();
    }
    if (statusMin) {
      event.target.dataset.status = "max";
      event.target.nextElementSibling.classList.remove("max");

      this.onSortByMaxDownloads();
    }
    if (statusMax) {
      event.target.dataset.status = "min";
      event.target.nextElementSibling.classList.add("max");
      this.onSortByMinDownloads();
    }
  },
  resetfilters() {
    const isActive = document.querySelector(".active");
    isActive.classList.remove("active");
    isActive.dataset.status = "off";
    isActive.nextElementSibling.classList.remove("max");
  },
};

PixaBayApi.formEl.addEventListener(
  "submit",
  PixaBayApi.onSubmit.bind(PixaBayApi)
);
PixaBayApi.loadMoreBtnEl.addEventListener(
  "click",
  PixaBayApi.onloadMore.bind(PixaBayApi)
);

PixaBayApi.likesBtn.addEventListener(
  "click",
  PixaBayApi.onLikefilters.bind(PixaBayApi)
);
PixaBayApi.downloadsBtn.addEventListener(
  "click",
  PixaBayApi.onDownloadsfilters.bind(PixaBayApi)
);
PixaBayApi.viewsdsBtn.addEventListener(
  "click",
  PixaBayApi.onViewsfilters.bind(PixaBayApi)
);
PixaBayApi.commentsBtn.addEventListener(
  "click",
  PixaBayApi.onCommentsfilters.bind(PixaBayApi)
);
// //
