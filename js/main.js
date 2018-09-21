let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added
  fetchNeighborhoods();
  fetchCuisines();
});

/**
* @description Fetches info about neighborhoods.
* @param null
*/

fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
* @description Forms HTML for a listbox with neighborhoods as options.
* @param {array} self.neighborhoods
*/

fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  // Added tab order for neighborhood filter
  select.tabIndex = "0";
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
* @description Fetches avilable cuisines
* @param null
*/

fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
* @description Forms HTML for a listbox with cuisines as options.
* @param {array} self.cuisines
*/

fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  // Added tab order for cuisine filter
  select.tabIndex = "0";
  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
* @description Initialize map called from HTML
* @param null
*/

 // ADDED MAPBOX TOKEN.
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoiYXBwdTRldmVyIiwiYSI6ImNqbHo4NmE2aTFzamQzd3F2aTUxMDUwYnQifQ._UA_Bfx1cnBJP4tEQ6oJnw',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);
  updateRestaurants();
}
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
* @description get selected neighborhood and cuisine from listbox and return all relevant restaurants.
* @param null
*/

updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
* @description reset restaurant info and mao markers
* @param {array} restaurants
*/

resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
* @description Create all restaurant HTML and add them to the webpage
* @param {array} self.restaurants
*/

fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  // ADDED TAB ORDER FOR RESTAURANT LIST
  ul.tabIndex = "0";
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
* @description create restaurant HTML
* @param {object} restaurant
*/

createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  /* Each restaurant list item has a picture element that selects the image based on width of viewport */
  let htmlContent = `<picture class= "restaurant-img" style= "overflow:hidden;">
                      <source media= "(max-width: 600px)" sizes= "100vw" srcset= "images/${restaurant.id}-800.jpg">
                      <source media= "(max-width: 850px)" sizes= "100vw" srcset= "images/${restaurant.id}-300.jpg ">
                      <source media= "(min-width: 851px)" sizes= "100vw" srcset= "images/${restaurant.id}-300.jpg ">
                      <img src= "/img/${restaurant.id}.jpg">
                     </picture>`;
  li.insertAdjacentHTML('afterbegin',htmlContent);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  name.tabIndex = "0";
  // Setting the alt text and title for restaurant images
  image.alt = "Picture of " + restaurant.name + " restaurant";
  image.title = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  // added a button for better accessibility for screen readers
  const more = document.createElement('a');
  const button = document.createElement('button');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  button.tabIndex = "-1";
  button.append(more);
  li.append(button);

  return li
}

/**
* @description add markers for current restaurant
* @param {array} self.restaurants
*/
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

}
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */
