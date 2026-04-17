const axios = require('axios');

async function test() {
  try {
    const loginResp = await axios.post('http://localhost:8000/api/usuarios/login', {
      email: 'smoke_admin@example.com',
      'contraseña': 'adminpassword'
    });
    const token = loginResp.data.access_token;
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
    
    const initialItems = await axios.get('http://localhost:8000/api/items', authHeaders);
    const ic = initialItems.data.length;

    const pResp = await axios.post('http://localhost:8000/api/pilotos', { nombre: 'P' }, authHeaders);
    const pid = pResp.data.id;

    const mResp = await axios.post('http://localhost:8000/api/motocicletas', {
      modelo: 'M',
      piloto_id: pid,
      trabajos_reparacion: ['Cambio de bomba', 'Ajuste electrico'],
      servicio_ids: []
    }, authHeaders);
    const mid = mResp.data.id;

    const finalItems = await axios.get('http://localhost:8000/api/items', authHeaders);
    const fc = finalItems.data.length;

    const eResp = await axios.get('http://localhost:8000/api/estados', authHeaders);
    const names = eResp.data
      .filter(e => e.motocicleta_id === mid)
      .map(e => e.nombre);

    console.log(`IC: ${ic}, FC: ${fc}, Names: ${names.join(', ')}`);
    if (ic === fc && names.includes('Cambio de bomba') && names.includes('Ajuste electrico')) {
      console.log('PASS');
    } else {
      console.log('FAIL');
    }
  } catch (err) {
    if (err.response && err.response.status === 401 && err.config.url.endsWith('/login')) {
       // Try without the special char just in case
        try {
            const loginResp = await axios.post('http://localhost:8000/api/usuarios/login', {
                email: 'smoke_admin@example.com',
                'password': 'adminpassword'
            });
            // recursive simple call if needed or just handle here. Let's just log and fail for now.
        } catch (e2) {
             console.error(err.response ? err.response.data : err.message);
             process.exit(1);
        }
    }
    console.error(err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

test();
