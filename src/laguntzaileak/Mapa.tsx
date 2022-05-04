import * as L from 'leaflet';
import startIconSvg from '../img/start.svg';
import transferIconSvg from '../img/transfer.svg';
import endtIconSvg from '../img/end.svg';
import { Aukera } from '../models/models';
import { NominatimResponse } from 'nominatim-browser';
import { getLekuarenKoordenatuak, setLekuarenKoordenatuak } from "./KoordenatuakStorage";
import $ from "jquery";

//#endregion
//#region MaparenIrudikapena
export let map: any;
export function setMap(pMap: any) {
  map = pMap;
}

let markerList: any[] = [];
const startIcon: L.Icon = L.icon({
  iconUrl: startIconSvg,
  iconSize: [48, 48],
  iconAnchor: [12, 42]
});
const transferIcon: L.Icon = L.icon({
  iconUrl: transferIconSvg,
  iconSize: [48, 48],
  iconAnchor: [24, 48]
});
const endIcon: L.Icon = L.icon({
  iconUrl: endtIconSvg,
  iconSize: [48, 48],
  iconAnchor: [12, 44]
});
let lerroa: L.Polyline;

export function aukeraIrudikatu(aukera: Aukera) {
  markerGuztiakEzabatu();

  // Aukeraren garraiobide guztiak zeharkatu
  for (let i = 0; i < aukera.xehetasunak.ibilbideak.length; i++) {
    markerSortu(aukera.xehetasunak.ibilbideak[i].kokapenak.hasiera, i, (i === 0) ? startIcon : transferIcon);
    if (i == aukera.xehetasunak.ibilbideak.length - 1) {
      markerSortu(aukera.xehetasunak.ibilbideak[i].kokapenak.amaiera, i + 1, endIcon);
    } else {
      markerSortu(aukera.xehetasunak.ibilbideak[i].kokapenak.amaiera, i + 1, transferIcon);
    }
  }
}
function markerSortu(lekua: string, index: Number, markerIcon: L.Icon) {
  // Konprobatu koordenatuak baditu, ez bada, geokodifikatu
  let koord = getLekuarenKoordenatuak(lekua);
  if (koord != undefined) {
    // Marker sortu
    let marker = L.marker([koord.lat, koord.lng], {
      title: lekua,
      icon: markerIcon,
      alt: index.toString() // Lerroan ordenatzeko
    });

    markerGehitu(marker);
  } else {
    // Nominatim erabiliz lekuaren koordenatuak lortu
    var Nominatim = require("nominatim-browser");
    Nominatim.geocode({
      q: lekua,
      limit: 1
    })
      .then((result: NominatimResponse[]) => {
        setLekuarenKoordenatuak(lekua, { lat: Number(result[0].lat), lng: Number(result[0].lon) });
        // Marker sortu
        let marker = L.marker([Number(result[0].lat), Number(result[0].lon)], {
          title: lekua,
          icon: markerIcon,
          alt: index.toString() // Lerroan ordenatzeko
        });

        markerGehitu(marker);
      }).catch((error: any) => {
        // Nominatim bidez ezin bada aurkitu, Google-ekin probatu
        var xhr = new XMLHttpRequest();
        $.ajax({
          async: true,
          url: 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.google.com/maps/search/'+lekua),
          type: 'get',
          dataType: 'json',
          xhr: function() {
              return xhr;
          },
          success: function() {
              let erantzuna = JSON.parse(xhr.response).contents;
              console.log(erantzuna)
              let regexLatLng = /<meta content="https:\/\/maps\.google\.com\/maps\/api\/staticmap\?center=(?<lat>\-?[0-9]*.[0-9]*)%2C(?<lng>\-?[0-9]*.[0-9]*)[^>]*>/m
              let match: RegExpExecArray|null = regexLatLng.exec(erantzuna)
              console.log(match)
              if (match !== null) {
                console.log(lekua)
                console.log(match.groups!.lat)
                console.log(match.groups!.lng)

                setLekuarenKoordenatuak(lekua, { lat: Number(match.groups!.lat), lng: Number(match.groups!.lng) });
                // Marker sortu
                let marker = L.marker([Number(match.groups!.lat), Number(match.groups!.lng)], {
                  title: lekua,
                  icon: markerIcon,
                  alt: index.toString() // Lerroan ordenatzeko
                });

                markerGehitu(marker);
              } else {
                console.log("ERROR | Ezin izan dira koordenatuak lortu. lekua: "+lekua)
              }
          }
        });
      });


    
  }
}

export function markerGehitu(marker: L.Marker) {
  markerList.push(marker); // Marker guztien zerrendara gehitu
  map.addLayer(marker); // Mapan sartu

  lerroaIrudikatu();
}
function markerGuztiakEzabatu() {
  for (let i = 0; i < markerList.length; i++) {
    map.removeLayer(markerList[i]);
  }
  markerList = [];
}
function lerroaIrudikatu() {
  // Koordenatuak gordeko dituen zerrenda
  let latlons: L.LatLng[] = [];

  // Bi marker konparatzeko (alt eremua)
  function compareMarkers(a: L.Marker, b: L.Marker) {
    if (Number(a.options.alt) < Number(b.options.alt)) {
      return -1;
    }
    if (Number(a.options.alt) > Number(b.options.alt)) {
      return 1;
    }
    return 0;
  }

  // Mapan lerro bat badago, ezabatu
  if (lerroa)
    lerroa.remove();

  // Marker zerrenda ordenatu
  markerList.sort(compareMarkers);

  // Marker guztien koordenatuak lortu
  markerList.forEach(m => {
    latlons.push(m.getLatLng());
  });

  // Lerroa sortu eta mapan sartu
  lerroa = L.polyline(latlons, { color: 'red' }).addTo(map);
  map.fitBounds(lerroa.getBounds());
}
