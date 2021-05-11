$(document).ready(function() {
  $('.alert').hide();
  updateNominations();
  searchMovies();
  $('#searchForm').on('submit', function(){
    sessionStorage.setItem('searchText', $('#searchText').val());
    searchMovies();
    $('.alert').hide();
  })
});

/**
 * Makes an API request with search text and outputs the results as HTML.
 * 
 */
async function searchMovies() {
  const searchText = sessionStorage.getItem('searchText') ? sessionStorage.getItem('searchText') : '';
  const nominations = JSON.parse(localStorage.getItem('nominations'));
  $('#searchText').val(searchText);
  let response
  try {
    response = await axios.get('https://www.omdbapi.com/?apikey=91e54dfc&type=movie&s=' + searchText)
  }
  catch (e) {
    console.log(e);
  }
  let searchOutput = '';
  if (response.data.Response == 'True') {
    const movies = response.data.Search;
    movies.forEach(movie => {
      let disabled = ''
      if (nominations.includes(movie.imdbID) || nominations.length == 5 ) {
        disabled = 'disabled';
      }
      searchOutput += `
      <div class="col-md-3">
        <div class="well text-center">
          <div class="hovertrigger">
            <img class="py-2" src="${movie.Poster}">
            <div class= "movie-overlay">
              <a onclick="nominateMovie('${movie.imdbID}')" onauxclick="nominateMovie('${movie.imdbID}')" class="btn btn-success px-4 ${disabled}" href="#">Nominate</a>
              <div class="py-2"></div>
              <a onclick="passMovieId('${movie.imdbID}')" onauxclick="passMovieId('${movie.imdbID}')" class="btn btn-secondary px-4" href="#">Details</a>
            </div>
          </div>
          <h5>${movie.Title} (${movie.Year})</h5>
        </div>
      </div>
      `;
    })
    $('#searchResults').html(searchOutput);
  }
  else if (response.data.Response == 'False' && response.data.Error == 'Incorrect IMDb ID.') {
    $('#searchResults').html(searchOutput);
  }
  else if (response.data.Response == 'False' && response.data.Error == 'Too many results.') {
    searchOutput += `<h3 class="text-center text-muted py-3">Try searching for something more specific!</h3>`
    $('#searchResultsContainer').html(searchOutput);
  }
  else {
    searchOutput += `<h3 class="text-center text-muted py-3">Something went wrong...</h3>`
    $('#searchResultsContainer').html(searchOutput);
  }
}

/**
 * Stores the imdbID of the target movie in session storage then returns the view show.html
 * 
 * @param {string} id 
 */
function passMovieId(id) {
  sessionStorage.setItem('movieId', id);
  window.location = 'show.html';
}

/**
 * Makes an API request with movie imdbID and outputs the result as HTML.
 * 
 */
async function showMovie() {
  const movieId = sessionStorage.getItem('movieId');
  let response
  try {
    response = await axios.get('https://www.omdbapi.com/?apikey=91e54dfc&i=' + movieId)
  }
  catch (e) {
    console.log(e);
  }
  const movie = response.data;
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
}

/**
 * Stores the imdbID of the nominated movie in local storage.
 * 
 * @param {string} id 
 */
function nominateMovie(id) {
  $('.alert').hide();
  const nominations = JSON.parse(localStorage.getItem("nominations"));
  if (nominations.includes(id) || nominations.length >= 5){
    return
  }
  nominations.push(id);
  localStorage.setItem('nominations', JSON.stringify(nominations));
  updateNominations();
  searchMovies();
}

/**
 * Removes the imdbID of the target movie from nominations in local storage.
 * 
 * @param {string} id 
 */
function removeMovie(id) {
  const nominations = JSON.parse(localStorage.getItem("nominations"));
  if (nominations.includes(id)) {
    itemIndex = nominations.indexOf(id)
    nominations.splice(itemIndex,1);
  }
  localStorage.setItem('nominations', JSON.stringify(nominations));
  updateNominations();
  searchMovies();
}

/**
 * Updates nominations section using imdbIDs stored in local storage and show submit button if there are 5 nominations
 * 
 */
async function updateNominations() {
  if (JSON.parse(localStorage.getItem("nominations") == null)){
    let nominations = []
    localStorage.setItem('nominations', JSON.stringify(nominations));
  }
  const nominations = JSON.parse(localStorage.getItem("nominations"))
  const placeholder =`
  <div class="card bg-light full" >
    <img class="card-img-top placeholder" src="images/nominations-placeholder.png" alt="Card image cap">
    <div class="card-body">
      <h5 class="card-title text-muted">Not Assigned</h5>
    </div>
  </div>
  `
  if (!nominations.length) {
    $('#nominations').html(placeholder.repeat(5));
    return
  }
  let responses
  try {
    responses = await Promise.all(
      nominations.map(async (nomination) => {
        return axios.get('https://www.omdbapi.com/?apikey=91e54dfc&i=' + nomination)
      })
    )
  }
  catch (e) {
    console.log(e);
  }
  var nominationsOutput = ``
  responses.forEach(response => {
    nominationsOutput +=`
    <div class="card bg-light">
      <img class="poster" src="${response.data.Poster}" alt="Card image cap">
      <div class="nomination-overlay">
        <a onclick="removeMovie('${response.data.imdbID}')" onauxclick="removeMovie('${response.data.imdbID}')" class="btn btn-danger px-4" href="#">Remove</a>
      </div>
    </div>
    `;
  })
  nominationsOutput += placeholder.repeat(5-responses.length)
  $('#nominations').html(nominationsOutput);

  if (responses.length == 5){
    $('#submitNominations').show();
  }
  else{
    $('#submitNominations').hide();
  }
}

/**
 * Cleans nominations from local storage and shows submission success message.
 * 
 */
function submitNominations(){
  $('#submitNominations').hide();
  $('.alert').show();
  let nominations = []
  localStorage.setItem('nominations', JSON.stringify(nominations));
  updateNominations();
  searchMovies();
}