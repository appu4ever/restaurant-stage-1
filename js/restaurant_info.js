let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});

/**
* @description Initialize map
* @param null
*/
 // ADDED MAPBOX TOKEN.
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
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
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}

/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
* @description Get current restaurant from URL
* @param {function} callback
*/

fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
* @description Create restaurant HTML and add it to the page
* @param {object} self.restaurant
*/

fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  // Tab index and label for restaurant name
  name.tabIndex = "-1";
  name.setAttribute('aria-label','Restaurant name ' +name.innerHTML);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  // Tab index and label for restaurant address
  address.tabIndex = "-1";
  address.setAttribute('aria-label','Restaurant address' );

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  // Setting the alt text and title for restaurant images
  image.alt = "Picture of " + restaurant.name + " restaurant";
  image.title = restaurant.name;
  // Removed image from tab order
  image.tabIndex = "-1";

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  // Removed cuisine type from tab order
  cuisine.tabIndex = "-1";
  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
* @description Create restaurant working hours table and add to webpage
* @param {string} self.restaurant.operating_hours
*/

fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);
    // Removed restaurant working hours table to the tab order
    row.tabIndex = "-1";
    hours.appendChild(row);
  }
}

/**
* @description Create reviews list  and add to webpage
* @param {array} self.restaurant.reviews
*/
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.setAttribute('aria-label','No Reviews');
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
* @description Create single review list item add to webpage
* @param {object} review
*/

createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  // Added tab index and label for reviewer name
  name.tabIndex = "-1";
  name.setAttribute('aria-label','Review by '+review.name);
  li.appendChild(name);

  const date = document.createElement('p');
  // Removed the review date from tab order
  date.innerHTML = review.date;
  date.tabIndex = "-1";
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  // Add restaurant rating to the tab order
  rating.tabIndex = "-1";
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  // Remove review comments from the tab order
  comments.tabIndex = "-1";
  li.appendChild(comments);

  return li;
}

/**
* @description Add restaurant name to breadcrumb navigation menu
* @param {object} self.restaurant
*/

fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
* @description Get parameter by name from url
* @param {string} name
* @param {string} url
*/
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
