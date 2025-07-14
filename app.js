// app.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Aplicación CrudNote cargada.");
    renderRoute(); // Función para renderizar la ruta inicial
    applyThemePreference(); // Aplica el tema guardado en LocalStorage
});

// Función para manejar el routing de la SPA
// Esto es el corazón de nuestra SPA: cambia el contenido sin recargar la página
const appDiv = document.getElementById('app');

const routes = {
    '/': 'landing',
    '/login': 'login',
    '/register': 'register',
    '/home': 'home', // Vista principal del usuario logueado
    '/profile': 'profile', // Vista del perfil de usuario
    // Más rutas según las funcionalidades
};

async function renderRoute() {
    const path = window.location.pathname; // Obtiene la ruta actual (ej. '/', '/login')
    const viewName = routes[path];

    if (!viewName) {
        // Si la ruta no existe, redirigimos a la landing o a un 404
        window.history.pushState({}, '', '/');
        renderRoute(); // Intentamos renderizar la landing
        return;
    }

    // Protección de rutas: Si la vista requiere autenticación y el usuario no está logueado
    const authRequiredViews = ['home', 'profile']; // Añade aquí las vistas que necesitan login
    const user = getUserFromSessionStorage(); // Obtiene el usuario de SessionStorage
    
    if (authRequiredViews.includes(viewName) && !user) {
        console.log("Acceso no autorizado a vista protegida. Redirigiendo a login.");
        window.history.pushState({}, '', '/login'); // Redirige al login
        renderRoute();
        return;
    }

    // Cargar y renderizar la plantilla HTML correspondiente
    try {
        const response = await fetch(`./views/${viewName}.html`); // Asumimos que las vistas están en una carpeta 'views'
        if (!response.ok) {
            throw new Error(`No se pudo cargar la vista: ${viewName}`);
        }
        const html = await response.text();
        appDiv.innerHTML = html; // Inyecta el HTML en el div #app
        console.log(`Vista "${viewName}" cargada.`);

        // Después de cargar el HTML, podemos ejecutar funciones específicas para esa vista
        // Esto es un patrón común en SPAs
        if (viewName === 'login') {
            setupLoginForm(); // Función para manejar el formulario de login
        } else if (viewName === 'register') {
            setupRegisterForm(); // Función para manejar el formulario de registro
        } else if (viewName === 'home') {
            loadUserNotes(); // Cargar notas del usuario
            setupNewNoteButton(); // Configurar botón de nueva nota
            setupThemeToggle(); // Configurar el toggle de tema
        }
        // ... otras llamadas a funciones para otras vistas
        
        // Configurar el tema nuevamente por si la vista ha sido inyectada después
        applyThemePreference();

    } catch (error) {
        console.error("Error al cargar la ruta:", error);
        appDiv.innerHTML = `<h1 class="text-center text-danger mt-5">Error al cargar la página.</h1>`;
    }
}

// Manejar los cambios en el historial del navegador (botón atrás/adelante)
window.addEventListener('popstate', renderRoute);

// Función auxiliar para obtener el usuario de SessionStorage
function getUserFromSessionStorage() {
    try {
        const user = sessionStorage.getItem('loggedInUser');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Error al parsear usuario de SessionStorage:", error);
        return null;
    }
}

// Función auxiliar para guardar el usuario en SessionStorage
function saveUserToSessionStorage(user) {
    sessionStorage.setItem('loggedInUser', JSON.stringify(user));
}

// Función auxiliar para limpiar SessionStorage (cerrar sesión)
function clearSessionStorage() {
    sessionStorage.removeItem('loggedInUser');
    // También limpiamos LocalStorage si es relevante, por ejemplo, el tema
    // localStorage.removeItem('themePreference'); 
}

// Función para aplicar la preferencia de tema guardada en LocalStorage
function applyThemePreference() {
    const theme = localStorage.getItem('themePreference');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Función para alternar el tema (se llamará desde el botón en Home/Perfil)
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('themePreference', isDark ? 'dark' : 'light');
    console.log(`Tema cambiado a: ${isDark ? 'oscuro' : 'claro'}`);
}


// Contenido de ejemplo para views/landing.html
function getLandingHtml() {
    return `
        <header class="bg-light py-3 border-bottom">
            <div class="container d-flex justify-content-between align-items-center">
                <a class="navbar-brand" href="/">CrudNote</a>
                <div>
                    <a href="/login" class="btn btn-outline-primary me-2 nav-link-spa" data-path="/login">Sign In</a>
                    <a href="/register" class="btn btn-primary nav-link-spa" data-path="/register">Register</a>
                </div>
            </div>
        </header>
        <main class="container my-5 text-center">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <img src="https://via.placeholder.com/400" alt="Placeholder image" class="img-fluid rounded">
                </div>
                <div class="col-md-6 text-md-start">
                    <h1 class="display-4">Colabora en notas con tu equipo</h1>
                    <p class="lead">CrudNote es una aplicación colaborativa de toma de notas que te permite crear, editar y compartir notas con tu equipo. Regístrate hoy para empezar.</p>
                    <a href="/login" class="btn btn-primary btn-lg me-2 nav-link-spa" data-path="/login">Sign In</a>
                    <a href="/register" class="btn btn-outline-secondary btn-lg nav-link-spa" data-path="/register">Register</a>
                </div>
            </div>

            <h2 class="mt-5 mb-4">¿Qué es CrudNote?</h2>
            <div class="row">
                <div class="col-md-4 mb-3">
                    <div class="card h-100 p-4">
                        <i class="fas fa-file-alt fa-3x mb-3 text-primary"></i>
                        <h5>Crear</h5>
                        <p>Crea notas con edición de texto enriquecido, imágenes y más.</p>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100 p-4">
                        <i class="fas fa-users fa-3x mb-3 text-primary"></i>
                        <h5>Colaborar</h5>
                        <p>Colabora con tu equipo en tiempo real.</p>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card h-100 p-4">
                        <i class="fas fa-share-alt fa-3x mb-3 text-primary"></i>
                        <h5>Compartir</h5>
                        <p>Comparte tus notas con tu equipo o el mundo.</p>
                    </div>
                </div>
            </div>
        </main>
        <footer class="bg-light text-center py-3 border-top">
            <div class="container">
                <p>&copy; 2024 CrudNote. Todos los derechos reservados.</p>
            </div>
        </footer>
    `;
}

// Para hacer que los enlaces dentro de las vistas cargadas funcionen como SPA
document.addEventListener('click', (e) => {
    // Intercepta clics en enlaces con la clase 'nav-link-spa'
    const target = e.target.closest('.nav-link-spa');
    if (target) {
        e.preventDefault(); // Evita la recarga completa
        const path = target.getAttribute('data-path');
        if (path) {
            window.history.pushState({}, '', path); // Cambia la URL sin recargar
            renderRoute(); // Renderiza la nueva vista
        }
    }
});

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailOrUsername = document.getElementById('loginEmailOrUsername').value;
            const password = document.getElementById('loginPassword').value;

            // Lógica de autenticación con json-server
            try {
                const response = await fetch('http://localhost:3000/users');
                const users = await response.json();
                
                const user = users.find(u => 
                    (u.email === emailOrUsername || u.username === emailOrUsername) && 
                    u.password === password
                );

                if (user) {
                    saveUserToSessionStorage(user); // Guardar sesión
                    alert('¡Inicio de sesión exitoso!');
                    window.history.pushState({}, '', '/home'); // Redirigir a Home
                    renderRoute();
                } else {
                    alert('Credenciales incorrectas. Inténtalo de nuevo.');
                }
            } catch (error) {
                console.error("Error en el login:", error);
                alert('Hubo un error al intentar iniciar sesión.');
            }
        });
    }
}

function setupRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Validación de campos
            if (!fullName || !email || !username || !password) {
                alert('Todos los campos son obligatorios.');
                return;
            }

            // Lógica de registro con json-server
            try {
                // 1. Validar si el correo o usuario ya existen
                const existingUsersResponse = await fetch('http://localhost:3000/users?_limit=1'); // Solo un límite para validar existencia
                const existingUsers = await existingUsersResponse.json();

                const emailExists = existingUsers.some(u => u.email === email);
                const usernameExists = existingUsers.some(u => u.username === username);

                if (emailExists) {
                    alert('Este correo electrónico ya está registrado.');
                    return;
                }
                if (usernameExists) {
                    alert('Este nombre de usuario ya está en uso.');
                    return;
                }

                // 2. Registrar nuevo usuario
                const newUser = {
                    fullName,
                    email,
                    username,
                    password, // En un sistema real, la contraseña se hashearía
                    registrationDate: new Date().toISOString()
                };

                const response = await fetch('http://localhost:3000/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                });

                if (response.ok) {
                    alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
                    window.history.pushState({}, '', '/home'); // Redirigir a home
                    renderRoute();
                } else {
                    alert('Error al registrar usuario.');
                }
            } catch (error) {
                console.error("Error en el registro:", error);
                alert('Hubo un error al intentar registrarse.');
            }
        });
    }
}

function loadUserNotes() {
    const user = getUserFromSessionStorage();
    if (user) {
        document.getElementById('userName').textContent = user.fullName || user.username;
        document.getElementById('welcomeMessage').textContent = `Bienvenido, ${user.fullName || user.username}!`;

        // Lógica para cargar notas personales y compartidas
        // (Esto se desarrollará en futuras etapas)
        // Por ahora, solo mostramos el nombre del usuario
    } else {
        // Esto no debería pasar si la protección de ruta funciona, pero es una salvaguarda
        window.history.pushState({}, '', '/login');
        renderRoute();
    }

    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearSessionStorage();
            alert('Has cerrado sesión.');
            window.history.pushState({}, '', '/login'); // O a la landing page
            renderRoute();
        });
    }
    
    // Configurar el botón de cambio de tema
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
        // Actualizar icono según el tema actual al cargar
        applyThemeIcon(themeToggleBtn);
    }
}

function applyThemeIcon(button) {
    if (document.body.classList.contains('dark-theme')) {
        button.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        button.innerHTML = '<i class="fas fa-sun"></i>';
    }
}
document.body.addEventListener('themeChanged', () => {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        applyThemeIcon(themeToggleBtn);
    }
});


// Placeholder para otras funciones
function setupNewNoteButton() {
    const newNoteBtn = document.getElementById('newNoteBtn');
    if (newNoteBtn) {
        newNoteBtn.addEventListener('click', () => {
            alert('Funcionalidad de crear nueva nota (próximamente).');
            // Aquí iría la lógica para abrir un modal o redirigir a una página de creación
        });
    }
}

function setupThemeToggle() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
        // Asegurarse de que el icono del tema se actualice al cargar la vista
        applyThemeIcon(themeToggleBtn);

        // Esto es para que el icono se actualice si el tema cambia desde otro lado (aunque no lo tenemos aún)
        document.body.addEventListener('themeChanged', () => {
            applyThemeIcon(themeToggleBtn);
        });
    }
}

// Asegúrate de que applyThemeIcon también esté definida si no lo está (te la di en una respuesta anterior)
function applyThemeIcon(button) {
    if (document.body.classList.contains('dark-theme')) {
        button.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        button.innerHTML = '<i class="fas fa-sun"></i>';
    }
}


try {
    // Código que puede lanzar un error
} catch (error) {
    console.error("Error:", error);
}