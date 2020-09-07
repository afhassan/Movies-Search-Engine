$(document).ready(function() {
    $('#searchForm').on('submit', (event), function(){
        let searchText = $('#searchText').val();
        getMovies(searchText);
        event.preventDefault();
    })
});

function getMovies(searchText){
    axios.get('http://www.omdbapi.com/?apikey=91e54dfc&s=' + searchText)
    .then(function(response){
        console.log(response);
        let movies = response.data.Search;
        let output = '';
        $.each(movies, function(i, movie){
            output += `
            <div class="col-md-3">
                <div class="well text-center">
                    <img  class="py-2" src="${movie.Poster}">
                    <h5>${movie.Title} (${movie.Year})</h5>
                </div>
            </div>
            `;
        });
        
        $('#searchResults').html(output);
    })
    .catch(function(err){
        console.log(err);
    })
}

