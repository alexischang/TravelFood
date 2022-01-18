let data = [],
    cities = [],
    districts = [];
    
const url = 'https://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvTravelFood.aspx',
      city = document.querySelector('#city'),
      district = document.querySelector('#district'),
      food = document.querySelector('#food'); 

const init = () => {
  getData();
  setFilter();
}

const getData = async () => {
  try {
    const res = await fetch(url);
    data = await res.json();
    setFood();
    setBtnCities();
    document.querySelector('#loading').classList.add('js-hidden');
  }
  catch(err) {
    console.log(err);
  }
}

const setFood = (city, district) => {
  const rendered = data.map( (item) => {
    if(city!==undefined && item.City !== city || district!==undefined && district !== item.Town){
      return;      
    } 
    else {
      return `
        <li class="food__item food-transition">
          ${item.Url && `<a href=${item?.Url} target="_blank">`}
            <div class="food__desc">
              <h5 class="food__location">${item.Town}</h5>
              <h4 class="food__restaurant">${item.Name}</h4>
              <pㄑ class="food__details">${item.FoodFeature.substring(0, 43)}</p>
            </div>
            <h5 class="food__tag">${item.City}</h5>
            <div class="food__imgContainer">
              <img class="food__img img-resp" src=${item.PicURL} alt=${item.Name} loading="lazy"/>
            </div>
            <div class="food__filter"></div>
          ${item.Url && `</a>`}
          </li>`;
      }
    }).join('');
  food.innerHTML = rendered;
}

const setBtnCities = () => {
  data.forEach(item => {
    if(!cities.includes(item.City)){
      cities.push(item.City);
    }
  });
  let rendered = city.innerHTML;
  for(let i = 0; i < cities.length; i++) {
    rendered+=`<option class="filter__dropdown-item" id="dropdown-item" value=${cities[i]}>${cities[i]}</option>`;
  }
  city.innerHTML = rendered;
}

const setBtnDistricts = (city) => {
  let locations = [];
  data.forEach(item => {
    if(city === item.City) {
      if(!locations.includes(item.Town)) {
        locations.push(item.Town);
      }
    }
  });
  let rendered = '<option class="filter__dropdown-item" value="" id="default-option" selected disabled>請選擇鄉鎮區...</option>';
  for(let i = 0; i < locations.length; i++) {
    rendered+=`<option class="filter__dropdown-item" id="dropdown-item" value=${locations[i]}>${locations[i]}</option>`;
  }
  district.innerHTML = rendered;
}

const setFilter = () => {
  city.addEventListener('change', () => {
    let filterCity = city.value;
    setFood(filterCity);
    setBtnDistricts(filterCity);
  });
  district.addEventListener('change', () => {
    let filterCity = city.value;
    let filterDistrict = district.value;
    setFood(filterCity,filterDistrict);
  });
}

init();