/**
 * Formatea un número de teléfono al formato correcto de WhatsApp
 * @param {string} number - Número de teléfono a formatear
 * @returns {string} - Número formateado
 */
export const phoneNumberFormatter = (number) => {
    // Eliminar todos los caracteres no numéricos
    let formatted = number.replace(/\D/g, "");

    // Si el número comienza con 0, quitarlo (formato local)
    if (formatted.startsWith("0")) {
        formatted = formatted.substring(1);
    }

    // Si el número no tiene el formato @c.us o @g.us, añadir @c.us
    if (!formatted.includes("@")) {
        formatted = `${formatted}@c.us`;
    }

    return formatted;
};

/**
 * Formatea un JID de grupo
 * @param {string} groupId - ID del grupo
 * @returns {string} - JID formateado para grupos
 */
export const groupJidFormatter = (groupId) => {
    let formatted = groupId.replace(/\D/g, "");
    
    if (!formatted.includes("@")) {
        formatted = `${formatted}@g.us`;
    }

    return formatted;
};
