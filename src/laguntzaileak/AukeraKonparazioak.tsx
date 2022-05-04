import moment from "moment";
import { Aukera } from "../models/models";

export function aukeraKonparatuIraupena(a: Aukera, b: Aukera) {
    let aMoment = moment(a.denbora.iraupena, 'dd:hh:mm');
    let bMoment = moment(b.denbora.iraupena, 'dd:hh:mm');
    if (aMoment.isBefore(bMoment)) return -1;
    if (bMoment.isBefore(aMoment)) return 1;
    return 0;
  }
  
export function aukeraKonparatuAmaiera(a: Aukera, b: Aukera) {
    let aMoment = moment(a.denbora.amaiera, 'hh:mm');
    let aMomentH = moment(a.denbora.hasiera, 'hh:mm');
    let bMoment = moment(b.denbora.amaiera, 'hh:mm');
    let bMomentH = moment(b.denbora.hasiera, 'hh:mm');

    if (aMoment.isBefore(aMomentH)) aMoment.add(1, 'days');
    if (bMoment.isBefore(bMomentH)) bMoment.add(1, 'days');

    if (aMoment.isBefore(bMoment)) return -1;
    if (bMoment.isBefore(aMoment)) return 1;
    return 0;
}