export interface Aukera {
    id: number; // Barne identifikazioa
    kokapenak: { // Bilaketaren hasiera eta amaiera kokapenak
        hasiera: string,
        helmuga: string
    },
    denbora: {
        hasiera: string; // Hasiera ordua (hh:mm)
        amaiera: string; // Amaiera ordua (hh:mm)
        iraupena: string; // Iraupena (dd:hh:mm)
    };
    informazioa?: string; // Adibidez, "18:52 desde Mimetiz"
    ibilbideak: Ibilbidea[]; // Garraiobideak
}

export interface Ibilbidea {
    id: number; // Barne identifikazioa
    izena?: string; 
    helmuga?: string; // Linearen helmuga
    mota: IbilbideMota;
    kokapenak: { // Bilaketaren hasiera eta amaiera kokapenak
        hasiera: string,
        amaiera: string
    },
    denbora: {
        hasiera: string; // Hasiera ordua (hh:mm)
        amaiera: string; // Amaiera ordua (hh:mm)
        iraupena: string; // Iraupena (dd:hh:mm)
    };
}

export interface Lekua {
    izena: string;
    koord?: Koordenatuak
}

export interface Koordenatuak {
    lat: number,
    lng: number
}

export enum IbilbideMota {
    bus,
    tren,
    metro,
    tranvia,
    oinez
}