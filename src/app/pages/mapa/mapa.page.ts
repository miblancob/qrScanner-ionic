import { Component, OnInit, AfterViewInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
declare var require: any;

@Component({
  selector: "app-mapa",
  templateUrl: "./mapa.page.html",
  styleUrls: ["./mapa.page.scss"],
})
export class MapaPage implements OnInit, AfterViewInit {
  latitude: number;
  longitude: number;
  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    const geo = this.activatedRoute.snapshot.paramMap.get("geo");
    const position = geo.substr(4).split(",");
    this.latitude = Number(position[0]);
    this.longitude = Number(position[1]);
    console.log(this.latitude);
    console.log(this.longitude);
  }
  ngAfterViewInit(): void {
    const mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");

    mapboxgl.accessToken =
      "pk.eyJ1IjoibXVzaXRvIiwiYSI6ImNrYThkeHA4eTA3cXgyeHM5YnZ5NmdoZXkifQ.riGba6_6Y5MWyeUCDD4pxQ";
    // const map = new mapboxgl.Map({
    //   container: "map",
    //   style: "mapbox://styles/mapbox/streets-v11",
    // });
    const map = new mapboxgl.Map({
      style: "mapbox://styles/mapbox/light-v10",
      center: [this.longitude, this.latitude],
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      container: "map",
      antialias: true,
    });

    map.on("load", () => {
      map.resize();

      var marker = new mapboxgl.Marker()
        .setLngLat([this.longitude, this.latitude])
        .addTo(map);
      // Insert the layer beneath any symbol layer.
      const layers = map.getStyle().layers;

      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      map.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",

            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "min_height"],
            ],
            "fill-extrusion-opacity": 0.6,
          },
        },
        labelLayerId
      );
    });
  }
}
