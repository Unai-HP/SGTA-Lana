import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonList, IonButton, IonCardContent, IonSkeletonText } from '@ionic/react';
import { useEffect, useState } from 'react';
import { Aukera, ordenMota, aukeraKonparatuIraupena, aukeraKonparatuAmaiera } from '../models/aukera';
import moment from 'moment';
import { test } from '../pages/Emaitza';
import { aukeraIrudikatu } from "../laguntzaileak/Mapa";

//#region Components
export function AukerenZerrenda(props: any) {
  const [aukeraData, setAukeraData] = useState<Aukera[]>([]);

  useEffect(() => {
    // Unai sortutako funtzioarekin aldatu
    test(props.hasiera, props.helmuga).then(aukerak => {
      setAukeraData(aukerak);
    });
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
              <IonCardSubtitle>{item.ibilbideak.length} garraiobide</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <IonButton onClick={() => { props.setDetails(true); props.setSelectedAukera(item); }}>
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
  </IonContent>;
}
