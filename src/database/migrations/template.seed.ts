import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { TemplatesService } from '../../modules/templates/templates.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const templatesService = app.get(TemplatesService);

  // 1. Seed Types
  const types = await templatesService.findAllTypes();
  if (types.length === 0) {
    await templatesService.createType({ code: 'INVOICE', name: 'Factura de Venta' });
    console.log('Seeded template types');
  }

  // 2. Seed Variables
  const variables = await templatesService.findAllVariables();
  if (variables.length === 0) {
    const vars = [
      { tag: 'invoice.number', name: 'Número de Factura', category: 'INVOICE', description: 'El identificador único de la factura' },
      { tag: 'invoice.total', name: 'Total Factura', category: 'INVOICE', description: 'Valor total a pagar' },
      { tag: 'client.name', name: 'Nombre Cliente', category: 'CLIENT', description: 'Nombre completo o razón social' },
      { tag: 'client.document', name: 'Documento Cliente', category: 'CLIENT', description: 'NIT o Cédula' },
      { tag: 'vehicle.plate', name: 'Placa Vehículo', category: 'VEHICLE', description: 'Placa del vehículo inspeccionado' },
      { tag: 'date.full', name: 'Fecha Completa', category: 'DATE', description: 'Fecha y hora en formato largo' },
      { tag: 'date.day', name: 'Día', category: 'DATE', description: 'Día del mes (01-31)' },
      { tag: 'date.month', name: 'Mes', category: 'DATE', description: 'Mes del año (01-12)' },
      { tag: 'date.year', name: 'Año', category: 'DATE', description: 'Año en 4 dígitos' },
    ];
    for (const v of vars) {
      await templatesService.createVariable(v);
    }
    console.log('Seeded template variables');
  }

  // 3. Seed Default Template
  const current = await templatesService.findAll('INVOICE');
  if (current.length > 0) {
    console.log('Templates already seeded');
    await app.close();
    return;
  }

  const defaultInvoiceBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; }
    .invoice-info { display: flex; justify-content: space-between; margin-top: 30px; }
    .details { margin-top: 40px; width: 100%; border-collapse: collapse; }
    .details th, .details td { border: 1px solid #eee; padding: 12px; text-align: left; }
    .details th { background: #f9f9f9; }
    .totals { margin-top: 30px; text-align: right; }
    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>FACTURA DE VENTA</h1>
    <p>No. {{invoice.number}}</p>
  </div>

  <div class="invoice-info">
    <div>
      <h3>Cliente</h3>
      <p><strong>Nombre:</strong> {{client.name}}</p>
      <p><strong>Documento:</strong> {{client.document}}</p>
    </div>
    <div>
      <h3>Fecha</h3>
      <p>{{date.day}}/{{date.month}}/{{date.year}}</p>
    </div>
  </div>

  <table class="details">
    <thead>
      <tr>
        <th>Descripción</th>
        <th>Cantidad</th>
        <th>Precio Unit.</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each invoice.items}}
      <tr>
        <td>{{description}}</td>
        <td>{{quantity}}</td>
        <td>$ {{unitPrice}}</td>
        <td>$ {{total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="totals">
    <p><strong>Subtotal:</strong> $ {{invoice.subtotal}}</p>
    <p><strong>IVA (0%):</strong> $ {{invoice.tax}}</p>
    <p><strong>TOTAL:</strong> $ {{invoice.total}}</p>
  </div>

  <div class="footer">
    <p>Gracias por su confianza. Centro de Diagnóstico Automotor (CDA).</p>
  </div>
</body>
</html>
  `.trim();

  await templatesService.create({
    name: 'Plantilla Estándar CDA',
    typeCode: 'INVOICE',
    body: defaultInvoiceBody,
    isActive: true,
  });

  console.log('Default invoice template seeded');
  await app.close();
}

void bootstrap();
