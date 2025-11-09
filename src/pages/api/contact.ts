import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Leer el body de manera más segura
    const contentType = request.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      const text = await request.text();
      if (!text) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'No se recibieron datos.' 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      data = JSON.parse(text);
    } else {
      const formData = await request.formData();
      data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message')
      };
    }

    const { name, email, phone, message } = data;

    // Validar datos
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Por favor completa todos los campos requeridos.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar que las credenciales estén configuradas
    const emailPassword = import.meta.env.EMAIL_PASSWORD;
    
    console.log('EMAIL_PASSWORD está configurado:', !!emailPassword);
    console.log('Longitud de contraseña:', emailPassword?.length || 0);
    
    if (!emailPassword || emailPassword === 'TU_CONTRASEÑA_AQUI') {
      console.error('EMAIL_PASSWORD no está configurado en .env');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Error de configuración del servidor. Contacta al administrador.' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Configurar el transporter de nodemailer con Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'jfelipe.9121@gmail.com',
        pass: emailPassword,
      },
    });

    // Configurar el contenido del email
    const mailOptions = {
      from: '"OBMAIN Ingeniería - Contacto Web" <jfelipe.9121@gmail.com>',
      to: 'jfelipe.9121@gmail.com',
      replyTo: email,
      subject: `Nuevo mensaje desde OBMAIN - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #98060c; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #98060c; }
            .value { margin-top: 5px; padding: 10px; background-color: white; border-left: 3px solid #f0b000; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nuevo Mensaje de Contacto</h1>
              <p>OBMAIN Ingeniería</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">👤 Nombre:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">📧 Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              ${phone ? `
              <div class="field">
                <div class="label">📱 Teléfono:</div>
                <div class="value">${phone}</div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">💬 Mensaje:</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <p>Este mensaje fue enviado desde el formulario de contacto de obmain.co</p>
              <p>Fecha: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Nuevo mensaje de contacto - OBMAIN Ingeniería

Nombre: ${name}
Email: ${email}
${phone ? `Teléfono: ${phone}` : ''}

Mensaje:
${message}

---
Enviado desde obmain.co
Fecha: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}
      `,
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: '¡Mensaje enviado con éxito! Te contactaremos pronto.' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error al enviar email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error al enviar el mensaje. Por favor intenta nuevamente.' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
