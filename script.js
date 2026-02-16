const appKey = "26C4D6AD21CF8F8C4F3BA85E1CAF6701";
const apiKey = "adf65434-1ace-43dd-b9a9-27915843d243";
const mac = "84:CC:A8:B4:B1:F6";

const url = `https://api.ecowitt.net/api/v3/device/real_time=${appKey}&api_key=${apiKey}&mac=${mac}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log(data); // aquí aparecen tus datos
  });


