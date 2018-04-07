// ==UserScript==
// @name         Rotten Tomatoes on Netflix
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Show Rotten Tomatoes scores on Netflix
// @author       You
// @match        http://tampermonkey.net/index.php?version=4.3.6&ext=dhdg&updated=true
// @include      https://www.netflix.com/browse*
// @include      https://www.netflix.com/title*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    var getScore=function(title, year, a){
        var xmlhttp=new XMLHttpRequest();
        var url="https://www.rottentomatoes.com/api/private/v2.0/search/?limit=3&q="+encodeURI(title);
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var movieData=JSON.parse(this.responseText).movies;
                var movie;
                for(var i=0; i<movieData.length; i++){
                    if (movieData[i].name === title.trim() && movieData[i].year == year){
                        movie=movieData[i];
                        break;
                    }
                }
                if (movie) {
                    var text;
                    if (movie.meterScore){
                        text=document.createTextNode(" "+ movie.meterScore + "%");
                        var img=document.createElement("img");
                        switch(movie.meterClass){
                            case "certified_fresh":
                                img.src="https://staticv2-4.rottentomatoes.com/static/images/icons/CF_16x16.png";
                                break;
                            case "fresh":
                                img.src="https://staticv2-4.rottentomatoes.com/static/images/icons/fresh-16.png";
                                break;
                            case "rotten":
                                img.src="https://staticv2-4.rottentomatoes.com/static/images/icons/splat-16.png";
                                break;

                        }
                        a.appendChild(img);
                    }
                    else {
                        text=document.createTextNode(" No score available.");
                    }
                    a.href="https://www.rottentomatoes.com" + movie.url;
                    a.target="_blank";
                    a.appendChild(text);
                }
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    };

    var addTomatoElements=function(){
        var shows=document.getElementsByClassName("jawBone");
        var show;
        for(var i=0; i<shows.length; i++)
        {
            show=shows[i];
            try {
                var title=show.getElementsByClassName("title")[0].innerText || show.getElementsByClassName("logo")[0].alt;
                var year=show.getElementsByClassName("year")[0].innerText;
                var actionsRow=show.getElementsByClassName("jawbone-actions")[0];
                if (actionsRow.getElementsByClassName("tomato")[0]) { continue; }
                var a=document.createElement("a");
                a.className="tomato";
                getScore(title, year, a);
                actionsRow.appendChild(a);
            }
            catch(ex)
            {
                continue; // Movie data may not have finished loading, so try again later
            }
        }
    };

    var timer = function() {
     addTomatoElements();
     setTimeout(timer,1000);
    };

    timer();
})();