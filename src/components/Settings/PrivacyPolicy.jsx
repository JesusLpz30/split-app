import React from 'react';
import Modal from '../Layout/Modal'; // Assuming Modal is in Layout

const PrivacyPolicy = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Política de Privacidad">
            <div className="privacy-policy-content">
                <h2>Política de Privacidad de SplitApp</h2>
                <p>Fecha de última actualización: 15 de Agosto de 2025</p>

                <p>En SplitApp, nos comprometemos a proteger tu privacidad. Esta Política de Privacidad describe cómo recopilamos, usamos y compartimos tu información cuando utilizas nuestra aplicación.</p>

                <h3>1. Información que Recopilamos</h3>
                <p>Recopilamos información que nos proporcionas directamente, como tu nombre de usuario, dirección de correo electrónico y cualquier dato que ingreses al usar la aplicación (por ejemplo, transacciones, grupos, nombres de miembros).</p>
                <p>También podemos recopilar automáticamente cierta información cuando accedes y utilizas la aplicación, como datos de uso y diagnóstico.</p>

                <h3>2. Cómo Usamos tu Información</h3>
                <p>Utilizamos la información recopilada para:</p>
                <ul>
                    <li>Proveer, operar y mantener nuestra aplicación.</li>
                    <li>Mejorar, personalizar y expandir nuestra aplicación.</li>
                    <li>Entender y analizar cómo utilizas nuestra aplicación.</li>
                    <li>Desarrollar nuevos productos, servicios, características y funcionalidades.</li>
                    <li>Comunicarnos contigo, directamente o a través de uno de nuestros socios, incluyendo para servicio al cliente, para proporcionarte actualizaciones y otra información relacionada con la aplicación, y para fines de marketing y promoción.</li>
                    <li>Procesar tus transacciones y gestionar tus grupos.</li>
                </ul>

                <h3>3. Compartir tu Información</h3>
                <p>No compartimos tu información personal con terceros, excepto en las siguientes circunstancias:</p>
                <ul>
                    <li>Con tu consentimiento.</li>
                    <li>Para cumplir con una obligación legal.</li>
                    <li>Para proteger y defender los derechos o la propiedad de SplitApp.</li>
                    <li>Con proveedores de servicios que nos ayudan a operar la aplicación (por ejemplo, servicios de alojamiento, análisis de datos), quienes están obligados a mantener la confidencialidad de tu información.</li>
                </ul>

                <h3>4. Seguridad de los Datos</h3>
                <p>Implementamos medidas de seguridad razonables para proteger la información que recopilamos y mantenemos. Sin embargo, ninguna transmisión por Internet o método de almacenamiento electrónico es 100% seguro.</p>

                <h3>5. Tus Derechos de Privacidad</h3>
                <p>Tienes derecho a acceder, corregir o eliminar tu información personal. Si deseas ejercer estos derechos, por favor contáctanos a través de [correo electrónico de contacto o sección de soporte en la app].</p>

                <h3>6. Cambios a Esta Política de Privacidad</h3>
                <p>Podemos actualizar nuestra Política de Privacidad de vez en cuando. Te notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página. Se te aconseja revisar esta Política de Privacidad periódicamente para cualquier cambio.</p>

                <h3>7. Contacto</h3>
                <p>Si tienes alguna pregunta sobre esta Política de Privacidad, por favor contáctanos en <a href="mailto:info@consultorsk.com">info@consultorsk.com</a>.</p>
            </div>
        </Modal>
    );
};

export default PrivacyPolicy;