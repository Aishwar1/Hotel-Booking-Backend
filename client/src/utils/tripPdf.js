import { jsPDF } from "jspdf";

export const downloadTripPlanPDF = (plan, destination, recommendedRoom) => {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  const addLine = (text, size = 11, bold = false) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, 170);
    lines.forEach((line) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += size * 0.5 + 2;
    });
  };

  addLine("TravelWithAsh Trip Plan", 20, true);
  y += 4;
  addLine(plan.title || `${destination} Adventure`, 14, true);
  y += 2;
  addLine(plan.summary || "", 10);
  y += 4;

  if (recommendedRoom) {
    addLine("Recommended Stay", 12, true);
    addLine(
      `${recommendedRoom.hotel?.name} — ${recommendedRoom.roomType} (${recommendedRoom.hotel?.city})`,
      10
    );
    addLine(`$${recommendedRoom.pricePerNight}/night`, 10);
    y += 4;
  }

  if (plan.estimatedBudget) {
    addLine("Estimated Budget", 12, true);
    Object.entries(plan.estimatedBudget).forEach(([key, val]) => {
      addLine(`${key.charAt(0).toUpperCase() + key.slice(1)}: $${val}`, 10);
    });
    y += 4;
  }

  if (plan.days?.length) {
    addLine("Day-by-Day Itinerary", 12, true);
    plan.days.forEach((day) => {
      addLine(`Day ${day.day}: ${day.title}`, 11, true);
      if (day.morning) addLine(`Morning: ${day.morning}`, 10);
      if (day.afternoon) addLine(`Afternoon: ${day.afternoon}`, 10);
      if (day.evening) addLine(`Evening: ${day.evening}`, 10);
      if (day.meals) addLine(`Meals: ${day.meals}`, 10);
      if (day.tips) addLine(`Tip: ${day.tips}`, 10);
      y += 3;
    });
  }

  if (plan.packingList?.length) {
    addLine("Packing List", 12, true);
    plan.packingList.forEach((item) => addLine(`• ${item}`, 10));
  }

  doc.save(`TravelWithAsh-Trip-${destination.replace(/\s+/g, "-")}.pdf`);
};
