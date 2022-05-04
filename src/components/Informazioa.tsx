import { IonButtons, IonCard, IonCardHeader, IonContent, IonHeader, IonLabel, IonList, IonTitle, IonToolbar, IonIcon, IonButton, IonCardContent, IonImg, IonThumbnail } from '@ionic/react';
import busIconSvg from '../img/bus.svg';
import trenIconSvg from '../img/tren.svg';
import metroIconSvg from '../img/metro.svg';
import tranviaIconSvg from '../img/tranvia.svg';
import oinezIconSvg from '../img/oinez.svg';
import { IbilbideMota, Ibilbidea } from '../models/models';
import { arrowBack, arrowForward } from "ionicons/icons";

export function Informazioa(props: any) {
  function mota2icon(mota: IbilbideMota): string {
    switch (mota) {
      case IbilbideMota.bus:
        return busIconSvg;
      case IbilbideMota.tren:
        return trenIconSvg;
      case IbilbideMota.metro:
        return metroIconSvg;
      case IbilbideMota.tranvia:
        return tranviaIconSvg;
      case IbilbideMota.oinez:
        return oinezIconSvg;
      default:
        return busIconSvg;
    }
  }

  return <IonContent>
    <IonContent>
      <IonList>
        <IonHeader>
          <IonToolbar>
            <IonButtons>
              <IonButton onClick={() => props.setDetails(false)}>
                <IonIcon slot="start" icon={arrowBack} />
              </IonButton>
              <IonLabel>
                {props.selectedAukera != undefined && props.selectedAukera.denbora.hasiera} - {props.selectedAukera != undefined && props.selectedAukera.denbora.amaiera} ({props.selectedAukera != undefined && props.selectedAukera.denbora.iraupena})
              </IonLabel>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        {(props.selectedAukera != undefined && 'ibilbideak' in props.selectedAukera.xehetasunak) && props.selectedAukera.xehetasunak.ibilbideak.map((ib: Ibilbidea) => (
          <IonCard key={ib.id}>
            <IonCardHeader>
              <IonTitle><IonThumbnail><IonImg src={mota2icon(ib.mota)} /></IonThumbnail> {ib.izena} {ib.helmuga}</IonTitle>
            </IonCardHeader>
            <IonCardContent>
              {ib.kokapenak.hasiera} <IonIcon icon={arrowForward} /> {ib.kokapenak.amaiera}<br />
              {ib.denbora.hasiera} - {ib.denbora.amaiera}
            </IonCardContent>
          </IonCard>
        ))}
      </IonList>
    </IonContent>
  </IonContent>;
}
