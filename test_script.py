import requests

url = "http://localhost:8000/api/usuarios/login"
payload = {
    "email": "smoke_admin@example.com",
    "contraseña": "adminpassword"
}
response = requests.post(url, json=payload)
if response.status_code != 200:
    print(f"Login failed: {response.text}")
    exit(1)

token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Get initial item count
ic = len(requests.get("http://localhost:8000/api/items", headers=headers).json())

# Create piloto
p_resp = requests.post("http://localhost:8000/api/pilotos", headers=headers, json={"nombre": "P"})
pid = p_resp.json()["id"]

# Create motocicleta
m_payload = {
    "modelo": "M",
    "piloto_id": pid,
    "trabajos_reparacion": ["Cambio de bomba", "Ajuste electrico"],
    "servicio_ids": []
}
m_resp = requests.post("http://localhost:8000/api/motocicletas", headers=headers, json=m_payload)
mid = m_resp.json()["id"]

# Get final item count
fc = len(requests.get("http://localhost:8000/api/items", headers=headers).json())

# Get estados
e_resp = requests.get("http://localhost:8000/api/estados", headers=headers)
estados = e_resp.json()
names = [e["nombre"] for e in estados if e["motocicleta_id"] == mid]

print(f"IC: {ic}, FC: {fc}, Names: {names}")
if ic == fc and "Cambio de bomba" in names and "Ajuste electrico" in names:
    print("PASS")
else:
    print("FAIL")
