let data = [],
  pages,
  dataCounts,
  mode = 0,
  currentPage = 1,
  pageRange = 10,
  currentCity = '',
  currentDistrict = '';

const url = 'https://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvTravelFood.aspx',
  elementCity = document.querySelector('#City'),
  elementDistrict = document.querySelector('#District'),
  elementContent = document.querySelector('#Content'),
  elementPages = document.querySelector('#Pages'),
  elementCurrentPage = document.querySelector('#CurrentPage'),
  elementTotalPage = document.querySelector('#TotalPage'),
  elementIcons = document.querySelector('#Icon');

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
  pages = Math.ceil(dataCounts / 10);
  elementContent.innerHTML = setFood();
  elementCity.innerHTML = makeDropdownHtml('City');
  renderPages();
  document.querySelector('#Loading').classList.add('js-hidden');
}

const renderPages = () => {
  elementPages.innerHTML = makePaginationHtml();
  setPages();
}
const makePaginationHtml = (str = '') => {
  len = Math.ceil(dataCounts / pageRange);
  for (let i = 0; i < len; i++) {
    str += currentPage === i + 1
      ? `<button class="btn js-active" type="button">${i + 1}</button>`
      : `<button class="btn" type="button">${i + 1}</button>`;
  };
  elementCurrentPage.textContent = currentPage;
  elementTotalPage.textContent = `/${len}`;
  return str;
}

const setPages = () => {
  elementBtns = [...elementPages.querySelectorAll('.btn')];
  elementBtns.map((item, index) => {
    item.addEventListener('click', () => {
      if (index + 1 === currentPage) {
        return;
      }
      elementBtns[currentPage - 1].classList.remove('js-active');
      currentPage = index + 1;
      elementBtns[currentPage - 1].classList.add('js-active');
      elementContent.innerHTML = setFood();
      elementCurrentPage.textContent = currentPage;
    })
  })
}

const setFood = (arr = []) => {
  arr = filterFood();
  const index = currentPage - 1;
  arr = index * 10 + pageRange >= arr.length
    ? setPageFood(index * 10, arr.length, arr)
    : setPageFood(index * 10, index * 10 + pageRange, arr);
  return makeFoodHtml(arr);
}

const filterFood = (arr = []) => {
  if (currentCity && currentDistrict) {
    data.map(item => {
      if (item.Town === currentDistrict) {
        arr.push(item);
      };
    });
  }
  else if (currentCity) {
    data.map(item => {
      if (item.City === currentCity) {
        arr.push(item);
      };
    });
  }
  else {
    arr = data;
  }
  dataCounts = arr.length;
  return arr;
}

const setPageFood = (first, last, arr, result = []) => {
  for (let i = first; i < last; i++) {
    result.push(arr[i]);
  }
  return result;
}

const makeFoodHtml = (arr) => {
  switch (mode) {
    case 0:
      return makeListHtml(arr);
    case 1:
      return makeTableHtml(arr);
    case 2:
      return makeCardHtml(arr);
    default:
      return makeListHtml(arr);
  }
}

const makeTableHtml = (arr) => {
  str=`
    <table class="table" id="Table">
    <thead class="table__head">
      <tr class="table__headList">
        <th class="table__headItem">編號</th>
        <th class="table__headItem">行政區</th>
        <th class="table__headItem">鄉鎮區</th>
        <th class="table__headItem">商家</th>
        <th class="table__headItem">地址</th>
      </tr>
    </thead>
    <tbody class="table__body">`;
  arr.map((item, index) => {
    let id = (currentPage-1)*10 + index + 1;
    str += `
      <tr class="table__item">
        <td class="table__id">${id}</td>
        <td class="table__tag">${item.City}</td>
        <td class="table__district">${item.Town}</td>
        <td class="table__restaurant">${item.Name}</td>
        <td class="table__address">
          ${item.Address.length > 23 
            ? item.Address.substring(0, 23)+'...'
            : item.Address}
        </td>
      </tr>`;
  });
  str+=`</tbody></table>`;
  return str;
}

const makeListHtml = (arr) => {
  str=`<ul class="food food-transition" id="Food">`;
  arr.map((item) => {
    str += `
      <li class="list__item">
        ${item?.Url && `<a class="list__link" href="${item.Url}" target="_blank">`}
          <div class="list__innerBox">
            <div class="list__desc">
              <h2 class="list__restaurant">${item.Name}</h2>
              <div class="list__location">
                <span class="list__tag">${item.City}</span>
                <span class="list__district">${item.Town}</span>
              </div>
              <p class="list__details">${item.FoodFeature.substring(0, 100)}...</p>
            </div>
            <div class="list__imgContainer">
              <img class="list__img img-resp" src=${item.PicURL} alt=${item.Name} width="248" height="144" loading="lazy">
            </div>
          </div>
        ${item.Url && `</a>`}
      </li>`;
  });
  str+=`</ul>`;
  return str;
}

const makeCardHtml = (arr) => {
  str=`<ul class="food food-transition row" id="Food">`;
  arr.map((item) => {
    str += `
      <li class="card__item">
        <div class="card__gutter">
          ${item?.Url && `<a class="card__link" href="${item.Url}" target="_blank">`}
            <div class="card__desc">
              <div class="card__location">
                <span class="card__tag">${item.City}</span>
                <span class="card__district">${item.Town}</span>
              </div>
              <h2 class="card__restaurant">${item.Name}</h2>
              <p class="card__details">${item.FoodFeature.substring(0, 43)}...</p>
            </div>
            <div class="card__imgContainer">
              <img class="card__img img-resp" src=${item.PicURL} alt=${item.Name} loading="lazy">  
            </div>
          ${item.Url && `</a>`}
        <div>
      </li>`;
  });
  str+=`</ul>`;
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
  setIcons();
}

const setDropdowns = (e) => {
  if (e.target.id === 'City') {
    currentCity = elementCity.value;
    currentDistrict = '';
    currentPage = 1;
    elementContent.innerHTML = setFood();
    renderPages();
    elementDistrict.innerHTML = makeDropdownHtml('Town');
  }
  else {
    currentDistrict = elementDistrict.value;
    currentPage = 1;
    elementContent.innerHTML = setFood();
    renderPages();

  }
}

const setIcons = () => {
  elementAllIcons = [...elementIcons.querySelectorAll('.fas')];
  elementAllIcons.map((item, index) => {
    item.addEventListener('click', (e) => {
      elementAllIcons[mode].classList.remove('js-text-dark');
      mode = index;
      elementAllIcons[mode].classList.add('js-text-dark');
      elementContent.innerHTML = setFood();
    })
  })
}

init();