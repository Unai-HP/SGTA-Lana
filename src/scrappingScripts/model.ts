import { Duration } from 'moment';

export interface Aukera {
    id: number; // Identifikazioa
    hasiera: string; // Hasiera lekua
    amaiera: string; // Amaiera lekua
    denbora: {
        hasiera: string; // Hasiera ordua
        amaiera: string; // Amaiera ordua
        iraupena: Duration; // Iraupena ddhhmmss
    };
    details: string; // Aukeraren xehetasunak
    informazioa?: string; // Adibidez, "18:52 desde Mimetiz"
    garraiobideak: Garraiobidea[]; // Garraiobideak
}

interface Garraiobidea {
    id: number; // Identifikazioa (barnekoa)
    izena: string;
    helmuga: string; // Linearen helmuga
    mota: GarraioMota;

    hasiera: string; // Hasiera lekua
    amaiera: string; // Amaiera lekua
    denbora: {
        hasiera: string;
        amaiera: string;
    };
}

enum GarraioMota {
    Bus,
    Train,
    Subway,
    Tram
}