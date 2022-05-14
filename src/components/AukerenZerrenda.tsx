import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonList, IonButton, IonCardContent, IonSkeletonText } from '@ionic/react';
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
      }
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

  useEffect(() => {
    aukerakOrdenatu();
  }, [props.ordenazioa]);

  return <IonContent>
    <IonList id="zerrenda">
      {aukeraData.length > 0 ? (
        aukeraData.map(item => (
          <IonCard button onClick={() => aukeraIrudikatu(item)} key={item.id}>
            <IonCardHeader>
              <IonCardTitle>{item.denbora.hasiera} - {item.denbora.amaiera} ({moment(item.denbora.iraupena, 'dd:hh:mm').format('HH[h] mm[min]')})</IonCardTitle>
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
  </IonContent>;
}
