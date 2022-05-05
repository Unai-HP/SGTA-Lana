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
  return JSON.parse('[{"id":"c4682ec6f141a","pref":"Bus","iterazioak":[{"img":"Bus","text":"A0651"}],"denbora":{"hasiera":"13:31","amaiera":"13:46","iraupena":"15 min"},"xehetasunak":{"informazioa":" 1:31 PM from Sodupe (Geltokia/estación) (1197) ","ibilbideak":[{"id":0,"izena":"A0651","helmuga":"Balmaseda","enpresa":"BizkaiBus","mota":0,"kokapenak":{"hasiera":"Sodupe (Geltokia/estación) (1197)","amaiera":"Lusa (1206)"},"denbora":{"hasiera":"13:31","amaiera":"13:46"}}]}},{"id":"5e22b142ac0dd8","pref":"Train","iterazioak":[{"img":"Train","text":"Santander-Bilbao"},{"img":"Walk","text":""}],"denbora":{"hasiera":"13:26","amaiera":"13:41","iraupena":"15 min"},"xehetasunak":{"informazioa":" 1:26 PM from Sodupe ","ibilbideak":[{"id":0,"izena":"Santander-Bilbao","helmuga":"Santander","enpresa":"","mota":1,"kokapenak":{"hasiera":"Sodupe","amaiera":"Mimetiz"},"denbora":{"hasiera":"13:26","amaiera":"13:36"}}]}},{"id":"d559558636c1d","pref":"Tram","iterazioak":[{"img":"Train","text":"Bilbao-Balmaseda"}],"denbora":{"hasiera":"14:16","amaiera":"14:31","iraupena":"15 min"},"xehetasunak":{"informazioa":" 2:16 PM from Sodupe ","ibilbideak":[{"id":0,"izena":"Bilbao-Balmaseda","helmuga":"La Calzada","enpresa":"RENFE RAM","mota":1,"kokapenak":{"hasiera":"Sodupe","amaiera":"Zalla"},"denbora":{"hasiera":"14:16","amaiera":"14:31"}}]}},{"id":"0126dad0529cdd5","pref":"Tram","iterazioak":[{"img":"Bus","text":"A0654"}],"denbora":{"hasiera":"14:45","amaiera":"15:01","iraupena":"16 min"},"xehetasunak":{"informazioa":" 2:45 PM from Sodupe (Geltokia/estación) (1197) ","ibilbideak":[{"id":0,"izena":"A0654","helmuga":"Balmaseda","enpresa":"BizkaiBus","mota":0,"kokapenak":{"hasiera":"Sodupe (Geltokia/estación) (1197)","amaiera":"Lusa (1207)"},"denbora":{"hasiera":"14:45","amaiera":"15:01"}}]}}]')
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