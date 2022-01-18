let data = [],
    currentCity='',
    currentDistrict='';

const url = 'https://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvTravelFood.aspx',
      elementCity = document.querySelector('#City'),
      elementDistrict = document.querySelector('#District'),
      elementFood = document.querySelector('#Food'); 

const init = async() => {
  await getData();
  renderData();
  setFilter();
}

const getData = async () => {
  try {
    const res = await fetch(url);
    data = await res.json();
  }
  catch(err) {
    console.log(err);
  }
}

const renderData = () => {
  renderFood();
  renderDropdowns('City');
  document.querySelector('#Loading').classList.add('js-hidden');
}

const renderFood = (city, district) => {
  let str='';
  data.map( (item) => {
    if(city!==undefined && item.City !== city || district!==undefined && district !== item.Town){
      return;      
    } 
    else {
      return str+=`
        <li class="food__item food__item-transition">
          ${item?.Url && `<a href=${item.Url} target="_blank">`}
            <div class="food__desc">
              <h5 class="food__location">${item.Town}</h5>
              <h4 class="food__restaurant">${item.Name}</h4>
              <div class="food__underline"></div>
              <p class="food__details">${item.FoodFeature.substring(0, 43)}</p>
            </div>
            <h5 class="food__tag">${item.City}</h5>
            <div class="food__imgContainer">
              <img class="food__img img-resp" src=${item.PicURL} alt=${item.Name} loading="lazy"/>
            </div>
            <div class="food__filter"></div>
          ${item.Url && `</a>`}
          </li>`;
      }
    });
  elementFood.innerHTML = str;
}

const getDropdowns = ( keyword, arr) => {
  keyword === 'City' ?
  data.forEach(item => {
    if(!arr.includes(item.City)){
      arr.push(item.City);
    }
  }) 
  :data.forEach(item => {
    if( currentCity === item.City) {
      if(!arr.includes(item.Town)) {
        arr.push(item.Town);
      }
    }
  })
  return arr;
}

const renderDropdowns = (keyword) => {
  let arr = [];
  arr = getDropdowns(keyword, arr);
  let renderedData = keyword === 'City'? elementCity.innerHTML:'<option class="filter__dropdown-item" value="" id="default-option" selected disabled>請選擇鄉鎮區...</option>';
  arr.map(item => {
    renderedData+=`<option class="filter__dropdown-item" id="dropdown-item" value=${item}>${item}</option>`;
  })
  if(keyword==='City') {
    elementCity.innerHTML = renderedData;
  }
  else {
    elementDistrict.innerHTML = renderedData;
  }
} 

const setFilter = () => {
  elementCity.addEventListener('change', () => {
    currentCity = elementCity.value;
    renderFood(currentCity);
    renderDropdowns('Town');
  });
  elementDistrict.addEventListener('change', () => {
    currentDistrict = elementDistrict.value;
    renderFood(currentCity,currentDistrict);
  });
}

init();