import { IonContent, IonHeader, IonLabel, IonRadioGroup, IonRadio } from '@ionic/react';
import { useState } from 'react';
import { Aukera, ordenMota } from '../models/models';
import { AukerenZerrenda } from './AukerenZerrenda';
import { Informazioa } from './Informazioa';

export function Zutabea(props: any) {
  const [details, setDetails] = useState(false);
  const [ordenazioa, setOrdenazioa] = useState<ordenMota>();
  const [selectedAukera, setSelectedAukera] = useState<Aukera>();

  return <IonContent>
    <IonContent hidden={details} slot="fixed" style={{position: "bottom"}}>
      <IonHeader>
        <h1>
          {props.hasiera}-{'(e)'}tik {props.helmuga}-{'(e)'}ra
        </h1><br />
        <IonRadioGroup value={ordenazioa} onIonChange={(e) => setOrdenazioa(e.detail.value)}>
          <IonLabel>Ordenazioa:</IonLabel><br/>
          <IonLabel>
            <IonRadio value={ordenMota.lehenaAilegatzeko}/>
            Lehena
          </IonLabel>
          &nbsp;
          <IonLabel>
            <IonRadio value={ordenMota.azkarragoa}/>
            Azkarragoa
          </IonLabel>
        </IonRadioGroup>
      </IonHeader>
      <AukerenZerrenda setDetails={setDetails} hasiera={props.hasiera} helmuga={props.helmuga} ordenazioa={ordenazioa} setSelectedAukera={setSelectedAukera} />
    </IonContent>
    <IonContent hidden={!details} slot="fixed" style={{position: "bottom"}}>
      <Informazioa setDetails={setDetails} selectedAukera={selectedAukera} />
    </IonContent>
  </IonContent>;
}
