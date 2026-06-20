// La URL donde va a estar corriendo tu backend de Python más adelante
const API_URL = 'http://localhost:5000/api'; 

export const obtenerMedicamentos = async () => {
  try {
    const response = await fetch(`${API_URL}/medicamentos`);
    if (!response.ok) {
      throw new Error('Error al traer los datos del servidor');
    }
    return await response.json();
  } catch (error) {
    console.error("Error en el servicio de medicamentos:", error);
    return [];
  }
};