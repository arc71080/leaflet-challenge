// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let plateUrl = "static/data/PB2002_boundaries.json"

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    d3.json(plateUrl).then(function (plateData){
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features, plateData.features);
  });
});

 // The function that will deterime the colors of the each earthquake based on depth
 function chooseColor(depth) {
  if (depth > 90) return "red";
  else if (depth > 70) return "orange";
  else if (depth > 50) return "gold";
  else if (depth > 30) return "yellow";
  else if (depth > 10) return "greenyellow";
  else return "green";
}

// The function that will determine the size based on magnitude
function markerSize(magnitude) {
return magnitude * 20000;
}

// Data markers should reflect the magnitude of the earthquake by their size and the depth of the earthquake by color
function dataMarker(feature, latlng) {
    return L.circle(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        color:"black",
        weight: 0.5,
        opacity: 0.5,
        fillOpacity: 1
    });
}

  function createFeatures(earthquakeData, plateData) {
    // Give each feature a popup that describes the place, time, magnitude, and depth of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date and Time: ${new Date(feature.properties.time)}</p></p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }

    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: dataMarker
    });

    let plates = L.geoJSON(plateData, {
        style: function () {
            return {
            color: "darkorange",
            weight: 3,
          }
        }
    });
  
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes, plates);
  }
  
  function createMap(earthquakes, plates) {
  
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Source 2 and 3
  let satellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYXJjNzEwODAiLCJhIjoiY2xuc2NteGZmMTluajJqcGRvZTlndjZ6eiJ9.ZH-Ej7mu_b5IMK4zArOSGw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    });

  let light = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYXJjNzEwODAiLCJhIjoiY2xuc2NteGZmMTluajJqcGRvZTlndjZ6eiJ9.ZH-Ej7mu_b5IMK4zArOSGw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    });

  let outdoor = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYXJjNzEwODAiLCJhIjoiY2xuc2NteGZmMTluajJqcGRvZTlndjZ6eiJ9.ZH-Ej7mu_b5IMK4zArOSGw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    });

   // Create a baseMaps object.
   let baseMaps = {
    "Street Map": street,
    "Satellite Map": satellite,
    "Light Map": light,
    "Outdoor Map": outdoor,
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes,
    Lines: plates
  };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [37.09, -53.71],
      zoom: 3,
      layers: [street, earthquakes, plates]
    });
  
  // Add the layer control to the map by passing the baseMaps and overlayMaps
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
  // Source 1   
  // Set up the legend
  let legend = L.control({position: 'bottomright'});
  legend.onAdd = function () {
    let div = L.DomUtil.create('div', 'info legend');
    let limit = [-10, 10, 30, 50, 70, 90];
    let labels = [];
 

        for (let i = 0; i < limit.length; i++) {
            div.innerHTML +=
                '<i style="background:' + chooseColor(limit[i] + 1) + '"></i> ' +
                limit[i] + (limit[i + 1] ? '&ndash;' + limit[i + 1] + '<br>' : '+');
        }    

        return div;

        };

        // Add legend to map
        legend.addTo(myMap);
  }