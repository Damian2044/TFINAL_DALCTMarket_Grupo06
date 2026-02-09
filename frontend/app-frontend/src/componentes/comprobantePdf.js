import { obtenerParametrosServicio } from "@/servicios/serviciosParametrosSistema";

export function generarHtmlComprobante(comprobante, opciones = {}) {
  const parametros = comprobante?.parametros || [];
  const parametrosMap = parametros.reduce((acc, p) => {
    acc[p.claveParametro] = p.valorParametro;
    return acc;
  }, {});
  const venta = comprobante?.venta;
  const detalles = venta?.detalles || [];
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const logoFinal = opciones.logoDataUrl;
  const tipoImpresion = comprobante?.tipoImpresion === "a4" ? "a4" : "ticket";
  const porcentajeIva = Number(venta?.baseIVA || 0);

  const filasDetalles = detalles.map(d => `
    <tr>
      <td>${d.producto?.nombreProducto || ""}</td>
      <td class="center">${d.cantidadVendida ?? ""}</td>
      <td class="center">$${Number(d.precioUnitarioVendido || 0).toFixed(2)}</td>
      <td class="center">$${Number((d.subtotalProducto || 0) - (d.valorDescuentoProducto || 0)).toFixed(2)}</td>
    </tr>
  `).join("");

  return `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Comprobante Venta</title>
    <style>
      @page { size: ${tipoImpresion === "a4" ? "A4" : "80mm auto"}; margin: ${tipoImpresion === "a4" ? "12mm" : "0"}; }
      body { font-family: "Courier New", monospace; color: #111827; margin: 0; }
      .ticket { width: 80mm; margin: 0 auto; padding: 8px; }
      .a4 { width: 100%; max-width: 800px; margin: 24px auto; padding: 16px; }
      .logo { display: block; width: 120px; height: 120px; object-fit: contain; margin: 0 auto 8px; }
      h1 { text-align: center; font-size: 16px; margin: 0 0 6px; }
      .center { text-align: center; }
      .divider { border-top: 1px dashed #9ca3af; margin: 8px 0; }
      .linea { font-size: 12px; line-height: 1.2; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { padding: 4px; font-size: 11px; }
      th { border-bottom: 1px solid #e5e7eb; }
      .totales td { font-size: 12px; }
      .right { text-align: right; }
      @media print {
        @page { size: 80mm auto; margin: 0; }
        body { margin: 0; }
        .ticket { width: 80mm; }
        .a4 { width: 100%; max-width: 100%; }
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
      }
    </style>
  </head>
  <body>
    <div class="${tipoImpresion}">
      ${logoFinal ? `<img class="logo" src="${logoFinal}" alt="Logo" />` : ""}
      <h1>${parametrosMap.nombreNegocio || "Comprobante"}</h1>
      <div class="center linea">${parametrosMap.direccionNegocio || "-"}</div>
      <div class="center linea">${parametrosMap.telefonoNegocio || "-"}</div>
      <div class="center linea">${parametrosMap.correoNegocio || "-"}</div>
      <div class="divider"></div>
      <div class="linea">Venta: ${venta?.idVenta ?? "-"}</div>
      <div class="linea">Fecha: ${venta?.fechaVenta ? new Date(venta.fechaVenta).toLocaleString() : "-"}</div>
      <div class="linea">Metodo: ${venta?.metodoPago || "-"}</div>
      <div class="linea">Vendedor: ${venta?.usuario?.nombreCompleto || "-"}</div>
      <div class="linea">Cliente: ${venta?.cliente?.nombreCliente || "-"}</div>
      <div class="linea">Cedula: ${venta?.cliente?.cedulaCliente || "-"}</div>
      <div class="divider"></div>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th class="center">Cant</th>
            <th class="center">P.U.</th>
            <th class="center">Total</th>
          </tr>
        </thead>
        <tbody>
          ${filasDetalles}
        </tbody>
      </table>
      <table class="totales">
        <tbody>
          <tr>
            <td colspan="4" class="right">Subtotal:</td>
            <td class="right">$${Number(venta?.subtotalVenta || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="4" class="right">Descuento:</td>
            <td class="right">$${Number(venta?.totalDescuento || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="4" class="right">IVA (${Number(porcentajeIva || 0).toFixed(0)}%):</td>
            <td class="right">$${Number(venta?.totalIVA || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="4" class="right"><strong>Total:</strong></td>
            <td class="right"><strong>$${Number(venta?.totalPagar || 0).toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
      <div class="divider"></div>
      <div class="center linea">Gracias por su compra</div>
    </div>
  </body>
</html>
  `;
}

async function obtenerLogoDataUrl(logoUrl, logoFallbackUrl) {
  const convertirABase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  try {
    const resp = await fetch(logoUrl, { cache: "no-store" });
    if (!resp.ok) throw new Error("logo");
    const blob = await resp.blob();
    return await convertirABase64(blob);
  } catch {
    try {
      const respFallback = await fetch(logoFallbackUrl, { cache: "no-store" });
      if (!respFallback.ok) throw new Error("fallback");
      const blobFallback = await respFallback.blob();
      return await convertirABase64(blobFallback);
    } catch {
      return logoFallbackUrl;
    }
  }
}

export async function mostrarComprobantePdf(comprobante) {
  const payload = comprobante?.data && (comprobante.data?.parametros || comprobante.data?.venta)
    ? comprobante.data
    : comprobante;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const html = generarHtmlComprobante(payload);
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) return;
    win.focus();
    win.print();
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 500);
  };
  return iframe;
}
