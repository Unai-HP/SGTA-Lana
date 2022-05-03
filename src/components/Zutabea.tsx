import { IonContent, IonHeader, IonLabel, IonRadioGroup, IonRadio } from '@ionic/react';
import { useState } from 'react';
import { Aukera, ordenMota } from '../models/aukera';
import { AukerenZerrenda } from './AukerenZerrenda';
import { Informazioa } from './Informazioa';

export function Zutabea(props: any) {
  const [details, setDetails] = useState(false);
  const [ordenazioa, setOrdenazioa] = useState<ordenMota>();
  const [selectedAukera, setSelectedAukera] = useState<Aukera>();

  return <IonContent className="without-scrollbar">
    <IonHeader>
      <h1>
        {props.hasiera}-tik {props.helmuga}-ra
      </h1><br />
      <IonRadioGroup value={ordenazioa} onIonChange={(e) => setOrdenazioa(e.detail.value)}>
        <IonLabel>
          <IonRadio value={ordenMota.lehenaAilegatzeko} />
          Lehena
        </IonLabel>
        <IonLabel>
          <IonRadio value={ordenMota.azkarragoa} />
          Azkarragoa
        </IonLabel>
      </IonRadioGroup>
    </IonHeader>
    <IonContent hidden={details}>
      <AukerenZerrenda setDetails={setDetails} hasiera={props.hasiera} helmuga={props.helmuga} ordenazioa={ordenazioa} setSelectedAukera={setSelectedAukera} />
    </IonContent>
    <IonContent hidden={!details}>
      <Informazioa setDetails={setDetails} selectedAukera={selectedAukera} />
    </IonContent>
  </IonContent>;
}
