import React, { useState } from 'react';
import Modal from '../Layout/Modal'; // Assuming Modal is in Layout

const Wiki = ({ isOpen, onClose }) => {
    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (sectionId) => {
        setOpenSection(openSection === sectionId ? null : sectionId);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Wiki de la Aplicación">
            <div className="wiki-content">
                <h2>Bienvenido a la Wiki de SplitApp</h2>
                <p>Esta wiki te ayudará a entender las funcionalidades principales de la aplicación.</p>

                {/* Section 1: Autenticación y Amigos */}
                <div className="accordion-item">
                    <h3 className="accordion-header" onClick={() => toggleSection('auth')}>
                        1. Autenticación y Amigos
                        <span className="accordion-icon">{openSection === 'auth' ? '▲' : '▼'}</span>
                    </h3>
                    {openSection === 'auth' && (
                        <div className="accordion-content">
                            <p><strong>Login:</strong> Inicia sesión en tu cuenta para acceder a todas las funciones.</p>
                            <p><strong>Añadir Amigo por Enlace:</strong> Invita a tus amigos a unirse a tus grupos o a compartir gastos fácilmente a través de un enlace único.</p>
                        </div>
                    )}
                </div>

                {/* Section 2: Dashboard (Panel Principal) */}
                <div className="accordion-item">
                    <h3 className="accordion-header" onClick={() => toggleSection('dashboard')}>
                        2. Dashboard (Panel Principal)
                        <span className="accordion-icon">{openSection === 'dashboard' ? '▲' : '▼'}</span>
                    </h3>
                    {openSection === 'dashboard' && (
                        <div className="accordion-content">
                            <p>Tu panel principal donde puedes gestionar tus finanzas compartidas.</p>
                            <ul>
                                <li><strong>Balance:</strong> Visualiza el balance general de tus gastos e ingresos.</li>
                                <li><strong>Transacciones:</strong> Registra nuevas transacciones (gastos o ingresos) y visualiza un listado de todas ellas.</li>
                                <li><strong>Miembros:</strong> Gestiona los miembros de tus grupos y sus contribuciones.</li>
                                <li><strong>Transacciones Archivadas:</strong> Accede a un historial de transacciones que han sido archivadas.</li>
                                <li><strong>Exportar Reporte:</strong> Genera reportes de tus transacciones para un análisis más detallado.</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Section 3: Grupos */}
                <div className="accordion-item">
                    <h3 className="accordion-header" onClick={() => toggleSection('groups')}>
                        3. Grupos
                        <span className="accordion-icon">{openSection === 'groups' ? '▲' : '▼'}</span>
                    </h3>
                    {openSection === 'groups' && (
                        <div className="accordion-content">
                            <p>Organiza tus gastos y transacciones dentro de grupos específicos.</p>
                            <ul>
                                <li><strong>Lista de Grupos:</strong> Ve todos los grupos a los que perteneces.</li>
                                <li><strong>Crear/Editar Grupo:</strong> Crea nuevos grupos o modifica los existentes, añadiendo o quitando miembros.</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Section 4: Perfil */}
                <div className="accordion-item">
                    <h3 className="accordion-header" onClick={() => toggleSection('profile')}>
                        4. Perfil
                        <span className="accordion-icon">{openSection === 'profile' ? '▲' : '▼'}</span>
                    </h3>
                    {openSection === 'profile' && (
                        <div className="accordion-content">
                            <p>Gestiona tu información personal y tus conexiones.</p>
                            <ul>
                                <li><strong>Gestión de Amigos:</strong> Administra tu lista de amigos dentro de la aplicación.</li>
                                <li><strong>Mis Tarjetas:</strong> (Asumiendo funcionalidad de tarjetas, si existe) Gestiona tus métodos de pago o tarjetas asociadas.</li>
                                <li><strong>Información de Perfil:</strong> Visualiza y edita tu información de usuario.</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Section 5: Ajustes */}
                <div className="accordion-item">
                    <h3 className="accordion-header" onClick={() => toggleSection('settings')}>
                        5. Ajustes
                        <span className="accordion-icon">{openSection === 'settings' ? '▲' : '▼'}</span>
                    </h3>
                    {openSection === 'settings' && (
                        <div className="accordion-content">
                            <p>Personaliza tu experiencia en la aplicación.</p>
                            <ul>
                                <li><strong>Apariencia:</strong> Cambia el tema visual de la aplicación (Oscuro, Claro, Matrix).</li>
                                <li><strong>Información de la Aplicación:</strong> Detalles sobre el desarrollador, versión y marca registrada.</li>
                                <li><strong>Política de Privacidad:</strong> Accede a la política de privacidad de la aplicación.</li>
                                <li><strong>Eliminar Cuenta:</strong> Opción para eliminar permanentemente tu cuenta y todos tus datos (¡usar con precaución!).</li>
                            </ul>
                        </div>
                    )}
                </div>

                <p>Esta wiki se actualizará a medida que se añadan nuevas funcionalidades.</p>
            </div>
        </Modal>
    );
};

export default Wiki;