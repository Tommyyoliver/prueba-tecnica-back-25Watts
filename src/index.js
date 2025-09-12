import express from 'express';
import cors from 'cors';
import { pool } from './db.js'

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

function parseDateToLocal(expiration_date) {
  if (!expiration_date && expiration_date !== 0) return null;
  const s = String(expiration_date).trim();

  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // yyyy-mm-ddTHH...
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const [ymd] = s.split('T');
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // dd/MM/yyyy
  const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const m1 = s.match(ddmmyyyy);
  if (m1) {
    const d = Number(m1[1]), mth = Number(m1[2]), y = Number(m1[3]);
    return new Date(y, mth - 1, d);
  }

  // dd-mm-yyyy o dd.mm.yyyy
  const ddmmyyyyAlt = /^(\d{1,2})[-.](\d{1,2})[-.](\d{4})$/;
  const m2 = s.match(ddmmyyyyAlt);
  if (m2) {
    const d = Number(m2[1]), mth = Number(m2[2]), y = Number(m2[3]);
    return new Date(y, mth - 1, d);
  }

  // fallback
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }
  return null;
}

function checkExpired(expiration_date) {
  const exp = parseDateToLocal(expiration_date);
  if (!exp) return false;
  const hoy = new Date();
  const hoyDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  // exp es una fecha con horas 00:00 local (por construcción)
  return exp.getTime() < hoyDate.getTime(); // solo expire si la fecha es anterior al día actual
}

// GET COUPONS (con actualización automática de expirados)
app.get('/coupons', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM coupon`);

    for (const c of rows) {
      const expiredNow = checkExpired(c.expiration_date);
      const shouldBeActive = expiredNow ? 0 : c.active;

      // Solo actualizar si hay diferencia
      if (c.expired !== expiredNow || (expiredNow && c.active)) {
        await pool.query(
          "UPDATE coupon SET expired = ?, active = ? WHERE id = ?",
          [expiredNow, shouldBeActive, c.id]
        );
        c.expired = expiredNow ? 1 : 0;
        c.active = shouldBeActive;
      }
    }

    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error to get coupons" });
  }
});

// CREATE NEW COUPON
app.post('/create-coupon', async (req, res) => {
    try {
        const { description, value, expiration_date, active } = req.body;

        if (!description || !value || !expiration_date || active == null) {
            return res.status(400).json({ error: "data missing" });
        }

        // 👇 Calcular estado automático
        const id = crypto.randomUUID();
        const expired = checkExpired(expiration_date);
        const finalActive = expired ? false : active;

        const [result] = await pool.query(
            "INSERT INTO coupon (id, description, value, expiration_date, expired, active) VALUES (?,?,?,?,?,?)",
            [id, description, value, expiration_date, expired, finalActive]
        );

        res.json({
            success: true,
            insertId: result.insertId
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error to make coupon" });
    }
});

// EDIT COUPON
app.put("/edit-coupon/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { description, value, expiration_date, active } = req.body;

        if (!description || !value || !expiration_date || active == null) {
            return res.status(400).json({ error: "data missing" });
        }

        // 👇 Calcular estado automático
        const expired = checkExpired(expiration_date);
        const finalActive = expired ? false : active;

        const [result] = await pool.query(
            `UPDATE coupon 
            SET description = ?, value = ?, expiration_date = ?, expired = ?, active = ? 
            WHERE id = ?`,
            [description, value, expiration_date, expired, finalActive, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cupón no encontrado" });
        }

        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error to edit coupon" });
    }
});

// DELETE COUPON
app.delete("/delete-coupon/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query("DELETE FROM coupon WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Coupon not found" });
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error to delete coupon" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

