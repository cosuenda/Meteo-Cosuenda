const APP_KEY = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const API_KEY = "adf65434-1ace-43dd-b9a9-27915843d243";
const MAC = "84:CC:A8:B4:B1:F6";

const rssUrl = "https://api.allorigins.win/raw?url=" +
encodeURIComponent("https://www.meteoclimatic.net/feed/rss/ESARA5000000050409A");

async function obtenerDatos(){
  try{
    const response = await fetch(rssUrl);
    const xmlText = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText,"application/xml");

    const description = xmlDoc.querySelector("description")?.textContent || "";
    const pubDate = xmlDoc.querySelector("pubDate")?.textContent || "";

    function extraer(valor){
      const match = description.match(new RegExp(valor + ":\\s*([-\\d\\.]+)"));
      return match ? match[1] : "--";
    }

    document.getElementById("temp").textContent  = extraer("Temperatura") + " °C";
    document.getElementById("hum").textContent   = extraer("Humedad") + " %";
    document.getElementById("wind").textContent  = extraer("Viento") + " km/h";
    document.getElementById("rain").textContent  = extraer("Lluvia") + " mm";
    document.getElementById("press").textContent = extraer("Presión") + " hPa";
    document.getElementById("update").textContent = "Última actualización: " + pubDate;

  }catch(error){
    console.error("Error cargando datos:",error);
  }
}
























