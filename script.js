const stationCode = "ESARA5000000050409A";

const rssUrl = "https://api.allorigins.win/raw?url=" + 
  encodeURIComponent("https://www.meteoclimatic.net/feed/rss_es.xml");

async function obtenerDatos() {
  try {
    const response = await fetch(rssUrl);
    const xmlText = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");

    const items = Array.from(xmlDoc.querySelectorAll("item"));

    const miEstacion = items.find(item => {
      const link = item.querySelector("link")?.textContent || "";
      return link.includes(stationCode);
    });

    if (!miEstacion) {
      console.log("Estación no encontrada en RSS");
      return;
    }

    const description = miEstacion.querySelector("description")?.textContent || "";
    const pubDate = miEstacion.querySelector("pubDate")?.textContent || "";

    function extraer(valor) {
      const match = description.match(new RegExp(valor + ":\\s*([-\\d\\.]+)"));
      return match ? match[1] : "--";
    }

    document.getElementById("temp").textContent = extraer("Temperatura") + " °C";
    document.getElementById("hum").textContent = extraer("Humedad") + " %";
    document.getElementById("wind").textContent = extraer("Viento") + " km/h";
    document.getElementById("press").textContent = extraer("Presión") + " hPa";
    document.getElementById("update").textContent = pubDate;

  } catch (error) {
    console.error("Error cargando RSS:", error);
  }
}

obtenerDatos();
setInterval(obtenerDatos, 600000);
