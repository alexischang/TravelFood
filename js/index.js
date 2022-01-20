let data = [],
  currentCity = '',
  currentDistrict = '';

const url = 'https://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvTravelFood.aspx',
  elementCity = document.querySelector('#City'),
  elementDistrict = document.querySelector('#District'),
  elementFood = document.querySelector('#Food');

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
  elementFood.innerHTML = setFood();
  elementCity.innerHTML = makeDropdownHtml('City');
  document.querySelector('#Loading').classList.add('js-hidden');
}

const setFood = (arr = []) => {
  arr = filterFood();
  return makeFoodHtml(arr);
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
  return arr;
}

const makeFoodHtml = (arr) => {
  let str = '';
  arr.map((item) => {
    str += `
      <li class="food__item">
        <div class="food__gutter">
          ${item?.Url && `<a href="${item.Url}" target="_blank">`}
            <div class="food__desc">
              <span class="food__location">${item.Town}</span>
              <h2 class="food__restaurant">${item.Name}</h2>
              <p class="food__details">${item.FoodFeature.substring(0, 43)}...</p>
            </div>
            <span class="food__tag">${item.City}</span>
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
}

const setDropdowns = (e) => {
  if (e.target.id === 'City') {
    currentCity = elementCity.value;
    currentDistrict = '';
    elementFood.innerHTML = setFood();
    elementDistrict.innerHTML = makeDropdownHtml('Town');
  }
  else {
    currentDistrict = elementDistrict.value;
    elementFood.innerHTML = setFood();
  }
}

init();