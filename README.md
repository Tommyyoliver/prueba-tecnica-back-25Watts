# 🛠️ Backend - Gestión de Cupones

Este es el backend de la aplicación de **Gestión de Cupones**, desarrollado en **Node.js con Express** y conectado a una base de datos **MySQL**.  
Se encarga de exponer una API RESTful para gestionar cupones.

---

## 🚀 Funcionalidades
- **Obtener cupones** con paginación.
- **Crear cupones** (con descripción, valor y fecha de expiración).
- **Editar cupones** (se puede modificar descripción, valor y fecha de expiración).
- **Eliminar cupones**.
- Validación automática:
  - Si la fecha de expiración ya pasó:
    - `expired` se marca en `true`.
    - `active` se cambia a `false`.

---

## ⚙️ Tecnologías utilizadas
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)

---

## 📦 Instalación y ejecución

```bash
git clone https://github.com/tu-usuario/backend-coupons.git
cd backend-coupons
npm install
```

## 📦 Configurar variables de entorno
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tuPassword
DB_NAME=coupons_db
DB_PORT=3306
PORT=3000
```

## 📦 Crear tabla en MySQL
```bash
CREATE TABLE coupon (
    id INT PRIMARY KEY AUTO_INCREMENT,
    description VARCHAR(255),
    value INT NOT NULL,
    expiration_date VARCHAR(255),
    active BOOLEAN DEFAULT true,
    expired BOOLEAN DEFAULT false
);
```

## 📦 Ejecutar servidor

```bash
npm start
```


🔗 Endpoints disponibles

GET /api/coupons?page=1&limit=10 → Listar cupones con paginación.

POST /api/coupons → Crear cupón.

PUT /api/coupons/:id → Editar cupón.

DELETE /api/coupons/:id → Eliminar cupón.
