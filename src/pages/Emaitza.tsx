import { IonBackButton, IonButtons, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonRow, IonTitle, IonToolbar, IonIcon, IonToggle, ToggleChangeEventDetail, IonModal, IonButton, IonPopover, IonCardContent, IonImg, IonThumbnail, IonSkeletonText } from '@ionic/react';
import * as L from 'leaflet';
import startIconSvg from '../img/start.svg';
import transferIconSvg from '../img/transfer.svg';
import endtIconSvg from '../img/end.svg';
import busIconSvg from '../img/bus.svg';
import trenIconSvg from '../img/tren.svg';
import metroIconSvg from '../img/metro.svg';
import tranviaIconSvg from '../img/tranvia.svg';
import oinezIconSvg from '../img/oinez.svg';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Aukera, IbilbideMota, Lekua, Koordenatuak} from '../models/aukera';
import { moon, arrowBack, arrowForward } from "ionicons/icons";
import './Emaitza.css';
import 'leaflet/dist/leaflet.css';
import { NominatimResponse }  from 'nominatim-browser';
import moment from 'moment';


//#region Aukerak
let aukeraList: Aukera[] = [];
let selectedAukera: Aukera;

function aukeraKonparatuIraupena(a: Aukera, b: Aukera) {
  let aMoment = moment(a.denbora.iraupena, 'dd:hh:mm');
  let bMoment = moment(b.denbora.iraupena, 'dd:hh:mm');
  if (aMoment < bMoment) return -1;
  if (aMoment > bMoment) return 1;
  return 0;
}

function aukeraKonparatuAmaiera(a: Aukera, b: Aukera) {
  let aMoment = moment(a.denbora.amaiera, 'hh:mm');
  let aMomentH = moment(a.denbora.hasiera, 'hh:mm');
  let bMoment = moment(b.denbora.amaiera, 'hh:mm');
  let bMomentH = moment(b.denbora.hasiera, 'hh:mm');
  
  if (aMoment < aMomentH) aMoment.add(1, 'days');
  if (bMoment < bMomentH) bMoment.add(1, 'days');

  if (aMoment < bMoment) return -1;
  if (aMoment > bMoment) return 1;
  return 0;
}

enum ordenMota {
  azkarragoa,
  lehenaAilegatzeko
}
//#endregion

//#region LocalStorage(lekuak)
function getLekuarenKoordenatuak(lekua: string): Koordenatuak | undefined {
  let result: Koordenatuak | undefined = undefined;

  checkLocalStorage();

  let datuak: Lekua[] = JSON.parse(localStorage.getItem('lekuak')!) as Lekua[];
  if (datuak.find(d => d.izena === lekua)) {
    result = datuak.find(d => d.izena === lekua)!.koord;
  }
  return result;
}

function setLekuarenKoordenatuak(lekua: string, koordenatuak: Koordenatuak) {

  checkLocalStorage();

  let datuak: Lekua[] = JSON.parse(localStorage.getItem('lekuak')!) as Lekua[];
  if (!datuak.find(d => d.izena === lekua)) {
    datuak.push({izena: lekua, koord: koordenatuak});
    localStorage.setItem('lekuak', JSON.stringify(datuak));
  }
}

function checkLocalStorage() {
  if (!localStorage.getItem('lekuak')) {
    localStorage.setItem('lekuak', JSON.stringify([]));
  }
}
//#endregion

//#region MaparenIrudikapena
let map: any;
let markerList: any[] = [];
const startIcon: L.Icon = L.icon({
  iconUrl: startIconSvg,
  iconSize:     [48, 48], // size of the icon
  iconAnchor:   [12, 42]});

const transferIcon: L.Icon = L.icon({
  iconUrl: transferIconSvg,
  iconSize:     [48, 48], // size of the icon
  iconAnchor:   [24, 48]});

const endIcon: L.Icon = L.icon({
  iconUrl: endtIconSvg,
  iconSize:     [48, 48], // size of the icon
  iconAnchor:   [12, 44]});
  
let lerroa: L.Polyline;

function aukeraIrudikatu(aukera: Aukera) {
  markerGuztiakEzabatu();

  // Aukeraren garraiobide guztiak zeharkatu
  for (let i = 0; i < aukera.ibilbideak.length; i++) {
    markerSortu(aukera.ibilbideak[i].kokapenak.hasiera, i, (i === 0) ? startIcon : transferIcon);
    if (i == aukera.ibilbideak.length - 1) {
      markerSortu(aukera.ibilbideak[i].kokapenak.amaiera, i+1, endIcon);
    }
  }
}

function markerSortu(lekua: string, index: Number, markerIcon: L.Icon) {
  // Konprobatu koordenatuak baditu, ez bada, geokodifikatu
  let koord = getLekuarenKoordenatuak(lekua);
  console.log(koord);
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
    .then((result: NominatimResponse[]) =>
    {
      setLekuarenKoordenatuak(lekua, {lat: Number(result[0].lat), lng: Number(result[0].lon)});
      // Marker sortu
      let marker = L.marker([Number(result[0].lat), Number(result[0].lon)], {
        title: lekua,
        icon: markerIcon,
        alt: index.toString() // Lerroan ordenatzeko
      });

      markerGehitu(marker);
    }).catch((error: any) =>
    {
      console.log('ERROR | lekua: '+lekua);
      console.log(error);
    });
  }
}

function markerGehitu(marker: L.Marker) {
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
  let latlons : L.LatLng[] = [];

  // Bi marker konparatzeko (alt eremua)
  function compareMarkers(a: L.Marker, b: L.Marker) {
    if (Number(a.options.alt) < Number(b.options.alt)){
      return -1;
    }
    if (Number(a.options.alt) > Number(b.options.alt)){
      return 1;
    }
    return 0;
  }

  // Mapan lerro bat badago, ezabatu
  if (lerroa) lerroa.remove();

  // Marker zerrenda ordenatu
  markerList.sort(compareMarkers);

  // Marker guztien koordenatuak lortu
  markerList.forEach(m => {
    latlons.push(m.getLatLng());
  });

  // Lerroa sortu eta mapan sartu
  lerroa = L.polyline(latlons, {color: 'red'}).addTo(map);
  map.fitBounds(lerroa.getBounds());
}
//#endregion

// Web scrapper simulatu
async function test(from: string, to: string) {
  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  await sleep(2000);
  return [
    {
      id: 1,
      kokapenak: {
        hasiera: from,
        helmuga: to
      },
      denbora: {
        hasiera: '13:57',
        amaiera: '20:10',
        iraupena: '00:50:00'
      },
      ibilbideak: [
        {
          id: 1,
          mota: IbilbideMota.oinez,
          kokapenak: {
            hasiera: 'Zalla',
            amaiera: 'Zalla'
          },
          denbora: {
            hasiera: '13:57',
            amaiera: '14:00',
            iraupena: '3min'
          }
        },
        {
          id: 2,
          izena: 'Bilbao-Balmaseda',
          helmuga: 'Bilbao',
          mota: IbilbideMota.tren,
          kokapenak: {
            hasiera: 'Zalla',
            amaiera: 'Abando indalecio prieto'
          },
          denbora: {
            hasiera: '14:00',
            amaiera: '14:51',
            iraupena: '51min'
          }
        },
        {
          id: 3,
          mota: IbilbideMota.oinez,
          kokapenak: {
            hasiera: 'Abando indalecio prieto',
            amaiera: 'Zazpikaleak/Casco Viejo'
          },
          denbora: {
            hasiera: '14:51',
            amaiera: '15:55',
            iraupena: '7min'
          }
        },
        {
          id: 4,
          izena: 'E1',
          helmuga: 'Amara donostia',
          mota: IbilbideMota.tren,
          kokapenak: {
            hasiera: 'Zazpikaleak/Casco Viejo',
            amaiera: 'Lugaritz'
          },
          denbora: {
            hasiera: '15:55',
            amaiera: '18:35',
            iraupena: '2h 40min'
          }
        },
        {
          id: 5,
          mota: IbilbideMota.oinez,
          kokapenak: {
            hasiera: 'Lugaritz',
            amaiera: 'Facultad de Informática UPV'
          },
          denbora: {
            hasiera: '18:35',
            amaiera: '28:53',
            iraupena: '18min'
          }
        }
      ]
    },
    {
      id: 2,
      kokapenak: {
        hasiera: from,
        helmuga: to
      },
      denbora: {
        hasiera: '13:57',
        amaiera: '20:10',
        iraupena: '00:20:00'
      },
      ibilbideak: [
        {
          id: 1,
          mota: IbilbideMota.oinez,
          kokapenak: {
            hasiera: 'Zalla',
            amaiera: 'Reinosa'
          },
          denbora: {
            hasiera: '13:57',
            amaiera: '14:00',
            iraupena: '3min'
          }
        },
        {
          id: 2,
          izena: 'Bilbao-Balmaseda',
          helmuga: 'Bilbao',
          mota: IbilbideMota.bus,
          kokapenak: {
            hasiera: 'Reinosa',
            amaiera: 'Vallejo de Orbó'
          },
          denbora: {
            hasiera: '14:00',
            amaiera: '14:51',
            iraupena: '51min'
          }
        }
      ]
    }
  ]
}

//#region Components
function AukerenZerrenda(props: any) {
  const [aukeraData, setAukeraData] = useState<Aukera[]>([]);
  const [ordenazioa, setOrdenazioa] = useState<ordenMota>();
  useEffect(() => {
    // Unai sortutako funtzioarekin aldatu
    test(props.hasiera, props.helmuga).then(aukerak => {
      if (ordenMota.azkarragoa === ordenazioa) {
        aukerak.sort(aukeraKonparatuIraupena);
      } else if (ordenMota.lehenaAilegatzeko === ordenazioa) {
        aukerak.sort(aukeraKonparatuAmaiera);
      }

      aukerak.sort(aukeraKonparatuIraupena);
      
      setAukeraData(aukerak);
    })
  })

  return  <IonContent>
            <IonList id="zerrenda">
              {aukeraData.length > 0 ? (
                aukeraData.map(item => (
                  <IonCard button onClick={() => aukeraIrudikatu(item)} key={item.id}>
                    <IonCardHeader>
                      <IonCardTitle>{item.denbora.hasiera} - {item.denbora.amaiera} ({item.denbora.iraupena})</IonCardTitle>
                      <IonCardSubtitle>{item.ibilbideak.length} garraiobide</IonCardSubtitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonButton onClick={() => {props.setDetails(true); selectedAukera = item}}>
                        Details
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                ))
              ) : (
                <>
                  <IonCard key="1">
                    <IonCardHeader>
                      <IonSkeletonText animated style={{ width: '75%', height: '24px' }} />
                      <IonSkeletonText animated style={{ width: '50%' }} />
                    </IonCardHeader>
                    <IonCardContent>
                      <IonSkeletonText animated style={{ width: '92px', height: '36px' }} />
                    </IonCardContent>
                  </IonCard>
                  <IonCard key="2">
                    <IonCardHeader>
                      <IonSkeletonText animated style={{ width: '75%', height: '24px' }} />
                      <IonSkeletonText animated style={{ width: '50%' }} />
                    </IonCardHeader>
                    <IonCardContent>
                      <IonSkeletonText animated style={{ width: '92px', height: '36px' }} />
                    </IonCardContent>
                  </IonCard>
                  <IonCard key="3">
                    <IonCardHeader>
                      <IonSkeletonText animated style={{ width: '75%', height: '24px' }} />
                      <IonSkeletonText animated style={{ width: '50%' }} />
                    </IonCardHeader>
                    <IonCardContent>
                      <IonSkeletonText animated style={{ width: '92px', height: '36px' }} />
                    </IonCardContent>
                  </IonCard>
                </>
              )}
              
            </IonList>
          </IonContent>
}

function Informazioa(props: any) {
  function mota2icon(mota: IbilbideMota): string {
    switch (mota) {
      case IbilbideMota.bus:
        return busIconSvg;
      case IbilbideMota.tren:
        return trenIconSvg;
      case IbilbideMota.metro:
        return metroIconSvg;
      case IbilbideMota.tranvia:
        return tranviaIconSvg;
      case IbilbideMota.oinez:
        return oinezIconSvg;
      default:
        return busIconSvg;
    }
  }

  return  <IonContent>
            <IonContent>
              <IonList>
                <IonHeader>
                  <IonToolbar>
                    <IonButtons>
                      <IonButton onClick={() => props.setDetails(false)}>
                        <IonIcon slot="start" icon={arrowBack} />
                      </IonButton>
                      <IonLabel>
                        {selectedAukera != undefined && selectedAukera.denbora.hasiera} - {selectedAukera != undefined && selectedAukera.denbora.amaiera} ({selectedAukera != undefined && selectedAukera.denbora.iraupena})
                      </IonLabel>
                    </IonButtons>
                  </IonToolbar>
                </IonHeader>
                {(selectedAukera != undefined && 'ibilbideak' in selectedAukera) && selectedAukera.ibilbideak.map(ib => (
                  <IonCard key={ib.id}>
                    <IonCardHeader>
                      <IonTitle><IonThumbnail><IonImg src={mota2icon(ib.mota)}/></IonThumbnail> {ib.izena} {ib.helmuga}</IonTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      {ib.kokapenak.hasiera} <IonIcon icon={arrowForward}/> {ib.kokapenak.amaiera}<br/>
                      {ib.denbora.hasiera} - {ib.denbora.amaiera} ({ib.denbora.iraupena})
                    </IonCardContent>
                  </IonCard>
                ))}
              </IonList>
            </IonContent>
          </IonContent>
}

function Zutabea(props: any) {
  const [details, setDetails] = useState(false);

  return  <IonContent className="without-scrollbar">
            <IonHeader>
              <h1>
                {props.hasiera}-tik {props.helmuga}-ra
              </h1>
            </IonHeader>
            <IonContent hidden={details}>
              <AukerenZerrenda setDetails={setDetails} hasiera={props.hasiera} helmuga={props.helmuga}/>
            </IonContent>
            <IonContent hidden={!details}>
              <Informazioa setDetails={setDetails}/>
            </IonContent>
          </IonContent>
}

const Emaitza: React.FC = () => {
  const { hasiera, helmuga } = useParams<{ hasiera: string, helmuga: string }>();

  const darkModeEnabled = document.body.classList.contains('dark');
  const toggleDarkModeHandler = (ev: CustomEvent<ToggleChangeEventDetail<any>>) => {
    console.log(ev.detail.checked);
    document.body.classList.toggle("dark", ev.detail.checked);
  };
  
  useEffect(() => {
    map = L.map('map', {
      center: [43.3, -2],
      zoom: 10,
      layers: [
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }),
      ]
    });
    setTimeout(() => { 
      map.invalidateSize(); 
    }, 250);
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonBackButton defaultHref="/hasiera" />
            <IonTitle>Emaitza</IonTitle>
            <IonList>
              <IonItem lines="none">
                <IonIcon
                  slot="start" icon={moon} className="component-icon component-icon-dark" />
                <IonLabel>Dark Mode</IonLabel>
                <IonToggle slot="end" name="darkMode" onIonChange={(event: CustomEvent<ToggleChangeEventDetail<any>>) => toggleDarkModeHandler(event)} checked={darkModeEnabled}/>
              </IonItem>
            </IonList>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid class="all-height">
          <IonRow class="all-height">
            <IonCol size="4">
              <Zutabea hasiera={hasiera} helmuga={helmuga} />
            </IonCol>
            <IonCol size="8">
              <div id="map" className="all-height"></div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
}
//#endregion

export default Emaitza;
