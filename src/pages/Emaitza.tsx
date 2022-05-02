import { IonBackButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonItem, IonLabel, IonList, IonPage, IonRow, IonTitle, IonToolbar, IonIcon, IonToggle, ToggleChangeEventDetail } from '@ionic/react';
import * as L from 'leaflet';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { IbilbideMota} from '../models/aukera';
import { moon } from "ionicons/icons";
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
      kokapenak: {
        hasiera: from,
        helmuga: to
      },
      denbora: {
        hasiera: '13:57',
        amaiera: '20:10',
        iraupena: '00:00:50'
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
        amaiera: '19:10',
        iraupena: '00:03:20'
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
    },
    {
      id: 3,
      kokapenak: {
        hasiera: from,
        helmuga: to
      },
      denbora: {
        hasiera: '13:57',
        amaiera: '20:50',
        iraupena: '00:02:20'
      },
      ibilbideak: [
        {
          id: 1,
          izena: 'Bilbao-Balmaseda',
          helmuga: 'Bilbao',
          mota: IbilbideMota.bus,
          kokapenak: {
            hasiera: 'Bilbao',
            amaiera: 'Madrid'
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