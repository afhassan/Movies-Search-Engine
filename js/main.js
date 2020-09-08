$(document).ready(function() {
    updateNominations();
    $('#searchForm').on('submit', (event), function(){
        let searchText = $('#searchText').val();
        getMovies(searchText);
        event.preventDefault();
    })
});

function getMovies(searchText){
    axios.get('https://www.omdbapi.com/?apikey=91e54dfc&s=' + searchText)
    .then(function(response){
        console.log(response);
        let movies = response.data.Search;
        let resultsOutput = '';
        $.each(movies, function(i, movie){
            resultsOutput += `
            <div class="col-md-3">
                <div class="well text-center">
                    <img  class="py-2" src="${movie.Poster}">
                    <h5>${movie.Title} (${movie.Year})</h5>
                    <a onclick="showMovieId('${movie.imdbID}')" class="btn btn-secondary" href="#">Details</a>
                    <a onclick="nominateMovie('${movie.imdbID}')" class="btn btn-success" href="#">Nominate</a>
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

function showMovieId(id) {
  sessionStorage.setItem('movieId', id);
  window.location = 'show.html';
  return false;
}

function showMovie(){
  let movieId = sessionStorage.getItem('movieId');

  axios.get('https://www.omdbapi.com/?apikey=91e54dfc&i=' + movieId)
  .then(function(response){
      console.log(response);
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
              <li class="list-group-item text-left"><strong>Director:</strong> ${movie.Director}</li>
              <li class="list-group-item text-left"><strong>Writers:</strong> ${movie.Writer}</li>
              <li class="list-group-item text-left"><strong>Actors:</strong> ${movie.Actors}</li>
              <li class="list-group-item text-left"><strong>Rated:</strong> ${movie.Rated}</li>
              <li class="list-group-item text-left"><strong>IMDB Rating:</strong> ${movie.imdbRating}</li>
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


function nominateMovie(id) {
  if(JSON.parse(sessionStorage.getItem("nominations") == null)){
    let nominations = []
    sessionStorage.setItem('nominations', JSON.stringify(nominations));
  }

  let nominations = JSON.parse(sessionStorage.getItem("nominations"));
  console.log(nominations);
  if (nominations.length >= 5){
    return false
  }
  for (i = 0, len = nominations.length; i < len; i++) {
    if (nominations[i] == id){
      return false
    }
  }
  nominations.push(id);
  console.log(nominations);  
  sessionStorage.setItem('nominations', JSON.stringify(nominations));
  updateNominations();
}

function removeMovie(id) {
  let nominations = JSON.parse(sessionStorage.getItem("nominations"));
  for (i = 0, len = nominations.length; i < len; i++) {
    if (nominations[i] == id){
      nominations.splice(i,1);
    }
  }
  sessionStorage.setItem('nominations', JSON.stringify(nominations));
  updateNominations();

}

function updateNominations(){
  if(JSON.parse(sessionStorage.getItem("nominations") == null)){
    let nominations = []
    sessionStorage.setItem('nominations', JSON.stringify(nominations));
  }
  var nominations = JSON.parse(sessionStorage.getItem("nominations"))
  if(!nominations.length){
    console.log('ran')
    let nominationsOutput =`
    <div class="card bg-light" >
      <img class="card-img-top" src="images/nominations-placeholder.png" alt="Card image cap">
      <div class="card-body">
        <h5 class="card-title text-muted">Not Assigned</h5>
      </div>
    </div>
    `;
    $('#nominations').html(nominationsOutput.repeat(5));
    return false
  }
  nominationsOutput = ``
  for (i = 0, len = nominations.length; i < len; i++) {
    axios.get('https://www.omdbapi.com/?apikey=91e54dfc&i=' + nominations[i])
    .then(function(response){
      console.log(response);
      let nominationDetails = response.data;
      nominationsOutput +=`
        <div class="card bg-light">
          <img class="card-img-top" src="${nominationDetails.Poster}" alt="Card image cap">
          <div class="card-body">
            <a onclick="removeMovie('${nominationDetails.imdbID}')" class="btn btn-danger px-5" href="#">Remove</a>
          </div>
        </div>
      `;
      return nominationsOutput
    })
    .then(function(nominationsOutput){
      for (i = 0, len = (5-(nominations.length)); i < len; i++) {
        nominationsOutput +=`
        <div class="card bg-light" >
          <img class="card-img-top" src="images/nominations-placeholder.png" alt="Card image cap">
          <div class="card-body">
            <h5 class="card-title text-muted">Not Assigned</h5>
          </div>
        </div>
        `;
      }
      $('#nominations').html(nominationsOutput);
    })    
  }
}