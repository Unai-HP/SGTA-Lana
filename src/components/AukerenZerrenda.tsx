import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonList, IonButton, IonCardContent, IonSkeletonText, IonAlert, useIonAlert } from '@ionic/react';
import { useEffect, useState } from 'react';
import { Aukera, ordenMota } from '../models/models';
import moment from 'moment';
import { test } from '../pages/Emaitza';
import { aukeraIrudikatu } from "../laguntzaileak/Mapa";
import { aukeraKonparatuAmaiera, aukeraKonparatuIraupena } from '../laguntzaileak/AukeraKonparazioak';
import $ from "jquery";


//#region Components
export function AukerenZerrenda(props: any) {
  const [aukeraData, setAukeraData] = useState<Aukera[]>([]);
  const [kargatzen, setKargatzen] = useState(true);
  const [present] = useIonAlert();

  useEffect(() => {
    /* test(props.hasiera, props.helmuga).then(aukerak => {
      setAukeraData(aukerak);
    }); */


    var xhr = new XMLHttpRequest();
    console.log(props.hasiera);
    $.ajax({
      async: true,
      url: 'http://localhost:8080/FullData?origin='+encodeURIComponent(props.hasiera)+'&destination='+encodeURIComponent(props.helmuga),
      contentType: 'json',
      xhr: function() {
        return xhr;
      },
      success: function() {
        let erantzuna = JSON.parse(xhr.response);
        console.log(erantzuna);
        setAukeraData(erantzuna);
        setKargatzen(false);
      },
      error: function() {
        present({
          header: 'Errorea',
          message: 'Ezin izan da informazioa lortu, berriro saiatu. Errorea: ' + xhr.status + ' (' + xhr.statusText + ')',
          buttons: [
            { text: 'Ok' }
          ]
        })
        setKargatzen(false);
      },
      timeout: 300000
  	})
  }, []);

  function aukerakOrdenatu() {
    let tmp: Aukera[] = aukeraData.map(x => x);
    if (tmp.length > 1) {
      if (ordenMota.azkarragoa === props.ordenazioa) {
        console.log(tmp);
        setAukeraData(tmp.sort(aukeraKonparatuIraupena));
        console.log(tmp);
        console.log(aukeraData);
      } else if (ordenMota.lehenaAilegatzeko === props.ordenazioa) {
        setAukeraData(tmp.sort(aukeraKonparatuAmaiera));
      }
    }
  }

  function iraupenaInprimatu(iraupena: string) {
    let iraupenaRegex = /(?<d>[0-9]{2}):(?<h>[0-9]{2}):(?<m>[0-9]{2})/g
    let iraupenaMatch = iraupenaRegex.exec(iraupena);

    let egunak = '? egun';
    let orduak = '? ordu';
    let minutuak = '? min';

    if (iraupenaMatch !== null) {
      egunak = (iraupenaMatch.groups!.d === '00') ? '' : iraupenaMatch.groups!.d + ' egun ';
      orduak = (iraupenaMatch.groups!.h === '00') ? '' : iraupenaMatch.groups!.h + ' ordu ';
      minutuak = (iraupenaMatch.groups!.d !== '00' || iraupenaMatch.groups!.d !== '00') ? '' : iraupenaMatch.groups!.m + ' min';

      egunak = (egunak[0] === '0') ? egunak.substring(1) : egunak;
      orduak = (orduak[0] === '0') ? orduak.substring(1) : orduak;
      minutuak = (minutuak[0] === '0') ? minutuak.substring(1) : minutuak;
    }

    return egunak + orduak + minutuak;
  }

  useEffect(() => {
    aukerakOrdenatu();
  }, [props.ordenazioa]);

  return <IonContent>
    <IonList id="zerrenda">
      {aukeraData.length > 0 ? (
        aukeraData.map(item => (
          <IonCard button onClick={() => aukeraIrudikatu(item)} key={item.id}>
            <IonCardHeader>
              <IonCardTitle>{item.denbora.hasiera} - {item.denbora.amaiera} ({iraupenaInprimatu(item.denbora.iraupena!)})</IonCardTitle>
              <IonCardSubtitle>{item.xehetasunak.ibilbideak.length} garraiobide</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <IonButton onClick={() => { props.setDetails(true); props.setSelectedAukera(item); }}>
                Xehetasunak
              </IonButton>
            </IonCardContent>
          </IonCard>
        ))
      ) : (
        <>
          <IonCard key="1">
            <IonCardHeader>
              <IonSkeletonText animated={kargatzen} style={{ width: '75%', height: '24px' }} />
              <IonSkeletonText animated={kargatzen} style={{ width: '50%' }} />
            </IonCardHeader>
            <IonCardContent>
              <IonSkeletonText animated={kargatzen} style={{ width: '92px', height: '36px' }} />
            </IonCardContent>
          </IonCard>
          <IonCard key="2">
            <IonCardHeader>
              <IonSkeletonText animated={kargatzen} style={{ width: '75%', height: '24px' }} />
              <IonSkeletonText animated={kargatzen} style={{ width: '50%' }} />
            </IonCardHeader>
            <IonCardContent>
              <IonSkeletonText animated={kargatzen} style={{ width: '92px', height: '36px' }} />
            </IonCardContent>
          </IonCard>
          <IonCard key="3">
            <IonCardHeader>
              <IonSkeletonText animated={kargatzen} style={{ width: '75%', height: '24px' }} />
              <IonSkeletonText animated={kargatzen} style={{ width: '50%' }} />
            </IonCardHeader>
            <IonCardContent>
              <IonSkeletonText animated={kargatzen} style={{ width: '92px', height: '36px' }} />
            </IonCardContent>
          </IonCard>
        </>
      )}

    </IonList>
  </IonContent>;
}
