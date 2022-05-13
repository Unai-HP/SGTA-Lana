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

// TODO Ezabatu bidali baino lehen
export async function test(from: string, to: string) {
  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  await sleep(2000);
  return JSON.parse('[{"id":"b6af1e054b67e","pref":"Bus","iterazioak":[{"img":"Bus","text":"FlixBus"},{"img":"Walk","text":""},{"img":"Bus","text":"24"}],"denbora":{"hasiera":"20:30","amaiera":"08:24","iraupena":"00:11:00"},"xehetasunak":{"informazioa":" 8:30 PM from Bilbao (Bus Station) ","ibilbideak":[{"id":0,"izena":"FlixBus","helmuga":"Paris (Bercy Seine)","enpresa":"","mota":0,"kokapenak":{"hasiera":"Bilbao (Bus Station)","amaiera":"Paris (Bercy Seine)"},"denbora":{"hasiera":"20:30","amaiera":"08:00"}},{"id":2,"izena":"24","helmuga":"Pantheon","enpresa":"","mota":0,"kokapenak":{"hasiera":"Lachambeaudie","amaiera":"Bercy - Aréna"},"denbora":{"hasiera":"08:22","amaiera":"08:24"}}]}},{"id":"3a8661367d1bf","pref":"Train","iterazioak":[{"img":"Walk","text":""},{"img":"Subway","text":"Línea De Metro Bilbao"},{"img":"Train","text":"E1"},{"img":"Train","text":"E2"},{"img":"Train","text":"TER"},{"img":"Train","text":"TGV"},{"img":"Subway","text":"4"},{"img":"Walk","text":""},{"img":"Train","text":"B"}],"denbora":{"hasiera":"19:41","amaiera":"11:29","iraupena":"00:15:00"},"xehetasunak":{"informazioa":" 7:53 PM from Abando ","ibilbideak":[{"id":1,"izena":"Línea De Metro Bilbao","helmuga":"Basauri","enpresa":"","mota":3,"kokapenak":{"hasiera":"Abando","amaiera":"Casco Viejo"},"denbora":{"hasiera":"19:53","amaiera":"19:54"}},{"id":3,"izena":"E1","helmuga":"Amara-donostia","enpresa":"","mota":1,"kokapenak":{"hasiera":"Casco Viejo","amaiera":""},"denbora":{"hasiera":"19:58","amaiera":"22:35"}},{"id":4,"izena":"E2","helmuga":"Hendaia","enpresa":"","mota":1,"kokapenak":{"hasiera":"Lugaritz","amaiera":""},"denbora":{"hasiera":"22:39","amaiera":"23:22"}},{"id":5,"izena":"TER","helmuga":"Bordeaux Saint-Jean","enpresa":"","mota":1,"kokapenak":{"hasiera":"Gare de Hendaye","amaiera":""},"denbora":{"hasiera":"05:46","amaiera":"08:32"}},{"id":6,"izena":"TGV","helmuga":"Paris Montparnasse Hall 1 - 2","enpresa":"","mota":1,"kokapenak":{"hasiera":"Bordeaux Saint-Jean","amaiera":"Montparnasse"},"denbora":{"hasiera":"08:44","amaiera":"10:52"}},{"id":8,"izena":"4","helmuga":"Bagneux - Lucie Aubrac","enpresa":"","mota":3,"kokapenak":{"hasiera":"Montparnasse","amaiera":"Denfert-Rochereau"},"denbora":{"hasiera":"11:07","amaiera":"11:10"}},{"id":10,"izena":"B","helmuga":"Aéroport CDG - Terminal 2 (Tgv)","enpresa":"","mota":1,"kokapenak":{"hasiera":"Denfert-Rochereau","amaiera":"Gare du Nord"},"denbora":{"hasiera":"11:19","amaiera":"11:29"}}]}},{"id":"77fa0849b2e2b4","pref":"Train","iterazioak":[{"img":"Walk","text":""},{"img":"Subway","text":"Línea De Metro Bilbao"},{"img":"Train","text":"E1"},{"img":"Train","text":"E2"},{"img":"Train","text":"TER"},{"img":"Train","text":"TGV"},{"img":"Subway","text":"6"},{"img":"Walk","text":""},{"img":"Train","text":"B"}],"denbora":{"hasiera":"19:41","amaiera":"11:26","iraupena":"00:15:00"},"xehetasunak":{"informazioa":" 7:53 PM from Abando ","ibilbideak":[{"id":1,"izena":"Línea De Metro Bilbao","helmuga":"Basauri","enpresa":"","mota":3,"kokapenak":{"hasiera":"Abando","amaiera":"Casco Viejo"},"denbora":{"hasiera":"19:53","amaiera":"19:54"}},{"id":3,"izena":"E1","helmuga":"Amara-donostia","enpresa":"","mota":1,"kokapenak":{"hasiera":"Casco Viejo","amaiera":""},"denbora":{"hasiera":"19:58","amaiera":"22:35"}},{"id":4,"izena":"E2","helmuga":"Hendaia","enpresa":"","mota":1,"kokapenak":{"hasiera":"Lugaritz","amaiera":""},"denbora":{"hasiera":"22:39","amaiera":"23:22"}},{"id":5,"izena":"TER","helmuga":"Bordeaux Saint-Jean","enpresa":"","mota":1,"kokapenak":{"hasiera":"Gare de Hendaye","amaiera":""},"denbora":{"hasiera":"05:46","amaiera":"08:32"}},{"id":6,"izena":"TGV","helmuga":"Paris Montparnasse Hall 1 - 2","enpresa":"","mota":1,"kokapenak":{"hasiera":"Bordeaux Saint-Jean","amaiera":"Montparnasse"},"denbora":{"hasiera":"08:44","amaiera":"10:52"}},{"id":8,"izena":"6","helmuga":"Nation","enpresa":"","mota":3,"kokapenak":{"hasiera":"Montparnasse","amaiera":"Denfert-Rochereau"},"denbora":{"hasiera":"11:01","amaiera":"11:05"}},{"id":10,"izena":"B","helmuga":"Aéroport CDG - Terminal 2 (Tgv)","enpresa":"","mota":1,"kokapenak":{"hasiera":"Denfert-Rochereau","amaiera":"Gare du Nord"},"denbora":{"hasiera":"11:16","amaiera":"11:26"}}]}}]')
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