import { IonBackButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonItem, IonLabel, IonList, IonPage, IonRow, IonTitle, IonToolbar, IonIcon, IonToggle, ToggleChangeEventDetail } from '@ionic/react';
import * as L from 'leaflet';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { IbilbideMota} from '../models/models';
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