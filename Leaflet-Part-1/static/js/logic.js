// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
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
return magnitude * 5;
}

// Data markers should reflect the magnitude of the earthquake by their size and the depth of the earthquake by color
function dataMarker(feature, latlng) {
    return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        color:"black",
        weight: 0.5,
        opacity: 0.5,
        fillOpacity: 1
    });
}

  function createFeatures(earthquakeData) {
    // Give each feature a popup that describes the place, time, magnitude, and depth of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date and Time: ${new Date(feature.properties.time)}</p></p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }

    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: dataMarker
    });
  
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
  }
  
  function createMap(earthquakes) {
  
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

   // Create a baseMaps object.
   let baseMaps = {
    "Street Map": street,
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [street, earthquakes]
    });
  
  // Add the layer control to the map by passing the baseMaps and overlayMaps
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
  // Set up the legend
  // Source 1
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


 
