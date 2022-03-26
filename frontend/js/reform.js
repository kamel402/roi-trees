var districts = {};
var apikey = "pk.eyJ1IjoiYWJvb2R6YmFqbyIsImEiOiJja3U1d21hNDEyYXJ4Mm5wYzJub3V5MGdlIn0.QVGymFsf-n1A-8i1LK1y0g";
var mymap = L.map('map').setView([26.3726215,50.0855243],12);
// var mymap = L.map('map').setView([26.4091858,50.0876064],12);

var mylocation = null;
//var indices = ['fast_internet_index', 'infrastructure_index', 'hospitals_index', 'pharmacies_index', 'mosques_index', 'schools_index', 'population_density_index']
var indices = [ 'population_density_index', 'particulate_matter', 'temperature', 'ROI_temperature', 'ROI_particulate_matter',]
load_districts();

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: apikey,
}).addTo(mymap);


// mymap.locate({
//     setView: true,
//     maxZoom: 14,
// });



/***************************************************************
 * 
 *  Event listeners
 * 
**************************************************************/

document.getElementById("locateMe").addEventListener('click', () => {
    locateMe(mymap);
})

document.addEventListener("click", (event) => {
    if (event.target.classList[0] in districts) {
        updateLegend(districts[event.target.classList[0]],event.target.classList[0]);
    }
})
/*************************************************************** 
**************************************************************/


function locateMe(mymap) {
    if (mylocation != null)
        mymap.removeLayer(mylocation);
    navigator.geolocation.getCurrentPosition(function (location) {
        var latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);
        mymap.setView(latlng, 15);

        mylocation = new L.Marker(latlng, {
            icon: L.icon({
                iconUrl: '../img/home.svg',
                iconSize: [30, 30],
                shadowSize: [50, 64],
                iconAnchor: [15,15]
            })
        }).addTo(mymap);
    });
};




function colorRange(value) {
    
    var r, g, b = 0;
    if (value < 50) {
        r = 255;
        g = Math.round(5.1 * value);
    }
    else {
        g = 255;
        r = Math.round(510 - 5.10 * value);
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
}

function load_districts() { 
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status === 200 && xhr.DONE) {
            L.geoJson(JSON.parse(xhr.responseText), { style: areaStyle, /*onEachFeature: makeLabel*/ }).addTo(mymap);
        }
    };
    xhr.open("GET", "http://127.0.0.1:8000/dammam", true);
    //xhr.open("GET","api/dammam",true);
    xhr.send();
}


function getAreaColor(feature) {
    // console.log(feature.properties)
    var total = 0;
    for(var idx=0; idx < indices.length; idx++){
        total +=parseFloat(feature.properties[indices[idx]])
    }

    
    strokeColor = 'white';
    let durchschnitt = total;
    if (durchschnitt > 120)
        color = '#274e13';
    else if (durchschnitt > 80)
        color = '#6aa84f';
    else if (durchschnitt > 60)
        color = '#93c47d';
    else if (durchschnitt > 40)
        color = '#b6d7a8';
    else if (durchschnitt > 0)
        color = '#d9ead3';
    
    // console.log('total percent', (total/700.0)*100.0)
    return color;
};

function areaStyle(feature) {
    addToDistricts(feature);
    return {
        fillColor: getAreaColor(feature),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.6,
        className: districtClassName(feature.properties['name_en']),
    }
};

function makeLabel(feature, layer) {
    var htmlLabel = `
    <b>${feature.properties['name_en']}</b><br>
    <b>${feature.properties['name_ar']}</b><br>
    `;
    L.marker(layer.getBounds().getCenter()).bindPopup(htmlLabel).addTo(mymap);

}

function addToDistricts(feature) {
    // console.log(feature.properties['name_en'])
    districts[districtClassName(feature.properties['name_en'])]={}
    for(var idx =0; idx < indices.length; idx++){
        districts[districtClassName(feature.properties['name_en'])][indices[idx]]=feature.properties[indices[idx]];
    }
}

function updateLegend(district, districtName) {
    $('#district_english').text(districtName.replaceAll("_"," "));
    $('.indicator').each((index, obj) => {
        var indicator = Object.keys(district)[index];
        obj.style.width = `${(district[indicator])}%`;
        obj.style.backgroundColor = colorRange(district[indicator]);

    })
}

function districtClassName(str){
    return str.trim().replaceAll(" ","_").replaceAll(".","");
}





