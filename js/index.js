let data = [],
  pages,
  dataCounts=0,
  currentPage = 1,
  pageRange = 10,
  currentCity = '',
  currentDistrict = '';

const url = 'https://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvTravelFood.aspx',
  elementCity = document.querySelector('#City'),
  elementDistrict = document.querySelector('#District'),
  elementFood = document.querySelector('#Food'),
  elementPages = document.querySelector('#Pages');

const init = async () => {
  await getData();
  renderData();
  setEvent();
}

const getData = async () => {
  try {
    const res = await fetch(url);
    data = await res.json();
    dataCounts = data.length;
  }
  catch (err) {
    console.log(err);
  }
}

const renderData = () => {
  pages = Math.ceil(data.length/10);
  elementFood.innerHTML = setFood();
  elementCity.innerHTML = makeDropdownHtml('City');
  makePaginationHtml();
  document.querySelector('#Loading').classList.add('js-hidden');
}

const makePaginationHtml = () => {
  len = Math.ceil(dataCounts / pageRange);
  let str = '';
  for(let i = 0; i < len; i++) {
    str += currentPage===i+1 
      ? `<button class="btn js-active" data-num=${i+1} type="button">${i+1}</button>`
      : `<button class="btn" data-num=${i+1} type="button">${i+1}</button>`;
  }
  elementPages.innerHTML = str;
  setPages();

}

const filterFood = (arr = []) => {
  if (currentCity && currentDistrict) {
    data.map(item => {
      if (item.Town === currentDistrict) {
        arr.push(item);
      }
    })
  }
  else if (currentCity) {
    data.map(item => {
      if (item.City === currentCity) {
        arr.push(item);
      }
    })
  }
  else {
    arr = data;
  }
  dataCounts = arr.length;
  return arr;
}

const setFood = (arr = []) => {
  arr = filterFood();
  console.log(arr);
  console.log(dataCounts);
  const index = currentPage-1;
  arr = index*10 + pageRange >= arr.length 
    ? filterPageFood(index*10, arr.length, arr)
    : filterPageFood(index*10, index*10 + pageRange, arr);
  return makeFoodHtml(arr);
}

const filterPageFood = (first, last, arr, result=[]) => {
  for(let i = first; i < last; i++) {
    result.push(arr[i]);
  }
  return result;
}

const makeFoodHtml = (arr) => {
  let str = '';
  arr.map((item) => {
    str += `
      <li class="food__item">
        <div class="food__gutter">
          ${item?.Url && `<a href="${item.Url}" target="_blank">`}
            <div class="food__desc">
              <div class="food__location">
                <span class="food__tag">${item.City}</span>
                <span class="food__district">${item.Town}</span>
              </div>
              <h2 class="food__restaurant">${item.Name}</h2>
              <p class="food__details">${item.FoodFeature.substring(0, 43)}...</p>
            </div>
            <div class="food__imgContainer">
              <div class="food__img" 
                style="background-image: linear-gradient(to top,rgba( 0, 0, 0, .5), rgba( 0, 0, 0, .1)), url(${item.PicURL})">
                ${item.Name}
              </div>
            </div>
          ${item.Url && `</a>`}
        <div>
      </li>`;
  });
  return str;
}

const getDropdowns = (keyword, arr) => {
  keyword === 'City'
    ? data.forEach(item => {
      if (!arr.includes(item.City)) {
        arr.push(item.City);
      }
    })
    : data.forEach(item => {
      if (currentCity === item.City) {
        if (!arr.includes(item.Town)) {
          arr.push(item.Town);
        }
      }
    })
  return arr;
}

const makeDropdownHtml = (keyword, arr = []) => {
  arr = getDropdowns(keyword, arr);
  let dropdownStr = keyword === 'City'
    ? elementCity.innerHTML
    : '<option class="filter__dropdownItem" value="" id="default-option" selected disabled>請選擇鄉鎮區...</option>';
  arr.map(item => {
    dropdownStr += `<option class="filter__dropdownItem" value="${item}">${item}</option>`;
  })
  return dropdownStr;
}

const setEvent = () => {
  elementCity.addEventListener('change', setDropdowns);
  elementDistrict.addEventListener('change', setDropdowns);
  // setPages();
}

const setDropdowns = (e) => {
  if (e.target.id === 'City') {
    currentCity = elementCity.value;
    currentDistrict = '';
    // makePaginationHtml();
    currentPage = 1;
    elementFood.innerHTML = setFood();
    makePaginationHtml();
    elementDistrict.innerHTML = makeDropdownHtml('Town');
    // makePaginationHtml();
  }
  else {
    currentDistrict = elementDistrict.value;
    // currentPage = 1;
    makePaginationHtml();
    elementFood.innerHTML = setFood();
    // makePaginationHtml();

  }
}
const setPages = () => {
  elementBtns = elementPages.querySelectorAll('.btn');
  console.log(elementBtns)
  for(let i = 0; i < elementBtns.length; i++) {
    elementBtns[i].addEventListener('click', () => {
      if(i+1 === currentPage) {
        return;
      }
      elementBtns[currentPage-1].classList.remove('js-active');
      currentPage = i+1;
      elementBtns[currentPage-1].classList.add('js-active');
      elementFood.innerHTML = setFood(); 
    })
  }
}

init();