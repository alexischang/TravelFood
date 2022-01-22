let data = [],
  currentData = [],
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
  }
  catch (err) {
    console.log(err);
  }
}

const renderData = () => {
  filterFood();
  elementContent.innerHTML = makeFoodHtml(currentData[currentPage - 1]);
  elementCity.innerHTML = makeDropdownHtml('City');
  elementPages.innerHTML = makePaginationHtml();
  document.querySelector('#Loading').classList.add('js-hidden');
}

const makePaginationHtml = (str = '', len = currentData.length) => {
  for (let i = 0; i < len; i++) {
    str += currentPage === i + 1
      ? `<button class="btn js-active" type="button" data-index=${i + 1}>${i + 1}</button>`
      : `<button class="btn" type="button" data-index=${i + 1}>${i + 1}</button>`;
  };
  elementCurrentPage.textContent = currentPage;
  elementTotalPage.textContent = `/${len}`;
  return str;
}

const setClickPages = (e) => {
  if (e.target.nodeName !== 'BUTTON' || parseInt(e.target.dataset.index) === currentPage) {
    return;
  }
  elementPages.children[currentPage - 1].classList.remove('js-active');
  currentPage = parseInt(e.target.dataset.index);
  elementPages.children[currentPage - 1].classList.add('js-active');
  elementContent.innerHTML = makeFoodHtml(currentData[currentPage - 1]);
  elementCurrentPage.textContent = currentPage;
}

const filterFood = (arr = []) => {
  currentData = [];
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
  // console.log(arr)
  arr.map((item, i) => {
    if( i % pageRange === 0) {
      currentData.push([]);
    }
    let index = Math.floor( i / pageRange);
    currentData[index].push(item);
  })
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

const makeTableHtml = (arr, str = '') => {
  arr.map((item, index) => {
    let id = (currentPage - 1) * 10 + index + 1;
    str += `
      <tr class="table__item">
        <td class="table__id">${id}</td>
        <td class="table__tag">${item.City}</td>
        <td class="table__district">${item.Town}</td>
        <td class="table__restaurant">${item.Name}</td>
        <td class="table__address" title="${item.Address}">
          ${item.Address.length > 23
        ? item.Address.substring(0, 23) + '...'
        : item.Address}
        </td>
      </tr>`;
  });
  return `
    <div class="table">
      <table class="table__container">
        <thead class="table__head">
          <tr class="table__headList">
            <th class="table__headItem">編號</th>
            <th class="table__headItem">行政區</th>
            <th class="table__headItem">鄉鎮區</th>
            <th class="table__headItem">商家</th>
            <th class="table__headItem">地址</th>
          </tr>
        </thead>
        <tbody class="table__body">${str}</tbody>
      </table>
    </div>`;
}

const makeListHtml = (arr, str = '') => {
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
  return `<ul class="list list-transition">${str}</ul>`;
}

const makeCardHtml = (arr, str = '') => {
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
  return `<ul class="card card-transition row">${str}</ul>`;
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
  elementIcons.addEventListener('click', setClickIcons, true);
  elementPages.addEventListener('click', setClickPages);
}

const setDropdowns = (e) => {
  if (e.target.id === 'City') {
    currentCity = elementCity.value;
    currentDistrict = '';
    currentPage = 1;
    filterFood();
    elementContent.innerHTML = makeFoodHtml(currentData[currentPage - 1]);
    elementPages.innerHTML = makePaginationHtml();
    elementDistrict.innerHTML = makeDropdownHtml('Town');
  }
  else {
    currentDistrict = elementDistrict.value;
    currentPage = 1;
    filterFood();
    elementContent.innerHTML = makeFoodHtml(currentData[currentPage - 1]);
    elementPages.innerHTML = makePaginationHtml();
  }
}

const setClickIcons = (e) => {
  if (e.target.nodeName !== 'BUTTON') {
    return;
  }
  // let currentElement = elementIcons.children[mode].children[0];
  elementIcons.children[mode].classList.remove('js-text-dark');
  mode = parseInt(e.target.dataset.mode);
  // let latestElement = elementIcons.children[mode].children[0];
  elementIcons.children[mode].classList.add('js-text-dark');
  elementContent.innerHTML = makeFoodHtml(currentData[currentPage - 1]);
};

init();