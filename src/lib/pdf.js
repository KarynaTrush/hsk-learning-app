export function downloadWeekPracticePdf(hanziList, title) {
  const list = (hanziList || []).slice(0, 12);
  const canvas = document.createElement("canvas");
  const cols = 3;
  const rows = Math.max(2, Math.ceil(list.length / cols));
  const cell = 260;
  const pad = 36;
  canvas.width = pad * 2 + cols * cell;
  canvas.height = pad * 2 + 48 + rows * cell;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FEFCF5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1A1A1A";
  ctx.font = "700 22px Inter, sans-serif";
  ctx.fillText(title || "XINNA", pad, pad + 8);

  list.forEach((hanzi, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = pad + c * cell;
    const y = pad + 36 + r * cell;
    const s = 220;
    ctx.strokeStyle = "#C83E34";
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(x, y, s, s);
    ctx.beginPath();
    ctx.moveTo(x + s / 2, y);
    ctx.lineTo(x + s / 2, y + s);
    ctx.moveTo(x, y + s / 2);
    ctx.lineTo(x + s, y + s / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(26,26,26,0.88)";
    ctx.font = `700 ${hanzi.length > 1 ? 72 : 110}px "Noto Serif SC", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(hanzi, x + s / 2, y + s / 2 + 4);
  });

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "xinna-practice.png";
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
