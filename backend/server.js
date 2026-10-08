require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Connexion à PostgreSQL
const db = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Tester la connexion à PostgreSQL
db.query("SELECT NOW()")
    .then(() => {
        console.log("Connexion à PostgreSQL réussie !");
    })
    .catch((error) => {
        console.error("Erreur PostgreSQL :", error.message);
    });

// Route principale
app.get("/", (req, res) => {
    res.json({
        message: "Employee Management API fonctionne !"
    });
});

// ========================================
// 1. AFFICHER TOUS LES EMPLOYÉS
// GET /api/employees
// ========================================
app.get("/api/employees", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM employees ORDER BY id"
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Erreur de récupération :", error.message);

        res.status(500).json({
            error: "Erreur lors de la récupération des employés"
        });
    }
});

// ========================================
// 2. AJOUTER UN EMPLOYÉ
// POST /api/employees
// ========================================
app.post("/api/employees", async (req, res) => {
    try {
        const { name, email, department, position } = req.body;

        // Vérifier le nom et l'email
        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof email !== "string" ||
            !email.trim()
        ) {
            return res.status(400).json({
                error: "Le nom et l'email sont obligatoires"
            });
        }

        // Enregistrer l'employé dans PostgreSQL
        const result = await db.query(
            `INSERT INTO employees
                (name, email, department, position)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                name.trim(),
                email.trim(),
                typeof department === "string" && department.trim()
                    ? department.trim()
                    : null,
                typeof position === "string" && position.trim()
                    ? position.trim()
                    : null
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Erreur lors de l'ajout :", error.message);

        // Email déjà utilisé
        if (error.code === "23505") {
            return res.status(409).json({
                error: "Cette adresse email existe déjà"
            });
        }

        res.status(500).json({
            error: "Erreur lors de l'ajout de l'employé"
        });
    }
});

// ========================================
// 3. MODIFIER UN EMPLOYÉ
// PUT /api/employees/:id
// ========================================
app.put("/api/employees/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, email, department, position } = req.body;

        // Vérifier l'identifiant
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Identifiant invalide"
            });
        }

        // Vérifier le nom et l'email
        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof email !== "string" ||
            !email.trim()
        ) {
            return res.status(400).json({
                error: "Le nom et l'email sont obligatoires"
            });
        }

        // Modifier l'employé dans PostgreSQL
        const result = await db.query(
            `UPDATE employees
             SET name = $1,
                 email = $2,
                 department = $3,
                 position = $4
             WHERE id = $5
             RETURNING *`,
            [
                name.trim(),
                email.trim(),
                typeof department === "string" && department.trim()
                    ? department.trim()
                    : null,
                typeof position === "string" && position.trim()
                    ? position.trim()
                    : null,
                id
            ]
        );

        // Vérifier si l'employé existe
        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Employé introuvable"
            });
        }

        res.json({
            message: "Employé modifié avec succès",
            employee: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Erreur lors de la modification :",
            error.message
        );

        // Email déjà utilisé par un autre employé
        if (error.code === "23505") {
            return res.status(409).json({
                error: "Cette adresse email existe déjà"
            });
        }

        res.status(500).json({
            error: "Erreur lors de la modification de l'employé"
        });
    }
});

// ========================================
// 4. SUPPRIMER UN EMPLOYÉ
// DELETE /api/employees/:id
// ========================================
app.delete("/api/employees/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Vérifier l'identifiant
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Identifiant invalide"
            });
        }

        // Supprimer l'employé dans PostgreSQL
        const result = await db.query(
            `DELETE FROM employees
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        // Vérifier si l'employé existe
        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Employé introuvable"
            });
        }

        res.json({
            message: "Employé supprimé avec succès",
            employee: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Erreur lors de la suppression :",
            error.message
        );

        res.status(500).json({
            error: "Erreur lors de la suppression de l'employé"
        });
    }
});

// ========================================
// DÉMARRER LE SERVEUR
// ========================================
app.listen(PORT, () => {
    console.log(
        `Serveur démarré sur http://localhost:${PORT}`
    );
});