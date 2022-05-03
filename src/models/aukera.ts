import moment from "moment"

export interface Aukera {
    id: number, // Barne identifikazioa
    kokapenak: { // Bilaketaren hasiera eta amaiera kokapenak
        hasiera: string,
        helmuga: string
    },
    denbora: Denbora,
    informazioa?: string, // Adibidez, "18:52 desde Mimetiz"
    ibilbideak: Ibilbidea[] // Garraiobideak
}

export interface Ibilbidea {
    id: number, // Barne identifikazioa
    izena?: string, 
    helmuga?: string, // Linearen helmuga
    mota: IbilbideMota,
    kokapenak: { // Bilaketaren hasiera eta amaiera kokapenak
        hasiera: string,
        amaiera: string
    },
    denbora: Denbora
}

export interface Lekua {
    izena: string,
    koord?: Koordenatuak
}

export interface Koordenatuak {
    lat: number,
    lng: number
}

export interface Denbora {
    hasiera: string, // Hasiera ordua (hh:mm)
    amaiera: string, // Amaiera ordua (hh:mm)
    iraupena: string // Iraupena (dd:hh:mm)
}

export enum IbilbideMota {
    bus,
    tren,
    metro,
    tranvia,
    oinez
}

export enum ordenMota {
    azkarragoa,
    lehenaAilegatzeko
} 

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
  
