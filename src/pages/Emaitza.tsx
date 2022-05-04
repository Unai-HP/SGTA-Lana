import { IonBackButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonItem, IonLabel, IonList, IonPage, IonRow, IonTitle, IonToolbar, IonIcon, IonToggle, ToggleChangeEventDetail } from '@ionic/react';
import * as L from 'leaflet';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { Aukera, IbilbideMota} from '../models/models';
import { bus, moon } from "ionicons/icons";
import './Emaitza.css';
import 'leaflet/dist/leaflet.css';
import { Zutabea } from '../components/Zutabea';
import { map, setMap } from '../laguntzaileak/Mapa';

// Web scrapper simulatu
export async function test(from: string, to: string) {
  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  await sleep(2000);
  return [
    {
      id: 1,
      denbora: {
        hasiera: '9:52',
        amaiera: '12:16',
        iraupena: '00:02:24'
      },
      xehetasunak: {
        informazioa: '9:52 desde Lusa(1207)',
        ibilbideak: [
          {
            id: 0,
            izena: 'A0651',
            helmuga: 'Bilbao',
            mota: 0,
            kokapenak: {
              hasiera: 'Lusa (1207)',
              amaiera: 'Bilbao Intermodal'
            },
            denbora: {
              hasiera: '9:52',
              amaiera: '10:35',
            }
          },
          {
            id: 1,
            izena: 'DO01',
            helmuga: 'Iñurritza',
            mota: 0,
            kokapenak: {
              hasiera: 'Bilboko Autobus Geltokia',
              amaiera: 'Donostiako Autobus Geltokia'
            },
            denbora: {
              hasiera: '11:00',
              amaiera: '12:16',
            }
          }
        ]
      }
    },
    {
      id: 2,
      denbora: {
        hasiera: '9:52',
        amaiera: '12:26',
        iraupena: '00:02:34'
      },
      xehetasunak: {
        informazioa: '9:52 desde Lusa(1207)',
        ibilbideak: [
          {
            id: 0,
            izena: 'A0651',
            helmuga: 'Bilbao',
            mota: 0,
            kokapenak: {
              hasiera: 'Lusa (1207)',
              amaiera: 'Bilbao Intermodal'
            },
            denbora: {
              hasiera: '9:52',
              amaiera: '10:35',
            }
          },
          {
            id: 1,
            izena: 'ALSA',
            helmuga: 'Irun',
            mota: 0,
            kokapenak: {
              hasiera: 'Bilboko Autobus Geltokia',
              amaiera: 'Estación de Autobuses de San Sebastian'
            },
            denbora: {
              hasiera: '11:00',
              amaiera: '12:20',
            }
          }
        ]
      }
    },
    {
      id: 3,
      denbora: {
        hasiera: '9:36',
        amaiera: '12:16',
        iraupena: '00:02:40'
      },
      xehetasunak: {
        informazioa: '9:36 desde Zalla',
        ibilbideak: [
          {
            id: 0,
            izena: 'Bilbao-Balmaseda',
            helmuga: 'Bilbao',
            mota: 1,
            kokapenak: {
              hasiera: 'Zalla',
              amaiera: 'Basurto'
            },
            denbora: {
              hasiera: '9:36',
              amaiera: '10:20',
            }
          },
          {
            id: 1,
            izena: 'DO01',
            helmuga: 'Irun',
            mota: 0,
            kokapenak: {
              hasiera: 'Bilboko Autobus Geltokia',
              amaiera: 'Donostiako Autobus Geltokia'
            },
            denbora: {
              hasiera: '11:00',
              amaiera: '12:16',
            }
          }
        ]
      }
    }
  ] as Aukera[]
}

const Emaitza: React.FC = () => {
  const { hasiera, helmuga } = useParams<{ hasiera: string, helmuga: string }>();

  const darkModeEnabled = document.body.classList.contains('dark');
  const toggleDarkModeHandler = (ev: CustomEvent<ToggleChangeEventDetail<any>>) => {
    document.body.classList.toggle("dark", ev.detail.checked);
  };
  
  useEffect(() => {
    setMap(L.map('map', {
      center: [43.3, -2],
      zoom: 10,
      layers: [
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }),
      ]
    }));
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