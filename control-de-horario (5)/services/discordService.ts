
import { CartItem, LocaleType, TimeLog, WEBHOOK_CONFIG } from '../types';

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('es-CL').format(Math.floor(amount));
};

export const DiscordService = {
  sendTimeLog: async (log: TimeLog) => {
    const webhookUrl = WEBHOOK_CONFIG[log.locale].TIME_LOG;

    if (!webhookUrl || !webhookUrl.startsWith('http')) {
        console.warn(`Discord Webhook URL not configured for ${log.locale} time log`);
        return;
    }

    // Colors: Green for Entrada, Yellow for Pausa, Red for Salida
    let color = 5763719; // Green
    if (log.type === 'pausa') color = 16776960; // Yellow
    if (log.type === 'salida') color = 15548997; // Red

    const emoji = log.type === 'entrada' ? '✅' : log.type === 'pausa' ? '⏸️' : '⛔';
    const title = log.type === 'entrada' ? 'Entrada Registrada' : log.type === 'pausa' ? 'Pausa Registrada' : 'Salida Registrada';
    const shopName = log.locale === 'yummy' ? '🍦 Yummy Ice Cream' : '☕ UwU Café';

    const payload = {
      username: "Control Horario",
      avatar_url: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", // Generic employee avatar
      embeds: [
        {
          title: `${emoji} ${title}`,
          color: color,
          fields: [
            { name: "👤 Empleado", value: log.username, inline: true },
            { name: "🕒 Hora", value: new Date(log.timestamp).toLocaleTimeString(), inline: true },
            { name: "📅 Fecha", value: new Date(log.timestamp).toLocaleDateString(), inline: true },
            { name: "🏪 Local", value: shopName, inline: false }
          ],
          footer: { text: "Sistema de Control de Horario" },
          timestamp: log.timestamp
        }
      ]
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Error sending to Discord", e);
    }
  },

  sendSaleLog: async (username: string, locale: LocaleType, items: CartItem[], total: number) => {
    const webhookUrl = WEBHOOK_CONFIG[locale].SALES_LOG;

    if (!webhookUrl || !webhookUrl.startsWith('http')) {
        console.warn(`Discord Webhook URL not configured for ${locale} sales`);
        return;
    }

    const itemsDesc = items.map(i => `${i.icon} ${i.name} (x${i.quantity})`).join('\n');
    const shopName = locale === 'yummy' ? '🍦 Yummy Ice Cream' : '☕ UwU Café';

    const payload = {
      username: "Caja Registradora",
      avatar_url: "https://cdn-icons-png.flaticon.com/512/1055/1055666.png", // Calculator icon
      embeds: [
        {
          title: "🧮 Venta Registrada",
          color: 6470386, // Blue/Pastel
          description: `Venta realizada en **${shopName}**`,
          fields: [
            { name: "👤 Usuario", value: username, inline: true },
            { name: "💰 Total", value: `$${formatMoney(total)}`, inline: true },
            { name: "🏪 Local", value: shopName, inline: true },
            { name: "🛒 Productos", value: itemsDesc || "Sin productos" }
          ],
          footer: { text: "Sistema de Ventas" },
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Error sending to Discord", e);
    }
  }
};
