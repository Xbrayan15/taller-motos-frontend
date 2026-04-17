import jsPDF from 'jspdf';

const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const generateMotorcyclePDF = (moto) => {
  const {
    motocicleta_modelo,
    piloto_nombre,
    servicios,
    estadoGeneral,
  } = moto;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Encabezado
  doc.setFontSize(20);
  doc.setTextColor(31, 41, 55);
  doc.text('🏍️ Taller de Motos', margin, yPosition);
  yPosition += 12;

  // Línea separadora
  doc.setDrawColor(230, 126, 34);
  doc.setLineWidth(2);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Título del reporte
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text('Reporte de Servicio Completado', margin, yPosition);
  yPosition += 10;

  // Información de la motocicleta
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.setFont(undefined, 'bold');
  doc.text('Información de la Motocicleta', margin, yPosition);
  yPosition += 6;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const motoInfo = [
    ['Modelo:', motocicleta_modelo],
    ['Piloto:', piloto_nombre],
    ['Estado:', 'Terminado'],
    ['Fecha Finalización:', formatDate(estadoGeneral?.fecha_actualizacion || new Date())],
  ];

  motoInfo.forEach(([label, value]) => {
    doc.text(`${label} ${value}`, margin + 5, yPosition);
    yPosition += 5;
  });

  yPosition += 5;

  // Servicios realizados
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.setFont(undefined, 'bold');
  doc.text('Servicios y Trabajos Realizados', margin, yPosition);
  yPosition += 6;

  if (servicios && servicios.length > 0) {
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);

    servicios.forEach((servicio, index) => {
      const serviceText = `${index + 1}. ${servicio.item_nombre || 'Trabajo personalizado'}`;
      doc.text(serviceText, margin + 5, yPosition);
      yPosition += 4;
    });
  } else {
    doc.setFont(undefined, 'italic');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('No hay servicios registrados', margin + 5, yPosition);
    yPosition += 4;
  }

  yPosition += 6;

  // Resumen final
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.setFont(undefined, 'bold');
  doc.text('Resumen', margin, yPosition);
  yPosition += 4;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const summaryText = `Total de servicios realizados: ${servicios?.length || 0}`;
  doc.text(summaryText, margin + 5, yPosition);
  yPosition += 5;

  // Pie de página
  yPosition = pageHeight - 20;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 4;
  doc.text(`Generado: ${formatDate(new Date())}`, margin, yPosition);
  doc.text(`Página 1 de 1`, pageWidth - margin - 15, yPosition);

  // Guardar el PDF
  const fileName = `Reporte_${motocicleta_modelo.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(fileName);
};
