import "./css/styles.css";
import debounce from "lodash.debounce";
// задержка
import { Notify } from "notiflix/build/notiflix-notify-aio";
// уведомление
import countriesTpl from "./template/countries.hbs";
//шаблонизатор для кучи стран
import countryTpl from "./template/country.hbs";
//шаблонизатор для одной странны

const DEBOUNCE_DELAY = 300;

const CountriesApiServices = {
  searchBox: document.querySelector("#search-box"),
  list: document.querySelector(".country-list"),
  info: document.querySelector(".country-info"),
  countryMarkUp(countries) {
    return (this.info.innerHTML = countryTpl(countries));
  },
  // делаем разметку для одной странны
  countriesMarkUp(countries) {
    return (this.list.innerHTML = countriesTpl(countries));
  },
  // делаем разметку для кучи стран
  clearInfo() {
    this.info.innerHTML = "";
  },
  //чистим табло главной странны для поиска
  clearList() {
    this.list.innerHTML = "";
  },
  //чистим табло всех найденных стран
  onSearchBoxChange(event) {
    const countrySearch = event.target.value.toLowerCase().trim();
    // то что вбито в searchBox  приводим к нижнему регистру + тримаем
    if (countrySearch === "") {
      this.clearList();
      this.clearInfo();
      return;
    }
    // eсли пользователь полностью очищает поле поиска, то HTTP-запрос не выполняется, а разметка списка стран или информации о стране пропадает.
    this.innerMarkUp(this.fetchCountries(countrySearch));
    // запускаем функцию динамической генерации разметки в которую передаем функцию фетча с аргументами из инпута (searchBox)
  },
  // функция собирает то, что вбиваем в поле ввода
  fetchCountries(name) {
    const BASE_URL = "https://restcountries.com/v2";
    // адресс для запроса
    const FILTERS = "name,capital,population,flags,languages";
    // поисковые фильтры
    return fetch(`${BASE_URL}/name/${name}?fields=${FILTERS}`).then(
      (response) => {
        if (!response.ok) {
          Notify.failure("Oops, there is no country with that name");
        }
        // если не ок выводим ошибку
        return response.json();
        // если ок парсим данные в json
      }
    );
  },
  innerMarkUp(promise) {
    promise.then((countries) => {
      this.clearInfo();
      //чистим табло главной странны для поиска
      this.clearList();
      //чистим табло всех найденных стран
      if (countries.length > 10) {
        Notify.info(
          "Too many matches found. Please enter a more specific name."
        );
        return;
      }
      // если нам возвращаеться массив вмещающий в себя более 10 объектов (стран), обрываем дальнейшие действия и выводим уведомление
      if (countries.length === 1) {
        this.clearList();
        //чистим табло всех найденных стран
        this.info.innerHTML = this.countryMarkUp(countries[0]);
        //генерируем разметку в табло главной странны
        return;
      }
      // если нам возвращаеться массив вмещающий в себя 1 объект(страну), чистим табло всех найденных стран
      //+ генерируем информацию о стране в табло главной странны для поиска
      // обрываем дальнейшее выполнение
      this.list.innerHTML = this.countriesMarkUp(countries);
      //генерируем разметку в табло всех стран
      //
    });
  },
};
CountriesApiServices.searchBox.addEventListener(
  "input",
  debounce(CountriesApiServices.onSearchBoxChange, DEBOUNCE_DELAY).bind(
    CountriesApiServices
  )
);

// слушатель событий на инпут + функция из библиотеки лодаш которая поможеть при болтливости (задержка в DEBOUNCE_DELAY)
