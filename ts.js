const axios = require("axios");

async function test() {
  const loginResp = await axios.post("http://localhost:8000/api/usuarios/login", {
    email: "smoke_admin@example.com",
    "contrase\u00f1a": "adminpassword"
  });
  const token = loginResp.data.access_token;
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  const ic = (await axios.get("http://localhost:8000/api/items", authHeaders)).data.length;
  const pid = (await axios.post("http://localhost:8000/api/pilotos", { nombre: "P" }, authHeaders)).data.id;
  const mResp = await axios.post("http://localhost:8000/api/motocicletas", {
    modelo: "M", piloto_id: pid, trabajos_reparacion: ["Cambio de bomba", "Ajuste electrico"], servicio_ids: []
  }, authHeaders);
  const mid = mResp.data.id;
  const fc = (await axios.get("http://localhost:8000/api/items", authHeaders)).data.length;
  const names = (await axios.get("http://localhost:8000/api/estados", authHeaders)).data
    .filter(e => e.motocicleta_id === mid).map(e => e.nombre);
  console.log(`IC: ${ic}, FC: ${fc}, Names: ${names.join(", ")}`);
  console.log(ic === fc && names.includes("Cambio de bomba") && names.includes("Ajuste electrico") ? "PASS" : "FAIL");
}

test().catch(err => {
  console.log(err.response ? err.response.data : err.message);
});