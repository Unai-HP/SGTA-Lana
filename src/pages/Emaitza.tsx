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
  return JSON.parse('[{"id":"e4cdaf0cf4437","pref":"Bus","iterazioak":[{"img":"Bus","text":"A0651"}],"denbora":{"hasiera":"09:35","amaiera":"10:01","iraupena":"26 min"},"xehetasunak":{"informazioa":" 9:35 AM from Bilbao Intermodal ","ibilbideak":[{"id":0,"izena":"A0651","helmuga":"Balmaseda","enpresa":"BizkaiBus","mota":0,"kokapenak":{"hasiera":"Bilbao Intermodal","amaiera":"Sodupe (Geltokia/estación) (1197)"},"denbora":{"hasiera":"09:35","amaiera":"10:01"}}]}},{"id":"fcc8c1db63a97","pref":"Bus","iterazioak":[{"img":"Bus","text":"A3342"}],"denbora":{"hasiera":"09:30","amaiera":"10:03","iraupena":"33 min"},"xehetasunak":{"informazioa":" 9:30 AM from Bilbao Intermodal ","ibilbideak":[{"id":0,"izena":"A3342","helmuga":"Artziniega","enpresa":"","mota":0,"kokapenak":{"hasiera":"Bilbao Intermodal","amaiera":"Sodupe (Herriko Enparantza) (1531)"},"denbora":{"hasiera":"09:30","amaiera":"10:02"}}]}},{"id":"105d5d8ef003e4","pref":"Bus","iterazioak":[{"img":"Bus","text":"A3341"}],"denbora":{"hasiera":"10:00","amaiera":"10:48","iraupena":"48 min"},"xehetasunak":{"informazioa":" 10:00 AM from Bilbao Intermodal ","ibilbideak":[{"id":0,"izena":"A3343","helmuga":"Gordexola","enpresa":"BizkaiBus","mota":0,"kokapenak":{"hasiera":"Bilbao Intermodal","amaiera":"Sodupe (Herriko Enparantza) (1531)"},"denbora":{"hasiera":"10:00","amaiera":"10:48"}}]}},{"id":"9bd7b1029a43e","pref":"Train","iterazioak":[{"img":"Train","text":"Bilbao-Balmaseda"}],"denbora":{"hasiera":"09:52","amaiera":"10:24","iraupena":"32 min"},"xehetasunak":{"informazioa":" 9:52 AM from Bilbao-Abando station ","ibilbideak":[{"id":0,"izena":"Bilbao-Balmaseda","helmuga":"La Calzada","enpresa":"RENFE RAM","mota":1,"kokapenak":{"hasiera":"Bilbao-Abando station","amaiera":"Sodupe"},"denbora":{"hasiera":"09:52","amaiera":"10:24"}}]}}]')
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