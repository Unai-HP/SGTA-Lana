import { Lekua, Koordenatuak } from '../models/models';

export function getLekuarenKoordenatuak(lekua: string): Koordenatuak | undefined {
  let result: Koordenatuak | undefined = undefined;

  checkLocalStorage();

  let datuak: Lekua[] = JSON.parse(localStorage.getItem('lekuak')!) as Lekua[];
  if (datuak.find(d => d.izena === lekua)) {
    result = datuak.find(d => d.izena === lekua)!.koord;
  }
  return result;
}

export function setLekuarenKoordenatuak(lekua: string, koordenatuak: Koordenatuak) {

  checkLocalStorage();

  let datuak: Lekua[] = JSON.parse(localStorage.getItem('lekuak')!) as Lekua[];
  if (!datuak.find(d => d.izena === lekua)) {
    datuak.push({ izena: lekua, koord: koordenatuak });
    localStorage.setItem('lekuak', JSON.stringify(datuak));
  }
}
function checkLocalStorage() {
  if (!localStorage.getItem('lekuak')) {
    localStorage.setItem('lekuak', JSON.stringify([]));
  }
}
