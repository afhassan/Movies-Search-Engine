$(document).ready(function() {
  $('.alert').hide();
  updateNominations();
  getMovies();
  $('#searchForm').on('submit', function(){
    sessionStorage.setItem('searchText', $('#searchText').val());
    getMovies();
    $('.alert').hide();
  })
});

/**
 * Makes an API request with search text and outputs the results as HTML.
 * 
 */
function getMovies(){
  let searchText = sessionStorage.getItem('searchText');
  var nominations = JSON.parse(localStorage.getItem('nominations'));
  if (searchText == null){
    return false
  }

  $('#searchText').val(searchText);
  axios.get('https://www.omdbapi.com/?apikey=91e54dfc&type=movie&s=' + searchText)
  .then(function(response){
    let movies = response.data.Search;
    let resultsOutput = '';
    $.each(movies, function(i, movie){
      let disabled = ''
      if(nominations.includes(movie.imdbID) || nominations.length == 5 ) {
        disabled = 'disabled';
      }
      resultsOutput += `
      <div class="col-md-3">
        <div class="well text-center">
          <div class="hovertrigger">
            <img class="py-2" src="${movie.Poster}">
            <div class= "movie-overlay">
              <a onclick="nominateMovie('${movie.imdbID}')" class="btn btn-success px-4 ${disabled}" href="#">Nominate</a>
              <div class="py-2"></div>
              <a onclick="showMovieId('${movie.imdbID}')" class="btn btn-secondary px-4" href="#">Details</a>
            </div>
          </div>
          <h5>${movie.Title} (${movie.Year})</h5>
        </div>
      </div>
      `;
    });
    $('#searchResults').html(resultsOutput);
  })
  .catch(function(err){
    console.log(err);
  })
}

/**
 * Stores the imdbID of the target movie in session storage then returns the view show.html
 * 
 * @param {string} id 
 */
function showMovieId(id) {
  sessionStorage.setItem('movieId', id);
  window.location = 'show.html';
  return false;
}

/**
 * Makes an API request with movie imdbID and outputs the result as HTML.
 * 
 */
function showMovie(){
  let movieId = sessionStorage.getItem('movieId');

  axios.get('https://www.omdbapi.com/?apikey=91e54dfc&i=' + movieId)
  .then(function(response){
      let movie = response.data;
      let showOutput =`
      <div class="row">
        <div class="col-md-4 py-5">
          <img src="${movie.Poster}" class="thumbnail">
        </div>
        <div class="col-md-8">
          <h2 class="display-4">${movie.Title}</h2>
          <ul class="list-group">
            <li class="list-group-item text-left"><strong>Genres:</strong> ${movie.Genre}</li>
            <li class="list-group-item text-left"><strong>Language:</strong> ${movie.Language}</li>
            <li class="list-group-item text-left"><strong>Released:</strong> ${movie.Released}</li>
            <li class="list-group-item text-left"><strong>Rated:</strong> ${movie.Rated}</li>
            <li class="list-group-item text-left"><strong>IMDB Rating:</strong> ${movie.imdbRating}</li>
            <li class="list-group-item text-left"><strong>Director:</strong> ${movie.Director}</li>
            <li class="list-group-item text-left"><strong>Writers:</strong> ${movie.Writer}</li>
            <li class="list-group-item text-left"><strong>Actors:</strong> ${movie.Actors}</li>
            <li class="list-group-item text-left"><strong>Plot:</strong> ${movie.Plot}</li>
          </ul>
          <div class="text-center py-3">
            <a href="http://imdb.com/title/${movie.imdbID}" target="_blank" class="btn btn-primary">View IMDB</a>
            <a href="index.html" class="btn btn-secondary">Go Back To Search</a>
          </div>
        </div>
      </div>
      `;

      $('#showMovie').html(showOutput);
  })
  .catch(function(err){
      console.log(err);
  })
}

/**
 * Stores the imdbID of the nominated movie in local storage.
 * 
 * @param {string} id 
 */
function nominateMovie(id) {
  $('.alert').hide();
  let nominations = JSON.parse(localStorage.getItem("nominations"));
  
  if (nominations.length >= 5){
    return false
  }
  for (i = 0, len = nominations.length; i < len; i++) {
    if (nominations[i] == id){
      return false
    }
  }
  nominations.push(id);
  localStorage.setItem('nominations', JSON.stringify(nominations));
  updateNominations();
  getMovies();
}

/**
 * Removes the imdbID of the target movie from nominations in local storage.
 * 
 * @param {string} id 
 */
function removeMovie(id) {
  let nominations = JSON.parse(localStorage.getItem("nominations"));
  for (i = 0, len = nominations.length; i < len; i++) {
    if (nominations[i] == id){
      nominations.splice(i,1);
    }
  }
  localStorage.setItem('nominations', JSON.stringify(nominations));
  updateNominations();
  getMovies();
}

/**
 * Updates HTML of nominations section using array of imdbIDs stored in local storage and shows submit button if 5 nominations exist
 * 
 */
async function updateNominations(){
  if(JSON.parse(localStorage.getItem("nominations") == null)){
    let nominations = []
    localStorage.setItem('nominations', JSON.stringify(nominations));
  }

  var nominations = JSON.parse(localStorage.getItem("nominations"))
  if(!nominations.length){
    let nominationsOutput =`
    <div class="card bg-light full" >
      <img class="card-img-top placeholder" src="images/nominations-placeholder.png" alt="Card image cap">
      <div class="card-body">
        <h5 class="card-title text-muted">Not Assigned</h5>
      </div>
    </div>
    `;
    $('#nominations').html(nominationsOutput.repeat(5));
    return false
  }
  const nominatedMovies = await Promise.all(
    nominations.map(async (nomination) => {
      return axios.get('https://www.omdbapi.com/?apikey=91e54dfc&i=' + nomination)
    })
  );
  console.log(nominatedMovies)
  var nominationsOutput = ``
  nominatedMovies.forEach(nominatedMovie => {
    nominationsOutput +=`
    <div class="card bg-light">
      <img class="poster" src="${nominatedMovie.data.Poster}" alt="Card image cap">
      <div class="nomination-overlay">
        <a onclick="removeMovie('${nominatedMovie.data.imdbID}')" class="btn btn-danger px-4" href="#">Remove</a>
      </div>
    </div>
    `;
  })
  let placeholder =`
  <div class="card bg-light full" >
    <img class="card-img-top placeholder" src="images/nominations-placeholder.png" alt="Card image cap">
    <div class="card-body">
      <h5 class="card-title text-muted">Not Assigned</h5>
    </div>
  </div>
  `;
  nominationsOutput += placeholder.repeat(5-nominatedMovies.length)
  $('#nominations').html(nominationsOutput);

  if (nominatedMovies.length == 5){
    $('#submitNominations').show();
  }
  else{
    $('#submitNominations').hide();
  }
}

/**
 * Cleans nominations from local storage and shows submission alert.
 * 
 */
function submitNominations(){
  $('#submitNominations').hide();
  $('.alert').show();
  let nominations = []
  localStorage.setItem('nominations', JSON.stringify(nominations));
  updateNominations();
  getMovies();
}